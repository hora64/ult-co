import { UIComponent } from '/content/common/utils/index.js';
import { AppBanner } from '/content/common/utils/banners/AppBanner.js';

export class TopScreen extends UIComponent {
    constructor(appInstance) {
        super();
        this.app = appInstance;
        this.element = this.createElement("div", "top-screen");
        
        // Create canvas for status bar
        this.statusCanvas = this.createElement("canvas", "status-canvas");
        this.statusCtx = this.statusCanvas.getContext("2d");
        this.statusCtx.imageSmoothingEnabled = false;
        
        // Set high z-index to ensure status bar is above Three.js content
        this.statusCanvas.style.position = 'absolute';
        this.statusCanvas.style.top = '0';
        this.statusCanvas.style.left = '0';
        this.statusCanvas.style.width = '100%';
        this.statusCanvas.style.height = '30px';
        this.statusCanvas.style.zIndex = '1000';
        this.statusCanvas.style.pointerEvents = 'none';
        
        this.element.appendChild(this.statusCanvas);
        
        this.clockInterval = null;
        this.timeOffset = 0;
        
        // Banner management
        this.currentBannerCleanup = null;
        this.currentBannerAppId = null;
        this.isLoadingBanner = false;
        
        // Load time offset from localStorage
        this._loadTimeOffset();
        
        window.addEventListener("resize", () => this.handleResize());
    }

    /**
     * Shows the top screen (called by HomeScreenApp)
     */
    show() {
        // Start the status bar when shown
        this.startStatusBar();
    }

    /**
     * Load time offset from localStorage customTime
     */
    _loadTimeOffset() {
        const storedTime = localStorage.getItem('customTime');
        if (storedTime) {
            try {
                const customTime = new Date(storedTime);
                const systemTime = new Date();
                this.timeOffset = customTime.getTime() - systemTime.getTime();
                console.log('[HomeScreen TopScreen] Loaded time offset:', this.timeOffset, 'ms');
            } catch (error) {
                console.warn('[HomeScreen TopScreen] Failed to parse customTime:', error);
            }
        }
    }

    /**
     * Register a new time offset (called when time changes in Settings)
     */
    registerTimeOffset(offset) {
        this.timeOffset = offset;
        console.log('[HomeScreen TopScreen] Time offset registered:', offset, 'ms');
        this.drawStatusBar(); // Redraw immediately with new offset
    }

    /**
     * Sets the unread count (stub for compatibility with HomeScreenApp)
     */
    setUnreadCount(count) {
        // HomeScreen doesn't display unread count on top screen
        // This is a stub for API compatibility
        console.log('[HomeScreen TopScreen] Unread count:', count);
    }

    startStatusBar() {
        this.drawStatusBar();
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => this.drawStatusBar(), 1000);
    }

    drawStatusBar() {
        const rect = this.statusCanvas.getBoundingClientRect();
        this.statusCanvas.width = rect.width;
        this.statusCanvas.height = rect.height;
        const ctx = this.statusCtx;
        const width = rect.width;
        const height = rect.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Semi-transparent background bar at top
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, width, 30);
        
        // Get current time with offset
        let displayTime;
        const userTimeZone = localStorage.getItem('userTimeZone');
        
        if (this.timeOffset !== 0) {
            // Apply custom time offset
            const adjustedTime = Date.now() + this.timeOffset;
            displayTime = userTimeZone 
                ? luxon.DateTime.fromMillis(adjustedTime).setZone(userTimeZone)
                : luxon.DateTime.fromMillis(adjustedTime);
        } else {
            // Use system time
            displayTime = userTimeZone 
                ? luxon.DateTime.local().setZone(userTimeZone)
                : luxon.DateTime.local();
        }
        
        // Format: "Month Date, Time TimeZone" (e.g., "Jan 15, 3:45 PM PST")
        const monthDate = displayTime.toFormat('MMM d');
        const time = displayTime.toFormat('h:mm a');
        const timeZoneAbbr = displayTime.toFormat('ZZZZ');
        const fullText = `${monthDate}, ${time} ${timeZoneAbbr}`;
        
        // Draw date and time on the right side
        ctx.font = '14px "Rodin", sans-serif';
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(fullText, width - 15, 15);
    }

    handleResize() {
        const parentRect = this.element.getBoundingClientRect();
        this.statusCanvas.width = parentRect.width;
        this.statusCanvas.height = parentRect.height;
        this.drawStatusBar();
    }
    
    /**
     * Loads and displays a banner for the given app
     * @param {Object} app - App data object with banner information
     */
    async loadBanner(app) {
        console.log('[TopScreen] loadBanner called with app:', app);
        console.log('[TopScreen] App icon:', app?.icon);
        console.log('[TopScreen] App banner:', app?.banner);
        console.log('[TopScreen] App bannerAnimated:', app?.bannerAnimated);
        console.log('[TopScreen] App bannerModule:', app?.bannerModule);
        console.log('[TopScreen] App unopened:', app?.unopened);
        console.log('[TopScreen] App _isTopBar:', app?._isTopBar);
        
        // Prevent concurrent banner loads
        if (this.isLoadingBanner) {
            console.log('[TopScreen] Banner load already in progress, skipping duplicate call');
            return;
        }
        
        // Prevent double-loading the same banner
        if (this.currentBannerAppId === app?.id) {
            console.log('[TopScreen] Banner already loaded for', app.id, '- skipping');
            return;
        }
        
        // Set loading flag
        this.isLoadingBanner = true;
        
        try {
            // CRITICAL: Clean up previous banner FIRST (before removing DOM)
            // This ensures Three.js resources are properly disposed AND jingle is stopped
            if (this.currentBannerCleanup) {
                try {
                    console.log('[TopScreen] Cleaning up previous banner (stopping jingle and disposing resources)');
                    this.currentBannerCleanup();
                } catch (error) {
                    console.error('[TopScreen] Error cleaning up previous banner:', error);
                }
                this.currentBannerCleanup = null;
            }
            
            // Clear the current banner app ID
            this.currentBannerAppId = null;
            
            // Small delay to ensure audio cleanup completes
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // THEN clear DOM elements (after cleanup is complete)
            const existingBanners = this.element.querySelectorAll('.banner-canvas, .banner-text-canvas, .banner-module-container');
            console.log('[TopScreen] Clearing', existingBanners.length, 'existing banner DOM elements');
            existingBanners.forEach(banner => {
                if (banner.parentElement) {
                    banner.parentElement.removeChild(banner);
                }
            });
            
            // Set the new banner app ID
            this.currentBannerAppId = app?.id;
            
            // Determine which banner properties to use
            let bannerModule = app.bannerModule;
            let bannerAnimated = app.bannerAnimated;
            let bannerImage = app.banner;
            
            // For unopened apps (but NOT top bar apps), use unopened banner properties
            // Top bar apps should always use standard properties since they're never wrapped
            if (app.unopened && !app._isTopBar) {
                console.log('[TopScreen] App is unopened (not top bar), checking for unopened banner properties');
                
                // Check for unopened properties in layouts structure first
                if (app.layouts && app.layouts['3ds'] && app.layouts['3ds'].unopened) {
                    const unopenedConfig = app.layouts['3ds'].unopened;
                    bannerModule = unopenedConfig.bannerModule || bannerModule;
                    bannerAnimated = unopenedConfig.bannerAnimated || bannerAnimated;
                    bannerImage = unopenedConfig.banner || bannerImage;
                    console.log('[TopScreen] Using unopened banner from layouts.3ds.unopened:', {
                        module: bannerModule,
                        animated: bannerAnimated,
                        image: bannerImage
                    });
                } else {
                    // Fallback to old-style properties
                    bannerModule = app.unopenedBannerModule || bannerModule;
                    bannerAnimated = app.unopenedBannerAnimated || bannerAnimated;
                    bannerImage = app.unopenedBanner || bannerImage;
                    console.log('[TopScreen] Using unopened banner from old-style properties');
                }
            } else if (app._isTopBar) {
                console.log('[TopScreen] App is top bar app, using standard banner properties');
                
                // For top bar apps, use properties from layouts.3ds if available
                if (app.layouts && app.layouts['3ds']) {
                    const layout3ds = app.layouts['3ds'];
                    bannerModule = layout3ds.bannerModule || bannerModule;
                    bannerAnimated = layout3ds.bannerAnimated || bannerAnimated;
                    bannerImage = layout3ds.banner || bannerImage;
                    console.log('[TopScreen] Using banner from layouts.3ds for top bar app');
                }
            } else {
                console.log('[TopScreen] App is opened (not top bar), using standard banner properties');
                
                // For opened grid apps, use properties from layouts.3ds if available
                if (app.layouts && app.layouts['3ds']) {
                    const layout3ds = app.layouts['3ds'];
                    bannerModule = layout3ds.bannerModule || bannerModule;
                    bannerAnimated = layout3ds.bannerAnimated || bannerAnimated;
                    bannerImage = layout3ds.banner || bannerImage;
                    console.log('[TopScreen] Using banner from layouts.3ds for opened app');
                }
            }
            
            console.log('[TopScreen] Using banner properties:', {
                module: bannerModule,
                animated: bannerAnimated,
                image: bannerImage
            });
            
            // Priority 1: Dynamic banner module (JavaScript)
            if (bannerModule) {
                console.log('[TopScreen] Loading banner module:', bannerModule);
                await this.loadBannerModule(bannerModule, app);
            }
            // Priority 2: Animated GLB banner
            else if (bannerAnimated && bannerAnimated.endsWith('.glb')) {
                console.log('[TopScreen] Loading GLB banner:', bannerAnimated);
                await this.loadGLBBanner(bannerAnimated, app);
            }
            // Priority 3: Static image banner
            else if (bannerImage) {
                console.log('[TopScreen] Loading static banner:', bannerImage);
                await this.loadStaticBanner(bannerImage, app);
            } 
            // Priority 4: Text fallback
            else {
                console.log('[TopScreen] No banner available, displaying text fallback for app:', app.id);
                await this.displayTextBanner(app);
            }
        } finally {
            // Always clear the loading flag when done
            this.isLoadingBanner = false;
        }
    }
    
    /**
     * Loads and displays a dynamic banner module
     * @param {string} modulePath - Path to the banner module JavaScript file
     * @param {Object} app - App data object
     */
    async loadBannerModule(modulePath, app) {
        try {
            console.log('[TopScreen] Importing banner module:', modulePath);
            
            // Import the banner module
            const bannerModule = await import(modulePath);
            console.log('[TopScreen] Banner module loaded:', bannerModule);
            
            // Create container for the banner
            const container = document.createElement('div');
            container.className = 'banner-module-container';
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '400px';
            container.style.height = '240px';
            container.style.zIndex = '2';
            container.style.pointerEvents = 'none';
            container.style.overflow = 'hidden';
            
            this.element.appendChild(container);
            
            // Check for class-based banner (default export that's a class)
            let bannerResult;
            
            if (typeof bannerModule.default === 'function' && 
                bannerModule.default.prototype && 
                bannerModule.default.prototype.constructor === bannerModule.default) {
                
                console.log('[TopScreen] Detected class-based banner for', app.id);
                
                // Instantiate and initialize the banner class
                const BannerClass = bannerModule.default;
                const banner = new BannerClass(container, app);
                console.log('[TopScreen] Banner instance created, calling init() for', app.id);
                await banner.init();
                console.log('[TopScreen] Banner init() complete, calling transitionIn() for', app.id);
                
                // Start transition-in animation (jingle plays after transition)
                if (typeof banner.transitionIn === 'function') {
                    await banner.transitionIn();
                    console.log('[TopScreen] Banner transitionIn() complete for', app.id);
                }
                
                bannerResult = {
                    cleanup: () => banner.cleanup ? banner.cleanup() : banner.dispose(),
                    dispose: () => banner.dispose ? banner.dispose() : banner.cleanup(),
                    destroy: () => banner.destroy ? banner.destroy() : banner.cleanup(),
                    banner
                };
            }
            // Check for function-based banner exports
            else {
                let bannerInitFn = null;
                
                if (typeof bannerModule.default === 'function') {
                    bannerInitFn = bannerModule.default;
                } else if (typeof bannerModule.init === 'function') {
                    bannerInitFn = bannerModule.init;
                } else if (typeof bannerModule.createBanner === 'function') {
                    bannerInitFn = bannerModule.createBanner;
                } else if (typeof bannerModule.createBannerScene === 'function') {
                    bannerInitFn = bannerModule.createBannerScene;
                } else if (typeof bannerModule.render === 'function') {
                    bannerInitFn = bannerModule.render;
                }
                
                if (bannerInitFn) {
                    console.log('[TopScreen] Detected function-based banner for', app.id);
                    // Call the banner initialization function
                    bannerResult = await bannerInitFn(container, app);
                    
                    // Start transition-in if the banner supports it
                    if (bannerResult && bannerResult.banner && typeof bannerResult.banner.transitionIn === 'function') {
                        console.log('[TopScreen] Calling transitionIn() for function-based banner', app.id);
                        await bannerResult.banner.transitionIn();
                    }
                } else {
                    console.error('[TopScreen] Banner module does not export a recognized function or class');
                    await this.displayTextBanner(app);
                    return;
                }
            }
            
            // Store cleanup function if provided
            if (bannerResult && typeof bannerResult.cleanup === 'function') {
                this.currentBannerCleanup = bannerResult.cleanup;
            } else if (bannerResult && typeof bannerResult.dispose === 'function') {
                this.currentBannerCleanup = bannerResult.dispose;
            } else if (bannerResult && typeof bannerResult.destroy === 'function') {
                this.currentBannerCleanup = bannerResult.destroy;
            } else {
                this.currentBannerCleanup = () => {
                    container.remove();
                };
            }
            
            console.log('[TopScreen] Banner module initialized successfully for', app.id);
            
        } catch (error) {
            console.error('[TopScreen] Failed to load banner module:', error);
            // Fall back to text banner
            await this.displayTextBanner(app);
        }
    }
    
    /**
     * Displays app label as text when no banner is available
     * Uses AppBanner class with text type
     * @param {Object} app - App data object
     */
    async displayTextBanner(app) {
        try {
            // Create container for the banner
            const container = this.createBannerContainer();
            
            // Create and initialize AppBanner with text type
            const banner = new AppBanner(container, app, { type: 'text' });
            await banner.init();
            
            // Start transition-in animation (jingle plays after transition)
            if (typeof banner.transitionIn === 'function') {
                await banner.transitionIn();
            }
            
            // Store cleanup function with proper disposal
            this.currentBannerCleanup = () => {
                console.log('[TopScreen] Cleaning up text banner');
                
                // Call all possible cleanup methods
                if (typeof banner.cleanup === 'function') {
                    banner.cleanup();
                }
                if (typeof banner.dispose === 'function') {
                    banner.dispose();
                }
                
                // Remove container from DOM
                if (container && container.parentElement) {
                    container.parentElement.removeChild(container);
                }
            };
            
            console.log('[TopScreen] Text banner displayed for:', app.localizedLabel || app.label || app.id);
        } catch (error) {
            console.error('[TopScreen] Error creating text banner:', error);
        }
    }
    
    /**
     * Loads and displays a GLB model banner with animation
     * Uses AppBanner class with glb type
     * @param {string} glbPath - Path to the GLB model file
     * @param {Object} app - App data object
     */
    async loadGLBBanner(glbPath, app) {
        try {
            console.log('[TopScreen] Starting GLB banner load:', glbPath);
            
            // Create container for the banner
            const container = this.createBannerContainer();
            
            // Create and initialize AppBanner with glb type
            const banner = new AppBanner(container, app, { type: 'glb', source: glbPath });
            await banner.init();
            
            // Start transition-in animation (jingle plays after transition)
            if (typeof banner.transitionIn === 'function') {
                await banner.transitionIn();
            }
            
            // Store cleanup function with proper disposal
            this.currentBannerCleanup = () => {
                console.log('[TopScreen] Cleaning up GLB banner');
                
                // Call all possible cleanup methods
                if (typeof banner.cleanup === 'function') {
                    banner.cleanup();
                }
                if (typeof banner.dispose === 'function') {
                    banner.dispose();
                }
                
                // Remove container from DOM
                if (container && container.parentElement) {
                    container.parentElement.removeChild(container);
                }
            };
            
            console.log('[TopScreen] GLB banner loaded successfully');
        } catch (error) {
            console.error('[TopScreen] Failed to load GLB banner:', error);
            // Fall back to text banner
            await this.displayTextBanner(app);
        }
    }
    
    /**
     * Loads and displays a static image banner
     * Uses AppBanner class with image type
     * @param {string} imagePath - Path to the banner image
     * @param {Object} app - App data object
     */
    async loadStaticBanner(imagePath, app) {
        try {
            console.log('[TopScreen] loadStaticBanner called with path:', imagePath);
            
            // Create container for the banner
            const container = this.createBannerContainer();
            
            // Create and initialize AppBanner with image type
            const banner = new AppBanner(container, app, { type: 'image', source: imagePath });
            await banner.init();
            
            // Start transition-in animation (jingle plays after transition)
            if (typeof banner.transitionIn === 'function') {
                await banner.transitionIn();
            }
            
            // Store cleanup function with proper disposal
            this.currentBannerCleanup = () => {
                console.log('[TopScreen] Cleaning up static image banner');
                
                // Call all possible cleanup methods
                if (typeof banner.cleanup === 'function') {
                    banner.cleanup();
                }
                if (typeof banner.dispose === 'function') {
                    banner.dispose();
                }
                
                // Remove container from DOM
                if (container && container.parentElement) {
                    container.parentElement.removeChild(container);
                }
            };
            
            console.log('[TopScreen] Image banner loaded successfully');
        } catch (error) {
            console.error('[TopScreen] Failed to load image banner:', error);
            // Fall back to text banner
            await this.displayTextBanner(app);
        }
    }
    
    /**
     * Creates a banner container element
     * @private
     * @returns {HTMLElement} Container element
     */
    createBannerContainer() {
        const container = document.createElement('div');
        container.className = 'banner-module-container';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '400px';
        container.style.height = '240px';
        container.style.zIndex = '2';
        container.style.pointerEvents = 'none';
        
        this.element.appendChild(container);
        return container;
    }
    
    cleanup() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
        
        // Clean up banner
        if (this.currentBannerCleanup) {
            this.currentBannerCleanup();
            this.currentBannerCleanup = null;
        }
        
        // Clear banner tracking
        this.currentBannerAppId = null;
        this.isLoadingBanner = false;
    }
}
