/**
 * AppSelectionHelper - Reusable helper for app selection, banner loading, and jingle playing
 * Eliminates code duplication between grid and top bar app selection
 */
export class AppSelectionHelper {
    /**
     * Loads banner and plays jingle for an app
     * @param {Object} app - The app to load banner for
     * @param {Object} topScreen - TopScreen instance with loadBanner() method
     * @returns {Promise<void>}
     */
    static async loadAppBanner(app, topScreen) {
        if (!topScreen || !app) {
            console.warn('[AppSelectionHelper] Missing topScreen or app');
            return;
        }

        console.log(`[AppSelectionHelper] Loading banner for ${app.id}`);

        // Load banner if method exists
        if (typeof topScreen.loadBanner === 'function') {
            try {
                await topScreen.loadBanner(app);
            } catch (error) {
                console.error(`[AppSelectionHelper] Failed to load banner for ${app.id}:`, error);
            }
        }

        // Play jingle if available
        this.playAppJingle(app, topScreen);
    }

    /**
     * Plays jingle for an app
     * @param {Object} app - The app to play jingle for
     * @param {Object} topScreen - TopScreen instance with playBannerJingle() method
     */
    static playAppJingle(app, topScreen) {
        if (!topScreen || !app) return;

        const jinglePath = app.unopenedJingle || app.bannerJingle;
        
        if (jinglePath && typeof topScreen.playBannerJingle === 'function') {
            try {
                topScreen.playBannerJingle(jinglePath);
            } catch (error) {
                console.error(`[AppSelectionHelper] Failed to play jingle for ${app.id}:`, error);
            }
        }
    }

    /**
     * Handles double-click to launch logic
     * @param {string} appId - Current app ID
     * @param {string} lastSelectedId - Last selected app ID
     * @param {Object} app - App object
     * @param {Function} onLaunch - Callback when app should launch
     * @param {Function} languageData - Language data for onClick
     * @returns {string|null} New lastSelectedId
     */
    static handleDoubleClickLaunch(appId, lastSelectedId, app, onLaunch, languageData) {
        if (appId === lastSelectedId) {
            // Double-click detected - launch the app
            console.log(`[AppSelectionHelper] Double-click detected, launching ${appId}`);
            
            if (typeof app.onClick === 'function') {
                app.onClick(app, null, languageData);
            } else if (typeof onLaunch === 'function') {
                onLaunch(app);
            }
            
            return null; // Reset last selected
        } else {
            // First click - track for next click
            return appId;
        }
    }

    /**
     * Gets the selected app from either top bar or grid
     * @param {string} topBarSelectedId - Selected app ID in top bar
     * @param {Array} topBarApps - Array of top bar app buttons
     * @param {string} gridSelectedId - Selected app ID in grid
     * @param {Array} gridApps - Array of grid apps
     * @param {boolean} preferTopBar - Whether to prefer top bar app if both selected
     * @returns {Object|null} Selected app object
     */
    static getSelectedApp(topBarSelectedId, topBarApps, gridSelectedId, gridApps, preferTopBar = true) {
        let topBarApp = null;
        let gridApp = null;

        // Find top bar app
        if (topBarSelectedId && topBarApps) {
            const button = topBarApps.find(b => b.app.id === topBarSelectedId);
            topBarApp = button?.app;
        }

        // Find grid app
        if (gridSelectedId && gridApps) {
            gridApp = gridApps.find(app => app.id === gridSelectedId);
        }

        // Return based on preference
        if (preferTopBar) {
            return topBarApp || gridApp;
        } else {
            return gridApp || topBarApp;
        }
    }

    /**
     * Renders selection glow on a canvas
     * @param {HTMLCanvasElement} canvas - Canvas to render on
     * @param {number} size - Icon size
     * @param {Image} glowSprite - Glow sprite image
     */
    static renderSelectionGlow(canvas, size, glowSprite) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const glowSize = Math.ceil(size * 1.15);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        if (glowSprite && glowSprite.complete && glowSprite.naturalWidth > 0) {
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.drawImage(glowSprite, 0, 0, glowSize, glowSize);
            ctx.restore();
        }
    }

    /**
     * Creates selection glow canvas element
     * @param {number} size - Icon size
     * @returns {HTMLCanvasElement} Canvas element configured for glow
     */
    static createGlowCanvas(size) {
        const dpr = window.devicePixelRatio || 1;
        const glowSize = Math.ceil(size * 1.15);
        const glowOffset = (glowSize - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.className = 'selection-glow';
        canvas.width = glowSize * dpr;
        canvas.height = glowSize * dpr;
        canvas.style.width = `${glowSize}px`;
        canvas.style.height = `${glowSize}px`;
        canvas.style.position = 'absolute';
        canvas.style.left = `${-glowOffset}px`;
        canvas.style.top = `${-glowOffset}px`;
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.transition = 'opacity 0.2s ease';
        canvas.style.imageRendering = 'pixelated';

        return canvas;
    }
}
