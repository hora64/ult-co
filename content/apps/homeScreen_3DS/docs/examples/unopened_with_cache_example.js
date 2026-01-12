/**
 * Example: Unopened Banner with Model Caching
 * Shows how to use ModelLoader in the unopened.js banner
 */

import { BaseBanner } from '/content/common/utils/threejs/BaseBanner.js';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

export class UnopenedBannerWithCache extends BaseBanner {
    constructor(container, appData) {
        super(container, appData);
        
        // ModelLoader instance
        this.modelLoader = null;
        
        // Model references
        this.present = null;
        this.gltfTextures = [];
        
        // Animation state
        this.clock = new THREE.Clock();
        this.shadow = null;
    }

    async init() {
        // Initialize base banner (sets up scene, camera, renderer)
        await super.init();

        try {
            // Initialize ModelLoader with app info for cache management
            this.modelLoader = new ModelLoader({
                THREE: THREE,
                GLTFLoader: GLTFLoader,
                appId: 'homeScreen_3DS',
                appVersion: '1.0.0'
            });

            console.log('[UnopenedBanner] Loading present model...');

            // Load present model with caching
            // First load: Downloads from network and caches in IndexedDB
            // Subsequent loads: Loads from IndexedDB (much faster!)
            const gltf = await this.modelLoader.load(
                '/content/apps/homeScreen_3DS/assets/models/present_small.glb',
                {
                    useCache: true,              // Enable caching (default)
                    forceRefresh: false,         // Use cache if available
                    onProgress: (xhr) => {
                        // Optional: Show loading progress
                        if (xhr.lengthComputable) {
                            const percent = (xhr.loaded / xhr.total) * 100;
                            console.log(`Loading present: ${percent.toFixed(1)}%`);
                        }
                    }
                }
            );

            // Get model info for debugging
            const modelInfo = this.modelLoader.getModelInfo(gltf);
            console.log('[UnopenedBanner] Present model info:', modelInfo);

            // Add present to scene
            this.present = gltf.scene;
            this.present.scale.set(0.8, 0.8, 0.8);
            this.present.position.y = 0;
            this.present.castShadow = true;
            this.present.receiveShadow = true;
            this.bannerRoot.add(this.present);

            // Get textures from model
            this.gltfTextures = await this.modelLoader.getTextures(gltf);
            console.log(`[UnopenedBanner] Loaded ${this.gltfTextures.length} textures`);

            // Create blob shadow
            this.createBlobShadow();

            // Start animation loop
            this.startAnimationLoop();

            // Get cache statistics
            const cacheStats = await this.modelLoader.getCacheStats();
            console.log('[UnopenedBanner] Cache stats:', cacheStats);

            console.log('[UnopenedBanner] Initialized successfully (model loaded from cache!)');
        } catch (error) {
            console.error('[UnopenedBanner] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Creates a blob shadow beneath the present
     * @private
     */
    createBlobShadow() {
        // Create shadow plane
        const shadowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });
        
        const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowMesh.rotation.x = -Math.PI / 2; // Lay flat on ground
        shadowMesh.position.y = -0.8; // Below present
        
        // Add radial gradient to shadow
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Apply gradient texture
        const shadowTexture = new THREE.CanvasTexture(canvas);
        shadowMesh.material.map = shadowTexture;
        shadowMesh.material.needsUpdate = true;
        
        this.bannerRoot.add(shadowMesh);
        this.shadow = shadowMesh;
        
        console.log('[UnopenedBanner] Blob shadow created');
    }

    /**
     * Animation loop - rotates and bobs the present
     * @override
     */
    animate() {
        if (!this.clock || !this.present || this.isDisposed) return;
        
        const elapsed = this.clock.getElapsedTime();
        
        // Slow Y-axis rotation
        this.present.rotation.y = elapsed * 0.5;
        
        // Vertical bobbing
        this.present.position.y = Math.sin(elapsed * 2) * 0.1;
        
        // Gentle scale pulsing
        const scale = 1.0 + Math.sin(elapsed * 1.5) * 0.05;
        this.present.scale.set(scale * 0.8, scale * 0.8, scale * 0.8);

        // Pulse shadow with present
        if (this.shadow) {
            const shadowScale = 1.0 + Math.sin(elapsed * 1.5) * 0.03;
            this.shadow.scale.set(shadowScale, shadowScale, 1);
            
            // Fade shadow as present rises
            const yOffset = Math.sin(elapsed * 2) * 0.1;
            this.shadow.material.opacity = 0.3 - (yOffset * 0.5);
        }
    }

    /**
     * Cleanup banner resources
     * @override
     */
    cleanup() {
        console.log('[UnopenedBanner] Cleaning up resources');
        
        // Dispose present model using ModelLoader
        if (this.present && this.modelLoader) {
            this.modelLoader.dispose(this.present);
            this.bannerRoot.remove(this.present);
            this.present = null;
        }

        // Dispose shadow
        if (this.shadow) {
            if (this.shadow.geometry) this.shadow.geometry.dispose();
            if (this.shadow.material) {
                if (this.shadow.material.map) this.shadow.material.map.dispose();
                this.shadow.material.dispose();
            }
            this.bannerRoot.remove(this.shadow);
            this.shadow = null;
        }
        
        // Clear model loader memory cache
        if (this.modelLoader) {
            // Note: Don't clear IndexedDB cache here - we want it to persist!
            // Just clear the in-memory reference
            this.modelLoader.clearMemoryCache('/content/apps/homeScreen_3DS/assets/models/present_small.glb');
        }
        
        // Clear references
        this.clock = null;
        this.gltfTextures = [];
        this.modelLoader = null;
        
        // Call parent cleanup
        super.cleanup();
    }

    /**
     * Get cache statistics for debugging
     * @returns {Promise<Object>}
     */
    async getCacheStats() {
        if (this.modelLoader) {
            return await this.modelLoader.getCacheStats();
        }
        return null;
    }

    /**
     * Force reload model from network (bypass cache)
     * Useful for testing or when model has been updated
     */
    async forceReloadModel() {
        console.log('[UnopenedBanner] Force reloading model from network...');
        
        // Remove current model
        if (this.present) {
            this.modelLoader.dispose(this.present);
            this.bannerRoot.remove(this.present);
            this.present = null;
        }

        // Reload with force refresh
        const gltf = await this.modelLoader.load(
            '/content/apps/homeScreen_3DS/assets/models/present_small.glb',
            {
                forceRefresh: true  // Bypass cache, load from network
            }
        );

        // Re-add to scene
        this.present = gltf.scene;
        this.present.scale.set(0.8, 0.8, 0.8);
        this.present.castShadow = true;
        this.present.receiveShadow = true;
        this.bannerRoot.add(this.present);

        console.log('[UnopenedBanner] Model reloaded from network and re-cached');
    }
}

/**
 * Factory function for BannerManager compatibility
 * Creates an unopened banner instance with model caching
 * @param {HTMLCanvasElement|HTMLElement} canvasElement - Canvas or container element
 * @param {Object} appData - App data object
 * @returns {Promise<Object>} Banner API with dispose method
 */
export async function createBannerScene(canvasElement, appData) {
    // Create a container for the banner if canvasElement is a canvas
    let container;
    if (canvasElement && canvasElement.tagName === 'CANVAS') {
        container = canvasElement.parentElement || document.createElement('div');
    } else {
        container = canvasElement || document.createElement('div');
    }
    
    const banner = new UnopenedBannerWithCache(container, appData);
    await banner.init();
    
    return {
        scene: banner.scene,
        camera: banner.camera,
        renderer: banner.renderer,
        dispose: () => banner.cleanup(),
        cleanup: () => banner.cleanup(),
        destroy: () => banner.cleanup(),
        banner,
        // Additional API for cache management
        getCacheStats: () => banner.getCacheStats(),
        forceReloadModel: () => banner.forceReloadModel()
    };
}

/**
 * Example: Preload multiple models for faster startup
 */
export async function preloadModels() {
    const modelLoader = new ModelLoader({
        THREE: THREE,
        GLTFLoader: GLTFLoader,
        appId: 'homeScreen_3DS',
        appVersion: '1.0.0'
    });

    const models = [
        '/content/apps/homeScreen_3DS/assets/models/present_small.glb',
        '/content/apps/homeScreen_3DS/assets/models/platform.glb',
        // Add more models here
    ];

    console.log('[Preloader] Preloading models...');

    const loaded = await modelLoader.preloadModels(models, {
        onProgress: (current, total, url) => {
            const percent = ((current / total) * 100).toFixed(0);
            console.log(`[Preloader] ${percent}% - ${url}`);
        }
    });

    console.log(`[Preloader] Preloaded ${loaded.size} models!`);
    return loaded;
}

/**
 * Example: Check cache status
 */
export async function checkCacheStatus() {
    const modelLoader = new ModelLoader({
        THREE: THREE,
        GLTFLoader: GLTFLoader,
        appId: 'homeScreen_3DS',
        appVersion: '1.0.0'
    });

    const stats = await modelLoader.getCacheStats();
    
    console.log('=== Cache Status ===');
    console.log('App ID:', stats.appId);
    console.log('Version:', stats.version);
    console.log('Cached models:', stats.models);
    console.log('Memory cache:', stats.memoryCache);
    console.log('Total cached assets:', stats.total);
    console.log('Last updated:', stats.lastUpdated);
    
    return stats;
}

/**
 * Example: Clear all caches
 */
export async function clearAllCaches() {
    const modelLoader = new ModelLoader({
        THREE: THREE,
        GLTFLoader: GLTFLoader,
        appId: 'homeScreen_3DS',
        appVersion: '1.0.0'
    });

    // Clear memory caches
    modelLoader.clearAllMemoryCaches();
    console.log('[Cache] Cleared memory caches');

    // Clear IndexedDB caches
    const { assetCache } = await import('/content/common/utils/AssetCache.js');
    const cleared = await assetCache.clearAppCache('homeScreen_3DS');
    console.log(`[Cache] Cleared ${cleared} assets from IndexedDB`);
}

// Usage in console:
// import { checkCacheStatus, clearAllCaches, preloadModels } from './unopened_with_cache.js';
// await checkCacheStatus();
// await preloadModels();
// await clearAllCaches();
