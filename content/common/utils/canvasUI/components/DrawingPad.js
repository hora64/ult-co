import { UIComponent } from "../UIComponent.js";

export class DrawingPad extends UIComponent {
    constructor(options) {
        super(options);
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.backgroundColor = options.backgroundColor || '#ffffff';
        this.penColor = options.penColor || '#000000';
        this.penWidth = options.penWidth || 2;

        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.createElement();
        this.attachEventListeners();
    }

    createElement() {
        super.createElement('canvas');
        this.element.width = this.width;
        this.element.height = this.height;
        this.ctx = this.element.getContext('2d');
        this.clear();
    }

    attachEventListeners() {
        this.element.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.element.addEventListener('mousemove', (e) => this.draw(e));
        this.element.addEventListener('mouseup', () => this.stopDrawing());
        this.element.addEventListener('mouseout', () => this.stopDrawing());
    }

    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }

    draw(e) {
        if (!this.isDrawing) return;
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = this.penColor;
        ctx.lineWidth = this.penWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    clear() {
        const ctx = this.ctx;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    setPenColor(color) {
        this.penColor = color;
    }

    setPenWidth(width) {
        this.penWidth = width;
    }

    toDataURL() {
        return this.element.toDataURL();
    }
}
