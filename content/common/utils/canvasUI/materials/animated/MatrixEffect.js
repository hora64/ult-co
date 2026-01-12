import { Material } from "../Material.js";

/**
 * Applies a Matrix-style digital rain effect to text.
 * Syntax: {matrix:baseColor,glowColor|text} or {staticmatrix:baseColor,glowColor|text}
 * Example: {matrix:green,lightgreen|Matrix}
 */
export class MatrixEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'matrix';
        this.regex = /{(static)?matrix:([^,]+),([^|]+)\|([^}]+)}/g;
        this.baseColor = options.baseColor || 'green';
        this.glowColor = options.glowColor || 'lightgreen';
        this.isAnimated = !options.static;
        this.currentTime = 0;

        this.fontSize = 10;
        this.characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.columns = Math.floor((options.width || 200) / this.fontSize);
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = 1;
        }
    }

    getMaterial(name) {
        if (name === this.name) {
            return new MatrixEffect();
        }
        return null;
    }

    parse(match) {
        const isStatic = !!match[1];
        return {
            text: match[4],
            style: {
                effect: this.name,
                static: isStatic,
                baseColor: match[2],
                glowColor: match[3]
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        // Draw a semi-transparent black rectangle to create the fading trail effect
        if (this.isAnimated) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(x, y - height, width, height * 2);
        }

        ctx.fillStyle = this.baseColor;
        ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.columns; i++) {
            const rainText = this.characters[Math.floor(Math.random() * this.characters.length)];
            const dropX = x + i * this.fontSize;
            const dropY = y + this.drops[i] * this.fontSize;
            
            if (dropY < y + height * 1.5) { // Only draw within a certain range
                ctx.fillText(rainText, dropX, dropY);
            }

            if (this.isAnimated) {
                if (this.drops[i] * this.fontSize > y + height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }
                this.drops[i]++;
            }
        }

        // Reset font and draw original text on top
        ctx.font = this.options.font || '16px sans-serif';
        ctx.fillStyle = this.glowColor;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0; // Reset shadow
    }

    update(deltaTime) {
        // The animation is handled within the apply method for this effect to ensure sync with drawing
    }
}
