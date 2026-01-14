import { Material } from "../Material.js";

/**
 * Applies a stylized, animated fire effect to text with a heat-wave distortion and embers.
 *
 * Syntax:
 * {fire:key=value|text}
 * {staticfire|text} - A non-animated version.
 *
 * Parameters:
 * - type: The style of fire ('normal', 'soulfire', 'smokeless'). Default: 'normal'.
 * - baseColor: The main color of the fire (default: 'orange').
 * - sparkColor: The color of the hot core (default: 'yellow').
 * - glowColor: The color of the outer glow (default: 'red').
 * - glowSize: The size of the glow (default: 15).
 * - emberCount: The number of floating embers (default: 10).
 * - waveAmplitude: The intensity of the heat wave effect (default: 1.5).
 * - waveSpeed: The speed of the heat wave animation (default: 8).
 *
 * Example: {fire:waveAmplitude=3|Flickering Text}
 */
export class FireEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'fire';
        this.regex = /\{(staticfire|fire)(?::([^|]+))?\|([^}]+?)\}/gi;
        this.currentTime = 0;
        this.embers = [];
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    parse(match) {
        const isStaticTag = match[1] === 'staticfire';
        const paramsString = match[2];
        const text = match[3];

        const style = {
            [this.name]: true,
            static: isStaticTag,
            type: 'normal',
            baseColor: null,
            sparkColor: null,
            glowColor: null,
            glowSize: 15,
            emberCount: 10,
            waveAmplitude: 1.5,
            waveSpeed: 8,
        };

        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    if (key.toLowerCase() === 'static') {
                        style.static = (value.toLowerCase() === 'true');
                    } else {
                        style[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                    }
                }
            });
        }

        return { text, style, isAnimated: !style.static };
    }

    _getFireColors(type) {
        switch (type) {
            case 'soulfire':
                return { base: '#00BFFF', spark: '#98FB98', glow: '#00008B' }; // DeepSkyBlue, PaleGreen, DarkBlue
            case 'smokeless':
                return { base: '#FF4500', spark: '#FFFF00', glow: '#FF6347' }; // OrangeRed, Yellow, Tomato
            case 'normal':
            default:
                return { base: 'orange', spark: 'yellow', glow: 'red' };
        }
    }

    _generateEmbers(count, x, y, width, height) {
        if (this.embers.length >= count) return;
        const needed = count - this.embers.length;
        for (let i = 0; i < needed; i++) {
            this.embers.push({
                x: x + Math.random() * width,
                y: y + Math.random() * height * 0.5,
                size: Math.random() * 1.5 + 1,
                opacity: Math.random() * 0.5 + 0.5,
                vy: Math.random() * 0.5 + 0.2,
            });
        }
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        const {
            static: isStatic,
            type,
            glowSize,
            emberCount,
            waveAmplitude,
            waveSpeed,
            subscript,
            superscript
        } = token.style;

        const colors = this._getFireColors(type);
        const baseColor = token.style.baseColor || colors.base;
        const sparkColor = token.style.sparkColor || colors.spark;
        const glowColor = token.style.glowColor || colors.glow;

        let currentFontSize = baseFontSize;
        let yOffset = 0;
        if (subscript) currentFontSize *= 0.8, yOffset = baseFontSize * 0.2;
        if (superscript) currentFontSize *= 0.8, yOffset = -baseFontSize * 0.3;
        
        // Update font size while preserving font family (including Chinese font if applied)
        const currentFont = this._getContextFont(ctx);
        const fontWithNewSize = currentFont.replace(/\d+px/, `${currentFontSize}px`);
        this._setContextFont(ctx, fontWithNewSize);
        
        const finalY = y + yOffset;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = currentFontSize;

        // --- FLAME RENDERING PIPELINE ---

        // 1. Create the flame gradient: hot yellow at the bottom, fading to red at the top.
        const gradient = ctx.createLinearGradient(x, finalY, x, finalY - textHeight);
        if (isStatic) {
            gradient.addColorStop(0, sparkColor);
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, 'darkorange');
        } else {
            if (type === 'soulfire') {
                const flicker1 = 70 + Math.sin(this.currentTime / 90) * 10;
                const flicker2 = 60 + Math.cos(this.currentTime / 70) * 10;
                gradient.addColorStop(0, `hsl(150, 100%, ${flicker1}%)`);
                gradient.addColorStop(0.6, `hsl(180, 100%, ${flicker2}%)`);
                gradient.addColorStop(1, `hsla(200, 100%, 50%, 0.8)`);
            } else { // normal and smokeless
                const flicker1 = 60 + Math.sin(this.currentTime / 100) * 10;
                const flicker2 = 50 + Math.cos(this.currentTime / 80) * 10;
                gradient.addColorStop(0, `hsl(55, 100%, ${flicker1}%)`);
                gradient.addColorStop(0.6, `hsl(40, 100%, ${flicker2}%)`);
                gradient.addColorStop(1, `hsla(30, 100%, 50%, 0.8)`);
            }
        }
        ctx.fillStyle = gradient;

        // 2. Apply a soft glow instead of a hard outline.
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowSize;

        // 3. Render and distort the text for a flickering effect.
        if (!isStatic && waveAmplitude > 0) {
            this.offscreenCanvas.width = textWidth;
            this.offscreenCanvas.height = textHeight * 1.5;
            this.offscreenCtx.font = ctx.font;
            this.offscreenCtx.fillStyle = gradient;
            this.offscreenCtx.fillText(text, 0, textHeight);

            for (let i = 0; i < textWidth; i++) {
                // **CHANGED:** More chaotic distortion for a realistic flicker.
                const waveOffset = (Math.sin(i / 20 + this.currentTime / (80 / waveSpeed)) *
                    Math.cos(i / 15 + this.currentTime / (100 / waveSpeed))) * waveAmplitude;
                ctx.drawImage(this.offscreenCanvas, i, 0, 1, textHeight * 1.5,
                    x + i, finalY - textHeight + waveOffset, 1, textHeight * 1.5);
            }
        } else {
            // If static, just draw the text normally.
            ctx.fillText(text, x, finalY);
        }

        // 5. Generate and draw embers.
        if (!isStatic) {
            ctx.shadowColor = 'transparent'; // Turn off glow for embers
            this._generateEmbers(emberCount, x, finalY - textHeight, textWidth, textHeight);
            this.embers.forEach(p => {
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 220, 0, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;

        this.embers = this.embers.filter(p => {
            p.y -= p.vy * (deltaTime / 16);
            p.opacity -= 0.01;
            return p.opacity > 0;
        });
    }
}
