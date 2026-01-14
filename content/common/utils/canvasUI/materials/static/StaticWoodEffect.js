import { Material } from "../Material.js";
import { Color } from "../colorUtils.js";

/**
 * @class StaticWoodEffect
 * @extends Material
 * @description Applies a static, procedural wood grain texture to text.
 *
 * @example
 * // Simple wood effect
 * {wood|Wood Text}
 *
 * @example
 * // Specify wood type
 * {wood:type=pine|Pine Wood}
 *
 * @property {string} type - The type of wood ('oak', 'pine', 'mahogany', 'walnut', 'birch', 'cherry', 'maple', 'ash', 'ebony'). Default: 'oak'.
 * @property {string} baseColor - Overrides the base color of the wood.
 * @property {string} grainColor - Overrides the color of the wood grain.
 */
export class StaticWoodEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'wood';
        this.regex = /\{(staticwood|wood)(?::([^|]+))?\|([^}]+?)\}/gi;
    }

    /**
     * Parses the effect tag and extracts parameters.
     * @param {Array<string>} match - The regex match array.
     * @returns {object} An object containing the text and style.
     */
    parse(match) {
        const paramsString = match[2];
        const text = match[3];

        const style = {
            [this.name]: true,
            type: 'oak',
            baseColor: null,
            grainColor: null,
        };

        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    style[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                }
            });
        }

        return { text, style, isAnimated: false };
    }

    /**
     * Provides color schemes for different wood types.
     * @param {string} type - The type of wood.
     * @returns {{base: string, grain: string}} An object with colors.
     * @private
     */
    _getWoodColors(type) {
        const colors = {
            pine: { base: '#f2d194', grain: '#c7a66c' },
            mahogany: { base: '#802621', grain: '#591b18' },
            walnut: { base: '#6e4a2e', grain: '#4a321f' },
            birch: { base: '#f7f2e5', grain: '#d1c7b8' },
            cherry: { base: '#a13c3c', grain: '#6b2828' },
            maple: { base: '#f5e5c7', grain: '#c7b299' },
            ash: { base: '#e1d8c7', grain: '#b0a899' },
            ebony: { base: '#2e2e2e', grain: '#1a1a1a' },
            oak: { base: '#c7a66c', grain: '#8f6f3e' },
        };
        return colors[type] || colors.oak;
    }

    /**
     * Generates a procedural wood grain texture.
     * @private
     */
    _drawWoodGrain(ctx, width, height, baseColor, grainColor) {
        ctx.save();
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Create a temporary canvas for the grain pattern
        const grainCanvas = document.createElement('canvas');
        grainCanvas.width = width;
        grainCanvas.height = height;
        const gctx = grainCanvas.getContext('2d');

        gctx.strokeStyle = grainColor;
        gctx.globalAlpha = 0.4;
        gctx.lineWidth = 1.5;

        // Create distorted lines for the grain
        for (let i = 0; i < height * 2; i += 4) {
            gctx.beginPath();
            gctx.moveTo(0, i);
            for (let j = 0; j < width; j++) {
                const yOffset = (Math.sin(j / 30 + i / 10) * 2) + (Math.sin(j / 15) * 1.5);
                gctx.lineTo(j, i + yOffset);
            }
            gctx.stroke();
        }

        // Add knots
        const knotCount = Math.floor(width * height / 4000);
        for (let i = 0; i < knotCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radiusX = Math.random() * 8 + 5;
            const radiusY = Math.random() * 15 + 10;
            gctx.beginPath();
            gctx.ellipse(x, y, radiusX, radiusY, Math.random() * Math.PI, 0, Math.PI * 2);
            gctx.globalAlpha = 0.15;
            gctx.fillStyle = grainColor;
            gctx.fill();
            gctx.globalAlpha = 0.5;
            gctx.stroke();
        }

        // Draw the grain canvas onto the main pattern canvas
        ctx.drawImage(grainCanvas, 0, 0);

        ctx.restore();
    }

    /**
     * Applies the wood effect to the canvas.
     */
    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        const { type, subscript, superscript } = token.style;
        const colors = this._getWoodColors(type);
        const baseColor = token.style.baseColor || colors.base;
        const grainColor = token.style.grainColor || colors.grain;

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

        const metrics = ctx.measureText(text);
        const textWidth = Math.ceil(metrics.width);
        const ascent = metrics.actualBoundingBoxAscent;
        const descent = metrics.actualBoundingBoxDescent;
        const textHeight = Math.ceil(ascent + descent);

        // --- Create Pattern ---
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = textWidth;
        patternCanvas.height = textHeight;
        const pctx = patternCanvas.getContext('2d');

        this._drawWoodGrain(pctx, textWidth, textHeight, baseColor, grainColor);
        const pattern = ctx.createPattern(patternCanvas, 'no-repeat');


        // --- RENDERING ---
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(1, currentFontSize / 14);
        ctx.strokeStyle = grainColor;
        ctx.strokeText(text, x, finalY);

        ctx.fillStyle = pattern;
        ctx.fillText(text, x, finalY);



        ctx.restore();
    }

    update(deltaTime) {
        // No-op for static effect
    }
}
