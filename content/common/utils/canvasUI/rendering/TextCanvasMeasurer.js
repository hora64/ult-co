export class TextCanvasMeasurer {
    constructor() {
        if (!TextCanvasMeasurer.instance) {
            this._canvas = document.createElement("canvas");
            this._ctx = this._canvas.getContext("2d");
            this._ctx.imageSmoothingEnabled = false;
            TextCanvasMeasurer.instance = this;
        }
        return TextCanvasMeasurer.instance;
    }

    measureText(text, font) {
        this._ctx.font = font;
        const metrics = this._ctx.measureText(text);
        return {
            width: metrics.width,
            actualBoundingBoxAscent: metrics.actualBoundingBoxAscent || metrics.fontBoundingBoxAscent || 0,
            actualBoundingBoxDescent: metrics.actualBoundingBoxDescent || metrics.fontBoundingBoxDescent || 0
        };
    }

    estimateWrappedTextHeight(text, font, maxWidth, lineSpacingFactor = 1.0) {
        this._ctx.font = font;
        const tempMetrics = this._ctx.measureText(text);
        const actualLineHeight = (tempMetrics.actualBoundingBoxAscent || 0) +
            (tempMetrics.actualBoundingBoxDescent || 0);

        if (maxWidth === Infinity) {
            return actualLineHeight * lineSpacingFactor;
        }

        const words = text.split(" ");
        let line = "";
        let totalHeight = 0;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + (n > 0 ? " " : "") + words[n];
            let metrics = this._ctx.measureText(testLine);
            let testWidth = metrics.width;

            if (testWidth > maxWidth && line.length > 0) {
                totalHeight += actualLineHeight * lineSpacingFactor;
                line = words[n];
            } else {
                line = testLine;
            }
        }
        totalHeight += actualLineHeight * lineSpacingFactor;
        return totalHeight;
    }

    adjustColor(color, amount) {
        if (color.startsWith('rgba')) {
            let [r, g, b, a] = color.match(/\d+(\.\d+)?/g).map(Number);
            r = Math.min(255, Math.max(0, r + amount));
            g = Math.min(255, Math.max(0, g + amount));
            b = Math.min(255, Math.max(0, b + amount));
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        } else if (color.startsWith('#')) {
            return '#' + color.replace(/^#/, '').replace(/../g, c => 
                ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2)
            );
        }
        return color; // Return original color if format is not recognized
    }
}