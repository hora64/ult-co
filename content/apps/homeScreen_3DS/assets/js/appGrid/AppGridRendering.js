import { gridConfig } from '../../../config/config.js';

/**
 * AppGridRendering - Handles icon and tile rendering
 * Manages visual rendering of app icons and empty tiles
 */
export class AppGridRendering {
    constructor(appGrid) {
        this.appGrid = appGrid;
    }

    /**
     * Creates an app icon element with selection glow
     * @param {Object} appDataItem - App data object
     * @returns {HTMLElement} Icon container element
     */
    createIcon(appDataItem) {
        const { id, unopened, icon, baseIcon, jingle, unopenedJingle, onClick, iconRenderer, ui, ...rest } = appDataItem;
        const sizeConfig = this.appGrid.getCurrentSizeConfig();

        // Extract actual icon from root level (new schema)
        let actualIcon = icon;

        // Resolve relative icon path to absolute if needed
        if (actualIcon && !actualIcon.startsWith('/') && !actualIcon.startsWith('http')) {
            actualIcon = `/content/apps/${id}/${actualIcon}`;
            console.log(`[AppGridRendering] Resolved relative icon path to:`, actualIcon);
        }

        const originalAppOptions = {
            ...rest,
            id: id,
            unopened: unopened,
            icon: unopened ? this.appGrid.iconSystem.unopenedImage : (actualIcon || icon),
            actualIcon: actualIcon || icon,
            baseIcon: baseIcon,
            width: sizeConfig.iconSize,
            height: sizeConfig.iconSize,
            label: appDataItem.localizedLabel,
            description: appDataItem.localizedDescription,
            jingle: jingle,
            unopenedJingle: unopenedJingle,
            onClick: (event, options) => this.appGrid._internalHandleAppClickTrigger(event, appDataItem, options),
            originalOnClick: onClick,
            iconRenderer: iconRenderer,
            ui: ui
        };

        const iconContainer = this.appGrid.createElement('div', 'app-icon-container');
        const iconWrapper = this.appGrid.createElement('div', 'app-icon');
        iconWrapper.dataset.appId = id;
        iconContainer.setAttribute('draggable', true);

        // Create hover glow canvas
        const hoverGlowCanvas = document.createElement('canvas');
        hoverGlowCanvas.className = 'hover-glow';
        const dpr = window.devicePixelRatio || 1;
        const glowSize = Math.ceil(sizeConfig.iconSize * 1.15);
        hoverGlowCanvas.width = glowSize * dpr;
        hoverGlowCanvas.height = glowSize * dpr;
        hoverGlowCanvas.style.width = `${glowSize}px`;
        hoverGlowCanvas.style.height = `${glowSize}px`;
        
        // Render hover glow with semi-transparent color
        this.renderHoverGlow(hoverGlowCanvas, glowSize);
        
        iconWrapper.appendChild(hoverGlowCanvas);

        // Create selection glow as a canvas element
        const glowCanvas = document.createElement('canvas');
        glowCanvas.className = 'selection-glow';
        glowCanvas.width = glowSize * dpr;
        glowCanvas.height = glowSize * dpr;
        glowCanvas.style.width = `${glowSize}px`;
        glowCanvas.style.height = `${glowSize}px`;
        glowCanvas.style.opacity = '0';
        
        // Get selector z-index configuration from CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const zPosition = computedStyle.getPropertyValue('--selector-z-position').trim() || 'behind';
        
        if (zPosition === 'infront') {
            const zIndex = computedStyle.getPropertyValue('--selector-z-index-infront').trim() || '10';
            glowCanvas.style.zIndex = zIndex;
        } else {
            const zIndex = computedStyle.getPropertyValue('--selector-z-index-behind').trim() || '0';
            glowCanvas.style.zIndex = zIndex;
        }
        
        // Pre-load custom selector if configured
        if (appDataItem.selectorOverride?.enabled && appDataItem.selectorOverride.src) {
            console.log(`[AppGridRendering] Pre-loading custom selector for ${id}:`, appDataItem.selectorOverride.src);
            glowCanvas.dataset.customSelectorSrc = appDataItem.selectorOverride.src;
            
            // If this app is selected on load, render the selector immediately
            if (this.appGrid.selectedAppId === id) {
                const glowOptions = {
                    animated: false,
                    frameCount: 1,
                    currentFrame: 0,
                    frameDuration: 100,
                    customSrc: appDataItem.selectorOverride.src
                };
                
                setTimeout(() => {
                    this.appGrid.renderSelectionGlow(glowCanvas, sizeConfig.iconSize, glowOptions);
                    glowCanvas.style.opacity = '1';
                }, 0);
            }
        }

        iconWrapper.appendChild(glowCanvas);

        const appVisualContainer = this.appGrid.iconSystem.createApp(originalAppOptions);
        iconWrapper.appendChild(appVisualContainer);

        iconContainer.appendChild(iconWrapper);
        return iconContainer;
    }

    /**
     * Renders hover glow effect on canvas with semi-transparent color
     * @param {HTMLCanvasElement} canvas - Canvas to render on
     * @param {number} size - Size of the glow
     */
    renderHoverGlow(canvas, size) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        
        ctx.save();
        ctx.scale(dpr, dpr);
        
        // Get hover glow color from CSS variable or use default
        const computedStyle = getComputedStyle(document.documentElement);
        const hoverColor = computedStyle.getPropertyValue('--hover-glow-color').trim() || 'rgba(255, 255, 255, 0.15)';
        
        // Draw circular glow
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2;
        
        // Create radial gradient for smooth glow effect
        const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
        gradient.addColorStop(0, hoverColor);
        gradient.addColorStop(0.7, hoverColor.replace(/[\d.]+\)$/, '0.05)'));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Creates an empty tile element
     * @returns {HTMLElement} Empty tile container
     */
    createEmptyTile() {
        const sizeConfig = this.appGrid.getCurrentSizeConfig();
        const tileSize = sizeConfig.iconSize * 0.25; // 25% of app size

        const tileContainer = this.appGrid.createElement('div', 'empty-tile-container');
        const tileWrapper = this.appGrid.createElement('div', 'empty-tile');
        tileWrapper.dataset.isEmpty = 'true';
        tileContainer.setAttribute('draggable', false);
        tileContainer.classList.add('drop-target');

        // Create canvas for rounded square
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = tileSize * dpr;
        canvas.height = tileSize * dpr;
        canvas.style.width = `${tileSize}px`;
        canvas.style.height = `${tileSize}px`;
        canvas.className = 'empty-tile-canvas';

        // Draw rounded rectangle
        this.renderEmptyTile(canvas, tileSize);

        // Create hover glow for empty tiles
        const hoverGlowCanvas = document.createElement('canvas');
        hoverGlowCanvas.className = 'hover-glow';
        const glowSize = Math.ceil(sizeConfig.iconSize * 1.15);
        hoverGlowCanvas.width = glowSize * dpr;
        hoverGlowCanvas.height = glowSize * dpr;
        hoverGlowCanvas.style.width = `${glowSize}px`;
        hoverGlowCanvas.style.height = `${glowSize}px`;
        
        // Render hover glow
        this.renderHoverGlow(hoverGlowCanvas, glowSize);

        // Create selection glow for empty tiles
        const glowCanvas = document.createElement('canvas');
        glowCanvas.className = 'selection-glow empty-tile-glow';
        glowCanvas.width = glowSize * dpr;
        glowCanvas.height = glowSize * dpr;
        glowCanvas.style.width = `${glowSize}px`;
        glowCanvas.style.height = `${glowSize}px`;
        glowCanvas.style.opacity = '0';

        // Add click handler for empty tiles
        tileContainer.addEventListener('click', (e) => {
            this.handleEmptyTileClick(tileContainer, e);
        });

        tileWrapper.appendChild(hoverGlowCanvas);
        tileWrapper.appendChild(glowCanvas);
        tileWrapper.appendChild(canvas);
        tileContainer.appendChild(tileWrapper);

        return tileContainer;
    }

    /**
     * Renders an empty tile on a canvas
     * @param {HTMLCanvasElement} canvas - Canvas to render on
     * @param {number} size - Size of the tile
     */
    renderEmptyTile(canvas, size) {
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
                console.warn('[AppGridRendering] Empty tile sprite failed to load, using fallback');
                this.drawEmptyTileFallback(ctx, size, computedStyle);
            };
            img.src = spritePath;
        } else {
            // Use drawn tile (default)
            this.drawEmptyTileFallback(ctx, size, computedStyle);
        }

        ctx.restore();
    }

    /**
     * Draws fallback empty tile when sprite is not available
     * @private
     */
    drawEmptyTileFallback(ctx, size, computedStyle) {
        const fillColor = computedStyle.getPropertyValue('--empty-tile-color').trim() || 'rgba(255, 255, 255, 0.08)';
        const borderColor = computedStyle.getPropertyValue('--empty-tile-border').trim() || 'rgba(255, 255, 255, 0.15)';

        const x = 0;
        const y = 0;
        const radius = size * 0.15;

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

        ctx.fillStyle = fillColor;
        ctx.fill();

        // Add subtle inner grid pattern
        const gridSpacing = size / 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;

        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * gridSpacing, y + radius);
            ctx.lineTo(x + i * gridSpacing, y + size - radius);
            ctx.stroke();
        }

        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y + i * gridSpacing);
            ctx.lineTo(x + size - radius, y + i * gridSpacing);
            ctx.stroke();
        }

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Add subtle inner highlight
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /**
     * Handles clicks on empty tiles
     * @param {HTMLElement} tileContainer - The tile container
     * @param {Event} event - The click event
     */
    handleEmptyTileClick(tileContainer, event) {
        event.preventDefault();
        event.stopPropagation();

        this.appGrid.playSound('select');

        const allContainers = Array.from(this.appGrid.container.querySelectorAll('.app-icon-container, .empty-tile-container'));
        const tileIndex = allContainers.indexOf(tileContainer);

        if (tileIndex === -1) return;

        const numRows = this.appGrid.layout.gridRows || 1;
        const row = tileIndex % numRows;
        const col = Math.floor(tileIndex / numRows);

        this.appGrid.selectEmptyTile(row, col, tileContainer);
    }

    /**
     * Renders text on a canvas with word wrapping
     * @param {string} text - Text to render
     * @param {Object} config - Configuration options
     * @returns {HTMLCanvasElement} Canvas with rendered text
     */
    renderTextToCanvas(text, config = {}) {
        const { 
            fontCss = '12px sans-serif', 
            fillStyle = 'white', 
            textAlign = 'center', 
            textBaseline = 'top', 
            padding = 2, 
            width = 100, 
            height = 20 
        } = config;
        
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);
        
        ctx.font = fontCss;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        
        const xPos = textAlign === 'center' ? width / 2 : padding;
        const yPos = padding;
        const words = String(text).split(' ');
        let currentLine = '';
        const lines = [];
        
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > (width - padding * 2) && i > 0) {
                lines.push(currentLine.trim());
                currentLine = words[i] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());
        
        const lineHeight = parseInt(fontCss.match(/\d+/), 10);
        let currentY = yPos;
        
        for (const line of lines) {
            ctx.fillText(line, xPos, currentY);
            currentY += lineHeight;
        }
        
        return canvas;
    }

    /**
     * Builds the grid from a layout preset
     * @param {Object} preset - Layout preset configuration
     */
    buildGridFromPreset(preset) {
        this.appGrid.container.innerHTML = '';
        
        if (!preset || !Array.isArray(preset.structure)) {
            console.error("[AppGridRendering] Invalid preset structure:", preset);
            return;
        }

        const totalTileSpaces = gridConfig.totalTileSpaces;

        preset.structure.forEach(block => {
            if (block.type === 'app') {
                // If we have a 2D grid layout, build according to it
                if (this.appGrid.layout.gridLayout2D && this.appGrid.layout.gridRows > 0 && this.appGrid.layout.gridColumns > 0) {
                    console.log('[AppGridRendering] Building grid from 2D layout');

                    // Iterate in column-major order
                    for (let col = 0; col < this.appGrid.layout.gridColumns; col++) {
                        for (let row = 0; row < this.appGrid.layout.gridRows; row++) {
                            const appId = this.appGrid.layout.gridLayout2D[row][col];

                            if (appId) {
                                const appDataItem = this.appGrid.appData.find(app => app.id === appId);
                                if (appDataItem) {
                                    const iconWrapper = this.createIcon(appDataItem);
                                    this.appGrid.container.appendChild(iconWrapper);
                                } else {
                                    const emptyTile = this.createEmptyTile();
                                    this.appGrid.container.appendChild(emptyTile);
                                }
                            } else {
                                const emptyTile = this.createEmptyTile();
                                this.appGrid.container.appendChild(emptyTile);
                            }
                        }
                    }
                } else {
                    // Fallback to default linear layout
                    console.log('[AppGridRendering] Building grid from default layout');
                    const appsToRender = this.appGrid.appData.slice(0, block.count);

                    appsToRender.forEach((appDataItem) => {
                        const iconWrapper = this.createIcon(appDataItem);
                        this.appGrid.container.appendChild(iconWrapper);
                    });

                    const emptyTilesNeeded = totalTileSpaces - appsToRender.length;

                    for (let i = 0; i < emptyTilesNeeded; i++) {
                        const emptyTile = this.createEmptyTile();
                        this.appGrid.container.appendChild(emptyTile);
                    }
                }
            }
        });
    }

    /**
     * Rebuilds the entire grid
     */
    rebuildGrid() {
        const preset = this.appGrid.layoutPresets[this.appGrid.currentLayout] || this.appGrid.layoutPresets.default;
        this.buildGridFromPreset(preset);
        this.appGrid.applyCurrentSizeClass(false);
    }
}
