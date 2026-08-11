'use client';

import { useEffect, useState } from 'react';

// A ticking "current time" — 30s resolution is plenty for minute-level countdowns.
export function useNow(intervalMs = 30000) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return now;
}
