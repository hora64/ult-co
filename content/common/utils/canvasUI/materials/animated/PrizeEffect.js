import { Material } from "../Material.js";

/**
 * Applies a prize-like gold color and subtle glow to text.
 * Syntax: {prize|text}
 * Example: {prize|$1,000,000}
 */
export class PrizeEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'prize';
        this.regex = /{prize\|([^}]+)}/g;
        this.isAnimated = true;
        this.prizeColor = '#FFD700';
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new PrizeEffect();
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
        const glow = 5 + Math.sin(this.currentTime / 200) * 3;
        ctx.fillStyle = this.prizeColor;
        ctx.shadowColor = this.prizeColor;
        ctx.shadowBlur = glow;
        ctx.fillText(text, x, y);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
