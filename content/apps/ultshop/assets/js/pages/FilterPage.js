// Sort Page - Simple product sorting options
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';

export class FilterPage extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.pageContainer = null;
        this.contentContainer = null;
        this.backButton = null;
        this.clockInterval = null;
        
        // Sort options (simplified - removed filters)
        this.sortBy = this.app.sortBy || 'featured';
        this.sortOptions = [
            { value: 'featured', label: '⭐ Featured' },
            { value: 'name-asc', label: 'Name (A-Z)' },
            { value: 'name-desc', label: 'Name (Z-A)' },
            { value: 'price-low', label: 'Price (Low → High)' },
            { value: 'price-high', label: 'Price (High → Low)' },
            { value: 'newest', label: '🆕 Newest First' }
        ];
    }

    render() {
        this.renderTopScreen();
        this.renderBottomScreen();
        this.animatePageIn();
        this.startClock();
    }

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

        // Draw time bar at top
        this.drawTimeBar(ctx, width);

        // Draw filter title
        ctx.fillStyle = colors.textLight;
        ctx.font = `bold 36px ${this.app.font.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sort Products', width / 2, height / 2 - 10);

        ctx.font = `14px ${this.app.font.family}`;
        ctx.fillText('Choose how to organize products', width / 2, height / 2 + 25);
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

        // Sort options
        this.renderSortOptions();

        // Footer buttons
        this.renderFooterButtons();

        this.pageContainer.appendChild(this.contentContainer);
        this.app.bottomScreen.appendChild(this.pageContainer);
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

    renderSortOptions() {
        const optionsArea = this.createElement('div', 'sort-options-area');
        optionsArea.style.cssText = `
            position: absolute;
            top: 20px;
            left: 10px;
            width: 300px;
            height: 175px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 5;
        `;
        
        this.sortOptions.forEach(option => {
            const isSelected = this.sortBy === option.value;
            
            const buttonWrapper = this.createElement('div');
            const sortButton = new CanvasButton({
                app: this.app,
                text: option.label,
                width: 300,
                height: 26,
                font: `${isSelected ? 'bold' : 'normal'} 13px ${this.app.font.family}`,
                fontSize: 13,
                fontWeight: isSelected ? 'bold' : 'normal',
                fontFamily: this.app.font.family,
                textColor: isSelected ? this.app.colors.white : this.app.colors.text,
                backgroundColor: isSelected ? this.app.colors.primary : 'rgba(255,255,255,0.9)',
                hoverBackgroundColor: isSelected 
                    ? this.adjustColor(this.app.colors.primary, -20) 
                    : 'rgba(255,255,255,1)',
                pressedBackgroundColor: isSelected 
                    ? this.adjustColor(this.app.colors.primary, -40) 
                    : 'rgba(240,240,240,1)',
                borderRadius: 6,
                onClick: () => {
                    this.sortBy = option.value;
                    this.app.sortBy = option.value;
                    console.log('[SortPage] Sort changed:', option.value);
                    
                    // Apply immediately and go back
                    this.fadeOut(() => {
                        this.app.renderStorefront();
                    });
                }
            });
            
            buttonWrapper.appendChild(sortButton.element);
            optionsArea.appendChild(buttonWrapper);
        });
        
        this.contentContainer.appendChild(optionsArea);
    }

    renderFooterButtons() {
        const footerBar = this.createElement('div', 'footer-bar');
        footerBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 45px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 5px;
            z-index: 10;
        `;
        
        const colors = this.app.colors;

        // Back button (centered)
        const backButtonWrapper = this.createElement('div', 'canvas-button-wrapper');
        
        this.backButton = new CanvasButton({
            app: this.app,
            text: '◀ Back to Products',
            width: 200,
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
        footerBar.appendChild(backButtonWrapper);

        this.contentContainer.appendChild(footerBar);
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
        if (this.backButton) {
            this.backButton.destroy();
        }
        if (this.pageContainer && this.pageContainer.parentNode) {
            this.pageContainer.parentNode.removeChild(this.pageContainer);
        }
    }
}
