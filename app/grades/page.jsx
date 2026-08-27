'use client';

import { classColor } from 'lib/colors';
import { formatDueLabel } from 'lib/dates';
import { classPercentage, formatPercentage, isGraded, itemPercentage } from 'lib/grades';
import { useStore } from 'lib/store';

export default function GradesPage() {
    const store = useStore();

    const ungrouped = store.homework.filter((h) => !h.classId && isGraded(h));

    return (
        <div className="flex flex-col gap-6">
            <h1>Grades</h1>

            {!store.ready ? null : store.classes.length === 0 && ungrouped.length === 0 ? (
                <p className="text-muted">
                    Add a class, then enter a score on any homework item to start tracking grades here.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {store.classes.map((cls) => (
                        <ClassGrades key={cls.id} cls={cls} homework={store.homework.filter((h) => h.classId === cls.id)} />
                    ))}
                    {ungrouped.length > 0 && <ClassGrades cls={null} homework={ungrouped} />}
                </div>
            )}
        </div>
    );
}

function ClassGrades({ cls, homework }) {
    const graded = homework.filter(isGraded).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const percentage = classPercentage(homework);
    const color = cls ? classColor(cls.color) : null;

    return (
        <div
            className={[
                'flex flex-col gap-3 px-5 py-5 border-y border-r bg-surface border-edge rounded-xl border-l-4',
                color ? color.border : 'border-edge'
            ].join(' ')}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {color && <span className={['w-2.5 h-2.5 rounded-full shrink-0', color.dot].join(' ')} aria-hidden="true" />}
                    <h3>{cls ? cls.name : 'Other'}</h3>
                </div>
                {percentage !== null && (
                    <span className="px-2.5 py-1 text-sm font-bold rounded-full bg-accent-soft text-accent">
                        {formatPercentage(percentage)}
                    </span>
                )}
            </div>

            {graded.length === 0 ? (
                <p className="text-sm text-muted italic">No grades yet — add a score when editing homework.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {graded.map((hw) => (
                        <div key={hw.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate">{hw.title}</span>
                            <span className="flex items-center gap-2 shrink-0 text-muted">
                                {formatDueLabel(hw)}
                                <span className="font-semibold text-foreground">
                                    {hw.grade.earned}/{hw.grade.possible} ({formatPercentage(itemPercentage(hw))})
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
