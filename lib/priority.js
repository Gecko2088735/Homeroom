import { homeworkDueAt } from './dates';

export const PRIORITIES = ['high', 'normal', 'low'];
export const PRIORITY_LABELS = { high: 'High priority', normal: 'Normal priority', low: 'Low priority' };
const PRIORITY_RANK = { high: 0, normal: 1, low: 2 };

export function sortHomeworkByPriority(list) {
    return [...list].sort((a, b) => {
        const rankDiff = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
        return rankDiff !== 0 ? rankDiff : homeworkDueAt(a) - homeworkDueAt(b);
    });
}
