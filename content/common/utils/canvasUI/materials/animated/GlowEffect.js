import { Material } from "../Material.js";

/**
 * Applies a glow effect to text.
 * Syntax: {glow:color|text} or {staticglow:color|text}
 * Example: {glow:yellow|Glowing Text}
 */
export class GlowEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
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

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        const glowMultiplier = this.isAnimated ? (Math.sin(this.currentTime / 200) + 1.5) : 1;
        const blur = 8 * glowMultiplier;
        const color = token.style.color || this.glowColor;

        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Fill with white (or token color if we handled it) to make text readable over glow
        // The plain renderer usually handles the base text, but glow effect might want to enforce a specific look
        // The original code enforced white/option color
        ctx.fillStyle = this.options.textColor || 'white';
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    update(deltaTime) {
        if (this.isAnimated) {
            this.currentTime += deltaTime;
        }
    }
}
