'use client';

import { useEffect, useState } from 'react';
import { EditHomeButton } from 'components/edit-home-button';
import { WidgetGrid } from 'components/widget-grid';
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

    return (
        <div className="flex flex-col gap-6">
            {!autoShift && <EditHomeButton editing={editing} onToggle={() => setEditing((e) => !e)} />}
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
