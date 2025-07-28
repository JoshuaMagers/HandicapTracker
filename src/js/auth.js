// Authentication module for Golf Handicap Tracker
import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Current user state
let currentUser = null;

// Initialize authentication
export function initAuth() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateUIForAuthState(user);
        
        if (user) {
            console.log('User signed in:', user.email);
            // Load data from cloud first, then start real-time sync
            if (window.CloudSync) {
                // Load existing cloud data first
                window.CloudSync.loadUserData().then((result) => {
                    // Start real-time synchronization
                    window.CloudSync.startRealtimeSync();
                    
                    // Initialize app features after data is loaded
                    if (window.initAppFeatures) {
                        setTimeout(window.initAppFeatures, 300);
                    }
                });
            } else {
                // Fallback if CloudSync is not available yet
                setTimeout(() => {
                    if (window.initAppFeatures) {
                        window.initAppFeatures();
                    }
                }, 500);
            }
        } else {
            console.log('User signed out');
            // Clear cloud data references when signed out
            if (window.CloudSync) {
                window.CloudSync.clearUserData();
            }
        }
    });
    
    // Set up auth form listeners
    setupAuthListeners();
}

// Create account
export async function createAccount(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with display name
        if (displayName) {
            await updateProfile(user, { displayName });
        }
        
        return { success: true, user };
    } catch (error) {
        console.error('Account creation failed:', error);
        return { success: false, error: error.message };
    }
}

// Sign in
export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in failed:', error);
        return { success: false, error: error.message };
    }
}

// Sign out
export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign out failed:', error);
        return { success: false, error: error.message };
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset failed:', error);
        return { success: false, error: error.message };
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
    return currentUser !== null;
}

// Update UI based on authentication state
function updateUIForAuthState(user) {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userInfo = document.getElementById('user-info');
    
    if (user) {
        // User is signed in
        if (authContainer) authContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
        if (userInfo) {
            userInfo.innerHTML = `
                <span class="user-email">${user.email}</span>
                <button id="sign-out-btn" class="btn-secondary">Sign Out</button>
            `;
            
            // Add sign out listener
            const signOutBtn = document.getElementById('sign-out-btn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', handleSignOut);
            }
        }
    } else {
        // User is signed out
        if (authContainer) authContainer.style.display = 'block';
        if (appContainer) appContainer.style.display = 'none';
        if (userInfo) userInfo.innerHTML = '';
    }
}

// Set up authentication form listeners
function setupAuthListeners() {
    // Sign up form
    const signUpForm = document.getElementById('sign-up-form');
    if (signUpForm) {
        signUpForm.addEventListener('submit', handleSignUp);
    }
    
    // Sign in form
    const signInForm = document.getElementById('sign-in-form');
    if (signInForm) {
        signInForm.addEventListener('submit', handleSignIn);
    }
    
    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Form toggle buttons
    const showSignInBtn = document.getElementById('show-sign-in');
    const showSignUpBtn = document.getElementById('show-sign-up');
    const showForgotPasswordBtn = document.getElementById('show-forgot-password');
    const backToSignInBtn = document.getElementById('back-to-sign-in');
    
    if (showSignInBtn) {
        showSignInBtn.addEventListener('click', () => showAuthForm('sign-in'));
    }
    if (showSignUpBtn) {
        showSignUpBtn.addEventListener('click', () => showAuthForm('sign-up'));
    }
    if (showForgotPasswordBtn) {
        showForgotPasswordBtn.addEventListener('click', () => showAuthForm('forgot-password'));
    }
    if (backToSignInBtn) {
        backToSignInBtn.addEventListener('click', () => showAuthForm('sign-in'));
    }
}

// Handle sign up form submission
async function handleSignUp(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const displayName = formData.get('displayName');
    
    // Clear previous errors
    clearAuthErrors();
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }
    
    // Show loading state
    setAuthLoading(true);
    
    const result = await createAccount(email, password, displayName);
    
    setAuthLoading(false);
    
    if (result.success) {
        showAuthSuccess('Account created successfully!');
    } else {
        showAuthError(result.error);
    }
}

// Handle sign in form submission
async function handleSignIn(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Clear previous errors
    clearAuthErrors();
    
    // Show loading state
    setAuthLoading(true);
    
    const result = await signIn(email, password);
    
    setAuthLoading(false);
    
    if (result.success) {
        showAuthSuccess('Signed in successfully!');
    } else {
        showAuthError(result.error);
    }
}

// Handle forgot password form submission
async function handleForgotPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    
    // Clear previous errors
    clearAuthErrors();
    
    // Show loading state
    setAuthLoading(true);
    
    const result = await resetPassword(email);
    
    setAuthLoading(false);
    
    if (result.success) {
        showAuthSuccess('Password reset email sent! Check your inbox.');
    } else {
        showAuthError(result.error);
    }
}

// Handle sign out
async function handleSignOut() {
    const result = await signOutUser();
    if (!result.success) {
        console.error('Sign out error:', result.error);
    }
}

// Show different authentication forms
function showAuthForm(formType) {
    const forms = ['sign-in', 'sign-up', 'forgot-password'];
    
    forms.forEach(form => {
        const element = document.getElementById(`${form}-form-container`);
        if (element) {
            element.style.display = form === formType ? 'block' : 'none';
        }
    });
    
    // Clear any previous errors/success messages
    clearAuthErrors();
}

// Show authentication error
function showAuthError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Show authentication success
function showAuthSuccess(message) {
    const successElement = document.getElementById('auth-success');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
}

// Clear authentication errors/success
function clearAuthErrors() {
    const errorElement = document.getElementById('auth-error');
    const successElement = document.getElementById('auth-success');
    
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
    if (successElement) {
        successElement.style.display = 'none';
        successElement.textContent = '';
    }
}

// Set loading state for auth forms
function setAuthLoading(loading) {
    const submitButtons = document.querySelectorAll('.auth-form button[type="submit"]');
    submitButtons.forEach(button => {
        button.disabled = loading;
        button.textContent = loading ? 'Loading...' : button.dataset.originalText || button.textContent;
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }
    });
}

// Export auth object for global access
window.GolfAuth = {
    initAuth,
    createAccount,
    signIn,
    signOutUser,
    resetPassword,
    getCurrentUser,
    isAuthenticated
};
