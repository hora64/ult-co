import { BaseBanner } from '/content/common/utils/banners/BaseBanner.js';
import { FFLShaderMaterial } from '/content/common/utils/threejs/materials/FFLShaderMaterial.js';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';

/**
 * UnopenedBanner - Banner for unopened/wrapped apps
 * Displays an animated gift box model with FFL-style toon shading
 * Uses ModelLoader for automatic caching in IndexedDB
 * @extends BaseBanner
 */
export default class UnopenedBanner extends BaseBanner {
    constructor(container, appData) {
        super(container, appData);
        this.present = null;
        this.clock = null;
        this.modelPath = 'assets/banners/unopened/models/present_small.glb'; // Relative to homeScreen
        this.gltfTextures = []; // Store textures from GLTF
        this.modelLoader = null; // ModelLoader instance for caching
        this.shadow = null; // Blob shadow
    }
    
    /**
     * Applies FFL shader to a model with proper texture handling
     * Based on the convertMaterials function from glb3dTest.html
     * @param {Object} model - Three.js model/scene
     * @param {Object} THREE - Three.js library
     * @param {Array} gltfTextures - Array of textures extracted from GLTF parser
     * @private
     */
    _applyFFLShader(model, THREE, gltfTextures = []) {
        let textureIndex = 0;
        let convertedCount = 0;
        
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                const oldMaterials = Array.isArray(child.material) ? child.material : [child.material];
                const newMaterials = oldMaterials.map((oldMat) => {
                    // Get texture from original material or use GLTF textures
                    let usedTexture = oldMat.map || (gltfTextures.length > 0 ? gltfTextures[textureIndex % gltfTextures.length] : null);
                    textureIndex++;
                    
                    // Get original color or use default
                    let color = 0xAAAAAA; // Default color from glb3dTest
                    if (oldMat.color) {
                        color = oldMat.color.getHex();
                    }
                    
                    // Create FFL shader material with texture support
                    const fflMaterial = new FFLShaderMaterial({
                        map: usedTexture || null,
                        color: new THREE.Color(color),
                        opacity: oldMat.opacity ?? 1.0,
                        lightEnable: true,
                        modulateMode: usedTexture ? 1 : 0, // 1 for texture, 0 for constant color
                        transparent: oldMat.transparent || false,
                        side: oldMat.side || THREE.FrontSide
                    });
                    
                    // Set modulate type for proper material rendering
                    fflMaterial.modulateType = 0; // Standard material type
                    
                    // If texture exists, ensure it's properly set up
                    if (usedTexture) {
                        fflMaterial.map = usedTexture;
                        fflMaterial.map.needsUpdate = true;
                        fflMaterial.defines = fflMaterial.defines || {};
                        fflMaterial.defines.USE_MAP = '';
                    }
                    
                    convertedCount++;
                    return fflMaterial;
                });
                
                // Apply new materials
                child.material = Array.isArray(child.material) ? newMaterials : newMaterials[0];
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        console.log(`[UnopenedBanner] Converted ${convertedCount} materials to FFLShaderMaterial`);
    }

    /**
     * Creates a blob shadow beneath the present
     * @param {Object} THREE - Three.js library
     * @private
     */
    _createBlobShadow(THREE) {
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
     * Initializes the unopened banner with animated present
     * Uses ModelLoader for automatic caching in IndexedDB
     * @returns {Promise<void>}
     */
    async init() {
        try {
            console.log('[UnopenedBanner] Initializing unopened banner with FFL shader and caching');
            
            // Load jingle if available (but don't play it yet)
            const jinglePath = this.appData.unopenedJingle || this.appData.jingle;
            if (jinglePath) {
                this.loadJingle(jinglePath);
            }
            
            // Import Three.js modules
            const { THREE, canvas } = await this.createThreeCanvas();
            
            // Create Three.js scene with adjusted camera to match non-FFL version
            this.createThreeScene(canvas, THREE, {
                cameraPosition: { x: 0, y: 0, z: 5 }  // Moved back from z:3 to z:5 for proper framing
            });
            
            // Add lights for FFL shader
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);
            
            // Create BannerRoot for scaling
            this.createBannerRoot(THREE);
            
            // Initialize ModelLoader for caching
            const { GLTFLoader } = await import('GLTFLoader');
            this.modelLoader = new ModelLoader({
                THREE: THREE,
                GLTFLoader: GLTFLoader,
                appId: 'homeScreen_3DS',
                appVersion: '1.0.0'
            });
            
            try {
                // Load model with caching - will use IndexedDB on subsequent loads
                console.log('[UnopenedBanner] 🔄 Loading present model...');
                const gltf = await this.modelLoader.load(this.modelPath, {
                    useCache: true,
                    forceRefresh: false
                });
                
                this.present = gltf.scene;
                
                // Extract textures from GLTF parser
                this.gltfTextures = await this.modelLoader.getTextures(gltf);
                console.log(`[UnopenedBanner] ✅ Model loaded - Extracted ${this.gltfTextures.length} textures`);
                
                // Apply FFL shader to all meshes with texture support
                this._applyFFLShader(this.present, THREE, this.gltfTextures);
                
                // Center the model
                const box = new THREE.Box3().setFromObject(this.present);
                const center = box.getCenter(new THREE.Vector3());
                this.present.position.sub(center);
                
                // Scale to smaller size - Reduced by 25% (0.75x)
                const size = box.getSize(new THREE.Vector3()).length();
                const targetSize = 0.75; // Reduced from 1.0 by 25%
                this.present.scale.multiplyScalar(targetSize / size);
                
                // Add to BannerRoot instead of scene
                this.bannerRoot.add(this.present);
                
                // Create blob shadow
                this._createBlobShadow(THREE);
                
                // Get cache stats for debugging
                const cacheStats = await this.modelLoader.getCacheStats();
                console.log('[UnopenedBanner] Cache stats:', cacheStats);
                
                console.log('[UnopenedBanner] Present model loaded with FFL shader successfully (from cache)');
            } catch (error) {
                console.error('[UnopenedBanner] Error loading present model, using fallback:', error);
                
                // Fallback cube with FFL shader
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const fflMaterial = new FFLShaderMaterial({
                    color: new THREE.Color(0xff4444),
                    opacity: 1.0,
                    lightEnable: true,
                    modulateMode: 0,
                    transparent: false,
                    side: THREE.FrontSide
                });
                fflMaterial.modulateType = 0;
                
                this.present = new THREE.Mesh(geometry, fflMaterial);
                this.present.castShadow = true;
                this.present.receiveShadow = true;
                this.bannerRoot.add(this.present);
            }
            
            // Create clock for animation timing
            this.clock = new THREE.Clock();
            
            // Start animation loop
            this.startAnimationLoop();
            
            this.isInitialized = true;
            console.log('[UnopenedBanner] Unopened banner with FFL shader and caching initialized successfully');
            
            // Play jingle after a short delay to ensure audio is loaded
            if (this.jingle) {
                const tryPlayJingle = () => {
                    if (this.jingle.readyState >= 2) {
                        this.playJingle();
                    } else {
                        this.jingle.addEventListener('canplay', () => {
                            this.playJingle();
                        }, { once: true });
                    }
                };
                
                setTimeout(tryPlayJingle, 100);
            }
            
        } catch (error) {
            console.error('[UnopenedBanner] Failed to initialize unopened banner:', error);
            throw error;
        }
    }
    
    /**
     * Animation loop - rotates and bobs the present with shadow
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
        this.present.scale.set(scale, scale, scale);

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
     * Cleanup unopened banner resources
     * @override
     */
    cleanup() {
        console.log('[UnopenedBanner] Cleaning up unopened banner resources');
        
        // Dispose present model using ModelLoader
        if (this.present && this.modelLoader) {
            this.modelLoader.dispose(this.present);
        }

        // Dispose shadow
        if (this.shadow) {
            if (this.shadow.geometry) this.shadow.geometry.dispose();
            if (this.shadow.material) {
                if (this.shadow.material.map) this.shadow.material.map.dispose();
                this.shadow.material.dispose();
            }
            this.shadow = null;
        }
        
        // Clear model loader memory cache (IndexedDB cache persists)
        if (this.modelLoader) {
            this.modelLoader.clearMemoryCache(this.modelPath);
        }
        
        // Clear references
        this.present = null;
        this.clock = null;
        this.gltfTextures = [];
        this.modelLoader = null;
        
        // Call parent cleanup
        super.cleanup();
    }
}

/**
 * Factory function for BannerManager compatibility
 * Creates an unopened banner instance
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
    
    const banner = new UnopenedBanner(container, appData);
    await banner.init();
    
    return {
        scene: banner.scene,
        camera: banner.camera,
        renderer: banner.renderer,
        dispose: () => banner.cleanup(),
        cleanup: () => banner.cleanup(),
        destroy: () => banner.cleanup(),
        banner
    };
}

/**
 * Performs an unwrap animation for an unopened app
 * Displays the present model in the banner area with an opening animation
 * @param {HTMLElement} bannerContainer - Container element for the banner animation
 * @param {Object} appData - App data object containing icon, label, etc.
 * @param {Function} onComplete - Callback function called when animation completes
 * @param {Object} options - Configuration options
 * @param {number} [options.duration=1500] - Animation duration in milliseconds
 * @param {Object} [options.sounds] - Sound effects object with unwrap sound
 */
export async function unwrap(bannerContainer, appData, onComplete, options = {}) {
    const {
        duration = 1500,
        sounds = null
    } = options;
    
    // Play unwrap sound if available
    if (sounds && sounds.unwrap) {
        sounds.unwrap.play();
    }
    
    // Create container for unwrap animation
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '100';
    container.className = 'unwrap-animation-container';
    
    bannerContainer.appendChild(container);
    
    try {
        // Create and initialize banner
        const banner = new UnopenedBanner(container, appData);
        await banner.init();
        
        // Wait for animation to complete
        await new Promise(resolve => {
            setTimeout(() => {
                // Cleanup banner
                banner.cleanup();
                
                // Remove container
                container.remove();
                
                resolve();
            }, duration);
        });
        
        // Call completion callback
        if (onComplete) {
            onComplete();
        }
        
    } catch (error) {
        console.error('[UnopenedBanner] Failed to create unwrap animation:', error);
        
        // Fallback: just remove container and call callback
        container.remove();
        if (onComplete) {
            onComplete();
        }
    }
}

/**
 * Checks if an app should show as unopened
 * @param {Object} appData - App data object
 * @param {Object} openedApps - Object mapping app IDs to opened state
 * @returns {boolean} True if app should show unopened indicator
 */
export function shouldShowUnopened(appData, openedApps) {
    // Check if app has been opened before
    if (openedApps && openedApps[appData.id]) {
        return false;
    }
    
    // Check if app has unopened property explicitly set
    if (appData.hasOwnProperty('unopened')) {
        return appData.unopened === true;
    }
    
    // Default to opened
    return false;
}
