export class UIComponent {
    constructor() {
        this.element = null;
    }

    createElement(tag, className = "", innerHTML = "") {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    }

    createCanvas(width, height, className = "") {
        const canvas = this.createElement("canvas", className);
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    destroy() {
        // Base destroy method, can be overridden by subclasses
    }
}