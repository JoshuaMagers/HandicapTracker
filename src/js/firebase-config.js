// Firebase configuration and initialization for Golf Handicap Tracker
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACW37rtM_pLKqRl-dTiy87llbezzcNwA8",
    authDomain: "handicaptracker-65a8d.firebaseapp.com",
    projectId: "handicaptracker-65a8d",
    storageBucket: "handicaptracker-65a8d.firebasestorage.app",
    messagingSenderId: "420060832386",
    appId: "1:420060832386:web:f03e2d6b47ff72ad704a9b",
    measurementId: "G-5QRQB0MD40"
};

// Initialize Firebase app (only once)
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { app, auth, db };
