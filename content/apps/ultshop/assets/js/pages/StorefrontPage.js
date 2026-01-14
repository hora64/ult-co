// Storefront Page - Fully Canvas-Based with Horizontal Infinite Scroll
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { Scrollbar } from '/content/common/utils/canvasUI/components/Scrollbar.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { ProductIcon } from '/content/apps/ultshop/assets/js/ProductIcon.js';

export class StorefrontPage extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.pageContainer = null;
        this.contentContainer = null; // NEW: Separate container for fadeable content
        this.scrollContainer = null;
        this.scrollbar = null;
        this.productIcons = [];
        this.selectedProductIndex = 0;
        this.clockInterval = null;
        this.backButton = null;
        this.sortButton = null; // Changed from filterButton
        this.keyboardHandler = null;
        this.isScaling = false; // NEW: Track if icons are currently scaling
        
        // Horizontal scroll settings - ONE ROW with gradual scaling based on distance
        this.iconSize = 48; // Base size for unselected icons
        this.focusedIconSize = 68; // Largest - selected/focused product
        this.adjacentIconSize = 56; // Medium-large - products immediately next to focused (±1)
        this.farIconSize = 46; // Medium-small - products two away from focused (±2)
        this.distantIconSize = 40; // Smallest - products far from focused (±3+)
        this.iconGap = 8;
        this.scrollOffset = 0;
        this.scrollContainerHeight = 85; // Taller scroll container to accommodate largest icons
        
        // Initialize ProductIcon system
        this.productIconSystem = new ProductIcon();
        
        // SFX placeholders - paths from CSS variables or fallbacks
        this.sfx = {
            hover: '/content/common/sfx/select.ogg',
            select: '/content/common/sfx/select5.ogg',
            navigate: '/content/common/sfx/select6.ogg',
            open: '/content/common/sfx/open.ogg',
            click: '/content/common/sfx/select3.ogg'
        };
    }

    render() {
        this.renderTopScreen();
        this.renderBottomScreen();
        this.animatePageIn();
        this.startClock();
        this.setupKeyboardNavigation();
    }

    /**
     * Fade out page with callback - ONLY FADES CONTENT, NOT BACKGROUND
     * @param {Function} callback - Function to call after fade out
     */
    fadeOut(callback) {
        if (!this.contentContainer) {
            if (callback) callback();
            return;
        }
        
        this.contentContainer.style.transition = 'opacity 0.25s ease-out';
        this.contentContainer.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, 250);
    }

    animatePageIn() {
        if (!this.contentContainer) return;
        
        // Fade in only - no slide
        this.contentContainer.style.opacity = '0';
        this.contentContainer.style.transition = 'opacity 0.3s ease-out';
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.contentContainer.style.opacity = '1';
            });
        });
    }

    renderTopScreen() {
        const ctx = this.app.topCtx;
        const { width, height } = this.app.resolution.topScreen;
        const colors = this.app.colors;

        ctx.clearRect(0, 0, width, height);

        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.primaryDark);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw time bar at top
        this.drawTimeBar(ctx, width);

        // Draw store logo/title (centered)
        ctx.fillStyle = colors.textLight;
        ctx.font = `bold 32px ${this.app.font.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('UltShop', width / 2, height / 2 - 20);

        ctx.font = `16px ${this.app.font.family}`;
        ctx.fillText('Digital Asset Marketplace', width / 2, height / 2 + 20);
    }

    drawTimeBar(ctx, width) {
        const colors = this.app.colors;
        
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, 22);
        
        // App name (left)
        ctx.fillStyle = colors.textLight;
        ctx.font = `bold 11px ${this.app.font.family}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('UltShop', 10, 11);
        
        // Time display (right) - using Luxon
        if (typeof luxon !== 'undefined') {
            const now = luxon.DateTime.local();
            const timeStr = now.toFormat('MMM d, h:mm a ZZZZ');
            
            ctx.font = `11px ${this.app.font.family}`;
            ctx.textAlign = 'right';
            ctx.fillText(timeStr, width - 10, 11);
        } else {
            // Fallback to regular Date if Luxon not available
            const now = new Date();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const timeStr = `${months[now.getMonth()]} ${now.getDate()}, ${displayHours}:${minutes} ${ampm}`;
            
            ctx.font = `11px ${this.app.font.family}`;
            ctx.textAlign = 'right';
            ctx.fillText(timeStr, width - 10, 11);
        }
    }

    startClock() {
        // Update every second
        this.clockInterval = setInterval(() => {
            // Redraw top screen to update time
            this.renderTopScreen();
        }, 1000);
    }

    renderBottomScreen() {
        // Create page container (BACKGROUND - never fades)
        this.pageContainer = this.createElement('div', 'page-container active');
        this.pageContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        // Add bottom screen background canvas (NEVER FADES)
        this.renderBottomBackground();

        // Create content container (THIS FADES)
        this.contentContainer = this.createElement('div', 'content-container');
        this.contentContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;

        // Create info panel canvas (fully canvas-based)
        this.renderInfoPanel();

        // Calculate vertical center position for product grid (TALLER)
        const bottomScreenHeight = 240; // Bottom screen height
        const infoPanelHeight = 65;
        const scrollbarHeight = 14;
        const footerHeight = 45;
        const iconAreaHeight = this.scrollContainerHeight; // Now 85px (taller)
        
        // Available space between info panel and footer
        const availableSpace = bottomScreenHeight - infoPanelHeight - footerHeight - 10; // 10px top margin for info
        
        // Center the icon area vertically in available space
        const iconTopPosition = infoPanelHeight + 5 + ((availableSpace - iconAreaHeight - scrollbarHeight) / 2);

        // Create horizontal scrollable container for product icons (ONE ROW) - TALLER
        this.scrollContainer = this.createElement('div', 'scroll-container');
        this.scrollContainer.style.cssText = `
            position: absolute;
            top: ${iconTopPosition}px;
            left: 10px;
            width: 300px;
            height: ${this.scrollContainerHeight}px;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            display: flex;
            align-items: center;
        `;
        
        // Hide native scrollbar
        const style = document.createElement('style');
        style.textContent = '.scroll-container::-webkit-scrollbar { display: none; }';
        document.head.appendChild(style);

        // Create horizontal canvas scrollbar - POSITIONED BELOW TALLER GRID
        this.scrollbar = new Scrollbar(this.scrollContainer, this.app, {
            orientation: 'horizontal',
            colors: {
                trackColor: 'rgba(0,0,0,0.1)',
                thumbColor: this.app.colors.primary,
                thumbHoverColor: this.adjustColor(this.app.colors.primary, -20)
            }
        });
        this.scrollbar.element.style.cssText = `
            position: absolute;
            left: 10px;
            top: ${iconTopPosition + this.scrollContainerHeight + 3}px;
            width: 300px;
        `;

        // Render all product icons in ONE ROW
        this.renderProductIcons();

        // Render footer buttons
        this.renderFooterButtons();

        this.contentContainer.appendChild(this.scrollContainer);
        this.contentContainer.appendChild(this.scrollbar.element);
        this.pageContainer.appendChild(this.contentContainer);
        this.app.bottomScreen.appendChild(this.pageContainer);
        
        // Show first product info by default and focus
        if (this.app.products.length > 0) {
            const firstProduct = this.app.products[0];
            const firstIcon = this.productIcons[0];
            if (firstIcon) {
                // Select and animate first product
                this.selectProduct(firstProduct, 0, firstIcon.glowCanvas, true);
            }
        }
        
        // Make container focusable for keyboard navigation
        this.pageContainer.setAttribute('tabindex', '0');
        this.pageContainer.focus();
    }

    renderBottomBackground() {
        const bgCanvas = this.createCanvas(320, 240);
        bgCanvas.className = 'bottom-screen-background';
        bgCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
        `;
        const ctx = bgCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, this.app.colors.gradientMid);
        gradient.addColorStop(1, this.app.colors.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 320, 240);
        
        this.pageContainer.appendChild(bgCanvas);
    }

    renderInfoPanel() {
        // Create info panel DIV container
        const infoPanel = this.createElement('div', 'product-info-panel');
        infoPanel.style.cssText = `
            position: absolute;
            top: 5px;
            left: 10px;
            width: 300px;
            height: 65px;
            z-index: 5;
            overflow: hidden;
        `;
        
        // Background canvas for gradient
        const bgCanvas = this.createCanvas(300, 65);
        bgCanvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        `;
        
        const bgCtx = bgCanvas.getContext('2d');
        bgCtx.imageSmoothingEnabled = false;
        
        // Draw gradient background with rounded corners
        this.drawRoundRect(bgCtx, 0, 0, 300, 65, 8);
        const gradient = bgCtx.createLinearGradient(0, 0, 0, 65);
        gradient.addColorStop(0, this.app.colors.primary);
        gradient.addColorStop(1, this.app.colors.primaryDark);
        bgCtx.fillStyle = gradient;
        bgCtx.fill();
        
        // Draw border
        bgCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        bgCtx.lineWidth = 1;
        bgCtx.stroke();
        
        infoPanel.appendChild(bgCanvas);
        
        // Name canvas for text
        const nameCanvas = this.createCanvas(284, 18);
        nameCanvas.style.cssText = `
            position: absolute;
            top: 12px;
            left: 8px;
            z-index: 1;
        `;
        infoPanel.appendChild(nameCanvas);
        this.infoNameCanvas = nameCanvas;
        
        // Price canvas for text
        const priceCanvas = this.createCanvas(284, 24);
        priceCanvas.style.cssText = `
            position: absolute;
            top: 35px;
            left: 8px;
            z-index: 1;
        `;
        infoPanel.appendChild(priceCanvas);
        this.infoPriceCanvas = priceCanvas;
        
        this.infoPanel = infoPanel;
        this.contentContainer.appendChild(infoPanel);
    }

    renderProductIcons() {
        const totalProducts = this.app.products.length;
        // Calculate width for ONE ROW (horizontal) with largest icon size
        const contentWidth = totalProducts * (this.focusedIconSize + this.iconGap) - this.iconGap + 200 + 50; // Extra space for sizing
        
        // Create content wrapper for ONE ROW
        const contentWrapper = this.createElement('div', 'icon-content-wrapper');
        contentWrapper.style.cssText = `
            width: ${contentWidth}px;
            height: ${this.scrollContainerHeight}px;
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: ${this.iconGap}px;
        `;
        
        // Inject CSS for selected state (HomeScreen pattern)
        if (!document.getElementById('storefront-selection-styles')) {
            const style = document.createElement('style');
            style.id = 'storefront-selection-styles';
            style.textContent = `
                .product-icon-container-wrapper {
                    transition: width 0.35s ease-out, height 0.35s ease-out, transform 0.2s ease;
                }
                
                .product-icon-container-wrapper.selected {
                    z-index: 10;
                }
                
                .product-icon-container-wrapper.selected .selection-glow {
                    z-index: 0;
                }
                
                .product-icon-container-wrapper.selected .product-icon-inner {
                    z-index: 1;
                }
                
                .selection-glow {
                    transition: opacity 0.3s ease-in-out;
                    image-rendering: crisp-edges;
                }
            `;
            document.head.appendChild(style);
        }

        this.app.products.forEach((product, index) => {
            const iconContainer = this.createProductIcon(product, index);
            
            // Start all icons at far size (will be updated on selection)
            iconContainer.style.opacity = '0';
            iconContainer.style.transform = 'scale(0.8)';
            iconContainer.style.transition = `opacity 0.3s ease-out ${index * 0.02}s, transform 0.3s ease-out ${index * 0.02}s`;
            
            contentWrapper.appendChild(iconContainer);
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    iconContainer.style.opacity = '1';
                    iconContainer.style.transform = 'scale(1)';
                });
            });
        });
        
        this.scrollContainer.appendChild(contentWrapper);
    }

    createProductIcon(product, index) {
        // Start with distant icon size (smallest - will be updated based on selection)
        const initialSize = this.distantIconSize;
        
        // Create icon container wrapper (for glow) - FIXED: Use transform-origin center for scaling
        const iconContainerWrapper = this.createElement('div', 'product-icon-container-wrapper');
        iconContainerWrapper.style.cssText = `
            position: relative;
            width: ${initialSize}px;
            height: ${initialSize}px;
            flex-shrink: 0;
            transition: width 0.35s ease-out, height 0.35s ease-out;
            transform-origin: center center;
        `;
        
        // Store product data on element for click handling
        iconContainerWrapper.dataset.productIndex = index;
        iconContainerWrapper.dataset.productId = product.id || index;
        
        const dpr = window.devicePixelRatio || 1;
        
        // Create selection glow canvas (sized for largest icon) - CENTERED, HIDDEN BY DEFAULT
        const glowSize = Math.ceil(this.focusedIconSize * 1.15);
        const glowCanvas = this.createCanvas(glowSize, glowSize);
        glowCanvas.className = 'selection-glow';
        glowCanvas.width = glowSize * dpr;
        glowCanvas.height = glowSize * dpr;
        glowCanvas.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${glowSize}px;
            height: ${glowSize}px;
            z-index: 0;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease-in-out;
        `;
        iconContainerWrapper.appendChild(glowCanvas);

        // Use ProductIcon system
        const iconContainer = this.productIconSystem.createProduct({
            label: product.name,
            icon: product.icon,
            width: initialSize,
            height: initialSize,
            onClick: (e) => {
                this.handleProductClick(e, product, index, glowCanvas);
            }
        });
        
        iconContainer.className = 'product-icon-inner';
        iconContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            width: ${initialSize}px;
            height: ${initialSize}px;
        `;
        
        // Get the button element and ensure it matches container size
        const button = iconContainer.querySelector('.product-button') || iconContainer.querySelector('.app-button');
        
        if (button) {
            // Reset all button styles
            button.style.all = 'unset';
            button.style.position = 'absolute';
            button.style.top = '0';
            button.style.left = '0';
            button.style.width = '100%';
            button.style.height = '100%';
            button.style.border = 'none';
            button.style.padding = '0';
            button.style.margin = '0';
            button.style.backgroundColor = 'transparent';
            button.style.borderRadius = '15%';
            button.style.cursor = 'pointer';
            button.style.userSelect = 'none';
            button.style.transition = 'transform 0.1s ease-out';
            button.style.outline = 'none';
            button.style.zIndex = '1';
            button.style.display = 'block';
            
            // Get canvas inside button and ensure it matches
            const canvas = button.querySelector('canvas');
            if (canvas) {
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.display = 'block';
            }
            
            // Hover effect with SFX - NO SELECTOR PREVIEW
            button.onmouseenter = () => {
                if (this.selectedProductIndex !== index) {
                    this.playSFX('hover');
                }
            };
            
            // No hover selector preview
            button.onmouseleave = null;
            
            button.onmousedown = () => {
                button.style.transform = 'scale(0.95)';
            };
            
            button.onmouseup = () => {
                button.style.transform = 'scale(1)';
            };
        }
        
        iconContainerWrapper.appendChild(iconContainer);
        
        this.productIcons.push({ 
            container: iconContainerWrapper,
            innerContainer: iconContainer,
            button,
            product, 
            glowCanvas,
            index
        });
        
        return iconContainerWrapper;
    }

    /**
     * Handles product click with HomeScreen pattern:
     * First click: Select product (show info, glow)
     * Second click: Open product detail page
     * @param {Event} event - Click event
     * @param {Object} product - Product data
     * @param {number} index - Product index
     * @param {HTMLCanvasElement} glowCanvas - Selection glow canvas (unused, will get from array)
     */
    handleProductClick(event, product, index, glowCanvas) {
        const wasSelectedBeforeClick = this.selectedProductIndex === index;
        
        if (wasSelectedBeforeClick) {
            // Second click - open detail with fade transition
            this.playSFX('open');
            console.log('[StorefrontPage] Second click - opening product detail:', product.name);
            this.fadeOut(() => {
                this.app.showProductDetail(product);
            });
        } else {
            // First click - select (get glowCanvas from productIcons array for consistency)
            this.playSFX('select');
            console.log('[StorefrontPage] First click - product selected:', product.name);
            const iconData = this.productIcons[index];
            if (iconData && iconData.glowCanvas) {
                this.selectProduct(product, index, iconData.glowCanvas, true);
            }
        }
    }

    /**
     * Play sound effect (placeholder)
     * @param {string} sfxType - Type of SFX to play (hover, select, navigate, open, click)
     */
    playSFX(sfxType) {
        if (!this.sfx[sfxType]) {
            console.warn(`[StorefrontPage] Unknown SFX type: ${sfxType}`);
            return;
        }
        
        // TODO: Implement actual sound playback
        // For now, just log the SFX that would be played
        console.log(`[StorefrontPage] SFX: ${sfxType} (${this.sfx[sfxType]})`);
        
        // Example implementation when ready:
        // const audio = new Audio(this.sfx[sfxType]);
        // audio.volume = 0.5;
        // audio.play().catch(err => console.warn('SFX play failed:', err));
    }

    /**
     * Setup keyboard navigation (arrow keys)
     * Left/Right: Navigate between products
     * Enter: Open selected product
     */
    setupKeyboardNavigation() {
        this.keyboardHandler = (event) => {
            const key = event.key;
            
            // Only handle arrow keys and Enter
            if (!['ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) {
                return;
            }
            
            event.preventDefault();
            
            const totalProducts = this.app.products.length;
            if (totalProducts === 0) return;
            
            switch (key) {
                case 'ArrowLeft':
                    // Navigate to previous product
                    this.playSFX('navigate');
                    this.navigateToProduct(this.selectedProductIndex - 1);
                    break;
                    
                case 'ArrowRight':
                    // Navigate to next product
                    this.playSFX('navigate');
                    this.navigateToProduct(this.selectedProductIndex + 1);
                    break;
                    
                case 'Enter':
                    // Open selected product detail with fade
                    this.playSFX('open');
                    const selectedProduct = this.app.products[this.selectedProductIndex];
                    if (selectedProduct) {
                        console.log('[StorefrontPage] Enter pressed - opening product:', selectedProduct.name);
                        this.fadeOut(() => {
                            this.app.showProductDetail(selectedProduct);
                        });
                    }
                    break;
            }
        };
        
        // Add keyboard event listener to page container
        if (this.pageContainer) {
            this.pageContainer.addEventListener('keydown', this.keyboardHandler);
        }
    }
    
    /**
     * Navigate to product by index (NO wrapping)
     * @param {number} targetIndex - Target product index
     */
    navigateToProduct(targetIndex) {
        const totalProducts = this.app.products.length;
        if (totalProducts === 0) return;
        
        // Clamp to valid range (NO wrapping)
        if (targetIndex < 0) {
            targetIndex = 0; // Stop at first
        } else if (targetIndex >= totalProducts) {
            targetIndex = totalProducts - 1; // Stop at last
        }
        
        // Don't navigate if we're already at the target
        if (targetIndex === this.selectedProductIndex) {
            return;
        }
        
        const product = this.app.products[targetIndex];
        const iconData = this.productIcons[targetIndex];
        
        if (product && iconData) {
            this.selectProduct(product, targetIndex, iconData.glowCanvas, true);
        }
    }

    selectProduct(product, index, glowCanvas, animate = false) {
        // Update all icon sizes based on distance from selected
        this.updateIconSizes(index, animate);
        
        // Deselect previous - INSTANT VANISH, not fade
        if (this.selectedProductIndex !== null && this.selectedProductIndex !== index) {
            const prevIcon = this.productIcons[this.selectedProductIndex];
            if (prevIcon && prevIcon.glowCanvas) {
                // INSTANT vanish - no transition
                prevIcon.glowCanvas.style.transition = 'none';
                prevIcon.glowCanvas.style.opacity = '0';
                
                // Cancel animation if exists
                if (prevIcon.glowCanvas.animationHandle) {
                    cancelAnimationFrame(prevIcon.glowCanvas.animationHandle);
                }
            }
        }

        this.selectedProductIndex = index;
        
        // Get selector image path from CSS variable
        const selectorSrc = getComputedStyle(document.documentElement)
            .getPropertyValue('--ultshop-selection-glow')
            .trim()
            .replace(/^["']|["']$/g, '') || '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
        
        // Render selection glow at focused size
        const glowOptions = {
            animated: false,
            frameCount: 1,
            currentFrame: 0,
            frameDuration: 100,
            customSrc: selectorSrc
        };
        this.renderSelectionGlow(glowCanvas, this.focusedIconSize, glowOptions);
        
        // NEW: Only show selector when icon is fully scaled
        // Wait for scaling animation to complete (350ms) before showing selector
        if (animate) {
            this.isScaling = true;
            glowCanvas.style.opacity = '0'; // Hide initially
            glowCanvas.style.transition = 'none'; // No transition initially
            
            setTimeout(() => {
                this.isScaling = false;
                // Smoother glow fade-in with bounce
                glowCanvas.style.transition = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                glowCanvas.style.opacity = '1';
            }, 350); // Match icon scaling duration
        } else {
            glowCanvas.style.transition = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            glowCanvas.style.opacity = '1';
        }
        
        // Update info panel
        this.showProductInfo(product, index);
        
        // Scroll selected product to horizontal center
        const currentIcon = this.productIcons[index];
        if (currentIcon && currentIcon.container) {
            const containerRect = this.scrollContainer.getBoundingClientRect();
            const iconRect = currentIcon.container.getBoundingClientRect();
            
            // Calculate scroll position to center the icon horizontally
            const containerCenter = containerRect.width / 2;
            const iconCenter = iconRect.width / 2;
            const scrollLeft = this.scrollContainer.scrollLeft + 
                               (iconRect.left - containerRect.left) - 
                               containerCenter + iconCenter;
            
            // Smooth scroll to center the selected icon
            this.scrollContainer.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
        
        // Keep focus on page container for keyboard navigation
        if (this.pageContainer) {
            this.pageContainer.focus();
        }
    }

    /**
     * Update all icon sizes based on distance from selected icon
     * Creates gradual size progression: focused > adjacent > far > distant
     * @param {number} selectedIndex - Index of selected product
     * @param {boolean} animate - Whether to animate the size changes
     */
    updateIconSizes(selectedIndex, animate = true) {
        this.productIcons.forEach((iconData, index) => {
            const distance = Math.abs(index - selectedIndex);
            let targetSize;
            
            // Gradual size based on distance from selected
            if (distance === 0) {
                // Focused product - largest (68px)
                targetSize = this.focusedIconSize;
            } else if (distance === 1) {
                // Products immediately next to focused - medium-large (56px)
                targetSize = this.adjacentIconSize;
            } else if (distance === 2) {
                // Products two away from focused - medium-small (46px)
                targetSize = this.farIconSize;
            } else {
                // Products far from focused (3+) - smallest (40px)
                targetSize = this.distantIconSize;
            }
            
            // Update container size with smooth transition - MAINTAIN CENTER
            if (iconData.container) {
                iconData.container.style.width = `${targetSize}px`;
                iconData.container.style.height = `${targetSize}px`;
                iconData.container.style.transformOrigin = 'center center';
            }
            
            // Ensure inner container matches wrapper size - MAINTAIN CENTER
            if (iconData.innerContainer) {
                iconData.innerContainer.style.width = `${targetSize}px`;
                iconData.innerContainer.style.height = `${targetSize}px`;
                iconData.innerContainer.style.transformOrigin = 'center center';
            }
            
            // Update button to fill inner container - MAINTAIN CENTER
            if (iconData.button) {
                iconData.button.style.width = '100%';
                iconData.button.style.height = '100%';
                iconData.button.style.transformOrigin = 'center center';
                
                const canvas = iconData.button.querySelector('canvas');
                if (canvas) {
                    // IMPORTANT: Keep canvas at 100% to fill button
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.transformOrigin = 'center center';
                    
                    // Update canvas internal size for DPR
                    const dpr = window.devicePixelRatio || 1;
                    canvas.width = targetSize * dpr;
                    canvas.height = targetSize * dpr;
                    
                    // Redraw icon at new size
                    this.productIconSystem.drawIconOnCanvas(canvas, {
                        icon: iconData.product.icon,
                        width: targetSize,
                        height: targetSize,
                        label: iconData.product.name
                    });
                }
            }
            
            // Update glow size for focused product - MAINTAIN CENTER
            if (iconData.glowCanvas && distance === 0) {
                const glowSize = Math.ceil(targetSize * 1.15);
                iconData.glowCanvas.style.width = `${glowSize}px`;
                iconData.glowCanvas.style.height = `${glowSize}px`;
                iconData.glowCanvas.style.transformOrigin = 'center center';
                // Glow already centered with transform: translate(-50%, -50%)
            }
        });
    }

    renderFooterButtons() {
        // Footer button bar (bottom of screen)
        const footerBar = this.createElement('div', 'footer-bar');
        footerBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 45px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 5px;
            z-index: 10;
        `;
        
        const colors = this.app.colors;

        // Back button (left side)
        const backButtonWrapper = this.createElement('div', 'canvas-button-wrapper');
        backButtonWrapper.style.cssText = `
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        this.backButton = new CanvasButton({
            app: this.app,
            text: '◀ Back',
            width: 90,
            height: 38,
            font: `bold 12px ${this.app.font.family}`,
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: this.app.font.family,
            textColor: colors.white,
            backgroundColor: colors.danger,
            hoverBackgroundColor: this.adjustColor(colors.danger, -20),
            pressedBackgroundColor: this.adjustColor(colors.danger, -40),
            borderRadius: 6,
            onClick: () => {
                console.log('Back button clicked - returning to home');
                this.fadeOut(() => {
                    this.app.renderHome();
                });
            }
        });
        backButtonWrapper.appendChild(this.backButton.element);
        footerBar.appendChild(backButtonWrapper);

        // Sort By button (right side) - CHANGED FROM FILTER
        const sortButtonWrapper = this.createElement('div', 'canvas-button-wrapper');
        sortButtonWrapper.style.cssText = `
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        this.sortButton = new CanvasButton({
            app: this.app,
            text: 'Sort... ▶',
            width: 95,
            height: 38,
            font: `bold 11px ${this.app.font.family}`,
            fontSize: 11,
            fontWeight: 'bold',
            fontFamily: this.app.font.family,
            textColor: colors.white,
            backgroundColor: colors.primary,
            hoverBackgroundColor: this.adjustColor(colors.primary, -20),
            pressedBackgroundColor: this.adjustColor(colors.primary, -40),
            borderRadius: 6,
            onClick: () => {
                console.log('Sort button clicked');
                this.fadeOut(() => {
                    this.app.showFilterPage();
                });
            }
        });
        sortButtonWrapper.appendChild(this.sortButton.element);
        footerBar.appendChild(sortButtonWrapper);

        this.contentContainer.appendChild(footerBar);
    }

    /**
     * Renders selection glow on a canvas (from HomeScreen pattern)
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
                // Animated sprite sheet support
                const frameWidth = img.width / frameCount;
                const sourceX = currentFrame * frameWidth;
                ctx.drawImage(
                    img,
                    sourceX, 0, frameWidth, img.height,
                    0, 0, glowSize, glowSize
                );
                
                // Cancel previous animation
                if (canvas.animationHandle) {
                    cancelAnimationFrame(canvas.animationHandle);
                }
                
                // Schedule next frame
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
                // Static glow
                ctx.drawImage(img, 0, 0, glowSize, glowSize);
            }
            
            ctx.restore();
        };
        
        img.onerror = () => {
            console.error('[StorefrontPage] Failed to load selector image:', customSrc);
            // Fallback: draw a simple glow rectangle
            this.drawFallbackGlow(ctx, glowSize, dpr);
        };
        
        img.src = customSrc || '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
    }

    /**
     * Draws a fallback glow if selector image fails to load
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} glowSize - Size of the glow
     * @param {number} dpr - Device pixel ratio
     */
    drawFallbackGlow(ctx, glowSize, dpr) {
        ctx.save();
        ctx.scale(dpr, dpr);
        
        // Draw rounded rectangle glow
        const glowColor = this.app.colors.primary;
        const radius = 8;
        
        // Shadow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Outer glow
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 4;
        this.drawRoundRect(ctx, 2, 2, glowSize - 4, glowSize - 4, radius);
        ctx.stroke();
        
        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        this.drawRoundRect(ctx, 4, 4, glowSize - 8, glowSize - 8, radius - 2);
        ctx.stroke();
        
        ctx.restore();
    }

    showProductInfo(product, index) {
        if (!this.infoNameCanvas || !this.infoPriceCanvas) return;
        
        this.selectedProductIndex = index;
        
        // Render product name on name canvas
        const nameCtx = this.infoNameCanvas.getContext('2d');
        nameCtx.clearRect(0, 0, 284, 18);
        nameCtx.imageSmoothingEnabled = false;
        
        nameCtx.save();
        nameCtx.fillStyle = this.app.colors.textLight;
        nameCtx.font = `bold 13px ${this.app.font.family}`;
        nameCtx.textAlign = 'center';
        nameCtx.textBaseline = 'middle';
        
        // Truncate text if too long
        let productName = product.name;
        const maxWidth = 268;
        let textWidth = nameCtx.measureText(productName).width;
        if (textWidth > maxWidth) {
            while (textWidth > maxWidth && productName.length > 0) {
                productName = productName.slice(0, -1);
                textWidth = nameCtx.measureText(productName + '...').width;
            }
            productName += '...';
        }
        
        nameCtx.fillText(productName, 142, 9);
        nameCtx.restore();
        
        // Render price on price canvas - FIXED SIZE 14px
        const priceCtx = this.infoPriceCanvas.getContext('2d');
        priceCtx.clearRect(0, 0, 284, 24);
        priceCtx.imageSmoothingEnabled = false;
        
        priceCtx.save();
        // Set context font BEFORE rendering
        priceCtx.font = `bold 14px ${this.app.font.family}`;
        priceCtx.textAlign = 'center';
        priceCtx.textBaseline = 'middle';
        
        const priceTokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
        
        this.app.richTextRenderer.renderInlineFormattedText(
            priceCtx,
            priceTokens.tokens,
            142, 12,
            `bold 14px ${this.app.font.family}`,
            this.app.colors.textLight,
            268, 1, false, 0
        );
        priceCtx.restore();
    }

    drawRoundRect(ctx, x, y, width, height, radius) {
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

    adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
    }

    destroy() {
        // Remove keyboard event listener
        if (this.keyboardHandler && this.pageContainer) {
            this.pageContainer.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
        
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
        if (this.backButton) {
            this.backButton.destroy();
        }
        if (this.sortButton) {
            this.sortButton.destroy();
        }
        if (this.productIconSystem) {
            this.productIconSystem.clearAllOptions();
        }
        this.productIcons = [];
        if (this.pageContainer && this.pageContainer.parentNode) {
            this.pageContainer.parentNode.removeChild(this.pageContainer);
        }
    }
}
