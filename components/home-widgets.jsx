'use client';

import Link from 'next/link';
import { CountdownHero } from './countdown-hero';
import { HomeworkCard } from './homework-card';
import { classColor } from 'lib/colors';
import {
    addDays,
    DAY_LABELS_MIN,
    dayHasEvents,
    formatRelative,
    formatTime,
    homeworkDueAt,
    isSameDay,
    startOfWeek,
    todaysClasses
} from 'lib/dates';
import { useFocusContext } from 'lib/focus-context';
import { sessionCounts } from 'lib/focus-log';
import { sortHomeworkByPriority } from 'lib/priority';
import { useStore } from 'lib/store';
import { formatClock } from 'lib/use-focus-timer';

function Section({ title, action, tone, children }) {
    return (
        <div
            className={[
                'flex flex-col h-full gap-2 px-4 py-3 border rounded-lg bg-surface',
                tone === 'danger' ? 'border-danger' : 'border-edge'
            ].join(' ')}
        >
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function CountdownWidget({ now }) {
    return <CountdownHero now={now} />;
}

function TodaysClassesWidget({ now }) {
    const { ready, classes } = useStore();
    const today = todaysClasses(classes, now);
    return (
        <Section title="Today's classes">
            {!ready ? null : today.length === 0 ? (
                <p className="text-sm text-muted">
                    No classes today.{' '}
                    <Link href="/classes" className="text-accent underline">
                        Add your classes
                    </Link>
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {today.map(({ cls, meeting, start, end }) => {
                        const past = end < now;
                        const current = start <= now && now < end;
                        const color = classColor(cls.color);
                        return (
                            <div
                                key={`${cls.id}-${meeting.day}-${meeting.startTime}`}
                                className={[
                                    'flex items-center gap-2 px-2.5 py-1.5 border-l-4 rounded-md bg-background',
                                    current ? 'border-accent' : color.border,
                                    past ? 'opacity-50' : ''
                                ].join(' ')}
                            >
                                <span className="text-xs font-semibold shrink-0 text-muted min-w-14">
                                    {formatTime(meeting.startTime)}
                                </span>
                                <span className="font-medium truncate grow">{cls.name}</span>
                                {cls.classroomLink && (
                                    <a
                                        href={cls.classroomLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent underline shrink-0"
                                    >
                                        Classroom ↗
                                    </a>
                                )}
                                {current && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-soft text-accent shrink-0">
                                        now
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Section>
    );
}

function WeekStripWidget({ now }) {
    const { classes, homework } = useStore();
    const weekStart = startOfWeek(now);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    return (
        <Section
            title="This week"
            action={
                <Link href="/calendar" className="text-xs text-accent underline">
                    Full calendar
                </Link>
            }
        >
            <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((date) => {
                    const today = isSameDay(date, now);
                    const { hasClass, hasHomework } = dayHasEvents(classes, homework, date);
                    return (
                        <div
                            key={date.toISOString()}
                            className={[
                                'flex flex-col items-center gap-1 py-2 rounded-lg text-xs',
                                today ? 'bg-accent-soft text-accent font-bold' : 'text-foreground'
                            ].join(' ')}
                        >
                            <span className="text-[0.65rem] text-muted">{DAY_LABELS_MIN[date.getDay()]}</span>
                            <span>{date.getDate()}</span>
                            <span className="flex gap-0.5 h-1">
                                {hasClass && <span className="w-1 h-1 rounded-full bg-accent" aria-hidden="true" />}
                                {hasHomework && <span className="w-1 h-1 rounded-full bg-danger" aria-hidden="true" />}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

function CurrentClassWidget({ now }) {
    const { classes } = useStore();
    const current = todaysClasses(classes, now).find(({ start, end }) => start <= now && now < end);
    return (
        <Section title="Right now">
            {current ? (
                <p className="text-sm truncate">
                    <span className="font-semibold">{current.cls.name}</span>{' '}
                    <span className="text-muted">
                        · ends {formatRelative(current.end, now)} ·{' '}
                        {formatTime(current.meeting.endTime || current.meeting.startTime)}
                    </span>
                </p>
            ) : (
                <p className="text-sm text-muted">No class right now.</p>
            )}
        </Section>
    );
}

function DueSoonWidget({ now }) {
    const { ready, homework } = useStore();
    const weekFromNow = addDays(now, 7);
    const dueSoon = sortHomeworkByPriority(homework.filter((h) => !h.completedAt && homeworkDueAt(h) <= weekFromNow));
    return (
        <Section title="Due soon">
            {!ready ? null : dueSoon.length === 0 ? (
                <p className="text-sm text-muted">
                    Nothing due in the next 7 days.{' '}
                    <Link href="/homework" className="text-accent underline">
                        Add homework
                    </Link>
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {dueSoon.map((hw) => (
                        <HomeworkCard key={hw.id} hw={hw} now={now} />
                    ))}
                </div>
            )}
        </Section>
    );
}

function OverdueAlertWidget({ now }) {
    const { homework } = useStore();
    const overdue = homework.filter((h) => !h.completedAt && homeworkDueAt(h) < now);
    return (
        <Section title="Overdue" tone={overdue.length > 0 ? 'danger' : undefined}>
            {overdue.length === 0 ? (
                <p className="text-sm text-muted">Nothing overdue. 🎉</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {overdue.map((hw) => (
                        <HomeworkCard key={hw.id} hw={hw} now={now} />
                    ))}
                </div>
            )}
        </Section>
    );
}

function CompletedTodayWidget({ now }) {
    const { classes, homework } = useStore();
    const completedToday = homework.filter((h) => h.completedAt && isSameDay(new Date(h.completedAt), now));
    return (
        <Section title="Completed today">
            {completedToday.length === 0 ? (
                <p className="text-sm text-muted">Nothing checked off yet today.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {completedToday.map((hw) => {
                        const cls = classes.find((c) => c.id === hw.classId);
                        return (
                            <div key={hw.id} className="flex items-center gap-2 text-sm">
                                <span className="text-accent">✓</span>
                                <span className="text-muted line-through">{hw.title}</span>
                                {cls && <span className="text-xs text-muted">· {cls.name}</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </Section>
    );
}

function FocusTimerWidget() {
    const { phase, remaining, running, start, pause } = useFocusContext();
    return (
        <Section
            title="Focus timer"
            action={
                <Link href="/focus" className="text-xs text-accent underline">
                    Open
                </Link>
            }
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span
                        className={[
                            'text-xs font-semibold',
                            phase === 'work' ? 'text-accent' : 'text-green-600 dark:text-green-300'
                        ].join(' ')}
                    >
                        {phase === 'work' ? 'Focus' : 'Break'}
                    </span>
                    <span className="font-mono text-3xl font-black tabular-nums">{formatClock(remaining)}</span>
                </div>
                {!running ? (
                    <button type="button" className="btn" onClick={start}>
                        Start
                    </button>
                ) : (
                    <button type="button" className="btn btn-ghost" onClick={pause}>
                        Pause
                    </button>
                )}
            </div>
        </Section>
    );
}

function FocusStreakWidget({ now }) {
    const { today, week } = sessionCounts(now);
    return (
        <Section title="Focus streak">
            <div className="flex gap-6">
                <div className="flex flex-col">
                    <span className="text-2xl font-black">{today}</span>
                    <span className="text-xs text-muted">Today</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black">{week}</span>
                    <span className="text-xs text-muted">This week</span>
                </div>
            </div>
        </Section>
    );
}

function ClassLinksWidget() {
    const { classes } = useStore();
    const linked = classes.filter((c) => c.classroomLink);
    return (
        <Section title="Class quick-links">
            {linked.length === 0 ? (
                <p className="text-sm text-muted">
                    No classes linked to Classroom yet. Sync in{' '}
                    <Link href="/settings" className="text-accent underline">
                        Settings
                    </Link>
                    .
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {linked.map((cls) => {
                        const color = classColor(cls.color);
                        return (
                            <a
                                key={cls.id}
                                href={cls.classroomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg border-edge hover:bg-surface-hover"
                            >
                                <span
                                    className={['w-2 h-2 rounded-full shrink-0', color.dot].join(' ')}
                                    aria-hidden="true"
                                />
                                {cls.name}
                                <span className="ml-auto text-accent">↗</span>
                            </a>
                        );
                    })}
                </div>
            )}
        </Section>
    );
}

export const WIDGET_COMPONENTS = {
    countdown: CountdownWidget,
    'todays-classes': TodaysClassesWidget,
    'week-strip': WeekStripWidget,
    'current-class': CurrentClassWidget,
    'due-soon': DueSoonWidget,
    'overdue-alert': OverdueAlertWidget,
    'completed-today': CompletedTodayWidget,
    'focus-timer': FocusTimerWidget,
    'focus-streak': FocusStreakWidget,
    'class-links': ClassLinksWidget
};
