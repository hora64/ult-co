import { Material } from "../Material.js";

/**
 * Applies a rainbow effect that fades in and out.
 * Syntax: {rainbowfade|text}
 * Example: {rainbowfade|Fading Rainbow}
 */
export class RainbowFadeEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'rainbowfade';
        this.regex = /{rainbowfade\|([^}]+)}/g;
        this.isAnimated = true;
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new RainbowFadeEffect();
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
        const hueStart = (this.currentTime / 100) % 360;
        let currentXOffset = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            const hue = (hueStart + (i * 15)) % 360;
            const alpha = 0.5 + Math.sin(this.currentTime / 200 + i * 0.5) * 0.5;
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
            ctx.fillText(char, x + currentXOffset, y);
            currentXOffset += charWidth;
        }
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
