// Golf Handicap Calculation Utilities

// Calculate handicap index using USGA method (simplified)
function calculateHandicap(scores, courseRatings, slopeRatings) {
    if (!Array.isArray(scores) || scores.length === 0) {
        throw new Error("Invalid scores array");
    }
    
    if (scores.length < 3) {
        return null; // Need at least 3 rounds for handicap
    }
    
    // Calculate score differentials
    const differentials = scores.map((score, index) => {
        const courseRating = courseRatings ? courseRatings[index] : 72;
        const slopeRating = slopeRatings ? slopeRatings[index] : 113;
        return ((score - courseRating) * 113) / slopeRating;
    });
    
    // Sort differentials from lowest to highest
    differentials.sort((a, b) => a - b);
    
    // Determine how many differentials to use based on number of scores
    let numDifferentials;
    if (scores.length <= 5) numDifferentials = 1;
    else if (scores.length === 6) numDifferentials = 2;
    else if (scores.length <= 8) numDifferentials = 2;
    else if (scores.length <= 10) numDifferentials = 3;
    else if (scores.length <= 12) numDifferentials = 4;
    else if (scores.length <= 14) numDifferentials = 5;
    else if (scores.length <= 16) numDifferentials = 6;
    else if (scores.length <= 18) numDifferentials = 7;
    else if (scores.length === 19) numDifferentials = 8;
    else numDifferentials = 8; // Maximum for 20 scores
    
    // Calculate average of lowest differentials
    const lowestDifferentials = differentials.slice(0, numDifferentials);
    const averageDifferential = lowestDifferentials.reduce((sum, diff) => sum + diff, 0) / lowestDifferentials.length;
    
    // Apply 96% multiplier and round to nearest tenth
    const handicapIndex = averageDifferential * 0.96;
    
    return Math.max(0, Math.round(handicapIndex * 10) / 10);
}

// Calculate course handicap for a specific course
function calculateCourseHandicap(handicapIndex, slopeRating, courseRating, par) {
    if (handicapIndex === null || handicapIndex === undefined) {
        return null;
    }
    
    const courseHandicap = Math.round((handicapIndex * slopeRating) / 113 + (courseRating - par));
    return Math.max(0, courseHandicap);
}

// Calculate playing handicap (course handicap adjusted for format)
function calculatePlayingHandicap(courseHandicap, handicapAllowance = 1.0) {
    if (courseHandicap === null || courseHandicap === undefined) {
        return null;
    }
    
    return Math.round(courseHandicap * handicapAllowance);
}

// Calculate net score
function calculateNetScore(grossScore, playingHandicap) {
    if (playingHandicap === null || playingHandicap === undefined) {
        return grossScore;
    }
    
    return grossScore - playingHandicap;
}

// Get handicap category (for stroke index purposes)
function getHandicapCategory(handicapIndex) {
    if (handicapIndex === null || handicapIndex === undefined) {
        return null;
    }
    
    if (handicapIndex <= 5.4) return 1;
    if (handicapIndex <= 12.4) return 2;
    if (handicapIndex <= 20.4) return 3;
    if (handicapIndex <= 28.4) return 4;
    return 5;
}

// Validate score for posting
function isValidScoreForPosting(score, courseRating, par) {
    const maxScore = Math.round(courseRating + 20); // Rough maximum
    const minScore = Math.round(par * 0.7); // Rough minimum
    
    return score >= minScore && score <= maxScore;
}

// Make functions available globally
window.HandicapUtils = {
    calculateHandicap,
    calculateCourseHandicap,
    calculatePlayingHandicap,
    calculateNetScore,
    getHandicapCategory,
    isValidScoreForPosting
};