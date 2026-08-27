'use client';

import { useState } from 'react';
import { toDateInputValue } from 'lib/dates';
import { PRIORITIES } from 'lib/priority';
import { useStore } from 'lib/store';

export function HomeworkForm({ hw, defaultClassId, onSubmit, onCancel }) {
    const { classes } = useStore();
    const [form, setForm] = useState(() => ({
        title: hw?.title ?? '',
        classId: hw?.classId ?? defaultClassId ?? '',
        dueDate: hw?.dueDate ?? toDateInputValue(new Date()),
        dueTime: hw?.dueTime ?? '',
        notes: hw?.notes ?? '',
        priority: hw?.priority ?? 'normal',
        isTest: hw?.isTest ?? false,
        isGroupProject: hw?.isGroupProject ?? false,
        gradeEarned: hw?.grade?.earned?.toString() ?? '',
        gradePossible: hw?.grade?.possible?.toString() ?? ''
    }));

    function handleSubmit(e) {
        e.preventDefault();
        const earned = form.gradeEarned.trim();
        const possible = form.gradePossible.trim();
        const grade = earned !== '' && possible !== '' && Number(possible) > 0
            ? { earned: Number(earned), possible: Number(possible) }
            : null;
        onSubmit({
            title: form.title.trim(),
            classId: form.classId || null,
            dueDate: form.dueDate,
            dueTime: form.dueTime || null,
            notes: form.notes.trim(),
            priority: form.priority,
            isTest: form.isTest,
            isGroupProject: form.isGroupProject,
            grade
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

            <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">Priority</legend>
                <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map((p) => {
                        const selected = form.priority === p;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, priority: p }))}
                                aria-pressed={selected}
                                className={[
                                    'min-h-11 px-3.5 rounded-lg border text-sm font-medium cursor-pointer capitalize transition-colors',
                                    selected
                                        ? 'bg-accent text-accent-foreground border-accent'
                                        : 'bg-surface text-muted border-edge hover:bg-surface-hover'
                                ].join(' ')}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 min-h-11 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-5 h-5 cursor-pointer accent-accent"
                        checked={form.isTest}
                        onChange={(e) => setForm((f) => ({ ...f, isTest: e.target.checked }))}
                    />
                    Test or major project
                </label>
                <label className="flex items-center gap-2 min-h-11 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-5 h-5 cursor-pointer accent-accent"
                        checked={form.isGroupProject}
                        onChange={(e) => setForm((f) => ({ ...f, isGroupProject: e.target.checked }))}
                    />
                    Group project
                </label>
            </div>

            <div className="flex gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium grow">
                    Score <span className="font-normal text-muted">(optional)</span>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        className="input"
                        value={form.gradeEarned}
                        onChange={(e) => setForm((f) => ({ ...f, gradeEarned: e.target.value }))}
                        placeholder="e.g. 18"
                    />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium grow">
                    Out of <span className="font-normal text-muted">(optional)</span>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        className="input"
                        value={form.gradePossible}
                        onChange={(e) => setForm((f) => ({ ...f, gradePossible: e.target.value }))}
                        placeholder="e.g. 20"
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
