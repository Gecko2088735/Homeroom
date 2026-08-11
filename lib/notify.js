'use client';

export function notificationsSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission() {
    if (!notificationsSupported()) return 'unsupported';
    if (Notification.permission === 'default') return Notification.requestPermission();
    return Notification.permission;
}

export function notify(title, body) {
    if (!notificationsSupported() || Notification.permission !== 'granted') return;
    try {
        new Notification(title, { body, icon: '/favicon.svg' });
    } catch {
        // some browsers throw if the page isn't visible/focused in certain states — non-fatal
    }
}
