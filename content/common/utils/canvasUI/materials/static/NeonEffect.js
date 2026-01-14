import { Material } from "../Material.js";

/**
 * Applies a neon glow effect to text.
 * Syntax: {neon:color,blur|text}
 * Example: {neon:cyan,15|NEON}
 */
export class NeonEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'neon';
        this.regex = /{neon:([^,]+),([^|]+)\|([^}]+)}/g;
        this.isAnimated = false;
        this.color = 'cyan';
        this.blur = 15;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new NeonEffect();
        }
        return null;
    }

    parse(match) {
        return {
            text: match[3],
            style: {
                effect: this.name,
                color: match[1],
                blur: parseFloat(match[2])
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();
        
        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.blur;
        ctx.fillStyle = this.color;
        ctx.fillText(text, x, y);
        // Reset shadow for subsequent drawing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
}
