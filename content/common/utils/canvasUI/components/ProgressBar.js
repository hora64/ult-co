import { UIComponent } from "../UIComponent.js";
import { applyCanvasTextEffect } from '../effects/canvasEffects.js';

export class ProgressBar extends UIComponent {
    constructor(options) {
        super(options);
        this.width = options.width || 200;
        this.height = options.height || 20;
        this.progress = options.progress || 0; // 0 to 1
        this.color = options.color || this.app.cssVars['--ds-accent'] || '#0d6efd';
        this.backgroundColor = options.backgroundColor || this.app.cssVars['--ds-bg-modal'] || '#2c2c2c';
        this.borderRadius = options.borderRadius !== undefined ? options.borderRadius : 5;
        this.showLabel = options.showLabel !== undefined ? options.showLabel : true;
        this.labelFormat = options.labelFormat || 'percentage'; // 'percentage', 'value', or a function
        this.font = options.font || '12px Arial';
        this.textColor = options.textColor || this.app.cssVars['--ds-text'] || '#eaeaea';

        this.createElement();
        this.draw();
    }

    createElement() {
        super.createElement('canvas');
        this.element.width = this.width;
        this.element.height = this.height;
        this.ctx = this.element.getContext('2d');
    }

    setProgress(progress) {
        this.progress = Math.max(0, Math.min(1, progress));
        this.draw();
        this.emit('change', { value: this.progress });
    }

    draw() {
        const ctx = this.ctx;
        const width = this.element.width;
        const height = this.element.height;
        const progressWidth = width * this.progress;

        // Background
        ctx.fillStyle = this.backgroundColor;
        this.drawRoundedRect(ctx, 0, 0, width, height, this.borderRadius);
        ctx.fill();

        // Progress fill
        if (progressWidth > 0) {
            ctx.fillStyle = this.color;
            this.drawRoundedRect(ctx, 0, 0, progressWidth, height, this.borderRadius);
            ctx.fill();
        }
        
        // Clip the fill to the background shape
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, progressWidth, height);
        ctx.globalCompositeOperation = 'source-over';


        // Label
        if (this.showLabel) {
            let labelText = '';
            if (typeof this.labelFormat === 'function') {
                labelText = this.labelFormat(this.progress);
            } else if (this.labelFormat === 'percentage') {
                labelText = `${Math.round(this.progress * 100)}%`;
            } else if (this.labelFormat === 'value') {
                labelText = this.progress.toFixed(2);
            }

            ctx.font = this.font;
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            applyCanvasTextEffect(ctx, labelText, width / 2, height / 2, {
                effect: 'textshadow',
                color: 'rgba(0,0,0,0.7)',
                offsetX: 1,
                offsetY: 1,
                blur: 2
            });
            ctx.fillText(labelText, width / 2, height / 2);
        }
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
}
