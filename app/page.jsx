'use client';

import Link from 'next/link';
import { CountdownHero } from 'components/countdown-hero';
import { HomeworkCard } from 'components/homework-card';
import { classColor } from 'lib/colors';
import { addDays, formatTime, homeworkDueAt, todaysClasses } from 'lib/dates';
import { useStore } from 'lib/store';
import { useNow } from 'lib/use-now';

export default function HomePage() {
    const store = useStore();
    const now = useNow();

    const today = todaysClasses(store.classes, now);
    const weekFromNow = addDays(now, 7);
    const dueSoon = store.homework
        .filter((h) => !h.completedAt && homeworkDueAt(h) <= weekFromNow)
        .sort((a, b) => homeworkDueAt(a) - homeworkDueAt(b));

    return (
        <div className="flex flex-col gap-8">
            <CountdownHero now={now} />

            <section className="flex flex-col gap-3">
                <h2>Today&apos;s classes</h2>
                {!store.ready ? null : today.length === 0 ? (
                    <p className="text-muted">
                        No classes today.{' '}
                        {store.classes.length === 0 && (
                            <Link href="/classes" className="text-accent underline">
                                Add your classes
                            </Link>
                        )}
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {today.map(({ cls, meeting, start, end }) => {
                            const past = end < now;
                            const current = start <= now && now < end;
                            const color = classColor(cls.color);
                            return (
                                <div
                                    key={`${cls.id}-${meeting.day}-${meeting.startTime}`}
                                    className={[
                                        'flex items-center gap-4 px-5 py-4 border-y border-r rounded-xl bg-surface border-l-4',
                                        current ? 'border-accent' : color.border,
                                        past ? 'opacity-50' : ''
                                    ].join(' ')}
                                >
                                    <div className="flex flex-col text-sm shrink-0 text-muted min-w-20">
                                        <span className="font-semibold text-foreground">
                                            {formatTime(meeting.startTime)}
                                        </span>
                                        {meeting.endTime && <span>{formatTime(meeting.endTime)}</span>}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold">{cls.name}</span>
                                        {cls.location && <span className="text-sm text-muted">{cls.location}</span>}
                                    </div>
                                    {current && (
                                        <span className="px-2 py-0.5 ml-auto text-xs font-medium rounded-full bg-accent-soft text-accent shrink-0">
                                            now
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <h2>Due soon</h2>
                {!store.ready ? null : dueSoon.length === 0 ? (
                    <p className="text-muted">
                        Nothing due in the next 7 days.{' '}
                        {store.homework.length === 0 && (
                            <Link href="/homework" className="text-accent underline">
                                Add homework
                            </Link>
                        )}
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {dueSoon.map((hw) => (
                            <HomeworkCard key={hw.id} hw={hw} now={now} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
