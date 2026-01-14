    async _renderImageOnCanvas(targetCanvas, imageUrl, altText, options = {}) {
        if (!targetCanvas) return;
        
        const {
            fit = 'contain', // 'contain' (maintain aspect) or 'cover' (fill canvas)
            backgroundColor = null // Optional background color
        } = options;
        
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const dpr = window.devicePixelRatio || 1;
        const rect = targetCanvas.getBoundingClientRect();
        targetCanvas.width = rect.width * dpr;
        targetCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;

        // IMPORTANT: Always clear the canvas first
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Fill background if specified
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, rect.width, rect.height);
        }

        const loadImage = src => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });

        try {
            const img = await loadImage(imageUrl);

            const canvasAspect = rect.width / rect.height;
            const imageAspect = img.width / img.height;

            let drawWidth, drawHeight, drawX, drawY;

            if (fit === 'contain') {
                // CONTAIN: Fit image inside canvas, maintain aspect ratio (DEFAULT)
                if (imageAspect > canvasAspect) {
                    // Image is wider - fit to width
                    drawWidth = rect.width;
                    drawHeight = rect.width / imageAspect;
                    drawX = 0;
                    drawY = (rect.height - drawHeight) / 2;
                } else {
                    // Image is taller - fit to height
                    drawHeight = rect.height;
                    drawWidth = rect.height * imageAspect;
                    drawY = 0;
                    drawX = (rect.width - drawWidth) / 2;
                }
            } else if (fit === 'cover') {
                // COVER: Fill canvas completely, crop if needed
                if (imageAspect > canvasAspect) {
                    // Image is wider - fit to height and crop width
                    drawHeight = rect.height;
                    drawWidth = rect.height * imageAspect;
                    drawY = 0;
                    drawX = (rect.width - drawWidth) / 2;
                } else {
                    // Image is taller - fit to width and crop height
                    drawWidth = rect.width;
                    drawHeight = rect.width / imageAspect;
                    drawX = 0;
                    drawY = (rect.height - drawHeight) / 2;
                }
            } else if (fit === 'stretch') {
                // STRETCH: Fill canvas completely, distort image
                drawWidth = rect.width;
                drawHeight = rect.height;
                drawX = 0;
                drawY = 0;
            } else {
                // Default to contain
                if (imageAspect > canvasAspect) {
                    drawWidth = rect.width;
                    drawHeight = rect.width / imageAspect;
                    drawX = 0;
                    drawY = (rect.height - drawHeight) / 2;
                } else {
                    drawHeight = rect.height;
                    drawWidth = rect.height * imageAspect;
                    drawY = 0;
                    drawX = (rect.width - drawWidth) / 2;
                }
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        } catch (error) {
            console.error(`Failed to load and draw image from ${imageUrl}:`, error);
            this.displayBannerError(this.topScreenElement, altText, "Failed to load banner image.");
        }
    }
    
    async clearBanner() {
        console.log('[BannerManager] Clearing banner...');
        
        // Cleanup current banner API
        if (this.currentBannerAPI) {
            try {
                // If the banner supports transitions, scale it out first
                if (this.currentBannerAPI.banner && typeof this.currentBannerAPI.banner.transitionOut === 'function') {
                    console.log('[BannerManager] Scaling out banner before clearing');
                    await this.currentBannerAPI.banner.transitionOut();
                }
                
                // Then dispose it
                if (typeof this.currentBannerAPI.dispose === 'function') {
                    this.currentBannerAPI.dispose();
                } else if (typeof this.currentBannerAPI.cleanup === 'function') {
                    this.currentBannerAPI.cleanup();
                } else if (typeof this.currentBannerAPI.destroy === 'function') {
                    this.currentBannerAPI.destroy();
                }
            } catch (error) {
                console.error('[BannerManager] Error during banner cleanup:', error);
            }
            this.currentBannerAPI = null;
        }

        if (this.topScreenElement) {
            // Clear all banner content but keep status bar and top bar apps
            const childrenToRemove = Array.from(this.topScreenElement.childNodes).filter(child => {
                return !child.classList?.contains('status-bar-canvas') && 
                       !child.classList?.contains('top-bar-apps') &&
                       child.id !== 'Loader' && // Also keep loader
                       child.id !== 'top-canvas' && // Keep background canvas
                       child.id !== 'body-background-canvas'; // Keep body background
            });
            
            // Remove and dispose of canvas elements
            childrenToRemove.forEach(child => {
                // If it's a canvas, clear it first
                if (child.tagName === 'CANVAS') {
                    const ctx = child.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, child.width, child.height);
                    }
                }
                
                // Remove from DOM
                if (child.parentNode) {
                    child.parentNode.removeChild(child);
                }
            });
            
            console.log(`[BannerManager] Cleared ${childrenToRemove.length} banner elements`);
        }
    }

    async loadBanner(appDataItem) {
        if (!this.topScreenElement) {
            console.error("BannerManager: Top screen element reference is missing.");
            return;
        }

        console.log('[BannerManager] Loading banner for:', appDataItem.localizedLabel);

        // Cleanup previous banner with scale-out transition
        if (this.currentBannerAPI) {
            try {
                // If the banner supports transitions, scale it out first
                if (this.currentBannerAPI.banner && typeof this.currentBannerAPI.banner.transitionOut === 'function') {
                    console.log('[BannerManager] Scaling out previous banner');
                    await this.currentBannerAPI.banner.transitionOut();
                }
                
                // Then dispose it
                if (typeof this.currentBannerAPI.dispose === 'function') {
                    this.currentBannerAPI.dispose();
                } else if (typeof this.currentBannerAPI.cleanup === 'function') {
                    this.currentBannerAPI.cleanup();
                } else if (typeof this.currentBannerAPI.destroy === 'function') {
                    this.currentBannerAPI.destroy();
                }
            } catch (e) {
                console.error("BannerManager: Error disposing previous banner:", e);
            }
            this.currentBannerAPI = null;
        }

        // Clear all banner children (but keep status bar, top bar apps, loader, and background canvases)
        const childrenToRemove = Array.from(this.topScreenElement.childNodes).filter(child => {
            return !child.classList?.contains('status-bar-canvas') && 
                   !child.classList?.contains('top-bar-apps') &&
                   child.id !== 'Loader' &&
                   child.id !== 'top-canvas' &&
                   child.id !== 'body-background-canvas';
        });
        
        // Clear canvases and remove elements
        childrenToRemove.forEach(child => {
            if (child.tagName === 'CANVAS') {
                const ctx = child.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, child.width, child.height);
                }
            }
            
            // Remove from DOM
            if (child.parentNode) {
                child.parentNode.removeChild(child);
            }
        });

        let activeBannerModule = appDataItem.unopened ? appDataItem.unopenedBannerModule : appDataItem.bannerModule;
        let activeBannerImage = appDataItem.unopened ? appDataItem.unopenedBanner : appDataItem.banner;

        if(appDataItem.unopened) {
            if (appDataItem.unopenedBannerModule) activeBannerImage = null;
            else if (appDataItem.unopenedBanner) activeBannerModule = null;
            else { activeBannerImage = null; activeBannerModule = null; }
        }

        try {
            if (activeBannerModule && typeof activeBannerModule === 'string') {
                console.log('[BannerManager] Loading banner module:', activeBannerModule);
                const bannerModule = await import(activeBannerModule);
                let bannerInstanceAPI;
                
                // Check for class-based banner (default export that's a class)
                if (typeof bannerModule.default === 'function' && 
                    bannerModule.default.prototype && 
                    bannerModule.default.prototype.constructor === bannerModule.default) {
                    
                    console.log('[BannerManager] Detected class-based banner');
                    
                    // Create container for class-based banner
                    const container = document.createElement('div');
                    container.className = 'banner-module-container';
                    container.style.position = 'absolute';
                    container.style.top = '0';
                    container.style.left = '0';
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.zIndex = '2';
                    container.style.pointerEvents = 'none';
                    this.topScreenElement.appendChild(container);
                    
                    // Instantiate and initialize the banner class
                    const BannerClass = bannerModule.default;
                    const banner = new BannerClass(container, appDataItem);
                    await banner.init();
                    
                    bannerInstanceAPI = {
                        dispose: () => banner.cleanup ? banner.cleanup() : banner.dispose(),
                        cleanup: () => banner.cleanup ? banner.cleanup() : banner.dispose(),
                        destroy: () => banner.destroy ? banner.destroy() : banner.cleanup(),
                        banner
                    };
                    
                    // Start scale-in transition
                    if (typeof banner.transitionIn === 'function') {
                        console.log('[BannerManager] Starting scale-in transition');
                        banner.transitionIn();
                    }
                }
                // Check for function-based banner exports
                else {
                    const creationFunction = bannerModule.createBannerScene || 
                                           bannerModule.default || 
                                           bannerModule.loadBanner || 
                                           bannerModule.loadBannerInto || 
                                           bannerModule.initializeBanner;

                    if (creationFunction && typeof creationFunction === 'function') {
                        console.log('[BannerManager] Detected function-based banner');
                        
                        const bannerCanvas = document.createElement('canvas');
                        this.setDefaultBannerStyles(bannerCanvas);
                        this.topScreenElement.appendChild(bannerCanvas);

                        bannerInstanceAPI = await creationFunction(bannerCanvas, appDataItem, appDataItem.assetPaths || {});
                    } else {
                        throw new Error(`Module '${activeBannerModule}' does not export a recognized banner creation function or class.`);
                    }
                }

                if (bannerInstanceAPI) {
                    this.currentBannerAPI = bannerInstanceAPI;
                }

            } else if (activeBannerImage && typeof activeBannerImage === 'string') {
                console.log('[BannerManager] Loading image banner:', activeBannerImage);
                this.currentBannerAPI = null;
                const bannerCanvas = document.createElement('canvas');
                this.setDefaultBannerStyles(bannerCanvas);
                this.topScreenElement.appendChild(bannerCanvas);
                
                // Use 'contain' fit by default to maintain aspect ratio
                await this._renderImageOnCanvas(
                    bannerCanvas, 
                    activeBannerImage, 
                    `${appDataItem.localizedLabel || 'App'} Banner`,
                    { 
                        fit: 'contain', // Don't stretch by default
                        backgroundColor: null // No background
                    }
                );

            } else {
                console.log('[BannerManager] Loading text banner');
                this.currentBannerAPI = null;
                const bannerCanvas = document.createElement('canvas');
                this.setDefaultBannerStyles(bannerCanvas);
                this.topScreenElement.appendChild(bannerCanvas);

                // Use localized label and description here
                let titleText = appDataItem.localizedLabel || 'Application';
                let descText = appDataItem.localizedDescription || (appDataItem.unopened ? 'Mystery Item' : 'Select to learn more.');
                this.renderTextOnCanvas(bannerCanvas, [titleText, descText]);
            }
        } catch (error) {
            console.error(`BannerManager: Error loading banner for '${appDataItem.localizedLabel}':`, error);
            this.displayBannerError(this.topScreenElement, appDataItem.localizedLabel, error.message);
        }
    }
