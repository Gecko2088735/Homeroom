'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { playChime } from './chime';
import { logCompletedSession } from './focus-log';
import { loadFocusSettings, saveFocusSettings } from './focus-settings';
import { notify, requestNotificationPermission } from './notify';
import { useFocusTimer } from './use-focus-timer';

const PHASE_LABEL = { work: 'Focus', break: 'Break' };

const FocusContext = createContext(null);

// Mounted once at the layout root so the timer keeps running (and stays in sync between the
// /focus page and the home screen's mini widget) no matter which page is currently displayed.
export function FocusProvider({ children }) {
    const [notifyReady, setNotifyReady] = useState(false);

    const {
        phase,
        remaining,
        running,
        cycles,
        workSeconds,
        breakSeconds,
        start,
        pause,
        reset,
        skip,
        setWorkSeconds,
        setBreakSeconds
    } = useFocusTimer({
        onPhaseChange(next) {
            playChime();
            const minutes = Math.round((next === 'work' ? workSeconds : breakSeconds) / 60);
            notify(
                PHASE_LABEL[next],
                next === 'work'
                    ? `Back to work — ${minutes} minute${minutes === 1 ? '' : 's'} on the clock.`
                    : `Break time! Step away for ${minutes} minute${minutes === 1 ? '' : 's'}.`
            );
            if (next === 'break') logCompletedSession();
        }
    });

    useEffect(() => {
        const saved = loadFocusSettings();
        if (saved) {
            // Settings load client-side after mount (localStorage isn't available during
            // SSR/prerender); this only ever runs once, before the timer has been started.
            setWorkSeconds(saved.workMinutes * 60);
            setBreakSeconds(saved.breakMinutes * 60);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
    }, []);

    useEffect(() => {
        if (notifyReady) requestNotificationPermission();
    }, [notifyReady]);

    function handleStart() {
        setNotifyReady(true);
        start();
    }

    function updateWorkMinutes(minutes) {
        setWorkSeconds(minutes * 60);
        saveFocusSettings(minutes, Math.round(breakSeconds / 60));
    }

    function updateBreakMinutes(minutes) {
        setBreakSeconds(minutes * 60);
        saveFocusSettings(Math.round(workSeconds / 60), minutes);
    }

    const value = {
        phase,
        remaining,
        running,
        cycles,
        workSeconds,
        breakSeconds,
        start: handleStart,
        pause,
        reset,
        skip,
        updateWorkMinutes,
        updateBreakMinutes
    };

    return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocusContext() {
    const ctx = useContext(FocusContext);
    if (!ctx) throw new Error('useFocusContext must be used inside <FocusProvider>');
    return ctx;
}
