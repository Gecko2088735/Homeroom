'use client';

import { DAY_LABELS_MIN, dayHasEvents, isSameDay, monthGrid, MONTH_LABELS, WEEK_DAYS } from 'lib/dates';

export function YearGrid({ year, classes, homework, now, onSelectDate }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MONTH_LABELS.map((label, month) => (
                <MonthMini
                    key={month}
                    label={label}
                    year={year}
                    month={month}
                    classes={classes}
                    homework={homework}
                    now={now}
                    onSelectDate={onSelectDate}
                />
            ))}
        </div>
    );
}

function MonthMini({ label, year, month, classes, homework, now, onSelectDate }) {
    const cells = monthGrid(year, month);

    return (
        <div className="flex flex-col gap-2 p-3 border rounded-xl bg-surface border-edge">
            <p className="text-sm font-semibold">{label}</p>
            <div className="grid grid-cols-7 gap-y-1 text-center">
                {WEEK_DAYS.map((day) => (
                    <span key={day} className="text-[0.65rem] font-medium text-muted">
                        {DAY_LABELS_MIN[day]}
                    </span>
                ))}
                {cells.map((date, i) => {
                    if (!date) return <span key={i} />;
                    const today = isSameDay(date, now);
                    const { hasClass, hasHomework } = dayHasEvents(classes, homework, date);
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelectDate(date)}
                            aria-label={date.toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                            className={[
                                'flex flex-col items-center justify-center gap-0.5 aspect-square rounded-md text-xs cursor-pointer transition-colors hover:bg-surface-hover',
                                today ? 'bg-accent-soft text-accent font-bold' : 'text-foreground'
                            ].join(' ')}
                        >
                            {date.getDate()}
                            <span className="flex gap-0.5 h-1">
                                {hasClass && <span className="w-1 h-1 rounded-full bg-accent" aria-hidden="true" />}
                                {hasHomework && <span className="w-1 h-1 rounded-full bg-danger" aria-hidden="true" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
