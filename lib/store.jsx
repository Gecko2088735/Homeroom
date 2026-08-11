'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { nextClassColor } from './colors';
import { emptyData, loadData, saveData } from './storage';

const StoreContext = createContext(null);

function now() {
    return new Date().toISOString();
}

export function StoreProvider({ children }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        // localStorage is unavailable during SSR/prerender, so the initial read has to happen
        // client-side after mount rather than in the useState initializer.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(loadData());
    }, []);

    useEffect(() => {
        if (data) saveData(data);
    }, [data]);

    const ready = data !== null;
    const current = data ?? emptyData();

    const value = {
        ready,
        classes: current.classes,
        homework: current.homework,

        addClass(fields) {
            const cls = {
                id: crypto.randomUUID(),
                name: '',
                location: '',
                meetings: [],
                color: nextClassColor(current.classes),
                source: 'manual',
                externalId: null,
                ...fields,
                createdAt: now(),
                updatedAt: now()
            };
            setData((d) => ({ ...d, classes: [...d.classes, cls] }));
            return cls;
        },

        updateClass(id, patch) {
            setData((d) => ({
                ...d,
                classes: d.classes.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: now() } : c))
            }));
        },

        deleteClass(id) {
            setData((d) => ({
                ...d,
                classes: d.classes.filter((c) => c.id !== id),
                homework: d.homework.map((h) => (h.classId === id ? { ...h, classId: null } : h))
            }));
        },

        addHomework(fields) {
            const hw = {
                id: crypto.randomUUID(),
                title: '',
                notes: '',
                classId: null,
                dueDate: '',
                dueTime: null,
                completedAt: null,
                source: 'manual',
                externalId: null,
                lastSync: null,
                ...fields,
                createdAt: now(),
                updatedAt: now()
            };
            setData((d) => ({ ...d, homework: [...d.homework, hw] }));
            return hw;
        },

        updateHomework(id, patch) {
            setData((d) => ({
                ...d,
                homework: d.homework.map((h) => (h.id === id ? { ...h, ...patch, updatedAt: now() } : h))
            }));
        },

        deleteHomework(id) {
            setData((d) => ({ ...d, homework: d.homework.filter((h) => h.id !== id) }));
        },

        toggleComplete(id) {
            setData((d) => ({
                ...d,
                homework: d.homework.map((h) =>
                    h.id === id ? { ...h, completedAt: h.completedAt ? null : now(), updatedAt: now() } : h
                )
            }));
        },

        clearAll() {
            setData(emptyData());
        },

        importFromClassroom(imported) {
            const { data: next, counts } = applyClassroomImport(current, imported);
            setData(next);
            return counts;
        }
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// Merge freshly fetched Classroom data into local state.
// - Classes dedupe on externalId (course id); homework on externalId (`courseId/courseWorkId`).
// - Per-field three-way merge via lastSync: a field the user never edited follows Classroom,
//   an edited field keeps the local value. completedAt/classId are never touched.
// - Items deleted in Classroom are left alone.
export function applyClassroomImport(d, { courses, courseworkByCourse }) {
    const stamp = now();
    const classes = [...d.classes];
    const homework = [...d.homework];
    const classIdByCourse = new Map();
    const counts = { newClasses: 0, added: 0, updated: 0, kept: 0 };

    for (const course of courses) {
        const existing = classes.find((c) => c.externalId === course.id);
        if (existing) {
            classIdByCourse.set(course.id, existing.id);
        } else {
            const cls = {
                id: crypto.randomUUID(),
                name: course.name,
                location: course.room ?? '',
                meetings: [],
                color: nextClassColor(classes),
                source: 'classroom',
                externalId: course.id,
                createdAt: stamp,
                updatedAt: stamp
            };
            classes.push(cls);
            classIdByCourse.set(course.id, cls.id);
            counts.newClasses += 1;
        }
    }

    for (const [courseId, items] of Object.entries(courseworkByCourse)) {
        for (const item of items) {
            const externalId = `${courseId}/${item.id}`;
            const fresh = { title: item.title, notes: item.notes, dueDate: item.dueDate, dueTime: item.dueTime };
            const idx = homework.findIndex((h) => h.externalId === externalId);

            if (idx === -1) {
                homework.push({
                    id: crypto.randomUUID(),
                    ...fresh,
                    classId: classIdByCourse.get(courseId) ?? null,
                    completedAt: null,
                    source: 'classroom',
                    externalId,
                    lastSync: fresh,
                    createdAt: stamp,
                    updatedAt: stamp
                });
                counts.added += 1;
                continue;
            }

            const existing = homework[idx];
            const base = existing.lastSync ?? {};
            const merged = { ...existing };
            let changed = false;
            let keptEdit = false;
            for (const field of ['title', 'notes', 'dueDate', 'dueTime']) {
                if (existing[field] === base[field]) {
                    if (merged[field] !== fresh[field]) {
                        merged[field] = fresh[field];
                        changed = true;
                    }
                } else {
                    keptEdit = true;
                }
            }
            merged.lastSync = fresh;
            merged.updatedAt = changed ? stamp : existing.updatedAt;
            homework[idx] = merged;
            if (changed) counts.updated += 1;
            else if (keptEdit) counts.kept += 1;
        }
    }

    return { data: { ...d, classes, homework }, counts };
}

export function useStore() {
    const store = useContext(StoreContext);
    if (!store) throw new Error('useStore must be used inside <StoreProvider>');
    return store;
}
