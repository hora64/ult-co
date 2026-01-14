// uiElements/apps.js

// Ensure anime.js is loaded, typically via a <script> tag in your HTML.
// For example: import anime from 'animejs'; (if using a bundler)

export class AppIcon {
    static cssInjected = false;

    constructor(options = {}) {
        // Default images - use placeholders or ensure paths are correct.
        this.defaultBaseImage = options.defaultBaseImage || `https://placehold.co/96x96/333333/CCCCCC?text=App&font=roboto`;
        this.defaultOverlayImage = options.defaultOverlayImage || null;
        this.unopenedImage = options.unopenedImage || `https://placehold.co/48x48/FFA500/000000?text=Gift&font=roboto`;

        // A Map to hold options for each element, preventing data-attribute clutter and memory leaks.
        this.elementOptionsMap = new Map();

        // Default app launcher function.
        this.appLauncher = options.appLauncher || ((appOptions) => {
            console.log('Default AppLauncher: Launching app:', appOptions.label);
            const topScreenStatusEl = document.getElementById('topScreenStatus');
            if (topScreenStatusEl) topScreenStatusEl.textContent = `Launched: ${appOptions.label}`;
        });

        if (!AppIcon.cssInjected) {
            this.injectCSS();
            AppIcon.cssInjected = true;
        }
    }

    injectCSS() {
        const css = `
                      .app-container {
                          position: relative;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          /* width and height are set dynamically */
                      }
                      .app-button {
                          position: relative; border: none; padding: 0;
                          background-color: transparent;
                          border-radius: 15%; /* Default, can be overridden */
                          cursor: pointer; user-select: none;
                          transition: transform 0.1s ease-out, width 0.3s ease, height 0.3s ease;
                          outline: none;
                          z-index: 1;
                          /* The canvas is now a child of the button */
                      }
                      .app-button:active { transform: scale(0.95); }
                      .app-button canvas {
                          display: block;
                          border-radius: inherit;
                          image-rendering: pixelated; /* Good for pixel art style icons */
                      }
                      .echo-container {
                          position: absolute; width: 100%; height: 100%; top: 0; left: 0;
                          pointer-events: none; z-index: 0;
                          overflow: visible;
                      }
                      .echo-element {
                          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                          background-size: contain; background-repeat: no-repeat; background-position: center;
                          border-radius: inherit;
                          will-change: transform, opacity;
                      }
        `;
        const style = document.createElement('style');
        style.id = 'app-icon-styles';
        style.textContent = css.replace(/\s\s+/g, ' ').trim();
        document.head.appendChild(style);
    }

    /**
     * Creates a rounded rectangle path for clipping.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} x - The x-coordinate of the top-left corner.
     * @param {number} y - The y-coordinate of the top-left corner.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {number} radius - The corner radius.
     */
    _createRoundedRectPath(ctx, x, y, width, height, radius) {
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
     * Draws the icon, base, and overlay onto a canvas element.
     * This is an async function as it loads images.
     * @param {HTMLCanvasElement} canvas - The canvas to draw on.
     * @param {object} options - The app options containing icon sources and dimensions.
     */
    async drawIconOnCanvas(canvas, options) {
        const { icon, baseIcon, unopened, width = 64, height = 64, baseImage: appSpecificBaseImage } = options;
        const ctx = canvas.getContext('2d');

        // Disable image smoothing to keep images pixelated
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

        const loadImage = src => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Handles CORS for canvas if images are external
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });

        // Determine which images to load based on the app's state
        const baseSrc = baseIcon ? icon : (appSpecificBaseImage || this.defaultBaseImage);
        let overlaySrc = null;

        if (unopened) {
            // If unopened, the main icon is the gift box.
            overlaySrc = this.unopenedImage;
        } else if (!baseIcon && icon) {
            overlaySrc = icon; // Standard icon with a separate overlay image
        } else if (!baseIcon && this.defaultOverlayImage) {
            overlaySrc = this.defaultOverlayImage; // Fallback to a default overlay
        }

        // --- Step 1: Draw the base image. If it fails, draw an error and stop. ---
        try {
            const baseImg = await loadImage(baseSrc);
            ctx.drawImage(baseImg, 0, 0, width, height);
        } catch (error) {
            console.error("Failed to draw base icon on canvas:", error);
            // Draw a fallback error state on the canvas
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${width / 4}px sans-serif`;
            ctx.fillText('ERR', width / 2, height / 2);
            return; // Exit if the base can't be drawn
        }

        // --- Step 2: Draw the overlay, if it exists. If it fails, just log a warning. ---
        if (overlaySrc) {
            try {
                const overlayImg = await loadImage(overlaySrc);
                // Draw overlay smaller and centered for a distinct look
                const overlaySize = width * 0.7;
                const overlayPos = (width - overlaySize) / 2;
                // Updated: 0.10 is equivalent to 10% of the overlay's size.
                const borderRadius = overlaySize * 0.10;

                ctx.save();
                this._createRoundedRectPath(ctx, overlayPos, overlayPos, overlaySize, overlaySize, borderRadius);
                ctx.clip();
                ctx.drawImage(overlayImg, overlayPos, overlayPos, overlaySize, overlaySize);
                ctx.restore();

            } catch (error) {
                // User Request: If the app icon (overlay) is not found, just show the base image.
                console.warn(`Could not load overlay icon "${overlaySrc}". Displaying base image only.`, error.message);
            }
        }
    }

    createApp(options) {
        const { label, width = 64, height = 64, onClick } = options;

        const appContainer = document.createElement('div');
        appContainer.className = 'app-container';
        appContainer.style.width = `${width}px`;
        appContainer.style.height = `${height}px`;

        const button = document.createElement('button');
        button.className = 'app-button';
        button.title = label;
        button.style.width = `${width}px`;
        button.style.height = `${height}px`;

        const canvas = document.createElement('canvas');
        button.appendChild(canvas);

        // Store options for redraws (e.g., on size change) and cleanup
        this.elementOptionsMap.set(button, options);

        // Asynchronously draw the icon on the canvas
        this.drawIconOnCanvas(canvas, options);

        appContainer.appendChild(button);

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentOptions = this.elementOptionsMap.get(e.currentTarget) || options;
            if (typeof currentOptions.onClick === 'function') {
                currentOptions.onClick(e, currentOptions);
            } else {
                this.appLauncher(currentOptions);
            }
        });

        return appContainer;
    }

    handleUnopenedClick(event, appOptions, appGridInstance) {
        const button = event.currentTarget;
        const currentAppContainer = button.closest('.app-container');

        if (typeof anime === 'undefined') {
            console.warn("anime.js not found for unboxing animation. Replacing directly.");
            this._replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance);
            return;
        }

        // A little shake animation before revealing the app
        anime({
            targets: button,
            scale: [1, 1.05, 0.9, 1.025, 0.95, 1],
            duration: 500,
            easing: 'easeInOutExpo',
            complete: () => {
                this._replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance);
            }
        });
    }

    _replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance) {
        // The old button will be replaced, so we should clean up its options from the map
        const oldButton = currentAppContainer.querySelector('.app-button');
        if (oldButton) {
            this.elementOptionsMap.delete(oldButton);
        }

        // Create a new options object for the "unboxed" app.
        // This is a snapshot; the AppGrid will provide the final authoritative state.
        const newAppOptions = {
            ...appOptions,
            unopened: false,
            icon: appOptions.actualIcon || appOptions.icon,
        };

        const newAppVisualContainer = this.createApp(newAppOptions);

        if (currentAppContainer.parentNode) {
            currentAppContainer.parentNode.replaceChild(newAppVisualContainer, currentAppContainer);
        }

        // Notify the AppGrid that a replacement happened so it can update its state
        if (appGridInstance && typeof appGridInstance.updateAfterAppReplacement === 'function') {
            appGridInstance.updateAfterAppReplacement(newAppVisualContainer, newAppOptions);
        }
    }

    triggerOneShotEcho(appContainer) {
        if (!appContainer || typeof anime === 'undefined') return;

        const buttonElement = appContainer.querySelector('.app-button');
        const canvasElement = buttonElement ? buttonElement.querySelector('canvas') : null;
        if (!canvasElement) return;

        // Use the canvas content as the source for the echo effect
        const imageForEchoSrc = canvasElement.toDataURL();

        // Clear any previous one-shot echo to prevent visual clutter
        const existingOneShotContainer = appContainer.querySelector('.echo-container.oneshot-echo');
        if (existingOneShotContainer) {
            anime.remove(existingOneShotContainer.childNodes);
            existingOneShotContainer.remove();
        }

        const echoContainer = document.createElement('div');
        echoContainer.className = 'echo-container oneshot-echo';

        for (let i = 0; i < 2; i++) {
            const echo = document.createElement('div');
            echo.className = 'echo-element';
            echo.style.backgroundImage = `url("${imageForEchoSrc}")`;
            echo.style.opacity = '0.5';
            echoContainer.appendChild(echo);
            anime({
                targets: echo,
                scale: [1, 1.3 + i * 0.1],
                opacity: [0.5, 0],
                duration: 500 + i * 50,
                delay: i * 60,
                loop: false,
                easing: 'easeOutExpo',
                complete: () => {
                    echo.remove();
                    if (echoContainer.children.length === 0 && echoContainer.parentNode) {
                        echoContainer.remove();
                    }
                }
            });
        }

        if (appContainer.firstChild) {
            appContainer.insertBefore(echoContainer, appContainer.firstChild);
        } else {
            appContainer.appendChild(echoContainer);
        }
    }

    updateIconSize(buttonElement, newSize, animate = false) {
        const appOptions = this.elementOptionsMap.get(buttonElement);
        if (!appOptions) return;

        const appContainer = buttonElement.closest('.app-container');
        const elementsToResize = [appContainer, buttonElement].filter(Boolean);

        const updatedOptions = { ...appOptions, width: newSize, height: newSize };
        this.elementOptionsMap.set(buttonElement, updatedOptions);

        const canvas = buttonElement.querySelector('canvas');
        if (!canvas) return;

        const redraw = () => this.drawIconOnCanvas(canvas, updatedOptions);

        if (animate && typeof anime !== 'undefined') {
            anime({
                targets: elementsToResize,
                width: `${newSize}px`,
                height: `${newSize}px`,
                duration: 400,
                easing: 'cubicBezier(.2, .8, .2, 1)',
                complete: redraw
            });
        } else {
            elementsToResize.forEach(el => {
                el.style.width = `${newSize}px`;
                el.style.height = `${newSize}px`;
            });
            redraw();
        }
    }

    /**
     * Cleans up all stored options to prevent memory leaks when the grid is destroyed.
     */
    clearAllOptions() {
        this.elementOptionsMap.clear();
    }
}