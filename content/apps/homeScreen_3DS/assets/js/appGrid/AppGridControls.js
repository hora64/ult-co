import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { getPermissionLevel, canViewApp, canLaunchApp } from '/content/common/utils/permissions.js';
import { topBarConfig, appsWithManuals } from '../../../config/config.js';

/**
 * AppGridControls - Manages size controls, action buttons, and top bar apps for the app grid
 * Provides UI controls for resizing icons, launching/unwrapping apps, and quick access top bar
 * @class
 */
export class AppGridControls extends UIComponent {
    /**
     * Creates a new AppGridControls instance
     * @param {Object} homeScreenApp - Reference to the parent HomeScreenApp instance
     */
    constructor(homeScreenApp) {
        super();
        this.homeScreenApp = homeScreenApp;
        this.appGrid = homeScreenApp.appGridInstance;
        this.bottomScreenWrapper = homeScreenApp.bottomScreenWrapper;
        this.assetUrls = this.appGrid.assetUrls;

        // Load top bar configuration
        this.topBarConfig = topBarConfig;

        // Size controls
        this.sizeControlsContainer = null;
        this.decreaseBtn = null;
        this.increaseBtn = null;
        
        // Action buttons
        this.openAppsButton = null;
        this.manualButton = null;
        this.buttonContainer = null;
        
        // Top bar components
        this.topBarElement = null;
        this.appButtons = [];
        this.selectedAppId = null;
        this.lastSelectedAppIdForAction = null;
        this.homeMenuButton = null;
        this.selectionGlowSprite = new Image();
        
        // Create a wrapper object for backward compatibility
        this.sizeControls = {
            element: null
        };

        // Load selection glow sprite from CSS variable
        const computedStyle = getComputedStyle(document.documentElement);
        const glowSpritePath = computedStyle.getPropertyValue('--hs-selection-glow-sprite').trim().replace(/^url\(['"]?|['"]?\)$/g, '') || '/content/common/themes/blackTheme/Select_128px.png';
        this.selectionGlowSprite.src = glowSpritePath;

        // Create a promise that resolves when initialization is complete
        this.isReady = new Promise((resolve) => {
            this.resolveReady = resolve;
        });

        this.init();
    }

    /**
     * Initializes the controls by creating all UI components
     * @async
     */
    async init() {
        try {
            await this.createSizeControls();
            this.createActionButtons();
            this.createTopBar();
            this.updateSizeButtonStates();
            this.setupKeyboardNavigation();
            this.resolveReady();
        } catch (error) {
            console.error('Failed to initialize AppGridControls:', error);
            this.resolveReady();
        }
    }

    /**
     * Loads app banner via TopScreen
     * This is the unified function for loading banners with proper jingle handling
     * Jingles are played by the banner modules (via BaseBanner), not here
     * @param {Object} app - The app to load banner for
     * @private
     */
    async loadAppBanner(app) {
        if (!app) {
            console.warn('[AppGridControls] loadAppBanner: No app provided');
            return;
        }
        
        console.log(`[AppGridControls] Loading banner for ${app.id}`);
        
        // Load banner via TopScreen - the banner module will handle jingle playing
        if (this.homeScreenApp.topScreen && typeof this.homeScreenApp.topScreen.loadBanner === 'function') {
            try {
                await this.homeScreenApp.topScreen.loadBanner(app);
                console.log(`[AppGridControls] Banner loaded successfully for ${app.id}`);
            } catch (error) {
                console.error(`[AppGridControls] Failed to load banner for ${app.id}:`, error);
            }
        }
    }

    /**
     * Sets up keyboard navigation for top bar apps
     * Top bar and main grid navigate independently - no auto-switching between them
     * @private
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle arrow keys when no input is focused
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            
            // Check if we're navigating top bar or main grid
            const isTopBarFocused = this.selectedAppId && this.appButtons.some(b => b.app.id === this.selectedAppId);
            // Check for both app selection AND empty tile selection in main grid
            const isMainGridFocused = this.appGrid && (this.appGrid.selectedAppId || this.appGrid.selectedEmptyTile);
            
            // Top bar navigation: Left/Right only
            if (isTopBarFocused && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                this.handleTopBarNavigation(e.key);
                return;
            }
            
            // Main grid navigation: Arrow keys
            if (isMainGridFocused && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                this.handleGridNavigation(e.key);
                return;
            }
            
            // If no selection and user presses arrow, select first top bar app
            if (!isTopBarFocused && !isMainGridFocused && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
                e.preventDefault();
                if (this.appButtons.length > 0) {
                    this.selectFirstTopBarApp();
                }
                return;
            }
            
            // Handle Enter/Space for launching
            if ((e.key === 'Enter' || e.key === ' ') && this.selectedAppId) {
                e.preventDefault();
                const selectedButton = this.appButtons.find(b => b.app.id === this.selectedAppId);
                if (selectedButton && typeof selectedButton.app.onClick === 'function') {
                    console.log('[AppGridControls] Keyboard launch:', this.selectedAppId);
                    selectedButton.app.onClick(selectedButton.app, null, this.homeScreenApp.languageData);
                }
            }
        });
    }
    
    /**
     * Handles navigation within the grid using arrow keys
     * Supports 2D navigation with column-based layout
     * Navigation stops at grid edges (no wrapping)
     * @param {string} key - The arrow key pressed
     * @private
     */
    handleGridNavigation(key) {
        if (!this.appGrid || !this.appGrid.selectedAppId) return;
        
        const currentPos = this.appGrid.findAppPosition2D(this.appGrid.selectedAppId);
        if (!currentPos) return;
        
        console.log('[AppGridControls] Grid navigation:', key, 'from position:', currentPos);
        
        const { row, col, totalRows, totalCols } = currentPos;
        let targetRow = row;
        let targetCol = col;
        
        switch (key) {
            case 'ArrowUp':
                // Move up one row (stop at top edge)
                if (row === 0) {
                    return; // At top edge, do nothing
                }
                targetRow = row - 1;
                
                // Check if target exists at same column
                let targetItem = this.appGrid.getAppIdAt(targetRow, targetCol);
                if (!targetItem) {
                    // Target position is empty, find last non-empty position in that row
                    for (let c = totalCols - 1; c >= 0; c--) {
                        if (this.appGrid.getAppIdAt(targetRow, c)) {
                            targetCol = c;
                            targetItem = this.appGrid.getAppIdAt(targetRow, c);
                            break;
                        }
                    }
                }
                break;
                
            case 'ArrowDown':
                // Move down one row (stop at bottom edge)
                if (row === totalRows - 1) {
                    return; // At bottom edge, do nothing
                }
                targetRow = row + 1;
                
                // Check if target exists at same column
                let downTargetItem = this.appGrid.getAppIdAt(targetRow, targetCol);
                if (!downTargetItem) {
                    // Target position is empty, find last non-empty position in that row
                    for (let c = totalCols - 1; c >= 0; c--) {
                        if (this.appGrid.getAppIdAt(targetRow, c)) {
                            targetCol = c;
                            downTargetItem = this.appGrid.getAppIdAt(targetRow, c);
                            break;
                        }
                    }
                }
                break;
                
            case 'ArrowLeft':
                // Move left one column (stop at left edge, no row wrapping)
                if (col === 0) {
                    return; // At left edge, do nothing
                }
                targetCol = col - 1;
                
                // Check if target position exists (not empty)
                const leftTargetItem = this.appGrid.getAppIdAt(targetRow, targetCol);
                if (!leftTargetItem) {
                    // Position is empty, continue searching left in same row
                    let found = false;
                    for (let c = targetCol - 1; c >= 0; c--) {
                        if (this.appGrid.getAppIdAt(targetRow, c)) {
                            targetCol = c;
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found) {
                        return; // No items to the left in this row
                    }
                }
                break;
                
            case 'ArrowRight':
                // Move right one column (stop at right edge, no row wrapping)
                if (col === totalCols - 1) {
                    return; // At right edge, do nothing
                }
                targetCol = col + 1;
                
                // Check if target position exists
                const rightTargetItem = this.appGrid.getAppIdAt(targetRow, targetCol);
                
                if (!rightTargetItem) {
                    // No item at target column, search right in same row
                    let found = false;
                    for (let c = targetCol + 1; c < totalCols; c++) {
                        if (this.appGrid.getAppIdAt(targetRow, c)) {
                            targetCol = c;
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found) {
                        return; // No items to the right in this row
                    }
                }
                break;
        }
        
        // Find app at target position
        const targetAppId = this.appGrid.getAppIdAt(targetRow, targetCol);
        if (targetAppId) {
            const targetApp = this.appGrid.appData.find(app => app.id === targetAppId);
            if (targetApp) {
                console.log('[AppGridControls] Navigating to:', targetApp.id, 'at', targetRow, targetCol);
                this.appGrid.selectApp(targetAppId, null, false);
                this.updateOpenButton(targetApp);
                
                // Load banner for the new selection
                this.loadAppBanner(targetApp);
            }
        } else {
            console.warn('[AppGridControls] No app found at target position:', targetRow, targetCol);
        }
    }
    
    /**
     * Handles navigation within the top bar apps
     * Navigation stops at edges (no wrapping)
     * @param {string} key - The arrow key pressed ('ArrowLeft' or 'ArrowRight')
     * @private
     */
    handleTopBarNavigation(key) {
        const currentIndex = this.appButtons.findIndex(b => b.app.id === this.selectedAppId);
        let newIndex = -1;
        
        if (key === 'ArrowLeft') {
            // Move to previous app (stop at first app)
            if (currentIndex === -1) {
                newIndex = this.appButtons.length - 1; // Select last
            } else if (currentIndex === 0) {
                return; // At first app, do nothing
            } else {
                newIndex = currentIndex - 1;
            }
        } else if (key === 'ArrowRight') {
            // Move to next app (stop at last app)
            if (currentIndex === -1) {
                newIndex = 0; // Select first
            } else if (currentIndex === this.appButtons.length - 1) {
                return; // At last app, do nothing
            } else {
                newIndex = currentIndex + 1;
            }
        }
        
        // Select the new app
        if (newIndex !== -1 && this.appButtons[newIndex]) {
            const newApp = this.appButtons[newIndex].app;
            console.log('[AppGridControls] Top bar keyboard navigation to:', newApp.id);
            
            // Load banner via unified function (jingle handled by banner module)
            this.loadAppBanner(newApp);
            
            this.selectTopBarApp(newApp.id);
        }
    }
    
    /**
     * Selects the first app in the top bar
     * @private
     */
    selectFirstTopBarApp() {
        if (this.appButtons.length > 0) {
            const firstApp = this.appButtons[0].app;
            console.log('[AppGridControls] Selecting first top bar app:', firstApp.id);
            
            // Load banner via unified function (jingle handled by banner module)
            this.loadAppBanner(firstApp);
            
            this.selectTopBarApp(firstApp.id);
        }
    }

    /**
     * Handles selection change from the grid
     * Updates top bar selection if the app exists there
     * @param {Object} app - The app that was selected in the grid
     */
    onGridSelectionChange(app) {
        if (!app) {
            console.log('[AppGridControls] onGridSelectionChange: No app provided');
            return;
        }
        
        console.log(`[AppGridControls] onGridSelectionChange: ${app.id}`);
        
        // ALWAYS load the banner for grid selections to ensure previous banner is cleared
        console.log(`[AppGridControls] Loading banner for grid selection: ${app.id}`);
        this.loadAppBanner(app);
        
        // ALWAYS update the action button for any grid selection
        this.updateOpenButton(app);
        
        // Check if this app exists in the top bar
        const topBarButton = this.appButtons.find(b => b.app.id === app.id);
        if (topBarButton) {
            // Select it in the top bar (without triggering grid selection again or reloading banner)
            // Pass false to skip banner load since we already loaded it above
            console.log(`[AppGridControls] App exists in top bar, syncing selection without banner reload`);
            this.selectTopBarApp(app.id, true, false); // Pass false to skip banner load
        } else {
            // Clear top bar selection since grid selected an app not in top bar
            console.log(`[AppGridControls] App not in top bar (subgrid app), clearing top bar selection`);
            this.clearTopBarSelection();
            
            // Still save the last selected app ID for subgrid apps
            this.selectedAppId = app.id;
            this.lastSelectedAppIdForAction = app.id;
            
            // Save to AppGrid state
            if (this.appGrid) {
                this.appGrid.selectedAppId = app.id;
                this.appGrid._saveGridState();
            }
        }
    }

    /**
     * Clears the top bar selection
     */
    clearTopBarSelection() {
        if (this.selectedAppId) {
            const button = this.appButtons.find(b => b.app.id === this.selectedAppId);
            if (button) {
                button.glowCanvas.style.opacity = '0';
            }
            this.selectedAppId = null;
            this.lastSelectedAppIdForAction = null;
        }
    }

    /**
     * Gets the currently selected top bar app
     * @returns {Object|null} The selected app data or null
     */
    getSelectedTopBarApp() {
        if (!this.selectedAppId) return null;
        const button = this.appButtons.find(b => b.app.id === this.selectedAppId);
        return button ? button.app : null;
    }

    /**
     * Selects an app in the top bar
     * @param {string} appId - The app ID to select
     * @param {boolean} [skipGridSync=false] - Skip syncing with grid
     * @param {boolean} [skipBannerLoad=false] - Skip loading banner
     */
    selectTopBarApp(appId, skipGridSync = false, skipBannerLoad = false) {
        // Clear previous selection glows
        this.appButtons.forEach(button => {
            if (button.glowCanvas) {
                button.glowCanvas.style.opacity = '0';
            }
        });
        
        // Find and select the new app
        const selectedButton = this.appButtons.find(b => b.app.id === appId);
        if (!selectedButton) {
            console.warn(`[AppGridControls] selectTopBarApp: App ${appId} not found in top bar`);
            return;
        }
        
        // Update selected app ID
        this.selectedAppId = appId;
        this.lastSelectedAppIdForAction = appId;
        
        // Draw selection glow
        this._drawSelectionGlow(selectedButton.glowCanvas);
        selectedButton.glowCanvas.style.opacity = '1';
        
        // Update the action button
        this.updateOpenButton(selectedButton.app);
        
        // CRITICAL FIX: Clear grid visual selection first, THEN sync selection state
        if (!skipGridSync && this.appGrid) {
            // First clear any grid selection glows
            const prevSelectedIconWrapper = this.appGrid.container.querySelector('.app-icon.selected');
            if (prevSelectedIconWrapper) {
                prevSelectedIconWrapper.classList.remove('selected');
                const prevGlow = prevSelectedIconWrapper.querySelector('.selection-glow');
                if (prevGlow) {
                    prevGlow.style.opacity = '0';
                    if (prevGlow.tagName === 'CANVAS') {
                        const ctx = prevGlow.getContext('2d');
                        ctx.clearRect(0, 0, prevGlow.width, prevGlow.height);
                    }
                }
            }
            
            // Clear empty tile selection
            if (this.appGrid.selectedEmptyTile) {
                const prevTile = this.appGrid.container.querySelector('.empty-tile-container.selected');
                if (prevTile) {
                    prevTile.classList.remove('selected');
                    const prevGlow = prevTile.querySelector('.empty-tile-glow');
                    if (prevGlow) {
                        prevGlow.style.opacity = '0';
                    }
                }
                this.appGrid.selectedEmptyTile = null;
            }
            
            // Now sync the selection state (but don't add the glow back since it's top bar only)
            const gridApp = this.appGrid.appData.find(app => app.id === appId);
            if (gridApp) {
                // Update grid's selectedAppId but without applying visual selection
                this.appGrid.selectedAppId = appId;
                this.appGrid._saveGridState();
                
                // Update scroll indicator to correct position
                const appPosition = this.appGrid.findAppPosition2D(appId);
                if (appPosition && this.appGrid.scrollbar) {
                    this.appGrid.scrollbar.setPositionByGrid(
                        appPosition.row,
                        appPosition.col,
                        appPosition.totalRows,
                        appPosition.totalCols
                    );
                }
            }
        }
        
        // Load banner if not skipped
        if (!skipBannerLoad) {
            this.loadAppBanner(selectedButton.app);
        }
    }

    /**
     * Draws selection glow on canvas
     * @param {HTMLCanvasElement} canvas - Canvas to draw on
     * @private
     */
    _drawSelectionGlow(canvas) {
        if (!canvas || !this.selectionGlowSprite) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        
        ctx.save();
        ctx.scale(dpr, dpr);
        
        const size = canvas.width / dpr;
        ctx.drawImage(this.selectionGlowSprite, 0, 0, size, size);
        
        ctx.restore();
    }
    
    /**
     * Updates unread count for an app
     * @param {string} appId - App ID
     * @param {number} count - Unread count
     */
    updateUnreadCount(appId, count) {
        const button = this.appButtons.find(b => b.app.id === appId);
        if (!button) return;
        
        button.app.unreadCount = count;
        
        if (count > 0) {
            this._showUnreadBadge(button.unreadBadge, count);
        } else {
            this._hideUnreadBadge(button.unreadBadge);
        }
    }
    
    /**
     * Shows unread badge
     * @private
     */
    _showUnreadBadge(badge, count) {
        if (!badge) return;
        
        badge.textContent = count > 99 ? '99+' : count.toString();
        badge.style.display = 'flex';
        badge.style.position = 'absolute';
        badge.style.top = '-4px';
        badge.style.right = '-4px';
        badge.style.minWidth = '12px';
        badge.style.height = '12px';
        badge.style.backgroundColor = '#ff4444';
        badge.style.color = 'white';
        badge.style.borderRadius = '6px';
        badge.style.fontSize = '8px';
        badge.style.fontWeight = 'bold';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.padding = '0 3px';
        badge.style.zIndex = '10';
        badge.style.pointerEvents = 'none';
    }
    
    /**
     * Hides unread badge
     * @private
     */
    _hideUnreadBadge(badge) {
        if (!badge) return;
        badge.style.display = 'none';
    }

    // ==================== TOP BAR METHODS ====================

    /**
     * Creates the unified controls bar (top bar apps + size controls)
     * This is the new recommended way to create controls
     * @returns {HTMLElement} The controls bar element
     */
    createUnifiedControlsBar() {
        const controlsBar = this.createElement('div', 'bottom-screen-controls-bar');
        
        // Left section (home menu)
        const leftSection = this.createElement('div', 'controls-bar-left');
        controlsBar.appendChild(leftSection);
        
        // Center section (top bar apps)
        const centerSection = this.createElement('div', 'controls-bar-center');
        this.topBarElement = centerSection; // Use center section as top bar element
        controlsBar.appendChild(centerSection);
        
        // Right section (size controls)
        const rightSection = this.createElement('div', 'controls-bar-right');
        controlsBar.appendChild(rightSection);
        
        return controlsBar;
    }

    /**
     * Creates the top bar container
     * @private
     */
    createTopBar() {
        this.topBarElement = this.createElement('div', 'bottom-screen-top-bar');
        this.topBarElement.style.display = 'flex';
        this.topBarElement.style.visibility = 'visible';
        this.topBarElement.style.opacity = '1';
        this.topBarElement.setAttribute('draggable', 'false');
        this.topBarElement.style.pointerEvents = 'auto';
    }

    /**
     * Creates the Home Menu Settings button on the top left
     * Uses CanvasButton with same settings as resize buttons
     * Button is always visible
     */
    async createHomeMenuButton() {
        const computedStyle = getComputedStyle(document.documentElement);
        const buttonBg = computedStyle.getPropertyValue('--hs-resize-button-bg').trim() || 'rgba(255, 255, 255, 0.1)';
        const hoverBg = computedStyle.getPropertyValue('--hs-resize-button-hover-bg').trim() || 'rgba(255, 255, 255, 0.2)';
        const pressedBg = computedStyle.getPropertyValue('--hs-resize-button-pressed-bg').trim() || 'rgba(255, 255, 255, 0.3)';
        const borderColor = computedStyle.getPropertyValue('--hs-resize-button-border').trim() || 'rgba(255, 255, 255, 0.3)';
        
        // Load settings icon sprite from CSS variable
        const settingsIconPath = computedStyle.getPropertyValue('--hs-settings-icon-sprite').trim().replace(/^url\(['"]?|['"]?\)$/g, '') || '/content/common/themes/blackTheme/Settings_64px.png';
        
        const menuIcon = new Image();
        menuIcon.crossOrigin = 'anonymous';
        menuIcon.src = settingsIconPath;
        
        // Wait for icon to load before creating button
        return new Promise((resolve) => {
            // Set timeout to create button even if icon fails
            const timeout = setTimeout(() => {
                console.warn('[AppGridControls] Settings icon load timeout, creating button without sprite');
                createButton(null);
            }, 3000);
            
            const createButton = (sprite) => {
                clearTimeout(timeout);
                
                const buttonConfig = {
                    x: 0,
                    y: 0,
                    width: 48,
                    height: 32,
                    borderRadius: [0, 0, 6, 0],
                    spriteScale: 0.5, // Scale 64px icon to fit 32px height
                    highlightDirection: 'bottom',
                    backgroundColor: buttonBg,
                    hoverBackgroundColor: hoverBg,
                    pressedBackgroundColor: pressedBg,
                    sideBorderColor: borderColor,
                    sideBorderWidth: 1,
                    sideBorderSides: 'right',
                    onClick: () => {
                        if (window.modalManager) {
                            window.modalManager.showInfoModal({
                                title: "Home Menu",
                                message: this.homeScreenApp.languageData?.messages?.featureNotAvailable || 'This feature is not yet available.',
                                onConfirm: () => {
                                    console.log('[AppGridControls] Home menu modal closed');
                                }
                            });
                        } else {
                            alert('Home Menu\n\nThis feature is not yet available.');
                        }
                    }
                };
                
                // Only add sprite if it loaded successfully
                if (sprite) {
                    buttonConfig.sprite = sprite;
                } else {
                    // Add text fallback if no sprite
                    buttonConfig.text = '?';
                    buttonConfig.textColor = 'white';
                    buttonConfig.font = 'bold 18px sans-serif';
                }
                
                this.homeMenuButton = new CanvasButton(buttonConfig);
                
                // Position the button absolutely
                this.homeMenuButton.element.style.position = 'absolute';
                this.homeMenuButton.element.style.left = '0px';
                this.homeMenuButton.element.style.top = '0px';
                this.homeMenuButton.element.style.zIndex = '15';
                this.homeMenuButton.element.style.pointerEvents = 'auto';
                
                console.log('[AppGridControls] Home menu button created successfully (always visible)');
                resolve(this.homeMenuButton.element);
            };
            
            menuIcon.onload = () => {
                console.log('[AppGridControls] Settings icon loaded successfully');
                createButton(menuIcon);
            };
            
            menuIcon.onerror = () => {
                console.error('[AppGridControls] Failed to load home menu icon, creating button without sprite');
                createButton(null);
            };
        });
    }

    /**
     * Creates app buttons for the top bar
     * Uses configuration from appLists.js to determine minimum icons and empty tile count
     * @param {Array} apps - Array of app data objects to display
     */
    createTopBarAppButtons(apps) {
        console.log('AppGridControls: Creating top bar buttons for apps:', apps);
        
        if (!this.topBarElement) {
            this.createTopBar();
        }
        
        this.topBarElement.innerHTML = '';
        this.appButtons = [];
        
        if (!apps || apps.length === 0) {
            console.warn('AppGridControls: No apps provided for top bar');
            return;
        }
        
        // Get user language for localization
        const userLanguage = localStorage.getItem('userLanguage') || 'en-US';
        
        // Create buttons for actual apps
        apps.forEach(app => {
            this._createTopBarAppButton(app, userLanguage);
        });
        
        // Calculate how many empty tiles to add based on config
        const emptyTileCount = this.topBarConfig.emptyTileCount || 0;
        const currentIconCount = apps.length + emptyTileCount;
        const minIconCount = this.topBarConfig.minIconCount || 5;
        
        // Ensure we meet the minimum icon count
        let tilesToAdd = emptyTileCount;
        if (currentIconCount < minIconCount) {
            tilesToAdd = minIconCount - apps.length;
        }
        
        console.log(`[AppGridControls] Top bar config: minIconCount=${minIconCount}, apps=${apps.length}, emptyTiles=${tilesToAdd}`);
        
        // Add empty tiles
        for (let i = 0; i < tilesToAdd; i++) {
            this._createTopBarEmptyTile();
        }
        
        console.log(`AppGridControls: Created ${this.appButtons.length} top bar buttons + ${tilesToAdd} empty tiles (total: ${this.appButtons.length + tilesToAdd} icons)`);
    }

    /**
     * Creates a single app button for the top bar
     * @param {Object} app - App data object
     * @param {string} userLanguage - User's language preference
     * @private
     */
    _createTopBarAppButton(app, userLanguage) {
        // FORCE top bar apps to always be opened (not wrapped)
        app.unopened = false;
        app._isTopBar = true;
        
        // Ensure localizedLabel and localizedDescription are set for top bar apps
        if (!app.localizedLabel && app.locales) {
            if (app.locales[userLanguage] && app.locales[userLanguage].label) {
                app.localizedLabel = app.locales[userLanguage].label;
            } else if (app.locales['en-US'] && app.locales['en-US'].label) {
                app.localizedLabel = app.locales['en-US'].label;
            }
        }
        
        if (!app.localizedDescription && app.locales) {
            if (app.locales[userLanguage] && app.locales[userLanguage].description) {
                app.localizedDescription = app.locales[userLanguage].description;
            } else if (app.locales['en-US'] && app.locales['en-US'].description) {
                app.localizedDescription = app.locales['en-US'].description;
            }
        }
        
        const buttonSize = 24;
        const glowSize = Math.ceil(buttonSize * 1.15);
        
        const buttonWrapper = this.createElement('div', 'top-bar-app-button');
        buttonWrapper.setAttribute('draggable', 'false');
        buttonWrapper.setAttribute('data-app-id', app.id);
        buttonWrapper.style.position = 'relative';
        buttonWrapper.style.width = `${buttonSize}px`;
        buttonWrapper.style.height = `${buttonSize}px`;
        buttonWrapper.style.cursor = 'pointer';
        buttonWrapper.style.display = 'block';
        
        const glowCanvas = document.createElement('canvas');
        glowCanvas.className = 'top-bar-selection-glow';
        const dpr = window.devicePixelRatio || 1;
        glowCanvas.width = glowSize * dpr;
        glowCanvas.height = glowSize * dpr;
        glowCanvas.style.width = `${glowSize}px`;
        glowCanvas.style.height = `${glowSize}px`;
        glowCanvas.style.position = 'absolute';
        // Center the glow perfectly around the icon
        const glowOffset = (glowSize - buttonSize) / 2;
        glowCanvas.style.left = `${-glowOffset}px`;
        glowCanvas.style.top = `${-glowOffset}px`;
        glowCanvas.style.opacity = '0';
        glowCanvas.style.pointerEvents = 'none';
        glowCanvas.style.transition = 'opacity 0.2s ease';
        glowCanvas.style.imageRendering = 'pixelated';
        
        buttonWrapper.appendChild(glowCanvas);
        
        const canvas = document.createElement('canvas');
        canvas.width = buttonSize * dpr;
        canvas.height = buttonSize * dpr;
        canvas.style.display = 'block';
        canvas.style.imageRendering = 'pixelated';
        canvas.style.width = `${buttonSize}px`;
        canvas.style.height = `${buttonSize}px`;
        canvas.style.position = 'relative';
        canvas.style.zIndex = '1';
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        const iconImg = new Image();
        iconImg.crossOrigin = 'anonymous';
        
        iconImg.onload = () => {
            console.log(`AppGridControls: Icon loaded for ${app.id}`);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.drawImage(iconImg, 0, 0, buttonSize, buttonSize);
            ctx.restore();
        };
        
        iconImg.onerror = (error) => {
            console.error(`AppGridControls: Failed to load icon for ${app.id}:`, error);
            // Fallback: draw a simple text indicator without background
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const firstLetter = app.localizedLabel ? app.localizedLabel[0] : (app.label ? app.label[0] : '?');
            ctx.fillText(firstLetter, buttonSize / 2, buttonSize / 2);
            ctx.restore();
        };
        
        const iconPath = app.actualIcon || app.icon || app.baseIcon || '/content/common/assets/BlankApp_64px.png';
        console.log(`AppGridControls: Loading 24px icon for ${app.id} from ${iconPath}`);
        iconImg.src = iconPath;
        
        buttonWrapper.appendChild(canvas);
        
        buttonWrapper.addEventListener('click', (e) => {
            console.log(`[AppGridControls] Clicked ${app.id}`);
            const wasSelectedBeforeClick = this.selectedAppId === app.id;
            
            // Load banner via unified function
            console.log(`[AppGridControls] Loading banner for ${app.id}`);
            this.loadAppBanner(app);
            
            this.selectTopBarApp(app.id);
            
            // Handle double-click to launch
            if (wasSelectedBeforeClick && this.lastSelectedAppIdForAction === app.id) {
                console.log(`[AppGridControls] Double-click detected, launching ${app.id}`);
                if (typeof app.onClick === 'function') {
                    app.onClick(app, null, this.homeScreenApp.languageData);
                }
                this.lastSelectedAppIdForAction = null;
            } else {
                this.lastSelectedAppIdForAction = app.id;
            }
        });
        
        buttonWrapper.addEventListener('mouseenter', () => {
            if (this.selectedAppId !== app.id) {
                canvas.style.opacity = '0.8';
            }
        });
        
        buttonWrapper.addEventListener('mouseleave', () => {
            canvas.style.opacity = '1';
        });
        
        buttonWrapper.addEventListener('dragstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        const unreadBadge = this.createElement('div', 'unread-indicator-badge');
        unreadBadge.style.display = 'none';
        buttonWrapper.appendChild(unreadBadge);
        
        if (app.unreadCount && app.unreadCount > 0) {
            this._showUnreadBadge(unreadBadge, app.unreadCount);
        }
        
        this.topBarElement.appendChild(buttonWrapper);
        this.appButtons.push({ app, buttonWrapper, canvas, iconImg, glowCanvas, unreadBadge });
        
        console.log(`AppGridControls: Added 24px button for ${app.id}`);
    }

    /**
     * Creates an empty tile for the top bar
     * Similar to grid empty tiles but smaller (6px = 25% of 24px button size)
     * @private
     */
    _createTopBarEmptyTile() {
        const buttonSize = 24;
        const tileSize = 6; // 25% of 24px (same ratio as grid: 10px = 25% of 40px)
        const glowSize = Math.ceil(buttonSize * 1.15);
        
        const tileWrapper = this.createElement('div', 'top-bar-empty-tile');
        tileWrapper.setAttribute('draggable', 'false');
        tileWrapper.style.position = 'relative';
        tileWrapper.style.width = `${buttonSize}px`;
        tileWrapper.style.height = `${buttonSize}px`;
        tileWrapper.style.cursor = 'pointer';
        tileWrapper.style.display = 'flex';
        tileWrapper.style.alignItems = 'center';
        tileWrapper.style.justifyContent = 'center';
        tileWrapper.style.opacity = '0.5';
        tileWrapper.style.transition = 'opacity 0.2s ease-out';
        
        // Create selection glow (same size as app buttons for consistency)
        const glowCanvas = document.createElement('canvas');
        glowCanvas.className = 'top-bar-empty-tile-glow';
        const dpr = window.devicePixelRatio || 1;
        glowCanvas.width = glowSize * dpr;
        glowCanvas.height = glowSize * dpr;
        glowCanvas.style.width = `${glowSize}px`;
        glowCanvas.style.height = `${glowSize}px`;
        glowCanvas.style.position = 'absolute';
        const glowOffset = (glowSize - buttonSize) / 2;
        glowCanvas.style.left = `${-glowOffset}px`;
        glowCanvas.style.top = `${-glowOffset}px`;
        glowCanvas.style.opacity = '0';
        glowCanvas.style.pointerEvents = 'none';
        glowCanvas.style.transition = 'opacity 0.2s ease';
        glowCanvas.style.imageRendering = 'pixelated';
        glowCanvas.style.zIndex = '0';
        
        tileWrapper.appendChild(glowCanvas);
        
        // Create the small empty tile canvas
        const tileCanvas = document.createElement('canvas');
        tileCanvas.className = 'top-bar-empty-tile-canvas';
        tileCanvas.width = tileSize * dpr;
        tileCanvas.height = tileSize * dpr;
        tileCanvas.style.width = `${tileSize}px`;
        tileCanvas.style.height = `${tileSize}px`;
        tileCanvas.style.display = 'block';
        tileCanvas.style.imageRendering = 'pixelated';
        tileCanvas.style.position = 'relative';
        tileCanvas.style.zIndex = '1';
        
        // Draw the empty tile
        this._renderTopBarEmptyTile(tileCanvas, tileSize);
        
        tileWrapper.appendChild(tileCanvas);
        
        // Add hover effect
        tileWrapper.addEventListener('mouseenter', () => {
            tileWrapper.style.opacity = '0.8';
            tileCanvas.style.filter = 'brightness(1.2)';
        });
        
        tileWrapper.addEventListener('mouseleave', () => {
            tileWrapper.style.opacity = '0.5';
            tileCanvas.style.filter = 'brightness(1)';
        });
        
        // Add click handler (placeholder for now)
        tileWrapper.addEventListener('click', () => {
            console.log('[AppGridControls] Top bar empty tile clicked');
            // Show info modal that feature is not implemented
            if (window.modalManager) {
                window.modalManager.showInfoModal({
                    title: 'Create Folder',
                    message: 'This feature is not implemented yet.',
                    onConfirm: () => {
                        console.log('[AppGridControls] Empty tile modal closed');
                    }
                });
            } else {
                alert('Create Folder\n\nThis feature is not implemented yet.');
            }
        });
        
        tileWrapper.addEventListener('dragstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        this.topBarElement.appendChild(tileWrapper);
    }

    /**
     * Renders an empty tile on a canvas (for top bar)
     * @param {HTMLCanvasElement} canvas - The canvas to draw on
     * @param {number} size - The size of the tile
     * @private
     */
    _renderTopBarEmptyTile(canvas, size) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        
        ctx.save();
        ctx.scale(dpr, dpr);
        
        // Get CSS variable values
        const computedStyle = getComputedStyle(document.documentElement);
        const useSprite = computedStyle.getPropertyValue('--empty-tile-use-sprite').trim() === 'true';
        const spritePath = computedStyle.getPropertyValue('--empty-tile-sprite').trim().replace(/^url\(['"]?|['"]?\)$/g, '');
        
        if (useSprite && spritePath) {
            // Use sprite image
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, size, size);
            };
            img.onerror = () => {
                console.warn('[AppGridControls] Empty tile sprite failed to load, using fallback');
                this._drawEmptyTileFallback(ctx, size, computedStyle);
            };
            img.src = spritePath;
        } else {
            // Use drawn tile (default)
            this._drawEmptyTileFallback(ctx, size, computedStyle);
        }
        
        ctx.restore();
    }

    /**
     * Draws fallback empty tile when sprite is not available
     * @private
     */
    _drawEmptyTileFallback(ctx, size, computedStyle) {
        const fillColor = computedStyle.getPropertyValue('--empty-tile-color').trim() || 'rgba(255, 255, 255, 0.08)';
        const borderColor = computedStyle.getPropertyValue('--empty-tile-border').trim() || 'rgba(255, 255, 255, 0.15)';
        
        // Draw rounded square
        const x = 0;
        const y = 0;
        const radius = size * 0.15; // 15% border radius
        
        // Draw rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.arcTo(x + size, y, x + size, y + radius, radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.arcTo(x + size, y + size, x + size - radius, y + size, radius);
        ctx.lineTo(x + radius, y + size);
        ctx.arcTo(x, y + size, x, y + size - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        
        // Fill with semi-transparent color
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    /**
     * Creates size control buttons (increase/decrease icon size)
     * Loads sprites from CSS variables and sets up event handlers
     * @async
     */
    async createSizeControls() {
        // Create a container for size controls
        this.sizeControlsContainer = document.createElement('div');
        this.sizeControlsContainer.className = 'appgrid-size-controls';
        
        // Set the element reference for backward compatibility
        this.sizeControls.element = this.sizeControlsContainer;

        // Get CSS variables for sprite paths
        const computedStyle = getComputedStyle(document.documentElement);
        const decreaseSpritePath = computedStyle.getPropertyValue('--hs-resize-decrease-sprite').trim().replace(/^url\(['"]?|['"]?\)$/g, '') || '/content/common/assets/resizeDownFlat_32px.png';
        const increaseSpritePath = computedStyle.getPropertyValue('--hs-resize-increase-sprite').trim().replace(/^url\(['"]?|['"]?\)$/g, '') || '/content/common/assets/resizeUpFlat_32px.png';

        // Load the resize icons with proper preloading
        const decreaseIcon = new Image();
        const increaseIcon = new Image();
        
        // Set crossOrigin before src to avoid CORS issues
        decreaseIcon.crossOrigin = 'anonymous';
        increaseIcon.crossOrigin = 'anonymous';

        // Create promises for image loading
        const decreaseIconLoaded = new Promise((resolve, reject) => {
            decreaseIcon.onload = resolve;
            decreaseIcon.onerror = reject;
        });

        const increaseIconLoaded = new Promise((resolve, reject) => {
            increaseIcon.onload = resolve;
            increaseIcon.onerror = reject;
        });

        // Start loading images
        decreaseIcon.src = decreaseSpritePath;
        increaseIcon.src = increaseSpritePath;

        // Wait for both images to load
        try {
            await Promise.all([decreaseIconLoaded, increaseIconLoaded]);
        } catch (error) {
            console.error('Failed to load resize icons:', error);
        }

        // Get button colors from CSS variables
        const buttonBg = computedStyle.getPropertyValue('--hs-resize-button-bg').trim() || 'var(--button-bg)';
        const hoverBg = computedStyle.getPropertyValue('--hs-resize-button-hover-bg').trim() || 'var(--button-hover-bg)';
        const pressedBg = computedStyle.getPropertyValue('--hs-resize-button-pressed-bg').trim() || 'var(--button-pressed-bg)';
        const disabledBg = computedStyle.getPropertyValue('--hs-resize-button-disabled-bg').trim() || 'var(--button-disabled-bg)';

        this.increaseBtn = new CanvasButton({
            x: 272,
            y: 0,
            width: 32,
            height: 32,
            borderRadius: [0, 0, 0, 0],
            sprite: increaseIcon,
            spriteScale: 0.8,
            highlightDirection: 'bottom',
            backgroundColor: buttonBg,
            hoverBackgroundColor: hoverBg,
            pressedBackgroundColor: pressedBg,
            disabledBackgroundColor: disabledBg,
            sideBorderColor: 'rgba(255, 255, 255, 0.3)',
            sideBorderWidth: 1,
            sideBorderSides: 'left',
            onClick: () => {
                if (this.increaseBtn.isDisabled) return;
                this.appGrid.increaseIconSize();
                // Update button states after size change
                setTimeout(() => this.updateSizeButtonStates(), 50);
            }
        });
        this.decreaseBtn = new CanvasButton({
            x: 296,
            y: 0,
            width: 32,
            height: 32,
            borderRadius: [0, 0, 0, 6],
            sprite: decreaseIcon,
            spriteScale: 0.8,
            highlightDirection: 'bottom',
            backgroundColor: buttonBg,
            hoverBackgroundColor: hoverBg,
            pressedBackgroundColor: pressedBg,
            disabledBackgroundColor: disabledBg,
            sideBorderColor: 'rgba(255, 255, 255, 0.3)',
            sideBorderWidth: 1,
            sideBorderSides: 'left',
            onClick: () => {
                if (this.decreaseBtn.isDisabled) return;
                this.appGrid.decreaseIconSize();
                // Update button states after size change
                setTimeout(() => this.updateSizeButtonStates(), 50);
            }
        });

        // Add buttons to the container
        this.sizeControlsContainer.appendChild(this.decreaseBtn.element);
        this.sizeControlsContainer.appendChild(this.increaseBtn.element);

        // Append to bottomScreenWrapper or appropriate parent
        if (this.bottomScreenWrapper) {
            this.bottomScreenWrapper.appendChild(this.sizeControlsContainer);
        }
    }

    /**
     * Updates the enabled/disabled state of size buttons based on current size
     * Disables buttons when at min/max size
     */
    updateSizeButtonStates() {
        if (!this.appGrid || !this.decreaseBtn || !this.increaseBtn) return;

        const currentSizeIndex = this.appGrid.currentSizeIndex;
        const maxSizeIndex = this.appGrid.sizeClasses.length - 1;
        const minSizeIndex = 0;

        // Disable decrease button if at minimum size
        this.decreaseBtn.isDisabled = currentSizeIndex <= minSizeIndex;
        
        // Disable increase button if at maximum size
        this.increaseBtn.isDisabled = currentSizeIndex >= maxSizeIndex;
    }

    /**
     * Checks if user can unwrap an app based on permissions
     * @param {Object} app - The app to check
     * @returns {boolean} True if user can unwrap the app
     * @private
     */
    _canUnwrapApp(app) {
        if (!canViewApp(app)) {
            return false;
        }
        return app.permissions?.unwrappable !== false;
    }

    /**
     * Updates the open button based on selected app state
     * Changes button text, layout, and disabled state based on app properties
     * Also applies color overrides if app provides actionButtonColors
     * @param {Object} app - The currently selected app (or empty tile data object)
     */
    updateOpenButton(app) {
        if (!this.openAppsButton || !app) return;

        // Check if this is an empty tile
        const isEmptyTile = app._isEmptyTile === true;
        
        // Apply action button color overrides if app provides them
        if (!isEmptyTile && app.actionButtonColors) {
            this._applyActionButtonColors(app.actionButtonColors);
        } else {
            // Reset to default colors from CSS variables
            this._resetActionButtonColors();
        }
        
        if (isEmptyTile) {
            // Empty tile selected - show "Create Folder" button, hide manual button
            const newText = this.homeScreenApp.t('createFolder') || 'Create Folder';
            const currentText = this.openAppsButton._getCurrentText();
            const textChanged = newText !== currentText;
            
            // Empty tile button is never disabled but shows info modal
            this.openAppsButton.isDisabled = false;
            
            // Single full-width button for empty tiles
            const currentHasManual = this.manualButton.element.style.display !== 'none';
            const layoutChanged = currentHasManual; // Layout changes if manual was visible
            
            // Update button click handler for empty tiles
            if (!this.openAppsButton._originalOnClick) {
                this.openAppsButton._originalOnClick = this.openAppsButton.onClick;
            }
            
            this.openAppsButton.onClick = () => {
                console.log('[AppGridControls] Create Folder clicked for empty tile');
                // Show info modal that feature is not implemented
                if (window.modalManager) {
                    window.modalManager.showInfoModal({
                        title: newText,
                        message: 'This feature is not implemented yet.',
                        onConfirm: () => {
                            console.log('[AppGridControls] Create Folder modal closed');
                        }
                    });
                } else {
                    alert('Create Folder\n\nThis feature is not implemented yet.');
                }
            };
            
            if (layoutChanged || textChanged) {
                this.updateButtonLayout(false, false, true, textChanged ? newText : null);
            }
            return;
        }
        
        // Restore original onClick handler if we were on empty tile before
        if (this.openAppsButton._originalOnClick) {
            this.openAppsButton.onClick = this.openAppsButton._originalOnClick;
            delete this.openAppsButton._originalOnClick;
        }

        // Regular app logic continues below
        const isUnopened = app.unopened;
        const hasManual = this._appHasManual(app);
        
        // Check permissions based on whether app is opened or unopened
        const isDisabled = isUnopened 
            ? !this._canUnwrapApp(app)
            : !canLaunchApp(app);
        
        // Determine text for open button
        const newText = isUnopened ? this.homeScreenApp.t('unwrap') : this.homeScreenApp.t('open');
        const currentText = this.openAppsButton._getCurrentText();
        
        // Check if we're transitioning to the same state
        const currentIsDisabled = this.openAppsButton.isDisabled;
        const currentHasManual = this.manualButton.element.style.display !== 'none';
        const currentIsUnopened = currentText === this.homeScreenApp.t('unwrap');
        
        // Determine if layout actually changed
        const layoutChanged = (hasManual !== currentHasManual) || 
                              (isUnopened !== currentIsUnopened);
        
        // Determine if textChanged
        const textChanged = newText !== currentText;

        // Update disabled state based on permissions
        this.openAppsButton.isDisabled = isDisabled;
        
        // Log reason if app is disabled
        if (isDisabled) {
            const level = app.permissions?.level ?? 0;
            const currentLevel = getPermissionLevel();
            if (currentLevel < level) {
                console.log(`App ${app.id} requires permission level ${level}, current level is ${currentLevel}`);
            }
        }
        
        // If both layout and text need to change, do them together in one animation
        // If only one needs to change, animate that one
        if (layoutChanged || textChanged) {
            this.updateButtonLayout(isUnopened, hasManual, true, textChanged ? newText : null);
        }
    }

    /**
     * Checks if an app has a manual article available
     * Uses the centralized list from appLists.js
     * @param {Object} app - The app to check
     * @returns {boolean} True if app has a manual
     * @private
     */
    _appHasManual(app) {
        return appsWithManuals.includes(app.id);
    }

    /**
     * Applies action button color overrides from app configuration
     * @param {Object} colors - Color override object with backgroundColor, hoverBackgroundColor, etc.
     * @private
     */
    _applyActionButtonColors(colors) {
        if (!colors || !this.openAppsButton) return;
        
        const buttonSettings = {};
        
        if (colors.backgroundColor) {
            buttonSettings.backgroundColor = colors.backgroundColor;
        }
        if (colors.hoverBackgroundColor) {
            buttonSettings.hoverBackgroundColor = colors.hoverBackgroundColor;
        }
        if (colors.pressedBackgroundColor) {
            buttonSettings.pressedBackgroundColor = colors.pressedBackgroundColor;
        }
        if (colors.disabledBackgroundColor) {
            buttonSettings.disabledBackgroundColor = colors.disabledBackgroundColor;
        }
        if (colors.textColor) {
            buttonSettings.textColor = colors.textColor;
        }
        
        // Apply to both open and manual buttons
        this.openAppsButton.setSettings(buttonSettings);
        this.openAppsButton.draw();
        
        if (this.manualButton && this.manualButton.element.style.display !== 'none') {
            this.manualButton.setSettings(buttonSettings);
            this.manualButton.draw();
        }
    }

    /**
     * Resets action button colors to defaults from CSS variables
     * @private
     */
    _resetActionButtonColors() {
        if (!this.openAppsButton) return;
        
        const computedStyle = getComputedStyle(document.documentElement);
        
        const defaultSettings = {
            backgroundColor: computedStyle.getPropertyValue('--hs-action-button-bg').trim() || 'var(--hs-button-bg)',
            hoverBackgroundColor: computedStyle.getPropertyValue('--hs-action-button-hover-bg').trim() || 'var(--hs-button-hover-bg)',
            pressedBackgroundColor: computedStyle.getPropertyValue('--hs-action-button-pressed-bg').trim() || 'var(--hs-button-pressed-bg)',
            disabledBackgroundColor: computedStyle.getPropertyValue('--hs-action-button-disabled-bg').trim() || 'var(--hs-button-disabled-bg)',
            textColor: computedStyle.getPropertyValue('--hs-action-button-text-color').trim() || 'white'
        };
        
        this.openAppsButton.setSettings(defaultSettings);
        this.openAppsButton.draw();
        
        if (this.manualButton && this.manualButton.element.style.display !== 'none') {
            this.manualButton.setSettings(defaultSettings);
            this.manualButton.draw();
        }
    }

    /**
     * Updates button layout based on app state (unopened, has manual, etc.)
     * Adjusts button widths and visibility
     * @param {boolean} isUnopened - Whether the app is unopened
     * @param {boolean} hasManual - Whether the app has a manual
     * @param {boolean} [shouldAnimate=true] - Whether to animate the transition
     * @param {string|null} [newText=null] - New text for the open button
     */
    updateButtonLayout(isUnopened, hasManual, shouldAnimate = true, newText = null) {
        const duration = 300;
        const easing = 'easeOutCubic';

        // Case 1: Unopened app - show full-width unwrap button
        if (isUnopened) {
            if (shouldAnimate) {
                this._animateButtonTransition(() => {
                    if (newText) {
                        this.openAppsButton.setText(newText);
                    }
                    this.openAppsButton.setSettings({ width: 320 });
                    this.openAppsButton.borderRadius = [12, 12, 0, 0];
                    this.openAppsButton.sideBorderSides = null;
                    this.openAppsButton.draw();
                    this.manualButton.element.style.display = 'none';
                }, duration, easing);
            } else {
                if (newText) {
                    this.openAppsButton.setText(newText);
                }
                this.openAppsButton.setSettings({ width: 320 });
                this.openAppsButton.borderRadius = [12, 12, 0, 0];
                this.openAppsButton.sideBorderSides = null;
                this.openAppsButton.draw();
                this.manualButton.element.style.display = 'none';
            }
        } 
        // Case 2: No manual - show full-width open button
        else if (!hasManual) {
            if (shouldAnimate) {
                this._animateButtonTransition(() => {
                    if (newText) {
                        this.openAppsButton.setText(newText);
                    }
                    this.openAppsButton.setSettings({ width: 320 });
                    this.openAppsButton.borderRadius = [12, 12, 0, 0];
                    this.openAppsButton.sideBorderSides = null;
                    this.openAppsButton.draw();
                    this.manualButton.element.style.display = 'none';
                }, duration, easing);
            } else {
                if (newText) {
                    this.openAppsButton.setText(newText);
                }
                this.openAppsButton.setSettings({ width: 320 });
                this.openAppsButton.borderRadius = [12, 12, 0, 0];
                this.openAppsButton.sideBorderSides = null;
                this.openAppsButton.draw();
                this.manualButton.element.style.display = 'none';
            }
        } 
        // Case 3: Has manual and not unopened - show split layout (240px open + 80px manual)
        else {
            if (shouldAnimate) {
                this._animateButtonTransition(() => {
                    if (newText) {
                        this.openAppsButton.setText(newText);
                    }
                    this.openAppsButton.setSettings({ width: 240 });
                    this.openAppsButton.borderRadius = [12, 0, 0, 0];
                    this.openAppsButton.sideBorderSides = 'right';
                    this.openAppsButton.draw();
                    
                    this.manualButton.setSettings({ width: 80 });
                    this.manualButton.borderRadius = [0, 12, 0, 0];
                    this.manualButton.draw();
                    this.manualButton.element.style.display = 'block';
                }, duration, easing);
            } else {
                if (newText) {
                    this.openAppsButton.setText(newText);
                }
                this.openAppsButton.setSettings({ width: 240 });
                this.openAppsButton.borderRadius = [12, 0, 0, 0];
                this.openAppsButton.sideBorderSides = 'right';
                this.openAppsButton.draw();
                
                this.manualButton.setSettings({ width: 80 });
                this.manualButton.borderRadius = [0, 12, 0, 0];
                this.manualButton.draw();
                this.manualButton.element.style.display = 'block';
            }
        }
    }

    /**
     * Animates button transitions with slide down and up effects
     * Uses CSS transitions instead of anime.js
     * @param {Function} callback - Function to call when applying layout changes
     * @param {number} [duration=300] - Animation duration in milliseconds
     * @param {string} [easing='ease-out'] - CSS easing function
     * @private
     */
    _animateButtonTransition(callback, duration = 300, easing = 'ease-out') {
        // Add CSS transition
        this.buttonContainer.style.transition = `transform ${duration / 2}ms cubic-bezier(0.4, 0, 1, 1), opacity ${duration / 2}ms cubic-bezier(0.4, 0, 1, 1)`;
        // Slide down
        this.buttonContainer.style.transform = 'translateY(50px)';
        this.buttonContainer.style.opacity = '0';
        
        setTimeout(() => {
            // Apply layout changes
            callback();
            
            // Change transition for slide up
            this.buttonContainer.style.transition = `transform ${duration / 2}ms ${easing}, opacity ${duration / 2}ms ${easing}`;
            
            // Slide up
            this.buttonContainer.style.transform = 'translateY(0)';
            this.buttonContainer.style.opacity = '1';
            
            // Clean up transition after animation
            setTimeout(() => {
                this.buttonContainer.style.transition = '';
            }, duration / 2);
        }, duration / 2);
    }

    /**
     * Creates action buttons (Open/Unwrap and Manual)
     * Sets up click handlers and initial layout
     */
    createActionButtons() {
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'buttonContainer';
        this.buttonContainer.style.display = 'flex';
        this.buttonContainer.style.justifyContent = 'center';
        this.buttonContainer.style.gap = '0px';
        this.buttonContainer.style.position = 'relative';
        
        // Apply action bar styling from CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const barBg = computedStyle.getPropertyValue('--action-bar-bg').trim() || 'transparent';
        const barBorder = computedStyle.getPropertyValue('--action-bar-border').trim() || 'transparent';
        const gradientEnabled = computedStyle.getPropertyValue('--action-bar-gradient-enabled').trim() === 'true';
        
        this.buttonContainer.style.background = barBg;
        this.buttonContainer.style.border = barBorder;
        
        if (gradientEnabled) {
            const gradientStart = computedStyle.getPropertyValue('--action-bar-gradient-start').trim() || 'rgba(0, 0, 0, 0.2)';
            const gradientEnd = computedStyle.getPropertyValue('--action-bar-gradient-end').trim() || 'rgba(0, 0, 0, 0.1)';
            this.buttonContainer.style.background = `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`;
        }

        this.openAppsButton = new CanvasButton({
            text: this.homeScreenApp.t('open'),
            width: 240,
            height: 32,
            borderRadius: [12,0,0,0],
            textColor: 'white',
            font: 'bold 16px "Rodin", sans-serif',
            backgroundColor: 'var(--hs-button-bg)',
            hoverBackgroundColor: 'var(--hs-button-hover-bg)',
            pressedBackgroundColor: 'var(--hs-button-pressed-bg)',
            sideBorderColor: 'rgba(255, 255, 255, 0.3)',
            sideBorderWidth: 1,
            sideBorderSides: 'right',
            moveOnPress: true,
            onClick: () => {
                // Check if a top bar app is selected
                const topBarApp = this.selectedAppId ? 
                    this.appButtons.find(b => b.app.id === this.selectedAppId)?.app : null;
                
                // Check if a grid app is selected
                const gridApp = this.appGrid?.selectedAppId ? 
                    this.appGrid.appData.find(app => app.id === this.appGrid.selectedAppId) : null;
                
                // Prefer top bar app if both are selected
                const selectedApp = topBarApp || gridApp;
                
                if (selectedApp) {
                    if (selectedApp.unopened) {
                        // For unopened apps, we need to trigger the unwrap
                        console.log('[AppGridControls] Action button unwrap for:', selectedApp.id);
                        
                        // DON'T reset lastSelectedAppIdForAction here - only reset after successful unwrap
                        
                        // Try to find the app in the grid first
                        if (this.appGrid) {
                            const appContainer = this.appGrid.container.querySelector(`[data-app-id="${selectedApp.id}"]`);
                            if (appContainer) {
                                const button = appContainer.querySelector('.app-button');
                                if (button) {
                                    // Trigger the same click event as clicking the app icon
                                    console.log('[AppGridControls] Triggering click on grid button');
                                    button.click();
                                    return;
                                }
                            }
                        }
                        
                        // If not in grid, call handleUnopenedClick directly via iconSystem
                        if (this.appGrid?.iconSystem && typeof this.appGrid.iconSystem.handleUnopenedClick === 'function') {
                            // Create a synthetic event object
                            const syntheticEvent = {
                                currentTarget: null,
                                preventDefault: () => {},
                                stopPropagation: () => {}
                            };
                            
                            console.log('[AppGridControls] Triggering unwrap via iconSystem for:', selectedApp.id);
                            this.appGrid.iconSystem.handleUnopenedClick(
                                syntheticEvent, 
                                selectedApp, 
                                this.appGrid,
                                this.homeScreenApp.languageData,
                                (unwrappedApp) => {
                                    console.log('[AppGridControls] Unwrap complete:', unwrappedApp.id);
                                    // Update the app data
                                    selectedApp.unopened = false;
                                    // Reset lastSelectedAppIdForAction after successful unwrap
                                    if (this.appGrid) {
                                        this.appGrid.lastSelectedAppIdForAction = null;
                                    }
                                    this.lastSelectedAppIdForAction = null;
                                    // Refresh the action button
                                    this.updateOpenButton(selectedApp);
                                }
                            );
                        }
                    } else {
                        // For opened apps, launch them
                        console.log('[AppGridControls] Action button launch for:', selectedApp.id);
                        
                        // Try to launch the app
                        let launched = false;
                        if (this.appGrid) {
                            this.appGrid.launchSelectedApp(selectedApp);
                            launched = true;
                        } else if (typeof selectedApp.onClick === 'function') {
                            selectedApp.onClick(selectedApp, null, this.homeScreenApp.languageData);
                            launched = true;
                        }
                        
                        // Only reset lastSelectedAppIdForAction after successful launch
                        if (launched) {
                            if (this.appGrid) {
                                this.appGrid.lastSelectedAppIdForAction = null;
                            }
                            this.lastSelectedAppIdForAction = null;
                        }
                    }
                }
            }
        });
        this.buttonContainer.appendChild(this.openAppsButton.element);

        this.manualButton = new CanvasButton({
            text: this.homeScreenApp.t('manual'),
            width: 80,
            height: 32,
            borderRadius: [0, 12, 0, 0],
            textColor: 'white',
            font: 'bold 16px "Rodin", sans-serif',
            backgroundColor: 'var(--hs-button-bg)',
            hoverBackgroundColor: 'var(--button-hover-bg)',
            pressedBackgroundColor: 'var(--button-pressed-bg)',
            sideBorderColor: 'rgba(255, 255, 255, 0.3)',
            sideBorderWidth: 1,
            sideBorderSides: 'left',
            moveOnPress: true,
            onClick: () => {
                // Check if a top bar app is selected
                const topBarApp = this.selectedAppId ? 
                    this.appButtons.find(b => b.app.id === this.selectedAppId)?.app : null;
                
                // Check if a grid app is selected
                const gridApp = this.appGrid?.selectedAppId ? 
                    this.appGrid.appData.find(app => app.id === this.appGrid.selectedAppId) : null;
                
                // Prefer top bar app if both are selected
                const selectedApp = topBarApp || gridApp;
                
                if (selectedApp) {
                    this.homeScreenApp.showManual(selectedApp);
                }
            }
        });

        this.buttonContainer.appendChild(this.manualButton.element);
    }

    /**
     * Cleans up and removes control elements
     */
    destroy() {
        // Clean up size controls
        if (this.sizeControlsContainer) {
            this.sizeControlsContainer.remove();
        }
        
        // Clean up action buttons
        if (this.buttonContainer) {
            this.buttonContainer.remove();
        }
        
        // Clean up top bar
        if (this.topBarElement) {
            this.topBarElement.remove();
        }
        
        // Clean up top bar app buttons
        this.appButtons.forEach(({ iconImg }) => {
            if (iconImg) {
                iconImg.onload = null;
                iconImg.onerror = null;
            }
        });
        this.appButtons = [];
        
        // Clean up home menu button
        if (this.homeMenuButton) {
            if (this.homeMenuButton.element && this.homeMenuButton.element.parentElement) {
                this.homeMenuButton.element.parentElement.remove();
            } else if (this.homeMenuButton.element) {
                this.homeMenuButton.element.remove();
            }
            this.homeMenuButton = null;
        }
        
        // Clean up selection glow sprite
        this.selectionGlowSprite = null;
    }
}
