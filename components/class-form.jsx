'use client';

import { useState } from 'react';
import { DAY_LABELS_SHORT, WEEK_DAYS } from 'lib/dates';

function initialState(cls) {
    if (!cls) {
        return {
            name: '',
            location: '',
            days: [],
            sameTimes: true,
            startTime: '09:00',
            endTime: '10:00',
            perDay: {}
        };
    }
    const days = [...new Set(cls.meetings.map((m) => m.day))];
    const uniqueTimes = new Set(cls.meetings.map((m) => `${m.startTime}|${m.endTime ?? ''}`));
    const sameTimes = uniqueTimes.size <= 1;
    const perDay = {};
    for (const m of cls.meetings) {
        perDay[m.day] = { startTime: m.startTime, endTime: m.endTime ?? '' };
    }
    const first = cls.meetings[0];
    return {
        name: cls.name,
        location: cls.location ?? '',
        days,
        sameTimes,
        startTime: first?.startTime ?? '09:00',
        endTime: first?.endTime ?? '10:00',
        perDay
    };
}

export function ClassForm({ cls, onSubmit, onCancel }) {
    const [form, setForm] = useState(() => initialState(cls));

    function toggleDay(day) {
        setForm((f) => ({
            ...f,
            days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
            perDay: f.perDay[day] ? f.perDay : { ...f.perDay, [day]: { startTime: f.startTime, endTime: f.endTime } }
        }));
    }

    function setPerDay(day, field, value) {
        setForm((f) => ({ ...f, perDay: { ...f.perDay, [day]: { ...f.perDay[day], [field]: value } } }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const meetings = form.days
            .map((day) => {
                const times = form.sameTimes
                    ? { startTime: form.startTime, endTime: form.endTime }
                    : (form.perDay[day] ?? { startTime: form.startTime, endTime: form.endTime });
                if (!times.startTime) return null;
                return { day, startTime: times.startTime, endTime: times.endTime || null };
            })
            .filter(Boolean);
        onSubmit({ name: form.name.trim(), location: form.location.trim(), meetings });
    }

    const orderedSelectedDays = WEEK_DAYS.filter((d) => form.days.includes(d));

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
                Class name
                <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Math"
                    required
                    autoFocus
                />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
                Location <span className="font-normal text-muted">(optional)</span>
                <input
                    className="input"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Room 204"
                />
            </label>

            <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">Days</legend>
                <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                        const selected = form.days.includes(day);
                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                aria-pressed={selected}
                                className={[
                                    'min-h-11 px-3.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors',
                                    selected
                                        ? 'bg-accent text-accent-foreground border-accent'
                                        : 'bg-surface text-muted border-edge hover:bg-surface-hover'
                                ].join(' ')}
                            >
                                {DAY_LABELS_SHORT[day]}
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            {form.days.length > 1 && (
                <label className="flex items-center gap-2 min-h-11 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-5 h-5 cursor-pointer accent-accent"
                        checked={form.sameTimes}
                        onChange={(e) => setForm((f) => ({ ...f, sameTimes: e.target.checked }))}
                    />
                    Same time every day
                </label>
            )}

            {form.days.length > 0 &&
                (form.sameTimes ? (
                    <div className="flex gap-3">
                        <label className="flex flex-col gap-1.5 text-sm font-medium grow">
                            Starts
                            <input
                                type="time"
                                className="input"
                                value={form.startTime}
                                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm font-medium grow">
                            Ends
                            <input
                                type="time"
                                className="input"
                                value={form.endTime}
                                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {orderedSelectedDays.map((day) => (
                            <div key={day} className="flex items-center gap-3">
                                <span className="w-10 text-sm font-medium">{DAY_LABELS_SHORT[day]}</span>
                                <input
                                    type="time"
                                    className="input"
                                    aria-label={`${DAY_LABELS_SHORT[day]} start time`}
                                    value={form.perDay[day]?.startTime ?? ''}
                                    onChange={(e) => setPerDay(day, 'startTime', e.target.value)}
                                    required
                                />
                                <input
                                    type="time"
                                    className="input"
                                    aria-label={`${DAY_LABELS_SHORT[day]} end time`}
                                    value={form.perDay[day]?.endTime ?? ''}
                                    onChange={(e) => setPerDay(day, 'endTime', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                ))}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn">
                    {cls ? 'Save changes' : 'Add class'}
                </button>
            </div>
        </form>
    );
}
