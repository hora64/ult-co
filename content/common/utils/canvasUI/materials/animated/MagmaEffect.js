import { Material } from "../Material.js";

/**
 * Applies a stylized, animated magma effect to text with a heat-wave distortion and cooling rock embers.
 *
 * Syntax:
 * {magma:key=value|text}
 * {staticmagma|text} - A non-animated version.
 *
 * Parameters:
 * - type: The style of magma ('classic', 'obsidian', 'toxic'). Default: 'classic'.
 * - baseColor: The main color of the magma (default: '#FF4500').
 * - sparkColor: The color of the hot core (default: 'yellow').
 * - outlineColor: The color of the dark, cooling crust (default: '#1C1C1C').
 * - emberCount: The number of floating rock fragments (default: 8).
 * - waveAmplitude: The intensity of the heat wave effect (default: 1.5).
 * - waveSpeed: The speed of the heat wave animation (default: 2).
 *
 * Example: {magma:baseColor=#E62000|Hot Text}
 */
export class MagmaEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'magma';
        this.regex = /\{(staticmagma|magma)(?::([^|]+))?\|([^}]+?)\}/gi;
        this.currentTime = 0;
        this.embers = [];
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    parse(match) {
        const isStaticTag = match[1] === 'staticmagma';
        const paramsString = match[2];
        const text = match[3];

        // --- Set Default Values ---
        const style = {
            [this.name]: true, // Key for the renderer
            static: isStaticTag,
            type: 'classic',
            baseColor: null,
            sparkColor: null,
            outlineColor: null,
            emberCount: 8,
            waveAmplitude: 1.5,
            waveSpeed: 2,
        };

        // --- Parse Key-Value Parameters ---
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

        return {
            text,
            style,
            isAnimated: !style.static
        };
    }

    _getMagmaColors(type) {
        switch (type) {
            case 'obsidian':
                return { base: '#7B2C9E', spark: '#FF88FF', outline: '#000000' }; // Brighter purple, vivid magenta
            case 'toxic':
                return { base: '#9AFF00', spark: '#E0FF00', outline: '#2E4023' }; // Lighter chartreuse, bright yellow-green
            case 'classic':
            default:
                return { base: '#FF6600', spark: '#FFFF66', outline: '#331100' }; // Brighter orange, vivid yellow, slightly lighter brown outline
        }
    }

    _generateEmbers(count, x, y, width, height) {
        if (this.embers.length >= count) return;
        const needed = count - this.embers.length;
        for (let i = 0; i < needed; i++) {
            this.embers.push({
                x: x + Math.random() * width,
                y: y + Math.random() * height,
                size: Math.random() * 2.5 + 1,
                opacity: Math.random() * 0.3 + 0.6,
                vy: Math.random() * 0.3 + 0.1, // Slower vertical velocity
            });
        }
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        const {
            static: isStatic,
            type,
            emberCount,
            waveAmplitude,
            waveSpeed,
            subscript,
            superscript
        } = token.style;

        const colors = this._getMagmaColors(type);
        const baseColor = token.style.baseColor || colors.base;
        const sparkColor = token.style.sparkColor || colors.spark;
        const outlineColor = token.style.outlineColor || colors.outline;

        // --- Handle Font Sizing and Positioning ---
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
        const textWidth = metrics.width;
        const textHeight = currentFontSize;


        // --- STYLIZED RENDERING PIPELINE ---

        // 1. Create the magma gradient.
        const gradient = ctx.createLinearGradient(x, finalY - textHeight, x, finalY);
        if (isStatic) {
            gradient.addColorStop(0, sparkColor);
            gradient.addColorStop(0.5, baseColor);
            gradient.addColorStop(1, outlineColor); // Cool down to the outline color
        } else {
            if (type === 'obsidian') {
                const flicker1 = 70 + Math.sin(this.currentTime / 160) * 15;
                const flicker2 = 60 + Math.cos(this.currentTime / 130) * 15;
                gradient.addColorStop(0.2, `hsl(280, 100%, ${flicker1}%)`);
                gradient.addColorStop(0.6, `hsl(290, 90%, ${flicker2}%)`);
                gradient.addColorStop(1, `hsl(270, 100%, 35%)`);
            } else if (type === 'toxic') {
                const flicker1 = 80 + Math.sin(this.currentTime / 140) * 15;
                const flicker2 = 70 + Math.cos(this.currentTime / 110) * 15;
                gradient.addColorStop(0.2, `hsl(90, 100%, ${flicker1}%)`);
                gradient.addColorStop(0.6, `hsl(80, 90%, ${flicker2}%)`);
                gradient.addColorStop(1, `hsl(100, 100%, 40%)`);
            } else { // classic
                const flicker1 = 85 + Math.sin(this.currentTime / 100) * 15;
                const flicker2 = 75 + Math.cos(this.currentTime / 80) * 15;
                gradient.addColorStop(0.2, `hsl(50, 100%, ${flicker1}%)`);
                gradient.addColorStop(0.6, `hsl(30, 100%, ${flicker2}%)`);
                gradient.addColorStop(1, `hsl(10, 90%, 65%)`);
            }
        }
        ctx.fillStyle = gradient;

        // 2. Render the text to an offscreen canvas for the wave distortion.
        this.offscreenCanvas.width = Math.ceil(textWidth);
        this.offscreenCanvas.height = Math.ceil(textHeight * 1.5);
        this.offscreenCtx.font = ctx.font;
        this.offscreenCtx.fillStyle = gradient;
        this.offscreenCtx.fillText(text, 0, textHeight);

        // 3. Draw the main text fill.
        if (!isStatic && waveAmplitude > 0) {
            // Apply heat-wave distortion
            for (let i = 0; i < textWidth; i++) {
                const waveOffset = Math.sin(i / 25 + this.currentTime / (120 / waveSpeed)) * waveAmplitude;
                ctx.drawImage(this.offscreenCanvas, i, 0, 1, textHeight * 1.5,
                    x + i, finalY - textHeight + waveOffset, 1, textHeight * 1.5);
            }
        } else {
            // Draw plain text if static
            ctx.fillText(text, x, finalY);
        }

        // 4. Draw the outline ON TOP of the fill.
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(1.5, currentFontSize * 0.08); // Reduced outline thickness
        ctx.strokeStyle = outlineColor;
        ctx.strokeText(text, x, finalY);

        // 5. Generate and draw cooling embers.
        if (!isStatic) {
            this._generateEmbers(emberCount, x, finalY - textHeight, textWidth, textHeight);
            this.embers.forEach(p => {
                let emberColor;
                if (type === 'toxic') {
                    emberColor = p.opacity > 0.7 ? `rgba(224, 255, 0, ${p.opacity})` : `rgba(70, 90, 60, ${p.opacity * 1.2})`;
                } else if (type === 'obsidian') {
                    emberColor = p.opacity > 0.7 ? `rgba(255, 136, 255, ${p.opacity})` : `rgba(60, 20, 80, ${p.opacity * 1.2})`;
                } else {
                    emberColor = p.opacity > 0.7 ? `rgba(255, 220, 0, ${p.opacity})` : `rgba(60, 30, 15, ${p.opacity * 1.2})`;
                }
                ctx.fillStyle = emberColor;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
        }

        ctx.restore();
    }

    update(deltaTime) {
        this.currentTime += deltaTime;

        // Update and filter embers
        this.embers = this.embers.filter(p => {
            p.y -= p.vy * (deltaTime / 16);
            p.opacity -= 0.008;
            return p.opacity > 0;
        });
    }
}