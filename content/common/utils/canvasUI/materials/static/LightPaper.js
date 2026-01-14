import { Material } from "../Material.js";

export class LightPaper extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'LightPaper';
    }

    canvasBackgroundGenerator(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        this.apply(ctx, 0, 0, width, height);
        return canvas;
    }

    apply(ctx, x, y, width, height) {
        ctx.fillStyle = "#E8D8C0";
        ctx.fillRect(x, y, width, height);

        for (let i = 0; i < 5000; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const gray = Math.floor(Math.random() * 30) + 220;
            const alpha = Math.random() * 0.1 + 0.04;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(px, py, 1, 1);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
        ctx.lineWidth = 0.5;
        for (let i = x; i < x + width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, y);
            ctx.lineTo(i, y + height);
            ctx.stroke();
        }
        for (let j = y; j < y + height; j += 10) {
            ctx.beginPath();
            ctx.moveTo(x, j);
            ctx.lineTo(x + width, j);
            ctx.stroke();
        }
    }

    parse(match) {
        // Not a text effect, so no parsing needed.
        return {};
    }

    update(deltaTime) {
        // Not an animated material
    }
}
