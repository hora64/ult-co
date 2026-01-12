import { AppIconRenderer } from './AppIconRenderer.js';
import { getThemeAssets } from '../../../config/config.js';

export class AppIcon {
    static cssInjected = false;

    constructor(options = {}) {
        // Load theme assets from CSS variables with fallbacks
        const themeAssets = getThemeAssets();
        
        // Default images - CSS variables > constructor options > placeholders
        this.defaultBaseImage = options.defaultBaseImage || themeAssets.defaultAppIcon || `https://placehold.co/96x96/333333/CCCCCC?text=App&font=roboto`;
        this.defaultOverlayImage = options.defaultOverlayImage || null;
        this.unopenedImage = options.unopenedImage || themeAssets.unopenedIcon || `https://placehold.co/48x48/FFA500/000000?text=Gift&font=roboto`;
        this.defaultBackgroundIcon = options.defaultBackgroundIcon || themeAssets.defaultBackgroundIcon || null;
        
        // Store theme assets for reference
        this.themeAssets = themeAssets;

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
                          display: block; width: 100%; height: 100%;
                          position: relative; border: none; padding: 0;
                          background-color: transparent;
                          border-radius: 15%; /* Default, can be overridden */
                          cursor: pointer; user-select: none;
                          transition: none;
                          outline: none;
                          z-index: 1;
                          top: 0;
                          left: 0;
                          /* The canvas is now a child of the button */
                      }
                      .app-button:active { 
                          top: 2px; /* Move down 2px when pressed (moveOnPress behavior) */
                      }
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
     * Draws the icon, base, and overlay onto a canvas element using AppIconRenderer.
     * This is an async function as it loads images.
     * @param {HTMLCanvasElement} canvas - The canvas to draw on.
     * @param {object} options - The app options containing icon sources and dimensions.
     */
    async drawIconOnCanvas(canvas, options) {
        const { width = 64, height = 64, baseImage: appSpecificBaseImage, backgroundIcon, wrapIcon } = options;

        // Priority: app-specific > theme CSS variable > constructor default
        const resolvedWrapIcon = wrapIcon || this.unopenedImage;
        const resolvedBackgroundIcon = backgroundIcon || this.defaultBackgroundIcon;
        const resolvedBaseImage = appSpecificBaseImage || this.defaultBaseImage;

        await AppIconRenderer.renderIcon(canvas, {
            icon: options.icon,
            baseIcon: options.baseIcon,
            unopened: options.unopened,
            width,
            height,
            baseImage: resolvedBaseImage,
            backgroundIcon: resolvedBackgroundIcon, // Uses CSS variable fallback
            unopenedImage: resolvedWrapIcon, // Uses CSS variable fallback
            wrapIcon: resolvedWrapIcon, // Uses CSS variable fallback
            overlayScale: 0.7,
            overlayBorderRadius: 0.10
        });
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

    handleUnopenedClick(event, appOptions, appGridInstance, languageData, onUnwrapComplete) {
        console.log('[AppIcon] handleUnopenedClick called with event:', event);
        console.log('[AppIcon] event.currentTarget:', event?.currentTarget);
        console.log('[AppIcon] appOptions:', appOptions);
        
        // Get the button element - handle both direct clicks and programmatic triggers
        let button = event?.currentTarget;
        let currentAppContainer = null;
        
        // If button is not a DOM element or doesn't have closest method
        if (!button || typeof button.closest !== 'function') {
            console.log('[AppIcon] Button not a DOM element, searching for app container by ID');
            // Find the app container by app ID in the grid
            if (appGridInstance && appGridInstance.container && appOptions.id) {
                const iconWrapper = appGridInstance.container.querySelector(`.app-icon[data-app-id="${appOptions.id}"]`);
                if (iconWrapper) {
                    currentAppContainer = iconWrapper.closest('.app-icon-container') || iconWrapper.closest('.app-container');
                    button = currentAppContainer?.querySelector('.app-button');
                    console.log('[AppIcon] Found container and button:', currentAppContainer, button);
                }
            }
        } else {
            currentAppContainer = button.closest('.app-container') || button.closest('.app-icon-container');
        }
        
        if (!currentAppContainer || !button) {
            console.error('[AppIcon] Could not find app container or button for unopened app');
            return;
        }

        if (typeof anime === 'undefined') {
            console.warn("anime.js not found for unboxing animation. Replacing directly.");
            this._replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance, onUnwrapComplete);
            return;
        }

        // A little shake animation before revealing the app - snappy version
        anime({
            targets: button,
            scale: [1, 1.05, 0.9, 1.025, 0.95, 1],
            duration: 200,
            easing: 'linear',
            complete: () => {
                this._replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance, onUnwrapComplete);
            }
        });
    }

    _replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance, onUnwrapComplete) {
        // The old button will be replaced, so we should clean up its options from the map
        const oldButton = currentAppContainer.querySelector('.app-button');
        if (oldButton) {
            this.elementOptionsMap.delete(oldButton);
        }

        // CRITICAL FIX: Handle baseIcon apps differently
        // When baseIcon: true, the icon IS the complete image, no overlay needed
        let actualIcon;
        let newBaseIcon;
        
        // When unwrapping, we MUST use actualIcon - never fall back to icon as it contains the gift box
        if (!appOptions.actualIcon) {
            console.error('[AppIcon] Cannot unwrap app - actualIcon is not defined!', appOptions);
            // Attempt recovery by using icon if it's not a placeholder URL
            actualIcon = appOptions.icon?.includes('placehold.co') ? null : appOptions.icon;
            if (!actualIcon) {
                console.error('[AppIcon] No valid icon found for unwrapping');
                return;
            }
        } else {
            actualIcon = appOptions.actualIcon;
        }
        
        if (appOptions.baseIcon === true) {
            // For baseIcon apps, the icon is the complete standalone image
            // Keep baseIcon: true and use actualIcon as the base
            newBaseIcon = true;
        } else {
            // For normal apps with base+overlay, use actualIcon as the overlay
            newBaseIcon = false;
        }
        
        // Resolve relative icon path to absolute if needed
        if (actualIcon && !actualIcon.startsWith('/') && !actualIcon.startsWith('http')) {
            actualIcon = `/content/apps/${appOptions.id}/${actualIcon}`;
            console.log('[AppIcon] Resolved relative icon path to:', actualIcon);
        }

        // Create a new options object for the "unboxed" app
        const newAppOptions = {
            ...appOptions,
            unopened: false,
            baseIcon: newBaseIcon, // Preserve baseIcon flag
            icon: actualIcon,
            actualIcon: actualIcon
        };
        
        console.log('[AppIcon] Creating unwrapped app with baseIcon:', newBaseIcon, 'icon:', actualIcon);

        const newAppVisualContainer = this.createApp(newAppOptions);

        if (currentAppContainer.parentNode) {
            currentAppContainer.parentNode.replaceChild(newAppVisualContainer, currentAppContainer);
            console.log('[AppIcon] Replaced unopened container with actual app container');
        }

        // Notify the AppGrid that a replacement happened so it can update its state and reload banner
        if (appGridInstance && typeof appGridInstance.updateAfterAppReplacement === 'function') {
            console.log('[AppIcon] Calling updateAfterAppReplacement on AppGrid');
            appGridInstance.updateAfterAppReplacement(newAppVisualContainer, newAppOptions, onUnwrapComplete);
        } else {
            // Call the onUnwrapComplete callback if provided and AppGrid didn't handle it
            if (typeof onUnwrapComplete === 'function') {
                console.log('[AppIcon] Calling onUnwrapComplete directly');
                onUnwrapComplete(appOptions);
            }
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
                duration: 200 + i * 25,
                delay: i * 30,
                loop: false,
                easing: 'linear',
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
                duration: 150,
                easing: 'linear',
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