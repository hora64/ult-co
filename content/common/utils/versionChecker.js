/**
 * Version Checker System
 * 
 * Checks app version against jsonSilo API and manages incompatible data cleanup.
 * 
 * Storage:
 * - localStorage key: "app_versionID" (stores current version number)
 * 
 * Version File Format:
 * {
 *   "currentVersionID": 2,
 *   "versions": [
 *     {
 *       "versionID": 1,
 *       "versionName": "1.0.0",
 *       "releaseDate": "2024-01-01",
 *       "description": "Initial release",
 *       "incompatibleLocalStorageKeys": []
 *     },
 *     {
 *       "versionID": 2,
 *       "versionName": "1.1.0",
 *       "releaseDate": "2024-02-01",
 *       "description": "Added new features",
 *       "incompatibleLocalStorageKeys": ["oldFeature_data"]
 *     }
 *   ],
 *   "incompatibleLocalStorageKeys": []  // Global keys to clear on any update
 * }
 * 
 * Loading Priority:
 * 1. API: https://api.jsonsilo.com/public/33a495a7-a715-4d41-a950-d857aea3e3c3
 * 2. If API fails: Skip version check (app continues normally)
 * 
 * Behavior:
 * - If stored versionID != currentVersionID:
 *   1. Identifies all versions between stored and current
 *   2. Collects all incompatibleLocalStorageKeys from those versions
 *   3. Clears collected localStorage keys + global incompatible keys
 *   4. Clears browser cache
 *   5. Updates stored versionID to new version
 * - Supports both upgrades and downgrades
 */

class VersionChecker {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'app_versionID';
        this.apiEndpoint = options.apiEndpoint || 'https://api.jsonsilo.com/public/33a495a7-a715-4d41-a950-d857aea3e3c3';
        this.onVersionChange = options.onVersionChange || null;
        this.clearCacheOnUpdate = options.clearCacheOnUpdate !== undefined ? options.clearCacheOnUpdate : true;
        this.allowDowngrade = options.allowDowngrade !== undefined ? options.allowDowngrade : true;
        this.debug = options.debug || false;
    }

    /**
     * Log debug messages if debug mode is enabled
     */
    log(...args) {
        if (this.debug) {
            console.log('[VersionChecker]', ...args);
        }
    }

    /**
     * Get the stored version ID from localStorage
     * @returns {number|null} The stored version ID or null if not set
     */
    getStoredVersionID() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? parseInt(stored, 10) : null;
    }

    /**
     * Set the stored version ID in localStorage
     * @param {number} versionID - The version ID to store
     */
    setStoredVersionID(versionID) {
        localStorage.setItem(this.storageKey, versionID.toString());
        this.log(`Version ID stored: ${versionID}`);
    }

    /**
     * Fetch the version configuration from API
     * If API fails, skip version check
     * @returns {Promise<Object>} The version configuration object
     */
    async fetchVersionConfig() {
        try {
            this.log(`Fetching version config from API: ${this.apiEndpoint}`);
            const response = await fetch(this.apiEndpoint + '?_=' + Date.now()); // Cache bust
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const config = await response.json();
            this.log('Version config fetched from API:', config);
            
            // Validate config structure
            if (!config.currentVersionID && !config.versionID) {
                throw new Error('Invalid config: missing currentVersionID or versionID');
            }
            
            // Normalize config format (support both currentVersionID and versionID)
            if (!config.currentVersionID && config.versionID) {
                config.currentVersionID = config.versionID;
            }
            
            console.log('[VersionChecker] Successfully loaded version config from API');
            return config;
        } catch (error) {
            console.warn('[VersionChecker] Failed to load version config from API:', error.message);
            console.log('[VersionChecker] Version check will be skipped. App will continue normally.');
            throw new Error('API version source failed - version check skipped');
        }
    }

    /**
     * Get all incompatible keys from versions between storedID and currentID
     * Supports both upgrades (stored < current) and downgrades (stored > current)
     * @param {Object} config - Version configuration
     * @param {number} storedVersionID - Stored version ID
     * @param {number} currentVersionID - Current version ID
     * @returns {string[]} Array of all incompatible localStorage keys
     */
    getIncompatibleKeysForVersionRange(config, storedVersionID, currentVersionID) {
        const allIncompatibleKeys = new Set();
        
        // Add global incompatible keys
        if (config.incompatibleLocalStorageKeys && Array.isArray(config.incompatibleLocalStorageKeys)) {
            config.incompatibleLocalStorageKeys.forEach(key => allIncompatibleKeys.add(key));
        }
        
        // If versions array exists, collect keys from versions in range
        if (config.versions && Array.isArray(config.versions)) {
            let versionsToProcess;
            
            if (storedVersionID < currentVersionID) {
                // Upgrade: process versions FROM stored TO current (exclusive stored, inclusive current)
                versionsToProcess = config.versions.filter(v => 
                    v.versionID > storedVersionID && v.versionID <= currentVersionID
                );
                this.log(`Upgrading: ${storedVersionID} → ${currentVersionID}`);
            } else if (storedVersionID > currentVersionID) {
                // Downgrade: process versions FROM current TO stored (inclusive current, exclusive stored)
                versionsToProcess = config.versions.filter(v => 
                    v.versionID >= currentVersionID && v.versionID < storedVersionID
                );
                this.log(`Downgrading: ${storedVersionID} → ${currentVersionID}`);
            } else {
                versionsToProcess = [];
            }
            
            versionsToProcess.forEach(version => {
                if (version.incompatibleLocalStorageKeys && Array.isArray(version.incompatibleLocalStorageKeys)) {
                    version.incompatibleLocalStorageKeys.forEach(key => allIncompatibleKeys.add(key));
                }
            });
            
            if (versionsToProcess.length > 0) {
                this.log(`Processing ${versionsToProcess.length} version(s) for incompatible keys`);
                versionsToProcess.forEach(v => {
                    this.log(`  - Version ${v.versionID} (${v.versionName || 'unnamed'}): ${v.incompatibleLocalStorageKeys?.length || 0} keys`);
                });
            }
        }
        
        return Array.from(allIncompatibleKeys);
    }

    /**
     * Get version details by ID
     * @param {Object} config - Version configuration
     * @param {number} versionID - Version ID to find
     * @returns {Object|null} Version details or null if not found
     */
    getVersionDetails(config, versionID) {
        if (!config.versions || !Array.isArray(config.versions)) {
            return null;
        }
        
        return config.versions.find(v => v.versionID === versionID) || null;
    }

    /**
     * Clear specific localStorage keys
     * @param {string[]} keys - Array of localStorage keys to clear
     */
    clearLocalStorageKeys(keys) {
        if (!keys || keys.length === 0) {
            this.log('No localStorage keys to clear');
            return;
        }

        this.log(`Clearing ${keys.length} localStorage keys:`, keys);
        
        let clearedCount = 0;
        keys.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                this.log(`  ✓ Cleared: ${key}`);
                clearedCount++;
            } else {
                this.log(`  - Not found: ${key}`);
            }
        });
        
        console.log(`[VersionChecker] Cleared ${clearedCount}/${keys.length} localStorage keys`);
    }

    /**
     * Clear browser caches (Cache API, sessionStorage)
     */
    async clearUserCache() {
        this.log('Clearing user cache...');
        
        try {
            // Clear sessionStorage
            sessionStorage.clear();
            this.log('  sessionStorage cleared');

            // Clear Cache API
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        this.log(`  Clearing cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
                this.log(`  ${cacheNames.length} cache(s) cleared`);
            }

            // Clear IndexedDB (optional - can be aggressive)
            if ('indexedDB' in window && window.indexedDB.databases) {
                const databases = await window.indexedDB.databases();
                databases.forEach(db => {
                    this.log(`  Deleting IndexedDB: ${db.name}`);
                    window.indexedDB.deleteDatabase(db.name);
                });
            }

            this.log('User cache cleared successfully');
        } catch (error) {
            console.error('[VersionChecker] Error clearing cache:', error);
        }
    }

    /**
     * Main version check function
     * Compares stored version with remote version and handles updates
     * Supports both upgrades and downgrades
     * 
     * @returns {Promise<Object>} Result object with version information
     */
    async checkVersion() {
        try {
            this.log('Starting version check...');
            
            // Get stored version
            const storedVersionID = this.getStoredVersionID();
            this.log(`Stored version ID: ${storedVersionID}`);
            
            // Fetch current version config from API
            const config = await this.fetchVersionConfig();
            const currentVersionID = config.currentVersionID;
            
            this.log(`Current version ID: ${currentVersionID}`);
            
            // Determine if this is first run
            const isFirstRun = storedVersionID === null;
            
            // Determine if version has changed
            const hasChanged = storedVersionID !== null && storedVersionID !== currentVersionID;
            const isUpgrade = storedVersionID !== null && storedVersionID < currentVersionID;
            const isDowngrade = storedVersionID !== null && storedVersionID > currentVersionID;
            
            const result = {
                currentVersionID,
                storedVersionID,
                hasChanged,
                isFirstRun,
                isUpgrade,
                isDowngrade,
                dataCleared: false,
                clearedKeys: [],
                versionsProcessed: []
            };

            if (isFirstRun) {
                // First run - just store the version, don't clear anything
                console.log('[VersionChecker] First run detected. Initializing version tracking.');
                this.setStoredVersionID(currentVersionID);
                
                // Get current version details if available
                const currentVersion = this.getVersionDetails(config, currentVersionID);
                if (currentVersion) {
                    console.log(`[VersionChecker] Current version: ${currentVersion.versionName || currentVersionID}`);
                }
                
                result.dataCleared = false;
                
            } else if (hasChanged) {
                // Check if downgrade is allowed
                if (isDowngrade && !this.allowDowngrade) {
                    console.warn(`[VersionChecker] Version downgrade detected but not allowed: ${storedVersionID} → ${currentVersionID}`);
                    console.warn('[VersionChecker] Keeping stored version. Set allowDowngrade: true to enable downgrades.');
                    return result;
                }
                
                // Version has changed - clear incompatible data
                const storedVersion = this.getVersionDetails(config, storedVersionID);
                const currentVersion = this.getVersionDetails(config, currentVersionID);
                
                const changeType = isUpgrade ? 'upgrade' : 'downgrade';
                console.log(`[VersionChecker] Version ${changeType} detected: ${storedVersionID} → ${currentVersionID}`);
                if (storedVersion && currentVersion) {
                    console.log(`[VersionChecker] ${storedVersion.versionName || storedVersionID} → ${currentVersion.versionName || currentVersionID}`);
                }
                
                if (this.clearCacheOnUpdate) {
                    // Get all incompatible keys from versions in range
                    const incompatibleKeys = this.getIncompatibleKeysForVersionRange(
                        config, 
                        storedVersionID, 
                        currentVersionID
                    );
                    
                    this.log(`Total incompatible keys to clear: ${incompatibleKeys.length}`);
                    
                    // Clear incompatible localStorage keys
                    this.clearLocalStorageKeys(incompatibleKeys);
                    
                    // Clear user cache
                    await this.clearUserCache();
                    
                    result.dataCleared = true;
                    result.clearedKeys = incompatibleKeys;
                    
                    // Get list of processed versions
                    if (config.versions && Array.isArray(config.versions)) {
                        if (isUpgrade) {
                            result.versionsProcessed = config.versions
                                .filter(v => v.versionID > storedVersionID && v.versionID <= currentVersionID)
                                .map(v => ({
                                    versionID: v.versionID,
                                    versionName: v.versionName,
                                    description: v.description
                                }));
                        } else if (isDowngrade) {
                            result.versionsProcessed = config.versions
                                .filter(v => v.versionID >= currentVersionID && v.versionID < storedVersionID)
                                .map(v => ({
                                    versionID: v.versionID,
                                    versionName: v.versionName,
                                    description: v.description
                                }));
                        }
                    }
                    
                    console.log('[VersionChecker] Incompatible data and cache cleared.');
                }
                
                // Update stored version
                this.setStoredVersionID(currentVersionID);
                
                // Call custom callback if provided
                if (typeof this.onVersionChange === 'function') {
                    await this.onVersionChange(currentVersionID, storedVersionID, result);
                }
                
            } else {
                // Version matches - no action needed
                this.log('Version check complete. No updates needed.');
            }
            
            return result;
            
        } catch (error) {
            console.warn('[VersionChecker] Version check skipped:', error.message);
            // Don't throw - allow app to continue even if version check fails
            return {
                currentVersionID: null,
                storedVersionID: this.getStoredVersionID(),
                hasChanged: false,
                isFirstRun: false,
                isUpgrade: false,
                isDowngrade: false,
                dataCleared: false,
                clearedKeys: [],
                versionsProcessed: [],
                error: error.message,
                skipped: true
            };
        }
    }

    /**
     * Get version information without making changes
     * @returns {Promise<Object>} Version information
     */
    async getVersionInfo() {
        try {
            const storedVersionID = this.getStoredVersionID();
            const config = await this.fetchVersionConfig();
            const currentVersionID = config.currentVersionID;
            
            const storedVersion = this.getVersionDetails(config, storedVersionID);
            const currentVersion = this.getVersionDetails(config, currentVersionID);
            
            // Get incompatible keys if there would be an update
            let incompatibleKeys = [];
            let affectedVersions = [];
            
            if (storedVersionID !== null && storedVersionID !== currentVersionID) {
                incompatibleKeys = this.getIncompatibleKeysForVersionRange(
                    config,
                    storedVersionID,
                    currentVersionID
                );
                
                if (config.versions && Array.isArray(config.versions)) {
                    if (storedVersionID < currentVersionID) {
                        // Upgrade
                        affectedVersions = config.versions
                            .filter(v => v.versionID > storedVersionID && v.versionID <= currentVersionID)
                            .map(v => ({
                                versionID: v.versionID,
                                versionName: v.versionName,
                                description: v.description,
                                releaseDate: v.releaseDate,
                                incompatibleKeys: v.incompatibleLocalStorageKeys || []
                            }));
                    } else if (storedVersionID > currentVersionID) {
                        // Downgrade
                        affectedVersions = config.versions
                            .filter(v => v.versionID >= currentVersionID && v.versionID < storedVersionID)
                            .map(v => ({
                                versionID: v.versionID,
                                versionName: v.versionName,
                                description: v.description,
                                releaseDate: v.releaseDate,
                                incompatibleKeys: v.incompatibleLocalStorageKeys || []
                            }));
                    }
                }
            }
            
            return {
                currentVersionID,
                currentVersionName: currentVersion?.versionName || null,
                currentVersionDescription: currentVersion?.description || null,
                storedVersionID,
                storedVersionName: storedVersion?.versionName || null,
                match: storedVersionID === currentVersionID,
                isFirstRun: storedVersionID === null,
                isUpgrade: storedVersionID !== null && storedVersionID < currentVersionID,
                isDowngrade: storedVersionID !== null && storedVersionID > currentVersionID,
                incompatibleKeys,
                affectedVersions,
                allVersions: config.versions || [],
                globalIncompatibleKeys: config.incompatibleLocalStorageKeys || []
            };
        } catch (error) {
            console.error('[VersionChecker] Failed to get version info:', error);
            return {
                currentVersionID: null,
                currentVersionName: null,
                currentVersionDescription: null,
                storedVersionID: this.getStoredVersionID(),
                storedVersionName: null,
                match: false,
                isFirstRun: this.getStoredVersionID() === null,
                isUpgrade: false,
                isDowngrade: false,
                incompatibleKeys: [],
                affectedVersions: [],
                allVersions: [],
                globalIncompatibleKeys: [],
                error: error.message
            };
        }
    }

    /**
     * Force update: clear cache and update to latest version
     * @returns {Promise<void>}
     */
    async forceUpdate() {
        console.log('[VersionChecker] Force update initiated');
        
        try {
            const config = await this.fetchVersionConfig();
            const storedVersionID = this.getStoredVersionID() || 0;
            const currentVersionID = config.currentVersionID;
            
            // Get all incompatible keys
            const incompatibleKeys = this.getIncompatibleKeysForVersionRange(
                config,
                storedVersionID,
                currentVersionID
            );
            
            // Clear incompatible keys
            this.clearLocalStorageKeys(incompatibleKeys);
            
            // Clear cache
            await this.clearUserCache();
            
            // Update version
            this.setStoredVersionID(config.currentVersionID);
            
            console.log('[VersionChecker] Force update complete');
        } catch (error) {
            console.error('[VersionChecker] Force update failed:', error);
            throw error;
        }
    }

    /**
     * Clear all user data (localStorage, sessionStorage, caches, IndexedDB)
     * Does NOT update version number
     * @returns {Promise<void>}
     */
    async clearAllUserData() {
        console.log('[VersionChecker] Clearing all user data...');
        
        // Store version before clearing
        const versionID = this.getStoredVersionID();
        
        // Clear all localStorage
        localStorage.clear();
        this.log('localStorage cleared');
        
        // Restore version
        if (versionID !== null) {
            this.setStoredVersionID(versionID);
        }
        
        // Clear other caches
        await this.clearUserCache();
        
        console.log('[VersionChecker] All user data cleared');
    }

    /**
     * Get changelog between two versions
     * @param {number} fromVersionID - Starting version ID
     * @param {number} toVersionID - Ending version ID (defaults to current)
     * @returns {Promise<Array>} Array of version changes
     */
    async getChangelog(fromVersionID, toVersionID = null) {
        try {
            const config = await this.fetchVersionConfig();
            const targetVersionID = toVersionID || config.currentVersionID;
            
            if (!config.versions || !Array.isArray(config.versions)) {
                return [];
            }
            
            const isUpgrade = fromVersionID < targetVersionID;
            
            return config.versions
                .filter(v => isUpgrade 
                    ? (v.versionID > fromVersionID && v.versionID <= targetVersionID)
                    : (v.versionID >= targetVersionID && v.versionID < fromVersionID)
                )
                .sort((a, b) => isUpgrade ? a.versionID - b.versionID : b.versionID - a.versionID)
                .map(v => ({
                    versionID: v.versionID,
                    versionName: v.versionName || `Version ${v.versionID}`,
                    description: v.description || 'No description available',
                    releaseDate: v.releaseDate || 'Unknown',
                    incompatibleKeys: v.incompatibleLocalStorageKeys || []
                }));
        } catch (error) {
            console.error('[VersionChecker] Failed to get changelog:', error);
            return [];
        }
    }
}

// Create and export singleton instance with default configuration
export const versionChecker = new VersionChecker({
    debug: false, // Set to true for detailed logging
    allowDowngrade: true // Allow version downgrades
});

// Also export the class for custom instances
export default VersionChecker;
