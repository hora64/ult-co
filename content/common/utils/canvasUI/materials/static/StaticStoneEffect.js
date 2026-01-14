import { Material } from "../Material.js";
import { Color } from "../colorUtils.js";

/**
 * @class StaticStoneEffect
 * @extends Material
 * @description Applies a static, procedural stone texture to text.
 *
 * @example
 * // Simple stone effect
 * {stone|Stone Text}
 *
 * @example
 * // Specify stone type
 * {stone:type=granite|Granite Rock}
 *
 * @property {string} type - The type of stone ('slate', 'granite', 'marble', 'sandstone', 'cobblestone', 'limestone', 'obsidian'). Default: 'slate'.
 * @property {string} baseColor - Overrides the base color of the stone.
 * @property {string} featureColor - Overrides the color of veins, speckles, or layers.
 */
export class StaticStoneEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'stone';
        this.regex = /\{(staticstone|stone)(?::([^|]+))?\|([^}]+?)\}/gi;
    }

    parse(match) {
        const paramsString = match[2];
        const text = match[3];

        const style = {
            [this.name]: true,
            type: 'slate',
            baseColor: null,
            featureColor: null,
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

    _getStoneColors(type) {
        const colors = {
            granite: { base: '#a8a39d', feature: '#3b3a38' },
            marble: { base: '#fdfdfd', feature: '#b0b0b0' },
            sandstone: { base: '#d1bda3', feature: '#b59f84' },
            cobblestone: { base: '#8a8a8a', feature: '#6b6b6b' },
            limestone: { base: '#e0e0d8', feature: '#b5b5a8' },
            obsidian: { base: '#1a1a1f', feature: '#3c3c4c' },
            slate: { base: '#5c6370', feature: '#828a99' },
        };
        return colors[type] || colors.slate;
    }

    _drawStoneTexture(ctx, width, height, type, baseColor, featureColor) {
        ctx.save();
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Create a temporary canvas for drawing texture details
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = width;
        textureCanvas.height = height;
        const tctx = textureCanvas.getContext('2d');


        switch (type) {
            case 'granite':
                this._drawGranite(tctx, width, height, featureColor);
                break;
            case 'marble':
                this._drawMarble(tctx, width, height, featureColor);
                break;
            case 'sandstone':
                this._drawSandstone(tctx, width, height, featureColor);
                break;
            case 'cobblestone':
                // Cobblestone modifies the base, so it's drawn directly for now.
                this._drawCobblestone(ctx, width, height, baseColor, featureColor);
                break;
            case 'limestone':
                this._drawLimestone(tctx, width, height, featureColor);
                break;
            case 'obsidian':
                // Obsidian has a complex composition, draw directly.
                this._drawObsidian(ctx, width, height, featureColor);
                break;
            case 'slate':
            default:
                this._drawSlate(tctx, width, height, featureColor);
                break;
        }

        // Draw the texture details onto the main canvas
        ctx.drawImage(textureCanvas, 0, 0);


        ctx.restore();
    }

    _drawSlate(ctx, width, height, featureColor) {
        // Horizontal layers
        for (let i = 0; i < 15; i++) {
            const y = Math.random() * height;
            const h = Math.random() * 3 + 1;
            ctx.fillStyle = Color.fromHex(featureColor).lighten(Math.random() * 0.2 - 0.1).toRgba(Math.random() * 0.3 + 0.1);
            ctx.fillRect(0, y, width, h);
        }
        // Add some fine noise
        this._addNoise(ctx, width, height, 0.05);
    }

    _drawCobblestone(ctx, width, height, baseColor, featureColor) {
        const cols = Math.ceil(width / 30);
        const rows = Math.ceil(height / 20);
        const cellWidth = width / cols;
        const cellHeight = height / rows;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = j * cellWidth;
                const y = i * cellHeight;
                const offsetX = (i % 2 === 0) ? 0 : cellWidth / 2;

                // Draw individual stone with color variation
                const color = Color.fromHex(baseColor).lighten(Math.random() * 0.2 - 0.1).toHex();
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.rect(x + offsetX - (j === cols - 1 ? offsetX : 0), y, cellWidth, cellHeight);
                ctx.fill();

                // Grout lines
                ctx.strokeStyle = featureColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    _drawLimestone(ctx, width, height, featureColor) {
        // Soft, chalky texture with fine noise
        this._addNoise(ctx, width, height, 0.2, featureColor);
        // Faint, larger patches
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * width / 4 + 10;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, Color.fromHex(featureColor).toRgba(0.08));
            grad.addColorStop(1, Color.fromHex(featureColor).toRgba(0));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }
    }

    _drawObsidian(ctx, width, height, featureColor) {
        // Deep black with sharp, glassy highlights
        ctx.fillStyle = '#050508'; // Darker base
        ctx.fillRect(0, 0, width, height);
        // Sharp, linear highlights
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.strokeStyle = Color.fromHex(featureColor).toRgba(Math.random() * 0.5 + 0.2);
            ctx.lineWidth = Math.random() * 1.5;
            ctx.stroke();
        }
        // Add subtle sheen
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, 'rgba(255,255,255,0.05)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillRect(0, 0, width, height);
    }

    _drawGranite(ctx, width, height, featureColor) {
        // Speckles of different sizes and colors
        for (let i = 0; i < (width * height) / 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2.5 + 0.5;
            const color = Math.random() > 0.3 ? featureColor : Color.fromHex(featureColor).lighten(0.3).toHex();
            ctx.fillStyle = Color.fromHex(color).toRgba(Math.random() * 0.7);
            ctx.fillRect(x, y, size, size);
        }
    }

    _drawMarble(ctx, width, height, featureColor) {
        // Soft, flowing veins
        ctx.strokeStyle = Color.fromHex(featureColor).toRgba(0.3);
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, -20);
            ctx.bezierCurveTo(
                Math.random() * width, height * 0.3,
                Math.random() * width, height * 0.6,
                Math.random() * width, height + 20
            );
            ctx.stroke();
        }
    }

    _drawSandstone(ctx, width, height, featureColor) {
        // Grainy texture with subtle layers
        this._addNoise(ctx, width, height, 0.15, featureColor);
        for (let i = 0; i < 5; i++) {
            const y = Math.random() * height;
            const h = Math.random() * 10 + 5;
            ctx.fillStyle = Color.fromHex(featureColor).lighten(Math.random() * 0.1 - 0.05).toRgba(Math.random() * 0.1);
            ctx.fillRect(0, y, width, h);
        }
    }

    _addNoise(ctx, width, height, opacity, color = '#000000') {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const baseColor = Color.fromHex(color);

        for (let i = 0; i < data.length; i += 4) {
            // Only add noise to visible pixels
            if (data[i + 3] > 0) {
                const val = Math.random() * 50 - 25;
                data[i] = baseColor.r + val;
                data[i + 1] = baseColor.g + val;
                data[i + 2] = baseColor.b + val;
                data[i + 3] = data[i + 3] * (1 - opacity) + (Math.random() * 255 * opacity);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        const { type, subscript, superscript } = token.style;
        const colors = this._getStoneColors(type);
        const baseColor = token.style.baseColor || colors.base;
        const featureColor = token.style.featureColor || colors.feature;

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

        this._drawStoneTexture(pctx, textWidth, textHeight, type, baseColor, featureColor);
        const pattern = ctx.createPattern(patternCanvas, 'no-repeat');

        // --- RENDERING ---
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(1, currentFontSize / 16);
        ctx.strokeStyle = featureColor;
        ctx.strokeText(text, x, finalY);

        ctx.fillStyle = pattern;
        ctx.fillText(text, x, finalY);

        // Add a subtle highlight
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillText(text, x, finalY);


        ctx.restore();
    }

    update(deltaTime) {
        // No-op for static effect
    }
}
