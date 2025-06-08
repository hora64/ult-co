// uiElements/apps.js

// Ensure anime.js is loaded, typically via a <script> tag in HTML or another import.
// For example: import anime from 'animejs'; (if using a bundler and installed via npm)
// Or rely on window.anime if loaded globally.

export class AppIcon {
    static cssInjected = false;

    constructor(options = {}) {
        // Default images - use placeholders or ensure paths are correct
        this.defaultBaseImage = options.defaultBaseImage || `https://placehold.co/96x96/333333/CCCCCC?text=App&font=roboto`;
        this.defaultOverlayImage = options.defaultOverlayImage || null;
        this.unopenedImage = options.unopenedImage || `https://placehold.co/48x48/FFA500/000000?text=Gift&font=roboto`;

        this.appLauncher = options.appLauncher || ((appOptionsFromGrid) => {
            // appOptionsFromGrid now includes the original appData from AppGrid's appData array
            console.log('Default AppLauncher: Launching app:', appOptionsFromGrid.label);
            const topScreenStatusEl = document.getElementById('topScreenStatus');
            if (topScreenStatusEl) topScreenStatusEl.textContent = `Launched: ${appOptionsFromGrid.label}`;
        });

        if (!AppIcon.cssInjected) {
            this.injectCSS();
            AppIcon.cssInjected = true;
        }
    }

    injectCSS() {
        const css = `
            .app-container { /* This is the element returned by createApp, sized by AppGrid's updateIconSize */
                position: relative; /* For echo and overlay positioning */
                display: flex; /* Center the button if container is larger (it shouldn't be) */
                justify-content: center;
                align-items: center;
                /* width and height are set dynamically by updateIconSize */
            }
            .app-button {
                position: relative; border: none; padding: 0;
                background-color: transparent; /* Base image is applied via --base-image */
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain; /* Ensure this is 'contain' or 'cover' as needed */
                /* --base-image is set in createApp */
                border-radius: 15%; /* Default, can be overridden by AppGrid size classes */
                cursor: pointer; overflow: hidden; user-select: none;
                transition: transform 0.1s ease-out, width 0.3s ease, height 0.3s ease;
                outline: none;
                z-index: 1; 
                /* width and height are set dynamically by createApp/updateIconSize */
            }
            .app-button:active { transform: scale(0.95); }

            .app-button .overlay { /* Overlay is a child of the button */
                position: absolute; top: 15%; left: 15%; width: 70%; height: 70%;
                background-size: contain; background-repeat: no-repeat; background-position: center;
                border-radius: 10%;
                pointer-events: none; image-rendering: pixelated; user-select: none;
                z-index: 2; /* Above button's direct background, below potential future elements */
            }
            
            /* Style for unopened app's overlay (gift image) */
            .app-button.unopened .overlay {
                background-image: url("${this.unopenedImage}");
            }

            .echo-container { /* This container is still created but might not have animated children */
                position: absolute; width: 100%; height: 100%; top: 0; left: 0;
                pointer-events: none; z-index: 0; /* Behind button */
                overflow: visible; 
            }
            .echo-element { /* This class is for echo elements, styling remains in case used by one-shot echo */
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

    createApp(options) {
        const {
            icon, label, width = 64, height = 64, onClick, 
            unopened, actualIcon, baseIcon, baseImage: appSpecificBaseImage
        } = options;

        const appContainer = document.createElement('div');
        appContainer.className = 'app-container';
        appContainer.style.width = `${width}px`;
        appContainer.style.height = `${height}px`;

        const button = document.createElement('button');
        button.className = 'app-button';
        button.title = label; 
        button.style.width = `${width}px`;
        button.style.height = `${height}px`;
        
        let buttonBgToUse = this.defaultBaseImage; 
        if (baseIcon && icon) { 
            buttonBgToUse = icon;
        } else if (appSpecificBaseImage) { 
            buttonBgToUse = appSpecificBaseImage;
        }
        button.style.backgroundImage = `url("${buttonBgToUse}")`;

        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        if (!baseIcon && icon && !unopened) {
            overlay.style.backgroundImage = `url("${icon}")`;
        } else if (!baseIcon && this.defaultOverlayImage && !unopened) {
            overlay.style.backgroundImage = `url("${this.defaultOverlayImage}")`;
        }

        button.appendChild(overlay); 
        appContainer.appendChild(button);

        if (unopened) {
            button.classList.add('unopened');
            // Call to setupEchoEffect is removed to prevent pulsating echo
            // this.setupEchoEffect(appContainer, button); 
        }

        button.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (typeof onClick === 'function') {
                onClick(e, options); 
            } else {
                this.appLauncher(options); 
            }
        });

        return appContainer; 
    }

    handleUnopenedClick(event, appOptions, appGridInstance) {
        const button = event.currentTarget;
        const currentAppContainer = button.closest('.app-container'); 


        // Pulsating echo was removed by not calling setupEchoEffect,
        // so no need to remove its elements here.
        // const oldEchoContainer = currentAppContainer.querySelector('.echo-container');
        // if (oldEchoContainer) {
        //     anime.remove(oldEchoContainer.childNodes); 
        //     oldEchoContainer.remove(); 
        // }

        if (typeof anime === 'undefined') {
            console.warn("anime.js not found for unopening animation. Replacing directly.");
            this._replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance);
            return;
        }
        


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
        const newAppOptions = {
            ...appOptions, 
            unopened: false,
            icon: appOptions.actualIcon || appOptions.icon, 
        };

        const newAppVisualContainer = this.createApp(newAppOptions);

        if (currentAppContainer.parentNode) {
            currentAppContainer.parentNode.replaceChild(newAppVisualContainer, currentAppContainer);
        }

        if (appGridInstance && typeof appGridInstance.updateAfterAppReplacement === 'function') {
            appGridInstance.updateAfterAppReplacement(newAppVisualContainer, newAppOptions);
        }
    }

    // This method is no longer called for the continuous pulsating echo on unopened apps.
    // It's kept in case a different type of one-time echo might be desired later,
    // or for the oneShotEcho to potentially use its structure.
    setupEchoEffect(appContainer, button) { 
        // The continuous pulsating echo logic has been removed from here.
        // If you want to re-enable it, the anime call for looping echoes would go here.
        // For now, this method does nothing for the unopened app's continuous echo.
        
        // Example of what was removed:
        /*
        if (typeof anime === 'undefined') { return; }
        let imageToEchoUrl = this.unopenedImage; // Simplified for example

        const echoContainer = document.createElement('div');
        echoContainer.className = 'echo-container';
        // ... sizing and styling for echoContainer ...

        for (let i = 0; i < 2; i++) { 
            const echo = document.createElement('div');
            // ... styling for echo element ...
            echoContainer.appendChild(echo);
            anime({
                targets: echo,
                scale: [0.8, 1.25], 
                opacity: [0.6, 0],
                duration: 1800,
                delay: i * 400,
                loop: true, // This made it pulsate
                easing: 'cubicBezier(0.250, 0.460, 0.450, 0.940)' 
            });
        }
        // ... append echoContainer ...
        */
    }

    // One-shot echo for regular app clicks (called by AppGrid)
    // This remains as it's a different effect.
    triggerOneShotEcho(appContainer, effectOptions = {}) {
        if (!appContainer || typeof anime === 'undefined') return;
        
        const buttonElement = appContainer.querySelector('.app-button');
        if (!buttonElement) return;

        let imageForEchoSrc;
        const buttonStyle = window.getComputedStyle(buttonElement);
        const bgImageProperty = buttonStyle.backgroundImage;

        if (bgImageProperty && bgImageProperty !== 'none') {
            const match = bgImageProperty.match(/url\("?([^"]*)"?\)/);
            if (match && match[1] && match[1] !== 'none') {
                imageForEchoSrc = match[1];
            }
        }
        if (!imageForEchoSrc) imageForEchoSrc = this.defaultBaseImage; 

        if (!imageForEchoSrc || imageForEchoSrc === 'none') {
            console.warn("OneShotEcho: No valid image for echo.");
            return;
        }
        
        const existingOneShotContainer = appContainer.querySelector('.echo-container.oneshot-echo');
        if (existingOneShotContainer) { 
            anime.remove(existingOneShotContainer.childNodes); 
            existingOneShotContainer.remove(); 
        }

        const echoContainer = document.createElement('div');
        echoContainer.className = 'echo-container oneshot-echo';
        echoContainer.style.width = buttonElement.style.width;
        echoContainer.style.height = buttonElement.style.height;
        echoContainer.style.borderRadius = buttonStyle.borderRadius;

        const numEchos = effectOptions.echos || 2;
        const duration = effectOptions.duration || 500; 
        const maxScale = effectOptions.scale || 1.3;
        const staggerDelay = effectOptions.delay || 60;
        const initialOpacity = effectOptions.opacity || 0.4;
        const easing = effectOptions.easing || 'easeOutExpo';

        for (let i = 0; i < numEchos; i++) {
            const echo = document.createElement('div');
            echo.className = 'echo-element';
            echo.style.backgroundImage = `url("${imageForEchoSrc}")`;
            echo.style.opacity = String(initialOpacity);
            echo.style.borderRadius = 'inherit';
            echoContainer.appendChild(echo);
            anime({
                targets: echo, 
                scale: [1, maxScale + i * 0.05], 
                opacity: [initialOpacity, 0],
                duration: duration + i * (staggerDelay / 4), 
                delay: i * staggerDelay, 
                loop: false, 
                easing: easing,
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
        const targetSizePx = `${newSize}px`;
        const appContainer = buttonElement.closest('.app-container');

        const elementsToResize = [];
        if (appContainer) elementsToResize.push(appContainer);
        elementsToResize.push(buttonElement);

        // If echo containers are present (e.g., from oneShotEcho), resize them too.
        const echoContainers = appContainer ? appContainer.querySelectorAll('.echo-container') : [];
        echoContainers.forEach(ec => elementsToResize.push(ec));


        if (animate && typeof anime !== 'undefined') {
            anime({
                targets: elementsToResize,
                width: targetSizePx,
                height: targetSizePx,
                duration: 250, 
                easing: 'easeOutQuad'
            });
        } else {
            elementsToResize.forEach(el => {
                el.style.width = targetSizePx;
                el.style.height = targetSizePx;
            });
        }
    }
}
