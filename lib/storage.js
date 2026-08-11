export const DATA_KEY = 'homeroom:data';
export const THEME_KEY = 'homeroom:theme';
export const SCHEMA_VERSION = 1;

export function emptyData() {
    return { schemaVersion: SCHEMA_VERSION, classes: [], homework: [] };
}

export function loadData() {
    let raw;
    try {
        raw = localStorage.getItem(DATA_KEY);
    } catch {
        return emptyData();
    }
    if (!raw) return emptyData();

    try {
        const parsed = JSON.parse(raw);
        if (
            !parsed ||
            typeof parsed !== 'object' ||
            parsed.schemaVersion !== SCHEMA_VERSION ||
            !Array.isArray(parsed.classes) ||
            !Array.isArray(parsed.homework)
        ) {
            throw new Error('unrecognized data shape');
        }
        return parsed;
    } catch {
        // Preserve whatever was there before starting fresh, so nothing is silently lost.
        try {
            localStorage.setItem(`${DATA_KEY}.backup`, raw);
        } catch {
            // ignore — backup is best-effort
        }
        return emptyData();
    }
}

export function saveData(data) {
    try {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
        // storage full or unavailable — app keeps working in memory
    }
}
