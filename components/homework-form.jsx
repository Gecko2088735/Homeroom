'use client';

import { useState } from 'react';
import { toDateInputValue } from 'lib/dates';
import { useStore } from 'lib/store';

export function HomeworkForm({ hw, defaultClassId, onSubmit, onCancel }) {
    const { classes } = useStore();
    const [form, setForm] = useState(() => ({
        title: hw?.title ?? '',
        classId: hw?.classId ?? defaultClassId ?? '',
        dueDate: hw?.dueDate ?? toDateInputValue(new Date()),
        dueTime: hw?.dueTime ?? '',
        notes: hw?.notes ?? ''
    }));

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit({
            title: form.title.trim(),
            classId: form.classId || null,
            dueDate: form.dueDate,
            dueTime: form.dueTime || null,
            notes: form.notes.trim()
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
                Title
                <input
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Problem set 3"
                    required
                    autoFocus
                />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
                Class <span className="font-normal text-muted">(optional)</span>
                <select
                    className="input"
                    value={form.classId}
                    onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                >
                    <option value="">No class</option>
                    {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </label>

            <div className="flex gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium grow">
                    Due date
                    <input
                        type="date"
                        className="input"
                        value={form.dueDate}
                        onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                        required
                    />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium grow">
                    Time <span className="font-normal text-muted">(optional)</span>
                    <input
                        type="time"
                        className="input"
                        value={form.dueTime}
                        onChange={(e) => setForm((f) => ({ ...f, dueTime: e.target.value }))}
                    />
                </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
                Notes <span className="font-normal text-muted">(optional)</span>
                <textarea
                    className="input min-h-24 resize-y"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Anything you need to remember"
                />
            </label>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn">
                    {hw ? 'Save changes' : 'Add homework'}
                </button>
            </div>
        </form>
    );
}
