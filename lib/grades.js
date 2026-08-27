// Grades are points-based (earned/possible) per homework item — normalizing straight to a
// percentage is what makes classes graded on different scales (out of 20, out of 100, ...)
// comparable to each other, with no extra conversion step needed.

export function isGraded(hw) {
    return !!hw.grade && hw.grade.possible > 0;
}

export function itemPercentage(hw) {
    if (!isGraded(hw)) return null;
    return (hw.grade.earned / hw.grade.possible) * 100;
}

// Overall percentage for a set of homework: total points earned over total points possible,
// not an average-of-percentages — matches how most "total points" gradebooks compute it.
export function classPercentage(homeworkForClass) {
    const graded = homeworkForClass.filter(isGraded);
    if (graded.length === 0) return null;
    const earned = graded.reduce((sum, hw) => sum + hw.grade.earned, 0);
    const possible = graded.reduce((sum, hw) => sum + hw.grade.possible, 0);
    return possible > 0 ? (earned / possible) * 100 : null;
}

export function formatPercentage(pct) {
    return `${Math.round(pct)}%`;
}
