// content/common/utils/BannerManager.js

export class BannerManager {
    /**
     * Manages the display of banners on the top screen.
     * @param {HTMLElement} topScreenElement - The container element for banners.
     */
    constructor(topScreenElement) {
        this.topScreenElement = topScreenElement;
        this.currentBannerAPI = null; // To hold the API of the current banner for cleanup

        this._loadCustomFonts();
    }

    /**
     * Loads the custom font file explicitly via JavaScript.
     * @private
     */
    async _loadCustomFonts() {
        try {
            // Use the exact name "Rodin" to match mail.html's CSS
            const customFont = new FontFace('Rodin', `url('/content/common/fonts/FOT-RodinNTLG Pro DB.otf')`);
            await customFont.load();
            document.fonts.add(customFont);
            console.log('BannerManager: Custom font "Rodin" loaded successfully.');
        } catch (error)
        {
            console.error('BannerManager: Failed to load custom font:', error);
        }
    }

    setDefaultBannerStyles(element) {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.display = 'block';
    }

    async _renderImageOnCanvas(targetCanvas, imageUrl, altText) {
        if (!targetCanvas) return;
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const dpr = window.devicePixelRatio || 1;
        const rect = targetCanvas.getBoundingClientRect();
        targetCanvas.width = rect.width * dpr;
        targetCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;


        ctx.clearRect(0, 0, rect.width, rect.height);

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

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        } catch (error) {
            console.error(`Failed to load and draw image from ${imageUrl}:`, error);
            this.displayBannerError(this.topScreenElement, altText, "Failed to load banner image.");
        }
    }

    displayBannerError(parentElement, label, message = "Could not load banner.") {
        const childrenToClearError = Array.from(parentElement.childNodes).filter(child => child.id !== 'Loader');
        childrenToClearError.forEach(child => parentElement.removeChild(child));

        const errorCanvas = document.createElement('canvas');
        this.setDefaultBannerStyles(errorCanvas);

        parentElement.appendChild(errorCanvas);

        const title = `Banner Error: ${label}`;
        this.renderTextOnCanvas(errorCanvas, [title, message], { fillStyle: '#ffdddd' });
    }

    renderTextOnCanvas(targetCanvas, text, options = {}) {
        if (!targetCanvas) return;
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const rect = targetCanvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        targetCanvas.width = rect.width * dpr;
        targetCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, rect.width, rect.height);


        const config = {
            titleFont: 'bold 24px "Rodin", sans-serif',
            bodyFont: '16px "Rodin", sans-serif',
            fillStyle: '#FFFFFF',
            textAlign: 'center',
            textBaseline: 'middle',
            lineSpacing: 10,
            padding: 20,
            ...options
        };

        const textArray = Array.isArray(text) ? text : [text];
        const maxWidth = rect.width - (config.padding * 2);

        const wrapText = (font, textBlock) => {
            ctx.font = font;
            const words = String(textBlock).split(' ');
            let lines = [];
            let currentLine = '';
            for (let i = 0; i < words.length; i++) {
                let testLine = currentLine + words[i] + ' ';
                let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && i > 0) {
                    lines.push(currentLine.trim());
                    currentLine = words[i] + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine.trim());
            return lines;
        }

        let allLines = [];
        let lineFonts = [];

        textArray.forEach((textBlock, index) => {
            const font = (index === 0 && textArray.length > 1) ? config.titleFont : config.bodyFont;
            const wrapped = wrapText(font, textBlock);
            allLines.push(...wrapped);
            wrapped.forEach(() => lineFonts.push(font));
        });

        const totalHeight = allLines.reduce((acc, line, index) => {
            const font = lineFonts[index];
            const fontHeight = parseInt(font.match(/\d+/), 10);
            return acc + fontHeight + (index < allLines.length - 1 ? config.lineSpacing : 0);
        }, 0);

        let startY = (rect.height - totalHeight) / 2;

        ctx.fillStyle = config.fillStyle;
        ctx.textAlign = config.textAlign;
        ctx.textBaseline = 'top';

        allLines.forEach((line, index) => {
            const font = lineFonts[index];
            ctx.font = font;
            const fontHeight = parseInt(font.match(/\d+/), 10);
            const xPos = config.textAlign === 'center' ? rect.width / 2 : config.padding;
            ctx.fillText(line, xPos, startY);
            startY += fontHeight + config.lineSpacing;
        });
    }

    async loadBanner(appDataItem) {
        if (!this.topScreenElement) {
            console.error("BannerManager: Top screen element reference is missing.");
            return;
        }

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

        // Clear all children except for status bar and other permanent elements
        const childrenToRemove = Array.from(this.topScreenElement.childNodes).filter(child => {
            // Keep status bar and top bar apps
            return !child.classList?.contains('status-bar-canvas') && 
                   !child.classList?.contains('top-bar-apps');
        });
        childrenToRemove.forEach(child => this.topScreenElement.removeChild(child));

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
                    container.style.position = 'absolute';
                    container.style.top = '0';
                    container.style.left = '0';
                    container.style.width = '100%';
                    container.style.height = '100%';
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
                this.currentBannerAPI = null;
                const bannerCanvas = document.createElement('canvas');
                this.setDefaultBannerStyles(bannerCanvas);
                this.topScreenElement.appendChild(bannerCanvas);
                this._renderImageOnCanvas(bannerCanvas, activeBannerImage, `${appDataItem.localizedLabel || 'App'} Banner`);

            } else {
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

    async clearBanner() {
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
                       !child.classList?.contains('top-bar-apps');
            });
            childrenToRemove.forEach(child => this.topScreenElement.removeChild(child));
        }
    }
}
