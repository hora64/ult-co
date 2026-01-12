export class CanvasBackgroundGenerator {
    static createRoughPaper(width, height, options = {}) {
        const {
            baseColor = "#E8D8C0",
            noiseCount = 10000,
            noiseOpacity = 0.1,
            lineOpacity = 0.03,
            lineSpacing = 6,
            lineWidth = 0.6
        } = options;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Add noise
        for (let i = 0; i < noiseCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const gray = Math.floor(Math.random() * 50) + 200;
            const alpha = Math.random() * noiseOpacity + 0.05;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(x, y, 1, 1);
        }

        // Add lines
        ctx.strokeStyle = `rgba(0, 0, 0, ${lineOpacity})`;
        ctx.lineWidth = lineWidth;

        // Vertical lines
        for (let x = 0; x < width; x += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(x + Math.random(), 0);
            ctx.lineTo(x + Math.random(), height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < height; y += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y + Math.random());
            ctx.lineTo(width, y + Math.random());
            ctx.stroke();
        }

        return canvas.toDataURL();
    }

    static createLightPaper(width, height, options = {}) {
        const {
            baseColor = "#E8D8C0",
            noiseCount = 5000,
            noiseOpacity = 0.1,
            lineOpacity = 0.005,
            lineSpacing = 10
        } = options;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Subtle noise
        for (let i = 0; i < noiseCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const gray = Math.floor(Math.random() * 30) + 220;
            const alpha = Math.random() * noiseOpacity + 0.04;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(x, y, 1, 1);
        }

        // Very faint lines
        ctx.strokeStyle = `rgba(0, 0, 0, ${lineOpacity})`;
        ctx.lineWidth = 0.5;

        for (let x = 0; x < width; x += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        return canvas.toDataURL();
    }

    static createWhitePaper(width, height, options = {}) {
        const {
            baseColor = "#FDFDFD",
            noiseCount = 3000,
            noiseOpacity = 0.05,
            lineOpacity = 0.01,
            lineSpacing = 15
        } = options;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Minimal noise
        for (let i = 0; i < noiseCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const gray = Math.floor(Math.random() * 20) + 230;
            const alpha = Math.random() * noiseOpacity + 0.02;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.fillRect(x, y, 1, 1);
        }

        // Almost invisible lines
        ctx.strokeStyle = `rgba(0, 0, 0, ${lineOpacity})`;
        ctx.lineWidth = 0.4;

        for (let x = 0; x < width; x += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        return canvas.toDataURL();
    }
}