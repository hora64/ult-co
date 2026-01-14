import { Material } from "../Material.js";

export class StandardPaper extends Material {
    constructor(options = {}) {
        super();
        this.name = 'standardpaper';
        this.isAnimated = false;
        const {
            lineColor = 'rgba(0,0,0,0.08)',
            lineWidth = 0.5,
            ...restOptions
        } = options;
        this.lineColor = lineColor;
        this.lineWidth = lineWidth;
        this.restOptions = restOptions;
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
        ctx.fillStyle = "#E0D0B0";
        ctx.fillRect(x, y, width, height);

        for (let i = 0; i < 15000; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const gray = Math.floor(Math.random() * 100) + 150;
            const alpha = Math.random() * 0.15 + 0.05;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(px, py, 1, 1);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
        ctx.lineWidth = 0.5;
        for (let j = y; j < y + height; j += 8) {
            ctx.beginPath();
            ctx.moveTo(x, j + (Math.random() * 2 - 1));
            ctx.lineTo(x + width, j + (Math.random() * 2 - 1));
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
