import { UIComponent } from '../index.js';

export class CanvasContainer extends UIComponent {
    constructor({
        width,
        height,
        backgroundColor = 'transparent',
        borderRadius = 0,
        containerStyles = {},
        className = ''
    }) {
        super();
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;
        this.borderRadius = borderRadius;
        this.children = [];
        this.className = className;

        this.element = this.render();
        Object.assign(this.element.style, containerStyles);
    }

    add(component) {
        this.children.push(component);
        this.element.appendChild(component.element);
        this.updateChildPositions();
    }

    remove(component) {
        const index = this.children.indexOf(component);
        if (index > -1) {
            this.children.splice(index, 1);
            this.element.removeChild(component.element);
        }
    }

    updateChildPositions() {
        this.children.forEach(child => {
            if (child.x !== undefined && child.y !== undefined) {
                child.element.style.position = 'absolute';
                child.element.style.left = `${child.x}px`;
                child.element.style.top = `${child.y}px`;
            }
        });
    }

    _drawRoundedRect(ctx, x, y, width, height, radius) {
        if (typeof radius === 'number') {
            radius = { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };
        } else if (Array.isArray(radius)) {
            radius = { topLeft: radius[0], topRight: radius[1], bottomRight: radius[2], bottomLeft: radius[3] };
        } else {
            radius = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, ...radius };
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.topLeft, y);
        ctx.lineTo(x + width - radius.topRight, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.topRight);
        ctx.lineTo(x + width, y + height - radius.bottomRight);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.bottomRight, y + height);
        ctx.lineTo(x + radius.bottomLeft, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bottomLeft);
        ctx.lineTo(x, y + radius.topLeft);
        ctx.quadraticCurveTo(x, y, x + radius.topLeft, y);
        ctx.closePath();
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        const { width, height } = this.canvas;

        ctx.clearRect(0, 0, width, height);

        if (this.backgroundColor !== 'transparent') {
            ctx.fillStyle = this.backgroundColor;
            this._drawRoundedRect(ctx, 0, 0, width, height, this.borderRadius);
            ctx.fill();
        }
    }

    render() {
        const container = this.createElement('div', `canvas-container ${this.className}`);
        this.canvas = this.createCanvas(this.width, this.height);
        container.appendChild(this.canvas);
        container.style.width = `${this.width}px`;
        container.style.height = `${this.height}px`;
        container.style.position = 'relative';

        this.draw();
        return container;
    }
}
