import { IconLoader } from './IconLoader.js';

/**
 * ProductIconRenderer - Shared rendering logic for product icons
 * Handles rendering icons at different sizes for both top bar and grid
 * Supports base+overlay pattern, rounded corners, and animated icons
 */
export class ProductIconRenderer {
    /**
     * Renders a product icon on a canvas
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {Object} options - Rendering options
     * @returns {Promise<void>}
     */
    static async renderIcon(canvas, options) {
        const {
            icon,
            baseIcon,
            unopened = false,
            width = 48,
            height = 48,
            baseImage = null,
            backgroundIcon = null, // Custom background icon (base layer)
            unopenedImage = null,
            wrapIcon = null, // Custom wrap icon (gift box)
            overlayScale = 0.7,
            overlayBorderRadius = 0.10,
            animated = false, // Support for animated icons
            animationFrame = 0 // Current animation frame
        } = options;

        const ctx = canvas.getContext('2d');

        // Disable image smoothing for pixelated look
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

        // Adjust for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        // Default base icon - white blank app icon for products (from CSS variable)
        const defaultBaseIcon = getComputedStyle(document.documentElement)
            .getPropertyValue('--ultshop-default-background-icon')
            .trim()
            .replace(/^["']|["']$/g, '') || '/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png';

        // NEW SCHEMA: Always use base + overlay pattern for consistency
        // This allows animated overlays and simplifies rendering logic
        let baseSrc;
        let overlaySrc = null;

        if (baseIcon) {
            // BaseIcon products: Use background/base as the static layer
            // Overlay contains the actual icon (which can be animated)
            if (unopened) {
                // Wrapped: base layer + gift box overlay
                baseSrc = backgroundIcon || baseImage || icon;
                overlaySrc = wrapIcon || unopenedImage;
            } else {
                // Unwrapped: base layer + icon overlay
                // This allows the icon to be animated!
                baseSrc = backgroundIcon || baseImage || icon;
                overlaySrc = icon; // Icon as overlay (can be animated)
            }
        } else {
            // Regular products: Use background + overlay pattern
            if (unopened) {
                // Wrapped: background + gift box overlay
                baseSrc = backgroundIcon || baseImage || defaultBaseIcon;
                overlaySrc = wrapIcon || unopenedImage;
            } else {
                // Unwrapped: background + icon overlay
                baseSrc = backgroundIcon || baseImage || defaultBaseIcon;
                overlaySrc = icon;
            }
        }

        // Draw base image (static layer)
        try {
            const baseImg = await IconLoader.loadIcon(baseSrc);
            ctx.drawImage(baseImg, 0, 0, width, height);
        } catch (error) {
            console.error('ProductIconRenderer: Failed to draw base icon', error);
            this.drawErrorIcon(ctx, width, height);
            return;
        }

        // Draw overlay if exists (can be animated)
        if (overlaySrc) {
            try {
                const overlayImg = await IconLoader.loadIcon(overlaySrc, { 
                    animated, 
                    frame: animationFrame 
                });
                const overlaySize = width * overlayScale;
                const overlayPos = (width - overlaySize) / 2;
                const borderRadius = overlaySize * overlayBorderRadius;

                ctx.save();
                this.createRoundedRectPath(ctx, overlayPos, overlayPos, overlaySize, overlaySize, borderRadius);
                ctx.clip();
                ctx.drawImage(overlayImg, overlayPos, overlayPos, overlaySize, overlaySize);
                ctx.restore();
            } catch (error) {
                console.warn('ProductIconRenderer: Could not load overlay icon, showing base only', error);
            }
        }
    }

    /**
     * Renders an animated icon (continuously updates)
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {Object} options - Same as renderIcon options
     * @returns {Function} Stop function to cancel animation
     */
    static renderAnimatedIcon(canvas, options) {
        let animationFrame = 0;
        let animationHandle = null;
        let isRunning = true;

        const animate = async () => {
            if (!isRunning) return;

            await this.renderIcon(canvas, {
                ...options,
                animated: true,
                animationFrame
            });

            animationFrame++;
            animationHandle = requestAnimationFrame(animate);
        };

        animate();

        // Return stop function
        return () => {
            isRunning = false;
            if (animationHandle) {
                cancelAnimationFrame(animationHandle);
            }
        };
    }

    /**
     * Creates a rounded rectangle path for clipping
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} radius - Corner radius
     */
    static createRoundedRectPath(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Draws an error placeholder icon
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Width
     * @param {number} height - Height
     */
    static drawErrorIcon(ctx, width, height) {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${width / 4}px sans-serif`;
        ctx.fillText('ERR', width / 2, height / 2);
    }

    /**
     * Renders a simple square icon (for top bar)
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {string} iconPath - Icon path
     * @param {number} size - Icon size
     * @param {boolean} animated - Whether the icon is animated
     * @returns {Promise<void>}
     */
    static async renderSimpleIcon(canvas, iconPath, size, animated = false) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        ctx.imageSmoothingEnabled = false;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, size, size);

        try {
            const img = await IconLoader.loadIcon(iconPath, { animated });
            ctx.drawImage(img, 0, 0, size, size);
        } catch (error) {
            console.error('ProductIconRenderer: Failed to render simple icon', error);
            this.drawErrorIcon(ctx, size, size);
        }
    }

    /**
     * Updates an existing canvas with a new size
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {Object} options - Same as renderIcon options
     * @returns {Promise<void>}
     */
    static async updateIconSize(canvas, options) {
        return this.renderIcon(canvas, options);
    }

    /**
     * Preloads icons for an array of products
     * @param {Array<Object>} products - Array of product data
     * @returns {Promise<void>}
     */
    static async preloadAppIcons(products) {
        const iconPaths = new Set();

        products.forEach(product => {
            if (product.icon) iconPaths.add(product.icon);
            if (product.actualIcon) iconPaths.add(product.actualIcon);
            if (product.baseIcon) iconPaths.add(product.baseIcon);
            if (product.unopenedIcon) iconPaths.add(product.unopenedIcon);
            if (product.backgroundIcon) iconPaths.add(product.backgroundIcon);
            if (product.wrapIcon) iconPaths.add(product.wrapIcon);
        });

        await IconLoader.preloadIcons(Array.from(iconPaths));
    }

    /**
     * Checks if an icon is ready to render (cached)
     * @param {string} iconPath - Icon path to check
     * @returns {boolean} True if ready
     */
    static isIconReady(iconPath) {
        return IconLoader.isCached(iconPath);
    }
}
