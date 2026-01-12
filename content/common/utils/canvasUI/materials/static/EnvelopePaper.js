import { Material } from "../Material.js";

export class EnvelopePaper extends Material {
    constructor(options = {}) {
        super();
        this.name = 'envelopepaper';
        this.isAnimated = false;
        const {
            lineColor = 'rgba(0,0,0,0.1)',
            lineWidth = 0.5,
            backgroundColor = 'rgba(255, 255, 255, 0.8)',
            ...rest
        } = options;

        this.lineColor = lineColor;
        this.lineWidth = lineWidth;
        this.backgroundColor = backgroundColor;
        Object.assign(this, rest);
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
        ctx.fillStyle = "#F5F5DC";
        ctx.fillRect(x, y, width, height);

        for (let i = 0; i < 4000; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const gray = Math.floor(Math.random() * 20) + 230;
            const alpha = Math.random() * 0.05 + 0.02;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(px, py, 1, 1);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.005)";
        ctx.lineWidth = 0.3;
        for (let j = y; j < y + height; j += 10) {
            ctx.beginPath();
            ctx.moveTo(x, j);
            ctx.lineTo(x + width, j);
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
