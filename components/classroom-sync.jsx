'use client';

import { useState } from 'react';
import { Alert } from './alert';
import { fetchAllClassroomData, isConfigured, mapCourseWorkDue } from 'lib/classroom';
import { useStore } from 'lib/store';

export function ClassroomSync() {
    const store = useStore();
    const [status, setStatus] = useState({ state: 'idle' });

    if (!isConfigured()) {
        return (
            <div className="flex flex-col gap-3 text-sm">
                <p className="text-muted">
                    Google Classroom sync is not set up yet. It needs a free Google OAuth client ID — a one-time step
                    for whoever runs this app; after that, syncing is a single click:
                </p>
                <ol className="flex flex-col gap-1.5 pl-5 list-decimal text-muted">
                    <li>
                        In{' '}
                        <a
                            href="https://console.cloud.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline"
                        >
                            Google Cloud Console
                        </a>
                        , create a project and enable the <strong>Google Classroom API</strong>.
                    </li>
                    <li>
                        Create an <strong>OAuth client ID</strong> (type: Web application) and add this app&apos;s
                        address (e.g. <code className="text-xs">http://localhost:3000</code>) to the authorized
                        JavaScript origins.
                    </li>
                    <li>
                        Put the client ID in a <code className="text-xs">.env.local</code> file as{' '}
                        <code className="text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID=...</code> and restart the app.
                    </li>
                </ol>
                <p className="text-muted">Until then, everything works with manual entry.</p>
            </div>
        );
    }

    async function sync() {
        setStatus({ state: 'syncing' });
        try {
            const { courses, courseworkByCourse } = await fetchAllClassroomData();

            let skippedUndated = 0;
            const mappedByCourse = {};
            for (const [courseId, items] of Object.entries(courseworkByCourse)) {
                mappedByCourse[courseId] = [];
                for (const item of items) {
                    const due = mapCourseWorkDue(item);
                    if (!due) {
                        skippedUndated += 1;
                        continue;
                    }
                    mappedByCourse[courseId].push({
                        id: item.id,
                        title: item.title ?? 'Untitled assignment',
                        notes: item.description ?? '',
                        alternateLink: item.alternateLink ?? null,
                        ...due
                    });
                }
            }

            const counts = store.importFromClassroom({ courses, courseworkByCourse: mappedByCourse });
            setStatus({ state: 'done', counts: { ...counts, skippedUndated } });
        } catch (error) {
            setStatus({ state: 'error', message: error.message });
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">
                Pull your classes and assignments straight from Google Classroom. Your data stays on this device —
                Google is only contacted to read your coursework.
            </p>
            <div>
                <button type="button" className="btn" onClick={sync} disabled={status.state === 'syncing'}>
                    {status.state === 'syncing' ? 'Syncing…' : 'Sign in with Google & sync'}
                </button>
            </div>
            {status.state === 'done' && (
                <Alert type="success">
                    Synced! {status.counts.newClasses} new {status.counts.newClasses === 1 ? 'class' : 'classes'},{' '}
                    {status.counts.added} new {status.counts.added === 1 ? 'assignment' : 'assignments'}
                    {status.counts.updated > 0 && `, ${status.counts.updated} updated`}
                    {status.counts.kept > 0 && `, ${status.counts.kept} kept your edits`}
                    {status.counts.skippedUndated > 0 &&
                        ` (${status.counts.skippedUndated} without a due date skipped)`}
                    . Re-syncing never duplicates items.
                </Alert>
            )}
            {status.state === 'error' && <Alert type="error">Sync failed: {status.message}</Alert>}
        </div>
    );
}
