'use client';

import { classColor } from 'lib/colors';
import { DAY_LABELS_SHORT, formatTime, isSameDay, weekEvents } from 'lib/dates';

export function WeekGrid({ weekStart, classes, homework, now }) {
    const days = weekEvents(classes, homework, weekStart);

    return (
        <div className="grid gap-3 sm:grid-cols-7 sm:gap-2">
            {days.map(({ date, classes: dayClasses, homework: dayHomework }) => {
                const today = isSameDay(date, now);
                const empty = dayClasses.length === 0 && dayHomework.length === 0;
                return (
                    <div
                        key={date.toISOString()}
                        className={[
                            'flex flex-col gap-2 p-3 border rounded-xl bg-surface min-h-24',
                            today ? 'border-accent' : 'border-edge',
                            empty ? 'max-sm:hidden' : ''
                        ].join(' ')}
                    >
                        <p className={['text-sm font-semibold', today ? 'text-accent' : 'text-muted'].join(' ')}>
                            {DAY_LABELS_SHORT[date.getDay()]}{' '}
                            <span className={today ? '' : 'font-normal'}>{date.getDate()}</span>
                        </p>

                        {dayClasses.map(({ cls, meeting }) => {
                            const color = classColor(cls.color);
                            return (
                                <div
                                    key={`${cls.id}-${meeting.startTime}`}
                                    className={[
                                        'flex flex-col px-2 py-1.5 text-xs rounded-lg border-l-2',
                                        color.soft,
                                        color.border
                                    ].join(' ')}
                                >
                                    <span className={['font-semibold', color.text].join(' ')}>{cls.name}</span>
                                    <span className="text-muted">{formatTime(meeting.startTime)}</span>
                                </div>
                            );
                        })}

                        {dayHomework.map((hw) => (
                            <div
                                key={hw.id}
                                className={[
                                    'flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-lg border border-edge',
                                    hw.completedAt ? 'line-through text-muted' : ''
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'w-1.5 h-1.5 rounded-full shrink-0',
                                        hw.completedAt ? 'bg-muted' : 'bg-danger'
                                    ].join(' ')}
                                    aria-hidden="true"
                                />
                                <span className="truncate">{hw.title}</span>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
