'use client';

import { formatRelative, formatTime, nextUpcoming } from 'lib/dates';
import { useStore } from 'lib/store';

export function CountdownHero({ now }) {
    const { ready, classes, homework } = useStore();
    if (!ready) {
        return <div className="h-28 border bg-surface border-edge rounded-xl animate-pulse" aria-hidden="true" />;
    }

    const next = nextUpcoming(classes, homework, now);

    if (!next) {
        return (
            <div className="flex flex-col gap-1 px-6 py-6 border bg-surface border-edge rounded-xl">
                <p className="text-sm font-medium text-muted">Up next</p>
                <p className="text-2xl font-bold">Nothing coming up 🎉</p>
                <p className="text-sm text-muted">Add classes or homework to see your next deadline here.</p>
            </div>
        );
    }

    const relative = formatRelative(next.at, now);
    let headline;
    let detail;
    if (next.kind === 'class') {
        const { occurrence, item } = next;
        if (occurrence.inProgress) {
            headline = `${item.name} is on now`;
            detail = `Ends at ${formatTime(occurrence.meeting.endTime || occurrence.meeting.startTime)}`;
        } else {
            headline = `${item.name} starts ${relative}`;
            detail = `At ${formatTime(occurrence.meeting.startTime)}${item.location ? ` · ${item.location}` : ''}`;
        }
    } else {
        headline = `${next.item.title} due ${relative}`;
        const cls = classes.find((c) => c.id === next.item.classId);
        detail = cls ? cls.name : null;
    }

    return (
        <div className="flex flex-col gap-1 px-6 py-6 text-white bg-accent rounded-xl dark:text-accent-foreground">
            <p className="text-sm font-medium opacity-80">Up next</p>
            <p className="text-2xl font-bold sm:text-3xl">{headline}</p>
            {detail && <p className="text-sm opacity-80">{detail}</p>}
        </div>
    );
}
