import { Material } from "../Material.js";

/**
 * Applies an ink bleed effect to text.
 * Syntax: {inkbleed|text}
 * Example: {inkbleed|Wet Ink}
 */
export class InkBleedEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.isAnimated = true;
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        for (let j = 0; j < 3; j++) {
            const bleedX = x + (Math.random() - 0.5) * 2;
            const bleedY = y + (Math.random() - 0.5) * 2;
            ctx.fillText(text, bleedX, bleedY);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        ctx.fillText(text, x, y);
    }
}
