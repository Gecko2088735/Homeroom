'use client';

import { formatRelative, homeworkDueAt } from 'lib/dates';
import { useStore } from 'lib/store';

export function HomeworkCard({ hw, now, onOpen }) {
    const { classes, toggleComplete } = useStore();
    const cls = classes.find((c) => c.id === hw.classId);
    const done = !!hw.completedAt;
    const relative = formatRelative(homeworkDueAt(hw), now);
    const overdue = !done && relative === 'overdue';

    return (
        <div className="flex items-center gap-3 px-4 py-3 border bg-surface border-edge rounded-xl">
            <input
                type="checkbox"
                checked={done}
                onChange={() => toggleComplete(hw.id)}
                aria-label={done ? `Mark "${hw.title}" as not done` : `Mark "${hw.title}" as done`}
                className="w-6 h-6 shrink-0 cursor-pointer accent-accent"
            />
            <button
                type="button"
                onClick={onOpen}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 grow min-h-11 text-left cursor-pointer"
            >
                <span className={['font-medium', done ? 'line-through text-muted' : ''].join(' ')}>{hw.title}</span>
                {cls && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
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
            </button>
        </div>
    );
}
