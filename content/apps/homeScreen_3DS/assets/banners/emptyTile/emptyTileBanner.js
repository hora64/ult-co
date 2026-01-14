import { BaseBanner } from '../BaseBanner.js';

/**
 * EmptyTileBanner - Banner for empty tile spaces
 * Displays a simple placeholder banner with minimal graphics
 * @extends BaseBanner
 */
export class EmptyTileBanner extends BaseBanner {
    constructor(topScreenElement, app, onTransitionComplete) {
        super(topScreenElement, app, onTransitionComplete);
        
        // Empty tiles don't have jingles
        this.jinglePath = null;
        
        // Visual properties
        this.backgroundColor = '#1a1a1a';
        this.gridColor = 'rgba(255, 255, 255, 0.05)';
        this.borderColor = 'rgba(255, 255, 255, 0.1)';
        this.textColor = 'rgba(255, 255, 255, 0.3)';
    }
    
    /**
     * Renders the empty tile banner
     * Shows a simple grid pattern and text
     */
    render() {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid pattern
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        
        // Draw text
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 24px "Rodin", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw "Empty Space" text
        ctx.fillText('Empty Space', centerX, centerY - 20);
        
        // Draw subtitle
        ctx.font = '14px "Rodin", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillText('Select to create a folder', centerX, centerY + 20);
        
        // Draw small icon in center
        this.drawEmptyIcon(ctx, centerX, centerY - 70, 40);
    }
    
    /**
     * Draws a small empty folder/container icon
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} size - Icon size
     */
    drawEmptyIcon(ctx, x, y, size) {
        ctx.save();
        
        // Draw a simple folder outline
        ctx.strokeStyle = this.textColor;
        ctx.lineWidth = 2;
        
        const halfSize = size / 2;
        
        // Folder tab
        ctx.beginPath();
        ctx.moveTo(x - halfSize, y - halfSize);
        ctx.lineTo(x - halfSize / 3, y - halfSize);
        ctx.lineTo(x - halfSize / 6, y - halfSize / 2);
        ctx.lineTo(x + halfSize, y - halfSize / 2);
        ctx.stroke();
        
        // Folder body
        ctx.beginPath();
        ctx.moveTo(x - halfSize, y - halfSize / 2);
        ctx.lineTo(x - halfSize, y + halfSize);
        ctx.lineTo(x + halfSize, y + halfSize);
        ctx.lineTo(x + halfSize, y - halfSize / 2);
        ctx.stroke();
        
        // Plus sign in center
        ctx.lineWidth = 3;
        const plusSize = size / 4;
        ctx.beginPath();
        ctx.moveTo(x - plusSize, y + halfSize / 4);
        ctx.lineTo(x + plusSize, y + halfSize / 4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y + halfSize / 4 - plusSize);
        ctx.lineTo(x, y + halfSize / 4 + plusSize);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Cleans up the banner
     */
    cleanup() {
        // No jingle to stop for empty tiles
        super.cleanup();
    }
}

// Export as default for dynamic import
export default EmptyTileBanner;
