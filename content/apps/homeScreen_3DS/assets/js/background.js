import { CanvasBackground } from "/content/common/utils/canvasUI/background.js";

export class BackgroundManager {
    constructor(topCanvas, bottomCanvas, options = {}) {
        this.topCanvas = topCanvas;
        this.bottomCanvas = bottomCanvas;
        this.bodyCanvas = options.bodyCanvas || null;
        this.options = options;
    }

    createBackgrounds() {
        // Get CSS variables if colors not provided
        const computedStyle = getComputedStyle(document.documentElement);
        const topColor = this.options.topColor || computedStyle.getPropertyValue('--hs-top-canvas-bg').trim() || '#1a1a1a';
        const bottomColor = this.options.bottomColor || computedStyle.getPropertyValue('--hs-bottom-canvas-bg').trim() || '#1a1a1a';
        const bodyColor = this.options.bodyColor || computedStyle.getPropertyValue('--hs-body-canvas-bg').trim() || '#222222';
        
        // Use CanvasBackground utility to draw backgrounds
        this.drawCanvasBackground(this.topCanvas, topColor);
        this.drawCanvasBackground(this.bottomCanvas, bottomColor);
        
        // Draw body background if canvas is provided
        if (this.bodyCanvas) {
            this.drawCanvasBackground(this.bodyCanvas, bodyColor);
        }
    }

    drawCanvasBackground(canvas, background) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Use CanvasBackground.draw which supports solid colors, gradients, and more
        CanvasBackground.draw(ctx, canvas.width, canvas.height, background);
    }

    drawSolidColor(canvas, color) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawGradient(canvas, gradientOptions) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Use CanvasBackground utility for gradient drawing
        CanvasBackground.drawGradient(ctx, canvas.width, canvas.height, gradientOptions);
    }
}
