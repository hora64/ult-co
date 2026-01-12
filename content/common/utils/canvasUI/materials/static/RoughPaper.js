import { Material } from "../Material.js";

export class RoughPaper extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'RoughPaper';
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

        for (let i = 0; i < 10000; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const gray = Math.floor(Math.random() * 50) + 200;
            const alpha = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(px, py, 1, 1);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
        ctx.lineWidth = 0.6;
        for (let i = x; i < x + width; i += 6) {
            ctx.beginPath();
            ctx.moveTo(i + Math.random() * 1, y);
            ctx.lineTo(i + Math.random() * 1, y + height);
            ctx.stroke();
        }

        for (let j = y; j < y + height; j += 6) {
            ctx.beginPath();
            ctx.moveTo(x, j + Math.random() * 1);
            ctx.lineTo(x + width, j + Math.random() * 1);
            ctx.stroke();
        }
    }

    parse(match) {
        return {};
    }

    update(deltaTime) {
        // Not an animated material
    }
}
