import { Material } from "../Material.js";
import { adjustBrightness, toGrayscale } from "../colorUtils.js";

const metalColorStops = {
    gold: [
        { stop: 0, color: '#FFD700' }, { stop: 0.2, color: '#FFFACD' },
        { stop: 0.4, color: '#F0E68C' }, { stop: 0.6, color: '#BDB76B' },
        { stop: 0.8, color: '#FFD700' }, { stop: 1, color: '#DAA520' }
    ],
    silver: [
        { stop: 0, color: '#E5E5E5' }, { stop: 0.2, color: '#FFFFFF' },
        { stop: 0.4, color: '#C0C0C0' }, { stop: 0.6, color: '#A9A9A9' },
        { stop: 0.8, color: '#E5E5E5' }, { stop: 1, color: '#808080' }
    ],
    bronze: [
        { stop: 0, color: '#CD7F32' }, { stop: 0.2, color: '#EEDDCC' },
        { stop: 0.4, color: '#D2B48C' }, { stop: 0.6, color: '#A0522D' },
        { stop: 0.8, color: '#CD7F32' }, { stop: 1, color: '#8B4513' }
    ],
    copper: [
        { stop: 0, color: '#B87333' }, { stop: 0.2, color: '#DAA520' },
        { stop: 0.4, color: '#CD853F' }, { stop: 0.6, color: '#A0522D' },
        { stop: 0.8, color: '#B87333' }, { stop: 1, color: '#8B4513' }
    ],
    platinum: [
        { stop: 0, color: '#E5E4E2' }, { stop: 0.2, color: '#F5F5F5' },
        { stop: 0.4, color: '#DCDCDC' }, { stop: 0.6, color: '#C0C0C0' },
        { stop: 0.8, color: '#E5E4E2' }, { stop: 1, color: '#C9C0BB' }
    ],
    steel: [
        { stop: 0, color: '#AAB5C2' }, { stop: 0.2, color: '#D8D8D8' },
        { stop: 0.4, color: '#B0B0B0' }, { stop: 0.6, color: '#888888' },
        { stop: 0.8, color: '#AAB5C2' }, { stop: 1, color: '#666666' }
    ],
    rosegold: [
        { stop: 0, color: '#F7CAC9' }, { stop: 0.2, color: '#FADADD' },
        { stop: 0.4, color: '#E8B4B8' }, { stop: 0.6, color: '#D08C8E' },
        { stop: 0.8, color: '#F7CAC9' }, { stop: 1, color: '#B76E79' }
    ],
    titanium: [
        { stop: 0, color: '#878681' }, { stop: 0.2, color: '#A2A2A1' },
        { stop: 0.4, color: '#878681' }, { stop: 0.6, color: '#6F6F6E' },
        { stop: 0.8, color: '#878681' }, { stop: 1, color: '#4A4A49' }
    ],
    chrome: [
        { stop: 0, color: '#E8E8E8' }, { stop: 0.2, color: '#FFFFFF' },
        { stop: 0.4, color: '#C0C0C0' }, { stop: 0.6, color: '#A9A9A9' },
        { stop: 0.8, color: '#E8E8E8' }, { stop: 1, color: '#808080' }
    ]
};

const originalMetals = Object.keys(metalColorStops);

originalMetals.forEach(metalName => {
    const baseStops = metalColorStops[metalName];

    metalColorStops[`${metalName}Hovered`] = baseStops.map(stop => ({
        ...stop,
        color: adjustBrightness(stop.color, 10)
    }));

    metalColorStops[`${metalName}Selected`] = baseStops.map(stop => ({
        ...stop,
        color: adjustBrightness(stop.color, -10)
    }));

    metalColorStops[`${metalName}Disabled`] = baseStops.map(stop => ({
        ...stop,
        color: toGrayscale(stop.color)
    }));
});

/**
 * Applies a metallic effect to text.
 * Syntax: {metallic:type|text} or {staticmetallic:type|text}
 * Example: {metallic:gold|Heavy Metal}
 */
export class MetallicEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'metallic';
        this.regex = /\{(metallic|staticmetallic):([^|]+)\|([^}]+?)(?:\|([^}]+))?\}/g;
        this.isAnimated = !options.static;
        this.currentTime = 0;
        this._cache = new Map();
        this.metalType = this.options.metalType || 'silver';

        // UPDATED: Flag to enable/disable interaction states. Defaults to false.
        this.enableInteractionStates = options.enableInteractionStates ?? false;
    }

    parse(match) {
        const effectType = match[1];
        const metalType = match[2] || 'silver';
        const text = match[3];
        const options = match[4] || '';

        this.isAnimated = effectType === 'metallic';

        const style = {
            [this.name]: true,
            metalType,
            static: !this.isAnimated,
        };

        if (options) {
            const optionPairs = options.split('|');
            optionPairs.forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) {
                    style[key] = value === undefined ? true : value;
                }
            });
        }

        return {
            text,
            style,
        };
    }

    apply(ctx, text, x, y, token, baseFontSize, lineHeight, links) {
        // Validate coordinates before proceeding
        if (!isFinite(x) || !isFinite(y) || !isFinite(baseFontSize) || baseFontSize <= 0) {
            console.warn('MetallicEffect.apply: Invalid parameters', { text, x, y, baseFontSize });
            // Fallback to simple text rendering
            ctx.save();
            ctx.fillStyle = '#C0C0C0';
            ctx.fillText(text, x, y);
            ctx.restore();
            return;
        }

        ctx.save();

        const width = ctx.measureText(text).width;
        this.metalType = token.style.metalType || 'silver';
        this.isAnimated = token.style.static === false;

        // If static, use the old logic
        if (!this.isAnimated) {
            const gradient = this._getCachedGradient(ctx, x, y, baseFontSize, this.metalType);
            const colorStops = metalColorStops[this.metalType] || metalColorStops.silver;

            // Configure and draw the outline
            ctx.lineJoin = 'round'; // For smoother corners on letters
            ctx.lineWidth = Math.max(1, baseFontSize / 16); // Scalable outline width
            ctx.strokeStyle = colorStops[colorStops.length - 1].color; // Use the darkest shade for the outline
            ctx.strokeText(text, x, y);

            // Draw the main metallic gradient fill
            ctx.fillStyle = gradient;
            ctx.fillText(text, x, y);

            // Create the static shine gradient
            const shineGradient = ctx.createLinearGradient(x, y, x, y + baseFontSize);
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
            shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
            shineGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = shineGradient;
            ctx.fillText(text, x, y);
            ctx.restore();

            ctx.restore();
            return;
        }

        // Original animated logic
        const gradient = this._getCachedGradient(ctx, x, y, baseFontSize, this.metalType);
        const colorStops = metalColorStops[this.metalType] || metalColorStops.silver;

        // Configure and draw the outline
        ctx.lineJoin = 'round'; // For smoother corners on letters
        ctx.lineWidth = Math.max(1, baseFontSize / 16); // Scalable outline width
        ctx.strokeStyle = colorStops[colorStops.length - 1].color; // Use the darkest shade for the outline
        ctx.strokeText(text, x, y);

        // Draw the main metallic gradient fill
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);

        // Create the static shine gradient (base layer)
        const shineGradient = ctx.createLinearGradient(x, y, x, y + baseFontSize);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
        shineGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = shineGradient;
        ctx.fillText(text, x, y);
        ctx.restore();

        // Now, add the animated shine effect
        ctx.save();

        const shinePosition = (this.currentTime / 10) % (width + 100) - 50;
        const animatedShineGradient = ctx.createLinearGradient(shinePosition, y - baseFontSize, shinePosition + 20, y - baseFontSize);
        animatedShineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        animatedShineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        animatedShineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = animatedShineGradient;
        ctx.fillText(text, x, y);

        ctx.restore();

        ctx.restore();
    }

    update(deltaTime) {
        if (this.isAnimated) {
            this.currentTime += deltaTime;
        }
    }

    _getCachedGradient(ctx, x, y, baseFontSize, metalType) {
        // Validate inputs to prevent non-finite values
        if (!isFinite(x) || !isFinite(y) || !isFinite(baseFontSize) || baseFontSize <= 0) {
            console.warn('MetallicEffect: Invalid gradient parameters', { x, y, baseFontSize, metalType });
            // Return a fallback gradient with safe coordinates
            const fallbackGradient = ctx.createLinearGradient(0, 0, 0, 16);
            fallbackGradient.addColorStop(0, '#C0C0C0');
            fallbackGradient.addColorStop(1, '#808080');
            return fallbackGradient;
        }

        // Don't cache gradients since they are position-dependent
        // Creating a new gradient each time is necessary for correct positioning
        const gradient = ctx.createLinearGradient(x, y, x, y + baseFontSize);
        const colorStops = metalColorStops[metalType] || metalColorStops.silver;

        colorStops.forEach(stopInfo => {
            gradient.addColorStop(stopInfo.stop, stopInfo.color);
        });

        return gradient;
    }

    getGradientDefinition(metalType = 'silver', state = 'default') {
        // MODIFIED: If interaction states are disabled, always use the default state.
        let effectiveState = this.enableInteractionStates ? state : 'default';

        let metalKey = metalType.toLowerCase();
        if (effectiveState === 'hover' || effectiveState === 'hovered') {
            metalKey = `${metalKey}Hovered`;
        } else if (effectiveState === 'selected' || effectiveState === 'pressed') {
            metalKey = `${metalKey}Selected`;
        } else if (effectiveState === 'disabled') {
            metalKey = `${metalKey}Disabled`;
        }

        const stops = metalColorStops[metalKey] || metalColorStops[metalType.toLowerCase()] || metalColorStops.silver;
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 1 };
        let colors = stops.map(cs => cs.color);

        switch (effectiveState) {
            case 'hover':
            case 'hovered':
                start = { x: 0.5, y: 0 };
                end = { x: 0.5, y: 1 };
                break;
            case 'pressed':
            case 'selected':
            case 'focused':
                start = { x: 0, y: 1 };
                end = { x: 0, y: 0 };
                break;
            case 'disabled':
                break;
            case 'default':
            default:
                break;
        }

        return {
            type: 'linear',
            start: start,
            end: end,
            colors: colors,
            stops: stops.map(cs => cs.stop)
        };
    }
}