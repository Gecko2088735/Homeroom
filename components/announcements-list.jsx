'use client';

import { classColor } from 'lib/colors';
import { useStore } from 'lib/store';

export function AnnouncementsList() {
    const store = useStore();

    const classesWithAnnouncements = store.classes
        .map((cls) => ({
            cls,
            items: store.announcements
                .filter((a) => a.classId === cls.id)
                .sort((a, b) => (b.creationTime ?? '').localeCompare(a.creationTime ?? ''))
        }))
        .filter(({ items }) => items.length > 0);

    if (classesWithAnnouncements.length === 0) {
        return (
            <p className="text-sm text-muted">
                Nothing here yet. Sync Google Classroom in Settings to pull in each class&apos;s announcements.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {classesWithAnnouncements.map(({ cls, items }) => {
                const color = classColor(cls.color);
                return (
                    <div
                        key={cls.id}
                        className={[
                            'flex flex-col gap-3 px-5 py-5 border-y border-r bg-surface border-edge rounded-xl border-l-4',
                            color.border
                        ].join(' ')}
                    >
                        <div className="flex items-center gap-2">
                            <span className={['w-2.5 h-2.5 rounded-full shrink-0', color.dot].join(' ')} aria-hidden="true" />
                            <h3>{cls.name}</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {items.map((a) => (
                                <div key={a.id} className="flex flex-col gap-1 pb-3 border-b last:border-b-0 last:pb-0 border-edge">
                                    <p className="text-sm whitespace-pre-wrap">{a.text}</p>
                                    <div className="flex items-center gap-3 text-xs text-muted">
                                        {a.creationTime && (
                                            <span>
                                                {new Date(a.creationTime).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        )}
                                        {a.alternateLink && (
                                            <a
                                                href={a.alternateLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent underline"
                                            >
                                                Open in Classroom ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
