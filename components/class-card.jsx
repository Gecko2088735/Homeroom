'use client';

import { classColor } from 'lib/colors';
import { meetingSummary } from 'lib/dates';
import { classPercentage, formatPercentage } from 'lib/grades';
import { useStore } from 'lib/store';

export function ClassCard({ cls, onEdit, onDelete }) {
    const { homework } = useStore();
    const summary = meetingSummary(cls.meetings);
    const color = classColor(cls.color);
    const percentage = classPercentage(cls, homework.filter((h) => h.classId === cls.id));

    return (
        <div
            className={[
                'flex flex-col gap-3 px-5 py-5 border-y border-r bg-surface border-edge rounded-xl border-l-4',
                color.border
            ].join(' ')}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span
                            className={['w-2.5 h-2.5 rounded-full shrink-0', color.dot].join(' ')}
                            aria-hidden="true"
                        />
                        <h3>{cls.name}</h3>
                        {cls.source === 'classroom' && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
                                Classroom
                            </span>
                        )}
                        {percentage !== null && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
                                {formatPercentage(percentage)}
                            </span>
                        )}
                    </div>
                    {cls.classroomLink && (
                        <a
                            href={cls.classroomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent underline w-fit"
                        >
                            Open in Classroom ↗
                        </a>
                    )}
                    {summary ? (
                        <p className="text-sm text-muted">{summary}</p>
                    ) : (
                        <p className="text-sm text-muted italic">No meeting times set — edit to add a schedule</p>
                    )}
                    {cls.location && <p className="text-sm text-muted">{cls.location}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={onEdit}
                        aria-label={`Edit ${cls.name}`}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-current"
                            aria-hidden="true"
                        >
                            <path d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575V19Zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21H3ZM19 6.4L17.6 5L19 6.4Zm-3.525 2.125l-.7-.725L16.2 9.225l-.725-.7Z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label={`Delete ${cls.name}`}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-current"
                            aria-hidden="true"
                        >
                            <path d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21H7ZM17 6H7v13h10V6ZM9 17h2V8H9v9Zm4 0h2V8h-2v9Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
