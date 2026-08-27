import { startOfWeek } from './dates';

const KEY = 'homeroom:focus-log';
const MAX_ENTRIES = 500;

function readLog() {
    try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function logCompletedSession() {
    try {
        const log = readLog();
        log.push(new Date().toISOString());
        localStorage.setItem(KEY, JSON.stringify(log.slice(-MAX_ENTRIES)));
    } catch {
        // storage unavailable — streak just won't persist
    }
}

export function sessionCounts(now) {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = startOfWeek(now);
    let today = 0;
    let week = 0;
    for (const iso of readLog()) {
        const at = new Date(iso);
        if (at >= weekStart) week += 1;
        if (at >= todayStart) today += 1;
    }
    return { today, week };
}
