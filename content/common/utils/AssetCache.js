/**
 * AssetCache - IndexedDB-based asset caching system using Dexie.js
 * Provides automatic caching for images, audio, models, and other assets
 * with version management and automatic cache invalidation
 */

// Dexie will be loaded dynamically
let Dexie = null;
let dexieLoadPromise = null;

/**
 * Load Dexie.js from CDN
 * @returns {Promise<void>}
 */
async function loadDexie() {
    if (dexieLoadPromise) {
        return dexieLoadPromise;
    }

    dexieLoadPromise = (async () => {
        try {
            const DexieModule = await import('https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs');
            Dexie = DexieModule.default || DexieModule.Dexie;
            console.log('[AssetCache] Dexie.js loaded successfully');
        } catch (error) {
            console.warn('[AssetCache] Failed to load Dexie.js from CDN:', error);
            console.warn('[AssetCache] Cache functionality will be disabled');
        }
    })();

    return dexieLoadPromise;
}

export class AssetCache {
    constructor(dbName = 'ult-co-assets', version = 2) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.initPromise = null;
        this.isAvailable = false;
    }

    /**
     * Initialize the IndexedDB database
     * @private
     */
    async init() {
        // Load Dexie if not already loaded
        if (!Dexie) {
            await loadDexie();
        }

        if (!Dexie) {
            throw new Error('[AssetCache] Dexie.js is required for AssetCache');
        }

        try {
            this.db = new Dexie(this.dbName);

            // Define database schema
            this.db.version(this.version).stores({
                images: 'url, timestamp, appId, appVersion',
                audio: 'url, timestamp, appId, appVersion',
                models: 'url, timestamp, appId, appVersion',
                other: 'url, timestamp, appId, appVersion',
                appVersions: 'appId, version, lastUpdated'
            });

            await this.db.open();
            this.isAvailable = true;
            console.log('[AssetCache] Database initialized:', this.dbName);

            // Check and clean up old app versions
            await this.checkAppVersions();
        } catch (error) {
            console.error('[AssetCache] Failed to initialize database:', error);
            this.isAvailable = false;
            throw error;
        }
    }

    /**
     * Ensure database is ready
     * @private
     */
    async ensureReady() {
        if (!this.initPromise) {
            this.initPromise = this.init();
        }
        await this.initPromise;
        
        if (!this.isAvailable) {
            throw new Error('[AssetCache] Cache not available');
        }
    }

    /**
     * Check app versions and clear outdated caches
     * @private
     */
    async checkAppVersions() {
        try {
            const versions = await this.db.appVersions.toArray();
            console.log('[AssetCache] Registered app versions:', versions);
        } catch (error) {
            console.error('[AssetCache] Failed to check app versions:', error);
        }
    }

    /**
     * Register or update an app version
     * Clears old cache if version has changed
     * @param {string} appId - Application ID
     * @param {string} version - Application version
     */
    async registerAppVersion(appId, version) {
        await this.ensureReady();

        try {
            const existing = await this.db.appVersions.get(appId);

            if (existing && existing.version !== version) {
                console.log(`[AssetCache] Version changed for ${appId}: ${existing.version} -> ${version}`);
                console.log(`[AssetCache] Clearing old cache for ${appId}...`);
                await this.clearAppCache(appId);
            }

            // Update version record
            await this.db.appVersions.put({
                appId,
                version,
                lastUpdated: Date.now()
            });

            console.log(`[AssetCache] Registered ${appId} version ${version}`);
        } catch (error) {
            console.error(`[AssetCache] Failed to register app version for ${appId}:`, error);
        }
    }

    /**
     * Get the table name for a URL
     * @param {string} url - Asset URL
     * @returns {string} Table name
     * @private
     */
    getTableForUrl(url) {
        const lower = url.toLowerCase();
        if (lower.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/)) return 'images';
        if (lower.match(/\.(mp3|ogg|wav|m4a|aac|flac)$/)) return 'audio';
        if (lower.match(/\.(glb|gltf)$/)) return 'models';
        return 'other';
    }

    /**
     * Store an asset in cache
     * @param {string} url - Asset URL (used as key)
     * @param {Blob|ArrayBuffer|string} data - Asset data
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<void>}
     */
    async set(url, data, metadata = {}) {
        await this.ensureReady();

        const table = this.getTableForUrl(url);
        const entry = {
            url,
            data,
            timestamp: Date.now(),
            appId: metadata.appId || 'unknown',
            appVersion: metadata.appVersion || '1.0.0',
            contentType: metadata.contentType || '',
            size: metadata.size || (data.size || data.byteLength || 0)
        };

        try {
            await this.db[table].put(entry);
            console.log(`[AssetCache] Cached ${table}: ${url} (${entry.size} bytes)`);
        } catch (error) {
            console.error(`[AssetCache] Failed to cache ${url}:`, error);
            throw error;
        }
    }

    /**
     * Retrieve an asset from cache
     * @param {string} url - Asset URL
     * @returns {Promise<Object|null>} Cached entry or null
     */
    async get(url) {
        await this.ensureReady();

        const table = this.getTableForUrl(url);

        try {
            const entry = await this.db[table].get(url);
            if (entry) {
                console.log(`[AssetCache] Cache hit: ${url}`);
                return entry;
            } else {
                console.log(`[AssetCache] Cache miss: ${url}`);
                return null;
            }
        } catch (error) {
            console.error(`[AssetCache] Failed to get ${url}:`, error);
            return null;
        }
    }

    /**
     * Check if an asset is cached
     * @param {string} url - Asset URL
     * @returns {Promise<boolean>}
     */
    async has(url) {
        const entry = await this.get(url);
        return !!entry;
    }

    /**
     * Delete an asset from cache
     * @param {string} url - Asset URL
     * @returns {Promise<void>}
     */
    async delete(url) {
        await this.ensureReady();

        const table = this.getTableForUrl(url);

        try {
            await this.db[table].delete(url);
            console.log(`[AssetCache] Deleted from cache: ${url}`);
        } catch (error) {
            console.error(`[AssetCache] Failed to delete ${url}:`, error);
            throw error;
        }
    }

    /**
     * Clear all cached assets for a specific app
     * @param {string} appId - Application ID
     * @returns {Promise<number>} Number of items deleted
     */
    async clearAppCache(appId) {
        await this.ensureReady();

        let totalDeleted = 0;
        const tables = ['images', 'audio', 'models', 'other'];

        try {
            for (const tableName of tables) {
                const deleted = await this.db[tableName]
                    .where('appId')
                    .equals(appId)
                    .delete();
                totalDeleted += deleted;
            }

            console.log(`[AssetCache] Cleared ${totalDeleted} cached assets for ${appId}`);
            return totalDeleted;
        } catch (error) {
            console.error(`[AssetCache] Failed to clear cache for ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Clear all cached assets
     * @returns {Promise<void>}
     */
    async clearAll() {
        await this.ensureReady();

        try {
            await this.db.images.clear();
            await this.db.audio.clear();
            await this.db.models.clear();
            await this.db.other.clear();
            console.log('[AssetCache] Cleared all cached assets');
        } catch (error) {
            console.error('[AssetCache] Failed to clear all caches:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStats() {
        await this.ensureReady();

        try {
            const [images, audio, models, other, apps] = await Promise.all([
                this.db.images.count(),
                this.db.audio.count(),
                this.db.models.count(),
                this.db.other.count(),
                this.db.appVersions.toArray()
            ]);

            return {
                images,
                audio,
                models,
                other,
                total: images + audio + models + other,
                apps: apps.map(app => ({
                    appId: app.appId,
                    version: app.version,
                    lastUpdated: new Date(app.lastUpdated).toISOString()
                }))
            };
        } catch (error) {
            console.error('[AssetCache] Failed to get stats:', error);
            return {
                images: 0,
                audio: 0,
                models: 0,
                other: 0,
                total: 0,
                apps: []
            };
        }
    }

    /**
     * Get cache statistics for a specific app
     * @param {string} appId - Application ID
     * @returns {Promise<Object>} App-specific statistics
     */
    async getAppStats(appId) {
        await this.ensureReady();

        try {
            const [images, audio, models, other] = await Promise.all([
                this.db.images.where('appId').equals(appId).count(),
                this.db.audio.where('appId').equals(appId).count(),
                this.db.models.where('appId').equals(appId).count(),
                this.db.other.where('appId').equals(appId).count()
            ]);

            const version = await this.db.appVersions.get(appId);

            return {
                appId,
                version: version ? version.version : 'unknown',
                lastUpdated: version ? new Date(version.lastUpdated).toISOString() : null,
                images,
                audio,
                models,
                other,
                total: images + audio + models + other
            };
        } catch (error) {
            console.error(`[AssetCache] Failed to get stats for ${appId}:`, error);
            return {
                appId,
                version: 'unknown',
                lastUpdated: null,
                images: 0,
                audio: 0,
                models: 0,
                other: 0,
                total: 0
            };
        }
    }

    /**
     * Get all cached URLs for a specific app
     * @param {string} appId - Application ID
     * @returns {Promise<string[]>} Array of cached URLs
     */
    async getAppUrls(appId) {
        await this.ensureReady();

        const tables = ['images', 'audio', 'models', 'other'];
        const urls = [];

        try {
            for (const tableName of tables) {
                const items = await this.db[tableName]
                    .where('appId')
                    .equals(appId)
                    .toArray();
                urls.push(...items.map(item => item.url));
            }

            return urls;
        } catch (error) {
            console.error(`[AssetCache] Failed to get URLs for ${appId}:`, error);
            return [];
        }
    }

    /**
     * Clean up old cached assets (older than specified days)
     * @param {number} days - Number of days to keep
     * @returns {Promise<number>} Number of items deleted
     */
    async cleanupOldAssets(days = 30) {
        await this.ensureReady();

        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const tables = ['images', 'audio', 'models', 'other'];
        let totalDeleted = 0;

        try {
            for (const tableName of tables) {
                const deleted = await this.db[tableName]
                    .where('timestamp')
                    .below(cutoffTime)
                    .delete();
                totalDeleted += deleted;
            }

            console.log(`[AssetCache] Cleaned up ${totalDeleted} assets older than ${days} days`);
            return totalDeleted;
        } catch (error) {
            console.error('[AssetCache] Failed to cleanup old assets:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
export const assetCache = new AssetCache();

// Auto-register window for debugging
if (typeof window !== 'undefined') {
    window.assetCache = assetCache;
}
