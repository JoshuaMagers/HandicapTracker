// Storage utilities for Golf Handicap Tracker
const STORAGE_KEY = 'golfHandicapData';

// Initialize default data structure
function getDefaultData() {
    return {
        rounds: [],
        handicap: null,
        stats: {
            roundsPlayed: 0,
            bestScore: null,
            averageScore: null
        }
    };
}

// Save complete data
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Get all data
function getData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : getDefaultData();
    } catch (error) {
        console.error('Error loading data:', error);
        return getDefaultData();
    }
}

// Save a new round
function saveRound(roundData) {
    const data = getData();
    const round = {
        id: Date.now().toString(),
        courseName: roundData.courseName,
        datePlayed: roundData.datePlayed,
        score: parseInt(roundData.score),
        courseRating: parseFloat(roundData.courseRating) || 72,
        slopeRating: parseInt(roundData.slopeRating) || 113,
        timestamp: new Date().toISOString()
    };
    
    data.rounds.unshift(round); // Add to beginning of array
    
    // Keep only last 20 rounds for performance
    if (data.rounds.length > 20) {
        data.rounds = data.rounds.slice(0, 20);
    }
    
    // Update stats
    updateStats(data);
    
    return saveData(data) ? round : null;
}

// Update statistics
function updateStats(data) {
    if (data.rounds.length === 0) {
        data.stats = {
            roundsPlayed: 0,
            bestScore: null,
            averageScore: null
        };
        data.handicap = null;
        return;
    }
    
    const scores = data.rounds.map(round => round.score);
    data.stats.roundsPlayed = data.rounds.length;
    data.stats.bestScore = Math.min(...scores);
    data.stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
    
    // Calculate handicap using most recent scores (up to 8 rounds for basic calculation)
    data.handicap = calculateBasicHandicap(data.rounds.slice(0, 8));
}

// Basic handicap calculation (simplified USGA method)
function calculateBasicHandicap(recentRounds) {
    if (recentRounds.length < 3) return null;
    
    // Calculate differential for each round
    const differentials = recentRounds.map(round => {
        return ((round.score - round.courseRating) * 113) / round.slopeRating;
    });
    
    // Sort and take lowest differentials based on number of rounds
    differentials.sort((a, b) => a - b);
    
    let numToUse;
    if (recentRounds.length <= 5) numToUse = 1;
    else if (recentRounds.length <= 6) numToUse = 2;
    else if (recentRounds.length <= 8) numToUse = 2;
    else numToUse = Math.floor(recentRounds.length * 0.4); // 40% of rounds
    
    const selectedDifferentials = differentials.slice(0, numToUse);
    const averageDifferential = selectedDifferentials.reduce((a, b) => a + b, 0) / selectedDifferentials.length;
    
    return Math.max(0, Math.round(averageDifferential * 0.96 * 10) / 10); // 96% factor
}

// Get all rounds
function getRounds() {
    return getData().rounds;
}

// Get current handicap
function getHandicap() {
    return getData().handicap;
}

// Get statistics
function getStats() {
    return getData().stats;
}

// Delete a round
function deleteRound(roundId) {
    const data = getData();
    data.rounds = data.rounds.filter(round => round.id !== roundId);
    updateStats(data);
    return saveData(data);
}

// Update an existing round
function updateRound(roundId, updatedRoundData) {
    const data = getData();
    const roundIndex = data.rounds.findIndex(round => round.id === roundId);
    
    if (roundIndex === -1) {
        return false; // Round not found
    }
    
    // Update the round with new data while preserving ID and timestamp
    const existingRound = data.rounds[roundIndex];
    data.rounds[roundIndex] = {
        id: existingRound.id,
        courseName: updatedRoundData.courseName,
        datePlayed: updatedRoundData.datePlayed,
        score: parseInt(updatedRoundData.score),
        courseRating: parseFloat(updatedRoundData.courseRating) || 72,
        slopeRating: parseInt(updatedRoundData.slopeRating) || 113,
        timestamp: existingRound.timestamp,
        lastModified: new Date().toISOString()
    };
    
    // Update stats
    updateStats(data);
    
    return saveData(data);
}

// Clear all data
function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    return true;
}

// Export functions for use in other files
window.GolfStorage = {
    saveRound,
    getRounds,
    getHandicap,
    getStats,
    deleteRound,
    updateRound,
    clearAllData,
    getData
};