'use client';

import { useEffect, useState } from 'react';
import { playChime } from 'lib/chime';
import { notify, requestNotificationPermission } from 'lib/notify';
import { pauseForBreak, resumeForWork } from 'lib/spotify';
import { formatClock, useFocusTimer, WORK_SECONDS } from 'lib/use-focus-timer';

const PHASE_LABEL = { work: 'Focus', break: 'Break' };
const PHASE_MESSAGE = {
    work: 'Back to work — 25 minutes on the clock.',
    break: 'Break time! Step away for 5 minutes.'
};

export function FocusTimerPanel({ classLabel }) {
    const [notifyReady, setNotifyReady] = useState(false);

    const { phase, remaining, running, cycles, start, pause, reset, skip } = useFocusTimer({
        onPhaseChange(next) {
            playChime();
            notify(PHASE_LABEL[next], PHASE_MESSAGE[next]);
            if (next === 'break') pauseForBreak();
            else resumeForWork();
        }
    });

    useEffect(() => {
        if (notifyReady) requestNotificationPermission();
    }, [notifyReady]);

    function handleStart() {
        setNotifyReady(true);
        start();
    }

    const progress = 1 - remaining / (phase === 'work' ? WORK_SECONDS : WORK_SECONDS / 5);

    return (
        <div className="flex flex-col items-center gap-6 px-6 py-10 border bg-surface border-edge rounded-xl">
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
