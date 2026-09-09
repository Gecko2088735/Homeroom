'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchAllClassroomData, isConfigured, mapCourseWorkDue } from './classroom';
import { useStore } from './store';

const AUTO_SYNC_INTERVAL_MS = 10 * 60 * 1000;
const AUTO_SYNC_COOLDOWN_MS = 60 * 1000;

const ClassroomSyncContext = createContext(null);

// Mounted once at the layout root (like FocusProvider) so the 10-minute timer survives client-side
// navigation and every page shares one sync status. Automatic triggers (the timer, a Homeroom logo
// click, moving between pages) run silently — they reuse an already-connected session's token but
// never prompt for sign-in themselves; only the explicit Settings button does that.
export function ClassroomSyncProvider({ children }) {
    const store = useStore();
    const [status, setStatus] = useState({ state: 'idle' });
    const syncingRef = useRef(false);
    const lastAutoSyncRef = useRef(0);

    const performSync = useCallback(
        async ({ interactive = false } = {}) => {
            if (!isConfigured() || syncingRef.current) return;
            if (!interactive && Date.now() - lastAutoSyncRef.current < AUTO_SYNC_COOLDOWN_MS) return;

            syncingRef.current = true;
            if (interactive) setStatus({ state: 'syncing' });
            try {
                const result = await fetchAllClassroomData({ silent: !interactive });
                if (!result) return; // silent + not connected right now — nothing attempted, cooldown not consumed

                // Only a real attempt (this line) should start the cooldown — not the "nothing to
                // do" case above, or the very first background sync after connecting would find
                // the cooldown already primed by earlier no-op checks and get skipped.
                if (!interactive) lastAutoSyncRef.current = Date.now();

                const { courses, courseworkByCourse, submissionsByCourse, announcementsByCourse } = result;

                let skippedUndated = 0;
                const mappedByCourse = {};
                for (const [courseId, items] of Object.entries(courseworkByCourse)) {
                    const submissionByCourseWork = new Map(
                        (submissionsByCourse[courseId] ?? []).map((s) => [s.courseWorkId, s])
                    );
                    mappedByCourse[courseId] = [];
                    for (const item of items) {
                        const due = mapCourseWorkDue(item);
                        if (!due) {
                            skippedUndated += 1;
                            continue;
                        }
                        const submission = submissionByCourseWork.get(item.id);
                        const maxPoints = typeof item.maxPoints === 'number' ? item.maxPoints : null;
                        const assignedGrade =
                            typeof submission?.assignedGrade === 'number' ? submission.assignedGrade : null;
                        mappedByCourse[courseId].push({
                            id: item.id,
                            title: item.title ?? 'Untitled assignment',
                            notes: item.description ?? '',
                            alternateLink: item.alternateLink ?? null,
                            maxPoints,
                            gradeCategoryId: item.gradeCategory?.id ?? null,
                            late: submission?.late === true,
                            grade:
                                assignedGrade !== null && maxPoints ? { earned: assignedGrade, possible: maxPoints } : null,
                            ...due
                        });
                    }
                }

                const mappedAnnouncementsByCourse = {};
                for (const [courseId, items] of Object.entries(announcementsByCourse)) {
                    mappedAnnouncementsByCourse[courseId] = items
                        .filter((a) => a.state === 'PUBLISHED')
                        .map((a) => ({
                            id: a.id,
                            text: a.text ?? '',
                            alternateLink: a.alternateLink ?? null,
                            creationTime: a.creationTime ?? null
                        }));
                }

                const counts = store.importFromClassroom({
                    courses,
                    courseworkByCourse: mappedByCourse,
                    announcementsByCourse: mappedAnnouncementsByCourse
                });
                if (interactive) setStatus({ state: 'done', counts: { ...counts, skippedUndated } });
            } catch (error) {
                // A background sync failing is swallowed on purpose — it shouldn't interrupt
                // whatever the user's actually doing. Only the explicit button reports errors.
                if (!interactive) lastAutoSyncRef.current = Date.now();
                if (interactive) setStatus({ state: 'error', message: error.message });
            } finally {
                syncingRef.current = false;
            }
        },
        [store]
    );

    // performSync's identity changes whenever `store` does (StoreProvider hands out a fresh value
    // object each render). Routing every call through this ref means the timer/consumers below can
    // depend on a syncNow with a genuinely stable identity, always reaching the latest store.
    const performSyncRef = useRef(performSync);
    useEffect(() => {
        performSyncRef.current = performSync;
    }, [performSync]);

    const syncNow = useCallback((opts) => performSyncRef.current(opts), []);

    useEffect(() => {
        if (!isConfigured()) return;
        const id = setInterval(() => syncNow({ interactive: false }), AUTO_SYNC_INTERVAL_MS);
        return () => clearInterval(id);
    }, [syncNow]);

    const value = { status, syncNow };

    return <ClassroomSyncContext.Provider value={value}>{children}</ClassroomSyncContext.Provider>;
}

export function useClassroomSync() {
    const ctx = useContext(ClassroomSyncContext);
    if (!ctx) throw new Error('useClassroomSync must be used inside <ClassroomSyncProvider>');
    return ctx;
}
