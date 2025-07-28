// Cloud synchronization module for Golf Handicap Tracker
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    onSnapshot,
    serverTimestamp,
    enableNetwork,
    disableNetwork
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// Initialize Firebase (if not already initialized)
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    // App already initialized
    app = initializeApp(firebaseConfig, 'cloud-sync');
}

const db = getFirestore(app);

// Sync status
let syncInProgress = false;
let lastSyncTime = null;
let unsubscribeListener = null;

// Initialize cloud sync
export function initCloudSync() {
    console.log('Initializing cloud sync...');
    
    // Set up sync status indicators
    setupSyncIndicators();
    
    // Listen for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Auto-sync every 5 minutes when online
    setInterval(() => {
        if (navigator.onLine && window.GolfAuth && window.GolfAuth.isAuthenticated()) {
            syncUserData();
        }
    }, 5 * 60 * 1000);
}

// Sync user data to cloud
export async function syncUserData() {
    if (!window.GolfAuth || !window.GolfAuth.isAuthenticated()) {
        console.log('User not authenticated, skipping sync');
        return { success: false, error: 'Not authenticated' };
    }
    
    if (syncInProgress) {
        console.log('Sync already in progress');
        return { success: false, error: 'Sync in progress' };
    }
    
    try {
        syncInProgress = true;
        updateSyncStatus('syncing');
        
        const user = window.GolfAuth.getCurrentUser();
        const localData = window.GolfStorage.getData();
        
        // Prepare data for cloud storage
        const cloudData = {
            ...localData,
            lastModified: serverTimestamp(),
            userId: user.uid,
            userEmail: user.email
        };
        
        // Save to Firestore
        const userDocRef = doc(db, 'golf-data', user.uid);
        await setDoc(userDocRef, cloudData, { merge: true });
        
        lastSyncTime = new Date();
        updateSyncStatus('synced');
        
        console.log('Data synced to cloud successfully');
        return { success: true };
        
    } catch (error) {
        console.error('Cloud sync failed:', error);
        updateSyncStatus('error');
        return { success: false, error: error.message };
    } finally {
        syncInProgress = false;
    }
}

// Load user data from cloud
export async function loadUserData() {
    if (!window.GolfAuth || !window.GolfAuth.isAuthenticated()) {
        console.log('User not authenticated, skipping load');
        return { success: false, error: 'Not authenticated' };
    }
    
    try {
        updateSyncStatus('syncing');
        
        const user = window.GolfAuth.getCurrentUser();
        const userDocRef = doc(db, 'golf-data', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const localData = window.GolfStorage.getData();
            
            // Merge cloud data with local data
            const mergedData = mergeDataSources(localData, cloudData);
            
            // Save merged data locally
            if (window.GolfStorage.saveData) {
                window.GolfStorage.saveData(mergedData);
            }
            
            // Refresh UI
            if (window.updateDashboard) {
                window.updateDashboard();
            }
            if (window.displayRecentRounds) {
                window.displayRecentRounds();
            }
            
            updateSyncStatus('synced');
            console.log('Data loaded from cloud successfully');
            return { success: true, data: mergedData };
        } else {
            // No cloud data exists, sync current local data
            console.log('No cloud data found, syncing local data');
            return await syncUserData();
        }
        
    } catch (error) {
        console.error('Failed to load data from cloud:', error);
        updateSyncStatus('error');
        return { success: false, error: error.message };
    }
}

// Set up real-time listener for data changes
export function startRealtimeSync() {
    if (!window.GolfAuth || !window.GolfAuth.isAuthenticated()) {
        return;
    }
    
    const user = window.GolfAuth.getCurrentUser();
    const userDocRef = doc(db, 'golf-data', user.uid);
    
    // Clean up existing listener
    if (unsubscribeListener) {
        unsubscribeListener();
    }
    
    // Set up new listener
    unsubscribeListener = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            const cloudData = doc.data();
            const localData = window.GolfStorage.getData();
            
            // Only update if cloud data is newer
            if (isCloudDataNewer(localData, cloudData)) {
                console.log('Received updated data from cloud');
                const mergedData = mergeDataSources(localData, cloudData);
                
                // Save merged data locally
                if (window.GolfStorage.saveData) {
                    window.GolfStorage.saveData(mergedData);
                }
                
                // Refresh UI
                if (window.updateDashboard) {
                    window.updateDashboard();
                }
                if (window.displayRecentRounds) {
                    window.displayRecentRounds();
                }
                
                showSyncNotification('Data updated from another device');
            }
        }
    }, (error) => {
        console.error('Realtime sync error:', error);
        updateSyncStatus('error');
    });
}

// Stop real-time sync
export function stopRealtimeSync() {
    if (unsubscribeListener) {
        unsubscribeListener();
        unsubscribeListener = null;
    }
}

// Clear user data (when signing out)
export function clearUserData() {
    stopRealtimeSync();
    lastSyncTime = null;
    updateSyncStatus('offline');
}

// Merge local and cloud data
function mergeDataSources(localData, cloudData) {
    // Create a map of rounds by ID for efficient merging
    const localRoundsMap = new Map(localData.rounds.map(round => [round.id, round]));
    const cloudRoundsMap = new Map(cloudData.rounds.map(round => [round.id, round]));
    
    // Merge rounds - keep the most recent version of each round
    const mergedRounds = [];
    const allRoundIds = new Set([...localRoundsMap.keys(), ...cloudRoundsMap.keys()]);
    
    for (const roundId of allRoundIds) {
        const localRound = localRoundsMap.get(roundId);
        const cloudRound = cloudRoundsMap.get(roundId);
        
        if (localRound && cloudRound) {
            // Both exist, keep the more recent one
            const localTime = new Date(localRound.lastModified || localRound.timestamp).getTime();
            const cloudTime = new Date(cloudRound.lastModified || cloudRound.timestamp).getTime();
            mergedRounds.push(cloudTime > localTime ? cloudRound : localRound);
        } else {
            // Only one exists, keep it
            mergedRounds.push(localRound || cloudRound);
        }
    }
    
    // Sort rounds by date (newest first)
    mergedRounds.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
    
    // Return merged data
    return {
        rounds: mergedRounds,
        handicap: cloudData.handicap || localData.handicap,
        stats: cloudData.stats || localData.stats,
        lastModified: cloudData.lastModified || localData.lastModified
    };
}

// Check if cloud data is newer than local data
function isCloudDataNewer(localData, cloudData) {
    if (!localData.lastModified) return true;
    if (!cloudData.lastModified) return false;
    
    const localTime = new Date(localData.lastModified).getTime();
    const cloudTime = cloudData.lastModified.toDate ? cloudData.lastModified.toDate().getTime() : new Date(cloudData.lastModified).getTime();
    
    return cloudTime > localTime;
}

// Handle online event
function handleOnline() {
    console.log('Device came online');
    updateSyncStatus('online');
    
    if (window.GolfAuth && window.GolfAuth.isAuthenticated()) {
        // Sync data when coming back online
        setTimeout(() => {
            syncUserData();
            startRealtimeSync();
        }, 1000);
    }
    
    enableNetwork(db);
}

// Handle offline event
function handleOffline() {
    console.log('Device went offline');
    updateSyncStatus('offline');
    disableNetwork(db);
}

// Setup sync status indicators
function setupSyncIndicators() {
    // Create sync status indicator if it doesn't exist
    if (!document.getElementById('sync-status')) {
        const header = document.querySelector('header');
        if (header) {
            const syncIndicator = document.createElement('div');
            syncIndicator.id = 'sync-status';
            syncIndicator.className = 'sync-status';
            header.appendChild(syncIndicator);
        }
    }
    
    // Add manual sync button
    if (!document.getElementById('manual-sync-btn')) {
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            const syncButton = document.createElement('button');
            syncButton.id = 'manual-sync-btn';
            syncButton.className = 'btn-sync';
            syncButton.innerHTML = '🔄 Sync';
            syncButton.addEventListener('click', handleManualSync);
            userInfo.appendChild(syncButton);
        }
    }
}

// Update sync status indicator
function updateSyncStatus(status) {
    const indicator = document.getElementById('sync-status');
    if (!indicator) return;
    
    const statusConfig = {
        'syncing': { text: '🔄 Syncing...', class: 'syncing' },
        'synced': { text: '✅ Synced', class: 'synced' },
        'error': { text: '❌ Sync Error', class: 'error' },
        'offline': { text: '📡 Offline', class: 'offline' },
        'online': { text: '🌐 Online', class: 'online' }
    };
    
    const config = statusConfig[status] || statusConfig.offline;
    indicator.textContent = config.text;
    indicator.className = `sync-status ${config.class}`;
    
    // Auto-hide success messages
    if (status === 'synced') {
        setTimeout(() => {
            if (indicator.textContent === config.text) {
                indicator.textContent = '';
                indicator.className = 'sync-status';
            }
        }, 3000);
    }
}

// Handle manual sync button click
async function handleManualSync() {
    const button = document.getElementById('manual-sync-btn');
    if (button) {
        button.disabled = true;
        button.textContent = 'Syncing...';
    }
    
    const result = await syncUserData();
    
    if (button) {
        button.disabled = false;
        button.innerHTML = '🔄 Sync';
    }
    
    if (result.success) {
        showSyncNotification('Data synced successfully!');
    } else {
        showSyncNotification('Sync failed: ' + result.error, 'error');
    }
}

// Show sync notification
function showSyncNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `sync-notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Export cloud sync object
window.CloudSync = {
    initCloudSync,
    syncUserData,
    loadUserData,
    startRealtimeSync,
    stopRealtimeSync,
    clearUserData
};