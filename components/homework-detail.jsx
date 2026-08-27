'use client';

import { Modal } from './modal';
import { formatDueLabel } from 'lib/dates';
import { PRIORITY_LABELS } from 'lib/priority';
import { useStore } from 'lib/store';

export function HomeworkDetail({ hw, onClose, onEdit, onDelete }) {
    const { classes, toggleComplete } = useStore();
    if (!hw) return <Modal open={false} onClose={onClose} title="" />;

    const cls = classes.find((c) => c.id === hw.classId);
    const done = !!hw.completedAt;

    return (
        <Modal open onClose={onClose} title={hw.title}>
            <div className="flex flex-col gap-2 text-sm">
                <p className="text-muted">
                    Due {formatDueLabel(hw)}
                    {cls ? ` · ${cls.name}` : ''}
                </p>
                <p className="flex flex-wrap gap-1.5">
                    {hw.source === 'classroom' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
                            From Google Classroom
                        </span>
                    )}
                    {hw.priority !== 'normal' && (
                        <span
                            className={[
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                hw.priority === 'high' ? 'bg-danger-soft text-danger' : 'bg-surface-hover text-muted'
                            ].join(' ')}
                        >
                            {PRIORITY_LABELS[hw.priority]}
                        </span>
                    )}
                    {hw.isTest && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
                            Test / major project
                        </span>
                    )}
                    {hw.isGroupProject && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
                            Group project
                        </span>
                    )}
                </p>
                {hw.notes ? (
                    <p className="whitespace-pre-wrap">{hw.notes}</p>
                ) : (
                    <p className="italic text-muted">No notes.</p>
                )}
                {hw.classroomLink && (
                    <a href={hw.classroomLink} target="_blank" rel="noopener noreferrer" className="text-accent underline w-fit">
                        Open in Classroom ↗
                    </a>
                )}
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" className="btn btn-ghost mr-auto" onClick={onDelete}>
                    Delete
                </button>
                <button type="button" className="btn btn-ghost" onClick={onEdit}>
                    Edit
                </button>
                <button
                    type="button"
                    className="btn"
                    onClick={() => {
                        toggleComplete(hw.id);
                        onClose();
                    }}
                >
                    {done ? 'Mark not done' : 'Mark done'}
                </button>
            </div>
        </Modal>
    );
}
