import { UIComponent } from "/content/common/utils/canvasUI/UIComponent.js";

export class LoadingCircle extends UIComponent {
    constructor({
        size = 40,
        strokeWidth = 4,
        color = "#007bff",
        backgroundColor = "rgba(0,0,0,0.1)",
        animationDuration = 1000,
        className = "loading-circle"
    } = {}) {
        super();
        this.size = size;
        this.strokeWidth = strokeWidth;
        this.color = color;
        this.backgroundColor = backgroundColor;
        this.animationDuration = animationDuration;
        this.className = className;
        this.isAnimating = false;
        this.animationFrame = null;
        this.startTime = 0;
        
        this.element = this.render();
    }

    render() {
        const container = this.createElement('div', this.className);
        container.style.width = `${this.size}px`;
        container.style.height = `${this.size}px`;
        container.style.position = 'relative';
        container.style.display = 'inline-block';

        this.canvas = this.createCanvas(this.size, this.size);
        container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.draw(0);

        return container;
    }

    draw(progress = 0) {
        const ctx = this.ctx;
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const radius = (this.size - this.strokeWidth) / 2;

        ctx.clearRect(0, 0, this.size, this.size);

        // Draw background circle
        if (this.backgroundColor && this.backgroundColor !== 'transparent') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = this.backgroundColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.stroke();
        }

        // Draw progress arc
        const angle = progress * 2 * Math.PI;
        const startAngle = -Math.PI / 2; // Start from top

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    start() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.startTime = performance.now();
        
        const animate = (currentTime) => {
            if (!this.isAnimating) return;
            
            const elapsed = currentTime - this.startTime;
            const progress = (elapsed % this.animationDuration) / this.animationDuration;
            
            this.draw(progress);
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }

    stop() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.draw(0); // Reset to initial state
    }

    setProgress(progress) {
        this.stop(); // Stop animation if running
        this.draw(Math.max(0, Math.min(1, progress))); // Clamp between 0 and 1
    }

    destroy() {
        this.stop();
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }

    // Static method to create a simple loading spinner
    static createSpinner(options = {}) {
        const spinner = new LoadingCircle({
            size: 24,
            strokeWidth: 3,
            color: "#007bff",
            backgroundColor: "rgba(0,0,0,0.1)",
            animationDuration: 800,
            ...options
        });
        
        spinner.start();
        return spinner;
    }

    // Static method to create a progress circle
    static createProgress(options = {}) {
        return new LoadingCircle({
            size: 32,
            strokeWidth: 4,
            color: "#28a745",
            backgroundColor: "rgba(0,0,0,0.1)",
            ...options
        });
    }
}