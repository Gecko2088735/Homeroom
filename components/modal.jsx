'use client';

import { useEffect, useRef, useState } from 'react';

const TRANSITION_MS = 150;

// Two-phase open/close so the panel can fade+scale in and out instead of snapping. `entered`
// lags one frame behind `open` on the way in (so the browser has a "from" state to transition
// from) and `rendered` lags TRANSITION_MS behind `open` on the way out (so children — and the
// native <dialog> itself — stay mounted long enough for the exit transition to actually play).
export function Modal({ open, onClose, title, children }) {
    const ref = useRef(null);
    const [rendered, setRendered] = useState(open);
    const [entered, setEntered] = useState(false);
    const closeTimeoutRef = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        clearTimeout(closeTimeoutRef.current);
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- coupled to the imperative showModal() call below
            setRendered(true);
            if (!dialog.open) dialog.showModal();
            const raf = requestAnimationFrame(() => setEntered(true));
            return () => cancelAnimationFrame(raf);
        }
        setEntered(false);
        closeTimeoutRef.current = setTimeout(() => {
            if (dialog.open) dialog.close();
            setRendered(false);
        }, TRANSITION_MS);
        return () => clearTimeout(closeTimeoutRef.current);
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
            <div
                className={[
                    'flex flex-col gap-4 rounded-xl border border-edge bg-surface p-6 text-foreground',
                    'transition-[opacity,transform,background-color,border-color,color] duration-150 ease-out',
                    entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                ].join(' ')}
            >
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
                {rendered && children}
            </div>
        </dialog>
    );
}
