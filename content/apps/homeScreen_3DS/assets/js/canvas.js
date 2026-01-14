export class CanvasManager {
    renderTextToCanvas(text, options = {}) {
        const {
            fontCss = '12px RodinProDB',
            fillStyle = 'white',
            width = 64,
            height = 16,
            textAlign = 'center',
            textBaseline = 'middle'
        } = options;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        ctx.imageSmoothingEnabled = false; // For a crisp, pixelated look
        ctx.font = fontCss;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        const x = width / 2;
        const y = height / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(text, x, y);
        return canvas;
    }
}