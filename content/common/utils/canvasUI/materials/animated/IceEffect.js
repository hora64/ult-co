import { Material } from "../Material.js";

/**
 * Applies a bright, stylized cartoon ice effect to text with a subtle texture and inner outline.
 *
 * Syntax:
 * {ice:key=value|text} - Animated by default.
 * {staticice:key=value|text} - Shorthand for a non-animated effect.
 *
 * Parameters:
 * - type: The style of ice ('crystal', 'glacier', 'blackice'). Default: 'crystal'.
 * - baseColor: The main color of the ice (default: 'lightblue').
 * - outlineColor: The color of the sharp outline (default: 'white').
 * - sparkleColor: The color of the animated sparkles (default: '#E0FFFF').
 * - sparkleCount: Number of sparkles on the text (default: 3).
 * - ShineAngle: Angle of the shine in degrees (0=top, 90=left, default: 0).
 * - ShineOpacity: Opacity of the shine (0 to 1, default: 0.6).
 *
 * Example: {ice:ShineAngle=45|Frozen Text}
 * Example: {staticice:ShineOpacity=0|Frozen Text}
 */
export class IceEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'ice';
        this.regex = /\{(staticice|ice)(?::([^|]+))?\|([^}]+?)\}/gi;
        this.currentTime = 0;

        // --- Caching for Performance ---
        this.effectCache = {};
        this.texturePattern = null; // Cache for the texture
    }

    createSeededRandom(seed) {
        let state = seed % 2147483647;
        if (state <= 0) state += 2147483646;
        return () => {
            state = (state * 16807) % 2147483647;
            return (state - 1) / 2147483646;
        };
    }

    parse(match) {
        const isStaticTag = match[1]?.toLowerCase() === 'staticice';
        const paramsString = match[2];
        const text = match[3];

        const style = {
            [this.name]: true,
            type: 'crystal',
            baseColor: null,
            outlineColor: null,
            sparkleColor: null,
            roughness: 0.5,
            sparkleCount: 5,
            ShineAngle: 0,
            ShineOpacity: 0.6
        };

        const hasStaticParam = paramsString ? /\bstatic\s*=\s*true\b/i.test(paramsString) : false;
        style.static = isStaticTag || hasStaticParam;

        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey === 'shineangle') {
                        style.ShineAngle = parseFloat(value);
                    } else if (lowerKey === 'shineopacity') {
                        style.ShineOpacity = parseFloat(value);
                    } else if (lowerKey !== 'static') {
                        style[key] = (isNaN(parseFloat(value))) ? value : parseFloat(value);
                    }
                }
            });
        }

        return { text, style, isAnimated: !style.static };
    }

    _getIceColors(type) {
        switch (type) {
            case 'glacier':
                return { base: '#B4D8E7', outline: '#F0F8FF', sparkle: '#FFFFFF' };
            case 'blackice':
                return { base: '#4C516D', outline: '#D3D3D3', sparkle: '#E6E6FA' };
            case 'crystal':
            default:
                return { base: '#87CEEB', outline: '#E0FFFF', sparkle: '#FFFFFF' };
        }
    }

    _getCache(token, text) {
        const key = JSON.stringify(token.style) + text;
        if (!this.effectCache[key]) {
            this.effectCache[key] = {};
        }
        return this.effectCache[key];
    }

    _drawFrostyOutline(ctx, text, x, y, token, rand) {
        // The problematic line that changed the font size has been removed from here.
        ctx.lineWidth = Math.max(1, parseFloat(ctx.font) * 0.05);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineJoin = 'round';

        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.translate(x + rand() * 2, y + rand() * 2);
            ctx.rotate(rand() * 0.1 - 0.05);
            ctx.strokeText(text, 0, 0);
            ctx.restore();
        }
    }

    _drawBaseText(ctx, text, x, y, token, currentFontSize) {
        const { static: isStatic, type } = token.style;
        const colors = this._getIceColors(type);
        const baseColor = token.style.baseColor || colors.base;

        const gradient = ctx.createLinearGradient(x, y - currentFontSize, x, y);

        if (isStatic) {
            gradient.addColorStop(0, '#E0FFFF');
            gradient.addColorStop(0.5, baseColor);
            gradient.addColorStop(1, '#87CEEB');
        } else {
            if (type === 'blackice') {
                const shimmer1 = 40 + Math.sin(this.currentTime / 600) * 10;
                const shimmer2 = 30 + Math.cos(this.currentTime / 500) * 10;
                gradient.addColorStop(0, `hsl(230, 25%, ${shimmer1}%)`);
                gradient.addColorStop(0.5, `hsl(230, 30%, ${shimmer2}%)`);
                gradient.addColorStop(1, `hsl(240, 20%, 20%)`);
            } else { // crystal and glacier
                const shimmer1 = 85 + Math.sin(this.currentTime / 500) * 10;
                const shimmer2 = 70 + Math.cos(this.currentTime / 400) * 10;
                gradient.addColorStop(0, `hsl(180, 90%, ${shimmer1}%)`);
                gradient.addColorStop(0.5, `hsl(200, 80%, ${shimmer2}%)`);
                gradient.addColorStop(1, `hsl(210, 70%, 60%)`);
            }
        }

        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(173, 216, 230, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(text, x, y);
        ctx.shadowColor = 'transparent';
    }

    _drawCrystallineTexture(ctx, text, x, y) {
        if (!this.texturePattern) {
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = 32;
            patternCanvas.height = 32;
            const pCtx = patternCanvas.getContext('2d');

            pCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            pCtx.lineWidth = 1.5;

            pCtx.beginPath();
            pCtx.moveTo(0, 28); pCtx.lineTo(28, 0);
            pCtx.moveTo(0, 32); pCtx.lineTo(32, 0);
            pCtx.moveTo(4, 32); pCtx.lineTo(32, 4);
            pCtx.stroke();

            this.texturePattern = ctx.createPattern(patternCanvas, 'repeat');
        }

        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = this.texturePattern;
        ctx.fillText(text, x, y);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }

    _drawShineGradient(ctx, text, x, y, token, currentFontSize) {
        const { ShineAngle, ShineOpacity } = token.style;
        if (ShineOpacity <= 0) return;

        const angleRad = (ShineAngle) * (Math.PI / 180);

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = currentFontSize;

        const centerX = x + textWidth / 2;
        const centerY = y - textHeight / 2;

        const gradientLength = Math.abs(textWidth / 2 * Math.sin(angleRad)) + Math.abs(textHeight / 2 * Math.cos(angleRad));
        const startX = centerX - gradientLength * Math.sin(angleRad);
        const startY = centerY - gradientLength * Math.cos(angleRad);
        const endX = centerX + gradientLength * Math.sin(angleRad);
        const endY = centerY + gradientLength * Math.cos(angleRad);

        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.globalAlpha = ShineOpacity;
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'lighter';

        ctx.fillText(text, x, y);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    }

    _drawSparkles(ctx, text, x, y, token, cache, rand, currentFontSize) {
        const { static: isStatic, sparkleCount, type } = token.style;
        const colors = this._getIceColors(type);
        const sparkleColor = token.style.sparkleColor || colors.sparkle;

        if (isStatic || sparkleCount <= 0) return;

        if (!cache.sparkles) {
            cache.sparkles = [];
            const textWidth = ctx.measureText(text).width;
            for (let i = 0; i < sparkleCount; i++) {
                const randomX = x + rand() * textWidth;
                const randomY = y - rand() * currentFontSize;
                cache.sparkles.push({ x: randomX, y: randomY, offset: rand() * 1000 });
            }
        }

        ctx.globalAlpha = 1.0;
        for (const sparkle of cache.sparkles) {
            const opacity = 0.5 + Math.sin(this.currentTime / 200 + sparkle.offset) * 0.5;
            ctx.fillStyle = sparkleColor;
            ctx.globalAlpha = opacity;
            ctx.fillRect(sparkle.x, sparkle.y, 2, 2);
        }
        ctx.globalAlpha = 1.0;
    }

    apply(ctx, text, x, y, token, baseFontSize, rendererBaseColor) {
        ctx.save();
        const { subscript, superscript, type } = token.style;
        const cache = this._getCache(token, text);
        const colors = this._getIceColors(type);
        const outlineColor = token.style.outlineColor || colors.outline;

        let currentFontSize = baseFontSize;
        let yOffset = 0;
        if (subscript) { currentFontSize *= 0.8; yOffset = baseFontSize * 0.2; }
        if (superscript) { currentFontSize *= 0.8; yOffset = -baseFontSize * 0.3; }

        ctx.font = ctx.font.replace(/\d+px/, `${currentFontSize}px`);
        const finalY = y + yOffset;
        const finalX = x;

        const seed = text.length + (x * 10) + (y * 5);
        const rand = this.createSeededRandom(seed);

        // --- Rendering Pipeline ---
        this._drawFrostyOutline(ctx, text, finalX, finalY, token, rand);
        this._drawBaseText(ctx, text, finalX, finalY, token, currentFontSize);
        this._drawCrystallineTexture(ctx, text, finalX, finalY);

        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = Math.max(1, currentFontSize * 0.05);
        ctx.strokeText(text, finalX, finalY);

        this._drawShineGradient(ctx, text, finalX, finalY, token, currentFontSize);
        this._drawSparkles(ctx, text, finalX, finalY, token, cache, rand, currentFontSize);

        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}