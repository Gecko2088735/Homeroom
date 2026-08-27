'use client';

import { Modal } from './modal';
import { WIDGET_CATALOG } from 'lib/home-layout';

const CATEGORY_ORDER = ['Countdown', 'Homework', 'Focus', 'Extras'];

export function WidgetPicker({ open, onClose, excludeIds, onPick }) {
    const available = WIDGET_CATALOG.filter((w) => !excludeIds.includes(w.id));

    return (
        <Modal open={open} onClose={onClose} title="Add a widget">
            {available.length === 0 ? (
                <p className="text-sm text-muted">Every widget is already on your home screen.</p>
            ) : (
                <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
                    {CATEGORY_ORDER.map((category) => {
                        const items = available.filter((w) => w.category === category);
                        if (items.length === 0) return null;
                        return (
                            <div key={category} className="flex flex-col gap-2">
                                <p className="text-xs font-semibold tracking-wide uppercase text-muted">{category}</p>
                                <div className="flex flex-col gap-2">
                                    {items.map((w) => (
                                        <button
                                            key={w.id}
                                            type="button"
                                            onClick={() => onPick(w.id)}
                                            className="flex flex-col items-start gap-0.5 px-4 py-3 text-left border rounded-lg cursor-pointer border-edge hover:bg-surface-hover hover:border-accent"
                                        >
                                            <span className="font-semibold">{w.label}</span>
                                            <span className="text-xs text-muted">{w.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
}
