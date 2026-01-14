import { loadImage } from '/content/common/utils/index.js';

/**
 * IconLoader - Centralized icon loading with caching for homeScreen_3DS
 * Prevents redundant network requests for the same icon
 * Supports preloading and lazy loading strategies
 * Now with IndexedDB caching support for persistent storage
 */
export class IconLoader {
    static cache = new Map(); // Memory cache
    static pendingLoads = new Map();
    static useIndexedDB = true; // Enable IndexedDB caching
    static appId = null; // App ID (must be set by app)
    static appVersion = null; // App version (must be set by app)

    /**
     * Initialize IconLoader with app-specific configuration
     * @param {Object} config - Configuration options
     * @param {string} config.appId - Application ID
     * @param {string} config.appVersion - Application version
     * @param {boolean} [config.useIndexedDB=true] - Enable IndexedDB caching
     */
    static init(config = {}) {
        this.appId = config.appId || 'unknown';
        this.appVersion = config.appVersion || '1.0.0';
        this.useIndexedDB = config.useIndexedDB !== false;
        
        console.log(`[IconLoader] Initialized for app: ${this.appId} v${this.appVersion}`);
    }

    /**
     * Loads an icon image with caching (memory + IndexedDB)
     * @param {string} iconPath - Path to the icon
     * @param {Object} options - Loading options
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    static async loadIcon(iconPath, options = {}) {
        const {
            crossOrigin = 'anonymous',
            priority = 'normal', // 'high', 'normal', 'low'
            useCache = this.useIndexedDB,
            appId = this.appId,
            appVersion = this.appVersion
        } = options;

        // Check memory cache first
        if (this.cache.has(iconPath)) {
            console.log(`[IconLoader] Loading icon from memory cache: ${iconPath}`);
            return this.cache.get(iconPath);
        }

        // Check if already loading
        if (this.pendingLoads.has(iconPath)) {
            return this.pendingLoads.get(iconPath);
        }

        // Ensure appId and appVersion are set
        if (!appId || !appVersion) {
            console.warn(`[IconLoader] No appId/appVersion set, using defaults. Call IconLoader.init() first.`);
        }

        // Start loading with IndexedDB caching
        const loadPromise = (async () => {
            try {
                // Use loadImage which automatically uses IndexedDB cache
                const img = await loadImage(iconPath, {
                    appId: appId || 'unknown',
                    appVersion: appVersion || '1.0.0'
                });
                
                // Store in memory cache
                this.cache.set(iconPath, img);
                this.pendingLoads.delete(iconPath);
                return img;
            } catch (error) {
                console.error(`[IconLoader] Failed to load icon: ${iconPath}`, error);
                this.pendingLoads.delete(iconPath);
                throw new Error(`Failed to load icon: ${iconPath}`);
            }
        })();

        this.pendingLoads.set(iconPath, loadPromise);
        return loadPromise;
    }

    /**
     * Preloads multiple icons
     * @param {Array<string>} iconPaths - Array of icon paths to preload
     * @param {Object} options - Loading options
     * @returns {Promise<Array<HTMLImageElement>>} Array of loaded images
     */
    static async preloadIcons(iconPaths, options = {}) {
        console.log(`[IconLoader] Preloading ${iconPaths.length} icons...`);
        const loadPromises = iconPaths.map(path => this.loadIcon(path, options));
        const results = await Promise.all(loadPromises);
        console.log(`[IconLoader] Preloaded ${results.length} icons`);
        return results;
    }

    /**
     * Clears the icon cache (memory only, IndexedDB persists)
     * @param {string} [iconPath] - Optional specific icon to clear, or clear all if not provided
     */
    static clearCache(iconPath = null) {
        if (iconPath) {
            this.cache.delete(iconPath);
            this.pendingLoads.delete(iconPath);
            console.log(`[IconLoader] Cleared memory cache for: ${iconPath}`);
        } else {
            const count = this.cache.size;
            this.cache.clear();
            this.pendingLoads.clear();
            console.log(`[IconLoader] Cleared ${count} icons from memory cache`);
        }
    }

    /**
     * Gets cache statistics
     * @returns {Object} Cache stats
     */
    static getCacheStats() {
        return {
            memoryCache: this.cache.size,
            pending: this.pendingLoads.size,
            total: this.cache.size + this.pendingLoads.size,
            appId: this.appId,
            appVersion: this.appVersion
        };
    }

    /**
     * Checks if an icon is cached in memory
     * @param {string} iconPath - Path to check
     * @returns {boolean} True if cached in memory
     */
    static isCached(iconPath) {
        return this.cache.has(iconPath);
    }

    /**
     * Checks if an icon is currently loading
     * @param {string} iconPath - Path to check
     * @returns {boolean} True if loading
     */
    static isLoading(iconPath) {
        return this.pendingLoads.has(iconPath);
    }
}
