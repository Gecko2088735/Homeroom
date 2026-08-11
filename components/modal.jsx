'use client';

import { useEffect, useRef } from 'react';

export function Modal({ open, onClose, title, children }) {
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose();
            }}
            className="m-auto w-full max-w-lg bg-transparent p-4 backdrop:bg-black/50"
        >
            <div className="flex flex-col gap-4 rounded-xl border border-edge bg-surface p-6 text-foreground">
                <div className="flex items-center justify-between gap-4">
                    <h2>{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-current"
                            aria-hidden="true"
                        >
                            <path d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
                        </svg>
                    </button>
                </div>
                {open && children}
            </div>
        </dialog>
    );
}
