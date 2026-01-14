/**
 * AssetPreloader - Batch asset preloading utility
 * Preloads multiple assets with progress tracking, parallel loading, and retry logic
 */

import { assetCache } from './AssetCache.js';
import { ModelLoader } from './ModelLoader.js';

export class AssetPreloader {
    constructor(options = {}) {
        this.appId = options.appId || 'unknown';
        this.appVersion = options.appVersion || '1.0.0';
        this.maxConcurrent = options.maxConcurrent || 3;
        this.retryAttempts = options.retryAttempts || 2;
        this.retryDelay = options.retryDelay || 1000;
        
        this.modelLoader = options.modelLoader || null;
        this.THREE = options.THREE || null;
        this.GLTFLoader = options.GLTFLoader || null;
        
        // If THREE and GLTFLoader provided but no modelLoader, create one
        if (!this.modelLoader && this.THREE && this.GLTFLoader) {
            this.modelLoader = new ModelLoader({
                THREE: this.THREE,
                GLTFLoader: this.GLTFLoader,
                appId: this.appId,
                appVersion: this.appVersion
            });
        }
        
        this.loadedAssets = new Map();
        this.failedAssets = new Map();
    }

    /**
     * Get asset type from URL
     * @param {string} url - Asset URL
     * @returns {string} Asset type
     * @private
     */
    getAssetType(url) {
        const lower = url.toLowerCase();
        if (lower.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/)) return 'image';
        if (lower.match(/\.(mp3|ogg|wav|m4a|aac|flac)$/)) return 'audio';
        if (lower.match(/\.(glb|gltf)$/)) return 'model';
        if (lower.match(/\.(json)$/)) return 'json';
        if (lower.match(/\.(css)$/)) return 'css';
        if (lower.match(/\.(js)$/)) return 'script';
        // Texture files (same as images but may be used differently)
        if (lower.match(/\.(dds|ktx|basis)$/)) return 'texture';
        return 'other';
    }

    /**
     * Preload a single image
     * @param {string} url - Image URL
     * @param {Object} options - Options
     * @returns {Promise<HTMLImageElement>}
     * @private
     */
    async preloadImage(url, options = {}) {
        const { useCache = true } = options;

        // Check cache first
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    const cached = await assetCache.get(url);
                    if (cached && cached.data) {
                        console.log(`[AssetPreloader] Loading image from IndexedDB cache: ${url}`);
                        const blob = cached.data;
                        const objectUrl = URL.createObjectURL(blob);
                        
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.onload = () => {
                                URL.revokeObjectURL(objectUrl);
                                resolve(img);
                            };
                            img.onerror = () => {
                                URL.revokeObjectURL(objectUrl);
                                reject(new Error(`Failed to load cached image: ${url}`));
                            };
                            img.src = objectUrl;
                        });
                    }
                }
            } catch (error) {
                console.warn(`[AssetPreloader] Cache check failed for ${url}:`, error);
            }
        }

        // Load from network
        console.log(`[AssetPreloader] Loading image from network: ${url}`);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = async () => {
                // Cache the image
                if (useCache) {
                    try {
                        await assetCache.ensureReady();
                        if (assetCache.isAvailable) {
                            const response = await fetch(url);
                            const blob = await response.blob();
                            await assetCache.set(url, blob, {
                                appId: this.appId,
                                appVersion: this.appVersion,
                                contentType: response.headers.get('content-type'),
                                size: blob.size
                            });
                            console.log(`[AssetPreloader] Cached image to IndexedDB: ${url} (${blob.size} bytes)`);
                        }
                    } catch (cacheError) {
                        console.warn(`[AssetPreloader] Failed to cache ${url}:`, cacheError);
                    }
                }
                resolve(img);
            };
            
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    /**
     * Preload a texture (for use with THREE.js)
     * @param {string} url - Texture URL
     * @param {Object} options - Options
     * @returns {Promise<THREE.Texture|Blob>}
     * @private
     */
    async preloadTexture(url, options = {}) {
        const { useCache = true, returnThreeTexture = false } = options;

        // Check cache first
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    const cached = await assetCache.get(url);
                    if (cached && cached.data) {
                        console.log(`[AssetPreloader] Loading texture from IndexedDB cache: ${url}`);
                        const blob = cached.data;
                        
                        // If THREE.js texture requested and THREE is available
                        if (returnThreeTexture && this.THREE) {
                            const objectUrl = URL.createObjectURL(blob);
                            const textureLoader = new this.THREE.TextureLoader();
                            
                            return new Promise((resolve, reject) => {
                                textureLoader.load(
                                    objectUrl,
                                    (texture) => {
                                        URL.revokeObjectURL(objectUrl);
                                        resolve(texture);
                                    },
                                    undefined,
                                    (error) => {
                                        URL.revokeObjectURL(objectUrl);
                                        reject(error);
                                    }
                                );
                            });
                        }
                        
                        // Otherwise return blob
                        return blob;
                    }
                }
            } catch (error) {
                console.warn(`[AssetPreloader] Cache check failed for ${url}:`, error);
            }
        }

        // Load from network
        console.log(`[AssetPreloader] Loading texture from network: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Cache the texture
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    await assetCache.set(url, blob, {
                        appId: this.appId,
                        appVersion: this.appVersion,
                        contentType: response.headers.get('content-type'),
                        size: blob.size
                    });
                    console.log(`[AssetPreloader] Cached texture to IndexedDB: ${url} (${blob.size} bytes)`);
                }
            } catch (cacheError) {
                console.warn(`[AssetPreloader] Failed to cache ${url}:`, cacheError);
            }
        }

        // If THREE.js texture requested
        if (returnThreeTexture && this.THREE) {
            const objectUrl = URL.createObjectURL(blob);
            const textureLoader = new this.THREE.TextureLoader();
            
            return new Promise((resolve, reject) => {
                textureLoader.load(
                    objectUrl,
                    (texture) => {
                        URL.revokeObjectURL(objectUrl);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        URL.revokeObjectURL(objectUrl);
                        reject(error);
                    }
                );
            });
        }

        return blob;
    }

    /**
     * Preload a single audio file
     * @param {string} url - Audio URL
     * @param {Object} options - Options
     * @returns {Promise<ArrayBuffer>}
     * @private
     */
    async preloadAudio(url, options = {}) {
        const { useCache = true, decodeAudio = false } = options;

        // Check cache first
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    const cached = await assetCache.get(url);
                    if (cached && cached.data) {
                        console.log(`[AssetPreloader] Loading audio from IndexedDB cache: ${url}`);
                        const arrayBuffer = await cached.data.arrayBuffer();
                        
                        // Decode audio if requested and AudioContext available
                        if (decodeAudio && typeof AudioContext !== 'undefined') {
                            const audioContext = new AudioContext();
                            try {
                                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
                                console.log(`[AssetPreloader] Decoded cached audio: ${url}`);
                                return audioBuffer;
                            } catch (decodeError) {
                                console.warn(`[AssetPreloader] Failed to decode cached audio:`, decodeError);
                                return arrayBuffer;
                            }
                        }
                        
                        return arrayBuffer;
                    }
                }
            } catch (error) {
                console.warn(`[AssetPreloader] Cache check failed for ${url}:`, error);
            }
        }

        // Load from network
        console.log(`[AssetPreloader] Loading audio from network: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Cache the audio
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    await assetCache.set(url, blob, {
                        appId: this.appId,
                        appVersion: this.appVersion,
                        contentType: response.headers.get('content-type'),
                        size: blob.size
                    });
                    console.log(`[AssetPreloader] Cached audio to IndexedDB: ${url} (${blob.size} bytes)`);
                }
            } catch (cacheError) {
                console.warn(`[AssetPreloader] Failed to cache ${url}:`, cacheError);
            }
        }

        const arrayBuffer = await blob.arrayBuffer();
        
        // Decode audio if requested
        if (decodeAudio && typeof AudioContext !== 'undefined') {
            const audioContext = new AudioContext();
            try {
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
                console.log(`[AssetPreloader] Decoded audio: ${url}`);
                return audioBuffer;
            } catch (decodeError) {
                console.warn(`[AssetPreloader] Failed to decode audio:`, decodeError);
                return arrayBuffer;
            }
        }

        return arrayBuffer;
    }

    /**
     * Preload a single model
     * @param {string} url - Model URL
     * @param {Object} options - Options
     * @returns {Promise<Object>}
     * @private
     */
    async preloadModel(url, options = {}) {
        if (!this.modelLoader) {
            throw new Error('[AssetPreloader] ModelLoader not available. Provide THREE and GLTFLoader in constructor.');
        }

        return await this.modelLoader.load(url, {
            useCache: options.useCache !== false,
            forceRefresh: options.forceRefresh || false
        });
    }

    /**
     * Preload a single JSON file
     * @param {string} url - JSON URL
     * @param {Object} options - Options
     * @returns {Promise<Object>}
     * @private
     */
    async preloadJSON(url, options = {}) {
        const { useCache = true } = options;

        // Check cache first
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    const cached = await assetCache.get(url);
                    if (cached && cached.data) {
                        const text = await cached.data.text();
                        return JSON.parse(text);
                    }
                }
            } catch (error) {
                console.warn(`[AssetPreloader] Cache check failed for ${url}:`, error);
            }
        }

        // Load from network
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        // Cache the JSON
        if (useCache) {
            try {
                await assetCache.ensureReady();
                if (assetCache.isAvailable) {
                    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
                    await assetCache.set(url, blob, {
                        appId: this.appId,
                        appVersion: this.appVersion,
                        contentType: 'application/json'
                    });
                }
            } catch (cacheError) {
                console.warn(`[AssetPreloader] Failed to cache ${url}:`, cacheError);
            }
        }

        return json;
    }

    /**
     * Preload a single asset (auto-detect type)
     * @param {string} url - Asset URL
     * @param {Object} options - Options
     * @returns {Promise<any>}
     */
    async preload(url, options = {}) {
        const type = options.type || this.getAssetType(url);

        try {
            let result;
            
            switch (type) {
                case 'image':
                    result = await this.preloadImage(url, options);
                    break;
                case 'texture':
                    result = await this.preloadTexture(url, options);
                    break;
                case 'audio':
                    result = await this.preloadAudio(url, options);
                    break;
                case 'model':
                    result = await this.preloadModel(url, options);
                    break;
                case 'json':
                    result = await this.preloadJSON(url, options);
                    break;
                default:
                    // Generic fetch for other types
                    const response = await fetch(url);
                    result = await response.blob();
                    
                    if (options.useCache !== false) {
                        try {
                            await assetCache.ensureReady();
                            if (assetCache.isAvailable) {
                                await assetCache.set(url, result, {
                                    appId: this.appId,
                                    appVersion: this.appVersion,
                                    contentType: response.headers.get('content-type'),
                                    size: result.size
                                });
                            }
                        } catch (cacheError) {
                            console.warn(`[AssetPreloader] Failed to cache ${url}:`, cacheError);
                        }
                    }
            }

            this.loadedAssets.set(url, result);
            return result;
        } catch (error) {
            console.error(`[AssetPreloader] Failed to preload ${url}:`, error);
            this.failedAssets.set(url, error);
            throw error;
        }
    }

    /**
     * Preload multiple assets with concurrency control
     * @param {string[]} urls - Array of asset URLs
     * @param {Object} options - Options
     * @returns {Promise<Map>}
     */
    async preloadAll(urls, options = {}) {
        const {
            onProgress = null,
            onError = null,
            stopOnError = false,
            useCache = true
        } = options;

        const results = new Map();
        const errors = new Map();
        let completed = 0;
        let active = 0;
        let index = 0;

        return new Promise((resolve, reject) => {
            const loadNext = async () => {
                if (index >= urls.length) {
                    if (active === 0) {
                        // All done
                        if (stopOnError && errors.size > 0) {
                            reject(errors);
                        } else {
                            resolve(results);
                        }
                    }
                    return;
                }

                const url = urls[index++];
                active++;

                try {
                    const result = await this.preload(url, { useCache });
                    results.set(url, result);
                } catch (error) {
                    errors.set(url, error);
                    
                    if (onError) {
                        onError(url, error);
                    }
                    
                    if (stopOnError) {
                        reject(errors);
                        return;
                    }
                }

                completed++;
                active--;

                if (onProgress) {
                    onProgress(completed, urls.length, url);
                }

                loadNext();
            };

            // Start concurrent loads
            const concurrent = Math.min(this.maxConcurrent, urls.length);
            for (let i = 0; i < concurrent; i++) {
                loadNext();
            }
        });
    }

    /**
     * Preload assets with retry logic
     * @param {string[]} urls - Array of asset URLs
     * @param {Object} options - Options
     * @returns {Promise<Map>}
     */
    async preloadWithRetry(urls, options = {}) {
        const results = new Map();
        const failedUrls = [];

        // First attempt
        try {
            const firstPass = await this.preloadAll(urls, {
                ...options,
                stopOnError: false
            });
            
            for (const [url, result] of firstPass) {
                results.set(url, result);
            }
        } catch (error) {
            console.error('[AssetPreloader] Unexpected error during preload:', error);
        }

        // Collect failed URLs
        for (const url of urls) {
            if (!results.has(url)) {
                failedUrls.push(url);
            }
        }

        // Retry failed URLs
        for (let attempt = 1; attempt <= this.retryAttempts && failedUrls.length > 0; attempt++) {
            console.log(`[AssetPreloader] Retry attempt ${attempt} for ${failedUrls.length} failed assets`);
            
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            
            const retryUrls = [...failedUrls];
            failedUrls.length = 0;

            try {
                const retryResults = await this.preloadAll(retryUrls, {
                    ...options,
                    stopOnError: false
                });
                
                for (const [url, result] of retryResults) {
                    results.set(url, result);
                }
            } catch (error) {
                console.error(`[AssetPreloader] Retry attempt ${attempt} failed:`, error);
            }

            // Update failed URLs
            for (const url of retryUrls) {
                if (!results.has(url)) {
                    failedUrls.push(url);
                }
            }
        }

        if (failedUrls.length > 0) {
            console.warn(`[AssetPreloader] ${failedUrls.length} assets failed after ${this.retryAttempts} retries:`, failedUrls);
        }

        return results;
    }

    /**
     * Get loaded asset
     * @param {string} url - Asset URL
     * @returns {any}
     */
    get(url) {
        return this.loadedAssets.get(url);
    }

    /**
     * Check if asset is loaded
     * @param {string} url - Asset URL
     * @returns {boolean}
     */
    has(url) {
        return this.loadedAssets.has(url);
    }

    /**
     * Clear loaded assets from memory
     */
    clear() {
        this.loadedAssets.clear();
        this.failedAssets.clear();
        console.log('[AssetPreloader] Cleared loaded assets');
    }

    /**
     * Get preload statistics
     * @returns {Object}
     */
    getStats() {
        return {
            loaded: this.loadedAssets.size,
            failed: this.failedAssets.size,
            total: this.loadedAssets.size + this.failedAssets.size,
            assets: Array.from(this.loadedAssets.keys()),
            errors: Array.from(this.failedAssets.entries())
        };
    }

    /**
     * Load image from cache or network
     * @param {string} url - Image URL
     * @param {Object} options - Options
     * @returns {Promise<HTMLImageElement>}
     */
    async loadImage(url, options = {}) {
        return await this.preloadImage(url, { useCache: true, ...options });
    }

    /**
     * Load texture from cache or network
     * @param {string} url - Texture URL
     * @param {Object} options - Options
     * @returns {Promise<THREE.Texture|Blob>}
     */
    async loadTexture(url, options = {}) {
        return await this.preloadTexture(url, { useCache: true, ...options });
    }

    /**
     * Load audio from cache or network
     * @param {string} url - Audio URL
     * @param {Object} options - Options
     * @returns {Promise<ArrayBuffer|AudioBuffer>}
     */
    async loadAudio(url, options = {}) {
        return await this.preloadAudio(url, { useCache: true, ...options });
    }

    /**
     * Load multiple images with caching
     * @param {string[]} urls - Array of image URLs
     * @param {Object} options - Options
     * @returns {Promise<Map<string, HTMLImageElement>>}
     */
    async loadImages(urls, options = {}) {
        const results = new Map();
        
        await this.preloadAll(urls, {
            ...options,
            type: 'image',
            onProgress: options.onProgress,
            onError: options.onError
        });

        // Return only images from loadedAssets
        for (const url of urls) {
            if (this.loadedAssets.has(url)) {
                results.set(url, this.loadedAssets.get(url));
            }
        }

        return results;
    }

    /**
     * Load multiple textures with caching
     * @param {string[]} urls - Array of texture URLs
     * @param {Object} options - Options
     * @returns {Promise<Map<string, THREE.Texture|Blob>>}
     */
    async loadTextures(urls, options = {}) {
        const results = new Map();
        
        await this.preloadAll(urls, {
            ...options,
            type: 'texture',
            onProgress: options.onProgress,
            onError: options.onError
        });

        for (const url of urls) {
            if (this.loadedAssets.has(url)) {
                results.set(url, this.loadedAssets.get(url));
            }
        }

        return results;
    }

    /**
     * Load multiple audio files with caching
     * @param {string[]} urls - Array of audio URLs
     * @param {Object} options - Options
     * @returns {Promise<Map<string, ArrayBuffer|AudioBuffer>>}
     */
    async loadAudioFiles(urls, options = {}) {
        const results = new Map();
        
        await this.preloadAll(urls, {
            ...options,
            type: 'audio',
            onProgress: options.onProgress,
            onError: options.onError
        });

        for (const url of urls) {
            if (this.loadedAssets.has(url)) {
                results.set(url, this.loadedAssets.get(url));
            }
        }

        return results;
    }
}

/**
 * Convenience function to preload assets
 * @param {string[]} urls - Asset URLs
 * @param {Object} options - Preloader options
 * @returns {Promise<Map>}
 */
export async function preloadAssets(urls, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.preloadAll(urls, options);
}

/**
 * Load image with caching
 * @param {string} url - Image URL
 * @param {Object} options - Options
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(url, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.loadImage(url, options);
}

/**
 * Load texture with caching
 * @param {string} url - Texture URL
 * @param {Object} options - Options
 * @returns {Promise<THREE.Texture|Blob>}
 */
export async function loadTexture(url, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.loadTexture(url, options);
}

/**
 * Load audio with caching
 * @param {string} url - Audio URL
 * @param {Object} options - Options
 * @returns {Promise<ArrayBuffer|AudioBuffer>}
 */
export async function loadAudio(url, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.loadAudio(url, options);
}

/**
 * Load multiple images with caching
 * @param {string[]} urls - Image URLs
 * @param {Object} options - Options
 * @returns {Promise<Map<string, HTMLImageElement>>}
 */
export async function loadImages(urls, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.loadImages(urls, options);
}

/**
 * Load multiple textures with caching
 * @param {string[]} urls - Texture URLs
 * @param {Object} options - Options
 * @returns {Promise<Map<string, THREE.Texture|Blob>>}
 */
export async function loadTextures(urls, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.loadTextures(urls, options);
}

/**
 * Load multiple audio files with caching
 * @param {string[]} urls - Audio URLs
 * @param {Object} options - Options
 * @returns {Promise<Map<string, ArrayBuffer|AudioBuffer>>}
 */
export async function loadAudioFiles(urls, options = {}) {
    const preloader = new AssetPreloader(options);
    return await preloader.loadAudioFiles(urls, options);
}
