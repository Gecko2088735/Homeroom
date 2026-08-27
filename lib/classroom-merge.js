import { nextClassColor } from './colors';

function now() {
    return new Date().toISOString();
}

// Value equality for lastSync comparisons — 'grade' is an object, so reference equality (===)
// would treat every fresh fetch as "changed" even when earned/possible are identical.
function fieldsEqual(field, a, b) {
    if (field !== 'grade') return a === b;
    if (a === b) return true;
    if (!a || !b) return false;
    return a.earned === b.earned && a.possible === b.possible;
}

// Merge freshly fetched Classroom data into local state.
// - Classes dedupe on externalId (course id); homework and announcements on externalId
//   (`courseId/itemId`).
// - Per-field three-way merge via lastSync: a field the user never edited follows Classroom,
//   an edited field keeps the local value. completedAt/classId are never touched.
// - A late submission always bumps priority to 'high' (never automatically un-bumped), per the
//   user's request to surface late work; it doesn't participate in the edit-preserving merge
//   since it isn't a field the user edits directly.
// - Announcements and gradebook metadata (classroomLink, calculationType, gradeCategories, late,
//   maxPoints, gradeCategoryId) aren't user-editable, so they're always refreshed on sync rather
//   than going through the lastSync dance.
// - Items deleted in Classroom are left alone.
export function applyClassroomImport(d, { courses, courseworkByCourse, announcementsByCourse = {} }) {
    const stamp = now();
    const classes = [...d.classes];
    const homework = [...d.homework];
    const announcements = [...d.announcements];
    const classIdByCourse = new Map();
    const counts = { newClasses: 0, added: 0, updated: 0, kept: 0, newAnnouncements: 0 };

    for (const course of courses) {
        const gradebook = course.gradebookSettings ?? null;
        const calculationType = gradebook?.calculationType ?? null;
        const gradeCategories = Array.isArray(gradebook?.gradeCategories)
            ? gradebook.gradeCategories.map((c) => ({ id: c.id, name: c.name, weight: c.weight }))
            : [];

        const existingIdx = classes.findIndex((c) => c.externalId === course.id);
        if (existingIdx !== -1) {
            classIdByCourse.set(course.id, classes[existingIdx].id);
            classes[existingIdx] = {
                ...classes[existingIdx],
                classroomLink: course.alternateLink ?? null,
                calculationType,
                gradeCategories
            };
        } else {
            const cls = {
                id: crypto.randomUUID(),
                name: course.name,
                location: course.room ?? '',
                meetings: [],
                color: nextClassColor(classes),
                classroomLink: course.alternateLink ?? null,
                calculationType,
                gradeCategories,
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
            const fresh = {
                title: item.title,
                notes: item.notes,
                dueDate: item.dueDate,
                dueTime: item.dueTime,
                grade: item.grade ?? null
            };
            const idx = homework.findIndex((h) => h.externalId === externalId);

            if (idx === -1) {
                homework.push({
                    id: crypto.randomUUID(),
                    ...fresh,
                    classId: classIdByCourse.get(courseId) ?? null,
                    completedAt: null,
                    priority: item.late ? 'high' : 'normal',
                    isTest: false,
                    isGroupProject: false,
                    late: item.late === true,
                    maxPoints: item.maxPoints ?? null,
                    gradeCategoryId: item.gradeCategoryId ?? null,
                    classroomLink: item.alternateLink ?? null,
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
            for (const field of ['title', 'notes', 'dueDate', 'dueTime', 'grade']) {
                if (fieldsEqual(field, existing[field], base[field])) {
                    if (!fieldsEqual(field, merged[field], fresh[field])) {
                        merged[field] = fresh[field];
                        changed = true;
                    }
                } else {
                    keptEdit = true;
                }
            }
            merged.lastSync = fresh;
            merged.classroomLink = item.alternateLink ?? null;
            merged.late = item.late === true;
            merged.maxPoints = item.maxPoints ?? null;
            merged.gradeCategoryId = item.gradeCategoryId ?? null;
            if (item.late) merged.priority = 'high';
            merged.updatedAt = changed ? stamp : existing.updatedAt;
            homework[idx] = merged;
            if (changed) counts.updated += 1;
            else if (keptEdit) counts.kept += 1;
        }
    }

    for (const [courseId, items] of Object.entries(announcementsByCourse)) {
        const classId = classIdByCourse.get(courseId) ?? null;
        for (const item of items) {
            const externalId = `${courseId}/${item.id}`;
            const idx = announcements.findIndex((a) => a.externalId === externalId);
            const fresh = {
                id: idx === -1 ? crypto.randomUUID() : announcements[idx].id,
                classId,
                text: item.text ?? '',
                alternateLink: item.alternateLink ?? null,
                creationTime: item.creationTime ?? null,
                externalId
            };
            if (idx === -1) {
                announcements.push(fresh);
                counts.newAnnouncements += 1;
            } else {
                announcements[idx] = fresh;
            }
        }
    }

    return { data: { ...d, classes, homework, announcements }, counts };
}
