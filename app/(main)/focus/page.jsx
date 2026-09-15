'use client';

import { useState } from 'react';
import { FocusTimerPanel } from 'components/focus-timer-panel';
import { useStore } from 'lib/store';

export default function FocusPage() {
    const { classes } = useStore();
    const [classId, setClassId] = useState('');
    const cls = classes.find((c) => c.id === classId);

    return (
        <div className="flex flex-col gap-6">
            <h1>Focus</h1>

            {classes.length > 0 && (
                <label className="flex flex-col gap-1.5 text-sm font-medium max-w-xs">
                    Working on <span className="font-normal text-muted">(optional)</span>
                    <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
                        <option value="">No class</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <FocusTimerPanel classLabel={cls?.name} />
        </div>
    );
}
