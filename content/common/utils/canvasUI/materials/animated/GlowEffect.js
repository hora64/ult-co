import { Material } from "../Material.js";

/**
 * Applies a glow effect to text.
 * Syntax: {glow:color|text} or {staticglow:color|text}
 * Example: {glow:yellow|Glowing Text}
 */
export class GlowEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'glow';
        this.regex = /{(static)?glow:([^|]+)\|([^}]+)}/g;
        this.glowColor = 'yellow';
        this.isAnimated = !options.static;
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new GlowEffect();
        }
        return null;
    }

    parse(match) {
        const isStatic = !!match[1];
        return {
            text: match[3],
            style: {
                effect: this.name,
                static: isStatic,
                color: match[2]
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();
        const blur = this.isAnimated ? 5 + Math.sin(this.currentTime / 200) * 3 : 8;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = blur;
        ctx.fillStyle = this.glowColor;
        ctx.fillText(text, x, y);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.options.color || 'white';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    update(deltaTime) {
        if (this.isAnimated) {
            this.currentTime += deltaTime;
        }
    }
}
