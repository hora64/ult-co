import { Material } from "../Material.js";

export class GlitchEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.isAnimated = true;
        this.intensity = this.options.intensity || 5;
    }

    apply(ctx, x, y, width, height, text) {
        ctx.save();
        
        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);
        
        const sliceCount = 10;

        ctx.fillText(text, x, y);

        for (let i = 0; i < sliceCount; i++) {
            let sliceY = Math.random() * height;
            let sliceHeight = Math.random() * (height / 5);
            let offsetX = (Math.random() - 0.5) * this.intensity * 2;

            if (sliceY + sliceHeight > height) {
                sliceHeight = height - sliceY;
            }

            ctx.drawImage(ctx.canvas, x, y + sliceY, width, sliceHeight, x + offsetX, y + sliceY, width, sliceHeight);
        }
        
        ctx.restore();
    }
}
