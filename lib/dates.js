// All date math is in the browser's local time — the app is single-device by design.

export const WEEK_STARTS_ON = 1; // Monday
export const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_LABELS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LABELS_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_LABELS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

// Days of the week in display order, starting from WEEK_STARTS_ON.
export const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => (WEEK_STARTS_ON + i) % 7);

export function parseTimeOnDate(dateLike, hhmm) {
    const d = new Date(dateLike);
    const [h, m] = hhmm.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
}

// 'YYYY-MM-DD' parsed as *local* — new Date('YYYY-MM-DD') would parse as UTC and shift the day.
export function parseLocalDate(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function homeworkDueAt(hw) {
    return parseTimeOnDate(parseLocalDate(hw.dueDate), hw.dueTime ?? '23:59');
}

// Next (or currently running) occurrence of a recurring class, or null if it has no meetings.
export function nextClassOccurrence(cls, now) {
    let best = null;
    for (let offset = 0; offset <= 7; offset++) {
        const date = addDays(now, offset);
        for (const meeting of cls.meetings ?? []) {
            if (meeting.day !== date.getDay()) continue;
            const start = parseTimeOnDate(date, meeting.startTime);
            const end = parseTimeOnDate(date, meeting.endTime || meeting.startTime);
            if (end <= now) continue;
            if (!best || start < best.start) {
                best = { start, end, meeting, inProgress: start <= now && now < end };
            }
        }
    }
    return best;
}

export function todaysClasses(classes, now) {
    const day = now.getDay();
    const out = [];
    for (const cls of classes) {
        for (const meeting of cls.meetings ?? []) {
            if (meeting.day !== day) continue;
            out.push({
                cls,
                meeting,
                start: parseTimeOnDate(now, meeting.startTime),
                end: parseTimeOnDate(now, meeting.endTime || meeting.startTime)
            });
        }
    }
    return out.sort((a, b) => a.start - b.start);
}

// The single next thing coming up: a class starting (or in progress) or a homework deadline.
export function nextUpcoming(classes, homework, now) {
    let best = null;
    for (const cls of classes) {
        const occurrence = nextClassOccurrence(cls, now);
        if (occurrence && (!best || occurrence.start < best.at)) {
            best = { kind: 'class', at: occurrence.start, item: cls, occurrence };
        }
    }
    for (const hw of homework) {
        if (hw.completedAt || !hw.dueDate) continue;
        const due = homeworkDueAt(hw);
        if (due > now && (!best || due < best.at)) {
            best = { kind: 'homework', at: due, item: hw };
        }
    }
    return best;
}

export function formatRelative(date, now) {
    const ms = date - now;
    if (ms < -60000) return 'overdue';
    const min = Math.round(ms / 60000);
    if (min < 1) return 'now';
    if (min < 60) return `in ${min} min`;
    const hrs = Math.round(min / 60);
    if (hrs < 24) return `in ${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
    const days = Math.round(hrs / 24);
    if (days < 7) return `in ${days} ${days === 1 ? 'day' : 'days'}`;
    return 'on ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTime(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatDueLabel(hw) {
    const date = parseLocalDate(hw.dueDate);
    const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return hw.dueTime ? `${label}, ${formatTime(hw.dueTime)}` : label;
}

export function startOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() - WEEK_STARTS_ON + 7) % 7));
    return d;
}

export function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

export function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function toDateInputValue(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// One entry per day of the given week: the classes meeting that day and the homework due that day.
export function weekEvents(classes, homework, weekStart) {
    return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const dayClasses = [];
        for (const cls of classes) {
            for (const meeting of cls.meetings ?? []) {
                if (meeting.day === date.getDay()) dayClasses.push({ cls, meeting });
            }
        }
        dayClasses.sort((a, b) => a.meeting.startTime.localeCompare(b.meeting.startTime));
        const dateValue = toDateInputValue(date);
        const dayHomework = homework
            .filter((h) => h.dueDate === dateValue)
            .sort((a, b) => (a.dueTime ?? '23:59').localeCompare(b.dueTime ?? '23:59'));
        return { date, classes: dayClasses, homework: dayHomework };
    });
}

// A 6x7 grid of dates for the given month (0-indexed), padded with nulls so it always aligns
// to WEEK_STARTS_ON columns — nulls render as blank cells for days outside the month.
export function monthGrid(year, month) {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = (first.getDay() - WEEK_STARTS_ON + 7) % 7;
    const cells = Array(leadingBlanks).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

// Whether a given date has a recurring class (by weekday) and/or homework due (by exact date) —
// a lightweight per-day check for overview grids like the year view, not full event lists.
export function dayHasEvents(classes, homework, date) {
    const dateValue = toDateInputValue(date);
    return {
        hasClass: classes.some((c) => (c.meetings ?? []).some((m) => m.day === date.getDay())),
        hasHomework: homework.some((h) => h.dueDate === dateValue)
    };
}

// "Mon/Wed 9:00 AM–10:15 AM · Fri 1:00 PM" — meetings grouped by identical times.
export function meetingSummary(meetings) {
    if (!meetings?.length) return '';
    const ordered = [...meetings].sort(
        (a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime)
    );
    const groups = new Map();
    for (const m of ordered) {
        const key = `${m.startTime}|${m.endTime ?? ''}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(m.day);
    }
    return [...groups.entries()]
        .map(([key, days]) => {
            const [start, end] = key.split('|');
            const dayStr = days.map((d) => DAY_LABELS_SHORT[d]).join('/');
            return end && end !== start
                ? `${dayStr} ${formatTime(start)}–${formatTime(end)}`
                : `${dayStr} ${formatTime(start)}`;
        })
        .join(' · ');
}
