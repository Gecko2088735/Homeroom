'use client';

// A short two-tone chime synthesized with the Web Audio API — no external audio asset needed.
export function playChime() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const now = ctx.currentTime;
        [660, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.18;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
            osc.connect(gain).connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.34);
        });
        setTimeout(() => ctx.close(), 900);
    } catch {
        // Web Audio unavailable — silently skip the chime, the notification/UI still update
    }
}
