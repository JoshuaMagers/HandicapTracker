// Golf Handicap Tracker - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    registerServiceWorker();
});

// Register service worker for PWA functionality
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

async function initApp() {
    console.log('🏌️ Golf Handicap Tracker initializing...');
    
    // Initialize authentication first
    if (window.GolfAuth) {
        window.GolfAuth.initAuth();
    }
    
    // Initialize cloud sync
    if (window.CloudSync) {
        window.CloudSync.initCloudSync();
    }
    
    // Wait a moment for auth state to be determined
    setTimeout(() => {
        // Only initialize app features if user is authenticated
        if (window.GolfAuth && window.GolfAuth.isAuthenticated()) {
            initAppFeatures();
        }
    }, 1000);
    
    console.log('💡 Try: addDemoData() to add sample rounds for testing');
}

function initAppFeatures() {
    setupEventListeners();
    updateDashboard();
    displayRecentRounds();
    setDefaultDate();
    addSwipeToDelete();
    
    // Initialize component enhancements
    if (window.ScorecardUtils) {
        window.ScorecardUtils.initScorecardEnhancements();
    }
    if (window.DashboardUtils) {
        window.DashboardUtils.displayAchievements();
        window.DashboardUtils.addTrendIndicators();
    }
    
    // Load user data from cloud
    if (window.CloudSync) {
        window.CloudSync.loadUserData().then(() => {
            // Refresh UI after loading cloud data
            updateDashboard();
            displayRecentRounds();
            
            // Start real-time sync
            window.CloudSync.startRealtimeSync();
        });
    }
    
    console.log('🏌️ Golf Handicap Tracker app features initialized!');
}

function setupEventListeners() {
    const scoreForm = document.getElementById('score-form');
    if (scoreForm) {
        scoreForm.addEventListener('submit', handleScoreSubmit);
    }
    
    const roundsSort = document.getElementById('rounds-sort');
    if (roundsSort) {
        roundsSort.addEventListener('change', handleSortChange);
    }
}

function setDefaultDate() {
    const dateInput = document.getElementById('date-played');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
}

function handleScoreSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const roundData = {
        courseName: formData.get('courseName').trim(),
        datePlayed: formData.get('datePlayed'),
        score: formData.get('score'),
        courseRating: formData.get('courseRating'),
        slopeRating: formData.get('slopeRating')
    };
    
    // Validate the data
    if (!validateRoundData(roundData)) {
        return;
    }
    
    // Save the round
    const savedRound = window.GolfStorage.saveRound(roundData);
    
    if (savedRound) {
        // Clear the form
        event.target.reset();
        setDefaultDate();
        
        // Update the display
        updateDashboard();
        displayRecentRounds();
        
        // Show success feedback
        showNotification('Round added successfully!', 'success');
    } else {
        showNotification('Error saving round. Please try again.', 'error');
    }
}

function validateRoundData(data) {
    if (!data.courseName) {
        showNotification('Please enter a course name.', 'error');
        return false;
    }
    
    if (!data.datePlayed) {
        showNotification('Please select a date.', 'error');
        return false;
    }
    
    const score = parseInt(data.score);
    if (!score || score < 50 || score > 150) {
        showNotification('Please enter a valid score between 50 and 150.', 'error');
        return false;
    }
    
    return true;
}

function updateDashboard() {
    const handicap = window.GolfStorage.getHandicap();
    const stats = window.GolfStorage.getStats();
    
    // Update handicap display
    const handicapElement = document.getElementById('current-handicap');
    if (handicapElement) {
        handicapElement.textContent = handicap !== null ? handicap.toFixed(1) : '--';
    }
    
    // Update statistics
    const roundsElement = document.getElementById('rounds-played');
    if (roundsElement) {
        roundsElement.textContent = stats.roundsPlayed;
    }
    
    const bestScoreElement = document.getElementById('best-score');
    if (bestScoreElement) {
        bestScoreElement.textContent = stats.bestScore || '--';
    }
    
    const averageElement = document.getElementById('recent-average');
    if (averageElement) {
        averageElement.textContent = stats.averageScore || '--';
    }
    
    // Update header stats
    updateHeaderStats(handicap, stats);
}

function updateHeaderStats(handicap, stats) {
    const headerStats = document.getElementById('header-stats');
    if (!headerStats) return;
    
    if (stats.roundsPlayed === 0) {
        headerStats.innerHTML = '<small>Ready to track your first round!</small>';
        return;
    }
    
    const handicapText = handicap !== null ? `HC: ${handicap.toFixed(1)}` : 'HC: --';
    const roundsText = `${stats.roundsPlayed} round${stats.roundsPlayed !== 1 ? 's' : ''}`;
    
    headerStats.innerHTML = `<small>${handicapText} • ${roundsText}</small>`;
}

function toggleAdvanced() {
    const checkbox = document.getElementById('show-advanced');
    const slopeField = document.getElementById('slope-field');
    
    if (checkbox.checked) {
        slopeField.style.display = 'block';
    } else {
        slopeField.style.display = 'none';
        // Reset to default when hiding
        document.getElementById('slope-rating').value = '113';
    }
}

function displayRecentRounds() {
    const rounds = window.GolfStorage.getRounds();
    const roundsList = document.getElementById('rounds-list');
    
    if (!roundsList) return;
    
    if (rounds.length === 0) {
        roundsList.innerHTML = '<p class="no-rounds">No rounds recorded yet. Add your first round above!</p>';
        return;
    }
    
    // Get current sort preference
    const sortSelect = document.getElementById('rounds-sort');
    const sortBy = sortSelect ? sortSelect.value : 'newest';
    
    // Sort rounds based on selection
    const sortedRounds = sortRounds(rounds, sortBy);
    
    roundsList.innerHTML = sortedRounds.map(round => createRoundHTML(round)).join('');
}

function sortRounds(rounds, sortBy) {
    const roundsCopy = [...rounds];
    
    switch (sortBy) {
        case 'newest':
            return roundsCopy.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
        case 'oldest':
            return roundsCopy.sort((a, b) => new Date(a.datePlayed) - new Date(b.datePlayed));
        case 'best':
            return roundsCopy.sort((a, b) => a.score - b.score);
        case 'worst':
            return roundsCopy.sort((a, b) => b.score - a.score);
        default:
            return roundsCopy;
    }
}

function handleSortChange() {
    displayRecentRounds();
}

function createRoundHTML(round) {
    const date = new Date(round.datePlayed).toLocaleDateString();
    const differential = ((round.score - round.courseRating) * 113 / round.slopeRating).toFixed(1);
    const strokesOverPar = round.score - round.courseRating;
    
    // Simplified display - only show slope if it's not standard (113)
    const slopeText = round.slopeRating !== 113 ? ` • Slope ${round.slopeRating}` : '';
    
    return `
        <div class="round-item" data-round-id="${round.id}">
            <div class="round-item-header">
                <span class="round-course">${round.courseName}</span>
                <span class="round-score">${round.score}</span>
            </div>
            <div class="round-details">
                ${date} • Par ${round.courseRating}${slopeText} • ${strokesOverPar > 0 ? '+' : ''}${strokesOverPar} strokes
            </div>
            <div class="round-actions">
                <button class="btn-secondary" onclick="viewRound('${round.id}')">📋 View</button>
                <button class="btn-primary" onclick="editRound('${round.id}')">✏️ Edit</button>
                <button class="btn-danger" onclick="deleteRound('${round.id}')">🗑️ Delete</button>
            </div>
        </div>
    `;
}

function deleteRound(roundId) {
    if (confirm('Are you sure you want to delete this round?')) {
        const success = window.GolfStorage.deleteRound(roundId);
        
        if (success) {
            updateDashboard();
            displayRecentRounds();
            showNotification('Round deleted successfully.', 'success');
        } else {
            showNotification('Error deleting round.', 'error');
        }
    }
}

function viewRound(roundId) {
    const rounds = window.GolfStorage.getRounds();
    const round = rounds.find(r => r.id === roundId);
    
    if (!round) {
        showNotification('Round not found.', 'error');
        return;
    }
    
    const date = new Date(round.datePlayed).toLocaleDateString();
    const differential = ((round.score - round.courseRating) * 113 / round.slopeRating).toFixed(1);
    const strokesOverPar = round.score - round.courseRating;
    const courseHandicap = window.HandicapUtils ? 
        window.HandicapUtils.calculateCourseHandicap(
            window.GolfStorage.getHandicap(), 
            round.slopeRating, 
            round.courseRating, 
            round.courseRating
        ) : null;
    
    // Calculate round rank among all rounds
    const allScores = rounds.map(r => r.score).sort((a, b) => a - b);
    const rank = allScores.indexOf(round.score) + 1;
    const totalRounds = rounds.length;
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>📋 Round Details</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="round-detail-grid">
                        <div class="detail-item">
                            <label>Course:</label>
                            <span>${round.courseName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date:</label>
                            <span>${date}</span>
                        </div>
                        <div class="detail-item">
                            <label>Score:</label>
                            <span class="score-highlight">${round.score}</span>
                        </div>
                        <div class="detail-item">
                            <label>Strokes Over Par:</label>
                            <span style="color: ${strokesOverPar <= 0 ? '#4CAF50' : strokesOverPar <= 10 ? '#FF9800' : '#f44336'}">${strokesOverPar > 0 ? '+' : ''}${strokesOverPar}</span>
                        </div>
                        <div class="detail-item">
                            <label>Course Rating:</label>
                            <span>${round.courseRating}</span>
                        </div>
                        <div class="detail-item">
                            <label>Slope Rating:</label>
                            <span>${round.slopeRating}</span>
                        </div>
                        <div class="detail-item">
                            <label>Score Differential:</label>
                            <span>${differential}</span>
                        </div>
                        <div class="detail-item">
                            <label>Round Rank:</label>
                            <span>${rank} of ${totalRounds} rounds</span>
                        </div>
                        ${courseHandicap !== null ? `
                        <div class="detail-item">
                            <label>Course Handicap:</label>
                            <span>${courseHandicap}</span>
                        </div>
                        ` : ''}
                        ${round.lastModified ? `
                        <div class="detail-item">
                            <label>Last Modified:</label>
                            <span style="font-size: 0.8rem; color: #4a5568;">${new Date(round.lastModified).toLocaleDateString()}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="editRound('${round.id}'); closeModal();">✏️ Edit Round</button>
                    <button class="btn-danger" onclick="if(confirm('Delete this round?')) { deleteRound('${round.id}'); closeModal(); }">🗑️ Delete</button>
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function editRound(roundId) {
    const rounds = window.GolfStorage.getRounds();
    const round = rounds.find(r => r.id === roundId);
    
    if (!round) {
        showNotification('Round not found.', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>✏️ Edit Round</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="edit-round-form">
                        <div class="form-group">
                            <label for="edit-course-name">Course Name:</label>
                            <input type="text" id="edit-course-name" name="courseName" value="${round.courseName}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-date-played">Date Played:</label>
                            <input type="date" id="edit-date-played" name="datePlayed" value="${round.datePlayed}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-score-input">Your Score:</label>
                            <input type="number" id="edit-score-input" name="score" value="${round.score}" min="50" max="150" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-course-rating">Course Rating (Par):</label>
                            <input type="number" id="edit-course-rating" name="courseRating" value="${round.courseRating}" min="60" max="80" step="0.1">
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-slope-rating">Slope Rating:</label>
                            <input type="number" id="edit-slope-rating" name="slopeRating" value="${round.slopeRating}" min="55" max="155">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="saveEditedRound('${round.id}')">💾 Save Changes</button>
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function saveEditedRound(roundId) {
    const form = document.getElementById('edit-round-form');
    const formData = new FormData(form);
    
    const updatedData = {
        courseName: formData.get('courseName').trim(),
        datePlayed: formData.get('datePlayed'),
        score: formData.get('score'),
        courseRating: formData.get('courseRating'),
        slopeRating: formData.get('slopeRating')
    };
    
    // Validate the data
    if (!validateRoundData(updatedData)) {
        return;
    }
    
    // Update the round
    const success = window.GolfStorage.updateRound(roundId, updatedData);
    
    if (success) {
        closeModal();
        updateDashboard();
        displayRecentRounds();
        showNotification('Round updated successfully!', 'success');
    } else {
        showNotification('Error updating round. Please try again.', 'error');
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Add keyboard support for modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            closeModal();
        }
    }
});

// Add swipe-to-delete functionality for mobile
function addSwipeToDelete() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.round-item')) {
            startX = e.touches[0].clientX;
            isDragging = true;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diffX = startX - currentX;
        
        if (diffX > 50) { // Swiped left
            const roundItem = e.target.closest('.round-item');
            if (roundItem) {
                roundItem.style.transform = `translateX(-${Math.min(diffX - 50, 100)}px)`;
                roundItem.style.opacity = Math.max(1 - (diffX - 50) / 100, 0.3);
            }
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const roundItem = e.target.closest('.round-item');
        if (roundItem) {
            const diffX = startX - currentX;
            
            if (diffX > 150) { // Swipe threshold for delete
                const roundId = roundItem.dataset.roundId;
                if (roundId && confirm('Delete this round?')) {
                    deleteRound(roundId);
                }
            }
            
            // Reset transform
            roundItem.style.transform = '';
            roundItem.style.opacity = '';
        }
    });
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Make functions available globally
window.deleteRound = deleteRound;
window.viewRound = viewRound;
window.editRound = editRound;
window.saveEditedRound = saveEditedRound;
window.closeModal = closeModal;
window.handleSortChange = handleSortChange;
window.toggleAdvanced = toggleAdvanced;

// Demo data function for testing (can be removed in production)
window.addDemoData = function() {
    const demoRounds = [
        {
            courseName: "Augusta National",
            datePlayed: "2025-07-20",
            score: 88,
            courseRating: 72.0,
            slopeRating: 113
        },
        {
            courseName: "Pebble Beach",
            datePlayed: "2025-07-15",
            score: 92,
            courseRating: 72.8,
            slopeRating: 129
        },
        {
            courseName: "St. Andrews Old Course",
            datePlayed: "2025-07-10",
            score: 85,
            courseRating: 72.1,
            slopeRating: 122
        },
        {
            courseName: "Torrey Pines",
            datePlayed: "2025-07-05",
            score: 90,
            courseRating: 74.6,
            slopeRating: 137
        }
    ];
    
    demoRounds.forEach(round => {
        window.GolfStorage.saveRound(round);
    });
    
    updateDashboard();
    displayRecentRounds();
    showNotification('Demo data added! You can now test the round management features.', 'success');
};