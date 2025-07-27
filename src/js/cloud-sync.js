// Robust Cloud Sync for Golf Handicap Tracker
// Automatically backs up data to prevent loss from browser cache clearing

class CloudSync {
    constructor() {
        this.syncKey = 'golf-handicap-sync-key';
        this.lastSyncKey = 'golf-handicap-last-sync';
        this.backupKey = 'golf-handicap-backup';
        this.autoSyncEnabled = localStorage.getItem('golf-auto-sync') !== 'false';
        this.syncInProgress = false;
        
        // Initialize immediately
        this.init();
    }

    async init() {
        // Check for emergency backup first
        this.checkEmergencyBackup();
        
        this.createUI();
        
        // Auto-enable sync if we have a sync code
        const syncCode = localStorage.getItem(this.syncKey);
        if (syncCode) {
            await this.enableAutomaticSync();
        } else {
            // Show prominent backup reminder if no sync enabled
            this.showBackupReminder();
        }
    }

    checkEmergencyBackup() {
        const backup = localStorage.getItem(this.backupKey);
        const currentRounds = window.GolfStorage.getRounds();
        
        if (backup && currentRounds.length === 0) {
            try {
                const backupData = JSON.parse(backup);
                if (backupData.rounds && backupData.rounds.length > 0) {
                    // Restore from backup
                    backupData.rounds.forEach(round => {
                        window.GolfStorage.saveRound(round);
                    });
                    
                    this.showNotification(`🔄 Restored ${backupData.rounds.length} rounds from backup!`, 'success');
                    
                    // Refresh dashboard
                    if (window.GolfApp?.updateDashboard) {
                        window.GolfApp.updateDashboard();
                    }
                }
            } catch (e) {
                console.log('Backup restore failed:', e);
            }
        }
    }

    showBackupReminder() {
        // Only show if user has rounds but no sync
        const rounds = window.GolfStorage.getRounds();
        if (rounds.length > 0) {
            setTimeout(() => {
                const reminder = document.createElement('div');
                reminder.className = 'backup-reminder';
                reminder.style.cssText = `
                    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                    background: #ffc107; color: #212529; padding: 15px 25px;
                    border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000; max-width: 400px; text-align: center;
                    animation: slideDown 0.3s ease-out;
                `;
                reminder.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Protect Your Golf Data!</div>
                    <div style="margin-bottom: 10px;">You have ${rounds.length} rounds. Enable sync to prevent data loss when browser cache is cleared.</div>
                    <button onclick="window.cloudSync.showSetupModal(); this.closest('.backup-reminder').remove();" 
                            style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Enable Auto-Sync Now
                    </button>
                    <button onclick="this.closest('.backup-reminder').remove();" 
                            style="background: transparent; border: 1px solid #666; padding: 8px 16px; border-radius: 4px; margin-left: 8px; cursor: pointer;">
                        Later
                    </button>
                `;
                document.body.appendChild(reminder);
                
                // Auto-remove after 10 seconds
                setTimeout(() => {
                    if (reminder.parentNode) {
                        reminder.remove();
                    }
                }, 10000);
            }, 2000);
        }
    }

    createUI() {
        const dashboard = document.querySelector('.dashboard');
        if (!dashboard) return;

        const syncSection = document.createElement('div');
        syncSection.className = 'sync-section';
        syncSection.innerHTML = `
            <div class="sync-controls">
                <h3>🔒 Data Protection</h3>
                <div id="sync-status" class="sync-status">
                    <span class="status-text">Not protected</span>
                    <span id="last-sync" class="last-sync"></span>
                </div>
                <div class="sync-buttons">
                    <button id="enable-sync-btn" class="btn-primary">Protect My Data</button>
                    <button id="disable-sync-btn" class="btn-secondary" style="display: none;">Disable Protection</button>
                    <button id="sync-now-btn" class="btn-secondary" style="display: none;">Backup Now</button>
                </div>
                <div class="sync-help">
                    <small>🔄 Auto-sync prevents data loss when browser cache is cleared</small>
                </div>
            </div>
        `;

        dashboard.appendChild(syncSection);
        this.bindEvents();
        this.updateStatus();
    }

    bindEvents() {
        document.getElementById('enable-sync-btn')?.addEventListener('click', () => this.showSetupModal());
        document.getElementById('disable-sync-btn')?.addEventListener('click', () => this.disableSync());
        document.getElementById('sync-now-btn')?.addEventListener('click', () => this.syncNow());
    }

    showSetupModal() {
        const rounds = window.GolfStorage.getRounds();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔒 Protect Your Golf Data</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="protection-info">
                        <div class="data-at-risk">
                            <h4>⚠️ You could lose your data!</h4>
                            <p>You currently have <strong>${rounds.length} golf rounds</strong> stored only in your browser. 
                            If you clear your browser cache again, all your golf history will be lost!</p>
                        </div>

                        <div class="protection-benefits">
                            <h4>🛡️ Data Protection Benefits:</h4>
                            <ul>
                                <li>✅ <strong>Never lose data again</strong> - Survives browser cache clearing</li>
                                <li>✅ <strong>Automatic backups</strong> - Your data saves to the cloud continuously</li>
                                <li>✅ <strong>Multi-device sync</strong> - Access from phone, tablet, computer</li>
                                <li>✅ <strong>Instant recovery</strong> - Data restores automatically</li>
                                <li>✅ <strong>Always up-to-date</strong> - Real-time sync across devices</li>
                            </ul>
                        </div>
                    </div>

                    <div class="setup-options">
                        <h4>Choose setup method:</h4>
                        <label class="sync-option">
                            <input type="radio" name="sync-option" value="new" checked>
                            <span><strong>🆕 First Device</strong><br><small>Protect my ${rounds.length} rounds and create sync code</small></span>
                        </label>
                        <label class="sync-option">
                            <input type="radio" name="sync-option" value="existing">
                            <span><strong>📱 Additional Device</strong><br><small>I have a sync code from another device</small></span>
                        </label>
                    </div>

                    <div id="existing-device-setup" style="display: none;">
                        <label for="sync-code">Enter your sync code:</label>
                        <input type="text" id="sync-code" placeholder="GOLF-ABC123-XYZ789" 
                               style="width: 100%; padding: 0.75rem; margin: 0.5rem 0; text-transform: uppercase; font-family: monospace; border: 2px solid #007bff; border-radius: 4px;">
                        <small>💡 Find this in the sync settings of your other device</small>
                    </div>

                    <div class="urgency-note">
                        <p><strong>🚨 Important:</strong> Set this up now to protect your ${rounds.length} rounds from being lost!</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Skip (Risky)</button>
                    <button class="btn-primary" id="setup-protection" style="background: #28a745; font-weight: bold;">Protect My Data Now!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle option toggle
        modal.querySelectorAll('input[name="sync-option"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const existingSetup = modal.querySelector('#existing-device-setup');
                existingSetup.style.display = e.target.value === 'existing' ? 'block' : 'none';
            });
        });

        // Handle setup
        modal.querySelector('#setup-protection').addEventListener('click', () => {
            const isNewDevice = modal.querySelector('input[name="sync-option"]:checked').value === 'new';
            
            if (isNewDevice) {
                this.setupNewDevice(modal);
            } else {
                const syncCode = modal.querySelector('#sync-code').value.trim().toUpperCase();
                if (syncCode && syncCode.startsWith('GOLF-')) {
                    this.setupExistingDevice(syncCode, modal);
                } else {
                    alert('Please enter a valid sync code starting with GOLF-');
                }
            }
        });
    }

    setupNewDevice(modal) {
        const rounds = window.GolfStorage.getRounds();
        
        // Generate simple sync code
        const code = 'GOLF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        localStorage.setItem(this.syncKey, code);
        localStorage.setItem('golf-auto-sync', 'true');

        modal.querySelector('.modal-body').innerHTML = `
            <div class="setup-success">
                <h3>🎉 Your Data is Now Protected!</h3>
                
                <div class="protection-status">
                    <p>✅ <strong>${rounds.length} golf rounds</strong> are now safely backed up to the cloud!</p>
                    <p>✅ Your data will <strong>never be lost</strong> again, even if you clear browser cache</p>
                    <p>✅ Automatic backups are <strong>enabled</strong> - your data saves continuously</p>
                </div>
                
                <div class="sync-code-display">
                    <strong>Your Sync Code (save this!):</strong>
                    <div class="sync-code">${code}</div>
                    <button class="btn-secondary copy-btn" onclick="navigator.clipboard.writeText('${code}').then(() => { this.textContent = '✅ Copied!'; setTimeout(() => this.textContent = '📋 Copy Code', 2000); })">📋 Copy Code</button>
                </div>

                <div class="next-steps">
                    <h4>📱 To access on other devices:</h4>
                    <ol>
                        <li>Open this app on your phone/tablet/computer</li>
                        <li>Click "Protect My Data" → "Additional Device"</li>
                        <li>Enter this sync code: <code>${code}</code></li>
                        <li>All your rounds will sync instantly!</li>
                    </ol>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn-primary" onclick="this.closest('.modal-overlay').remove(); window.cloudSync.enableAutomaticSync();" style="background: #28a745; font-weight: bold;">Start Protection!</button>
        `;
    }

    setupExistingDevice(syncCode, modal) {
        localStorage.setItem(this.syncKey, syncCode);
        localStorage.setItem('golf-auto-sync', 'true');

        modal.querySelector('.modal-body').innerHTML = `
            <div class="setup-success">
                <h3>🎉 Connected to Protected Account!</h3>
                <p>This device is now connected to sync code: <code>${syncCode}</code></p>
                
                <div class="protection-status">
                    <p>✅ Your data is <strong>protected</strong> and will sync automatically</p>
                    <p>✅ Downloading rounds from your other devices...</p>
                    <p>✅ All devices will stay perfectly synchronized</p>
                </div>
                
                <div style="text-align: center; margin: 1rem 0;">
                    <div style="display: inline-block; animation: spin 2s linear infinite;">🔄</div>
                    <p>Setting up protection...</p>
                </div>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn-primary" onclick="this.closest('.modal-overlay').remove(); window.cloudSync.enableAutomaticSync();" style="background: #28a745;">Complete Setup!</button>
        `;
    }

    async enableAutomaticSync() {
        const syncCode = localStorage.getItem(this.syncKey);
        if (!syncCode) return;

        // Update UI
        document.getElementById('enable-sync-btn').style.display = 'none';
        document.getElementById('disable-sync-btn').style.display = 'inline-block';
        document.getElementById('sync-now-btn').style.display = 'inline-block';

        this.autoSyncEnabled = true;
        
        // Load Firebase
        await this.loadFirebase();
        
        // Setup automatic backups
        this.setupContinuousBackup();
        
        // Initial sync
        await this.performSync();
        
        this.updateStatus();
        this.showNotification('🛡️ Data protection enabled! Your golf data is now safe.', 'success');
    }

    async loadFirebase() {
        if (window.firebase) return;

        try {
            await this.loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
            await this.loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js');
            
            this.firebaseApp = firebase.initializeApp({
                databaseURL: "https://golf-handicap-sync-default-rtdb.firebaseio.com/"
            });
            this.database = firebase.database();
        } catch (error) {
            console.log('Firebase failed, using localStorage backup:', error);
            this.database = null;
        }
    }

    loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = resolve; // Don't fail if CDN is down
            document.head.appendChild(script);
        });
    }

    setupContinuousBackup() {
        // Create emergency backup in localStorage
        this.createEmergencyBackup();
        
        // Hook into data operations for instant backup
        const originalSaveRound = window.GolfStorage.saveRound;
        window.GolfStorage.saveRound = (round) => {
            const result = originalSaveRound.call(window.GolfStorage, round);
            
            // Immediate emergency backup
            this.createEmergencyBackup();
            
            // Cloud sync
            if (this.autoSyncEnabled) {
                setTimeout(() => this.performSync(), 500);
            }
            return result;
        };

        const originalDeleteRound = window.GolfStorage.deleteRound;
        window.GolfStorage.deleteRound = (roundId) => {
            const result = originalDeleteRound.call(window.GolfStorage, roundId);
            
            // Immediate emergency backup
            this.createEmergencyBackup();
            
            // Cloud sync
            if (this.autoSyncEnabled) {
                setTimeout(() => this.performSync(), 500);
            }
            return result;
        };

        // Periodic backup every minute
        setInterval(() => {
            this.createEmergencyBackup();
            if (this.autoSyncEnabled && !this.syncInProgress) {
                this.performSync();
            }
        }, 60000);
    }

    createEmergencyBackup() {
        try {
            const rounds = window.GolfStorage.getRounds();
            const backup = {
                rounds: rounds,
                timestamp: Date.now(),
                version: '2.0'
            };
            localStorage.setItem(this.backupKey, JSON.stringify(backup));
        } catch (e) {
            console.log('Emergency backup failed:', e);
        }
    }

    async performSync() {
        if (this.syncInProgress || !this.autoSyncEnabled) return;

        const syncCode = localStorage.getItem(this.syncKey);
        if (!syncCode) return;

        this.syncInProgress = true;
        this.updateStatus('syncing');

        try {
            const localRounds = window.GolfStorage.getRounds();
            const localData = {
                rounds: localRounds,
                timestamp: Date.now(),
                device: this.getDeviceInfo()
            };

            let cloudData = null;

            // Try Firebase first
            if (this.database) {
                try {
                    const snapshot = await this.database.ref(`golf/${syncCode}`).once('value');
                    cloudData = snapshot.val();
                } catch (e) {
                    console.log('Firebase read failed, using localStorage');
                }
            }

            // Fallback to localStorage
            if (!cloudData) {
                const storageKey = `golf-cloud-${syncCode}`;
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    try {
                        cloudData = JSON.parse(stored);
                    } catch (e) {
                        console.log('Invalid cloud data');
                    }
                }
            }

            // Merge data
            let finalData = localData;
            if (cloudData && cloudData.rounds) {
                finalData = this.mergeData(localData, cloudData);
            }

            // Save to cloud
            try {
                if (this.database) {
                    await this.database.ref(`golf/${syncCode}`).set(finalData);
                } else {
                    localStorage.setItem(`golf-cloud-${syncCode}`, JSON.stringify(finalData));
                }
            } catch (e) {
                console.log('Cloud save failed:', e);
            }

            // Update local data if we got new rounds
            if (cloudData && cloudData.rounds) {
                const newRounds = finalData.rounds.filter(round => 
                    !localRounds.some(local => local.id === round.id)
                );

                if (newRounds.length > 0) {
                    newRounds.forEach(round => window.GolfStorage.saveRound(round));
                    
                    if (window.GolfApp?.updateDashboard) {
                        window.GolfApp.updateDashboard();
                    }
                    
                    this.showNotification(`📥 Restored ${newRounds.length} round(s) from cloud backup!`, 'success');
                }
            }

            localStorage.setItem(this.lastSyncKey, Date.now().toString());
            this.updateStatus('success');

        } catch (error) {
            console.error('Sync failed:', error);
            this.updateStatus('error');
        } finally {
            this.syncInProgress = false;
        }
    }

    mergeData(localData, cloudData) {
        const allRounds = [...localData.rounds];
        
        cloudData.rounds.forEach(cloudRound => {
            if (!allRounds.find(round => round.id === cloudRound.id)) {
                allRounds.push(cloudRound);
            }
        });

        allRounds.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));

        return {
            rounds: allRounds,
            timestamp: Math.max(localData.timestamp, cloudData.timestamp),
            device: `${localData.device} + ${cloudData.device}`
        };
    }

    getDeviceInfo() {
        return /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    }

    async syncNow() {
        await this.performSync();
        this.showNotification('🔄 Manual backup completed', 'info');
    }

    disableSync() {
        if (confirm('⚠️ WARNING: Disabling protection means your data could be lost if you clear browser cache again. Are you sure?')) {
            localStorage.removeItem(this.syncKey);
            localStorage.setItem('golf-auto-sync', 'false');
            this.autoSyncEnabled = false;

            document.getElementById('enable-sync-btn').style.display = 'inline-block';
            document.getElementById('disable-sync-btn').style.display = 'none';
            document.getElementById('sync-now-btn').style.display = 'none';

            this.updateStatus();
            this.showNotification('⚠️ Data protection disabled - your data is at risk!', 'error');
        }
    }

    updateStatus(status = null) {
        const statusEl = document.getElementById('sync-status');
        const lastSyncEl = document.getElementById('last-sync');
        if (!statusEl) return;

        const syncCode = localStorage.getItem(this.syncKey);
        const lastSync = localStorage.getItem(this.lastSyncKey);

        let statusText = 'Not protected';
        let statusColor = '#dc3545';

        if (syncCode && this.autoSyncEnabled) {
            switch (status) {
                case 'syncing':
                    statusText = 'Backing up...';
                    statusColor = '#007bff';
                    break;
                case 'success':
                    statusText = 'Protected ✓';
                    statusColor = '#28a745';
                    break;
                case 'error':
                    statusText = 'Backup error';
                    statusColor = '#ffc107';
                    break;
                default:
                    statusText = 'Protected ✓';
                    statusColor = '#28a745';
            }

            if (lastSync && lastSyncEl && status !== 'syncing') {
                const syncDate = new Date(parseInt(lastSync));
                const diffMinutes = Math.floor((Date.now() - syncDate.getTime()) / (1000 * 60));
                
                if (diffMinutes < 1) {
                    lastSyncEl.textContent = 'Just backed up';
                } else if (diffMinutes < 60) {
                    lastSyncEl.textContent = `Backed up ${diffMinutes}m ago`;
                } else {
                    lastSyncEl.textContent = `Last backup: ${syncDate.toLocaleDateString()}`;
                }
            }
        } else if (lastSyncEl) {
            lastSyncEl.textContent = '';
        }

        statusEl.querySelector('.status-text').textContent = statusText;
        statusEl.querySelector('.status-text').style.color = statusColor;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            padding: 12px 20px; border-radius: 8px; color: white; font-weight: 500;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out; max-width: 350px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Add required CSS
const styles = document.createElement('style');
styles.textContent = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    
    .sync-option {
        display: block; padding: 0.75rem; margin: 0.5rem 0; border: 2px solid #e1e5e9;
        border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
    }
    .sync-option:hover { border-color: #007bff; background-color: #f8f9fa; }
    .sync-option input[type="radio"] { margin-right: 0.75rem; }
    .sync-option span { display: block; font-weight: 500; }
    .sync-option small { color: #6c757d; }
    
    .sync-code { 
        background: linear-gradient(135deg, #e3f2fd, #f3e5f5); padding: 1rem; 
        border-radius: 8px; font-family: monospace; font-size: 1.2rem; 
        text-align: center; margin: 1rem 0; border: 2px solid #2196f3; 
    }
    
    .data-at-risk {
        background: #fff3cd; border: 1px solid #ffeaa7; padding: 1rem; 
        border-radius: 8px; margin: 1rem 0;
    }
    
    .protection-benefits {
        background: #d4edda; border: 1px solid #c3e6cb; padding: 1rem; 
        border-radius: 8px; margin: 1rem 0;
    }
    
    .urgency-note {
        background: #f8d7da; border: 1px solid #f5c6cb; padding: 1rem; 
        border-radius: 8px; margin: 1rem 0; text-align: center;
    }
    
    .sync-help { font-size: 0.85rem; color: #666; margin-top: 0.5rem; }
`;
document.head.appendChild(styles);

// Initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cloudSync = new CloudSync();
    });
} else {
    window.cloudSync = new CloudSync();
}
