/**
 * AppGridSelection - Handles app and tile selection with glow rendering
 * Manages selection state and visual feedback
 */
export class AppGridSelection {
    constructor(appGrid) {
        this.appGrid = appGrid;
        this.selectedAppId = null;
        this.selectedEmptyTile = null; // Stores {row, col}
        this.lastSelectedAppIdForAction = null;
    }

    /**
     * Selects an app and updates visual feedback
     * @param {string} appId - App ID to select
     * @param {HTMLElement} iconWrapperElement - Optional icon wrapper element
     * @param {boolean} animateScroll - Whether to animate scroll
     */
    selectApp(appId, iconWrapperElement, animateScroll = false) {
        // Clear empty tile selection when selecting an app
        if (this.selectedEmptyTile) {
            const prevTile = this.appGrid.container.querySelector('.empty-tile-container.selected');
            if (prevTile) {
                prevTile.classList.remove('selected');
                const prevGlow = prevTile.querySelector('.empty-tile-glow');
                if (prevGlow) {
                    prevGlow.style.opacity = '0';
                }
            }
            this.selectedEmptyTile = null;
        }

        // Deselect previous app
        if (this.selectedAppId && this.selectedAppId !== appId) {
            const prevSelectedIconWrapper = this.appGrid.container.querySelector(`.app-icon.selected[data-app-id="${this.selectedAppId}"]`);
            if (prevSelectedIconWrapper) {
                prevSelectedIconWrapper.classList.remove('selected');
                const prevGlow = prevSelectedIconWrapper.querySelector('.selection-glow');
                if (prevGlow) {
                    prevGlow.style.opacity = '0';
                    if (prevGlow.animationHandle) {
                        cancelAnimationFrame(prevGlow.animationHandle);
                    }
                }
            }
        }

        this.selectedAppId = appId;
        this.appGrid._saveGridState();

        const appDataItem = this.appGrid.appData.find(app => app.id === appId);
        if (appDataItem && this.appGrid.onSelectionChange) {
            this.appGrid.onSelectionChange(appDataItem);
        }

        if (!iconWrapperElement) {
            iconWrapperElement = this.appGrid.container.querySelector(`.app-icon[data-app-id="${appId}"]`);
        }

        if (iconWrapperElement) {
            iconWrapperElement.classList.add('selected');

            const glow = iconWrapperElement.querySelector('.selection-glow');
            if (glow) {
                void glow.offsetHeight;

                if (glow.tagName === 'CANVAS') {
                    const sizeConfig = this.appGrid.getCurrentSizeConfig();
                    
                    // Check for custom selector override from multiple sources
                    const storedCustomSrc = glow.dataset.customSelectorSrc;
                    const appCustomSrc = appDataItem?.selectorOverride?.enabled 
                        ? appDataItem.selectorOverride.src 
                        : null;
                    
                    const selectorSrc = storedCustomSrc || appCustomSrc || this.appGrid.assetUrls.selectionGlow;
                    
                    console.log(`[AppGridSelection] Applying selector for ${appId}:`, {
                        storedCustomSrc,
                        appCustomSrc,
                        finalSrc: selectorSrc
                    });
                    
                    const glowOptions = {
                        animated: this.appGrid.assetUrls.selectionGlowAnimated || false,
                        frameCount: this.appGrid.assetUrls.selectionGlowFrames || 1,
                        currentFrame: 0,
                        frameDuration: this.appGrid.assetUrls.selectionGlowFrameDuration || 100,
                        customSrc: selectorSrc
                    };
                    this.renderSelectionGlow(glow, sizeConfig.iconSize, glowOptions);
                }

                glow.style.opacity = '1';
            }

            // Update scrollbar position
            const appPosition = this.appGrid.layout.findAppPosition2D(appId);
            if (appPosition && this.appGrid.scrollbar) {
                const basePos = this.appGrid.layout.transformVisualToBase(appPosition.row, appPosition.col);

                if (basePos) {
                    if (basePos.row >= 0 && basePos.row < this.appGrid.layout.baseRows &&
                        basePos.col >= 0 && basePos.col < this.appGrid.layout.baseColumns) {
                        this.appGrid.scrollbar.setPositionByGrid(
                            basePos.row,
                            basePos.col,
                            this.appGrid.layout.baseRows,
                            this.appGrid.layout.baseColumns
                        );
                    }
                }
            }

            // Scroll into view
            if (animateScroll && typeof anime === 'function') {
                const containerRect = this.appGrid.container.getBoundingClientRect();
                const elementRect = iconWrapperElement.getBoundingClientRect();
                const scrollableWidth = this.appGrid.container.scrollWidth - this.appGrid.container.clientWidth;
                let targetScrollLeft = this.appGrid.container.scrollLeft + elementRect.left - containerRect.left - (containerRect.width / 2) + (elementRect.width / 2);
                targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, scrollableWidth));

                anime({
                    targets: this.appGrid.container,
                    scrollLeft: targetScrollLeft,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            } else {
                iconWrapperElement.scrollIntoView({
                    behavior: 'auto',
                    block: 'nearest',
                    inline: 'center'
                });
            }

            this.appGrid.playSound('select');
        }
    }

    /**
     * Selects an empty tile
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {HTMLElement} tileElement - Optional tile element
     */
    selectEmptyTile(row, col, tileElement = null) {
        // Deselect any currently selected app
        if (this.selectedAppId) {
            const prevSelectedIconWrapper = this.appGrid.container.querySelector(`.app-icon.selected[data-app-id="${this.selectedAppId}"]`);
            if (prevSelectedIconWrapper) {
                prevSelectedIconWrapper.classList.remove('selected');
                const prevGlow = prevSelectedIconWrapper.querySelector('.selection-glow');
                if (prevGlow) {
                    prevGlow.style.opacity = '0';
                    if (prevGlow.animationHandle) {
                        cancelAnimationFrame(prevGlow.animationHandle);
                    }
                }
            }
            this.selectedAppId = null;
        }

        // Deselect any previously selected empty tile
        if (this.selectedEmptyTile) {
            const prevTile = this.appGrid.container.querySelector('.empty-tile-container.selected');
            if (prevTile) {
                prevTile.classList.remove('selected');
                const prevGlow = prevTile.querySelector('.empty-tile-glow');
                if (prevGlow) {
                    prevGlow.style.opacity = '0';
                }
            }
        }

        // Validate row and col bounds
        if (row < 0 || row >= this.appGrid.layout.gridRows || col < 0 || col >= this.appGrid.layout.gridColumns) {
            console.error(`[AppGridSelection] Invalid empty tile position: (${row}, ${col}), grid is ${this.appGrid.layout.gridRows}x${this.appGrid.layout.gridColumns}`);
            return;
        }

        this.selectedEmptyTile = { row, col };

        // Find the tile element if not provided
        if (!tileElement) {
            const allContainers = Array.from(this.appGrid.container.querySelectorAll('.app-icon-container, .empty-tile-container'));
            const tileIndex = (col * this.appGrid.layout.gridRows) + row;
            tileElement = allContainers[tileIndex];
        }

        if (tileElement && tileElement.classList.contains('empty-tile-container')) {
            tileElement.classList.add('selected');

            const glow = tileElement.querySelector('.empty-tile-glow');
            if (glow) {
                void glow.offsetHeight;

                if (glow.tagName === 'CANVAS') {
                    const sizeConfig = this.appGrid.getCurrentSizeConfig();
                    const glowOptions = {
                        animated: this.appGrid.assetUrls.selectionGlowAnimated || false,
                        frameCount: this.appGrid.assetUrls.selectionGlowFrames || 1,
                        currentFrame: 0,
                        frameDuration: this.appGrid.assetUrls.selectionGlowFrameDuration || 100
                    };
                    this.renderSelectionGlow(glow, sizeConfig.iconSize, glowOptions);
                }

                glow.style.opacity = '1';
            }

            // Update scroll indicator
            if (this.appGrid.scrollbar) {
                const basePos = this.appGrid.layout.transformVisualToBase(row, col);

                if (basePos) {
                    if (basePos.row >= 0 && basePos.row < this.appGrid.layout.baseRows &&
                        basePos.col >= 0 && basePos.col < this.appGrid.layout.baseColumns) {
                        console.log(`[AppGridSelection] Updating scroll indicator for empty tile at visual (${row}, ${col}) -> base (${basePos.row}, ${basePos.col})`);
                        this.appGrid.scrollbar.setPositionByGrid(
                            basePos.row,
                            basePos.col,
                            this.appGrid.layout.baseRows,
                            this.appGrid.layout.baseColumns
                        );
                    }
                }
            }

            // Scroll into view
            if (typeof anime === 'function') {
                const containerRect = this.appGrid.container.getBoundingClientRect();
                const elementRect = tileElement.getBoundingClientRect();
                const scrollableWidth = this.appGrid.container.scrollWidth - this.appGrid.container.clientWidth;
                let targetScrollLeft = this.appGrid.container.scrollLeft + elementRect.left - containerRect.left - (containerRect.width / 2) + (elementRect.width / 2);
                targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, scrollableWidth));

                anime({
                    targets: this.appGrid.container,
                    scrollLeft: targetScrollLeft,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            } else {
                tileElement.scrollIntoView({
                    behavior: 'auto',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }

        // Load empty tile banner
        const emptyTileData = {
            _isEmptyTile: true,
            row,
            col,
            localizedLabel: 'Empty Space',
            localizedDescription: 'Select to create a folder',
            bannerModule: '/content/apps/homeScreen/banners/emptyTile/emptyTileBanner.js'
        };

        // Check if loadBanner method exists before calling
        if (this.appGrid.bannerManager && typeof this.appGrid.bannerManager.loadBanner === 'function') {
            this.appGrid.bannerManager.loadBanner(emptyTileData);
        } else if (this.appGrid.topScreen && typeof this.appGrid.topScreen.loadBanner === 'function') {
            this.appGrid.topScreen.loadBanner(emptyTileData);
        }

        if (this.appGrid.topScreenStatusEl) {
            this.appGrid.topScreenStatusEl.textContent = 'Empty space selected';
        }

        if (this.appGrid.onSelectionChange) {
            this.appGrid.onSelectionChange(emptyTileData);
        }
    }

    /**
     * Renders selection glow on a canvas
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} iconSize - Size of the icon
     * @param {Object} options - Rendering options
     */
    renderSelectionGlow(canvas, iconSize, options = {}) {
        const { 
            animated = false, 
            frameCount = 1, 
            currentFrame = 0, 
            frameDuration = 100, 
            customSrc = null 
        } = options;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const glowSize = Math.ceil(iconSize * 1.15);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        const img = new Image();
        img.onload = () => {
            ctx.save();
            ctx.scale(dpr, dpr);
            
            if (animated && frameCount > 1) {
                const frameWidth = img.width / frameCount;
                const sourceX = currentFrame * frameWidth;
                ctx.drawImage(
                    img,
                    sourceX, 0, frameWidth, img.height,
                    0, 0, glowSize, glowSize
                );
                
                if (canvas.animationHandle) {
                    cancelAnimationFrame(canvas.animationHandle);
                }
                
                let nextFrame = (currentFrame + 1) % frameCount;
                canvas.animationHandle = setTimeout(() => {
                    if (canvas.style.opacity === '1') {
                        this.renderSelectionGlow(canvas, iconSize, { 
                            animated, 
                            frameCount, 
                            currentFrame: nextFrame, 
                            frameDuration,
                            customSrc
                        });
                    }
                }, frameDuration);
            } else {
                ctx.drawImage(img, 0, 0, glowSize, glowSize);
            }
            
            ctx.restore();
        };
        
        img.src = customSrc || this.appGrid.assetUrls.selectionGlow;
    }

    /**
     * Updates selection glow size
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} iconSize - New icon size
     */
    updateSelectionGlowSize(canvas, iconSize) {
        const dpr = window.devicePixelRatio || 1;
        const glowSize = Math.ceil(iconSize * 1.15);
        canvas.width = glowSize * dpr;
        canvas.height = glowSize * dpr;
        canvas.style.width = `${glowSize}px`;
        canvas.style.height = `${glowSize}px`;

        if (canvas.style.opacity === '1') {
            const glowOptions = {
                animated: this.appGrid.assetUrls.selectionGlowAnimated || false,
                frameCount: this.appGrid.assetUrls.selectionGlowFrames || 1,
                currentFrame: 0,
                frameDuration: this.appGrid.assetUrls.selectionGlowFrameDuration || 100
            };
            this.renderSelectionGlow(canvas, iconSize, glowOptions);
        }
    }

    /**
     * Gets the currently selected app ID
     * @returns {string|null} Selected app ID
     */
    getSelectedAppId() {
        return this.selectedAppId;
    }

    /**
     * Gets the currently selected empty tile
     * @returns {{row: number, col: number}|null} Selected tile position
     */
    getSelectedEmptyTile() {
        return this.selectedEmptyTile;
    }

    /**
     * Clears all selections
     */
    clearSelection() {
        if (this.selectedAppId) {
            const iconWrapper = this.appGrid.container.querySelector(`.app-icon.selected[data-app-id="${this.selectedAppId}"]`);
            if (iconWrapper) {
                iconWrapper.classList.remove('selected');
                const glow = iconWrapper.querySelector('.selection-glow');
                if (glow) {
                    glow.style.opacity = '0';
                }
            }
            this.selectedAppId = null;
        }

        if (this.selectedEmptyTile) {
            const tileContainer = this.appGrid.container.querySelector('.empty-tile-container.selected');
            if (tileContainer) {
                tileContainer.classList.remove('selected');
                const glow = tileContainer.querySelector('.empty-tile-glow');
                if (glow) {
                    glow.style.opacity = '0';
                }
            }
            this.selectedEmptyTile = null;
        }
    }
}
