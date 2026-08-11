// Fixed, accessible palette for color-coding classes. Each entry pairs a light-mode and
// dark-mode Tailwind shade so contrast holds in both themes; chosen to stay visually distinct
// from the app's own light-blue accent (no blue/sky/cyan in the palette).
export const CLASS_COLORS = {
    red: {
        dot: 'bg-red-500 dark:bg-red-400',
        text: 'text-red-600 dark:text-red-300',
        soft: 'bg-red-500/10 dark:bg-red-400/15',
        border: 'border-red-500 dark:border-red-400'
    },
    orange: {
        dot: 'bg-orange-500 dark:bg-orange-400',
        text: 'text-orange-600 dark:text-orange-300',
        soft: 'bg-orange-500/10 dark:bg-orange-400/15',
        border: 'border-orange-500 dark:border-orange-400'
    },
    amber: {
        dot: 'bg-amber-500 dark:bg-amber-400',
        text: 'text-amber-600 dark:text-amber-300',
        soft: 'bg-amber-500/10 dark:bg-amber-400/15',
        border: 'border-amber-500 dark:border-amber-400'
    },
    green: {
        dot: 'bg-green-500 dark:bg-green-400',
        text: 'text-green-600 dark:text-green-300',
        soft: 'bg-green-500/10 dark:bg-green-400/15',
        border: 'border-green-500 dark:border-green-400'
    },
    teal: {
        dot: 'bg-teal-500 dark:bg-teal-400',
        text: 'text-teal-600 dark:text-teal-300',
        soft: 'bg-teal-500/10 dark:bg-teal-400/15',
        border: 'border-teal-500 dark:border-teal-400'
    },
    violet: {
        dot: 'bg-violet-500 dark:bg-violet-400',
        text: 'text-violet-600 dark:text-violet-300',
        soft: 'bg-violet-500/10 dark:bg-violet-400/15',
        border: 'border-violet-500 dark:border-violet-400'
    },
    pink: {
        dot: 'bg-pink-500 dark:bg-pink-400',
        text: 'text-pink-600 dark:text-pink-300',
        soft: 'bg-pink-500/10 dark:bg-pink-400/15',
        border: 'border-pink-500 dark:border-pink-400'
    },
    indigo: {
        dot: 'bg-indigo-500 dark:bg-indigo-400',
        text: 'text-indigo-600 dark:text-indigo-300',
        soft: 'bg-indigo-500/10 dark:bg-indigo-400/15',
        border: 'border-indigo-500 dark:border-indigo-400'
    }
};

export const CLASS_COLOR_KEYS = Object.keys(CLASS_COLORS);

const FALLBACK = { dot: 'bg-muted', text: 'text-muted', soft: 'bg-surface-hover', border: 'border-edge' };

export function classColor(key) {
    return CLASS_COLORS[key] ?? FALLBACK;
}

// Cycle through the palette so each new class gets a distinct default color.
export function nextClassColor(existingClasses) {
    return CLASS_COLOR_KEYS[existingClasses.length % CLASS_COLOR_KEYS.length];
}
