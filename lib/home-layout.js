const KEY = 'homeroom:home-layout';

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

export const DEFAULT_LAYOUT = ['countdown', 'todays-classes', 'due-soon'];

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
