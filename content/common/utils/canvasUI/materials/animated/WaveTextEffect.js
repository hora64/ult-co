import { Material } from "../Material.js";

/**
 * Moves text characters up and down in a sine wave pattern.
 * Syntax: {waveText:amp,freq,speed|text}
 * Example: {waveText:5,0.05,100|Wavy Text}
 */
export class WaveTextEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'waveText';
        this.regex = /{waveText:([^,]+),([^,]+),([^|]+)\|([^}]+)}/g;
        this.isAnimated = true;
        this.amplitude = 5;
        this.frequency = 0.05;
        this.speed = 100;
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new WaveTextEffect();
        }
        return null;
    }

    parse(match) {
        return {
            text: match[4],
            style: {
                effect: this.name,
                amplitude: parseFloat(match[1]),
                frequency: parseFloat(match[2]),
                speed: parseFloat(match[3])
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();
        
        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);
        
        let currentXOffset = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            const charX = x + currentXOffset;
            const charY = y + Math.sin((charX * this.frequency) + (this.currentTime / this.speed)) * this.amplitude;
            ctx.fillText(char, charX, charY);
            currentXOffset += charWidth;
        }
        
        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
