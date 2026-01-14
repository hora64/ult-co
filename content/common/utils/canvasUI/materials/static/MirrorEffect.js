import { Material } from "../Material.js";

/**
 * Applies a mirrored reflection effect to text.
 * Syntax: {mirror:offset|text}
 * Example: {mirror:20|Reflection}
 */
export class MirrorEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'mirror';
        this.regex = /{mirror:([^|]+)\|([^}]+)}/g;
        this.isAnimated = false;
        this.offsetY = 20;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new MirrorEffect();
        }
        return null;
    }

    parse(match) {
        return {
            text: match[2],
            style: {
                effect: this.name,
                offset: parseFloat(match[1])
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();
        
        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);
        
        const baseFontSize = parseInt(ctx.font);
        const finalOffsetY = this.offsetY || (baseFontSize * 1.5);
        
        ctx.fillText(text, x, y);

        ctx.save();
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.3;
        ctx.fillText(text, x, -(y + finalOffsetY + baseFontSize));
        ctx.restore();
        
        ctx.restore();
    }
}
