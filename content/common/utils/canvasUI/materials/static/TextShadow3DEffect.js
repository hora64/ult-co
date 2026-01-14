import { Material } from "../Material.js";

/**
 * Applies a 3D drop shadow effect to text with controllable parameters.
 *
 * Syntax: {textshadow3d:key=value,key=value|text}
 * All parameters are optional.
 *
 * Parameters:
 * - angle: The angle of the shadow in degrees (default: 45).
 * - depth: The offset distance of the shadow in pixels (default: 5).
 * - shadowColor: The color of the shadow (default: 'rgba(0,0,0,0.5)').
 *
 * Example: {textshadow3d:angle=90,depth=3,shadowColor=#333|Subtle Shadow}
 */
export class TextShadow3DEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'textshadow3d';
        // This regex captures the optional parameter string (group 1) and the text (group 2).
        this.regex = /\{textshadow3d(?::([^|]+))?\|([^}]+?)\}/gi;
        this.isAnimated = false;
    }

    parse(match) {
        const paramsString = match[1];
        const text = match[2];

        // --- Set Default Values ---
        const style = {
            [this.name]: true, // Key for the renderer to find this effect
            angle: 45,
            depth: 5,
            shadowColor: 'rgba(0,0,0,0.5)'
        };

        // --- Parse Key-Value Parameters ---
        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    switch (key) {
                        case 'angle':
                        case 'depth':
                            style[key] = parseFloat(value);
                            break;
                        case 'shadowColor':
                            style[key] = value;
                            break;
                    }
                }
            });
        }

        return { text, style };
    }

    apply(ctx, text, x, y, token, baseFontSize, rendererBaseColor) {
        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        const {
            angle,
            depth,
            shadowColor,
            subscript,
            superscript
        } = token.style;

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
        
        // Update font size while preserving font family (including Chinese font if applied)
        const currentFont = this._getContextFont(ctx);
        const fontWithNewSize = currentFont.replace(/\d+px/, `${currentFontSize}px`);
        this._setContextFont(ctx, fontWithNewSize);
        
        const finalY = y + yOffset;

        // Convert angle from degrees to radians for JS trig functions
        const angleInRadians = angle * (Math.PI / 180);
        const cosAngle = Math.cos(angleInRadians);
        const sinAngle = Math.sin(angleInRadians);

        // --- Draw Shadow Layer ---
        // Unlike the extrusion effect, this only draws one shadow layer at the final offset.
        ctx.fillStyle = shadowColor;
        const xOffset = depth * cosAngle;
        const yOffsetShadow = depth * sinAngle;
        ctx.fillText(text, x + xOffset, finalY + yOffsetShadow);


        // --- Draw Top Text Layer ---
        // Use the renderer's base color for consistency.
        ctx.fillStyle = rendererBaseColor || 'white';
        ctx.fillText(text, x, finalY);

        ctx.restore();
    }
}
