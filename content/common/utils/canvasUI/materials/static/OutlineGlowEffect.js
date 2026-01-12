import { Material } from "../Material.js";

/**
 * Applies an outline and glow effect to text.
 * Syntax: {outlineglow:color,width,blur|text}
 * Example: {outlineglow:white,1,5|Glowing Outline}
 */
export class OutlineGlowEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'outlineglow';
        this.regex = /{outlineglow:([^,]+),([^,]+),([^|]+)\|([^}]+)}/g;
        this.isAnimated = false;
        this.color = 'white';
        this.width = 1;
        this.blur = 5;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new OutlineGlowEffect();
        }
        return null;
    }

    parse(match) {
        return {
            text: match[4],
            style: {
                effect: this.name,
                color: match[1],
                width: parseFloat(match[2]),
                blur: parseFloat(match[3])
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;

        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.blur;

        ctx.strokeText(text, x, y);
        ctx.fillStyle = this.options.color || 'white';
        ctx.fillText(text, x, y);

        // Reset shadow and stroke for subsequent drawing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
    }
}
