const KEY = 'homeroom:focus-settings';

export const MIN_WORK_MINUTES = 1;
export const MAX_WORK_MINUTES = 180;
export const MIN_BREAK_MINUTES = 1;
export const MAX_BREAK_MINUTES = 60;

export function loadFocusSettings() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.workMinutes !== 'number' || typeof parsed.breakMinutes !== 'number') return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveFocusSettings(workMinutes, breakMinutes) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ workMinutes, breakMinutes }));
    } catch {
        // storage unavailable — settings just won't persist across visits
    }
}
