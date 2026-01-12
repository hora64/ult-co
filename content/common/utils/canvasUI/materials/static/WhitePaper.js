import { Material } from "../Material.js";

export class WhitePaper extends Material {
    constructor(options = {}) {
        super();
        this.name = 'whitepaper';
        this.isAnimated = false;
        const {
            lineColor = 'rgba(0,0,0,0.03)',
            lineWidth = 0.5,
            ..._options
        } = options;

        Object.assign(this, _options);
        this.lineColor = lineColor;
        this.lineWidth = lineWidth;
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
        ctx.fillStyle = "#FDFDFD";
        ctx.fillRect(x, y, width, height);

        for (let i = 0; i < 3000; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            const gray = Math.floor(Math.random() * 20) + 230;
            const alpha = Math.random() * 0.05 + 0.02;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(px, py, 1, 1);
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.01)";
        ctx.lineWidth = 0.4;
        for (let i = x; i < x + width; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, y);
            ctx.lineTo(i, y + height);
            ctx.stroke();
        }
        for (let j = y; j < y + height; j += 15) {
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
