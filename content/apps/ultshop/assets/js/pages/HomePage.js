// Home Page - Welcome screen with featured content
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';

export class HomePage extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.pageContainer = null;
        this.contentContainer = null;
        this.clockInterval = null;
        this.browseButton = null;
        this.featuredButton = null;
        this.cartButton = null;
        this.searchInput = null; // NEW: Search input
    }

    render() {
        this.renderTopScreen();
        this.renderBottomScreen();
        this.animatePageIn();
        this.startClock();
    }

    /**
     * Fade out page with callback
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

        // Draw time bar
        this.drawTimeBar(ctx, width);

        // Draw welcome message
        ctx.fillStyle = colors.textLight;
        ctx.font = `bold 40px ${this.app.font.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Welcome to', width / 2, height / 2 - 30);
        
        ctx.font = `bold 48px ${this.app.font.family}`;
        ctx.fillText('UltShop', width / 2, height / 2 + 20);
    }

    drawTimeBar(ctx, width) {
        const colors = this.app.colors;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, 22);
        
        ctx.fillStyle = colors.textLight;
        ctx.font = `bold 11px ${this.app.font.family}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('UltShop', 10, 11);
        
        if (typeof luxon !== 'undefined') {
            const now = luxon.DateTime.local();
            const timeStr = now.toFormat('MMM d, h:mm a ZZZZ');
            
            ctx.font = `11px ${this.app.font.family}`;
            ctx.textAlign = 'right';
            ctx.fillText(timeStr, width - 10, 11);
        } else {
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
        this.clockInterval = setInterval(() => {
            this.renderTopScreen();
        }, 1000);
    }

    renderBottomScreen() {
        // Page container (never fades)
        this.pageContainer = this.createElement('div', 'page-container active');
        this.pageContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        this.renderBottomBackground();

        // Content container (fades)
        this.contentContainer = this.createElement('div', 'content-container');
        this.contentContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;

        // Search bar (top right)
        this.renderSearchBar();

        // Main content area
        const mainContent = this.createElement('div', 'main-content');
        mainContent.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-top: -10px;
        `;

        // Welcome message
        const messageCanvas = this.createCanvas(300, 60);
        const messageCtx = messageCanvas.getContext('2d');
        messageCtx.imageSmoothingEnabled = false;
        
        messageCtx.fillStyle = this.app.colors.text;
        messageCtx.font = `15px ${this.app.font.family}`;
        messageCtx.textAlign = 'center';
        messageCtx.textBaseline = 'middle';
        messageCtx.fillText('Your Digital Asset Marketplace', 150, 18);
        
        messageCtx.font = `12px ${this.app.font.family}`;
        messageCtx.fillStyle = this.app.colors.textSubtle;
        const cartItemCount = this.app.cart.length;
        const cartText = cartItemCount > 0 ? `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in cart` : 'Cart is empty';
        messageCtx.fillText(`${this.app.products.length} products • ${cartText}`, 150, 42);
        
        mainContent.appendChild(messageCanvas);

        // Browse button (smaller)
        const browseWrapper = this.createElement('div');
        this.browseButton = new CanvasButton({
            app: this.app,
            text: 'Browse Products',
            width: 240,
            height: 42,
            font: `bold 14px ${this.app.font.family}`,
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: this.app.font.family,
            textColor: this.app.colors.white,
            backgroundColor: this.app.colors.primary,
            hoverBackgroundColor: this.adjustColor(this.app.colors.primary, -20),
            pressedBackgroundColor: this.adjustColor(this.app.colors.primary, -40),
            borderRadius: 6,
            onClick: () => {
                this.fadeOut(() => {
                    this.app.renderStorefront();
                });
            }
        });
        browseWrapper.appendChild(this.browseButton.element);
        mainContent.appendChild(browseWrapper);

        // Featured products button (smaller)
        const featuredWrapper = this.createElement('div');
        this.featuredButton = new CanvasButton({
            app: this.app,
            text: 'Featured Products',
            width: 240,
            height: 36,
            font: `13px ${this.app.font.family}`,
            fontSize: 13,
            fontWeight: 'normal',
            fontFamily: this.app.font.family,
            textColor: this.app.colors.text,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
            pressedBackgroundColor: 'rgba(240, 240, 240, 1)',
            borderRadius: 6,
            onClick: () => {
                this.fadeOut(() => {
                    this.app.renderStorefront(); // TODO: Add featured filter
                });
            }
        });
        featuredWrapper.appendChild(this.featuredButton.element);
        mainContent.appendChild(featuredWrapper);

        // Cart button (smaller)
        const cartWrapper = this.createElement('div');
        const cartItemCount = this.app.cart.length;
        const cartButtonText = cartItemCount > 0 
            ? `View Cart (${cartItemCount})` 
            : 'View Cart';
        
        this.cartButton = new CanvasButton({
            app: this.app,
            text: cartButtonText,
            width: 240,
            height: 36,
            font: `13px ${this.app.font.family}`,
            fontSize: 13,
            fontWeight: 'normal',
            fontFamily: this.app.font.family,
            textColor: cartItemCount > 0 ? this.app.colors.white : this.app.colors.text,
            backgroundColor: cartItemCount > 0 
                ? this.app.colors.primary 
                : 'rgba(255, 255, 255, 0.9)',
            hoverBackgroundColor: cartItemCount > 0 
                ? this.adjustColor(this.app.colors.primary, -20) 
                : 'rgba(255, 255, 255, 1)',
            pressedBackgroundColor: cartItemCount > 0 
                ? this.adjustColor(this.app.colors.primary, -40) 
                : 'rgba(240, 240, 240, 1)',
            borderRadius: 6,
            onClick: () => {
                this.fadeOut(() => {
                    this.app.showCart();
                });
            }
        });
        cartWrapper.appendChild(this.cartButton.element);
        mainContent.appendChild(cartWrapper);

        this.contentContainer.appendChild(mainContent);
        this.pageContainer.appendChild(this.contentContainer);
        this.app.bottomScreen.appendChild(this.pageContainer);
    }

    renderSearchBar() {
        const searchContainer = this.createElement('div', 'search-container');
        searchContainer.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 160px;
            height: 32px;
            z-index: 10;
        `;

        // Search input
        this.searchInput = this.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search products...';
        this.searchInput.style.cssText = `
            width: 100%;
            height: 100%;
            border: 2px solid ${this.app.colors.primary};
            border-radius: 6px;
            padding: 0 10px;
            font-family: ${this.app.font.family};
            font-size: 12px;
            background: rgba(255, 255, 255, 0.95);
            color: ${this.app.colors.text};
            outline: none;
            box-sizing: border-box;
        `;

        // Search on Enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = this.searchInput.value.trim();
                if (searchTerm) {
                    console.log('[HomePage] Search:', searchTerm);
                    // Store search term and navigate to storefront
                    this.app.searchTerm = searchTerm;
                    this.fadeOut(() => {
                        this.app.renderStorefront();
                    });
                }
            }
        });

        // Focus styling
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.style.borderColor = this.adjustColor(this.app.colors.primary, -30);
            this.searchInput.style.background = 'rgba(255, 255, 255, 1)';
        });

        this.searchInput.addEventListener('blur', () => {
            this.searchInput.style.borderColor = this.app.colors.primary;
            this.searchInput.style.background = 'rgba(255, 255, 255, 0.95)';
        });

        searchContainer.appendChild(this.searchInput);
        this.contentContainer.appendChild(searchContainer);
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
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        if (this.browseButton) {
            this.browseButton.destroy();
        }
        if (this.featuredButton) {
            this.featuredButton.destroy();
        }
        if (this.cartButton) {
            this.cartButton.destroy();
        }
        if (this.searchInput && this.searchInput.parentNode) {
            this.searchInput.parentNode.removeChild(this.searchInput);
        }
        if (this.pageContainer && this.pageContainer.parentNode) {
            this.pageContainer.parentNode.removeChild(this.pageContainer);
        }
    }
}
