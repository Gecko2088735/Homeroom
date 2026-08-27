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

// Total points: earned over possible across every graded item, not an average-of-percentages —
// matches how most "total points" gradebooks compute it.
function totalPointsPercentage(homeworkForClass) {
    const graded = homeworkForClass.filter(isGraded);
    if (graded.length === 0) return null;
    const earned = graded.reduce((sum, hw) => sum + hw.grade.earned, 0);
    const possible = graded.reduce((sum, hw) => sum + hw.grade.possible, 0);
    return possible > 0 ? (earned / possible) * 100 : null;
}

// Weighted categories: each category's own total-points percentage, blended by its weight —
// mirrors how Classroom itself calculates a "weighted by category" overall grade. Falls back to
// the plain total-points calculation when the class isn't weighted, or a category has no graded
// work yet (an empty category contributes nothing rather than counting as 0%).
function weightedCategoryPercentage(cls, homeworkForClass) {
    let weightedSum = 0;
    let weightUsed = 0;
    for (const category of cls.gradeCategories) {
        const inCategory = homeworkForClass.filter((hw) => hw.gradeCategoryId === category.id);
        const pct = totalPointsPercentage(inCategory);
        if (pct === null) continue;
        weightedSum += pct * category.weight;
        weightUsed += category.weight;
    }
    return weightUsed > 0 ? weightedSum / weightUsed : null;
}

// Overall percentage for a class. Classes synced from Classroom with weighted grading configured
// use that weighting; everything else (manual classes, or total-points Classroom classes) uses
// straight total points.
export function classPercentage(cls, homeworkForClass) {
    if (cls?.calculationType === 'WEIGHTED_CATEGORIES' && cls.gradeCategories?.length > 0) {
        const weighted = weightedCategoryPercentage(cls, homeworkForClass);
        if (weighted !== null) return weighted;
    }
    return totalPointsPercentage(homeworkForClass);
}

export function formatPercentage(pct) {
    return `${Math.round(pct)}%`;
}
