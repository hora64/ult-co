import { RichTextEffect } from "../RichTextEffect.js";

/**
 * Base class for rich text formatting effects.
 * Formatting effects modify the canvas context (e.g., font, fillStyle)
 * before text is drawn, allowing effects to be combined.
 */
export class RichTextFormattingEffect extends RichTextEffect {
    constructor() {
        super();
        this.isFormattingEffect = true;
    }

    /**
     * Applies the formatting to the canvas context.
     * This method should not draw the text itself.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {object} token - The token being rendered.
     */
    applyFormat(ctx, token) {
        // To be implemented by subclasses
    }
}
