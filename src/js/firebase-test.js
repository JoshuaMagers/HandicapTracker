// Firebase configuration test
// This file can be used to test if Firebase is properly configured

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyACW37rtM_pLKqRl-dTiy87llbezzcNwA8",
    authDomain: "handicaptracker-65a8d.firebaseapp.com",
    projectId: "handicaptracker-65a8d",
    storageBucket: "handicaptracker-65a8d.firebasestorage.app",
    messagingSenderId: "420060832386",
    appId: "1:420060832386:web:f03e2d6b47ff72ad704a9b",
    measurementId: "G-5QRQB0MD40"
};

// Test Firebase initialization
try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully!');
    console.log('📧 Auth:', auth ? 'Connected' : 'Failed');
    console.log('🗄️ Firestore:', db ? 'Connected' : 'Failed');
    console.log('🏗️ Project ID:', firebaseConfig.projectId);
    
    // Test connection status
    if (navigator.onLine) {
        console.log('🌐 Network status: Online');
    } else {
        console.log('📡 Network status: Offline');
    }
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('💡 Check your Firebase configuration and network connection');
}

export { firebaseConfig };
