import { Material } from "../Material.js";

/**
 * Applies a mirrored reflection effect to text.
 * Syntax: {mirror:offset|text}
 * Example: {mirror:20|Reflection}
 */
export class MirrorEffect extends Material {
    constructor(options = {}) {
        super(options);
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
        const baseFontSize = parseInt(ctx.font);
        const finalOffsetY = this.offsetY || (baseFontSize * 1.5);
        
        ctx.fillText(text, x, y);

        ctx.save();
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.3;
        ctx.fillText(text, x, -(y + finalOffsetY + baseFontSize));
        ctx.restore();
    }
}
