'use client';

import { useState } from 'react';
import { WIDGET_COMPONENTS } from './home-widgets';
import { WidgetPicker } from './widget-picker';
import { homeworkDueAt } from 'lib/dates';
import { WIDGET_CATALOG } from 'lib/home-layout';
import { useStore } from 'lib/store';

const CATALOG_BY_ID = Object.fromEntries(WIDGET_CATALOG.map((w) => [w.id, w]));

// The overdue widget hides itself when there's nothing overdue — but only outside edit mode,
// so it stays reachable (with an empty-state placeholder) to remove or leave in place.
function isVisible(id, homework, now) {
    if (id !== 'overdue-alert') return true;
    return homework.some((h) => !h.completedAt && homeworkDueAt(h) < now);
}

export function WidgetGrid({ layout, onLayoutChange, editing, now }) {
    const { homework } = useStore();
    const [dragId, setDragId] = useState(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    const visibleLayout = editing ? layout : layout.filter((id) => isVisible(id, homework, now));

    function moveOver(overId) {
        if (!dragId || dragId === overId) return;
        const from = layout.indexOf(dragId);
        const to = layout.indexOf(overId);
        if (from === -1 || to === -1) return;
        const next = [...layout];
        next.splice(from, 1);
        next.splice(to, 0, dragId);
        onLayoutChange(next);
    }

    function removeWidget(id) {
        onLayoutChange(layout.filter((w) => w !== id));
    }

    function addWidget(id) {
        onLayoutChange([...layout, id]);
        setPickerOpen(false);
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleLayout.map((id) => {
                const Widget = WIDGET_COMPONENTS[id];
                const meta = CATALOG_BY_ID[id];
                if (!Widget || !meta) return null;
                return (
                    <div
                        key={id}
                        draggable={editing}
                        onDragStart={() => setDragId(id)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            moveOver(id);
                        }}
                        onDragEnd={() => setDragId(null)}
                        className={['relative', editing ? 'cursor-grab active:cursor-grabbing' : ''].join(' ')}
                    >
                        {editing && (
                            <button
                                type="button"
                                onClick={() => removeWidget(id)}
                                aria-label={`Remove ${meta.label} widget`}
                                className="absolute z-10 inline-flex items-center justify-center w-7 h-7 -top-2 -right-2 rounded-full shadow cursor-pointer bg-danger text-white hover:bg-danger/85"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 fill-current"
                                    aria-hidden="true"
                                >
                                    <path d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
                                </svg>
                            </button>
                        )}
                        <div
                            className={
                                editing ? 'h-full outline-2 outline-dashed outline-edge rounded-xl' : 'h-full'
                            }
                        >
                            <Widget now={now} />
                        </div>
                    </div>
                );
            })}

            {editing && (
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="flex items-center justify-center min-h-24 gap-2 text-sm font-semibold border-2 border-dashed rounded-xl cursor-pointer border-edge text-muted hover:border-accent hover:text-accent"
                >
                    + Add widget
                </button>
            )}

            <WidgetPicker open={pickerOpen} onClose={() => setPickerOpen(false)} excludeIds={layout} onPick={addWidget} />
        </div>
    );
}
