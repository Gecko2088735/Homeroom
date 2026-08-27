'use client';

import { formatRelative, formatTime, nextUpcoming } from 'lib/dates';
import { useStore } from 'lib/store';

export function CountdownHero({ now }) {
    const { ready, classes, homework } = useStore();
    if (!ready) {
        return <div className="h-11 border bg-surface border-edge rounded-lg animate-pulse" aria-hidden="true" />;
    }

    const next = nextUpcoming(classes, homework, now);

    if (!next) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 border bg-surface border-edge rounded-lg">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted shrink-0">Up next</span>
                <span className="font-semibold truncate">Nothing coming up 🎉</span>
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
        <div className="flex items-center gap-3 px-4 py-3 text-white bg-accent rounded-lg dark:text-accent-foreground">
            <span className="text-xs font-semibold tracking-wide uppercase opacity-80 shrink-0">Up next</span>
            <span className="font-semibold truncate">{headline}</span>
            {detail && <span className="ml-auto text-xs opacity-80 shrink-0">{detail}</span>}
        </div>
    );
}
