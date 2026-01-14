import { Material } from "../Material.js";

/**
 * Applies a static echo effect to text, creating a series of fading copies.
 *
 * This effect is always static.
 *
 * Syntax:
 * {echo:key=value|text}
 *
 * Parameters:
 * - color: The color of the echo copies (default: 'rgba(255,255,255,0.3)').
 * - offsetX: The horizontal offset for each echo copy (default: 2).
 * - offsetY: The vertical offset for each echo copy (default: 2).
 * - count: The number of echo copies to create (default: 3).
 *
 * Example: {echo:color=#FF000080,offsetX=1,offsetY=1,count=5|Fading Away...}
 */
export class EchoEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'echo';
        // The regex supports {echo:...} and captures parameters.
        this.regex = /\{echo(?::([^|]+))?\|([^}]+?)\}/gi;
    }

    parse(match) {
        const paramsString = match[1];
        const text = match[2];

        // Default style properties for the echo effect.
        const style = {
            [this.name]: true, // Identifier for the renderer.
            color: 'rgba(255,255,255,0.3)',
            offsetX: 2,
            offsetY: 2,
            count: 3,
            static: true, // This effect is always static.
        };

        // Parse key-value parameters from the tag.
        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    // Convert numeric values from strings to numbers.
                    style[key] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                }
            });
        }

        return {
            text,
            style,
            isAnimated: false, // Echo effect is not animated.
        };
    }

    apply(ctx, text, x, y, token, baseFontSize, rendererBaseColor) {
        const { color, offsetX, offsetY, count, subscript, superscript } = token.style;

        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        // Adjust font size and vertical position for subscript/superscript.
        let currentFontSize = baseFontSize;
        let yOffset = 0;
        if (subscript) {
            currentFontSize *= 0.8;
            yOffset = baseFontSize * 0.2;
        } else if (superscript) {
            currentFontSize *= 0.8;
            yOffset = -baseFontSize * 0.3;
        }
        
        // Update font size if needed for subscript/superscript
        if (subscript || superscript) {
            const fontWithNewSize = originalFont.replace(/\d+px/, `${currentFontSize}px`);
            this._setContextFont(ctx, fontWithNewSize);
        }
        
        const finalY = y + yOffset;

        // Set the fill style for the echo copies.
        ctx.fillStyle = color;

        // Draw each echo copy with the specified offset.
        for (let i = 1; i <= count; i++) {
            ctx.fillText(text, x + (offsetX * i), finalY + (offsetY * i));
        }

        // The original text is drawn by the renderer, so we don't draw it here.
        // This ensures it gets the correct base color.

        ctx.restore();
    }

    // No update method is needed as this is a static effect.
}
