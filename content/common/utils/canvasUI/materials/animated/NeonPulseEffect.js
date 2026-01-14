import { Material } from "../Material.js";

/**
 * Applies a pulsating neon glow effect to text.
 * Syntax: {neonpulse:color,blur,speed|text} or {staticneonpulse:color,blur,speed|text}
 * Example: {neonpulse:magenta,15,300|Pulsing}
 */
export class NeonPulseEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'neonpulse';
        this.regex = /{(static)?neonpulse:([^,]+),([^,]+),([^|]+)\|([^}]+)}/g;
        this.neonColor = 'magenta';
        this.blur = 15;
        this.speed = 300;
        this.isAnimated = !options.static;
        this.currentTime = 0;
    }

    getMaterial(name) {
        if (name === this.name) {
            return new NeonPulseEffect();
        }
        return null;
    }

    parse(match) {
        const isStatic = !!match[1];
        return {
            text: match[5],
            style: {
                effect: this.name,
                static: isStatic,
                color: match[2],
                blur: parseFloat(match[3]),
                speed: parseFloat(match[4])
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        const pulseStrength = this.isAnimated ? 0.5 + Math.sin(this.currentTime / this.speed) * 0.5 : 0.75;

        ctx.save();
        ctx.shadowColor = this.neonColor;
        ctx.shadowBlur = this.blur * pulseStrength;
        ctx.fillStyle = this.neonColor;
        ctx.globalAlpha = this.isAnimated ? 0.7 + pulseStrength * 0.3 : 0.85;
        
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    update(deltaTime) {
        if (this.isAnimated) {
            this.currentTime += deltaTime;
        }
    }
}
