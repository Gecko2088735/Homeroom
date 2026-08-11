'use client';

import { Modal } from './modal';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <p className="text-sm text-muted">{message}</p>
            <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
