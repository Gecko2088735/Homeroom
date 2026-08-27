'use client';

import { useEffect, useState } from 'react';
import { ClassroomSync } from 'components/classroom-sync';
import { ConfirmDialog } from 'components/confirm-dialog';
import { ThemeToggle } from 'components/theme-toggle';
import { loadAutoShift, saveAutoShift } from 'lib/home-layout';
import { useStore } from 'lib/store';

export default function SettingsPage() {
    const store = useStore();
    const [confirmingClear, setConfirmingClear] = useState(false);
    const [autoShift, setAutoShift] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoShift(loadAutoShift());
    }, []);

    function toggleAutoShift(e) {
        const enabled = e.target.checked;
        setAutoShift(enabled);
        saveAutoShift(enabled);
    }

    return (
        <div className="flex flex-col gap-6">
            <h1>Settings</h1>

            <section className="flex items-center justify-between gap-4 p-5 border rounded-xl border-edge bg-surface">
                <div>
                    <h3>Theme</h3>
                    <p className="text-sm text-muted">Switch between the light and dark look.</p>
                </div>
                <ThemeToggle />
            </section>

            <section className="flex items-center justify-between gap-4 p-5 border rounded-xl border-edge bg-surface">
                <div>
                    <h3>Auto-adjust home screen</h3>
                    <p className="text-sm text-muted">
                        Show today&apos;s classes before and during school, then switch to your homework
                        automatically in any gap or once classes are done. Replaces your custom home screen layout
                        while it&apos;s on.
                    </p>
                </div>
                <label className="inline-flex items-center shrink-0">
                    <input
                        type="checkbox"
                        className="w-6 h-6 cursor-pointer accent-accent"
                        checked={autoShift}
                        onChange={toggleAutoShift}
                        aria-label="Auto-adjust home screen by time of day"
                    />
                </label>
            </section>

            <section className="flex flex-col gap-3 p-5 border rounded-xl border-edge bg-surface">
                <h3>Google Classroom</h3>
                <ClassroomSync />
            </section>

            <section className="flex flex-col gap-3 p-5 border rounded-xl border-edge bg-surface">
                <h3>Your data</h3>
                <p className="text-sm text-muted">
                    Everything is stored in this browser on this device — nothing is uploaded anywhere. Clearing wipes
                    all classes and homework.
                </p>
                <div>
                    <button type="button" className="btn btn-danger" onClick={() => setConfirmingClear(true)}>
                        Clear all data
                    </button>
                </div>
            </section>

            <ConfirmDialog
                open={confirmingClear}
                onClose={() => setConfirmingClear(false)}
                onConfirm={() => store.clearAll()}
                title="Clear all data?"
                message="All classes and homework saved on this device will be permanently deleted."
                confirmLabel="Clear everything"
            />
        </div>
    );
}
