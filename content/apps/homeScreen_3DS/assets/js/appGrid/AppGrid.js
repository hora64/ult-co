import { BannerManager } from "/content/common/utils/index.js";
import { AppGridStateManager } from './AppGridStateManager.js';
import { AppGridUI } from './AppGridUI.js';
import { AppGridSound } from './AppGridSound.js';
import { AppGridEvents } from './AppGridEvents.js';
import { AppGridLayout } from './AppGridLayout.js';
import { AppGridRendering } from './AppGridRendering.js';
import { AppGridSelection } from './AppGridSelection.js';
import { AppGridAnimation } from './AppGridAnimation.js';
import { gridConfig } from '../../../config/config.js';

export class AppGrid {
    /**
     * Creates an instance of AppGrid.
     * @param {HTMLElement} container - The grid container element.
     * @param {Array<Object>} appData - Array of application data objects.
     * @param {Object} iconSystem - An instance of the class that creates app icons.
     * @param {HTMLElement} topScreenElement - The element for displaying banners.
     * @param {Object} [options={}] - An options object.
     * @param {Object} [options.assetUrls={}] - An object to override default asset URLs.
     * @param {number} [options.volume=0.5] - The initial volume for sound effects (0.0 to 1.0).
     * @param {string} [options.storageKey='openedApps'] - The key for storing opened app states in localStorage.
     * @param {string} [options.gridStateKey='appGridState'] - The key for storing grid state in localStorage.
     * @param {Function} [options.onSelectionChange] - Callback function when app selection changes.
     */
    constructor(container, appData = [], iconSystem, topScreenElement, options = {}) {
        this.options = options;
        const {
            assetUrls = {},
            volume = 0.5,
            storageKey = 'openedApps',
            gridStateKey = 'appGridState',
            onSelectionChange,
            topScreen = null // NEW: Accept topScreen instance
        } = options;

        this.container = container;
        this.appData = appData;
        this.iconSystem = iconSystem;
        this.topScreenElement = topScreenElement;
        // Use topScreen instance if provided, otherwise fall back to BannerManager for backward compatibility
        this.topScreen = topScreen;
        this.bannerManager = topScreen || new BannerManager(topScreenElement);
        this.onSelectionChange = onSelectionChange;

        const appOrderKey = 'appGridOrder';
        const gridLayoutKey = 'appGridLayout2D';
        this.stateManager = new AppGridStateManager(storageKey, gridStateKey, appOrderKey, gridLayoutKey);

        this.userLanguage = this.stateManager.getUserLanguage();
        this.openedApps = this.stateManager.loadOpenedState();
        const gridState = this.stateManager.loadGridState();

        const defaultAssetUrls = this._createDefaultAssetUrls();
        this.assetUrls = { ...defaultAssetUrls, ...assetUrls };

        this.soundManager = new AppGridSound(this.assetUrls,
            Math.max(0,
                Math.min(1, volume)
            )
        );

        this.sizeClasses = ['tiny-icons', 'small-icons', 'compact-icons', 'normal-icons', 'comfortable-icons', 'cozy-icons'];
        this.currentSizeIndex = gridState.currentSizeIndex ?? 3; // Default to 'normal-icons'

        this.scrollPosition = 0;
        this.selectedAppId = gridState.selectedAppId ?? null;
        this.lastSelectedAppIdForAction = null;

        // NEW: Track empty tile selection
        this.selectedEmptyTile = null; // Stores {row, col} of selected empty tile

        this.containerRect = null;
        this.scrollbar = null;

        // Base grid layout structure - ALWAYS stored as 6 rows
        this.baseGridLayout2D = null; // Base 6-row 2D array of app IDs
        this.baseRows = 6; // Base row count for storage
        this.baseColumns = 0; // Will be calculated based on apps

        // Visual grid layout - transformed from base based on current size
        this.gridLayout2D = null; // Visual 2D array (transformed)
        this.gridRows = 0; // Visual rows (from size config)
        this.gridColumns = 0; // Visual columns (calculated)

        this.sizeConfigurations = this.createSizeConfigurations();
        this.layoutPresets = {};
        this.currentLayout = 'default';

        this.topScreenStatusEl = document.getElementById('topScreenStatus');

        this.uiManager = new AppGridUI(this.container, this.assetUrls, this.sizeClasses);
        
        // Initialize new submodules
        this.layout = new AppGridLayout(this);
        this.rendering = new AppGridRendering(this);
        this.selection = new AppGridSelection(this);
        this.animation = new AppGridAnimation(this);
        this.eventManager = new AppGridEvents(this);

        // Maintain backward compatibility with property getters/setters
        Object.defineProperty(this, 'baseGridLayout2D', {
            get: () => this.layout.baseGridLayout2D,
            set: (value) => { this.layout.baseGridLayout2D = value; }
        });
        Object.defineProperty(this, 'gridLayout2D', {
            get: () => this.layout.gridLayout2D,
            set: (value) => { this.layout.gridLayout2D = value; }
        });
        Object.defineProperty(this, 'baseRows', {
            get: () => this.layout.baseRows,
            set: (value) => { this.layout.baseRows = value; }
        });
        Object.defineProperty(this, 'baseColumns', {
            get: () => this.layout.baseColumns,
            set: (value) => { this.layout.baseColumns = value; }
        });
        Object.defineProperty(this, 'gridRows', {
            get: () => this.layout.gridRows,
            set: (value) => { this.layout.gridRows = value; }
        });
        Object.defineProperty(this, 'gridColumns', {
            get: () => this.layout.gridColumns,
            set: (value) => { this.layout.gridColumns = value; }
        });
        Object.defineProperty(this, 'selectedAppId', {
            get: () => this.selection.selectedAppId,
            set: (value) => { this.selection.selectedAppId = value; }
        });
        Object.defineProperty(this, 'selectedEmptyTile', {
            get: () => this.selection.selectedEmptyTile,
            set: (value) => { this.selection.selectedEmptyTile = value; }
        });
        Object.defineProperty(this, 'animationFrameId', {
            get: () => this.animation.animationFrameId,
            set: (value) => { this.animation.animationFrameId = value; }
        });
        Object.defineProperty(this, 'resizeDebounceTimer', {
            get: () => this.animation.resizeDebounceTimer,
            set: (value) => { this.animation.resizeDebounceTimer = value; }
        });

        // Restore selected app ID from saved state
        this.selection.selectedAppId = gridState.selectedAppId ?? null;

        if (!this.container) {
            console.error("AppGrid: Container element not provided.");
            return;
        }
        if (!this.iconSystem) {
            console.error("AppGrid: IconSystem (AppIcon instance) not provided.");
            return;
        }

        this._processAppData();
        this.layout.loadGridLayout2D();

        this.updateContainerRect();
        this.eventManager.setupEventListeners();
    }

    setScrollbar(scrollbar) {
        this.scrollbar = scrollbar;
    }

    _getUserLanguage() {
        return this.stateManager.getUserLanguage();
    }

    _getLocalizedText(appDataItem, key) {
        if (appDataItem.locales) {
            if (appDataItem.locales[this.userLanguage] && appDataItem.locales[this.userLanguage][key]) {
                return appDataItem.locales[this.userLanguage][key];
            }
            if (appDataItem.locales['en-US'] && appDataItem.locales['en-US'][key]) {
                return appDataItem.locales['en-US'][key];
            }
        }
        return '';
    }

    _loadOpenedState() {
        return this.stateManager.loadOpenedState();
    }

    _saveOpenedState() {
        this.stateManager.saveOpenedState(this.openedApps);
    }

    _loadGridState() {
        return this.stateManager.loadGridState();
    }

    _saveGridState() {
        const state = {
            currentSizeIndex: this.currentSizeIndex,
            selectedAppId: this.selection.selectedAppId,
        };
        this.stateManager.saveGridState(state);
    }

    _processAppData() {
        if (!Array.isArray(this.appData)) this.appData = [];

        this.appData.forEach((app, index) => {
            if (!app.id) {
                const defaultLabel = this._getLocalizedText(app, 'label');
                app.id = defaultLabel ? defaultLabel.replace(/\s+/g, '-') + `-${index}` : `app-grid-item-${Date.now()}-${index}`;
            }

            if (typeof app.unopened !== 'boolean') {
                const isOpenedInStorage = this.openedApps[app.id] === true;
                app.unopened = !isOpenedInStorage;
            }

            app.localizedLabel = this._getLocalizedText(app, 'label');
            app.localizedDescription = this._getLocalizedText(app, 'description');
        });
    }

    // Delegate layout methods to layout module
    findAppPosition2D(appId) {
        return this.layout.findAppPosition2D(appId);
    }

    getAppIdAt(row, col) {
        return this.layout.getAppIdAt(row, col);
    }

    setAppIdAt(row, col, appId) {
        return this.layout.setAppIdAt(row, col, appId);
    }

    getAppAt2DPosition(row, col) {
        return this.layout.getAppAt2DPosition(row, col);
    }

    getAppsInRow(row) {
        return this.layout.getAppsInRow(row);
    }

    swapApps2D(appId1, appId2) {
        return this.layout.swapApps2D(appId1, appId2);
    }

    moveAppTo2D(appId, targetRow, targetCol) {
        return this.layout.moveAppTo2D(appId, targetRow, targetCol);
    }

    resetAppOrder() {
        return this.layout.resetAppOrder();
    }

    // Delegate selection methods to selection module
    selectApp(appId, iconWrapperElement, animateScroll = false) {
        return this.selection.selectApp(appId, iconWrapperElement, animateScroll);
    }

    selectEmptyTile(row, col, tileElement = null) {
        return this.selection.selectEmptyTile(row, col, tileElement);
    }

    renderSelectionGlow(canvas, iconSize, options = {}) {
        return this.selection.renderSelectionGlow(canvas, iconSize, options);
    }

    updateSelectionGlowSize(canvas, iconSize) {
        return this.selection.updateSelectionGlowSize(canvas, iconSize);
    }

    // Delegate rendering methods to rendering module
    createIcon(appDataItem) {
        return this.rendering.createIcon(appDataItem);
    }

    createEmptyTile() {
        return this.rendering.createEmptyTile();
    }

    renderEmptyTile(canvas, size) {
        return this.rendering.renderEmptyTile(canvas, size);
    }

    renderTextToCanvas(text, config = {}) {
        return this.rendering.renderTextToCanvas(text, config);
    }

    buildGridFromPreset(preset) {
        return this.rendering.buildGridFromPreset(preset);
    }

    rebuildGrid() {
        return this.rendering.rebuildGrid();
    }

    // Delegate animation methods to animation module
    applyCurrentSizeClass(shouldAnimate = true) {
        return this.animation.applyCurrentSizeClass(shouldAnimate);
    }

    increaseIconSize() {
        return this.animation.increaseIconSize();
    }

    decreaseIconSize() {
        return this.animation.decreaseIconSize();
    }

    _createDefaultAssetUrls() {
        const computedStyle = getComputedStyle(document.documentElement);
        const selectionGlowPath = computedStyle.getPropertyValue('--hs-selection-glow-sprite').trim().replace(/^url\(['"]?|['"]?\)$/g, '') || '/content/common/themes/blackTheme/Select_128px.png';

        return {
            selectionGlow: selectionGlowPath,
            selectionGlowAnimated: false,
            selectionGlowFrames: 1,
            selectionGlowFrameDuration: 100,
            topBar: '/content/common/themes/blackTheme/TopBar.png',
            soundClick: '/content/common/sfx/select6.ogg',
            soundSelect: '/content/common/sfx/select5.ogg',
            soundLaunch: '/content/common/sfx/select3.ogg',
            soundSizeUp: '/content/common/sfx/select2.ogg',
            soundSizeDown: '/content/common/sfx/select.ogg',
            soundGrab: "/content/common/sfx/select.ogg",
            soundOpenBox: "assets/blackTheme/sfx/open.ogg"
        };
    }

    createSizeConfigurations() {
        return {
            'tiny-icons': { iconSize: 24, containerSize: 24, spacing: 2, edgeMargin: 6, rows: 6 },
            'small-icons': { iconSize: 30, containerSize: 30, spacing: 4, edgeMargin: 7, rows: 5 },
            'compact-icons': { iconSize: 36, containerSize: 36, spacing: 6, edgeMargin: 8, rows: 4 },
            'normal-icons': { iconSize: 42, containerSize: 42, spacing: 8, edgeMargin: 9, rows: 3 },
            'comfortable-icons': { iconSize: 48, containerSize: 48, spacing: 10, edgeMargin: 12, rows: 2 },
            'cozy-icons': { iconSize: 48, containerSize: 48, spacing: 10, edgeMargin: 12, rows: 1 },
        };
    }

    createLayoutPresets() {
        const appCount = this.appData ? this.appData.length : 10;
        return {
            'default': { structure: [{ type: 'app', count: appCount }] }
        };
    }

    injectStyles() {
        this.uiManager.injectStyles();
    }

    getStyleContent() {
        return this.uiManager.getStyleContent();
    }

    setupEventListeners() {
        this.eventManager.setupEventListeners();
    }

    createElement(tag, className = '') {
        return this.uiManager.createElement(tag, className);
    }

    cleanupEventListeners() {
        this.eventManager.cleanupEventListeners();
    }

    updateResponsiveLayout() {
        if (!this.container || !this.containerRect) {
            this.updateContainerRect();
            if (!this.containerRect) return;
        }
        const sizeConfig = this.getCurrentSizeConfig();
        const totalItems = this.container.querySelectorAll('.app-icon-container').length;
        this.uiManager.updateResponsiveLayout(this.containerRect, sizeConfig, totalItems);
        requestAnimationFrame(() => {
            this.updateScrollPositionFromEvent();
        });
    }

    handleResize() {
        this.updateContainerRect();
        this.updateResponsiveLayout();
    }

    updateContainerRect() {
        if (this.container) {
            this.containerRect = this.container.getBoundingClientRect();
        }
    }

    updateScrollPositionFromEvent() {
        if (!this.container) return;
        const scrollableWidth = this.container.scrollWidth - this.container.clientWidth;
        if (scrollableWidth > 0) {
            this.scrollPosition = (this.container.scrollLeft / scrollableWidth) * 100;
        } else {
            this.scrollPosition = 0;
        }
    }

    setScrollPositionPercent(percentage) {
        if (!this.container || !isFinite(percentage)) return;
        const scrollableWidth = this.container.scrollWidth - this.container.clientWidth;
        if (scrollableWidth > 0) {
            const boundedPercentage = Math.max(0, Math.min(100, percentage));
            this.container.scrollLeft = (boundedPercentage / 100) * scrollableWidth;
        }
    }

    async initialize() {
        try {
            this.container.setAttribute('tabindex', '0');
            this.container.classList.add('grid-initializing');

            this.layoutPresets = this.createLayoutPresets();
            this.container.innerHTML = '';
            this.container.classList.add('app-grid');

            const layoutName = (this.currentLayout in this.layoutPresets) ? this.currentLayout : 'default';
            const preset = this.layoutPresets[layoutName] || this.layoutPresets.default;
            this.currentLayout = layoutName;

            this.buildGridFromPreset(preset);
            await this.applyCurrentSizeClass(false);

            requestAnimationFrame(async () => {
                this.updateContainerRect();
                this.updateResponsiveLayout();
                this.updateScrollPositionFromEvent();

                const appToLoad = this.appData.find(app => app.id === this.selection.selectedAppId) || (this.appData.length > 0 ? this.appData[0] : null);

                if (appToLoad) {
                    this.selectApp(appToLoad.id);
                    // Check if loadBanner method exists before calling
                    if (this.bannerManager && typeof this.bannerManager.loadBanner === 'function') {
                    // Check if loadBanner method exists before calling
                        if (this.bannerManager && typeof this.bannerManager.loadBanner === 'function') {
                            await this.bannerManager.loadBanner(appToLoad);
                        }
                    } else if (this.topScreen && typeof this.topScreen.loadBanner === 'function') {
                        await this.topScreen.loadBanner(appToLoad);
                }
                }

                setTimeout(() => {
                    this.container.classList.remove('grid-initializing');
                }, 100);
            });

        } catch (error) {
            console.error('AppGrid Initialization Error:', error);
            this.container.innerHTML = '<p style="color:red;text-align:center;">Error loading applications.</p>';
        }
    }

    _handleKeyDown(event) {
        if (this.appData.length === 0 && !this.selection.selectedEmptyTile) return;

        const key = event.key;
        const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!validKeys.includes(key)) return;

        event.preventDefault();

        let currentRow, currentCol;

        if (this.selection.selectedEmptyTile) {
            currentRow = this.selection.selectedEmptyTile.row;
            currentCol = this.selection.selectedEmptyTile.col;
        } else {
            const currentAppId = this.selection.selectedAppId || (this.appData[0] && this.appData[0].id);
            if (!currentAppId) {
                const firstEmptyTile = this.container.querySelector('.empty-tile-container');
                if (firstEmptyTile) {
                    const allContainers = Array.from(this.container.querySelectorAll('.app-icon-container, .empty-tile-container'));
                    const tileIndex = allContainers.indexOf(firstEmptyTile);
                    const numRows = this.layout.gridRows || 1;
                    this.selectEmptyTile(tileIndex % numRows, Math.floor(tileIndex / numRows), firstEmptyTile);
                }
                return;
            }

            const currentPos = this.findAppPosition2D(currentAppId);
            if (!currentPos) return;

            currentRow = currentPos.row;
            currentCol = currentPos.col;
        }

        let targetRow = currentRow;
        let targetCol = currentCol;

        switch (key) {
            case 'ArrowUp':
                targetRow = Math.max(0, currentRow - 1);
                break;
            case 'ArrowDown':
                targetRow = Math.min(this.layout.gridRows - 1, currentRow + 1);
                break;
            case 'ArrowLeft':
                targetCol = Math.max(0, currentCol - 1);
                break;
            case 'ArrowRight':
                targetCol = Math.min(this.layout.gridColumns - 1, currentCol + 1);
                break;
        }

        if (targetRow < 0 || targetRow >= this.layout.gridRows ||
            targetCol < 0 || targetCol >= this.layout.gridColumns) {
            return;
        }

        const nextAppId = this.getAppIdAt(targetRow, targetCol);

        if (nextAppId) {
            const nextApp = this.appData.find(app => app.id === nextAppId);
            if (nextApp) {
                if (this.selection.selectedAppId !== nextAppId) {
                    // Check if loadBanner method exists before calling
                    if (this.bannerManager && typeof this.bannerManager.loadBanner === 'function') {
                    this.bannerManager.loadBanner(nextApp);
                    } else if (this.topScreen && typeof this.topScreen.loadBanner === 'function') {
                        this.topScreen.loadBanner(nextApp);
                }
                }
                this.selectApp(nextAppId, null, true);
                this.selection.selectedEmptyTile = null;
            }
        } else {
            const allContainers = Array.from(this.container.querySelectorAll('.app-icon-container, .empty-tile-container'));
            const tileIndex = (targetCol * this.layout.gridRows) + targetRow;
            const tileElement = allContainers[tileIndex];

            if (tileElement && tileElement.classList.contains('empty-tile-container')) {
                this.selectEmptyTile(targetRow, targetCol, tileElement);
            }
        }
    }

    _internalHandleAppClickTrigger(event, appDataItem, originalAppOptionsFromIcon) {
        this.playSound('click');
        const appId = appDataItem.id;
        const clickedButton = event.currentTarget;
        const iconWrapper = clickedButton.closest('.app-icon');

        if (!iconWrapper) {
            console.error("AppGrid: No .app-icon wrapper found for click trigger on:", appDataItem.localizedLabel, "Clicked element:", event.currentTarget);
            return;
        }

        const wasSelectedBeforeThisClick = this.selection.selectedAppId === appId;

        if (!wasSelectedBeforeThisClick) {
            // Check if loadBanner method exists before calling
            if (this.bannerManager && typeof this.bannerManager.loadBanner === 'function') {
            this.bannerManager.loadBanner(appDataItem);
            } else if (this.topScreen && typeof this.topScreen.loadBanner === 'function') {
                this.topScreen.loadBanner(appDataItem);
        }
        }

        this.selectApp(appId, iconWrapper, true);

        if (this.topScreenStatusEl) {
            this.topScreenStatusEl.textContent = `Selected: ${appDataItem.localizedLabel}: ${appDataItem.localizedDescription || ''}`;
        }

        if (appDataItem.unopened) {
            if (wasSelectedBeforeThisClick && this.lastSelectedAppIdForAction === appId) {
                if (this.topScreenStatusEl) {
                    this.topScreenStatusEl.textContent = `Unopening: ${appDataItem.localizedLabel}`;
                }
                this.playSound('openbox');
                this.iconSystem.handleUnopenedClick(event, originalAppOptionsFromIcon, this, this.userLanguage);
                this.lastSelectedAppIdForAction = null;
            } else {
                this.lastSelectedAppIdForAction = appId;
            }
        } else {
            if (wasSelectedBeforeThisClick && this.lastSelectedAppIdForAction === appId) {
                if (this.topScreenStatusEl) {
                    this.topScreenStatusEl.textContent = `Launching: ${appDataItem.localizedLabel}`;
                }
                this.launchSelectedApp(appDataItem, iconWrapper);
                this.lastSelectedAppIdForAction = null;
            } else {
                this.lastSelectedAppIdForAction = appId;
            }
        }
    }

    updateAfterAppReplacement(newAppVisualContainer, newAppOptionsFromIcon, onUnwrapComplete) {
        const appId = newAppOptionsFromIcon.id;

        const appIndex = this.appData.findIndex(app => app.id === appId);
        if (appIndex !== -1) {
            this.appData[appIndex].unopened = false;
            this.openedApps[appId] = true;
            this._saveOpenedState();

            this.appData[appIndex].icon = newAppOptionsFromIcon.icon;
            this.appData[appIndex].localizedLabel = this._getLocalizedText(this.appData[appIndex], 'label');
            this.appData[appIndex].localizedDescription = this._getLocalizedText(this.appData[appIndex], 'description');

            if (newAppOptionsFromIcon.originalOnClick) {
                this.appData[appIndex].onClick = newAppOptionsFromIcon.originalOnClick;
            } else if (newAppOptionsFromIcon.onClick && newAppOptionsFromIcon.onClick !== this._internalHandleAppClickTrigger) {
                this.appData[appIndex].onClick = newAppOptionsFromIcon.onClick;
            }

            const app = this.appData[appIndex];
            console.log(`[AppGrid] Using root-level banner properties for ${appId}:`, {
                banner: app.banner,
                bannerAnimated: app.bannerAnimated,
                bannerModule: app.bannerModule,
                bannerJingle: app.bannerJingle,
                actualIcon: app.actualIcon || app.icon
            });

            if (!app.actualIcon && app.icon) {
                app.actualIcon = app.icon;
            }
        }

        const iconWrapper = newAppVisualContainer.closest('.app-icon');
        if (!iconWrapper) {
            console.warn('[AppGrid] No icon wrapper found after replacement');
            return;
        }

        this.selectApp(appId, iconWrapper, true);

        const currentAppData = this.appData.find(app => app.id === appId) || newAppOptionsFromIcon;
        if (this.topScreenStatusEl) {
            this.topScreenStatusEl.textContent = `Revealed: ${currentAppData.localizedLabel}`;
        }

        console.log(`[AppGrid] Forcing banner reload for unwrapped app ${appId}`);

        if (this.bannerManager && this.bannerManager.currentBannerCleanup) {
            console.log(`[AppGrid] Cleaning up unopened banner before loading actual banner`);
            this.bannerManager.currentBannerCleanup();
            this.bannerManager.currentBannerCleanup = null;
            this.bannerManager.currentBannerAppId = null;
        }

        setTimeout(() => {
            console.log(`[AppGrid] Loading actual banner for unwrapped app:`, currentAppData);
            // Check if loadBanner method exists before calling
            if (this.bannerManager && typeof this.bannerManager.loadBanner === 'function') {
            this.bannerManager.loadBanner(currentAppData);
            } else if (this.topScreen && typeof this.topScreen.loadBanner === 'function') {
                this.topScreen.loadBanner(currentAppData);
            }
        }, 50);

        const newButton = newAppVisualContainer.querySelector('.app-button');
        if (newButton) {
            const currentSizeConfig = this.getCurrentSizeConfig();
            this.iconSystem.updateIconSize(newButton, currentSizeConfig.iconSize);
        }

        this.lastSelectedAppIdForAction = appId;

        if (typeof onUnwrapComplete === 'function') {
            console.log(`[AppGrid] Calling onUnwrapComplete for ${appId}`);
            onUnwrapComplete(currentAppData);
        }
    }

    launchSelectedApp(appDataItem, iconWrapper) {
        if (!appDataItem) return;

        if (this.soundManager.currentJingle) this.soundManager.currentJingle.stop();

        const targetForAnimation = iconWrapper || this.container.querySelector(`.app-icon[data-app-id="${appDataItem.id}"]`);
        this.playSound('launch');

        const executeLaunch = () => {
            if (typeof appDataItem.onClick === 'function') {
                appDataItem.onClick(appDataItem, this, this.userLanguage);
            } else if (this.iconSystem && typeof this.iconSystem.appLauncher === 'function') {
                this.iconSystem.appLauncher(appDataItem);
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

    triggerUnwrap(appDataItem, onComplete) {
        if (!appDataItem || !appDataItem.unopened) return;

        const iconWrapper = this.container.querySelector(`.app-icon[data-app-id="${appDataItem.id}"]`);
        if (!iconWrapper) return;

        const appIconContainer = iconWrapper.closest('.app-icon-container');
        const button = appIconContainer?.querySelector('.app-button');

        if (!button) return;

        this.playSound('openbox');

        const appIndex = this.appData.findIndex(app => app.id === appDataItem.id);
        if (appIndex !== -1) {
            this.appData[appIndex].unopened = false;
        }
        appDataItem.unopened = false;
        this.openedApps[appDataItem.id] = true;
        this._saveOpenedState();

        if (typeof anime === 'function' && appIconContainer) {
            anime({
                targets: appIconContainer,
                scale: [1, 1.1, 0.9, 1],
                rotate: [0, -5, 5, 0],
                duration: 500,
                easing: 'easeInOutQuad',
                complete: () => {
                    if (this.iconSystem && button) {
                        const sizeConfig = this.getCurrentSizeConfig();

                        const newIconOptions = {
                            ...appDataItem,
                            icon: appDataItem.actualIcon || appDataItem.icon,
                            unopened: false,
                            width: sizeConfig.iconSize,
                            height: sizeConfig.iconSize,
                            label: appDataItem.localizedLabel,
                            onClick: appDataItem.onClick
                        };

                        this.updateAfterAppReplacement(button.parentElement, newIconOptions);
                    }

                    if (onComplete) onComplete();
                }
            });
        } else {
            if (this.iconSystem && button) {
                const sizeConfig = this.getCurrentSizeConfig();
                const newIconOptions = {
                    ...appDataItem,
                    icon: appDataItem.actualIcon || appDataItem.icon,
                    unopened: false,
                    width: sizeConfig.iconSize,
                    height: sizeConfig.iconSize,
                    label: appDataItem.localizedLabel,
                    onClick: appDataItem.onClick
                };
                this.updateAfterAppReplacement(button.parentElement, newIconOptions);
            }
            if (onComplete) onComplete();
        }
    }

    async setAppData(newAppData) {
        this.appData = newAppData || [];
        this._processAppData();

        this.selection.selectedAppId = null;
        this.lastSelectedAppIdForAction = null;
        this._saveGridState();

        this.layoutPresets = this.createLayoutPresets();
        const preset = this.layoutPresets[this.currentLayout] || this.layoutPresets.default;
        this.buildGridFromPreset(preset);
        await this.applyCurrentSizeClass(false);

        this.bannerManager.clearBanner();
        if (this.topScreenStatusEl) { this.topScreenStatusEl.textContent = '' };

        const initialAppToLoad = this.appData.length > 0 ? this.appData[0] : null;
        if (initialAppToLoad) {
            // Check if loadBanner method exists before calling
            if (this.bannerManager && typeof this.bannerManager.loadBanner === 'function') {
            await this.bannerManager.loadBanner(initialAppToLoad);
            } else if (this.topScreen && typeof this.topScreen.loadBanner === 'function') {
                await this.topScreen.loadBanner(initialAppToLoad);
            }
            this.selectApp(initialAppToLoad.id);
        }

        requestAnimationFrame(() => {
            this.updateContainerRect();
            this.updateResponsiveLayout();
            this.setScrollPositionPercent(0);
            this.updateScrollPositionFromEvent();
        });
    }

    destroy() {
        if (this.animation) {
            this.animation.cleanup();
        }

        this.cleanupEventListeners();
        this.soundManager.destroy();
        this.uiManager.destroy();
        this.appData = [];
        this.scrollbar = null;
    }

    playSound(soundName) {
        this.soundManager.playSound(soundName);
    }

    setVolume(volume) {
        this.soundManager.setVolume(volume);
    }

    updateAssetUrls(newAssetUrls = {}) {
        this.assetUrls = { ...this.assetUrls, ...newAssetUrls };
        this.uiManager.injectStyles();
        this.soundManager.updateAssetUrls(newAssetUrls);

        if (this.selection.selectedAppId && newAssetUrls.selectionGlow) {
            const selectedIconWrapper = this.container.querySelector(`.app-icon[data-app-id="${this.selection.selectedAppId}"]`);
            if (selectedIconWrapper) {
                const glow = selectedIconWrapper.querySelector('.selection-glow');
                if (glow && glow.style.opacity === '1') {
                    if (glow.tagName === 'CANVAS') {
                        const sizeConfig = this.getCurrentSizeConfig();
                        this.renderSelectionGlow(glow, sizeConfig.iconSize);
                    }
                }
            }
        }
    }

    getCurrentSizeConfig() {
        const className = this.sizeClasses[this.currentSizeIndex];
        return this.sizeConfigurations[className];
    }

    changeIconSize(direction) {
        const oldIndex = this.currentSizeIndex;
        if (direction === 'decrease' && this.currentSizeIndex > 0) {
            this.currentSizeIndex--;
        } else if (direction === 'increase' && this.currentSizeIndex < this.sizeClasses.length - 1) {
            this.currentSizeIndex++;
        }
        if (oldIndex !== this.currentSizeIndex) {
            this._saveGridState();
        }
    }

    _saveAppOrder() {
        const appIds = this.appData.map(app => app.id);
        this.stateManager.saveAppOrder(appIds);
    }

    getPositionFromIndex(index) {
        const numRows = parseInt(this.container.style.getPropertyValue('--grid-rows')) || 1;
        return {
            row: index % numRows,
            col: Math.floor(index / numRows)
        };
    }

    getIndexFromPosition(row, col) {
        const numRows = parseInt(this.container.style.getPropertyValue('--grid-rows')) || 1;
        return (col * numRows) + row;
    }
}





























































































































