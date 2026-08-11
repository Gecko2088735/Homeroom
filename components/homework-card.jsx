'use client';

import { classColor } from 'lib/colors';
import { formatRelative, homeworkDueAt } from 'lib/dates';
import { useStore } from 'lib/store';

export function HomeworkCard({ hw, now, onOpen }) {
    const { classes, toggleComplete } = useStore();
    const cls = classes.find((c) => c.id === hw.classId);
    const color = cls ? classColor(cls.color) : null;
    const done = !!hw.completedAt;
    const relative = formatRelative(homeworkDueAt(hw), now);
    const overdue = !done && relative === 'overdue';

    return (
        <div className="flex items-center gap-1 px-2 py-2 border bg-surface border-edge rounded-xl sm:gap-3 sm:px-4 sm:py-3">
            <label className="inline-flex items-center justify-center w-11 h-11 shrink-0 cursor-pointer">
                <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleComplete(hw.id)}
                    aria-label={done ? `Mark "${hw.title}" as not done` : `Mark "${hw.title}" as done`}
                    className="w-6 h-6 cursor-pointer accent-accent"
                />
            </label>
            <Body
                onOpen={onOpen}
                className={[
                    'flex flex-wrap items-center gap-x-3 gap-y-1 grow min-h-11 text-left',
                    onOpen ? 'cursor-pointer' : ''
                ].join(' ')}
            >
                <span className={['font-medium', done ? 'line-through text-muted' : ''].join(' ')}>{hw.title}</span>
                {cls && (
                    <span
                        className={['px-2 py-0.5 text-xs font-medium rounded-full', color.soft, color.text].join(' ')}
                    >
                        {cls.name}
                    </span>
                )}
                <span
                    className={[
                        'ml-auto text-sm shrink-0',
                        overdue ? 'font-semibold text-danger' : 'text-muted',
                        done ? 'line-through' : ''
                    ].join(' ')}
                >
                    {done ? 'done' : relative === 'overdue' ? 'overdue' : `due ${relative}`}
                </span>
            </Body>
        </div>
    );
}

function Body({ onOpen, className, children }) {
    if (!onOpen) return <div className={className}>{children}</div>;
    return (
        <button type="button" onClick={onOpen} className={className}>
            {children}
        </button>
    );
}
