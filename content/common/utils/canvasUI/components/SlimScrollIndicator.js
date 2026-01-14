import { UIComponent } from '../UIComponent.js';

/**
 * SlimScrollIndicator - A minimalist scroll position indicator with glow effect
 * Displays as a thin horizontal line showing current scroll position
 * Replaces full scrollbar for a cleaner UI
 * Only visible when actively scrolling
 * Uses canvas rendering for better performance and pixel-perfect appearance
 * @extends UIComponent
 */
export class SlimScrollIndicator extends UIComponent {
    /**
     * Creates a new SlimScrollIndicator instance
     * @param {HTMLElement} scrollContainer - The element being scrolled
     * @param {Object} [options={}] - Configuration options
     * @param {number} [options.height=2] - Height of the indicator in pixels
     * @param {string} [options.color='rgba(100, 150, 255, 0.6)'] - Color of the indicator thumb
     * @param {string} [options.backgroundColor='rgba(0, 0, 0, 0.1)'] - Background track color
     * @param {string} [options.borderColor='rgba(100, 150, 255, 0.8)'] - Border color for thumb
     * @param {string} [options.baseColor='rgba(255, 100, 100, 0.5)'] - Color when at boundary
     * @param {string} [options.glowColor='rgba(100, 150, 255, 0.8)'] - Color of the glow effect
     * @param {number} [options.borderWidth=1] - Border width in pixels
     * @param {number} [options.borderRadius=1] - Border radius in pixels for rounded corners
     * @param {number} [options.hideDelay=1000] - Delay before hiding indicator (ms)
     * @param {number} [options.totalItems=0] - Total number of items (for position-based mode)
     * @param {number} [options.gridRows=3] - Number of rows in the grid (for column-based tracking)
     * @param {string} [options.sizeClass='normal-icons'] - Size class to determine indicator width
     */
    constructor(scrollContainer, options = {}) {
        super();

        this.scrollContainer = scrollContainer;
        
        // Define size-specific configurations for each app grid size
        // Container width is ALWAYS 320px (fixed)
        // Thumb width varies by size class
        this.sizeConfigs = {
            'tiny-icons': { width: 320, thumbWidth: 40 },
            'small-icons': { width: 320, thumbWidth: 35 },
            'compact-icons': { width: 320, thumbWidth: 30 },
            'normal-icons': { width: 320, thumbWidth: 25 },
            'comfortable-icons': { width: 320, thumbWidth: 20 },
            'cozy-icons': { width: 320, thumbWidth: 15 }
        };
        
        // Get size class from options or default to normal-icons
        this.sizeClass = options.sizeClass || 'normal-icons';
        const sizeConfig = this.sizeConfigs[this.sizeClass] || this.sizeConfigs['normal-icons'];
        
        this.options = {
            width: 320, // ALWAYS 320px - fixed container width
            height: options.height !== undefined ? options.height : 2,
            color: options.color || 'rgba(100, 150, 255, 0.6)',
            backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.2)',
            borderColor: options.borderColor || 'rgba(100, 150, 255, 0.8)',
            baseColor: options.baseColor || 'rgba(255, 100, 100, 0.5)',
            glowColor: options.glowColor || 'rgba(100, 150, 255, 0.8)',
            borderWidth: options.borderWidth !== undefined ? options.borderWidth : 1,
            borderRadius: options.borderRadius !== undefined ? options.borderRadius : 1,
            hideDelay: options.hideDelay !== undefined ? options.hideDelay : 1000,
            totalItems: options.totalItems || 0,
            gridRows: options.gridRows || 3,
            thumbWidth: sizeConfig.thumbWidth // Thumb width from size config
        };

        // Track boundary state
        this.atBoundary = false;

        // Track position-based mode
        this.usePositionMode = false;
        this.currentColumnIndex = 0; // Track column instead of item
        this.totalColumns = 0;

        // Create canvas element instead of DOM elements
        this.element = document.createElement('div');
        this.element.className = 'slim-scroll-indicator';
        
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'slim-scroll-canvas';
        this.element.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');

        // Thumb position state
        this.thumbWidthPercent = 0;
        this.thumbPositionPercent = 0;

        // Animation state for smooth transitions
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.startThumbWidth = 0;
        this.startThumbPosition = 0;
        this.targetThumbWidth = 0;
        this.targetThumbPosition = 0;
        this.animationFrameId = null;

        // Fade out state
        this.hideTimeout = null;
        this.isVisible = false;

        // Apply styles
        this.applyStyles();

        // Bind events
        this.scrollHandler = () => this.handleScroll();
        this.scrollContainer.addEventListener('scroll', this.scrollHandler);

        // Initial state (hidden)
        this.element.style.opacity = '0';
        this.element.style.visibility = 'hidden';
        
        // Setup canvas size
        this.setupCanvas();
    }

    /**
     * Sets up canvas dimensions based on container size
     * @private
     */
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = this.options.width;
        const height = this.options.height + (this.options.borderWidth * 2);
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * Draws a rounded rectangle on the canvas
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} radius - Corner radius
     * @private
     */
    drawRoundedRect(x, y, width, height, radius) {
        // Clamp radius to not exceed half of smallest dimension
        const maxRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
        const clampedRadius = Math.max(0, Math.min(radius, maxRadius));
        
        // If width or height is too small, just draw a regular rectangle
        if (width < 1 || height < 1 || clampedRadius < 0.1) {
            this.ctx.beginPath();
            this.ctx.rect(x, y, Math.max(0, width), Math.max(0, height));
            this.ctx.closePath();
            return;
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + clampedRadius, y);
        this.ctx.lineTo(x + width - clampedRadius, y);
        this.ctx.arcTo(x + width, y, x + width, y + clampedRadius, clampedRadius);
        this.ctx.lineTo(x + width, y + height - clampedRadius);
        this.ctx.arcTo(x + width, y + height, x + width - clampedRadius, y + height, clampedRadius);
        this.ctx.lineTo(x + clampedRadius, y + height);
        this.ctx.arcTo(x, y + height, x, y + height - clampedRadius, clampedRadius);
        this.ctx.lineTo(x, y + clampedRadius);
        this.ctx.arcTo(x, y, x + clampedRadius, y, clampedRadius);
        this.ctx.closePath();
    }

    /**
     * Renders the scroll indicator on canvas
     * @private
     */
    render() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw track background with rounded corners
        this.ctx.fillStyle = this.options.backgroundColor;
        this.drawRoundedRect(0, 0, width, height, this.options.borderRadius);
        this.ctx.fill();
        
        // Calculate thumb dimensions and position
        const thumbWidth = (this.thumbWidthPercent / 100) * width;
        const thumbX = (this.thumbPositionPercent / 100) * width;
        
        // Draw glow effect
        const glowColor = this.atBoundary ? this.options.baseColor : this.options.glowColor;
        const glowRadius = this.atBoundary ? 3 : 6;
        
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = glowRadius;
        
        // Draw thumb fill with rounded corners
        const thumbColor = this.atBoundary ? this.options.baseColor : this.options.color;
        this.ctx.fillStyle = thumbColor;
        this.drawRoundedRect(thumbX, 0, thumbWidth, height, this.options.borderRadius);
        this.ctx.fill();
        
        // Draw thumb border with rounded corners
        this.ctx.shadowBlur = 0;
        const borderColor = this.atBoundary ? this.options.baseColor : this.options.borderColor;
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = this.options.borderWidth;
        this.drawRoundedRect(
            thumbX + this.options.borderWidth / 2, 
            this.options.borderWidth / 2, 
            thumbWidth - this.options.borderWidth, 
            height - this.options.borderWidth,
            this.options.borderRadius
        );
        this.ctx.stroke();
    }

    /**
     * Applies inline styles to indicator elements
     * Sets dimensions, colors, and positioning
     * @private
     */
    applyStyles() {
        // Container styles - use configured width with smooth transition
        Object.assign(this.element.style, {
            width: `${this.options.width}px`,
            height: `${this.options.height + (this.options.borderWidth * 2)}px`,
            position: 'relative',
            flexShrink: '0',
            overflow: 'visible',
            transition: 'opacity 0.3s ease, visibility 0.3s ease, width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        });
        
        // Canvas styles
        Object.assign(this.canvas.style, {
            display: 'block',
            imageRendering: 'pixelated'
        });
    }

    /**
     * Handles scroll events and manages visibility
     * Shows indicator while scrolling, hides after delay
     * @private
     */
    handleScroll() {
        // Only handle scroll events if not in position mode
        if (this.usePositionMode) return;

        // Show the indicator
        this.show();

        // Update position
        this.update();

        // Clear existing hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // Set new hide timeout
        if (this.options.hideDelay > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, this.options.hideDelay);
        }
    }

    /**
     * Shows the indicator
     */
    show() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.element.style.visibility = 'visible';
            this.element.style.opacity = '1';
            this.render();
        }
    }

    /**
     * Hides the indicator
     */
    hide() {
        if (this.isVisible) {
            this.isVisible = false;
            this.element.style.opacity = '0';
            // Delay visibility hidden to allow fade-out animation
            setTimeout(() => {
                if (!this.isVisible) {
                    this.element.style.visibility = 'hidden';
                }
            }, 300); // Match transition duration
        }
        // Stop animation when hiding
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.isAnimating = false;
        }
    }

    /**
     * Sets the current position by column index (for position-based mode)
     * Calculates column from app position in grid layout
     * @param {number} row - Current row index (0-based)
     * @param {number} col - Current column index (0-based)
     * @param {number} totalRows - Total number of rows in grid
     * @param {number} totalCols - Total number of columns in grid
     */
    setPositionByGrid(row, col, totalRows, totalCols) {
        this.usePositionMode = true;
        
        // Validate input parameters
        if (typeof col !== 'number' || typeof totalCols !== 'number' || 
            col < 0 || totalCols <= 0 || !isFinite(col) || !isFinite(totalCols)) {
            console.error(`[SlimScrollIndicator] Invalid grid position: col=${col}, totalCols=${totalCols}`);
            return;
        }
        
        // Clamp column to valid range
        col = Math.max(0, Math.min(col, totalCols - 1));
        
        const oldTotalColumns = this.totalColumns;
        this.currentColumnIndex = col;
        this.totalColumns = totalCols;
        this.options.gridRows = totalRows;

        console.log(`[SlimScrollIndicator] setPositionByGrid: row=${row}, col=${col}, totalRows=${totalRows}, totalCols=${totalCols}`);

        // Show indicator when position is set
        this.show();

        // Update using column position
        this.updateByColumnPosition(oldTotalColumns !== totalCols);

        // Clear existing hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // Set new hide timeout
        if (this.options.hideDelay > 0) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, this.options.hideDelay);
        }
    }

    /**
     * Legacy method for backward compatibility
     * Converts item index to column position
     * @param {number} index - Current item index (0-based)
     * @param {number} [totalItems] - Total number of items (optional, updates total)
     */
    setPosition(index, totalItems) {
        if (totalItems !== undefined) {
            this.options.totalItems = totalItems;
        }

        // Calculate column from linear index
        totalItems = this.options.totalItems;
        const gridRows = this.options.gridRows;

        if (gridRows > 0 && totalItems > 0) {
            const col = Math.floor(index / gridRows);
            const row = index % gridRows;
            const totalCols = Math.ceil(totalItems / gridRows);

            this.setPositionByGrid(row, col, gridRows, totalCols);
        }
    }

    /**
     * Sets a custom thumb width percentage
     * This overrides the size class thumb width
     * Useful for manually controlling the indicator appearance
     * @param {number} widthPercent - Thumb width as percentage (0-100)
     */
    setThumbWidth(widthPercent) {
        if (typeof widthPercent !== 'number' || widthPercent < 0 || widthPercent > 100 || !isFinite(widthPercent)) {
            console.error(`[SlimScrollIndicator] Invalid thumb width: ${widthPercent}. Must be between 0-100.`);
            return;
        }
        
        // Update the thumb width in options
        this.options.thumbWidth = widthPercent;
        
        // If currently visible and in position mode, update immediately
        if (this.isVisible && this.usePositionMode) {
            if (this.isAnimating) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            this.startThumbWidth = this.thumbWidthPercent;
            this.targetThumbWidth = widthPercent;
            this.startThumbPosition = this.thumbPositionPercent;
            
            // Recalculate position with new width
            const targetPosition = this.totalColumns > 1
                ? (this.currentColumnIndex / (this.totalColumns - 1)) * (100 - widthPercent)
                : 0;
            this.targetThumbPosition = targetPosition;
            
            this.animationDuration = 400; // Smooth animation
            this.isAnimating = true;
            this.animationStartTime = performance.now();
            
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
            
            console.log(`[SlimScrollIndicator] Thumb width set to ${widthPercent.toFixed(2)}%`);
        } else {
            // Just set it directly if not visible or not in position mode
            this.thumbWidthPercent = widthPercent;
            console.log(`[SlimScrollIndicator] Thumb width set to ${widthPercent.toFixed(2)}%`);
        }
    }
    
    /**
     * Resets thumb width to the size class default
     */
    clearCustomThumbWidth() {
        const sizeConfig = this.sizeConfigs[this.sizeClass] || this.sizeConfigs['normal-icons'];
        this.setThumbWidth(sizeConfig.thumbWidth);
        console.log(`[SlimScrollIndicator] Thumb width reset to size class default: ${sizeConfig.thumbWidth}%`);
    }

    /**
     * Updates the indicator based on current column position
     * FIXED: Thumb width is controlled by size class, only position animates
     * @private
     */
    updateByColumnPosition(totalColumnsChanged = false) {
        if (this.totalColumns <= 0) {
            this.hide();
            return;
        }
    
        console.log(`[SlimScrollIndicator] Updating position: col=${this.currentColumnIndex}, totalCols=${this.totalColumns}`);
    
        // Use thumb width from options (set by size class or custom)
        const thumbWidth = this.options.thumbWidth;
        
        // Calculate target position based on current column and thumb width
        const targetPosition = this.totalColumns > 1
            ? (this.currentColumnIndex / (this.totalColumns - 1)) * (100 - thumbWidth)
            : 0;
    
        // Check if at boundaries
        const atLeftBoundary = this.currentColumnIndex === 0;
        const atRightBoundary = this.currentColumnIndex >= this.totalColumns - 1;
        this.atBoundary = atLeftBoundary || atRightBoundary;
    
        if (this.isAnimating) {
            cancelAnimationFrame(this.animationFrameId);
        }
    
        // Set thumb width from options (doesn't change during navigation)
        this.startThumbWidth = this.thumbWidthPercent;
        this.targetThumbWidth = thumbWidth; // Always use size class width
        
        // Update position
        this.startThumbPosition = this.thumbPositionPercent;
        this.targetThumbPosition = targetPosition;
        
        // Fast animation for position updates
        this.animationDuration = 200;
        
        this.isAnimating = true;
        this.animationStartTime = performance.now();
    
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Animation loop for smooth transitions
     * @private
     */
    animate(now) {
        if (!this.isAnimating) return;
    
        const elapsed = now - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
    
        // Easing function
        const easeOutQuart = t => 1 - (--t) * t * t * t;
        const easedProgress = easeOutQuart(progress);
    
        this.thumbWidthPercent = this.startThumbWidth + (this.targetThumbWidth - this.startThumbWidth) * easedProgress;
        this.thumbPositionPercent = this.startThumbPosition + (this.targetThumbPosition - this.startThumbPosition) * easedProgress;
    
        this.render();
    
        if (progress < 1) {
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        } else {
            this.isAnimating = false;
            this.thumbWidthPercent = this.targetThumbWidth;
            this.thumbPositionPercent = this.targetThumbPosition;
            // Final render to ensure exact position
            this.render();
        }
    }

    /**
     * Updates the indicator position and width based on scroll position
     * Calculates thumb size proportional to visible area
     * Shows baseColor when at boundary
     */
    update() {
        if (!this.scrollContainer) return;

        const scrollLeft = this.scrollContainer.scrollLeft;
        const scrollWidth = this.scrollContainer.scrollWidth;
        const clientWidth = this.scrollContainer.clientWidth;

        // Check if content is scrollable
        const scrollableWidth = scrollWidth - clientWidth;
        if (scrollableWidth <= 0) {
            // Content doesn't scroll, hide immediately
            if (this.isVisible) {
                this.hide();
            }
            return;
        }

        // Check if at boundaries (with small tolerance)
        const tolerance = 2;
        const atLeftBoundary = scrollLeft <= tolerance;
        const atRightBoundary = scrollLeft >= scrollableWidth - tolerance;
        const newAtBoundary = atLeftBoundary || atRightBoundary;

        // Update boundary state
        if (newAtBoundary !== this.atBoundary) {
            this.atBoundary = newAtBoundary;
        }

        // Calculate thumb width as percentage of visible area
        this.thumbWidthPercent = (clientWidth / scrollWidth) * 100;

        // Calculate thumb position as percentage of scrollable area
        this.thumbPositionPercent = (scrollLeft / scrollableWidth) * (100 - this.thumbWidthPercent);

        // Render updated indicator
        this.render();
    }

    /**
     * Updates the grid configuration (rows)
     * @param {number} gridRows - New number of rows
     */
    updateGridRows(gridRows) {
        this.options.gridRows = gridRows;
        console.log(`[SlimScrollIndicator] Updated grid rows to ${gridRows}`);
    }

    /**
     * Updates the size class and corresponding dimensions
     * @param {string} sizeClass - New size class (tiny-icons, small-icons, etc.")
     */
    updateSizeClass(sizeClass) {
        if (this.sizeConfigs[sizeClass]) {
            this.sizeClass = sizeClass;
            const sizeConfig = this.sizeConfigs[sizeClass];
            
            // Container width is always 320px (fixed)
            this.options.width = 320;
            
            // Update thumb width from size config
            this.options.thumbWidth = sizeConfig.thumbWidth;
            
            console.log(`[SlimScrollIndicator] Updated size class to ${sizeClass} (container: 320px, thumb: ${sizeConfig.thumbWidth}%)`);
            
            // Container width is fixed, no need to update element width
            // Just update canvas dimensions and re-render
            this.setupCanvas();
            
            // Update thumb width and re-render if visible and in position mode
            if (this.isVisible && this.usePositionMode) {
                // Recalculate position with new thumb width
                this.updateByColumnPosition(false);
            } else if (this.isVisible) {
                this.render();
            }
        } else {
            console.warn(`[SlimScrollIndicator] Unknown size class: ${sizeClass}`);
        }
    }

    /**
     * Updates indicator color theme
     * @param {string} [color] - New indicator color (optional)
     * @param {string} [backgroundColor] - New track color (optional)
     * @param {string} [borderColor] - New border color (optional)
     * @param {string} [baseColor] - New base/boundary color (optional)
     * @param {string} [glowColor] - New glow color (optional)
     */
    setColors(color, backgroundColor, borderColor, baseColor, glowColor) {
        if (color) this.options.color = color;
        if (backgroundColor) this.options.backgroundColor = backgroundColor;
        if (borderColor) this.options.borderColor = borderColor;
        if (baseColor) this.options.baseColor = baseColor;
        if (glowColor) this.options.glowColor = glowColor;
        
        // Re-render with new colors
        if (this.isVisible) {
            this.render();
        }
    }

    /**
     * Cleans up resources and removes event listeners
     * Should be called when indicator is no longer needed
     */
    destroy() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        if (this.scrollContainer && this.scrollHandler) {
            this.scrollContainer.removeEventListener('scroll', this.scrollHandler);
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.scrollContainer = null;
        this.scrollHandler = null;
        this.ctx = null;
        this.canvas = null;
    }
}