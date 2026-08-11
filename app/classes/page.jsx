'use client';

import { useState } from 'react';
import { ClassCard } from 'components/class-card';
import { ClassForm } from 'components/class-form';
import { ConfirmDialog } from 'components/confirm-dialog';
import { Modal } from 'components/modal';
import { useStore } from 'lib/store';

export default function ClassesPage() {
    const store = useStore();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <h1>Classes</h1>
                <button type="button" className="btn" onClick={() => setAdding(true)}>
                    + Add class
                </button>
            </div>

            {!store.ready ? null : store.classes.length === 0 ? (
                <p className="text-muted">
                    No classes yet. Add your first class and it will show up here, on the home screen, and on the
                    calendar.
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {store.classes.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            cls={cls}
                            onEdit={() => setEditing(cls)}
                            onDelete={() => setDeleting(cls)}
                        />
                    ))}
                </div>
            )}

            <Modal open={adding} onClose={() => setAdding(false)} title="Add class">
                <ClassForm
                    onCancel={() => setAdding(false)}
                    onSubmit={(fields) => {
                        store.addClass(fields);
                        setAdding(false);
                    }}
                />
            </Modal>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit class">
                {editing && (
                    <ClassForm
                        cls={editing}
                        onCancel={() => setEditing(null)}
                        onSubmit={(fields) => {
                            store.updateClass(editing.id, fields);
                            setEditing(null);
                        }}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={() => store.deleteClass(deleting?.id)}
                title="Delete class?"
                message={
                    deleting
                        ? `"${deleting.name}" will be removed from your schedule. Its homework stays but will no longer be linked to a class.`
                        : ''
                }
            />
        </div>
    );
}
