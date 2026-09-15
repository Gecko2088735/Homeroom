'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EditHomeButton } from 'components/edit-home-button';
import { WidgetGrid } from 'components/widget-grid';
import { isConfigured } from 'lib/classroom';
import { autoLayoutFor, loadAutoShift, loadHomeLayout, saveHomeLayout } from 'lib/home-layout';
import { useStore } from 'lib/store';
import { useNow } from 'lib/use-now';

export default function HomePage() {
    const store = useStore();
    const now = useNow();
    const [layout, setLayout] = useState(null);
    const [autoShift, setAutoShift] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        // localStorage isn't available during SSR/prerender, so the initial read has to happen
        // client-side after mount rather than in the useState initializer.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLayout(loadHomeLayout());
        setAutoShift(loadAutoShift());
    }, []);

    function handleLayoutChange(next) {
        setLayout(next);
        saveHomeLayout(next);
    }

    const activeLayout = autoShift ? autoLayoutFor(store.classes, now) : layout;
    const connectedToClassroom = store.classes.some((c) => c.source === 'classroom');
    const showConnectPrompt = store.ready && isConfigured() && !connectedToClassroom;

    return (
        <div className="flex flex-col gap-6">
            {!autoShift && <EditHomeButton editing={editing} onToggle={() => setEditing((e) => !e)} />}
            {showConnectPrompt && (
                <Link
                    href="/classroom"
                    className="flex items-center justify-between gap-4 px-6 py-5 no-underline border bg-accent-soft border-accent/30 rounded-xl"
                >
                    <div>
                        <p className="text-lg font-bold text-accent">Connect Google Classroom</p>
                        <p className="text-sm text-muted">Pull in your classes and assignments automatically.</p>
                    </div>
                    <span className="text-2xl shrink-0 text-accent">→</span>
                </Link>
            )}
            {!store.ready || !activeLayout ? null : (
                <WidgetGrid
                    layout={activeLayout}
                    onLayoutChange={handleLayoutChange}
                    editing={!autoShift && editing}
                    now={now}
                />
            )}
        </div>
    );
}
