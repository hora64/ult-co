// Purchase Complete Page (Canvas-rendered with background)
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';

export class PurchaseCompletePage extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.pageContainer = null;
        this.backButton = null;
    }

    render() {
        this.renderTopScreen();
        this.renderBottomScreen();
        this.animatePageIn();
    }

    animatePageIn() {
        if (!this.pageContainer) return;
        
        // Start with page invisible
        this.pageContainer.style.opacity = '0';
        this.pageContainer.style.transform = 'scale(0.8)';
        this.pageContainer.style.transition = 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // Trigger animation on next frame (bounce effect for success)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.pageContainer.style.opacity = '1';
                this.pageContainer.style.transform = 'scale(1)';
            });
        });
        
        // Animate success message elements
        setTimeout(() => {
            const successMessage = this.pageContainer.querySelector('.success-message');
            if (successMessage) {
                const canvases = successMessage.querySelectorAll('canvas');
                canvases.forEach((canvas, index) => {
                    canvas.style.opacity = '0';
                    canvas.style.transform = 'translateY(-20px)';
                    canvas.style.transition = `opacity 0.4s ease-out ${0.2 + index * 0.1}s, transform 0.4s ease-out ${0.2 + index * 0.1}s`;
                    
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            canvas.style.opacity = '1';
                            canvas.style.transform = 'translateY(0)';
                        });
                    });
                });
            }
        }, 100);
    }

    renderTopScreen() {
        const ctx = this.app.topCtx;
        const { width, height } = this.app.resolution.topScreen;
        const colors = this.app.colors;

        ctx.clearRect(0, 0, width, height);

        // Success checkmark
        ctx.fillStyle = colors.primary;
        ctx.font = `bold 64px ${this.app.font.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', width / 2, height / 2);
    }

    renderBottomScreen() {
        const colors = this.app.colors;

        // Create page container
        this.pageContainer = this.createElement('div', 'page-container active');

        // Add bottom screen background
        this.renderBottomBackground();

        // Success message
        const successMessage = this.createElement('div', 'success-message');
        
        // Title canvas
        const titleCanvas = this.createCanvas(300, 30);
        const titleCtx = titleCanvas.getContext('2d');
        titleCtx.imageSmoothingEnabled = false;
        titleCtx.fillStyle = colors.primaryDark;
        titleCtx.font = `bold 20px ${this.app.font.family}`;
        titleCtx.textAlign = 'center';
        titleCtx.textBaseline = 'middle';
        titleCtx.fillText(this.app.t('purchaseComplete'), 150, 15);
        successMessage.appendChild(titleCanvas);

        // Subtitle canvas
        const subtitleCanvas = this.createCanvas(300, 25);
        const subtitleCtx = subtitleCanvas.getContext('2d');
        subtitleCtx.imageSmoothingEnabled = false;
        subtitleCtx.fillStyle = colors.text;
        subtitleCtx.font = `14px ${this.app.font.family}`;
        subtitleCtx.textAlign = 'center';
        subtitleCtx.textBaseline = 'middle';
        subtitleCtx.fillText(this.app.t('thankYou'), 150, 12);
        successMessage.appendChild(subtitleCanvas);

        // Button bar
        const buttonBar = this.createElement('div', 'button-bar');
        buttonBar.style.justifyContent = 'center';

        // Back to store button
        const backButtonWrapper = this.createElement('div', 'canvas-button-wrapper');
        this.backButton = new CanvasButton({
            app: this.app,
            text: this.app.t('backToStore'),
            width: 180,
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
            onClick: () => this.app.renderStorefront()
        });
        backButtonWrapper.appendChild(this.backButton.element);
        buttonBar.appendChild(backButtonWrapper);

        this.pageContainer.appendChild(successMessage);
        this.pageContainer.appendChild(buttonBar);
        this.app.bottomScreen.appendChild(this.pageContainer);
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
        if (this.pageContainer && this.pageContainer.parentNode) {
            this.pageContainer.parentNode.removeChild(this.pageContainer);
        }
    }
}
