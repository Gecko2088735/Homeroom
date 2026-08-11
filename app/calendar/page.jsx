'use client';

import { useState } from 'react';
import { WeekGrid } from 'components/week-grid';
import { addDays, startOfWeek } from 'lib/dates';
import { useStore } from 'lib/store';
import { useNow } from 'lib/use-now';

export default function CalendarPage() {
    const store = useStore();
    const now = useNow();
    const [weekOffset, setWeekOffset] = useState(0);

    const weekStart = addDays(startOfWeek(now), weekOffset * 7);
    const weekEnd = addDays(weekStart, 6);
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    const rangeLabel = sameMonth
        ? `${weekStart.toLocaleDateString(undefined, { month: 'long' })} ${weekStart.getDate()}–${weekEnd.getDate()}`
        : `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
                <h1>Calendar</h1>
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        type="button"
                        onClick={() => setWeekOffset((o) => o - 1)}
                        aria-label="Previous week"
                        className="inline-flex items-center justify-center w-11 h-11 border rounded-lg cursor-pointer border-edge bg-surface text-foreground transition-colors hover:bg-surface-hover"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-current"
                            aria-hidden="true"
                        >
                            <path d="m14 18l-6-6l6-6l1.4 1.4L10.8 12l4.6 4.6L14 18Z" />
                        </svg>
                    </button>
                    <span className="min-w-40 text-center text-sm font-semibold">{rangeLabel}</span>
                    <button
                        type="button"
                        onClick={() => setWeekOffset((o) => o + 1)}
                        aria-label="Next week"
                        className="inline-flex items-center justify-center w-11 h-11 border rounded-lg cursor-pointer border-edge bg-surface text-foreground transition-colors hover:bg-surface-hover"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-current"
                            aria-hidden="true"
                        >
                            <path d="M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6l4.6-4.6Z" />
                        </svg>
                    </button>
                    {weekOffset !== 0 && (
                        <button type="button" className="btn btn-ghost ml-2" onClick={() => setWeekOffset(0)}>
                            This week
                        </button>
                    )}
                </div>
            </div>

            {store.ready && store.classes.length === 0 && store.homework.length === 0 ? (
                <p className="text-muted">Your weekly schedule will show up here once you add classes or homework.</p>
            ) : (
                <WeekGrid weekStart={weekStart} classes={store.classes} homework={store.homework} now={now} />
            )}
        </div>
    );
}
