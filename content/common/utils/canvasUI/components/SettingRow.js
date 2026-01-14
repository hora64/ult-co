import { UIComponent } from "/content/common/utils/index.js";
import { TextCanvasMeasurer } from "/content/common/utils/index.js";
import { applyCanvasTextEffect } from '/content/common/utils/index.js';

export class SettingRow extends UIComponent {
    constructor({ app, labelText, controlElement, options = {} }) {
        super({ app });
        this.labelText = labelText;
        this.controlElement = controlElement;
        this.options = {
            textEffect: options.textEffect,
            textEffectOptions: options.textEffectOptions,
            textColor: options.textColor,
            labelFontSize: options.labelFontSize || 14
        };
        this.app = app;

        this.measurer = new TextCanvasMeasurer();
        this.element = this.render();
    }

    render() {
        const container = this.createElement('div', 'setting-item');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';
        container.style.width = '280px';

        const font = `${this.options.labelFontSize}px "Rodin", sans-serif`;
        const textMetrics = this.measurer.measureText(this.labelText, font);
        const canvasWidth = textMetrics.width + 10; // Add some padding
        const canvasHeight = 36;

        const labelCanvas = this.createCanvas(canvasWidth, canvasHeight);

        const labelCtx = labelCanvas.getContext('2d');
        if (this.options.textEffect) {
            applyCanvasTextEffect(labelCtx, this.options.textEffect, this.labelText, 0, 18, canvasWidth, canvasHeight, {
                ...this.options.textEffectOptions,
                font: font,
                color: this.options.textColor || this.app.cssVars['--ds-text'],
                textAlign: 'left',
                textBaseline: 'middle'
            });
        } else {
            this._drawTextOnCanvas(labelCtx, this.labelText, 0, 18, font, this.options.textColor || this.app.cssVars['--ds-text'], 'left', 'middle');
        }

        container.appendChild(labelCanvas);

        // Handle both raw elements and component objects
        const element = this.controlElement.element || this.controlElement;
        container.appendChild(element);

        return container;
    }

    update({ labelText, controlElement }) {
        if (labelText !== undefined) this.labelText = labelText;
        if (controlElement !== undefined) this.controlElement = controlElement;

        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
    }

    _drawTextOnCanvas(ctx, text, x, y, font, color, textAlign = 'left', textBaseline = 'alphabetic') {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        ctx.fillText(text, x, y);
    }
}