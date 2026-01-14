/**
 * BaseBanner - Abstract base class for all banner modules
 * Provides a standardized interface for banner creation, animation, and cleanup
 * @abstract
 */
export class BaseBanner {
    /**
     * Creates a new banner instance
     * @param {HTMLElement} container - Container element for the banner
     * @param {Object} appData - App data object
     */
    constructor(container, appData) {
        if (new.target === BaseBanner) {
            throw new Error('BaseBanner is abstract and cannot be instantiated directly');
        }
        
        this.container = container;
        this.appData = appData;
        this.isInitialized = false;
        this.isDisposed = false;
        
        // Three.js references (if used)
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationFrameId = null;
        
        // Banner root for Three.js scene scaling
        this.bannerRoot = null;
        
        // Transition state
        this.transitionState = 'idle'; // 'idle', 'scaling-in', 'active', 'scaling-out'
        this.transitionProgress = 0;
        this.transitionDuration = 100; // milliseconds - changed from 400ms to 100ms for faster transitions
        this.transitionStartTime = 0;
        this.onTransitionComplete = null;
        
        // Root container for transitions (2D canvases)
        this.rootContainer = null;
        
        // Jingle audio element
        this.jingle = null;
        this.jinglePath = null;
        
        // Cleanup handlers
        this.cleanupHandlers = [];
    }
    
    /**
     * Initializes the banner
     * Must be implemented by subclasses
     * @abstract
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error('init() must be implemented by subclass')
    }
    
    /**
     * Animation loop (optional)
     * Override in subclass if animation is needed
     */
    animate() {
        // Default: no animation
    }
    
    /**
     * Starts the scale-in transition
     * @returns {Promise<void>}
     */
    async transitionIn() {
        return new Promise((resolve) => {
            console.log('[BaseBanner] Starting scale-in transition');
            this.transitionState = 'scaling-in';
            this.transitionProgress = 0;
            this.transitionStartTime = performance.now();
            this.onTransitionComplete = () => {
                this.transitionState = 'active';
                console.log('[BaseBanner] Scale-in transition complete');
                
                // Play jingle AFTER scale-in animation completes
                // But only if we're not already disposed
                if (!this.isDisposed) {
                    this.playJingle();
                }
                
                resolve();
            };
        });
    }
    
    /**
     * Starts the scale-out transition
     * @returns {Promise<void>}
     */
    async transitionOut() {
        // Stop jingle IMMEDIATELY when starting transition out
        this.stopJingle();
        
        return new Promise((resolve) => {
            console.log('[BaseBanner] Starting scale-out transition')
            this.transitionState = 'scaling-out'
            this.transitionProgress = 0
            this.transitionStartTime = performance.now()
            this.onTransitionComplete = () => {
                this.transitionState = 'idle'
                console.log('[BaseBanner] Scale-out transition complete')
                resolve()
            }
        })
    }
    
    /**
     * Updates transition animation
     * @private
     */
    updateTransition() {
        if (this.transitionState === 'idle' || this.transitionState === 'active') {
            return;
        }
        
        const now = performance.now();
        const elapsed = now - this.transitionStartTime;
        this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);
        
        // Exponential easing for snappier animations
        // Uses exponential curve instead of cubic for more dramatic acceleration
        let eased;
        if (this.transitionProgress === 0) {
            eased = 0;
        } else if (this.transitionProgress === 1) {
            eased = 1;
        } else {
            // Exponential ease-out: starts fast, slows down at the end
            eased = 1 - Math.pow(2, -10 * this.transitionProgress);
        }
        
        let scale;
        if (this.transitionState === 'scaling-in') {
            scale = eased;
        } else if (this.transitionState === 'scaling-out') {
            scale = 1 - eased;
        }
        
        // Apply scale to BannerRoot if it exists
        if (this.bannerRoot && this.bannerRoot.scale) {
            this.bannerRoot.scale.setScalar(scale);
        }
        
        // Also apply to root container for 2D content
        if (this.rootContainer) {
            this.rootContainer.style.transform = `scale(${scale})`;
            this.rootContainer.style.opacity = `${scale}`;
        }
        
        // Check if transition is complete
        if (this.transitionProgress >= 1) {
            if (this.bannerRoot && this.bannerRoot.scale) {
                if (this.transitionState === 'scaling-in') {
                    this.bannerRoot.scale.setScalar(1);
                } else if (this.transitionState === 'scaling-out') {
                    this.bannerRoot.scale.setScalar(0);
                }
            }
            
            if (this.rootContainer) {
                if (this.transitionState === 'scaling-in') {
                    this.rootContainer.style.transform = 'scale(1)';
                    this.rootContainer.style.opacity = '1';
                } else if (this.transitionState === 'scaling-out') {
                    this.rootContainer.style.transform = 'scale(0)';
                    this.rootContainer.style.opacity = '0';
                }
            }
            
            if (this.onTransitionComplete) {
                this.onTransitionComplete();
                this.onTransitionComplete = null;
            }
        }
    }
    
    /**
     * Creates and initializes the BannerRoot for Three.js scene
     * Call this after creating the scene and before adding objects
     * @protected
     * @param {Object} THREE - Three.js module
     * @returns {THREE.Object3D} The created BannerRoot
     */
    createBannerRoot(THREE) {
        if (!this.scene) {
            console.error('[BaseBanner] Cannot create BannerRoot: scene not initialized')
            return null
        }
        
        // Create empty Object3D named "BannerRoot"
        this.bannerRoot = new THREE.Object3D()
        this.bannerRoot.name = 'BannerRoot'
        this.bannerRoot.scale.setScalar(0) // Start at scale 0 for transition
        
        // Add to scene
        this.scene.add(this.bannerRoot)
        
        console.log('[BaseBanner] BannerRoot created and added to scene')
        
        return this.bannerRoot
    }
    
    /**
     * Loads and prepares jingle audio
     * @protected
     * @param {string} jinglePath - Path to jingle audio file
     */
    loadJingle(jinglePath) {
        if (!jinglePath) return
        
        this.jinglePath = jinglePath
        
        try {
            this.jingle = new Audio(jinglePath)
            this.jingle.volume = 0.5 // Default volume
            this.jingle.preload = 'auto'
            
            console.log('[BaseBanner] Jingle loaded:', jinglePath)
            
            // Register cleanup
            this.registerCleanup(() => {
                this.stopJingle()
                if (this.jingle) {
                    this.jingle.src = ''
                    this.jingle = null
                }
            })
        } catch (error) {
            console.error('[BaseBanner] Failed to load jingle:', error)
        }
    }
    
    /**
     * Plays the jingle if loaded
     * @protected
     */
    playJingle() {
        if (this.jingle && this.jingle.readyState >= 2) {
            try {
                this.jingle.currentTime = 0
                this.jingle.play().catch(err => {
                    console.warn('[BaseBanner] Failed to play jingle (user interaction may be required):', err)
                })
                console.log('[BaseBanner] Playing jingle')
            } catch (error) {
                console.error('[BaseBanner] Error playing jingle:', error)
            }
        }
    }
    
    /**
     * Stops the jingle if playing
     * @protected
     */
    stopJingle() {
        if (this.jingle) {
            try {
                this.jingle.pause()
                this.jingle.currentTime = 0
                console.log('[BaseBanner] Jingle stopped')
            } catch (error) {
                console.error('[BaseBanner] Error stopping jingle:', error)
            }
        }
    }
    
    /**
     * Creates a root container for transitions (for 2D content)
     * Should be called early in init() by subclasses that don't use Three.js
     * @protected
     */
    createTransitionContainer() {
        this.rootContainer = document.createElement('div')
        this.rootContainer.style.position = 'absolute'
        this.rootContainer.style.top = '0'
        this.rootContainer.style.left = '0'
        this.rootContainer.style.width = '100%'
        this.rootContainer.style.height = '100%'
        this.rootContainer.style.transformOrigin = 'center center'
        this.rootContainer.style.transform = 'scale(0)'
        this.rootContainer.style.opacity = '0'
        this.rootContainer.style.transition = 'none' // We handle transitions manually
        
        this.container.appendChild(this.rootContainer)
        
        // Register cleanup
        this.registerCleanup(() => {
            if (this.rootContainer && this.rootContainer.parentElement) {
                this.rootContainer.parentElement.removeChild(this.rootContainer)
            }
        })
        
        return this.rootContainer
    }
    
    /**
     * Starts the animation loop
     * @protected
     */
    startAnimationLoop() {
        if (this.isDisposed) return
        
        const loop = () => {
            if (this.isDisposed) return
            this.animationFrameId = requestAnimationFrame(loop)
            
            // Update transition first
            this.updateTransition()
            
            // Then run custom animation
            this.animate()
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera)
            }
        }
        
        loop()
    }
    
    /**
     * Stops the animation loop
     * @protected
     */
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }
    
    /**
     * Registers a cleanup handler
     * @param {Function} handler - Function to call during cleanup
     */
    registerCleanup(handler) {
        this.cleanupHandlers.push(handler)
    }
    
    /**
     * Creates a Three.js canvas renderer
     * @protected
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Promise<Object>} Object containing THREE module and canvas
     */
    async createThreeCanvas(width = 400, height = 240) {
        // Import Three.js - it exports everything as named exports
        const THREE = await import('three')
        
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.className = 'banner-canvas'
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.zIndex = '2'
        canvas.style.pointerEvents = 'none'
        
        // Append to root container if it exists, otherwise to main container
        const targetContainer = this.rootContainer || this.container
        targetContainer.appendChild(canvas)
        
        // Register cleanup for canvas removal
        this.registerCleanup(() => {
            if (canvas.parentElement) {
                canvas.parentElement.removeChild(canvas)
            }
        })
        
        return { THREE, canvas }
    }
    
    /**
     * Creates a standard Three.js scene setup
     * @protected
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} THREE - Three.js module
     * @param {Object} options - Configuration options
     * @returns {Object} Scene, camera, and renderer
     */
    createThreeScene(canvas, THREE, options = {}) {
        const {
            cameraFov = 75,
            cameraPosition = { x: 0, y: 0, z: 3 },
            ambientLight = { color: 0xffffff, intensity: 0.8 },
            directionalLight = { color: 0xffffff, intensity: 1.2, position: { x: 1, y: 1, z: 1 } },
            clearColor = 0x000000,
            clearAlpha = 0
        } = options
        
        // Scene
        this.scene = new THREE.Scene()
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            cameraFov,
            canvas.width / canvas.height,
            0.1,
            1000
        )
        this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
        this.camera.lookAt(0, 0, 0)
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        })
        this.renderer.setClearColor(clearColor, clearAlpha)
        this.renderer.setSize(canvas.width, canvas.height)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        
        // Lighting
        if (ambientLight) {
            const ambient = new THREE.AmbientLight(ambientLight.color, ambientLight.intensity)
            this.scene.add(ambient)
        }
        
        if (directionalLight) {
            const directional = new THREE.DirectionalLight(directionalLight.color, directionalLight.intensity)
            directional.position.set(directionalLight.position.x, directionalLight.position.y, directionalLight.position.z)
            this.scene.add(directional)
        }
        
        // Register Three.js cleanup
        this.registerCleanup(() => {
            if (this.scene) {
                this.scene.traverse(object => {
                    if (object.geometry) object.geometry.dispose()
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(m => m.dispose())
                        } else {
                            object.material.dispose()
                        }
                    }
                })
                
                while (this.scene.children.length > 0) {
                    this.scene.remove(this.scene.children[0])
                }
            }
            
            if (this.renderer) {
                this.renderer.dispose()
            }
        })
        
        return { scene: this.scene, camera: this.camera, renderer: this.renderer }
    }
    
    /**
     * Loads a GLTF model
     * @protected
     * @param {string} path - Path to the GLTF/GLB file
     * @returns {Promise<Object>} Loaded GLTF scene
     */
    async loadGLTF(path) {
        const { GLTFLoader } = await import('GLTFLoader')
        const loader = new GLTFLoader()
        
        try {
            const gltf = await loader.loadAsync(path)
            return gltf.scene
        } catch (error) {
            console.error(`[BaseBanner] Failed to load GLTF from ${path}:`, error)
            throw error
        }
    }
    
    /**
     * Creates a fallback 2D canvas banner
     * @protected
     * @param {string} text - Text to display
     * @param {Object} options - Styling options
     */
    createFallbackCanvas(text, options = {}) {
        const {
            width = 400,
            height = 240,
            backgroundColor = 'rgba(0, 0, 0, 0.3)',
            textColor = 'white',
            fontSize = '32px',
            fontFamily = '"Rodin", sans-serif'
        } = options
        
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.className = 'banner-fallback-canvas'
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.zIndex = '2'
        canvas.style.pointerEvents = 'none'
        
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false
        
        // Background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        
        // Text
        ctx.fillStyle = textColor
        ctx.font = `bold ${fontSize} ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        ctx.fillText(text, width / 2, height / 2)
        
        // Append to root container if it exists, otherwise to main container
        const targetContainer = this.rootContainer || this.container
        targetContainer.appendChild(canvas)
        
        // Register cleanup
        this.registerCleanup(() => {
            if (canvas.parentElement) {
                canvas.parentElement.removeChild(canvas)
            }
        })
        
        return canvas
    }
    
    /**
     * Cleans up resources and removes elements
     * Can be overridden but should call super.cleanup()
     */
    cleanup() {
        if (this.isDisposed) return
        
        console.log(`[BaseBanner] Cleaning up banner for ${this.appData?.id || 'unknown'}`)
        
        // Stop jingle FIRST before any other cleanup
        this.stopJingle();
        
        // Stop animation
        this.stopAnimationLoop()
        
        // Run all cleanup handlers in reverse order
        while (this.cleanupHandlers.length > 0) {
            const handler = this.cleanupHandlers.pop()
            try {
                handler()
            } catch (error) {
                console.error('[BaseBanner] Error in cleanup handler:', error)
            }
        }
        
        this.isDisposed = true
    }
    
    /**
     * Alias for cleanup (for backward compatibility)
     */
    dispose() {
        this.cleanup()
    }
    
    /**
     * Alias for cleanup (for backward compatibility)
     */
    destroy() {
        this.cleanup()
    }
}

/**
 * Factory function to create a banner instance from a class
 * This is the function that should be exported as default from banner modules
 * @param {typeof BaseBanner} BannerClass - Banner class constructor
 * @returns {Function} Factory function for creating banner instances
 */
export function createBannerFactory(BannerClass) {
    return async (container, appData) => {
        const banner = new BannerClass(container, appData)
        await banner.init()
        
        // Return an object with cleanup methods for compatibility
        return {
            cleanup: () => banner.cleanup(),
            dispose: () => banner.dispose(),
            destroy: () => banner.destroy(),
            // Also expose the banner instance itself
            banner
        }
    }
}
