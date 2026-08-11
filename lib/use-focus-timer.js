'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const WORK_SECONDS = 25 * 60;
export const BREAK_SECONDS = 5 * 60;

function durationFor(phase) {
    return phase === 'work' ? WORK_SECONDS : BREAK_SECONDS;
}

function otherPhase(phase) {
    return phase === 'work' ? 'break' : 'work';
}

// A 25-minute-work / 5-minute-break Pomodoro cycle that auto-advances. onPhaseChange fires
// once per real transition (work->break or break->work) so callers can trigger a chime, a
// browser notification, or pause/resume music.
//
// The live countdown lives in a plain ref, not React state — it's mutated by ordinary,
// synchronous code in the timer callback and in skip/reset, so there's never any ambiguity
// about when a transition "really" happens (unlike a state updater function, which React may
// invoke more than once and must stay side-effect-free). React state (phase/remaining/cycles)
// is just a rendering mirror of the ref, written with plain setValue calls, never updaters.
export function useFocusTimer({ onPhaseChange } = {}) {
    const live = useRef({ phase: 'work', remaining: WORK_SECONDS });
    const [phase, setPhase] = useState('work');
    const [remaining, setRemaining] = useState(WORK_SECONDS);
    const [cycles, setCycles] = useState(0);
    const [running, setRunning] = useState(false);

    const onPhaseChangeRef = useRef(onPhaseChange);
    useEffect(() => {
        onPhaseChangeRef.current = onPhaseChange;
    }, [onPhaseChange]);

    // Stable identity: everything it closes over (the ref, the setState setters) is itself
    // referentially stable across renders, so an empty dependency array is genuinely correct.
    const advanceTo = useCallback((next) => {
        live.current = { phase: next, remaining: durationFor(next) };
        setPhase(next);
        setRemaining(live.current.remaining);
        if (next === 'work') setCycles((c) => c + 1);
        onPhaseChangeRef.current?.(next);
    }, []);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => {
            if (live.current.remaining > 1) {
                live.current.remaining -= 1;
                setRemaining(live.current.remaining);
            } else {
                advanceTo(otherPhase(live.current.phase));
            }
        }, 1000);
        return () => clearInterval(id);
    }, [running, advanceTo]);

    const start = useCallback(() => setRunning(true), []);
    const pause = useCallback(() => setRunning(false), []);
    const reset = useCallback(() => {
        setRunning(false);
        live.current = { phase: 'work', remaining: WORK_SECONDS };
        setPhase('work');
        setRemaining(WORK_SECONDS);
        setCycles(0);
    }, []);
    const skip = useCallback(() => advanceTo(otherPhase(live.current.phase)), [advanceTo]);

    return { phase, remaining, cycles, running, start, pause, reset, skip };
}

export function formatClock(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}
