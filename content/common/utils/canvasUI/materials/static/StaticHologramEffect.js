import { Material } from "../Material.js";

/**
 * Applies a static hologram effect to text.
 * Syntax: {statichologram|text} or {statichologram:color|text}
 * Supported colors: red, green, blue, yellow, pink, purple, cyan
 * Example: {statichologram:blue|Holographic Text}
 */
export class StaticHologramEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = "statichologram";
        this.regex = /\{statichologram(?::([a-z]+))?\|([^}]+)\}/g;
        this.isAnimated = false;
        this.colorMap = {
            red: { base: 'rgba(255, 0, 0, 0.7)', glow: 'rgba(255, 100, 100, 0.9)' },
            green: { base: 'rgba(0, 255, 0, 0.7)', glow: 'rgba(100, 255, 100, 0.9)' },
            blue: { base: 'rgba(0, 170, 255, 0.7)', glow: 'rgba(100, 200, 255, 0.9)' },
            yellow: { base: 'rgba(255, 255, 0, 0.7)', glow: 'rgba(255, 255, 150, 0.9)' },
            pink: { base: 'rgba(255, 105, 180, 0.7)', glow: 'rgba(255, 150, 200, 0.9)' },
            purple: { base: 'rgba(180, 0, 255, 0.7)', glow: 'rgba(220, 150, 255, 0.9)' },
            cyan: { base: 'rgba(0, 255, 255, 0.7)', glow: 'rgba(150, 255, 255, 0.9)' },
        };
    }

    parse(match) {
        // match[0] is the full string {statichologram:blue|text}
        // match[1] is the color (optional), e.g. "blue" or undefined
        // match[2] is the text content, e.g. "Holographic Text"
        
        const color = match[1] || 'cyan'; // Default to cyan
        const text = match[2];
        
        return {
            text: text,
            style: {
                [this.name]: color, 
            },
        };
    }

    apply(ctx, text, x, y, token) {
        const colorName = token.style[this.name] || 'cyan';
        const colors = this.colorMap[colorName] || this.colorMap.cyan;

        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        // 1. Set the main glow effect
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 10;

        // 2. Draw the primary text layer
        ctx.fillStyle = colors.base;
        ctx.fillText(text, x, y);

        // 3. Draw offset text lines for the glitch effect
        ctx.globalAlpha = 0.5;
        ctx.fillText(text, x + 2, y - 2);
        ctx.fillText(text, x - 2, y + 2);
        ctx.globalAlpha = 1.0;

        // 4. Draw pronounced scanlines
        const metrics = ctx.measureText(text);
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        ctx.beginPath();
        for (let i = 0; i < textHeight; i += 3) { // Increased step to make lines more visible
            ctx.moveTo(x, y - metrics.actualBoundingBoxAscent + i);
            ctx.lineTo(x + metrics.width, y - metrics.actualBoundingBoxAscent + i);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Brighter color for visibility
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
        
        return true; // Signal that rendering has been handled
    }
}
