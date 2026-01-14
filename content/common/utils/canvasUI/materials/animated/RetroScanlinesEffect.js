import { Material } from "../Material.js";

/**
 * Applies a retro scanlines effect to text.
 * Syntax: {retroscanlines|text}
 * Example: {retroscanlines|80s Vibe}
 */
export class RetroScanlinesEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'retroscanlines';
        this.regex = /{retroscanlines\|([^}]+)}/g;
        this.isAnimated = true;
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new RetroScanlinesEffect();
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
        ctx.fillText(text, x, y);

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        const scanlineY = (this.currentTime / 20) % 4;
        for (let i = scanlineY; i < height; i += 4) {
            ctx.fillRect(x, y - height + i, width, 2);
        }
        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
