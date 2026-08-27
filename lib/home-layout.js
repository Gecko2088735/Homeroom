import { todaysClasses } from './dates';

const KEY = 'homeroom:home-layout';
const AUTO_SHIFT_KEY = 'homeroom:home-auto-shift';

export const WIDGET_CATALOG = [
    {
        id: 'countdown',
        label: 'Next-up countdown',
        category: 'Countdown',
        description: 'Live countdown to your next class or due assignment.'
    },
    {
        id: 'todays-classes',
        label: "Today's classes",
        category: 'Countdown',
        description: "Today's schedule, with a quick link to each class in Classroom."
    },
    {
        id: 'week-strip',
        label: 'Week-at-a-glance',
        category: 'Countdown',
        description: 'A compact 7-day view of the current week.'
    },
    {
        id: 'current-class',
        label: 'Current class',
        category: 'Countdown',
        description: "What class you're in right now, if any."
    },
    {
        id: 'due-soon',
        label: 'Due soon',
        category: 'Homework',
        description: 'Upcoming homework sorted by priority and due date.'
    },
    {
        id: 'overdue-alert',
        label: 'Overdue',
        category: 'Homework',
        description: 'Only shows up on your home screen when something is overdue.'
    },
    {
        id: 'completed-today',
        label: 'Completed today',
        category: 'Homework',
        description: "Homework you've checked off today."
    },
    {
        id: 'focus-timer',
        label: 'Focus timer',
        category: 'Focus',
        description: 'Start or pause a Focus session without leaving the home screen.'
    },
    {
        id: 'focus-streak',
        label: 'Focus streak',
        category: 'Focus',
        description: 'Sessions completed today and this week.'
    },
    {
        id: 'class-links',
        label: 'Class quick-links',
        category: 'Extras',
        description: "Buttons that jump straight to each class's Classroom page."
    }
];

const VALID_IDS = new Set(WIDGET_CATALOG.map((w) => w.id));

export const DEFAULT_LAYOUT = ['countdown', 'current-class', 'todays-classes'];

export function loadHomeLayout() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return DEFAULT_LAYOUT;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_LAYOUT;
        const filtered = parsed.filter((id) => VALID_IDS.has(id));
        return filtered.length ? filtered : DEFAULT_LAYOUT;
    } catch {
        return DEFAULT_LAYOUT;
    }
}

export function saveHomeLayout(layout) {
    try {
        localStorage.setItem(KEY, JSON.stringify(layout));
    } catch {
        // storage unavailable — layout just won't persist across visits
    }
}

// The two fixed presets used when "auto-adjust by time of day" is on, swapped based on the
// school day rather than the clock (see autoLayoutFor).
export const MORNING_LAYOUT = ['countdown', 'current-class', 'todays-classes'];
export const AFTERNOON_LAYOUT = ['countdown', 'due-soon', 'overdue-alert'];

export function loadAutoShift() {
    try {
        return localStorage.getItem(AUTO_SHIFT_KEY) === 'true';
    } catch {
        return false;
    }
}

export function saveAutoShift(enabled) {
    try {
        localStorage.setItem(AUTO_SHIFT_KEY, enabled ? 'true' : 'false');
    } catch {
        // storage unavailable — setting just won't persist across visits
    }
}

// Class-mode (MORNING_LAYOUT) before the first class of the day, or while one is happening right
// now; homework-mode (AFTERNOON_LAYOUT) in any gap between classes or after the last one — and
// all day on days with no classes at all.
export function autoLayoutFor(classes, now) {
    const today = todaysClasses(classes, now);
    if (today.length === 0) return AFTERNOON_LAYOUT;
    if (now < today[0].start) return MORNING_LAYOUT;
    const inClassNow = today.some(({ start, end }) => start <= now && now < end);
    return inClassNow ? MORNING_LAYOUT : AFTERNOON_LAYOUT;
}
