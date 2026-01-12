import { UIComponent } from "../UIComponent.js";

export class ColorPicker extends UIComponent {
    constructor(options) {
        super(options);
        this.width = options.width || 200;
        this.height = options.height || 200;
        this.initialColor = options.initialColor || '#ff0000';
        this.color = this.initialColor;

        this.createElement();
        this.attachEventListeners();
    }

    createElement() {
        super.createElement('div');
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.position = 'relative';
        this.element.style.cursor = 'crosshair';

        this.saturationValueCanvas = this.createCanvas();
        this.hueCanvas = this.createCanvas(this.width, 30);
        this.hueCanvas.style.marginTop = '10px';

        this.svCtx = this.saturationValueCanvas.getContext('2d');
        this.hueCtx = this.hueCanvas.getContext('2d');

        this.element.appendChild(this.saturationValueCanvas);
        this.element.appendChild(this.hueCanvas);

        this.draw();
    }

    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width || this.width;
        canvas.height = height || this.height - 40;
        return canvas;
    }

    attachEventListeners() {
        let isDraggingSV = false;
        let isDraggingHue = false;

        const handleSVMove = (e) => {
            const rect = this.saturationValueCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.updateColorFromSV(x, y);
        };

        const handleHueMove = (e) => {
            const rect = this.hueCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.updateHue(x);
        };

        this.saturationValueCanvas.addEventListener('mousedown', (e) => {
            isDraggingSV = true;
            handleSVMove(e);
        });
        this.hueCanvas.addEventListener('mousedown', (e) => {
            isDraggingHue = true;
            handleHueMove(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDraggingSV) handleSVMove(e);
            if (isDraggingHue) handleHueMove(e);
        });

        window.addEventListener('mouseup', () => {
            isDraggingSV = false;
            isDraggingHue = false;
        });
    }

    updateColorFromSV(x, y) {
        const s = x / this.saturationValueCanvas.width;
        const v = 1 - (y / this.saturationValueCanvas.height);
        const { h } = this.rgbToHsv(...this.hexToRgb(this.color));
        this.color = this.hsvToHex(h, s, v);
        this.draw();
        this.emit('change', { color: this.color });
    }

    updateHue(x) {
        const h = x / this.hueCanvas.width;
        const { s, v } = this.rgbToHsv(...this.hexToRgb(this.color));
        this.color = this.hsvToHex(h, s, v);
        this.draw();
        this.emit('change', { color: this.color });
    }

    draw() {
        this.drawSaturationValue();
        this.drawHue();
    }

    drawSaturationValue() {
        const ctx = this.svCtx;
        const width = this.saturationValueCanvas.width;
        const height = this.saturationValueCanvas.height;
        const { h } = this.rgbToHsv(...this.hexToRgb(this.color));
        const hueColor = this.hsvToHex(h, 1, 1);

        ctx.fillStyle = hueColor;
        ctx.fillRect(0, 0, width, height);

        const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
        whiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = whiteGradient;
        ctx.fillRect(0, 0, width, height);

        const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
        blackGradient.addColorStop(0, 'rgba(0,0,0,0)');
        blackGradient.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = blackGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw indicator
        const { s, v } = this.rgbToHsv(...this.hexToRgb(this.color));
        const x = s * width;
        const y = (1 - v) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawHue() {
        const ctx = this.hueCtx;
        const width = this.hueCanvas.width;
        const height = this.hueCanvas.height;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        for (let i = 0; i <= 1; i += 0.1) {
            gradient.addColorStop(i, `hsl(${i * 360}, 100%, 50%)`);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw indicator
        const { h } = this.rgbToHsv(...this.hexToRgb(this.color));
        const x = h * width;
        ctx.fillStyle = 'white';
        ctx.fillRect(x - 1, 0, 2, height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x - 2, -1, 4, height+2);
    }

    // Color conversion helpers
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    rgbToHsv(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, v };
    }

    hsvToHex(h, s, v) {
        let r, g, b;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}
