// Dashboard Component Utilities for Golf Handicap Tracker

// Create and update dashboard statistics
function createDashboard() {
    const dashboardElement = document.getElementById('dashboard');
    if (!dashboardElement) return;

    const stats = window.GolfStorage.getStats();
    const handicap = window.GolfStorage.getHandicap();

    const dashboardHTML = `
        <h2>Your Golf Stats</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Current Handicap</h3>
                <span id="current-handicap" class="handicap-value">
                    ${handicap !== null ? handicap.toFixed(1) : '--'}
                </span>
            </div>
            <div class="stat-card">
                <h3>Rounds Played</h3>
                <span id="rounds-played" class="stat-value">${stats.roundsPlayed}</span>
            </div>
            <div class="stat-card">
                <h3>Best Score</h3>
                <span id="best-score" class="stat-value">${stats.bestScore || '--'}</span>
            </div>
            <div class="stat-card">
                <h3>Recent Average</h3>
                <span id="recent-average" class="stat-value">${stats.averageScore || '--'}</span>
            </div>
        </div>
    `;

    dashboardElement.innerHTML = dashboardHTML;
}

// Update individual stat values
function updateDashboardStats() {
    const stats = window.GolfStorage.getStats();
    const handicap = window.GolfStorage.getHandicap();

    const elements = {
        handicap: document.getElementById('current-handicap'),
        rounds: document.getElementById('rounds-played'),
        best: document.getElementById('best-score'),
        average: document.getElementById('recent-average')
    };

    if (elements.handicap) {
        elements.handicap.textContent = handicap !== null ? handicap.toFixed(1) : '--';
        elements.handicap.style.color = handicap !== null ? '#4CAF50' : '#999';
    }

    if (elements.rounds) {
        elements.rounds.textContent = stats.roundsPlayed;
    }

    if (elements.best) {
        elements.best.textContent = stats.bestScore || '--';
    }

    if (elements.average) {
        elements.average.textContent = stats.averageScore || '--';
    }
}

// Add trend indicators
function addTrendIndicators() {
    const rounds = window.GolfStorage.getRounds();
    if (rounds.length < 2) return;

    const recentScores = rounds.slice(0, 3).map(r => r.score);
    const olderScores = rounds.slice(3, 6).map(r => r.score);

    if (olderScores.length === 0) return;

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const trend = recentAvg < olderAvg ? 'improving' : recentAvg > olderAvg ? 'declining' : 'stable';
    
    const averageElement = document.getElementById('recent-average');
    if (averageElement && averageElement.parentNode) {
        const trendIndicator = document.createElement('div');
        trendIndicator.className = `trend-indicator trend-${trend}`;
        trendIndicator.innerHTML = `
            <small>
                ${trend === 'improving' ? '↗️ Improving' : 
                  trend === 'declining' ? '↘️ Declining' : 
                  '→ Stable'}
            </small>
        `;
        trendIndicator.style.cssText = `
            font-size: 0.8rem;
            margin-top: 0.25rem;
            color: ${trend === 'improving' ? '#4CAF50' : 
                    trend === 'declining' ? '#f44336' : '#666'};
        `;
        
        // Remove existing trend indicator
        const existing = averageElement.parentNode.querySelector('.trend-indicator');
        if (existing) existing.remove();
        
        averageElement.parentNode.appendChild(trendIndicator);
    }
}

// Get achievement badges
function getAchievements() {
    const stats = window.GolfStorage.getStats();
    const rounds = window.GolfStorage.getRounds();
    const handicap = window.GolfStorage.getHandicap();
    
    const achievements = [];
    
    if (stats.roundsPlayed >= 1) achievements.push({ name: 'First Round', icon: '🏌️' });
    if (stats.roundsPlayed >= 10) achievements.push({ name: '10 Rounds', icon: '🎯' });
    if (stats.roundsPlayed >= 20) achievements.push({ name: 'Veteran Player', icon: '🏆' });
    if (handicap !== null && handicap < 20) achievements.push({ name: 'Single Digit Handicap', icon: '⭐' });
    if (handicap !== null && handicap < 10) achievements.push({ name: 'Single Digit', icon: '🌟' });
    if (stats.bestScore && stats.bestScore < 80) achievements.push({ name: 'Sub-80 Round', icon: '🔥' });
    if (stats.bestScore && stats.bestScore < 90) achievements.push({ name: 'Sub-90 Round', icon: '💪' });
    
    return achievements;
}

// Display achievements
function displayAchievements() {
    const achievements = getAchievements();
    if (achievements.length === 0) return;
    
    const dashboardElement = document.getElementById('dashboard');
    if (!dashboardElement) return;
    
    let achievementsSection = dashboardElement.querySelector('.achievements-section');
    if (!achievementsSection) {
        achievementsSection = document.createElement('div');
        achievementsSection.className = 'achievements-section';
        achievementsSection.innerHTML = '<h3>Achievements</h3><div class="achievements-list"></div>';
        achievementsSection.style.cssText = `
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
        `;
        dashboardElement.appendChild(achievementsSection);
    }
    
    const achievementsList = achievementsSection.querySelector('.achievements-list');
    if (achievementsList) {
        achievementsList.innerHTML = achievements.map(achievement => `
            <span class="achievement-badge" title="${achievement.name}">
                ${achievement.icon} ${achievement.name}
            </span>
        `).join('');
        
        achievementsList.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        `;
        
        // Style achievement badges
        const badges = achievementsList.querySelectorAll('.achievement-badge');
        badges.forEach(badge => {
            badge.style.cssText = `
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #333;
                padding: 0.25rem 0.5rem;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 500;
                white-space: nowrap;
            `;
        });
    }
}

// Make functions available globally
window.DashboardUtils = {
    createDashboard,
    updateDashboardStats,
    addTrendIndicators,
    displayAchievements
};
                </div>
            ) : (
                <p>Loading handicap data...</p>
            )}
            <h3>Your Scores:</h3>
            {scores.length > 0 ? (
                <ul>
                    {scores.map((score, index) => (
                        <li key={index}>{score}</li>
                    ))}
                </ul>
            ) : (
                <p>No scores available.</p>
            )}
        </div>
    );
};

export default Dashboard;