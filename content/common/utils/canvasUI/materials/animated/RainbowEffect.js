import { Material } from "../Material.js";

/**
 * Applies a static or animated rainbow effect to text.
 * Syntax: {rainbow|text} or {staticrainbow|text}
 * Example: {rainbow|Rainbow Text}
 */
export class RainbowEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'rainbow';
        this.regex = /\{(static)?rainbow\|([^}]+?)\}/g;
        this.currentTime = 0;
    }

    parse(match) {
        const isStatic = !!match[1];
        const text = match[2];

        const style = {
            [this.name]: true,
            static: isStatic
        };

        return {
            text,
            style,
            isAnimated: !isStatic
        };
    }

    /**
     * Creates a smooth, animated gradient for the dynamic effect.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {number} x - The starting x-coordinate of the text.
     * @param {number} width - The width of the text to apply the gradient to.
     * @returns {CanvasGradient} A configured gradient ready for use.
     */
    getAnimatedGradient(ctx, x, width) {
        const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
        const hueOffset = (this.currentTime / 5) % 360;
        const colorStops = 7;

        for (let i = 0; i <= colorStops; i++) {
            const hue = (hueOffset + (i / colorStops) * 360) % 360;
            // **UPDATED:** Lightness increased from 55% to 60% for a brighter color.
            const color = `hsl(${hue}, 100%, 60%)`;
            gradient.addColorStop(i / colorStops, color);
        }

        return gradient;
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        const { static: isStatic, subscript, superscript } = token.style;
        const textWidth = ctx.measureText(text).width;

        let currentFontSize = baseFontSize;
        let yOffset = 0;
        if (subscript) {
            currentFontSize *= 0.8;
            yOffset = baseFontSize * 0.2;
        } else if (superscript) {
            currentFontSize *= 0.8;
            yOffset = -baseFontSize * 0.3;
        }
        ctx.font = ctx.font.replace(/\d+px/, `${currentFontSize}px`);
        const finalY = y + yOffset;

        if (isStatic) {
            // **UPDATED:** Static rainbow now uses HSL for consistency and brightness.
            const staticGradient = ctx.createLinearGradient(x, 0, x + textWidth, 0);
            const colorStops = 7;
            for (let i = 0; i <= colorStops; i++) {
                const hue = (i / colorStops) * 360;
                const color = `hsl(${hue}, 100%, 60%)`; // Matches new brightness
                staticGradient.addColorStop(i / colorStops, color);
            }
            ctx.fillStyle = staticGradient;
        } else {
            ctx.fillStyle = this.getAnimatedGradient(ctx, x, textWidth);
        }

        // --- Draw Text with Outline for Readability ---
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'; // Slightly lighter outline
        ctx.lineWidth = Math.max(1, currentFontSize * 0.08);
        ctx.lineJoin = 'round';

        ctx.strokeText(text, x, finalY);
        ctx.fillText(text, x, finalY);

        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}