import { Material } from "../Material.js";

export class RainbowWaveEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'rainbowwave';
        this.regex = /{rainbowwave\|([^}]+)}/g;
        this.isAnimated = true;
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new RainbowWaveEffect();
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
        const frequency = 0.2;
        const amplitude = 10;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charX = x + ctx.measureText(text.substring(0, i)).width;
            
            const hue = (this.currentTime / 10 + i * 10) % 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

            const yOffset = Math.sin(i * frequency + this.currentTime / 100) * amplitude;

            ctx.fillText(char, charX, y + yOffset);
        }
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
