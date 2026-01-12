import { Material } from "../Material.js";

/**
 * Applies a stylized, animated water effect to text with surface texture and reflections.
 *
 * Syntax:
 * {water:key=value|text}
 * {staticwater|text} - A non-animated version.
 *
 * Parameters:
 * - type: The style of water ('clear', 'ocean', 'pond', 'swamp', 'frozen', 'beach'). Default: 'clear'.
 * - baseColor: The main color of the water.
 * - highlightColor: The color of the surface highlights.
 * - textureColor: The color for the caustic light patterns.
 * - reflectionOpacity: The max opacity of the reflection (0 to 1). Default: 0.7.
 * - textureOpacity: The opacity of the caustic texture (0 to 1). Default: 0.8.
 *
 * Example: {water:type=ocean|Deep Blue}
 */
export class WaterEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'water';
        this.regex = /\{(staticwater|water)(?::([^|]+))?\|([^}]+?)\}/gi;
        this.currentTime = 0;
    }

    parse(match) {
        const isStaticTag = match[1] === 'staticwater';
        const paramsString = match[2];
        const text = match[3];

        // --- Set Default Values ---
        const style = {
            [this.name]: true, // Key for the renderer
            static: isStaticTag,
            type: 'clear',
            baseColor: null,
            highlightColor: null,
            textureColor: null,
            reflectionOpacity: 0.7,
            textureOpacity: 0.8,
        };

        // --- Parse Key-Value Parameters ---
        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey === 'static') {
                        style[key] = (value.toLowerCase() === 'true');
                    } else {
                        style[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                    }
                }
            });
        }

        return {
            text,
            style,
            isAnimated: !style.static
        };
    }

    _getWaterColors(type) {
        switch (type) {
            case 'pond':
                return { base: '#2ECC71', highlight: '#A9DFBF', texture: '#E8F8EF' };
            case 'ocean':
                return { base: '#1A5276', highlight: '#A9CCE3', texture: '#E4EFFF' };
            case 'swamp':
                return { base: '#7D6608', highlight: '#F7DC6F', texture: '#FCF3CF' };
            case 'frozen':
                return { base: '#85C1E9', highlight: '#FFFFFF', texture: '#FFFFFF' };
            case 'beach':
                return { base: '#00BFFF', highlight: '#E0FFFF', texture: '#FFFFFF' };
            case 'clear':
            default:
                return { base: '#3498DB', highlight: '#EBF5FB', texture: '#FFFFFF' };
        }
    }

    _generateTexture(ctx, width, height, textureColor, textureOpacity, type, isStatic) {
        const settings = this._getCausticSettings(type);
        const time = isStatic ? 0 : this.currentTime;

        ctx.save();
        ctx.globalAlpha = textureOpacity;
        ctx.strokeStyle = textureColor;
        ctx.lineWidth = settings.lineWidth;

        for (let i = 0; i < settings.lineCount; i++) {
            ctx.beginPath();
            const x = (Math.random() * width + time / 20) % width;
            const y = (Math.random() * height + time / 15) % height;
            const r = Math.random() * width * settings.radiusScale;
            const startAngle = Math.random() * Math.PI * 2;
            const endAngle = startAngle + Math.random() * Math.PI * 1.5;
            ctx.arc(x, y, r, startAngle, endAngle);
            ctx.stroke();
        }
        ctx.restore();
    }

    _getCausticSettings(type) {
        const settings = {
            pond: { lineCount: 30, lineWidth: 1.5, radiusScale: 0.05 },
            ocean: { lineCount: 60, lineWidth: 2.5, radiusScale: 0.08 },
            swamp: { lineCount: 20, lineWidth: 1, radiusScale: 0.04 },
            frozen: { lineCount: 10, lineWidth: 0.5, radiusScale: 0.1 },
            beach: { lineCount: 50, lineWidth: 2, radiusScale: 0.07 },
            clear: { lineCount: 40, lineWidth: 2, radiusScale: 0.06 },
        };
        return settings[type] || settings.clear;
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        const {
            static: isStatic,
            type,
            reflectionOpacity,
            textureOpacity,
            subscript,
            superscript
        } = token.style;

        // --- Font Sizing and Positioning ---
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
        const textHeight = Math.ceil(currentFontSize);

        const colors = this._getWaterColors(type);
        const baseColor = token.style.baseColor || colors.base;
        const highlightColor = token.style.highlightColor || colors.highlight;
        const textureColor = token.style.textureColor || colors.texture;

        // --- Main Text Rendering ---
        // 1. Create the base water gradient.
        const gradient = ctx.createLinearGradient(x, finalY - textHeight, x, finalY);
        if (isStatic || type === 'frozen') {
            gradient.addColorStop(0, highlightColor);
            gradient.addColorStop(1, baseColor);
        } else {
            const highlightPos = 0.4 + Math.sin(this.currentTime / 250) * 0.3;
            gradient.addColorStop(0, highlightColor);
            gradient.addColorStop(Math.max(0, highlightPos), baseColor);
            gradient.addColorStop(1, baseColor);
        }
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, finalY);

        // 2. Overlay the caustic texture.
        if (textureOpacity > 0 && type !== 'frozen') {
            ctx.globalCompositeOperation = 'overlay';
            ctx.save();
            ctx.translate(x, finalY - textHeight);
            this._generateTexture(ctx, textWidth, textHeight, textureColor, textureOpacity, type, isStatic);
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
        }

        // 3. Create reflection.
        if (reflectionOpacity > 0) {
            ctx.save();
            const reflectionY = finalY + textHeight * 0.5;
            ctx.translate(x, reflectionY);
            ctx.scale(1, -1);

            // Draw reflected text with gradient
            ctx.globalAlpha = reflectionOpacity * 0.5;
            ctx.fillStyle = gradient;
            ctx.fillText(text, 0, 0);

            // Fade out the reflection
            const reflectionGradient = ctx.createLinearGradient(0, 0, 0, textHeight);
            reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            reflectionGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = reflectionGradient;
            ctx.fillRect(0, 0, textWidth, textHeight);

            ctx.restore();
        }

        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}