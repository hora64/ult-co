import { Material } from "../Material.js";

/**
 * Applies a steel-like gradient and shadow to text.
 * Syntax: {steel|text}
 * Example: {steel|Steel Text}
 */
export class SteelEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'steel';
        this.regex = /{steel\|([^}]+)}/g;
        this.isAnimated = false;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new SteelEffect();
        }
        return null;
    }

    parse(match) {
        return {
            text: match[1],
            style: {
                effect: this.name
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        const baseFontSize = parseInt(ctx.font);
        const gradient = ctx.createLinearGradient(x, y - baseFontSize, x, y);
        gradient.addColorStop(0, '#CCCCCC');
        gradient.addColorStop(0.5, '#AAAAAA');
        gradient.addColorStop(1, '#888888');

        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        ctx.fillText(text, x, y);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}
