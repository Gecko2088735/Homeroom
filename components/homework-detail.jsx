'use client';

import { Modal } from './modal';
import { formatDueLabel } from 'lib/dates';
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
                {hw.source === 'classroom' && (
                    <p>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent">
                            From Google Classroom
                        </span>
                    </p>
                )}
                {hw.notes ? (
                    <p className="whitespace-pre-wrap">{hw.notes}</p>
                ) : (
                    <p className="italic text-muted">No notes.</p>
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
