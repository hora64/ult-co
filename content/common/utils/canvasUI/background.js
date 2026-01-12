import { RichText } from "./materials/RichText.js";

/**
 * @file Defines the CanvasBackground class, a utility for drawing solid color, gradient, or generated backgrounds on a canvas.
 */

export class CanvasBackground {
    /**
     * Draws a background on a canvas context. The background can be a solid color, a gradient object, or a generator class.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     * @param {string|object|Canvas} background - The background style.
     */
    static draw(ctx, width, height, background) {
        if (typeof background === 'string') {
            // Solid color
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, width, height);
        } else if (background.stops && Array.isArray(background.stops)) {
            // Gradient object
            this.drawGradient(ctx, width, height, background);
        } else if (typeof background === 'function' && background.prototype instanceof Canvas) {
            // Generator class
            const generator = new background();
            const dataURL = generator.generate(width, height);
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = dataURL;
        } else if (typeof background === 'object' && background.type === 'material') {
            // Material-based background
            this.drawMaterial(ctx, width, height, background.material);
        }
    }

    /**
     * Draws a gradient on a canvas context.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     * @param {object} gradientOptions - The gradient options.
     */
    static drawGradient(ctx, width, height, gradientOptions) {
        const angle = gradientOptions.angle || 180;
        const angleRad = (angle - 90) * (Math.PI / 180);
        const x1 = width / 2 * (1 - Math.cos(angleRad));
        const y1 = height / 2 * (1 - Math.sin(angleRad));
        const x2 = width / 2 * (1 + Math.cos(angleRad));
        const y2 = height / 2 * (1 + Math.sin(angleRad));

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradientOptions.stops.forEach(s => {
            gradient.addColorStop(s.position, s.color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Draws a material on a canvas context.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     * @param {object} material - The material to draw.
     */
    static drawMaterial(ctx, width, height, material) {
        if (material instanceof RichText) {
            material.draw(ctx, 0, 0);
        }
        // Add other material types here
    }
}


/**
 * Abstract base class for background generators that produce a data URL.
 */
export class Canvas {
    constructor() {
        if (this.constructor === Canvas) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * Generates a background and returns it as a data URL.
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     * @returns {string} The data URL of the generated background.
     */
    generate(width, height) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        this._draw(ctx, width, height);
        return canvas.toDataURL();
    }

    /**
     * The drawing logic to be implemented by subclasses.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     * @protected
     */
    _draw(ctx, width, height) {
        throw new Error("Method '_draw()' must be implemented.");
    }
}
