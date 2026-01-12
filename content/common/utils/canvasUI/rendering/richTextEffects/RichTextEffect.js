/**
 * Base class for all rich text effects.
 * Defines the interface for parsing and applying an effect.
 */
export class RichTextEffect {
    constructor() {
        this.name = '';
        this.regex = null;
        this.isAnimated = false;
    }

    /**
     * The name of the effect, used as a key in the style object.
     * @type {string}
     */
    // get name() {
    //     throw new Error("Effect must have a name.");
    // }

    /**
     * The regular expression used to find the effect's syntax in a string.
     * It must contain a named capture group matching the effect's name.
     * @type {RegExp}
     */
    // get regex() {
    //     throw new Error("Effect must have a regex.");
    // }

    /**
     * Parses the matched text and returns a token.
     * @param {object} match - The result of RegExp.exec().
     * @returns {object} A token object with text and style.
     */
    parse(match) {
        const content = match.groups[this.name];
        return {
            text: content,
            style: { [this.name]: true },
        };
    }

    /**
     * Applies the effect's rendering to the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} text - The text to which the effect should be applied.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {object} token - The token being rendered.
     * @param {number} baseFontSize - The base font size.
     * @param {number} currentTime - The current animation time.
     * @param {number} tokenTextWidth - The width of the text.
     * @param {number} tokenTextHeight - The height of the text.
     */
    apply(ctx, text, x, y, token, baseFontSize, currentTime, tokenTextWidth, tokenTextHeight) {
        // Default implementation just draws the text.
        ctx.fillText(text, x, y);
    }

    /**
     * Utility to convert hex/rgb/rgba color strings to an RGB object.
     * @param {string} hex - The color string.
     * @returns {{r: number, g: number, b: number}}
     */
    hexToRgb(hex) {
        if (!hex) return { r: 255, g: 255, b: 255 };
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255 };
        }
        const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        }
        // Fallback for named colors or other formats by using canvas
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = hex;
        const color = tempCtx.fillStyle; // This will be in #rrggbb format
        if (/^#/.test(color)) {
             return this.hexToRgb(color);
        }
        return { r: 255, g: 255, b: 255 }; // Default fallback
    }
}
