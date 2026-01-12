import { Material } from "../Material.js";
import { darkenColor, lightenColor } from "../colorUtils.js";

const glitterColorPalettes = {
    red: { base: '#D50000' },
    green: { base: '#00C853' },
    blue: { base: '#2962FF' },
    yellow: { base: '#FFD600' },
    pink: { base: '#C51162' },
    gold: { base: '#FFD700' },
    silver: { base: '#C0C0C0' },
    purple: { base: '#651FFF' },
    teal: { base: '#00BFA5' },
    orange: { base: '#FF6D00' },
    cyan: { base: '#00E5FF' },
    lime: { base: '#AEEA00' },
    bronze: { base: '#CD7F32' },
    black: { base: '#000000' },
    white: { base: '#FFFFFF' },
    rose: { base: '#FFC0CB' },
    emerald: { base: '#50C878' },
    ruby: { base: '#E0115F' },
    sapphire: { base: '#0F52BA' }
};

/**
 * Applies a static fine glitter effect to text.
 * Syntax: {staticfineglitter:color|text|onclick=action|subscript=true}
 * Example: {staticfineglitter:gold|Golden Text}
 */
export class StaticFineGlitterEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'staticfineglitter';
        this.isAnimated = false;
        // This regex correctly captures the color, text, and optional parameters
        this.regex = /\{staticfineglitter:([^|]+?)\|(.+?)(?:\|([^}]+))?\}/g;
        // Cache for generated glitter patterns to improve performance
        this.patternCache = {};
    }

    // getGradientDefinition is not used by the apply method, but is kept for other potential uses.
    getGradientDefinition(glitterType = 'silver', state = 'default') {
        const palette = glitterColorPalettes[glitterType.toLowerCase()] || glitterColorPalettes.silver;
        let base = palette.base;
        let light = lightenColor(base, 0.2);
        let dark = darkenColor(base, 0.2);

        // State-based color adjustments remain as they were
        switch (state) {
            case 'hover':
                light = lightenColor(base, 0.4);
                dark = darkenColor(base, 0.1);
                break;
            case 'pressed':
                light = lightenColor(base, 0.1);
                dark = darkenColor(base, 0.4);
                break;
        }

        return {
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            colors: [light, base, dark],
            stops: [0, 0.5, 1]
        };
    }

    parse(match) {
        const glitterType = match[1] || 'silver';
        const text = match[2];
        const options = match[3] || '';

        // **FIXED:** Create the correct style object structure.
        const style = {
            [this.name]: true, // Key for the renderer to identify this effect
            glitterType: glitterType,
        };

        if (options) {
            options.split('|').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) {
                    style[key.trim()] = value === undefined ? true : value;
                }
            });
        }

        return { text, style };
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        ctx.save();

        const { glitterType, subscript, superscript, onclick } = token.style;
        const palette = glitterColorPalettes[glitterType] || glitterColorPalettes.silver;

        let currentFontSize = baseFontSize;
        let yOffset = 0;

        if (subscript) {
            currentFontSize *= 0.8;
            yOffset = currentFontSize * 0.2;
        } else if (superscript) {
            currentFontSize *= 0.8;
            yOffset = -currentFontSize * 0.4;
        }

        ctx.font = ctx.font.replace(/\d+px/, `${currentFontSize}px`);
        const finalY = y + yOffset;

        // Tile size ~ one font high
        const tileSize = Math.max(16, Math.floor(currentFontSize));
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = tileSize;
        patternCanvas.height = tileSize;
        const patternCtx = patternCanvas.getContext('2d');

        // Base fill
        patternCtx.fillStyle = palette.base;
        patternCtx.fillRect(0, 0, tileSize, tileSize);

        // Fine white noise with weighted random transparency
        const fineDensity = 2;
        const fineParticles = Math.floor(tileSize * tileSize * fineDensity);
        for (let i = 0; i < fineParticles; i++) {
            const px = Math.floor(Math.random() * tileSize);
            const py = Math.floor(Math.random() * tileSize);
            patternCtx.fillStyle = '#f0f0f0';

            // Generate a random number weighted to fall in the range 0-0.5 75% of the time.
            const randomNumber = Math.random();
            if (randomNumber < 0.75) {
                // 75% of the time, generate a number between 0 and 0.5
                patternCtx.globalAlpha = randomNumber * 0.5;
            } else {
                // 25% of the time, generate a number between 0.5 and 1.0
                patternCtx.globalAlpha = 0.5 + (randomNumber - 0.75) * 2;
            }

            patternCtx.fillRect(px, py, 1, 1);
        }

        patternCtx.globalAlpha = 1;

        // Apply pattern fill to text
        const glitterPattern = ctx.createPattern(patternCanvas, 'repeat');
        ctx.fillStyle = glitterPattern;

        if (!ctx.font) ctx.font = `${baseFontSize}px sans-serif`;

        // Draw outline first
        ctx.strokeStyle = darkenColor(palette.base, 0.2); // 20% darker
        ctx.lineWidth = Math.max(1, currentFontSize * 0.1); // proportional outline
        ctx.strokeText(text, x, finalY);

        // Fill glittered text
        ctx.fillText(text, x, finalY);

        ctx.restore();
    }
}