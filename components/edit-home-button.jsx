'use client';

import { useState } from 'react';
import { Modal } from './modal';

export function EditHomeButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Customize home screen"
                className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg cursor-pointer bg-accent text-accent-foreground transition-transform hover:scale-105"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
                    <path d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575V19Zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21H3ZM19 6.4L17.6 5L19 6.4Zm-3.525 2.125l-.7-.725L16.2 9.225l-.725-.7Z" />
                </svg>
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title="Customize your home screen">
                <p className="text-sm text-muted">
                    A drag-and-drop widget editor is on the way — you&apos;ll be able to add, remove, and rearrange
                    things like countdowns, homework lists, and the Focus timer right from here.
                </p>
                <div className="flex justify-end pt-2">
                    <button type="button" className="btn" onClick={() => setOpen(false)}>
                        Got it
                    </button>
                </div>
            </Modal>
        </>
    );
}
