/**
 * AppGridAnimation - Handles size changes and FLIP animations
 * Manages smooth transitions when changing icon sizes
 */
export class AppGridAnimation {
    constructor(appGrid) {
        this.appGrid = appGrid;
        this.animationFrameId = null;
        this.resizeDebounceTimer = null;
    }

    /**
     * Applies the current size class with optional animation
     * Uses FLIP (First, Last, Invert, Play) animation technique
     * @param {boolean} shouldAnimate - Whether to animate the transition
     */
    async applyCurrentSizeClass(shouldAnimate = true) {
        const canAnimate = shouldAnimate && typeof anime === 'function';
        const allIcons = Array.from(this.appGrid.container.querySelectorAll('.app-icon-container'));
        const allEmptyTiles = Array.from(this.appGrid.container.querySelectorAll('.empty-tile-container'));
        const oldPositions = new Map();

        // Cancel any existing animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Debounce rapid size changes
        if (this.resizeDebounceTimer) {
            clearTimeout(this.resizeDebounceTimer);
        }

        // FLIP: First - capture old positions ONLY
        if (canAnimate) {
            allIcons.forEach(icon => {
                const rect = icon.getBoundingClientRect();
                oldPositions.set(icon, {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                });
            });
            allEmptyTiles.forEach(tile => {
                const rect = tile.getBoundingClientRect();
                oldPositions.set(tile, {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                });
            });
        }

        // Rebuild visual grid from base layout for new size
        this.appGrid.layout.rebuildVisualGrid();

        // Apply new size class
        const newClassName = this.appGrid.sizeClasses[this.appGrid.currentSizeIndex];
        this.appGrid.sizeClasses.forEach(cls => this.appGrid.container.classList.remove(cls));
        this.appGrid.container.classList.add(newClassName);
        this.appGrid.updateResponsiveLayout();

        const newSizeConfig = this.appGrid.getCurrentSizeConfig();
        const newIconSize = newSizeConfig.iconSize;
        const newTileSize = newIconSize * 0.25;

        // Update scroll indicator grid rows
        if (this.appGrid.scrollbar) {
            this.appGrid.scrollbar.updateGridRows(newSizeConfig.rows);
        }

        // Redraw ALL icons at new size FIRST (before animation)
        const redrawPromises = allIcons.map(iconContainer => {
            const button = iconContainer.querySelector('.app-button');
            const appId = iconContainer.querySelector('.app-icon')?.dataset.appId;
            const appDataItem = this.appGrid.appData.find(app => app.id === appId);
            const selectionGlow = iconContainer.querySelector('.selection-glow');

            if (button && appDataItem) {
                appDataItem.labelCanvas = this.appGrid.rendering.renderTextToCanvas(appDataItem.localizedLabel, {
                    fontCss: '12px RodinProDB',
                    width: 64,
                    height: 16
                });

                // Update selection glow size if it exists
                if (selectionGlow && selectionGlow.tagName === 'CANVAS') {
                    const dpr = window.devicePixelRatio || 1;
                    const glowSize = Math.ceil(newIconSize * 1.15);
                    selectionGlow.width = glowSize * dpr;
                    selectionGlow.height = glowSize * dpr;
                    selectionGlow.style.width = `${glowSize}px`;
                    selectionGlow.style.height = `${glowSize}px`;

                    // Redraw glow if currently visible
                    if (selectionGlow.style.opacity === '1') {
                        this.appGrid.selection.renderSelectionGlow(selectionGlow, newIconSize);
                    }
                }

                return this.appGrid.iconSystem.updateIconSize(button, newIconSize, appDataItem.labelCanvas);
            }
            return Promise.resolve();
        });

        // Redraw empty tiles at new size
        allEmptyTiles.forEach(tileContainer => {
            const canvas = tileContainer.querySelector('.empty-tile-canvas');
            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = newTileSize * dpr;
                canvas.height = newTileSize * dpr;
                canvas.style.width = `${newTileSize}px`;
                canvas.style.height = `${newTileSize}px`;
                this.appGrid.rendering.renderEmptyTile(canvas, newTileSize);
            }

            // Update empty tile glow size
            const glowCanvas = tileContainer.querySelector('.empty-tile-glow');
            if (glowCanvas && glowCanvas.tagName === 'CANVAS') {
                const dpr = window.devicePixelRatio || 1;
                const glowSize = Math.ceil(newIconSize * 1.15);
                glowCanvas.width = glowSize * dpr;
                glowCanvas.height = glowSize * dpr;
                glowCanvas.style.width = `${glowSize}px`;
                glowCanvas.style.height = `${glowSize}px`;

                if (glowCanvas.style.opacity === '1') {
                    this.appGrid.selection.renderSelectionGlow(glowCanvas, newIconSize);
                }
            }
        });

        // Wait for ALL redraws to complete BEFORE starting animation
        await Promise.all(redrawPromises);

        if (canAnimate && oldPositions.size > 0) {
            this.appGrid.container.classList.add('is-resizing');

            // FLIP: Invert - calculate deltas and apply initial transform
            const allElements = [...allIcons, ...allEmptyTiles];
            allElements.forEach(el => {
                const oldPos = oldPositions.get(el);
                const newPos = el.getBoundingClientRect();

                if (!oldPos || !newPos || newPos.width === 0 || newPos.height === 0) return;

                const deltaX = oldPos.left - newPos.left;
                const deltaY = oldPos.top - newPos.top;
                const scaleX = oldPos.width / newPos.width;
                const scaleY = oldPos.height / newPos.height;

                el.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) scaleX(${scaleX}) scaleY(${scaleY})`;
            });

            // Force reflow
            void this.appGrid.container.offsetHeight;

            // FLIP: Play - animate to final state with smoother easing
            this.animationFrameId = requestAnimationFrame(() => {
                anime({
                    targets: allElements,
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300, // Reduced from 400 for snappier feel
                    easing: 'easeOutCubic', // Smoother easing
                    complete: () => {
                        this.appGrid.container.classList.remove('is-resizing');
                        allElements.forEach(element => {
                            element.style.transform = '';
                        });

                        // Update scrollbar after animation completes
                        this.resizeDebounceTimer = setTimeout(() => {
                            if (this.appGrid.scrollbar) {
                                this.appGrid.scrollbar.update();
                            }
                            this.resizeDebounceTimer = null;
                        }, 50);

                        // Re-center selected app after animation
                        this.recenterSelectedApp();
                    }
                });
            });
        } else {
            // Update scrollbar immediately for non-animated path
            if (this.appGrid.scrollbar) {
                this.appGrid.scrollbar.update();

                // Update scroll indicator position
                if (this.appGrid.selection.selectedAppId) {
                    this.updateScrollIndicatorForSelectedApp();
                }
            }

            this.appGrid.updateScrollPositionFromEvent();
        }
    }

    /**
     * Re-centers the selected app after size change
     * @private
     */
    recenterSelectedApp() {
        if (this.appGrid.selection.selectedAppId) {
            const selectedIconWrapper = this.appGrid.container.querySelector(`.app-icon[data-app-id="${this.appGrid.selection.selectedAppId}"]`);
            const selectedIconContainer = selectedIconWrapper?.closest('.app-icon-container');

            if (selectedIconContainer) {
                const containerRect = this.appGrid.container.getBoundingClientRect();
                const elementRect = selectedIconContainer.getBoundingClientRect();
                const targetScrollLeft = this.appGrid.container.scrollLeft + elementRect.left - containerRect.left - (containerRect.width / 2) + (elementRect.width / 2);

                if (typeof anime === 'function') {
                    anime({
                        targets: this.appGrid.container,
                        scrollLeft: targetScrollLeft,
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                }

                // Update scroll indicator
                this.updateScrollIndicatorForSelectedApp();
            }
        } else {
            this.appGrid.updateScrollPositionFromEvent();
        }
    }

    /**
     * Updates scroll indicator for selected app
     * @private
     */
    updateScrollIndicatorForSelectedApp() {
        if (!this.appGrid.selection.selectedAppId || !this.appGrid.scrollbar) return;

        const appPosition = this.appGrid.layout.findAppPosition2D(this.appGrid.selection.selectedAppId);
        if (appPosition) {
            const basePos = this.appGrid.layout.transformVisualToBase(appPosition.row, appPosition.col);
            if (basePos) {
                console.log(`[AppGridAnimation] Updating scroll indicator for ${this.appGrid.selection.selectedAppId} at visual (${appPosition.row}, ${appPosition.col}) -> base (${basePos.row}, ${basePos.col})`);
                this.appGrid.scrollbar.setPositionByGrid(
                    basePos.row,
                    basePos.col,
                    this.appGrid.layout.baseRows,
                    this.appGrid.layout.baseColumns
                );
            }
        }
    }

    /**
     * Increases icon size
     */
    increaseIconSize() {
        if (this.appGrid.currentSizeIndex < this.appGrid.sizeClasses.length - 1) {
            this.appGrid.playSound('sizeup');
            this.appGrid.changeIconSize('increase');
            this.applyCurrentSizeClass(true);
        }
    }

    /**
     * Decreases icon size
     */
    decreaseIconSize() {
        if (this.appGrid.currentSizeIndex > 0) {
            this.appGrid.playSound('sizedown');
            this.appGrid.changeIconSize('decrease');
            this.applyCurrentSizeClass(true);
        }
    }

    /**
     * Cleanup animations
     */
    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.resizeDebounceTimer) {
            clearTimeout(this.resizeDebounceTimer);
            this.resizeDebounceTimer = null;
        }
    }
}
