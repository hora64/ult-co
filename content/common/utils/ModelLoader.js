/**
 * ModelLoader - Loads and caches 3D models using AssetCache
 * Supports GLB/GLTF formats with automatic caching in IndexedDB
 */

import { assetCache } from './AssetCache.js';

export class ModelLoader {
    constructor(options = {}) {
        this.appId = options.appId || 'unknown';
        this.appVersion = options.appVersion || '1.0.0';
        this.THREE = options.THREE; // THREE.js instance
        this.GLTFLoader = options.GLTFLoader; // GLTFLoader class
        this.loader = null;
        
        if (this.THREE && this.GLTFLoader) {
            this.loader = new this.GLTFLoader();
        }
        
        this.loadedModels = new Map(); // Cache loaded models in memory
    }

    /**
     * Load a 3D model with caching
     * @param {string} url - Model URL (.glb or .gltf)
     * @param {Object} options - Loading options
     * @param {boolean} options.useCache - Whether to use cache (default: true)
     * @param {boolean} options.forceRefresh - Force refresh from network (default: false)
     * @param {Function} options.onProgress - Progress callback (xhr) => {}
     * @returns {Promise<Object>} GLTF object with scene, animations, etc.
     */
    async load(url, options = {}) {
        const {
            useCache = true,
            forceRefresh = false,
            onProgress = null
        } = options;

        if (!this.loader) {
            throw new Error('[ModelLoader] GLTFLoader not initialized. Pass THREE and GLTFLoader to constructor.');
        }

        // Check memory cache first
        if (!forceRefresh && this.loadedModels.has(url)) {
            console.log(`[ModelLoader] Memory cache hit: ${url}`);
            return this.loadedModels.get(url);
        }

        let modelData = null;

        // Try to load from IndexedDB cache
        if (useCache && !forceRefresh) {
            try {
                // Ensure AssetCache is ready before using it
                await assetCache.ensureReady();
                
                if (assetCache.isAvailable) {
                    const cached = await assetCache.get(url);
                    if (cached) {
                        console.log(`[ModelLoader] IndexedDB cache hit: ${url}`);
                        modelData = cached.data;
                    }
                }
            } catch (error) {
                console.warn(`[ModelLoader] Failed to check cache for ${url}:`, error);
            }
        }

        // Load from network if not cached
        if (!modelData) {
            console.log(`[ModelLoader] Loading from network: ${url}`);
            
            try {
                // Fetch the model file
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const blob = await response.blob();
                modelData = blob;

                // Cache the blob if caching is enabled
                if (useCache) {
                    try {
                        // Ensure AssetCache is ready before caching
                        await assetCache.ensureReady();
                        
                        if (assetCache.isAvailable) {
                            await assetCache.set(url, blob, {
                                appId: this.appId,
                                appVersion: this.appVersion,
                                contentType: response.headers.get('content-type'),
                                size: blob.size
                            });
                            console.log(`[ModelLoader] Cached model: ${url}`);
                        }
                    } catch (cacheError) {
                        console.warn(`[ModelLoader] Failed to cache ${url}:`, cacheError);
                    }
                }
            } catch (error) {
                console.error(`[ModelLoader] Failed to fetch ${url}:`, error);
                throw error;
            }
        }

        // Convert Blob to ArrayBuffer for GLTFLoader
        const arrayBuffer = await modelData.arrayBuffer();
        
        // Parse with GLTFLoader
        return new Promise((resolve, reject) => {
            this.loader.parse(
                arrayBuffer,
                '', // Base URL (not needed for embedded assets)
                (gltf) => {
                    console.log(`[ModelLoader] Successfully loaded: ${url}`);
                    
                    // Store in memory cache
                    this.loadedModels.set(url, gltf);
                    
                    resolve(gltf);
                },
                (error) => {
                    console.error(`[ModelLoader] Failed to parse ${url}:`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load a model using traditional GLTFLoader.load() with caching
     * This method fetches the model, caches it, then loads from cache
     * @param {string} url - Model URL
     * @param {Object} options - Options
     * @returns {Promise<Object>} GLTF object
     */
    async loadWithCache(url, options = {}) {
        return this.load(url, options);
    }

    /**
     * Preload multiple models
     * @param {string[]} urls - Array of model URLs
     * @param {Object} options - Options
     * @param {Function} options.onProgress - Progress callback (current, total, url)
     * @returns {Promise<Map>} Map of url -> gltf
     */
    async preloadModels(urls, options = {}) {
        const { onProgress } = options;
        const results = new Map();
        let completed = 0;

        for (const url of urls) {
            try {
                const gltf = await this.load(url, { useCache: true });
                results.set(url, gltf);
                completed++;
                
                if (onProgress) {
                    onProgress(completed, urls.length, url);
                }
            } catch (error) {
                console.error(`[ModelLoader] Failed to preload ${url}:`, error);
                completed++;
                
                if (onProgress) {
                    onProgress(completed, urls.length, url);
                }
            }
        }

        console.log(`[ModelLoader] Preloaded ${results.size}/${urls.length} models`);
        return results;
    }

    /**
     * Get textures from a loaded GLTF model
     * @param {Object} gltf - GLTF object
     * @returns {Promise<Array>} Array of THREE.Texture
     */
    async getTextures(gltf) {
        if (!gltf || !gltf.parser) {
            return [];
        }

        try {
            const textures = await gltf.parser.getDependencies('texture');
            return textures || [];
        } catch (error) {
            console.warn('[ModelLoader] Failed to get textures:', error);
            return [];
        }
    }

    /**
     * Extract model information
     * @param {Object} gltf - GLTF object
     * @returns {Object} Model info
     */
    getModelInfo(gltf) {
        if (!gltf || !gltf.scene) {
            return null;
        }

        const box = new this.THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new this.THREE.Vector3());
        const center = box.getCenter(new this.THREE.Vector3());

        let meshCount = 0;
        let materialCount = 0;
        let triangleCount = 0;

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                meshCount++;
                if (child.geometry) {
                    const positions = child.geometry.attributes.position;
                    if (positions) {
                        triangleCount += positions.count / 3;
                    }
                }
            }
            if (child.material) {
                materialCount++;
            }
        });

        return {
            boundingBox: {
                size: { x: size.x, y: size.y, z: size.z },
                center: { x: center.x, y: center.y, z: center.z }
            },
            meshCount,
            materialCount,
            triangleCount,
            animationCount: gltf.animations ? gltf.animations.length : 0,
            hasAnimations: gltf.animations && gltf.animations.length > 0
        };
    }

    /**
     * Clone a loaded model
     * @param {Object} gltf - Original GLTF object
     * @returns {Object} Cloned scene
     */
    clone(gltf) {
        if (!gltf || !gltf.scene) {
            throw new Error('[ModelLoader] Invalid GLTF object');
        }

        return gltf.scene.clone();
    }

    /**
     * Clear memory cache for a specific model
     * @param {string} url - Model URL
     */
    clearMemoryCache(url) {
        if (this.loadedModels.has(url)) {
            this.loadedModels.delete(url);
            console.log(`[ModelLoader] Cleared memory cache for: ${url}`);
        }
    }

    /**
     * Clear all memory caches
     */
    clearAllMemoryCaches() {
        const count = this.loadedModels.size;
        this.loadedModels.clear();
        console.log(`[ModelLoader] Cleared ${count} models from memory cache`);
    }

    /**
     * Clear IndexedDB cache for a specific model
     * @param {string} url - Model URL
     */
    async clearIndexedDBCache(url) {
        try {
            await assetCache.ensureReady();
            if (assetCache.isAvailable) {
                await assetCache.delete(url);
                console.log(`[ModelLoader] Cleared IndexedDB cache for: ${url}`);
            }
        } catch (error) {
            console.error(`[ModelLoader] Failed to clear IndexedDB cache for ${url}:`, error);
        }
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Cache stats
     */
    async getCacheStats() {
        try {
            await assetCache.ensureReady();
            if (assetCache.isAvailable) {
                const stats = await assetCache.getAppStats(this.appId);
                return {
                    ...stats,
                    memoryCache: this.loadedModels.size
                };
            }
        } catch (error) {
            console.warn('[ModelLoader] Failed to get cache stats:', error);
        }
        
        return {
            appId: this.appId,
            version: 'unknown',
            lastUpdated: null,
            images: 0,
            audio: 0,
            models: 0,
            other: 0,
            total: 0,
            memoryCache: this.loadedModels.size
        };
    }

    /**
     * Dispose of a loaded model and free resources
     * @param {Object} scene - THREE.Scene or Object3D
     */
    dispose(scene) {
        if (!scene) return;

        scene.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        this.disposeMaterial(mat);
                    });
                } else {
                    this.disposeMaterial(child.material);
                }
            }
        });

        console.log('[ModelLoader] Disposed model resources');
    }

    /**
     * Dispose of a material and its textures
     * @param {THREE.Material} material - Material to dispose
     * @private
     */
    disposeMaterial(material) {
        if (!material) return;

        // Dispose textures
        const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 
                             'emissiveMap', 'aoMap', 'lightMap', 'envMap'];
        
        textureProps.forEach(prop => {
            if (material[prop]) {
                material[prop].dispose();
            }
        });

        material.dispose();
    }
}

/**
 * Create a ModelLoader instance with THREE.js and GLTFLoader
 * @param {Object} THREE - THREE.js namespace
 * @param {Class} GLTFLoader - GLTFLoader class
 * @param {Object} options - Options
 * @returns {ModelLoader} ModelLoader instance
 */
export function createModelLoader(THREE, GLTFLoader, options = {}) {
    return new ModelLoader({
        THREE,
        GLTFLoader,
        ...options
    });
}

// Export singleton instance (requires initialization)
let modelLoader = null;

export function initModelLoader(THREE, GLTFLoader, options = {}) {
    modelLoader = createModelLoader(THREE, GLTFLoader, options);
    return modelLoader;
}

export function getModelLoader() {
    if (!modelLoader) {
        console.warn('[ModelLoader] ModelLoader not initialized. Call initModelLoader() first.');
    }
    return modelLoader;
}
