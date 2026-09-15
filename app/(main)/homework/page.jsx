'use client';

import { useState } from 'react';
import { AnnouncementsList } from 'components/announcements-list';
import { ConfirmDialog } from 'components/confirm-dialog';
import { HomeworkCard } from 'components/homework-card';
import { HomeworkDetail } from 'components/homework-detail';
import { HomeworkForm } from 'components/homework-form';
import { Modal } from 'components/modal';
import { homeworkDueAt } from 'lib/dates';
import { sortHomeworkByPriority } from 'lib/priority';
import { useStore } from 'lib/store';
import { useNow } from 'lib/use-now';

export default function HomeworkPage() {
    const store = useStore();
    const now = useNow();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detailId, setDetailId] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showAnnouncements, setShowAnnouncements] = useState(false);

    const detail = store.homework.find((h) => h.id === detailId) ?? null;
    const incomplete = sortHomeworkByPriority(store.homework.filter((h) => !h.completedAt));
    const completed = store.homework.filter((h) => h.completedAt).sort((a, b) => homeworkDueAt(b) - homeworkDueAt(a));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <h1>Homework</h1>
                <button type="button" className="btn" onClick={() => setAdding(true)}>
                    + Add homework
                </button>
            </div>

            {!store.ready ? null : store.homework.length === 0 ? (
                <p className="text-muted">
                    No homework yet. Add homework manually or by connecting your google classroom in settings.
                </p>
            ) : (
                <>
                    <div className="flex flex-col gap-3">
                        {incomplete.length === 0 && <p className="text-muted">All caught up — nothing due. 🎉</p>}
                        {incomplete.map((hw) => (
                            <HomeworkCard key={hw.id} hw={hw} now={now} onOpen={() => setDetailId(hw.id)} />
                        ))}
                    </div>

                    {completed.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCompleted((s) => !s)}
                                className="self-start text-sm font-medium cursor-pointer text-muted hover:text-foreground min-h-11"
                            >
                                {showCompleted ? '▾' : '▸'} Completed ({completed.length})
                            </button>
                            <div
                                className={[
                                    'grid transition-[grid-template-rows] duration-300 ease-out',
                                    showCompleted ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                ].join(' ')}
                                aria-hidden={!showCompleted}
                            >
                                <div className="flex flex-col gap-3 overflow-hidden">
                                    {completed.map((hw) => (
                                        <HomeworkCard key={hw.id} hw={hw} now={now} onOpen={() => setDetailId(hw.id)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {store.ready && store.announcements.length > 0 && (
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => setShowAnnouncements((s) => !s)}
                        className="self-start text-sm font-medium cursor-pointer text-muted hover:text-foreground min-h-11"
                    >
                        {showAnnouncements ? '▾' : '▸'} Announcements ({store.announcements.length})
                    </button>
                    <div
                        className={[
                            'grid transition-[grid-template-rows] duration-300 ease-out',
                            showAnnouncements ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        ].join(' ')}
                        aria-hidden={!showAnnouncements}
                    >
                        <div className="overflow-hidden">
                            <AnnouncementsList />
                        </div>
                    </div>
                </div>
            )}

            <Modal open={adding} onClose={() => setAdding(false)} title="Add homework">
                <HomeworkForm
                    onCancel={() => setAdding(false)}
                    onSubmit={(fields) => {
                        store.addHomework(fields);
                        setAdding(false);
                    }}
                />
            </Modal>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit homework">
                {editing && (
                    <HomeworkForm
                        hw={editing}
                        onCancel={() => setEditing(null)}
                        onSubmit={(fields) => {
                            store.updateHomework(editing.id, fields);
                            setEditing(null);
                        }}
                    />
                )}
            </Modal>

            {detail && (
                <HomeworkDetail
                    hw={detail}
                    onClose={() => setDetailId(null)}
                    onEdit={() => {
                        setEditing(detail);
                        setDetailId(null);
                    }}
                    onDelete={() => {
                        setDeleting(detail);
                        setDetailId(null);
                    }}
                />
            )}

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={() => store.deleteHomework(deleting?.id)}
                title="Delete homework?"
                message={deleting ? `"${deleting.title}" will be permanently removed.` : ''}
            />
        </div>
    );
}
