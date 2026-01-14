import { BaseBanner } from './BaseBanner.js';

/**
 * AppBanner - Unified banner class for all app banner types
 * Handles text, image, and GLB banners in a single implementation
 * @extends BaseBanner
 */
export class AppBanner extends BaseBanner {
    /**
     * Creates a new AppBanner instance
     * @param {HTMLElement} container - Container element for the banner
     * @param {Object} appData - App data object
     * @param {Object} options - Banner configuration options
     * @param {string} options.type - Banner type: 'text', 'image', or 'glb'
     * @param {string} options.source - Source path for image/glb banners
     */
    constructor(container, appData, options = {}) {
        super(container, appData);
        
        // Standard banner dimensions
        this.width = 400;
        this.height = 240;
        
        // Banner configuration
        this.type = options.type || 'text';
        this.source = options.source || null;
        
        // GLB-specific properties
        this.mixer = null;
        this.clock = null;
        this.model = null;
        
        // Text banner properties
        this.textPlane = null;
        
        // Image banner properties
        this.imageCanvas = null;
        this.imageCtx = null;
        this.imageElement = null;
    }
    
    /**
     * Initializes the banner based on its type
     * @returns {Promise<void>}
     */
    async init() {
        // Determine jingle path for unopened state
        // Check for bannerJingle (standard property) first, then fall back to jingle
        const jinglePath = this.appData.unopened 
            ? (this.appData.unopenedJingle || this.appData.unopenedBannerJingle || this.appData.bannerJingle || this.appData.jingle)
            : (this.appData.bannerJingle || this.appData.jingle);
        
        // Load jingle if available
        if (jinglePath) {
            this.loadJingle(jinglePath);
        }
        
        switch (this.type) {
            case 'glb':
                await this.initGLB();
                break;
            case 'image':
                await this.initImage();
                break;
            case 'text':
            default:
                await this.initText();
                break;
        }
        
        this.isInitialized = true;
    }
    
    /**
     * Initializes text banner with 3D scene
     * @private
     */
    async initText() {
        console.log('[AppBanner] Initializing 3D text banner for:', this.getAppLabel());
        
        // Import Three.js modules
        const { THREE, canvas } = await this.createThreeCanvas(this.width, this.height);
        
        // Create Three.js scene with transparent background
        this.createThreeScene(canvas, THREE, {
            cameraPosition: { x: 0, y: 0, z: 3 },
            clearColor: 0x000000,
            clearAlpha: 0 // Fully transparent background
        });
        
        // Create BannerRoot for scaling
        this.createBannerRoot(THREE);
        
        // Create a canvas for the text texture with increased width for long text
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 1024; // Increased from 512 to accommodate longer text
        textCanvas.height = 256;
        const ctx = textCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Don't draw background - keep it transparent for the texture
        ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        
        // Setup text styling
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Apply shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw app label
        const label = this.getAppLabel();
        ctx.font = 'bold 48px "FOT-RodinNTLG Pro DB", "Rodin", sans-serif';
        ctx.fillText(label, textCanvas.width / 2, textCanvas.height / 2 - 30);
        
        // Draw description if available
        const description = this.getAppDescription();
        if (description) {
            ctx.font = '24px "FOT-RodinNTLG Pro DB", "Rodin", sans-serif';
            ctx.fillText(description, textCanvas.width / 2, textCanvas.height / 2 + 30);
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(textCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Create plane geometry with increased width (8 units wide instead of 4)
        const planeGeometry = new THREE.PlaneGeometry(8, 2);
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            side: THREE.FrontSide,
            depthWrite: false // Prevent z-fighting with transparent background
        });
        
        // Create mesh and add to BannerRoot
        this.textPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        // Make the plane always face the camera
        this.textPlane.lookAt(this.camera.position);
        
        this.bannerRoot.add(this.textPlane);
        
        // Optional: Add subtle animation
        this.clock = new THREE.Clock();
        
        // Start animation loop
        this.startAnimationLoop();
        
        // Register cleanup
        this.registerCleanup(() => {
            if (texture) texture.dispose();
            if (planeGeometry) planeGeometry.dispose();
            if (planeMaterial) planeMaterial.dispose();
            this.textPlane = null;
        });
        
        console.log('[AppBanner] 3D text banner initialized for:', label);
    }
    
    /**
     * Initializes image banner
     * @private
     */
    async initImage() {
        console.log('[AppBanner] Loading image banner:', this.source);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log('[AppBanner] Image loaded successfully');
                
                const { canvas, ctx } = this.create2DCanvas();
                
                // Clear canvas first
                ctx.clearRect(0, 0, this.width, this.height);
                
                // Draw the image
                ctx.drawImage(img, 0, 0, this.width, this.height);
                
                // Store references for cleanup
                this.imageCanvas = canvas;
                this.imageCtx = ctx;
                this.imageElement = img;
                
                // Register cleanup for image resources
                this.registerCleanup(() => {
                    console.log('[AppBanner] Cleaning up image banner resources');
                    
                    // Clear canvas
                    if (this.imageCtx && this.imageCanvas) {
                        this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
                    }
                    
                    // Clear image reference
                    if (this.imageElement) {
                        this.imageElement.src = '';
                        this.imageElement = null;
                    }
                    
                    this.imageCanvas = null;
                    this.imageCtx = null;
                });
                
                console.log('[AppBanner] Image banner initialized');
                resolve();
            };
            
            img.onerror = (error) => {
                console.error('[AppBanner] Failed to load image:', this.source, error);
                reject(new Error(`Failed to load banner image: ${this.source}`));
            };
            
            img.src = this.source;
        });
    }
    
    /**
     * Initializes GLB banner
     * @private
     */
    async initGLB() {
        try {
            console.log('[AppBanner] Starting GLB banner load:', this.source);
            
            // Import Three.js modules
            const { THREE, canvas } = await this.createThreeCanvas(this.width, this.height);
            
            // Create Three.js scene
            const { scene, camera, renderer } = this.createThreeScene(canvas, THREE);
            
            // Create BannerRoot for scaling
            this.createBannerRoot(THREE);
            
            // Load GLB model
            console.log('[AppBanner] Loading GLB model...');
            const { GLTFLoader } = await import('GLTFLoader');
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(this.source);
            
            this.model = gltf.scene;
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            this.model.position.sub(center);
            
            const size = box.getSize(new THREE.Vector3()).length();
            const targetSize = 2;
            this.model.scale.multiplyScalar(targetSize / size);
            
            // Add model to BannerRoot instead of scene
            this.bannerRoot.add(this.model);
            
            // Setup animation mixer if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.model);
                const action = this.mixer.clipAction(gltf.animations[0]);
                action.play();
                
                console.log('[AppBanner] Animation mixer setup with', gltf.animations.length, 'animation(s)');
            }
            
            // Create clock for animation timing
            this.clock = new THREE.Clock();
            
            // Start animation loop
            this.startAnimationLoop();
            
            console.log('[AppBanner] GLB banner initialized successfully');
            
        } catch (error) {
            console.error('[AppBanner] Failed to load GLB banner:', error);
            throw error;
        }
    }
    
    /**
     * Animation loop - updates mixer and renders scene
     * @override
     */
    animate() {
        if (!this.clock || this.isDisposed) return;
        
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();
        
        // GLB animation
        if (this.type === 'glb' && this.mixer) {
            this.mixer.update(delta);
        }
        
        // Optional: Add rotation for non-animated GLB models
        if (this.type === 'glb' && !this.mixer && this.model) {
            this.model.rotation.y += 0.01;
        }
        
        // Text banner animation - only gentle vertical floating, no rotation
        // Keep the plane always facing the camera
        if (this.type === 'text' && this.textPlane && this.camera) {
            // Gentle vertical floating
            this.textPlane.position.y = Math.sin(elapsed * 0.5) * 0.1;
            
            // Always face the camera (no rotation animation)
            this.textPlane.lookAt(this.camera.position);
        }
    }
    
    /**
     * Gets the label to display for the app
     * @protected
     * @returns {string}
     */
    getAppLabel() {
        return this.appData.localizedLabel || this.appData.label || this.appData.id || 'App';
    }
    
    /**
     * Gets the description to display for the app
     * @protected
     * @returns {string}
     */
    getAppDescription() {
        return this.appData.localizedDescription || this.appData.description || '';
    }
    
    /**
     * Creates a 2D canvas for rendering
     * @protected
     * @returns {Object} Canvas element and 2D context
     */
    create2DCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.className = 'banner-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '2';
        canvas.style.pointerEvents = 'none';
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Append to root container if it exists, otherwise to main container
        const targetContainer = this.rootContainer || this.container;
        targetContainer.appendChild(canvas);
        
        // Register cleanup
        this.registerCleanup(() => {
            if (canvas.parentElement) {
                canvas.parentElement.removeChild(canvas);
            }
        });
        
        return { canvas, ctx };
    }
    
    /**
     * Draws semi-transparent background
     * @protected
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Background color (default: 'rgba(0, 0, 0, 0.3)')
     */
    drawBackground(ctx, color = 'rgba(0, 0, 0, 0.3)') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Applies text shadow for better readability
     * @protected
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    applyTextShadow(ctx) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    /**
     * Cleanup banner-specific resources
     * @override
     */
    cleanup() {
        if (this.type === 'glb') {
            console.log('[AppBanner] Cleaning up GLB banner resources');
            
            // Dispose mixer
            if (this.mixer) {
                this.mixer.stopAllAction();
                this.mixer.uncacheRoot(this.mixer.getRoot());
                this.mixer = null;
            }
            
            // Clear model reference
            this.model = null;
        }
        
        if (this.type === 'text') {
            console.log('[AppBanner] Cleaning up text banner resources');
            
            // Clear text plane reference
            this.textPlane = null;
        }
        
        if (this.type === 'image') {
            console.log('[AppBanner] Cleaning up image banner resources');
            
            // Clear canvas
            if (this.imageCtx && this.imageCanvas) {
                this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
            }
            
            // Clear image reference
            if (this.imageElement) {
                this.imageElement.src = '';
                this.imageElement = null;
            }
            
            this.imageCanvas = null;
            this.imageCtx = null;
        }
        
        // Clear clock
        this.clock = null;
        
        // Call parent cleanup
        super.cleanup();
    }
}

/**
 * Factory function for creating text banners
 */
export async function createTextBanner(container, appData) {
    const banner = new AppBanner(container, appData, { type: 'text' });
    await banner.init();
    
    return {
        cleanup: () => banner.cleanup(),
        dispose: () => banner.dispose(),
        destroy: () => banner.destroy(),
        banner
    };
}

/**
 * Factory function for creating image banners
 */
export function createImageBannerFactory(imagePath) {
    return async (container, appData) => {
        const banner = new AppBanner(container, appData, { type: 'image', source: imagePath });
        await banner.init();
        
        return {
            cleanup: () => banner.cleanup(),
            dispose: () => banner.dispose(),
            destroy: () => banner.destroy(),
            banner
        };
    };
}

/**
 * Factory function for creating GLB banners
 */
export function createGLBBannerFactory(glbPath) {
    return async (container, appData) => {
        const banner = new AppBanner(container, appData, { type: 'glb', source: glbPath });
        await banner.init();
        
        return {
            cleanup: () => banner.cleanup(),
            dispose: () => banner.dispose(),
            destroy: () => banner.destroy(),
            banner
        };
    };
}

// Default export for backward compatibility
export default createTextBanner;
