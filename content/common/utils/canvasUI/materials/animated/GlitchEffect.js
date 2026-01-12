import { Material } from "../Material.js";

export class GlitchEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.isAnimated = true;
        this.intensity = this.options.intensity || 5;
    }

    apply(ctx, x, y, width, height, text) {
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
    }
}
