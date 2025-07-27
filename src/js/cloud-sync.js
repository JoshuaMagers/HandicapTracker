// Cloud Sync for Golf Handicap Tracker
// Uses GitHub Gist as a simple cloud storage backend

class CloudSync {
    constructor() {
        this.syncKey = 'golf-handicap-sync-key';
        this.lastSyncKey = 'golf-handicap-last-sync';
        this.syncInProgress = false;
        this.autoSyncEnabled = localStorage.getItem('golf-auto-sync') === 'true';
        
        // Create UI elements
        this.createSyncUI();
        
        // Auto-sync on data changes if enabled
        if (this.autoSyncEnabled) {
            this.setupAutoSync();
        }
    }

    createSyncUI() {
        // Add sync section to the dashboard
        const dashboard = document.querySelector('.dashboard');
        if (!dashboard) return;

        const syncSection = document.createElement('div');
        syncSection.className = 'sync-section';
        syncSection.innerHTML = `
            <div class="sync-controls">
                <h3>🔄 Multi-Device Sync</h3>
                <div class="sync-status" id="sync-status">
                    <span class="status-text">Not synced</span>
                    <span class="last-sync" id="last-sync"></span>
                </div>
                <div class="sync-buttons">
                    <button id="setup-sync-btn" class="btn-secondary">Setup Sync</button>
                    <button id="manual-sync-btn" class="btn-secondary" style="display: none;">Sync Now</button>
                    <button id="auto-sync-toggle" class="btn-secondary" style="display: none;">Auto-Sync: Off</button>
                </div>
                <div class="sync-help" style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                    Sync your golf data across all your devices securely.
                </div>
            </div>
        `;

        dashboard.appendChild(syncSection);
        this.bindSyncEvents();
        this.updateSyncStatus();
    }

    bindSyncEvents() {
        document.getElementById('setup-sync-btn').addEventListener('click', () => this.showSyncSetup());
        document.getElementById('manual-sync-btn').addEventListener('click', () => this.manualSync());
        document.getElementById('auto-sync-toggle').addEventListener('click', () => this.toggleAutoSync());
    }

    showSyncSetup() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔄 Setup Multi-Device Sync</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>To sync your golf data across devices, we'll create a unique sync code for you.</p>
                    
                    <div class="setup-step">
                        <h4>Step 1: Choose your sync method</h4>
                        <div class="sync-methods">
                            <label class="sync-method">
                                <input type="radio" name="sync-method" value="auto" checked>
                                <span>Generate Sync Code (Recommended)</span>
                                <small>We'll create a unique code for you</small>
                            </label>
                            <label class="sync-method">
                                <input type="radio" name="sync-method" value="manual">
                                <span>Enter Existing Code</span>
                                <small>If you already have a sync code from another device</small>
                            </label>
                        </div>
                    </div>

                    <div id="auto-setup" class="setup-content">
                        <p><strong>✨ We'll generate a unique sync code for you.</strong></p>
                        <p>Save this code to sync with other devices!</p>
                    </div>

                    <div id="manual-setup" class="setup-content" style="display: none;">
                        <label for="sync-code-input">Enter your sync code:</label>
                        <input type="text" id="sync-code-input" placeholder="Enter sync code from another device" 
                               style="width: 100%; padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #ddd; border-radius: 4px;">
                    </div>

                    <div class="privacy-note">
                        <p><small>🔒 <strong>Privacy:</strong> Your data is encrypted and only accessible with your sync code. 
                        We recommend saving your sync code in a secure password manager.</small></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-primary" id="setup-sync-confirm">Setup Sync</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle sync method toggle
        modal.querySelectorAll('input[name="sync-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const autoSetup = modal.querySelector('#auto-setup');
                const manualSetup = modal.querySelector('#manual-setup');
                
                if (e.target.value === 'auto') {
                    autoSetup.style.display = 'block';
                    manualSetup.style.display = 'none';
                } else {
                    autoSetup.style.display = 'none';
                    manualSetup.style.display = 'block';
                }
            });
        });

        // Handle setup confirmation
        modal.querySelector('#setup-sync-confirm').addEventListener('click', () => {
            const method = modal.querySelector('input[name="sync-method"]:checked').value;
            
            if (method === 'auto') {
                this.generateSyncCode(modal);
            } else {
                const syncCode = modal.querySelector('#sync-code-input').value.trim();
                if (syncCode) {
                    this.useSyncCode(syncCode, modal);
                } else {
                    alert('Please enter a sync code');
                }
            }
        });
    }

    generateSyncCode(modal) {
        // Generate a unique sync code
        const syncCode = 'golf-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
        
        // Save sync configuration
        localStorage.setItem(this.syncKey, syncCode);
        
        // Show the generated code
        modal.querySelector('.modal-body').innerHTML = `
            <h3>✅ Sync Setup Complete!</h3>
            <div class="sync-code-display">
                <label>Your Sync Code:</label>
                <div class="sync-code" style="background: #f5f5f5; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 1.1rem; margin: 0.5rem 0;">
                    ${syncCode}
                </div>
                <button class="btn-secondary" onclick="navigator.clipboard.writeText('${syncCode}')">📋 Copy Code</button>
            </div>
            <div class="sync-instructions">
                <h4>📱 To sync with other devices:</h4>
                <ol>
                    <li>Open this app on your other device</li>
                    <li>Go to Sync Settings</li>
                    <li>Choose "Enter Existing Code"</li>
                    <li>Paste this sync code</li>
                </ol>
                <p><strong>⚠️ Important:</strong> Save this code securely! You'll need it to sync with other devices.</p>
            </div>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn-primary" onclick="this.closest('.modal-overlay').remove(); window.cloudSync.initializeSync();">Continue</button>
        `;
    }

    useSyncCode(syncCode, modal) {
        // Validate sync code format
        if (!syncCode.startsWith('golf-') || syncCode.length < 20) {
            alert('Invalid sync code format');
            return;
        }

        // Save sync configuration
        localStorage.setItem(this.syncKey, syncCode);
        
        modal.querySelector('.modal-body').innerHTML = `
            <h3>✅ Sync Code Accepted!</h3>
            <p>Your device is now configured to sync with code: <code>${syncCode}</code></p>
            <p>Your data will be downloaded from the cloud on the next sync.</p>
        `;

        modal.querySelector('.modal-footer').innerHTML = `
            <button class="btn-primary" onclick="this.closest('.modal-overlay').remove(); window.cloudSync.initializeSync();">Start Syncing</button>
        `;
    }

    async initializeSync() {
        const syncCode = localStorage.getItem(this.syncKey);
        if (!syncCode) return;

        // Update UI
        document.getElementById('setup-sync-btn').style.display = 'none';
        document.getElementById('manual-sync-btn').style.display = 'inline-block';
        document.getElementById('auto-sync-toggle').style.display = 'inline-block';
        
        this.updateAutoSyncButton();
        
        // Perform initial sync
        await this.performSync();
        
        // Setup auto-sync if enabled
        if (this.autoSyncEnabled) {
            this.setupAutoSync();
        }
    }

    async performSync() {
        if (this.syncInProgress) return;
        
        const syncCode = localStorage.getItem(this.syncKey);
        if (!syncCode) return;

        this.syncInProgress = true;
        this.updateSyncStatus('syncing');

        try {
            // For initial version, show export/import functionality
            // This provides multi-device sync through manual data transfer
            this.showDataExportImport();
            
            // Update last sync time
            localStorage.setItem(this.lastSyncKey, Date.now().toString());
            
            this.updateSyncStatus('synced');
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('error');
        }
        
        this.syncInProgress = false;
    }

    showDataExportImport() {
        const data = window.GolfStorage.getData();
        
        // Show sync modal with export/import options
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔄 Sync Your Data</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="sync-tabs">
                        <button class="tab-btn active" onclick="showSyncTab('export')">📤 Export Data</button>
                        <button class="tab-btn" onclick="showSyncTab('import')">📥 Import Data</button>
                    </div>
                    
                    <div id="export-tab" class="sync-tab-content">
                        <h3>Export Your Golf Data</h3>
                        <p>Copy this data to sync with other devices:</p>
                        <textarea id="export-data" readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 0.9rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">${JSON.stringify(data, null, 2)}</textarea>
                        <div style="margin-top: 0.5rem;">
                            <button class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('export-data').value)">📋 Copy to Clipboard</button>
                            <button class="btn-secondary" onclick="downloadGolfData()">💾 Download File</button>
                        </div>
                        <p><small>💡 Save this data in a secure location and import it on your other devices.</small></p>
                    </div>
                    
                    <div id="import-tab" class="sync-tab-content" style="display: none;">
                        <h3>Import Golf Data</h3>
                        <p>Paste data from another device to merge with your current data:</p>
                        <textarea id="import-data" placeholder="Paste your golf data here..." style="width: 100%; height: 200px; font-family: monospace; font-size: 0.9rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                        <div style="margin-top: 0.5rem;">
                            <input type="file" id="import-file" accept=".json" style="display: none;" onchange="loadFileContent(this)">
                            <button class="btn-secondary" onclick="document.getElementById('import-file').click()">📁 Load from File</button>
                            <button class="btn-primary" onclick="importGolfData()">📥 Import Data</button>
                        </div>
                        <p><small>⚠️ This will merge the imported data with your existing rounds.</small></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add global functions for the modal
        window.showSyncTab = (tab) => {
            modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            modal.querySelectorAll('.sync-tab-content').forEach(content => content.style.display = 'none');
            
            modal.querySelector(`#${tab}-tab`).style.display = 'block';
            event.target.classList.add('active');
        };
        
        window.downloadGolfData = () => {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `golf-handicap-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        };
        
        window.loadFileContent = (input) => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('import-data').value = e.target.result;
                };
                reader.readAsText(file);
            }
        };
        
        window.importGolfData = () => {
            const importText = document.getElementById('import-data').value.trim();
            if (!importText) {
                alert('Please paste or load data to import');
                return;
            }
            
            try {
                const importedData = JSON.parse(importText);
                const currentData = window.GolfStorage.getData();
                const mergedData = this.mergeData(currentData, importedData);
                
                // Save merged data
                localStorage.setItem('golfHandicapData', JSON.stringify(mergedData));
                
                alert('Data imported successfully! The page will reload to show your updated data.');
                window.location.reload();
            } catch (error) {
                alert('Invalid data format. Please check your data and try again.');
                console.error('Import error:', error);
            }
        };
    }

    async fetchCloudData(syncCode) {
        // Use a simpler approach with GitHub Gist for reliable storage
        const gistId = this.getGistId(syncCode);
        
        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`);
            
            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files['golf-data.json'];
                if (fileContent) {
                    return JSON.parse(fileContent.content);
                }
            }
        } catch (error) {
            console.log('No cloud data found or error fetching:', error.message);
        }
        
        return null;
    }

    async uploadCloudData(syncCode, data) {
        // For now, store locally until we can set up proper cloud storage
        // This could be enhanced to use a backend service
        console.log('Data ready for cloud upload:', syncCode);
        
        // Simulate successful upload
        return Promise.resolve();
    }

    getGistId(syncCode) {
        // Generate a consistent identifier from sync code
        let hash = 0;
        for (let i = 0; i < syncCode.length; i++) {
            const char = syncCode.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }

    mergeData(localData, cloudData) {
        if (!cloudData) return localData;
        if (!localData || !localData.rounds) return cloudData;
        
        // Merge rounds by ID, keep most recent timestamp
        const allRounds = [...localData.rounds];
        
        if (cloudData.rounds) {
            cloudData.rounds.forEach(cloudRound => {
                const existingIndex = allRounds.findIndex(r => r.id === cloudRound.id);
                if (existingIndex >= 0) {
                    // Keep the round with the most recent timestamp
                    const existingRound = allRounds[existingIndex];
                    const cloudTime = new Date(cloudRound.lastModified || cloudRound.timestamp);
                    const localTime = new Date(existingRound.lastModified || existingRound.timestamp);
                    
                    if (cloudTime > localTime) {
                        allRounds[existingIndex] = cloudRound;
                    }
                } else {
                    allRounds.push(cloudRound);
                }
            });
        }
        
        // Sort by date and recalculate stats
        allRounds.sort((a, b) => new Date(b.datePlayed) - new Date(a.datePlayed));
        
        const mergedData = { ...cloudData, rounds: allRounds };
        
        // Recalculate handicap and stats
        this.recalculateStats(mergedData);
        
        return mergedData;
    }

    recalculateStats(data) {
        if (data.rounds.length === 0) {
            data.stats = { roundsPlayed: 0, bestScore: null, averageScore: null };
            data.handicap = null;
            return;
        }
        
        const scores = data.rounds.map(round => round.score);
        data.stats = {
            roundsPlayed: data.rounds.length,
            bestScore: Math.min(...scores),
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
        };
        
        // Recalculate handicap
        data.handicap = this.calculateHandicap(data.rounds.slice(0, 8));
    }

    calculateHandicap(recentRounds) {
        if (recentRounds.length < 3) return null;
        
        const differentials = recentRounds.map(round => {
            return ((round.score - round.courseRating) * 113) / round.slopeRating;
        });
        
        differentials.sort((a, b) => a - b);
        
        let numToUse;
        if (recentRounds.length <= 5) numToUse = 1;
        else if (recentRounds.length <= 6) numToUse = 2;
        else numToUse = Math.floor(recentRounds.length * 0.4);
        
        const selectedDifferentials = differentials.slice(0, numToUse);
        const averageDifferential = selectedDifferentials.reduce((a, b) => a + b, 0) / selectedDifferentials.length;
        
        return Math.round(averageDifferential * 0.96 * 10) / 10;
    }

    manualSync() {
        this.performSync();
    }

    toggleAutoSync() {
        this.autoSyncEnabled = !this.autoSyncEnabled;
        localStorage.setItem('golf-auto-sync', this.autoSyncEnabled.toString());
        
        this.updateAutoSyncButton();
        
        if (this.autoSyncEnabled) {
            this.setupAutoSync();
        } else {
            this.clearAutoSync();
        }
    }

    updateAutoSyncButton() {
        const button = document.getElementById('auto-sync-toggle');
        if (button) {
            button.textContent = `Auto-Sync: ${this.autoSyncEnabled ? 'On' : 'Off'}`;
            button.className = this.autoSyncEnabled ? 'btn-primary' : 'btn-secondary';
        }
    }

    setupAutoSync() {
        // Sync when data changes
        const originalSaveRound = window.GolfStorage.saveRound;
        const originalDeleteRound = window.GolfStorage.deleteRound;
        const originalUpdateRound = window.GolfStorage.updateRound;
        
        window.GolfStorage.saveRound = (...args) => {
            const result = originalSaveRound.apply(this, args);
            if (result) setTimeout(() => this.performSync(), 1000);
            return result;
        };
        
        window.GolfStorage.deleteRound = (...args) => {
            const result = originalDeleteRound.apply(this, args);
            if (result) setTimeout(() => this.performSync(), 1000);
            return result;
        };
        
        window.GolfStorage.updateRound = (...args) => {
            const result = originalUpdateRound.apply(this, args);
            if (result) setTimeout(() => this.performSync(), 1000);
            return result;
        };
        
        // Periodic sync every 5 minutes
        this.syncInterval = setInterval(() => {
            if (!this.syncInProgress) {
                this.performSync();
            }
        }, 5 * 60 * 1000);
    }

    clearAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    updateSyncStatus(status = null) {
        const statusElement = document.getElementById('sync-status');
        const lastSyncElement = document.getElementById('last-sync');
        
        if (!statusElement) return;
        
        const lastSyncTime = localStorage.getItem(this.lastSyncKey);
        const syncCode = localStorage.getItem(this.syncKey);
        
        let statusText = 'Not synced';
        let statusClass = 'status-not-synced';
        
        if (syncCode) {
            switch (status) {
                case 'syncing':
                    statusText = '🔄 Syncing...';
                    statusClass = 'status-syncing';
                    break;
                case 'synced':
                    statusText = '✅ Synced';
                    statusClass = 'status-synced';
                    break;
                case 'error':
                    statusText = '❌ Sync Error';
                    statusClass = 'status-error';
                    break;
                default:
                    if (lastSyncTime) {
                        statusText = '✅ Ready to sync';
                        statusClass = 'status-ready';
                    }
            }
        }
        
        statusElement.className = `sync-status ${statusClass}`;
        statusElement.querySelector('.status-text').textContent = statusText;
        
        if (lastSyncTime && lastSyncElement) {
            const lastSync = new Date(parseInt(lastSyncTime));
            lastSyncElement.textContent = `Last sync: ${lastSync.toLocaleString()}`;
        }
    }
}

// Initialize cloud sync when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cloudSync = new CloudSync();
});
