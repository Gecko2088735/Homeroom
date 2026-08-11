'use client';

import { useEffect, useState } from 'react';

const THEME_KEY = 'homeroom:theme';

export function ThemeToggle({ className }) {
    const [theme, setTheme] = useState(null);

    useEffect(() => {
        setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }, []);

    function toggle() {
        const next = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch {
            // storage unavailable (private mode etc.) — theme still applies for this visit
        }
        setTheme(next);
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className={[
                'inline-flex items-center justify-center w-11 h-11 rounded-lg border border-edge bg-surface text-foreground transition-colors hover:bg-surface-hover cursor-pointer',
                className
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}

function SunIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12t-1.463 3.538T12 17ZM2 13q-.425 0-.712-.288T1 12t.288-.712T2 11h2q.425 0 .713.288T5 12t-.288.713T4 13H2Zm18 0q-.425 0-.712-.288T19 12t.288-.712T20 11h2q.425 0 .713.288T23 12t-.288.713T22 13h-2Zm-8-8q-.425 0-.712-.288T11 4V2q0-.425.288-.712T12 1t.713.288T13 2v2q0 .425-.288.713T12 5Zm0 18q-.425 0-.712-.288T11 22v-2q0-.425.288-.712T12 19t.713.288T13 20v2q0 .425-.288.713T12 23ZM5.65 7.05L4.575 6q-.3-.275-.288-.7t.288-.725q.3-.3.725-.3t.7.3L7.05 5.65q.275.3.275.7t-.275.7t-.687.288t-.713-.288Zm12.35 12.375L16.95 18.35q-.275-.3-.275-.712t.275-.688t.688-.275t.712.275L19.425 18q.3.275.288.7t-.288.725q-.3.3-.725.3t-.7-.3ZM16.95 7.05q-.275-.3-.275-.7t.275-.7L18 4.575q.275-.3.7-.288t.725.288q.3.3.3.725t-.3.7L18.35 7.05q-.3.275-.7.275t-.7-.275ZM4.575 19.425q-.3-.3-.3-.725t.3-.7l1.075-1.05q.3-.275.713-.275t.687.275t.275.688t-.275.712L6 19.425q-.275.3-.7.288t-.725-.288Z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M12 21q-3.75 0-6.375-2.625T3 12q0-3.75 2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.75-2.625 6.375T12 21Z" />
        </svg>
    );
}
