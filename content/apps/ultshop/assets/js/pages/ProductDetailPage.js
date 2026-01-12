// Product Detail Page (Redesigned with details in header - FIXED rich text rendering)
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';

export class ProductDetailPage extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.pageContainer = null;
        this.contentContainer = null; // NEW: Separate container for fadeable content
        this.backButton = null;
        this.addToCartButton = null;
    }

    render() {
        this.renderTopScreen();
        this.renderBottomScreen();
        this.animatePageIn();
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
        
        // Fade in only - no slide or scale
        this.contentContainer.style.opacity = '0';
        this.contentContainer.style.transition = 'opacity 0.3s ease-out';
        
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.contentContainer.style.opacity = '1';
            });
        });
        
        // Animate header and content separately with fade only
        setTimeout(() => {
            const header = this.contentContainer.querySelector('.page-header');
            const detail = this.contentContainer.querySelector('.product-detail');
            
            if (header) {
                header.style.opacity = '0';
                header.style.transition = 'opacity 0.3s ease-out 0.1s';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        header.style.opacity = '1';
                    });
                });
            }
            
            if (detail) {
                detail.style.opacity = '0';
                detail.style.transition = 'opacity 0.3s ease-out 0.2s';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        detail.style.opacity = '1';
                    });
                });
            }
        }, 50);
    }

    renderTopScreen() {
        const ctx = this.app.topCtx;
        const { width, height } = this.app.resolution.topScreen;
        const colors = this.app.colors;
        const product = this.app.selectedProduct;

        ctx.clearRect(0, 0, width, height);

        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.primaryDark);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw time bar
        this.drawTimeBar(ctx, width);

        // Draw product display image (large preview)
        if (product && product.displayImage) {
            const img = this.app.imageManager.getImage(product.displayImage);
            if (img) {
                // Center the image
                const imgWidth = 360;
                const imgHeight = 200;
                const x = (width - imgWidth) / 2;
                const y = (height - imgHeight) / 2 + 11; // Offset for time bar
                
                ctx.drawImage(img, x, y, imgWidth, imgHeight);
            }
        }
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
            // Fallback
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

    renderBottomScreen() {
        const colors = this.app.colors;
        const product = this.app.selectedProduct;

        if (!product) return;

        // Create page container (BACKGROUND - never fades)
        this.pageContainer = this.createElement('div', 'page-container active');
        this.pageContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;

        // Add bottom screen background (NEVER FADES)
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

        // Create header with product details
        const header = this.renderProductHeader(product);

        // Product description content
        const detail = this.createElement('div', 'product-detail');
        detail.style.cssText = `
            position: absolute;
            top: 65px;
            left: 10px;
            width: 300px;
            height: calc(100% - 120px);
            overflow-y: auto;
            scrollbar-width: none;
        `;

        // Description canvas (with rich text) - FIXED
        if (product.description) {
            const descTokens = this.app.richTextRenderer.parseInlineFormatting(product.description);
            const descCanvas = this.createCanvas(300, 150);
            const descCtx = descCanvas.getContext('2d');
            descCtx.imageSmoothingEnabled = false;
            
            // FIXED: Properly render rich text with correct parameters
            const descResult = this.app.richTextRenderer.renderInlineFormattedText(
                descCtx,
                descTokens.tokens,
                0,
                0,
                `12px ${this.app.font.family}`,
                colors.text,
                300,
                1.4,
                false,
                0  // startX for wrapping
            );
            
            // Adjust canvas height to fit content
            if (descResult && descResult.height > 0) {
                descCanvas.height = Math.max(descResult.height + 10, 150);
                
                // Re-render after resizing
                descCtx.clearRect(0, 0, 300, descCanvas.height);
                this.app.richTextRenderer.renderInlineFormattedText(
                    descCtx,
                    descTokens.tokens,
                    0,
                    0,
                    `12px ${this.app.font.family}`,
                    colors.text,
                    300,
                    1.4,
                    false,
                    0
                );
            }
            
            detail.appendChild(descCanvas);
        }

        // Button bar
        const buttonBar = this.renderButtonBar();

        this.contentContainer.appendChild(header);
        this.contentContainer.appendChild(detail);
        this.contentContainer.appendChild(buttonBar);
        this.pageContainer.appendChild(this.contentContainer);
        this.app.bottomScreen.appendChild(this.pageContainer);
    }

    renderProductHeader(product) {
        const header = this.createElement('div', 'page-header');
        const colors = this.app.colors;
        header.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            z-index: 5;
        `;
        
        // Canvas background for header
        const headerBg = this.createCanvas(320, 60);
        headerBg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
        `;
        const headerBgCtx = headerBg.getContext('2d');
        headerBgCtx.imageSmoothingEnabled = false;
        
        // Draw header background with gradient
        const gradient = headerBgCtx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        gradient.addColorStop(1, 'rgba(245, 245, 245, 0.98)');
        headerBgCtx.fillStyle = gradient;
        headerBgCtx.fillRect(0, 0, 320, 60);
        
        // Border
        headerBgCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        headerBgCtx.lineWidth = 1;
        headerBgCtx.beginPath();
        headerBgCtx.moveTo(0, 59.5);
        headerBgCtx.lineTo(320, 59.5);
        headerBgCtx.stroke();
        
        header.appendChild(headerBg);
        
        // Product title canvas (separate canvas)
        const titleCanvas = this.createCanvas(200, 20);
        titleCanvas.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1;
        `;
        const titleCtx = titleCanvas.getContext('2d');
        titleCtx.imageSmoothingEnabled = false;
        
        const nameTokens = this.app.richTextRenderer.parseInlineFormatting(product.name);
        this.app.richTextRenderer.renderInlineFormattedText(
            titleCtx,
            nameTokens.tokens,
            0,
            0,
            `bold 14px ${this.app.font.family}`,
            colors.primaryDark,
            200,
            1.2,
            false,
            0
        );
        header.appendChild(titleCanvas);
        
        // Creator canvas (separate canvas)
        const creatorCanvas = this.createCanvas(200, 16);
        creatorCanvas.style.cssText = `
            position: absolute;
            top: 38px;
            left: 10px;
            z-index: 1;
        `;
        const creatorCtx = creatorCanvas.getContext('2d');
        creatorCtx.imageSmoothingEnabled = false;
        creatorCtx.fillStyle = colors.textSubtle;
        creatorCtx.font = `11px ${this.app.font.family}`;
        creatorCtx.textAlign = 'left';
        creatorCtx.textBaseline = 'top';
        creatorCtx.fillText(`${this.app.t('by')} ${product.author}`, 0, 0);
        header.appendChild(creatorCanvas);
        
        // Price canvas (separate canvas, right-aligned)
        const priceCanvas = this.createCanvas(100, 24);
        priceCanvas.style.cssText = `
            position: absolute;
            top: 18px;
            right: 10px;
            z-index: 1;
        `;
        const priceCtx = priceCanvas.getContext('2d');
        priceCtx.imageSmoothingEnabled = false;
        
        const priceTokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
        priceCtx.textAlign = 'right';
        this.app.richTextRenderer.renderInlineFormattedText(
            priceCtx,
            priceTokens.tokens,
            100,
            0,
            `bold 18px ${this.app.font.family}`,
            colors.primary,
            100,
            1,
            false,
            0,
            true // Right align
        );
        header.appendChild(priceCanvas);

        return header;
    }

    renderButtonBar() {
        const buttonBar = this.createElement('div', 'button-bar');
        buttonBar.style.cssText = `
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
        
        // Small red Back button (bottom-left)
        const backButtonWrapper = this.createElement('div', 'canvas-button-wrapper');
        backButtonWrapper.style.cssText = `
            position: relative;
            z-index: 1;
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
                this.fadeOut(() => {
                    this.app.renderStorefront();
                });
            }
        });
        backButtonWrapper.appendChild(this.backButton.element);
        buttonBar.appendChild(backButtonWrapper);

        // Large Add to Cart button (bottom-right)
        const addToCartWrapper = this.createElement('div', 'canvas-button-wrapper');
        addToCartWrapper.style.cssText = `
            position: relative;
            z-index: 1;
        `;
        this.addToCartButton = new CanvasButton({
            app: this.app,
            text: this.app.t('addToCart'),
            width: 220,
            height: 38,
            font: `bold 13px ${this.app.font.family}`,
            fontSize: 13,
            fontWeight: 'bold',
            fontFamily: this.app.font.family,
            textColor: colors.white,
            backgroundColor: colors.primary,
            hoverBackgroundColor: this.adjustColor(colors.primary, -20),
            pressedBackgroundColor: this.adjustColor(colors.primary, -40),
            borderRadius: 6,
            onClick: () => {
                this.app.addToCart(this.app.selectedProduct);
                this.fadeOut(() => {
                    this.app.renderStorefront();
                });
            }
        });
        addToCartWrapper.appendChild(this.addToCartButton.element);
        buttonBar.appendChild(addToCartWrapper);

        return buttonBar;
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

    adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
    }

    destroy() {
        if (this.backButton) {
            this.backButton.destroy();
        }
        if (this.addToCartButton) {
            this.addToCartButton.destroy();
        }
        if (this.pageContainer && this.pageContainer.parentNode) {
            this.pageContainer.parentNode.removeChild(this.pageContainer);
        }
    }
}
