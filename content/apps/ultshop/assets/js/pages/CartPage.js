// Shopping Cart Page (Canvas backgrounds)
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';

export class CartPage extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.pageContainer = null;
        this.backButton = null;
        this.checkoutButton = null;
        this.cartItems = [];
    }

    render() {
        this.renderTopScreen();
        this.renderBottomScreen();
        this.animatePageIn();
    }

    /**
     * Fade out page with callback
     * @param {Function} callback - Function to call after fade out
     */
    fadeOut(callback) {
        if (!this.pageContainer) {
            if (callback) callback();
            return;
        }
        
        this.pageContainer.style.transition = 'opacity 0.25s ease-out';
        this.pageContainer.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, 250);
    }

    animatePageIn() {
        if (!this.pageContainer) return;
        
        // Fade in only - no slide
        this.pageContainer.style.opacity = '0';
        this.pageContainer.style.transition = 'opacity 0.3s ease-out';
        
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.pageContainer.style.opacity = '1';
            });
        });
        
        // Animate cart items with fade only
        setTimeout(() => {
            const items = this.pageContainer.querySelectorAll('.cart-item-wrapper, .cart-total-wrapper');
            items.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transition = `opacity 0.3s ease-out ${index * 0.05}s`;
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                    });
                });
            });
        }, 100);
    }

    renderTopScreen() {
        const ctx = this.app.topCtx;
        const { width, height } = this.app.resolution.topScreen;
        const colors = this.app.colors;

        ctx.clearRect(0, 0, width, height);

        // Cart title
        ctx.fillStyle = colors.primaryDark;
        ctx.font = `bold 32px ${this.app.font.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.app.t('cart'), width / 2, height / 2);
    }

    renderBottomScreen() {
        const colors = this.app.colors;

        // Create page container
        this.pageContainer = this.createElement('div', 'page-container active');

        // Add bottom screen background
        this.renderBottomBackground();

        // Create header with canvas background
        const header = this.renderHeader();

        // Cart items list
        const cartList = this.createElement('div', 'cart-list');

        if (this.app.cart.length === 0) {
            const emptyWrapper = this.createElement('div', 'cart-empty-wrapper');
            const emptyCanvas = this.createCanvas(280, 40);
            const emptyCtx = emptyCanvas.getContext('2d');
            emptyCtx.imageSmoothingEnabled = false;
            emptyCtx.fillStyle = colors.textSubtle;
            emptyCtx.font = `14px ${this.app.font.family}`;
            emptyCtx.textAlign = 'center';
            emptyCtx.textBaseline = 'middle';
            emptyCtx.fillText(this.app.t('cartEmpty'), 140, 20);
            emptyWrapper.appendChild(emptyCanvas);
            cartList.appendChild(emptyWrapper);
        } else {
            let total = 0;
            
            this.app.cart.forEach((item, index) => {
                const itemWrapper = this.createCartItem(item, index);
                cartList.appendChild(itemWrapper);
                
                // Parse uCoin price (remove commas)
                const price = parseFloat(item.price.replace(/,/g, ''));
                total += price;
            });

            // Total canvas (using uCoin symbol)
            const totalWrapper = this.createElement('div', 'cart-total-wrapper');
            const totalCanvas = this.createCanvas(280, 30);
            const totalCtx = totalCanvas.getContext('2d');
            totalCtx.imageSmoothingEnabled = false;
            
            const totalText = this.app.t('total') + ':';
            const totalAmount = `⚬ ${total.toLocaleString()}`;
            
            // FIXED: Set proper font context before rendering
            totalCtx.save();
            totalCtx.textAlign = 'left';
            totalCtx.textBaseline = 'middle';
            totalCtx.font = `bold 16px ${this.app.font.family}`;
            
            // Draw "Total:" label
            totalCtx.fillStyle = colors.text;
            totalCtx.fillText(totalText, 10, 15);
            
            // Measure label to position amount correctly
            const labelWidth = totalCtx.measureText(totalText).width;
            
            // Draw amount with uCoin symbol
            totalCtx.fillStyle = colors.primary;
            totalCtx.fillText(totalAmount, 20 + labelWidth, 15);
            
            totalCtx.restore();
            
            totalWrapper.appendChild(totalCanvas);
            cartList.appendChild(totalWrapper);
        }

        // Button bar with canvas background
        const buttonBar = this.renderButtonBar();

        this.pageContainer.appendChild(header);
        this.pageContainer.appendChild(cartList);
        this.pageContainer.appendChild(buttonBar);
        this.app.bottomScreen.appendChild(this.pageContainer);
    }

    renderHeader() {
        const header = this.createElement('div', 'page-header');
        const colors = this.app.colors;
        
        // COMPACT: Reduced header height from 40 to 32
        const headerBg = this.createCanvas(320, 32);
        const headerBgCtx = headerBg.getContext('2d');
        headerBgCtx.imageSmoothingEnabled = false;
        
        // Draw header background
        headerBgCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        headerBgCtx.fillRect(0, 0, 320, 32);
        
        // Border
        headerBgCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        headerBgCtx.lineWidth = 1;
        headerBgCtx.beginPath();
        headerBgCtx.moveTo(0, 31.5);
        headerBgCtx.lineTo(320, 31.5);
        headerBgCtx.stroke();
        
        headerBg.style.position = 'absolute';
        headerBg.style.top = '0';
        headerBg.style.left = '0';
        headerBg.style.zIndex = '0';
        header.appendChild(headerBg);
        
        // COMPACT: Smaller title canvas
        const titleCanvas = this.createCanvas(80, 26);
        titleCanvas.style.position = 'relative';
        titleCanvas.style.zIndex = '1';
        const titleCtx = titleCanvas.getContext('2d');
        titleCtx.imageSmoothingEnabled = false;
        titleCtx.fillStyle = colors.primaryDark;
        titleCtx.font = `bold 16px ${this.app.font.family}`; // Reduced from 18px
        titleCtx.textAlign = 'left';
        titleCtx.textBaseline = 'middle';
        titleCtx.fillText(this.app.t('cart'), 0, 13);
        header.appendChild(titleCanvas);
        
        return header;
    }

    renderButtonBar() {
        const buttonBar = this.createElement('div', 'button-bar');
        const colors = this.app.colors;
        
        // Canvas background for button bar
        const buttonBarBg = this.createCanvas(320, 45);
        const buttonBarBgCtx = buttonBarBg.getContext('2d');
        buttonBarBgCtx.imageSmoothingEnabled = false;
        
        // Draw button bar background
        buttonBarBgCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        buttonBarBgCtx.fillRect(0, 0, 320, 45);
        
        // Border
        buttonBarBgCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        buttonBarBgCtx.lineWidth = 1;
        buttonBarBgCtx.beginPath();
        buttonBarBgCtx.moveTo(0, 0.5);
        buttonBarBgCtx.lineTo(320, 0.5);
        buttonBarBgCtx.stroke();
        
        buttonBarBg.style.position = 'absolute';
        buttonBarBg.style.top = '0';
        buttonBarBg.style.left = '0';
        buttonBarBg.style.zIndex = '0';
        buttonBar.appendChild(buttonBarBg);

        // Back button
        const backButtonWrapper = this.createElement('div', 'canvas-button-wrapper');
        backButtonWrapper.style.position = 'relative';
        backButtonWrapper.style.zIndex = '1';
        this.backButton = new CanvasButton({
            app: this.app,
            text: this.app.t('backToStore'),
            width: 145,
            height: 35,
            font: `bold 14px ${this.app.font.family}`,
            fontSize: 14,
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

        // Checkout button (only if cart has items)
        if (this.app.cart.length > 0) {
            const checkoutWrapper = this.createElement('div', 'canvas-button-wrapper');
            checkoutWrapper.style.position = 'relative';
            checkoutWrapper.style.zIndex = '1';
            this.checkoutButton = new CanvasButton({
                app: this.app,
                text: this.app.t('checkout'),
                width: 145,
                height: 35,
                font: `bold 14px ${this.app.font.family}`,
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: this.app.font.family,
                textColor: colors.white,
                backgroundColor: colors.primary,
                hoverBackgroundColor: this.adjustColor(colors.primary, -20),
                pressedBackgroundColor: this.adjustColor(colors.primary, -40),
                borderRadius: 6,
                onClick: () => {
                    this.fadeOut(() => {
                        this.app.checkout();
                    });
                }
            });
            checkoutWrapper.appendChild(this.checkoutButton.element);
            buttonBar.appendChild(checkoutWrapper);
        }

        return buttonBar;
    }

    renderBottomBackground() {
        const bgCanvas = this.createCanvas(320, 240);
        bgCanvas.className = 'bottom-screen-background';
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

    createCartItem(item, index) {
        const wrapper = this.createElement('div', 'cart-item-wrapper');
        
        // Create canvas for cart item (300x35)
        const canvas = this.createCanvas(300, 35);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const colors = this.app.colors;

        // Draw item background
        ctx.fillStyle = colors.white;
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;
        this.drawRoundRect(ctx, 0, 0, 300, 35, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Draw border
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        this.drawRoundRect(ctx, 0.5, 0.5, 299, 34, 3);
        ctx.stroke();

        // Item name (with rich text support)
        ctx.fillStyle = colors.text;
        ctx.font = `11px ${this.app.font.family}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const nameTokens = this.app.richTextRenderer.parseInlineFormatting(item.name);
        this.app.richTextRenderer.renderInlineFormattedText(
            ctx,
            nameTokens.tokens,
            10,
            17,
            `11px ${this.app.font.family}`,
            colors.text,
            220,
            1.1,
            false,
            10
        );

        // Item price (using uCoin symbol)
        ctx.fillStyle = colors.primary;
        ctx.font = `bold 12px ${this.app.font.family}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`⚬ ${item.price}`, 290, 17);

        wrapper.appendChild(canvas);
        this.cartItems.push({ canvas, item });
        
        return wrapper;
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
        if (this.backButton) {
            this.backButton.destroy();
        }
        if (this.checkoutButton) {
            this.checkoutButton.destroy();
        }
        this.cartItems = [];
        if (this.pageContainer && this.pageContainer.parentNode) {
            this.pageContainer.parentNode.removeChild(this.pageContainer);
        }
    }
}
