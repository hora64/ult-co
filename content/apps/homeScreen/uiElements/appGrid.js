// uiElements/appGrid.js
// import { AppIcon } from './apps.js'; // Assuming AppIcon is imported where AppGrid is used or passed in constructor

export class AppGrid {
    /**
     * Creates an instance of AppGrid.
     * @param {HTMLElement} container - The grid container element.
     * @param {Array<Object>} appData - Array of application data objects.
     * @param {Object} iconSystem - An instance of the class that creates app icons.
     * @param {HTMLElement} topScreenElement - The element for displaying banners.
     * @param {Object} [assetUrls={}] - An object to override default asset URLs.
     * @param {string} [assetUrls.scrollBarMiddle] - URL for the scrollbar middle texture.
     * @param {string} [assetUrls.scrollBarSide] - URL for the scrollbar side caps.
     * @param {string} [assetUrls.selectionGlow] - URL for the selected icon glow effect.
     * @param {string} [assetUrls.sizeIncrease] - URL for the increase size button image.
     * @param {string} [assetUrls.sizeDecrease] - URL for the decrease size button image.
     * @param {string} [assetUrls.topBar] - URL for the top bar background image.
     * @param {string} [assetUrls.soundClick] - URL for the click sound effect.
     * @param {string} [assetUrls.soundSelect] - URL for the select sound effect.
     * @param {string} [assetUrls.soundLaunch] - URL for the launch sound effect.
     * @param {string} [assetUrls.soundSizeUp] - URL for the size up sound effect.
     * @param {string} [assetUrls.soundSizeDown] - URL for the size down sound effect.
     * @param {string} [assetUrls.soundGrab] - URL for the grab sound effect.
     * @param {string} [assetUrls.soundOpenBox] - URL for the box opening sound effect.
     * @param {number} [volume=0.5] - The initial volume for sound effects (0.0 to 1.0).
     */
    constructor(container, appData = [], iconSystem, topScreenElement, assetUrls = {}, volume = 0.5) {
        this.container = container; // The .app-grid element
        this.bottomScreenContainer = container.parentElement; // The .bottom-screen element
        this.appData = appData; // This is an array of app data objects
        this.iconSystem = iconSystem; // Instance of AppIcon
        this.topScreenElement = topScreenElement; // The element where banners will be displayed
        this.currentBannerAPI = null; // To hold the API of the current banner for cleanup
        this.volume = Math.max(0, Math.min(1, volume)); // Set initial volume, clamped between 0 and 1.

        // Define default URLs and merge with any provided overrides
        const defaultAssetUrls = this._createDefaultAssetUrls();
        this.assetUrls = { ...defaultAssetUrls, ...assetUrls };

        this.sizeClasses = ['xs-icons', 'small-icons', 'medium-icons', 'large-icons', 'xl-icons'];
        this.currentSizeIndex = 2; // Default to 'medium-icons'

        this.scrollPosition = 0; // Percentage (scrollLeft / scrollWidth)
        this.selectedAppId = null;
        this.lastSelectedAppIdForAction = null; // Tracks if the same app is clicked twice to trigger action

        this.scrollBar = null;
        this.scrollThumb = null;
        this.scrollTrack = null;
        this.controlsContainer = null;
        this.resizeObserver = null;
        this.containerRect = null;

        this.isDraggingThumb = false; // For scrollbar thumb dragging
        this.dragStartX = 0;
        this.dragStartScrollLeftPercent = 0;
        
        this.isDraggingText = false;
        this.textDragStartX = 0;
        this.textStartScrollLeft = 0;

        // Properties for info text auto-scrolling
        this.infoScrollTimeout = null;
        this.infoScrollerAnimator = null;

        this.sizeConfigurations = this.createSizeConfigurations();
        this.layoutPresets = {};
        this.currentLayout = 'default';

        this.topScreenStatusEl = document.getElementById('topScreenStatus');

        if (!this.container) {
            console.error("AppGrid: Container element not provided.");
            return;
        }
        if (!this.iconSystem) {
            console.error("AppGrid: IconSystem (AppIcon instance) not provided.");
            return;
        }

        this.appData.forEach((app, index) => {
            if (!app.id) {
                app.id = app.label || `app-grid-item-${Date.now()}-${index}`;
            }
        });

        this.injectStyles();
        this.injectAudioElements();
        this.updateContainerRect();
        this.setupEventListeners();
    }
    
    _createDefaultAssetUrls() {
        return {
            scrollBarMiddle: 'assets/blackTheme/HorizontalScrollBar_Middle.png',
            scrollBarSide: 'assets/blackTheme/HorizontalScrollBar_Side.png',
            selectionGlow: 'assets/blackTheme/Select_128px.png',
            sizeIncrease: 'assets/blackTheme/PlusSpriteButton_64px.png',
            sizeDecrease: 'assets/blackTheme/MinusSpriteButton_64px.png',
            topBar: 'assets/blackTheme/TopBar.png',
            soundClick: 'assets/blackTheme/sfx/select6.ogg',
            soundSelect: 'assets/blackTheme/sfx/select5.ogg',
            soundLaunch: 'assets/blackTheme/sfx/select3.ogg',
            soundSizeUp: 'assets/blackTheme/sfx/select2.ogg',
            soundSizeDown: 'assets/blackTheme/sfx/select.ogg',
            soundGrab: "assets/blackTheme/sfx/select.ogg",
            soundOpenBox: "assets/blackTheme/sfx/open.ogg"
        };
    }

    injectAudioElements() {
        const soundKeys = ['soundClick', 'soundSelect', 'soundLaunch', 'soundSizeUp', 'soundSizeDown', 'soundGrab', 'soundOpenBox'];
        const audioContainer = document.createDocumentFragment();

        soundKeys.forEach(key => {
            const soundName = key.replace('sound', '').toLowerCase(); // e.g., 'click'
            const audioElId = `appgrid-audio-${soundName}`;
            
            if (document.getElementById(audioElId)) return; // Don't add duplicates

            const audioEl = document.createElement('audio');
            audioEl.id = audioElId;
            audioEl.src = this.assetUrls[key];
            audioEl.preload = 'auto';
            audioEl.volume = this.volume;
            audioContainer.appendChild(audioEl);
        });

        document.body.appendChild(audioContainer);
    }

    createSizeConfigurations() {
        return {
            'xs-icons': { iconSize: 32, containerSize: 32, spacing: 6, edgeMargin: 8, maxRows: 4, radius: '10%' },
            'small-icons': { iconSize: 48, containerSize: 48, spacing: 8, edgeMargin: 10, maxRows: 3, radius: '12%' },
            'medium-icons': { iconSize: 64, containerSize: 64, spacing: 10, edgeMargin: 12, maxRows: 2, radius: '15%' },
            'large-icons': { iconSize: 80, containerSize: 80, spacing: 12, edgeMargin: 14, maxRows: 1, radius: '18%' },
            'xl-icons': { iconSize: 96, containerSize: 96, spacing: 16, edgeMargin: 16, maxRows: 1, radius: '20%' }
        };
    }

    createLayoutPresets() {
        const appCount = this.appData ? this.appData.length : 10;
        return {
            'default': { structure: [{ type: 'app', count: appCount }] }
        };
    }

    injectStyles() {
        const styleId = 'app-grid-styles';
        // Remove existing style tag to re-inject with potentially new asset URLs
        document.getElementById(styleId)?.remove();
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.getStyleContent().replace(/\s\s+/g, ' ').trim();
        document.head.appendChild(style);
    }

    getStyleContent() {
        return `
.app-grid {
    display: grid;
    gap: var(--grid-spacing, 12px);
    width: 100%;
    height: 100%;
    padding: var(--grid-padding-vertical, 0px) var(--edge-margin, 12px);
    margin: 0px;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    transition: all 0.2s ease-out;
    justify-items: start;
    align-items: center;
    align-content: center;
    justify-content: start;
    grid-auto-flow: column;
    grid-auto-columns: var(--container-size, 64px);
    grid-template-rows: repeat(var(--grid-rows, 2), var(--container-size, 64px));
    min-width: 0;
    min-height: 0;
    scroll-behavior: smooth;
    outline: none; /* Hide focus outline */
}
.app-grid > .app-icon:nth-child(2n + 1) {
    margin-left: var(--grid-spacing, 10px);
}
.app-grid::-webkit-scrollbar { display: none; }
.app-grid::after {
    content: '';
    width: calc(var(--edge-margin, 12px) / 2);
    height: 1px;
    flex-shrink: 0;
}
.app-icon-container {
    position: relative;
    width: var(--container-size, 64px);
    height: var(--container-size, 64px);
    min-width: var(--container-size, 64px);
    min-height: var(--container-size, 64px);
    display: flex; justify-content: center; align-items: center;
    overflow: visible;
    box-sizing: border-box;
}
.app-icon {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
    width: var(--icon-size, 64px);
    height: var(--icon-size, 64px);
    box-sizing: border-box;
    transition: transform 0.2s ease-out, width 0.3s ease, height 0.3s ease;
    user-select: none;
    border-radius: var(--icon-border-radius, 15%);
}
.selection-glow {
    position: absolute; width: 100%; height: 100%; top: 0; left: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background-image: none;
    transform: scale(1.1);
    transition: opacity 0.2s ease-out, background-color 0.2s ease-out, transform 0.2s ease-out;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
}
.appgrid-scrollbar-container {
    position: absolute;
    bottom: 0;
    left: var(--edge-margin, 12px);
    right: var(--edge-margin, 12px);
    height: 8px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    z-index: 10;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-out;
    pointer-events: auto;
}
.appgrid-scrollbar-track {
    position: absolute;
    top:0; left:0; right:0; bottom:0;
    border-radius:4px;
}

/* Custom Scrollbar Thumb Styling */
.appgrid-scrollbar-thumb {
    position: relative; /* Crucial for positioning ::before and ::after */
    height: 100%;
    min-width: 60px; /* Ensures the thumb is at least 60px wide */
    box-sizing: border-box; /* Explicitly set box-sizing */
    padding-left: 8px;  /* Width of the left end cap image */
    padding-right: 8px; /* Width of the right end cap image */
    background-image: url('${this.assetUrls.scrollBarMiddle}');
    background-size: auto 100%;
    background-repeat: repeat-x;
    background-position: center;
    background-origin: content-box;
    background-clip: content-box;
    cursor: grab;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    overflow: hidden;
}

/* Pseudo-element for the left end cap */
.appgrid-scrollbar-thumb::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0; /* Position at the very left of the thumb */
    width: 8px; /* Visual width of the left end cap */
    height: 100%;
    background-image: url('${this.assetUrls.scrollBarSide}');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 1;
}

/* Pseudo-element for the right end cap */
.appgrid-scrollbar-thumb::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0; /* Position at the very right of the thumb */
    width: 8px; /* Visual width of the right end cap */
    height: 100%;
    background-image: url('${this.assetUrls.scrollBarSide}');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 1;
    transform: scaleX(-1); /* Flips the right end cap horizontally */
}

.appgrid-scrollbar-thumb:hover {
    filter: brightness(1.05);
}
.appgrid-scrollbar-container.dragging .appgrid-scrollbar-thumb,
.appgrid-scrollbar-thumb:active {
    filter: brightness(1.1);
    cursor: grabbing;
}

/* Controls for icon size */
.appgrid-size-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 2px 8px;
    box-sizing: border-box;
    background-image: url('${this.assetUrls.topBar}');
    position: absolute;
    top: 0;
    left: 0;
    z-index: 12; /* Above the grid, below potential popups */
    gap: 8px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

.appgrid-info-scroller {
    flex-grow: 1;
    overflow: hidden; /* Changed from scroll to hidden; JS will handle scrolling */
    white-space: nowrap;
    color: white;
    font-size: 14px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    cursor: grab;
    scrollbar-width: none; /* For Firefox */
    -ms-overflow-style: none; /* For Internet Explorer and Edge */
}
.appgrid-info-scroller::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Opera */
}

.appgrid-info-scroller.dragging {
    cursor: grabbing;
    user-select: none;
}

.appgrid-info-scroller p {
    display: inline-block;
    margin: 0;
    padding-right: 20px; /* Add some padding to the end */
}

.appgrid-info-scroller.scrolling-fade {
    -webkit-mask-image: linear-gradient(to right, transparent, black 4px, black calc(100% - 4px), transparent);
    mask-image: linear-gradient(to right, transparent, black 4px, black calc(100% - 4px), transparent);
}

.appgrid-size-btn-group {
    display: flex;
    gap: 8px;
}

.appgrid-size-btn {
    width: 24px;
    height: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: transparent;
    border: none;
    padding: 0;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    color: transparent; /* Hide text for image buttons */
}
.appgrid-size-btn#decreaseSizeBtn {
    background-image: url('${this.assetUrls.sizeDecrease}');
}
.appgrid-size-btn#increaseSizeBtn {
    background-image: url('${this.assetUrls.sizeIncrease}');
}
.appgrid-size-btn:active {
    transform: scale(0.95);
    filter: invert(1);
}


@media (max-width: 480px) {
    .app-grid {
        padding-top: calc(var(--edge-margin, 12px) * 0.5);
        padding-bottom: calc(var(--edge-margin, 12px) * 0.5 + 8px);
        gap: calc(var(--grid-spacing, 10px) * 0.8);
    }
    .appgrid-scrollbar-container {
        height: 16px;
        bottom: 1px;
        left: calc(var(--edge-margin, 12px) * 0.8);
        right: calc(var(--edge-margin, 12px) * 0.8);
    }
    .appgrid-scrollbar-thumb {
        min-width: 50px;
    }
}
`;
    }

    createControls() {
        if (!this.bottomScreenContainer) return;
        
        // Remove existing controls if they exist to prevent duplication
        this.bottomScreenContainer.querySelector('.appgrid-size-controls')?.remove();

        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'appgrid-size-controls';

        // Info Scroller
        const infoScroller = document.createElement('div');
        infoScroller.className = 'appgrid-info-scroller';
        const infoText = document.createElement('p');
        infoScroller.appendChild(infoText);
        this.controlsContainer.appendChild(infoScroller);
        
        infoScroller.addEventListener('mousedown', this.handleTextMouseDown.bind(this));
        infoScroller.addEventListener('touchstart', this.handleTextMouseDown.bind(this), { passive: true });


        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'appgrid-size-btn-group';

        const decreaseBtn = document.createElement('button');
        decreaseBtn.id = 'decreaseSizeBtn';
        decreaseBtn.className = 'appgrid-size-btn';
        decreaseBtn.setAttribute('aria-label', 'Decrease Size');
        decreaseBtn.addEventListener('click', () => {
            this.decreaseIconSize();
        });

        const increaseBtn = document.createElement('button');
        increaseBtn.id = 'increaseSizeBtn';
        increaseBtn.className = 'appgrid-size-btn';
        increaseBtn.setAttribute('aria-label', 'Increase Size');
        increaseBtn.addEventListener('click', () => {
            this.increaseIconSize();
        });

        buttonGroup.appendChild(decreaseBtn);
        buttonGroup.appendChild(increaseBtn);
        this.controlsContainer.appendChild(buttonGroup);

        // Prepend to ensure it's at the top of the bottom screen content
        this.bottomScreenContainer.prepend(this.controlsContainer);
    }

    handleTextMouseDown(event) {
        const scroller = event.currentTarget;
        this.isDraggingText = true;
        this.textDragStartX = (event.touches ? event.touches[0].clientX : event.clientX) - scroller.offsetLeft;
        this.textStartScrollLeft = scroller.scrollLeft;
        scroller.classList.add('dragging');
        
        // If there's an animation, cancel it to allow manual dragging
        if (this.infoScrollTimeout) clearTimeout(this.infoScrollTimeout);
        if (this.infoScrollerAnimator) {
            this.infoScrollerAnimator.cancel();
            this.infoScrollerAnimator = null;
        }

        document.addEventListener('mousemove', this.handleTextMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleTextMouseUp.bind(this));
        document.addEventListener('touchmove', this.handleTextMouseMove.bind(this));
        document.addEventListener('touchend', this.handleTextMouseUp.bind(this));
    }
    
    handleTextMouseMove(event) {
        if (!this.isDraggingText) return;
        event.preventDefault();
        const scroller = this.controlsContainer.querySelector('.appgrid-info-scroller');
        const x = (event.touches ? event.touches[0].clientX : event.clientX) - scroller.offsetLeft;
        const walk = (x - this.textDragStartX);
        scroller.scrollLeft = this.textStartScrollLeft - walk;
    }

    handleTextMouseUp() {
        if (!this.isDraggingText) return;
        this.isDraggingText = false;
        const scroller = this.controlsContainer.querySelector('.appgrid-info-scroller');
        scroller.classList.remove('dragging');
        document.removeEventListener('mousemove', this.handleTextMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleTextMouseUp.bind(this));
        document.removeEventListener('touchmove', this.handleTextMouseMove.bind(this));
        document.removeEventListener('touchend', this.handleTextMouseUp.bind(this));
    }


    setupEventListeners() {
        this.handleResize = this.handleResize.bind(this);
        this.updateScrollPositionFromEvent = this.updateScrollPositionFromEvent.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this); // Bind keydown handler

        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this.container);
        if (this.container.parentElement) {
            this.resizeObserver.observe(this.container.parentElement);
        }
        this.container.addEventListener('scroll', this.updateScrollPositionFromEvent, {
            passive: true
        });
        this.container.addEventListener('keydown', this._handleKeyDown);
    }

    cleanupEventListeners() {
        this.resizeObserver?.disconnect();
        this.container?.removeEventListener('scroll', this.updateScrollPositionFromEvent);
        this.container?.removeEventListener('keydown', this._handleKeyDown);

        if (this.scrollThumb) this.scrollThumb.removeEventListener('mousedown', this.handleThumbMouseDown);
        if (this.scrollTrack && this.trackClickListener) {
            this.scrollTrack.removeEventListener('click', this.trackClickListener);
        }
        document.removeEventListener('mousemove', this.handleThumbMouseMove);
        document.removeEventListener('mouseup', this.handleThumbMouseUp);
        
        if (this.controlsContainer) {
            const infoScroller = this.controlsContainer.querySelector('.appgrid-info-scroller');
            if (infoScroller) {
                 infoScroller.removeEventListener('mousedown', this.handleTextMouseDown.bind(this));
                 infoScroller.removeEventListener('touchstart', this.handleTextMouseDown.bind(this));
            }
        }
        document.removeEventListener('mousemove', this.handleTextMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleTextMouseUp.bind(this));
        document.removeEventListener('touchmove', this.handleTextMouseMove.bind(this));
        document.removeEventListener('touchend', this.handleTextMouseUp.bind(this));
    }

    handleResize() {
        this.updateContainerRect();
        this.updateResponsiveLayout();
        // Re-check the info scroller fade and animation on resize
        if (this.controlsContainer) {
            const infoScroller = this.controlsContainer.querySelector('.appgrid-info-scroller');
            const infoTextElement = infoScroller?.querySelector('p');
            if (infoScroller && infoTextElement && infoTextElement.textContent) {
                this.resetAndAnimateInfoText(infoScroller, infoTextElement);
            }
        }
    }

    updateContainerRect() {
        if (this.container) {
            this.containerRect = this.container.getBoundingClientRect();
        }
    }

    createScrollBar() {
        if (!this.bottomScreenContainer) return null;

        const sbContainer = document.createElement('div');
        sbContainer.className = 'appgrid-scrollbar-container';
        sbContainer.setAttribute('role', 'scrollbar');
        sbContainer.setAttribute('aria-orientation', 'horizontal');

        const track = document.createElement('div');
        track.className = 'appgrid-scrollbar-track';

        const thumb = document.createElement('div');
        thumb.className = 'appgrid-scrollbar-thumb';
        thumb.setAttribute('aria-valuemin', '0');
        thumb.setAttribute('aria-valuemax', '100');

        track.appendChild(thumb);
        sbContainer.appendChild(track);
        this.scrollBar = sbContainer;
        this.scrollThumb = thumb;
        this.scrollTrack = track;

        this.handleThumbMouseDown = this.handleThumbMouseDown.bind(this);
        this.handleThumbMouseMove = this.handleThumbMouseMove.bind(this);
        this.handleThumbMouseUp = this.handleThumbMouseUp.bind(this);

        this.scrollThumb.addEventListener('mousedown', this.handleThumbMouseDown);

        this.trackClickListener = (e) => {
            if (e.target !== this.scrollTrack) return;
            const rect = this.scrollTrack.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const thumbWidth = this.scrollThumb.offsetWidth;
            const targetThumbLeft = Math.max(0, Math.min(clickX - thumbWidth / 2, rect.width - thumbWidth));
            const draggableTrackWidth = rect.width - thumbWidth;
            let percentage = 0;
            if (draggableTrackWidth > 0) {
                percentage = (targetThumbLeft / draggableTrackWidth) * 100;
            }

            if (isFinite(percentage)) {
                this.setScrollPositionPercent(percentage);
            }
        };

        this.scrollTrack.addEventListener('click', this.trackClickListener);

        this.bottomScreenContainer.appendChild(sbContainer);


        return sbContainer;
    }

    handleThumbMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.isDraggingThumb = true;
        this.dragStartX = event.clientX;
        this.dragStartScrollLeftPercent = this.scrollPosition;
        this.scrollBar?.classList.add('dragging');
        document.addEventListener('mousemove', this.handleThumbMouseMove);
        document.addEventListener('mouseup', this.handleThumbMouseUp);
        this.playSound('grab');
    }

    handleThumbMouseMove(event) {
        if (!this.isDraggingThumb || !this.scrollTrack || !this.container) return;

        const trackRect = this.scrollTrack.getBoundingClientRect();
        const trackWidth = trackRect.width;
        if (trackWidth === 0) return;

        const deltaX = event.clientX - this.dragStartX;
        const thumbWidth = this.scrollThumb.offsetWidth;
        const draggableTrackWidth = trackWidth - thumbWidth;
        if (draggableTrackWidth <= 0) return;

        const deltaPercent = (deltaX / draggableTrackWidth) * 100;
        let newScrollPercent = this.dragStartScrollLeftPercent + deltaPercent;
        newScrollPercent = Math.max(0, Math.min(100, newScrollPercent));

        this.setScrollPositionPercent(newScrollPercent);
    }

    handleThumbMouseUp() {
        if (!this.isDraggingThumb) return;
        this.isDraggingThumb = false;
        this.scrollBar?.classList.remove('dragging');
        document.removeEventListener('mousemove', this.handleThumbMouseMove);
        document.removeEventListener('mouseup', this.handleThumbMouseUp);
    }

    updateScrollPositionFromEvent() {
        if (!this.container || !this.scrollBar) return;

        const scrollableWidth = this.container.scrollWidth - this.container.clientWidth;
        if (scrollableWidth > 0) {
            this.scrollPosition = (this.container.scrollLeft / scrollableWidth) * 100;
            this.scrollBar.style.opacity = '1';
        } else {
            this.scrollPosition = 0;
            this.scrollBar.style.opacity = '0';
        }
        if (this.scrollThumb && this.scrollTrack) {
            this.updateScrollBarThumbVisuals();
        } else if (scrollableWidth <= 0 && this.scrollThumb) {
            this.scrollThumb.style.width = '0%';
            this.scrollThumb.style.left = '0%';
        }
    }

    updateScrollBarThumbVisuals() {
        if (!this.scrollThumb || !this.container || !this.scrollTrack) return;

        const containerWidth = this.container.clientWidth;
        const contentWidth = this.container.scrollWidth;

        if (contentWidth <= containerWidth) {
            this.scrollThumb.style.width = '0%';
            this.scrollThumb.style.left = '0%';
            return;
        }

        const thumbRatio = Math.max(0.05, Math.min(1, containerWidth / contentWidth));
        const thumbWidthPercent = thumbRatio * 100;
        this.scrollThumb.style.width = `${thumbWidthPercent}%`;

        const trackWidthPx = this.scrollTrack.clientWidth;
        const thumbWidthPx = this.scrollThumb.offsetWidth;
        const availableTrackPx = trackWidthPx - thumbWidthPx;

        if (availableTrackPx < 0) {
            this.scrollThumb.style.left = '0px';
            return;
        }
        this.scrollThumb.style.left = `${(this.scrollPosition / 100) * availableTrackPx}px`;
    }

    setScrollPositionPercent(percentage) {
        if (!this.container || !isFinite(percentage)) return;
        const scrollableWidth = this.container.scrollWidth - this.container.clientWidth;
        if (scrollableWidth > 0) {
            const boundedPercentage = Math.max(0, Math.min(100, percentage));
            this.container.scrollLeft = (boundedPercentage / 100) * scrollableWidth;
        }
    }

    async initialize(initialSizeClassKey = 'medium-icons') {
        try {
            if (!Array.isArray(this.appData)) this.appData = [];

            this.container.setAttribute('tabindex', '0'); // Make container focusable

            this.appData.forEach((app, index) => {
                if (!app.id) {
                    app.id = app.label || `app-grid-item-${Date.now()}-${index}`;
                }
            });

            this.layoutPresets = this.createLayoutPresets();
            this.container.innerHTML = '';
            this.container.classList.add('app-grid');

            const sizeIndex = this.sizeClasses.indexOf(initialSizeClassKey);
            this.currentSizeIndex = sizeIndex !== -1 ? sizeIndex : 2;

            const layoutName = (this.currentLayout in this.layoutPresets) ? this.currentLayout : 'default';
            const preset = this.layoutPresets[layoutName] || this.layoutPresets.default;
            this.currentLayout = layoutName;

            this.buildGridFromPreset(preset);
            this.applyCurrentSizeClass();
            this.createControls();

            if (!this.scrollBar && this.bottomScreenContainer) {
                this.createScrollBar();
            }
            
            requestAnimationFrame(async () => {
                this.updateContainerRect();
                this.updateResponsiveLayout();
                this.updateScrollPositionFromEvent();

                const initialAppToLoad = this.appData.find(app => app.baseIcon) || (this.appData.length > 0 ? this.appData[0] : null);
                if (initialAppToLoad) {
                    this.selectApp(initialAppToLoad.id);
                    await this.loadBanner(initialAppToLoad);
                }
            });

        } catch (error) {
            console.error('AppGrid Initialization Error:', error);
            this.container.innerHTML = '<p style="color:red;text-align:center;">Error loading applications.</p>';
        }
    }
    
    _handleKeyDown(event) {
        if (this.appData.length === 0) return;
    
        const key = event.key;
        const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!validKeys.includes(key)) return;
    
        event.preventDefault();
    
        const currentAppId = this.selectedAppId || (this.appData[0] && this.appData[0].id);
        if (!currentAppId) return;
    
        let currentIndex = this.appData.findIndex(app => app.id === currentAppId);
    
        if (currentIndex === -1) {
            currentIndex = 0;
        }
    
        if (key === 'ArrowUp' || key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + this.appData.length) % this.appData.length;
        } else if (key === 'ArrowDown' || key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % this.appData.length;
        }
    
        const nextApp = this.appData[currentIndex];
        if (nextApp) {
            this.selectApp(nextApp.id);
            this.loadBanner(nextApp);
        }
    }

    updateResponsiveLayout() {
        if (!this.container || !this.containerRect) {
            this.updateContainerRect();
            if (!this.containerRect) return;
        }

        const sizeConfig = this.getCurrentSizeConfig();
        const containerHeight = this.containerRect.height;

        const currentPaddingTop = parseFloat(getComputedStyle(this.container).paddingTop) || 0;
        const currentPaddingBottom = parseFloat(getComputedStyle(this.container).paddingBottom) || 0;
        const availableHeight = Math.max(0, containerHeight - currentPaddingTop - currentPaddingBottom);

        const itemContainerHeight = sizeConfig.containerSize;
        const itemSpacing = sizeConfig.spacing;
        const effectiveRowHeight = itemContainerHeight + itemSpacing;

        let calculatedRows = 1;
        if (effectiveRowHeight > 0) {
            calculatedRows = Math.floor((availableHeight + itemSpacing) / effectiveRowHeight);
        }

        const maxAllowedRows = sizeConfig.maxRows > 0 ? sizeConfig.maxRows : calculatedRows;
        let finalRows = Math.min(Math.max(1, calculatedRows), maxAllowedRows);

        const totalItems = this.container.querySelectorAll('.app-icon-container').length;
        if (totalItems === 0) finalRows = 1;
        else if (finalRows > totalItems && totalItems > 0) {
            if (finalRows > totalItems) finalRows = totalItems;
        }

        this.container.style.setProperty('--grid-rows', String(finalRows));
        this.container.style.setProperty('--icon-size', `${sizeConfig.iconSize}px`);
        this.container.style.setProperty('--container-size', `${sizeConfig.containerSize}px`);
        this.container.style.setProperty('--grid-spacing', `${sizeConfig.spacing}px`);
        this.container.style.setProperty('--edge-margin', `${sizeConfig.edgeMargin}px`);
        this.container.style.setProperty('--icon-border-radius', sizeConfig.radius);

        const totalContentHeight = (finalRows * itemContainerHeight) + Math.max(0, finalRows - 1) * itemSpacing;
        let paddingVertical = (availableHeight - totalContentHeight) / 2;
        paddingVertical = Math.max(sizeConfig.edgeMargin / 2, paddingVertical);

        this.container.style.setProperty('--grid-padding-vertical', `${paddingVertical}px`);
        this.container.style.setProperty('paddingLeft', `${sizeConfig.edgeMargin}px`);
        this.container.style.setProperty('paddingRight', `${sizeConfig.edgeMargin}px`);

        requestAnimationFrame(() => {
            this.updateScrollPositionFromEvent();
        });
    }

    buildGridFromPreset(preset) {
        this.container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        if (!this.appData || this.appData.length === 0) return;

        let appDataIndex = 0;
        preset.structure.forEach(section => {
            if (section.type === 'app') {
                const numAppsToCreate = Math.min(section.count, this.appData.length - appDataIndex);
                for (let i = 0; i < numAppsToCreate; i++) {
                    if (this.appData[appDataIndex]) {
                        const appElement = this.createAppElement(this.appData[appDataIndex]);
                        fragment.appendChild(appElement);
                        appDataIndex++;
                    }
                }
            }
        });
        this.container.appendChild(fragment);
    }

    getCurrentSizeConfig() {
        const className = this.sizeClasses[this.currentSizeIndex] || this.sizeClasses[2];
        return this.sizeConfigurations[className] || this.sizeConfigurations['medium-icons'];
    }

    createAppElement(appDataItem) {
        const currentSizeConfig = this.getCurrentSizeConfig();
        const appIconOptions = {
            ...appDataItem,
            width: currentSizeConfig.iconSize,
            height: currentSizeConfig.iconSize,
            onClick: (event, originalAppOptionsFromIcon) =>
                this._internalHandleAppClickTrigger(event, appDataItem, originalAppOptionsFromIcon),
            originalOnClick: appDataItem.onClick
        };

        const appVisualElement = this.iconSystem.createApp(appIconOptions);
        const gridCellContainer = document.createElement('div');
        gridCellContainer.className = 'app-icon-container';
        const iconWrapper = document.createElement('div');
        iconWrapper.className = `app-icon${appDataItem.unopened ? ' unopened-app-wrapper' : ''}`;
        iconWrapper.dataset.appId = appDataItem.id;

        iconWrapper.appendChild(appVisualElement);
        const selectionGlow = document.createElement('div');
        selectionGlow.className = 'selection-glow';
        iconWrapper.appendChild(selectionGlow);
        gridCellContainer.appendChild(iconWrapper);
        return gridCellContainer;
    }

    async loadBanner(appDataItem) {
        console.log(`AppGrid: Attempting to load banner for ${appDataItem.label}`);
        if (!this.topScreenElement) {
            console.error("AppGrid: Top screen element reference is missing.");
            return;
        }

        const loaderElementInTopScreen = this.topScreenElement.querySelector('#Loader');

        if (this.currentBannerAPI && typeof this.currentBannerAPI.dispose === 'function') {
            console.log("AppGrid: Disposing previous banner API.");
            try {
                this.currentBannerAPI.dispose();
            } catch (e) {
                console.error("AppGrid: Error disposing previous banner:", e);
            }
            this.currentBannerAPI = null;
        }

        // Clear previous banner content, keeping loader if it's there
        const childrenToRemove = [];
        this.topScreenElement.childNodes.forEach(child => {
            if (child.id !== 'Loader') { // Don't remove the loader itself yet
                childrenToRemove.push(child);
            }
        });
        childrenToRemove.forEach(child => this.topScreenElement.removeChild(child));

        if (loaderElementInTopScreen) {
            loaderElementInTopScreen.style.display = 'block'; // Ensure loader is visible
        }

        // Determine which banner properties to use based on 'unopened' state
        let activeBannerModule = appDataItem.bannerModule; // Default to normal banner
        let activeBannerImage = appDataItem.banner;       // Default to normal banner image
        let activeAssetPaths = appDataItem.assetPaths || {}; // Default to app's general assetPaths

        if (appDataItem.unopened) {
            console.log(`Item '${appDataItem.label}' is unopened. Checking for specific unopened banner.`);
            if (appDataItem.unopenedBannerModule) {
                activeBannerModule = appDataItem.unopenedBannerModule;
                activeBannerImage = null; // Module takes precedence
                console.log(`Using unopenedBannerModule: ${activeBannerModule}`);
            } else if (appDataItem.unopenedBanner) {
                activeBannerImage = appDataItem.unopenedBanner;
                activeBannerModule = null; // Image takes precedence if no unopened module
                console.log(`Using unopenedBannerImage: ${activeBannerImage}`);
            } else {
                activeBannerModule = null;
                activeBannerImage = null;
                console.log("No specific unopened banner defined for unopened item. Will show default message.");
            }
        }

        try {
            if (activeBannerModule && typeof activeBannerModule === 'string') {
                const bannerModule = await import(activeBannerModule);
                let bannerInstanceAPI;

                // Standardized function names preferred, e.g., createBannerScene
                if (typeof bannerModule.createBannerScene === 'function') {
                    const bannerCanvas = document.createElement('canvas');
                    bannerCanvas.id = `${activeBannerModule.toLowerCase()}Canvas`; // e.g., mysterygiftbannerCanvas
                    if (loaderElementInTopScreen) this.topScreenElement.insertBefore(bannerCanvas, loaderElementInTopScreen);
                    else this.topScreenElement.appendChild(bannerCanvas);
                    bannerInstanceAPI = await bannerModule.createBannerScene(bannerCanvas, activeAssetPaths, appDataItem);

                } else if (typeof bannerModule.createOceanScene === 'function' && activeBannerModule === "OceanBanner") { // Specific for OceanBanner
                    const oceanCanvas = document.createElement('canvas');
                    oceanCanvas.id = 'oceanCanvas';
                    if (loaderElementInTopScreen) this.topScreenElement.insertBefore(oceanCanvas, loaderElementInTopScreen);
                    else this.topScreenElement.appendChild(oceanCanvas);
                    bannerInstanceAPI = await bannerModule.createOceanScene(oceanCanvas, activeAssetPaths);

                } else { // Fallback to other known function names
                    let loadFunction;
                    if (typeof bannerModule.loadBanner === 'function') loadFunction = bannerModule.loadBanner;
                    else if (typeof bannerModule.loadBannerInto === 'function') loadFunction = bannerModule.loadBannerInto;
                    else if (typeof bannerModule.initializeBanner === 'function') loadFunction = bannerModule.initializeBanner;

                    if (loadFunction) {
                        bannerInstanceAPI = await loadFunction(this.topScreenElement, appDataItem, activeAssetPaths);
                    } else {
                        throw new Error(`Module '${activeBannerModule}' does not export a recognized banner creation function (e.g., createBannerScene, createOceanScene, loadBanner).`);
                    }
                }

                if (bannerInstanceAPI && typeof bannerInstanceAPI.dispose === 'function') {
                    this.currentBannerAPI = bannerInstanceAPI;
                } else {
                    console.warn(`Banner module '${activeBannerModule}' loaded, but did not return a valid API with a dispose function.`);
                    this.currentBannerAPI = null;
                }

            } else if (activeBannerImage && typeof activeBannerImage === 'string' && activeBannerImage.trim() !== "") {
                this.currentBannerAPI = null; // Static image, no API
                const bannerContent = document.createElement('div');
                this.setDefaultBannerStyles(bannerContent);
                const img = document.createElement('img');
                img.src = activeBannerImage;
                img.alt = `${appDataItem.label || 'App'} Banner`;
                img.style.maxWidth = '100%'; img.style.maxHeight = 'calc(100% - 20px)'; // Adjusted for padding
                img.style.objectFit = 'contain';
                img.onerror = () => { img.remove(); this.displayBannerError(this.topScreenElement, appDataItem.label, "Failed to load image."); };
                bannerContent.appendChild(img);
                if (loaderElementInTopScreen) this.topScreenElement.insertBefore(bannerContent, loaderElementInTopScreen);
                else this.topScreenElement.appendChild(bannerContent);
            } else {
                // Default content if no banner module or image is specified
                this.currentBannerAPI = null;
                const bannerContent = document.createElement('div');
                this.setDefaultBannerStyles(bannerContent);
                const title = document.createElement('h2');
                title.textContent = appDataItem.label || 'Application';
                const desc = document.createElement('p');

                if (appDataItem.unopened && !activeBannerModule && !activeBannerImage) {
                    desc.textContent = `This is a ${appDataItem.label || 'mystery item'}!`;
                } else if (!activeBannerModule && !activeBannerImage) {
                    desc.textContent = `Welcome to ${appDataItem.label || 'the application'}.`;
                } else { // Should not be reached if logic above is correct, but as a fallback
                    desc.textContent = "No specific banner information found.";
                }
                bannerContent.appendChild(title);
                bannerContent.appendChild(desc);

                if (bannerContent.hasChildNodes()) {
                    if (loaderElementInTopScreen) this.topScreenElement.insertBefore(bannerContent, loaderElementInTopScreen);
                    else this.topScreenElement.appendChild(bannerContent);
                }
            }
        } catch (error) {
            console.error(`AppGrid: Error loading banner for '${appDataItem.label}':`, error);
            this.displayBannerError(this.topScreenElement, appDataItem.label, error.message);
        } finally {
            if (loaderElementInTopScreen) {
                loaderElementInTopScreen.style.display = 'none'; // Hide loader after attempt
            }
        }
    }

    setDefaultBannerStyles(element) {
        element.style.display = 'flex'; element.style.flexDirection = 'column';
        element.style.justifyContent = 'center'; element.style.alignItems = 'center';
        element.style.width = '100%'; element.style.height = '100%';
        element.style.textAlign = 'center'; element.style.padding = '10px';
        element.style.boxSizing = 'border-box'; element.style.color = '#fff';
        element.style.fontFamily = 'Arial, sans-serif'; // Example font
        element.style.padding = '20px';
        element.style.color = 'white';
    }

    displayBannerError(parentElement, label, message = "Could not load banner.") {
        // Clear previous content except loader
        const childrenToClearError = [];
        parentElement.childNodes.forEach(child => { if (child.id !== 'Loader') childrenToClearError.push(child); });
        childrenToClearError.forEach(child => parentElement.removeChild(child));

        const errorContent = document.createElement('div');
        this.setDefaultBannerStyles(errorContent);
        errorContent.style.color = '#ffdddd';

        const title = document.createElement('h3');
        title.textContent = `Banner Error: ${label}`;
        title.style.margin = '0 0 5px 0';
        errorContent.appendChild(title);

        const msgPara = document.createElement('p');
        msgPara.textContent = message;
        msgPara.style.margin = '0'; msgPara.style.fontSize = '0.9em';
        errorContent.appendChild(msgPara);

        const loaderInParent = parentElement.querySelector('#Loader');
        if (loaderInParent) {
            parentElement.insertBefore(errorContent, loaderInParent);
        } else {
            parentElement.appendChild(errorContent);
        }
    }

    _internalHandleAppClickTrigger(event, appDataItem, originalAppOptionsFromIcon) {
        this.playSound('click');
        const appId = appDataItem.id;
        const clickedButton = event.currentTarget;
        const iconWrapper = clickedButton.closest('.app-icon');

        if (!iconWrapper) {
            console.error("AppGrid: No .app-icon wrapper found for click trigger on:", appDataItem.label, "Clicked element:", event.currentTarget);
            return;
        }

        const wasSelectedBeforeThisClick = this.selectedAppId === appId;

        if (!wasSelectedBeforeThisClick) {
            this.loadBanner(appDataItem);
        }

        this.selectApp(appId, iconWrapper);

        if (this.topScreenStatusEl) {
            this.topScreenStatusEl.textContent = `Selected: ${appDataItem.label}: ${appDataItem.description || ''}`;
        }

        if (appDataItem.unopened) {
            if (wasSelectedBeforeThisClick && this.lastSelectedAppIdForAction === appId) {
                if (this.topScreenStatusEl) {
                    this.topScreenStatusEl.textContent = `Unopening: ${appDataItem.label}`;
                }
                this.playSound('openbox'); // Play sfx for opening the box
                this.iconSystem.handleUnopenedClick(event, originalAppOptionsFromIcon, this);
                this.lastSelectedAppIdForAction = null;
            } else {
                this.lastSelectedAppIdForAction = appId;
            }
        } else {
            if (wasSelectedBeforeThisClick && this.lastSelectedAppIdForAction === appId) {
                if (this.topScreenStatusEl) {
                    this.topScreenStatusEl.textContent = `Launching: ${appDataItem.label}`;
                }
                this.launchSelectedApp(appDataItem, iconWrapper);
                this.lastSelectedAppIdForAction = null;
            } else {
                this.lastSelectedAppIdForAction = appId;
            }
        }
    }

    updateAfterAppReplacement(newAppVisualContainer, newAppOptionsFromIcon) {
        const appId = newAppOptionsFromIcon.id;

        const appIndex = this.appData.findIndex(app => app.id === appId);
        if (appIndex !== -1) {
            this.appData[appIndex].unopened = false;
            this.appData[appIndex].icon = newAppOptionsFromIcon.icon;
            if (newAppOptionsFromIcon.originalOnClick) {
                this.appData[appIndex].onClick = newAppOptionsFromIcon.originalOnClick;
            } else if (newAppOptionsFromIcon.onClick && newAppOptionsFromIcon.onClick !== this._internalHandleAppClickTrigger) {
                this.appData[appIndex].onClick = newAppOptionsFromIcon.onClick;
            }
        } else {
            console.warn("AppGrid: Could not find app in appData to update after replacement. ID:", appId);
        }

        const iconWrapper = newAppVisualContainer.closest('.app-icon');
        if (!iconWrapper) {
            console.error("AppGrid: .app-icon wrapper not found after app replacement for ID:", appId);
            return;
        }

        this.selectApp(appId, iconWrapper);

        const currentAppData = this.appData.find(app => app.id === appId) || newAppOptionsFromIcon;
        if (this.topScreenStatusEl) {
            this.topScreenStatusEl.textContent = `Revealed: ${currentAppData.label}`;
        }
        this.loadBanner(currentAppData); // Update banner after reveal


        const newButton = newAppVisualContainer.querySelector('.app-button');
        if (newButton) {
            const currentSizeConfig = this.getCurrentSizeConfig();
            this.iconSystem.updateIconSize(newButton, currentSizeConfig.iconSize, false);
        }
        this.lastSelectedAppIdForAction = appId;
    }

    selectApp(appId, iconWrapperElement) {
        if (this.selectedAppId && this.selectedAppId !== appId) {
            const prevSelectedIconWrapper = this.container.querySelector(`.app-icon[data-app-id="${this.selectedAppId}"]`);
            if (prevSelectedIconWrapper) {
                const prevGlow = prevSelectedIconWrapper.querySelector('.selection-glow');
                if (prevGlow) {
                    prevGlow.style.opacity = '0';
                    prevGlow.style.backgroundImage = 'none';
                    prevGlow.style.transform = 'scale(1.1)';
                }
            }
        }

        this.selectedAppId = appId;
        
        const appDataItem = this.appData.find(app => app.id === appId);
        if (appDataItem && this.controlsContainer) {
            const infoScroller = this.controlsContainer.querySelector('.appgrid-info-scroller');
            const infoTextElement = infoScroller.querySelector('p');
            if (infoTextElement) {
                infoTextElement.textContent = `${appDataItem.label || ''}: ${appDataItem.description || ''}`;
                this.resetAndAnimateInfoText(infoScroller, infoTextElement);
            }
        }
        
        if (!iconWrapperElement) {
            iconWrapperElement = this.container.querySelector(`.app-icon[data-app-id="${appId}"]`);
        }

        if (iconWrapperElement) {
            const glow = iconWrapperElement.querySelector('.selection-glow');
            if (glow) {
                void glow.offsetHeight;
                glow.style.opacity = '1';
                glow.style.backgroundImage = `url("${this.assetUrls.selectionGlow}")`;
                glow.style.backgroundSize = 'contain';
                glow.style.backgroundRepeat = 'no-repeat';
                glow.style.backgroundPosition = 'center';
                glow.style.transform = 'scale(1.2)';
            }

            iconWrapperElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
            this.playSound('select');
        }
    }

    resetAndAnimateInfoText(scroller, textElement) {
        // Cancel any pending or active animation
        if (this.infoScrollTimeout) clearTimeout(this.infoScrollTimeout);
        if (this.infoScrollerAnimator) {
            this.infoScrollerAnimator.cancel();
            this.infoScrollerAnimator = null;
        }

        // Reset scroll position to the start
        scroller.scrollLeft = 0;

        // Use a small timeout to ensure the DOM has updated
        setTimeout(() => {
            const isOverflowing = textElement.scrollWidth > scroller.clientWidth;
            
            if (isOverflowing) {
                scroller.classList.add('scrolling-fade');
            } else {
                scroller.classList.remove('scrolling-fade');
            }

            if (isOverflowing) {
                this.infoScrollTimeout = setTimeout(() => {
                    const scrollDistance = textElement.scrollWidth - scroller.clientWidth;
                    // Adjust speed for a smoother animation
                    const scrollDuration = (scrollDistance / 40) * 1000; 

                    this.infoScrollerAnimator = scroller.animate([
                        { scrollLeft: 0 },
                        { scrollLeft: scrollDistance },
                        { scrollLeft: 0 }
                    ], {
                        duration: scrollDuration * 2.5, // Slower, more graceful loop
                        easing: 'ease-in-out',
                        iterations: Infinity,
                        delay: 2000, // Longer pause at the start
                        endDelay: 2000 // Longer pause at the end
                    });
                }, 3000); // 3-second delay before starting animation
            }
        }, 50); // Small delay to allow for DOM update
    }


    launchSelectedApp(appDataItem, iconWrapper) {
        if (!appDataItem) {
            console.warn("AppGrid: No appDataItem provided for launch.");
            return;
        }
        const targetForAnimation = iconWrapper || this.container.querySelector(`.app-icon[data-app-id="${appDataItem.id}"]`);
        this.playSound('launch');

        const executeLaunch = () => {
            if (typeof appDataItem.onClick === 'function') {
                // As per the previous correction, 'this' is passed to the handler
                appDataItem.onClick(appDataItem, this);
            } else {
                console.warn("AppGrid: No onClick function found on appDataItem for launch:", appDataItem.label);
            }
        };

        if (typeof anime === 'function' && targetForAnimation) {
            anime({
                targets: targetForAnimation,
                scale: [1, 0.95, 1],
                duration: 150,
                easing: 'easeInOutQuad',
                complete: executeLaunch
            });
        } else {
            executeLaunch();
        }
    }

    applyCurrentSizeClass(animate = false) {
        const newClassName = this.sizeClasses[this.currentSizeIndex];
        this.sizeClasses.forEach(cls => this.container.classList.remove(cls));
        this.container.classList.add(newClassName);

        const currentSizeConfig = this.getCurrentSizeConfig();
        this.updateAllIconVisualSizes(currentSizeConfig, animate);

        requestAnimationFrame(() => {
            this.updateResponsiveLayout();
        });
    }

    updateAllIconVisualSizes(sizeConfig, animate = false) {
        const allIconWrappers = this.container.querySelectorAll('.app-icon');
        allIconWrappers.forEach(iconWrapper => {
            const appContainer = iconWrapper.querySelector('.app-container');
            if (appContainer) {
                const button = appContainer.querySelector('.app-button');
                if (button) {
                    this.iconSystem.updateIconSize(button, sizeConfig.iconSize, animate);
                }
            }
        });
    }

    changeIconSize(direction) {
        const oldIndex = this.currentSizeIndex;
        if (direction === 'decrease' && this.currentSizeIndex > 0) {
            this.currentSizeIndex--;
        } else if (direction === 'increase' && this.currentSizeIndex < this.sizeClasses.length - 1) {
            this.currentSizeIndex++;
        }
    }
    decreaseIconSize() {
        if (this.currentSizeIndex > 0) {
            this.playSound('sizedown');
            this.changeIconSize('decrease');
            this.applyCurrentSizeClass(true);
        }
    }
    increaseIconSize() {
        if (this.currentSizeIndex < this.sizeClasses.length - 1) {
            this.playSound('sizeup');
            this.changeIconSize('increase');
            this.applyCurrentSizeClass(true);
        }
    }
    destroy() {
        this.cleanupEventListeners();
        
        // Clear animation timers and objects
        if (this.infoScrollTimeout) clearTimeout(this.infoScrollTimeout);
        if (this.infoScrollerAnimator) this.infoScrollerAnimator.cancel();

        if (this.scrollBar) {
            this.scrollBar.remove();
            this.scrollBar = null;
        }
        if (this.controlsContainer) {
            this.controlsContainer.remove();
            this.controlsContainer = null;
        }
        this.scrollThumb = null;
        this.scrollTrack = null;
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('app-grid', ...this.sizeClasses);
            this.container.style.cssText = '';
        }
        this.appData = [];
        this.selectedAppId = null;
        this.lastSelectedAppIdForAction = null;
        this.trackClickListener = null;
    }

    /**
    * Plays a sound from an HTML audio element.
    * @param {string} soundName - The name of the sound to play (e.g., 'click', 'select').
    */
    playSound(soundName) {
        const soundId = `appgrid-audio-${soundName}`; // Match the ID created in injectAudioElements
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.volume = this.volume;
            sound.currentTime = 0; // Rewind to the start
            sound.play().catch(error => console.error(`Error playing sound: ${soundId}`, error));
        } else {
            console.warn(`Sound element with ID "${soundId}" not found.`);
        }
    }

    /**
     * Sets the volume for all sound effects.
     * @param {number} volume - A value between 0.0 (silent) and 1.0 (full volume).
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
        
        // Update volume on all existing audio elements
        const soundKeys = ['soundClick', 'soundSelect', 'soundLaunch', 'soundSizeUp', 'soundSizeDown', 'soundGrab', 'soundOpenBox'];
        soundKeys.forEach(key => {
            const soundName = key.replace('sound', '').toLowerCase();
            const soundId = `appgrid-audio-${soundName}`;
            const sound = document.getElementById(soundId);
            if (sound) {
                sound.volume = this.volume;
            }
        });
    }

    /**
     * Updates the asset URLs used by the AppGrid instance.
     * This will re-inject styles and update audio sources.
     * @param {Object} newAssetUrls - An object containing the new asset URLs to apply.
     * Only include the assets you want to change.
     */
    updateAssetUrls(newAssetUrls = {}) {
        // 1. Merge new URLs with the existing configuration
        this.assetUrls = { ...this.assetUrls, ...newAssetUrls };

        // 2. Re-inject the stylesheet to update all CSS-based image assets
        this.injectStyles();

        // 3. Update the source of the existing audio elements
        const soundKeys = ['soundClick', 'soundSelect', 'soundLaunch', 'soundSizeUp', 'soundSizeDown', 'soundGrab', 'soundOpenBox'];
        soundKeys.forEach(key => {
            // Check if a new URL for this specific sound was provided
            if (newAssetUrls[key]) {
                const soundName = key.replace('sound', '').toLowerCase();
                const soundId = `appgrid-audio-${soundName}`;
                const sound = document.getElementById(soundId);
                if (sound) {
                    sound.src = this.assetUrls[key];
                    sound.load(); // Instruct the browser to load the new audio source
                }
            }
        });

        // 4. If an app is currently selected, update its selection glow image
        if (this.selectedAppId && newAssetUrls.selectionGlow) {
            const selectedIconWrapper = this.container.querySelector(`.app-icon[data-app-id="${this.selectedAppId}"]`);
            if (selectedIconWrapper) {
                const glow = selectedIconWrapper.querySelector('.selection-glow');
                // Check if the glow is currently visible by inspecting its style
                if (glow && glow.style.opacity === '1') {
                    glow.style.backgroundImage = `url("${this.assetUrls.selectionGlow}")`;
                }
            }
        }
    }

    /**
     * Updates the applications displayed in the grid.
     * @param {Array<Object>} newAppData - The new array of application data objects.
     */
    async setAppData(newAppData) {
        this.appData = newAppData || [];
        this.appData.forEach((app, index) => {
            if (!app.id) {
                app.id = app.label || `app-grid-item-${Date.now()}-${index}`;
            }
        });

        // Reset state
        this.selectedAppId = null;
        this.lastSelectedAppIdForAction = null;

        // Rebuild the grid
        this.layoutPresets = this.createLayoutPresets();
        const layoutName = (this.currentLayout in this.layoutPresets) ? this.currentLayout : 'default';
        const preset = this.layoutPresets[layoutName] || this.layoutPresets.default;
        this.buildGridFromPreset(preset);

        // Re-apply visual styles and layout calculations
        this.applyCurrentSizeClass();

        // Load banner for the first app in the new dataset
        if (this.currentBannerAPI && typeof this.currentBannerAPI.dispose === 'function') {
            try {
                this.currentBannerAPI.dispose();
            } catch (e) {
                console.error("AppGrid: Error disposing current banner on data reset:", e);
            }
            this.currentBannerAPI = null;
        }
        
        // Clear banner and status
        if(this.topScreenElement) this.topScreenElement.innerHTML = '';
        if(this.topScreenStatusEl) this.topScreenStatusEl.textContent = '';


        const initialAppToLoad = this.appData.length > 0 ? this.appData[0] : null;
        if (initialAppToLoad) {
            await this.loadBanner(initialAppToLoad);
        }

        // Use requestAnimationFrame to ensure layout is updated before scroll calculations
        requestAnimationFrame(() => {
            this.updateContainerRect();
            this.updateResponsiveLayout();
            this.setScrollPositionPercent(0); // Reset scroll to the beginning
            this.updateScrollPositionFromEvent();
        });
    }
}
