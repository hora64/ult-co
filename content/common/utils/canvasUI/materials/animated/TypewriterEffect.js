import { Material } from "../Material.js";

/**
 * Applies a typewriter effect to text.
 * Syntax: {typewriter:speed|text}
 * Example: {typewriter:100|Hello, world!}
 */
export class TypewriterEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'typewriter';
        this.regex = /{typewriter:([^|]+)\|([^}]+)}/g;
        this.isAnimated = true;
        this.speed = 100;
        this.currentTime = 0;
        this.text = '';
    }

    getMaterial(name) {
        if (name === this.name) {
            return new TypewriterEffect();
        }
        return null;
    }

    parse(match) {
        this.speed = parseFloat(match[1]) || 100;
        this.text = match[2];
        return {
            text: '', // Initially empty
            style: {
                effect: this.name,
                speed: this.speed
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        const charsToShow = Math.min(this.text.length, Math.floor(this.currentTime / this.speed));
        const displayedText = this.text.substring(0, charsToShow);
        ctx.fillText(displayedText, x, y);
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
