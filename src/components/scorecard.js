// Scorecard Component Utilities for Golf Handicap Tracker

// Enhanced form validation
function validateScoreForm(formData) {
    const errors = [];
    
    if (!formData.courseName.trim()) {
        errors.push('Course name is required');
    }
    
    if (!formData.datePlayed) {
        errors.push('Date is required');
    } else {
        const playedDate = new Date(formData.datePlayed);
        const today = new Date();
        if (playedDate > today) {
            errors.push('Date cannot be in the future');
        }
    }
    
    const score = parseInt(formData.score);
    if (!score || score < 50 || score > 150) {
        errors.push('Score must be between 50 and 150');
    }
    
    const courseRating = parseFloat(formData.courseRating);
    if (!courseRating || courseRating < 60 || courseRating > 80) {
        errors.push('Course rating must be between 60 and 80');
    }
    
    const slopeRating = parseInt(formData.slopeRating);
    if (!slopeRating || slopeRating < 55 || slopeRating > 155) {
        errors.push('Slope rating must be between 55 and 155');
    }
    
    return errors;
}

// Auto-populate course data if previously entered
function setupCourseAutocomplete() {
    const courseInput = document.getElementById('course-name');
    if (!courseInput) return;
    
    // Add popular course presets for new users
    const coursePresets = [
        { name: "Pebble Beach Golf Links", rating: 74.8, slope: 143 },
        { name: "Augusta National Golf Club", rating: 74.7, slope: 137 },
        { name: "Pinehurst No. 2", rating: 75.8, slope: 135 },
        { name: "TPC Sawgrass (Stadium)", rating: 76.0, slope: 144 },
        { name: "Bethpage Black", rating: 77.0, slope: 148 },
        { name: "St. Andrews Old Course", rating: 72.1, slope: 129 },
        { name: "Local Municipal Course", rating: 72.0, slope: 113 },
        { name: "Country Club Course", rating: 71.5, slope: 125 }
    ];
    
    const rounds = window.GolfStorage.getRounds();
    const uniqueCourses = [...new Set(rounds.map(round => round.courseName))];
    
    // Combine user courses with presets
    const allCourses = [...uniqueCourses, ...coursePresets.map(preset => preset.name)];
    const uniqueAllCourses = [...new Set(allCourses)];
    
    // Create datalist for autocomplete
    let datalist = document.getElementById('course-datalist');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'course-datalist';
        courseInput.setAttribute('list', 'course-datalist');
        courseInput.parentNode.appendChild(datalist);
    }
    
    datalist.innerHTML = uniqueAllCourses.map(course => `<option value="${course}">`).join('');
    
    // Auto-fill course details when course is selected
    courseInput.addEventListener('change', function() {
        const selectedCourse = this.value;
        
        // First check user's previous rounds
        const matchingRound = rounds.find(round => round.courseName === selectedCourse);
        
        if (matchingRound) {
            const courseRatingInput = document.getElementById('course-rating');
            const slopeRatingInput = document.getElementById('slope-rating');
            
            if (courseRatingInput) {
                courseRatingInput.value = matchingRound.courseRating;
            }
            if (slopeRatingInput) {
                slopeRatingInput.value = matchingRound.slopeRating;
            }
        } else {
            // Check course presets
            const preset = coursePresets.find(preset => preset.name === selectedCourse);
            if (preset) {
                const courseRatingInput = document.getElementById('course-rating');
                const slopeRatingInput = document.getElementById('slope-rating');
                
                if (courseRatingInput) {
                    courseRatingInput.value = preset.rating;
                }
                if (slopeRatingInput) {
                    slopeRatingInput.value = preset.slope;
                }
            }
        }
    });
}

// Add visual feedback for form fields
function enhanceFormFields() {
    const inputs = document.querySelectorAll('#score-form input');
    
    inputs.forEach(input => {
        // Add real-time validation feedback
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (field.id) {
        case 'course-name':
            if (!value) {
                isValid = false;
                errorMessage = 'Course name is required';
            }
            break;
        case 'score-input':
            const score = parseInt(value);
            if (!score || score < 50 || score > 150) {
                isValid = false;
                errorMessage = 'Score must be between 50 and 150';
            }
            break;
        case 'course-rating':
            const rating = parseFloat(value);
            if (!rating || rating < 60 || rating > 80) {
                isValid = false;
                errorMessage = 'Course rating must be between 60 and 80';
            }
            break;
        case 'slope-rating':
            const slope = parseInt(value);
            if (!slope || slope < 55 || slope > 155) {
                isValid = false;
                errorMessage = 'Slope rating must be between 55 and 155';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#f44336';
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #f44336;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '#e1e5e9';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Calculate and show expected handicap impact
function showHandicapImpact() {
    const scoreInput = document.getElementById('score-input');
    const courseRatingInput = document.getElementById('course-rating');
    const slopeRatingInput = document.getElementById('slope-rating');
    
    if (!scoreInput || !courseRatingInput || !slopeRatingInput) return;
    
    function updateImpact() {
        const score = parseInt(scoreInput.value);
        const courseRating = parseFloat(courseRatingInput.value);
        const slopeRating = parseInt(slopeRatingInput.value);
        
        if (score && courseRating && slopeRating) {
            const differential = ((score - courseRating) * 113) / slopeRating;
            
            let impactElement = document.querySelector('.handicap-impact');
            if (!impactElement) {
                impactElement = document.createElement('div');
                impactElement.className = 'handicap-impact';
                impactElement.style.cssText = `
                    background: #f0f7ff;
                    border: 1px solid #4CAF50;
                    border-radius: 6px;
                    padding: 0.75rem;
                    margin-top: 1rem;
                    font-size: 0.9rem;
                `;
                document.getElementById('score-form').appendChild(impactElement);
            }
            
            impactElement.innerHTML = `
                <strong>Score Analysis:</strong><br>
                Differential: ${differential.toFixed(1)}<br>
                <small style="color: #666;">
                    ${differential < 0 ? '🎉 Great round! This will help your handicap.' : 
                      differential < 10 ? '👍 Solid round!' : 
                      '💪 Room for improvement!'}
                </small>
            `;
        }
    }
    
    [scoreInput, courseRatingInput, slopeRatingInput].forEach(input => {
        input.addEventListener('input', updateImpact);
    });
}

// Initialize scorecard enhancements
function initScorecardEnhancements() {
    setupCourseAutocomplete();
    enhanceFormFields();
    showHandicapImpact();
}

// Make functions available globally
window.ScorecardUtils = {
    validateScoreForm,
    initScorecardEnhancements,
    validateField,
    showFieldError,
    clearFieldError
};