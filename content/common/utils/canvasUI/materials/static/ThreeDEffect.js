import { Material } from "../Material.js";

/**
 * Applies a 3D extrusion effect to text with a matching outline.
 *
 * Syntax: {threeD:key=value,key=value|text}
 * All parameters are optional.
 *
 * Parameters:
 * - angle: The angle of the shadow in degrees (default: 45).
 * - depth: The thickness of the extrusion in pixels (default: 3).
 * - extrusionColor: Color of the shadow and the text outline (default: '#000000').
 * - baseColor: The fill color of the top text layer (default: 'white').
 *
 * Example: {threeD:extrusionColor=#C0C0C0,baseColor=gold|Royal Text}
 */
export class ThreeDEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = 'threeD';
        this.regex = /\{threeD(?::([^|]+))?\|([^}]+?)\}/gi;
        this.isAnimated = false;
    }

    parse(match) {
        const paramsString = match[1];
        const text = match[2];

        // **UPDATED:** Default baseColor is now 'white'.
        const style = {
            [this.name]: true,
            angle: 45,
            depth: 3,
            extrusionColor: 'rgba(0,0,0,1.0)',
            baseColor: 'white'
        };

        if (paramsString) {
            paramsString.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value !== undefined) {
                    switch (key) {
                        case 'angle':
                        case 'depth':
                            style[key] = parseFloat(value);
                            break;
                        case 'extrusionColor':
                        case 'baseColor':
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
            extrusionColor,
            baseColor,
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

        const angleInRadians = angle * (Math.PI / 180);
        const cosAngle = Math.cos(angleInRadians);
        const sinAngle = Math.sin(angleInRadians);

        // --- Draw Extrusion Layers ---
        ctx.fillStyle = extrusionColor;
        for (let i = depth; i > 0; i--) {
            const xOffset = i * cosAngle;
            const yOffsetExtrusion = i * sinAngle;
            ctx.fillText(text, x + xOffset, finalY + yOffsetExtrusion);
        }

        // --- Draw Top Text Layer (Outline and Fill) ---
        // **NEW:** The outline color is set to the extrusion color for a cohesive look.
        ctx.strokeStyle = extrusionColor;
        ctx.lineWidth = Math.max(1, currentFontSize * 0.08); // Proportional outline
        ctx.lineJoin = 'round'; // Prevents sharp, ugly corners

        // The fill color is the baseColor.
        ctx.fillStyle = baseColor;

        // Draw the outline first, then the fill on top of it.
        ctx.strokeText(text, x, finalY);
        ctx.fillText(text, x, finalY);

        ctx.restore();
    }

    update(deltaTime) {
        // No-op for static effects
    }
}
