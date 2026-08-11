'use client';

import { useEffect, useState } from 'react';
import { playChime } from 'lib/chime';
import {
    loadFocusSettings,
    MAX_BREAK_MINUTES,
    MAX_WORK_MINUTES,
    MIN_BREAK_MINUTES,
    MIN_WORK_MINUTES,
    saveFocusSettings
} from 'lib/focus-settings';
import { notify, requestNotificationPermission } from 'lib/notify';
import { pauseForBreak, resumeForWork } from 'lib/spotify';
import { formatClock, useFocusTimer } from 'lib/use-focus-timer';

const PHASE_LABEL = { work: 'Focus', break: 'Break' };

export function FocusTimerPanel({ classLabel }) {
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
            if (next === 'break') pauseForBreak();
            else resumeForWork();
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

    function handleWorkMinutesChange(e) {
        const minutes = Number(e.target.value);
        if (!minutes || minutes < MIN_WORK_MINUTES || minutes > MAX_WORK_MINUTES) return;
        setWorkSeconds(minutes * 60);
        saveFocusSettings(minutes, Math.round(breakSeconds / 60));
    }

    function handleBreakMinutesChange(e) {
        const minutes = Number(e.target.value);
        if (!minutes || minutes < MIN_BREAK_MINUTES || minutes > MAX_BREAK_MINUTES) return;
        setBreakSeconds(minutes * 60);
        saveFocusSettings(Math.round(workSeconds / 60), minutes);
    }

    const progress = 1 - remaining / (phase === 'work' ? workSeconds : breakSeconds);

    return (
        <div className="flex flex-col items-center gap-6 px-6 py-10 border bg-surface border-edge rounded-xl">
            <div className="flex flex-wrap items-end justify-center gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Focus minutes
                    <input
                        type="number"
                        className="input w-24"
                        min={MIN_WORK_MINUTES}
                        max={MAX_WORK_MINUTES}
                        value={Math.round(workSeconds / 60)}
                        onChange={handleWorkMinutesChange}
                        disabled={running}
                    />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Break minutes
                    <input
                        type="number"
                        className="input w-24"
                        min={MIN_BREAK_MINUTES}
                        max={MAX_BREAK_MINUTES}
                        value={Math.round(breakSeconds / 60)}
                        onChange={handleBreakMinutesChange}
                        disabled={running}
                    />
                </label>
            </div>
            {running && <p className="-mt-2 text-xs text-muted">Pause to change session lengths.</p>}

            <div className="flex flex-col items-center gap-1">
                <span
                    className={[
                        'px-3 py-1 text-sm font-semibold rounded-full',
                        phase === 'work'
                            ? 'bg-accent-soft text-accent'
                            : 'bg-green-500/10 text-green-600 dark:text-green-300'
                    ].join(' ')}
                >
                    {PHASE_LABEL[phase]}
                    {classLabel && phase === 'work' ? ` · ${classLabel}` : ''}
                </span>
                <span className="font-mono text-6xl font-black tabular-nums tracking-tight sm:text-7xl">
                    {formatClock(remaining)}
                </span>
                <span className="text-sm text-muted">
                    {cycles} {cycles === 1 ? 'session' : 'sessions'} completed
                </span>
            </div>

            <div
                className="w-full h-2 overflow-hidden rounded-full bg-surface-hover"
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
            >
                <div
                    className={[
                        'h-full rounded-full transition-all',
                        phase === 'work' ? 'bg-accent' : 'bg-green-500'
                    ].join(' ')}
                    style={{ width: `${Math.min(Math.max(progress * 100, 0), 100)}%` }}
                />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {!running ? (
                    <button type="button" className="btn btn-lg" onClick={handleStart}>
                        Start
                    </button>
                ) : (
                    <button type="button" className="btn btn-lg" onClick={pause}>
                        Pause
                    </button>
                )}
                <button type="button" className="btn btn-ghost btn-lg" onClick={skip}>
                    Skip to {phase === 'work' ? 'break' : 'focus'}
                </button>
                <button type="button" className="btn btn-ghost btn-lg" onClick={reset}>
                    Reset
                </button>
            </div>
        </div>
    );
}
