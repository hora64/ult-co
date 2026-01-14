export class PixelatedDotLoader {
    constructor(options = {}) {
        // Merge options with defaults
        this.options = {
            parent: options.parent || document.body,
            dotCount: options.dotCount || 8,
            radius: options.radius || 16,
            dotSize: options.dotSize || 8,
            // New option for pixelation level
            pixelation: options.pixelation || 8, 
            baseColor: options.baseColor || '#ff8000',
            colorGradient: options.colorGradient || ['#ff8000', '#ff9900', '#ffcc00', '#ffff00'],
            zoomOutScale: options.zoomOutScale || 0.4,
            zoomOutDuration: options.zoomOutDuration || 300,
            zoomOutDelay: options.zoomOutDelay || 0,
            interval: options.interval || 80,
            position: options.position || 'fixed',
            top: options.top || '50%',
            left: options.left || '50%',
            transform: options.transform || 'translate(-50%, -50%)',
            zIndex: options.zIndex || 9999
        };

        this.rotationInterval = null;
        this.animationFrameId = null;
        this.loaded = false;
        this.currentDot = 0;

        // Create the canvas element
        this._createCanvas();

        // Append to parent
        this.options.parent.appendChild(this.canvas);
        
        // Create element property for compatibility with LoadingCircle API
        this.element = this.canvas;
    }

    _createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Key change for pixelation: disable image smoothing
        this.ctx.imageSmoothingEnabled = false;

        // --- FIX: Calculate dimensions in low-res first ---

        // Calculate scaled (low-res) dimensions
        const lowResPathRadius = this.options.radius / this.options.pixelation;
        const lowResDotRadius = this.options.dotSize / this.options.pixelation;
        
        // This is the actual radius that will be used in drawing due to Math.ceil
        // We add 0.5 to account for the 1px centered stroke
        const drawnDotRadius = Math.ceil(lowResDotRadius) + 0.5; 
        
        // Find the max possible radius. The "zoom" animation scales the path radius by 1.5
        const maxPathRadius = lowResPathRadius * 1.5;
        
        // The total radius of the widget in low-res blocks
        // We take the max path, plus the max dot radius, to be absolutely safe.
        // This creates some padding but guarantees no clipping.
        const totalLowResRadius = maxPathRadius + drawnDotRadius;
        
        // The total size (diameter) in low-res blocks
        // We add 1 pixel as a small safety buffer
        const lowResSize = Math.ceil(totalLowResRadius * 2) + 1;

        // The internal canvas resolution is small
        this.canvas.width = lowResSize;
        this.canvas.height = lowResSize;
        
        // The final size the widget will appear on screen
        // This is the low-res size scaled back up
        const finalSize = lowResSize * this.options.pixelation;
        
        // The CSS size is scaled up to the final desired size
        this.canvas.style.width = `${finalSize}px`;
        this.canvas.style.height = `${finalSize}px`;
        
        // --- End Fix ---
        
        // Apply positioning styles
        this.canvas.style.position = this.options.position;
        this.canvas.style.top = this.options.top;
        this.canvas.style.left = this.options.left;
        this.canvas.style.transform = this.options.transform;
        this.canvas.style.zIndex = this.options.zIndex;
    }

    _draw(drawOptions = {}) {
        const { radiusScale = 1, dotScale = 1, opacity = 1 } = drawOptions;
        
        // All drawing is now done on the small, internal canvas
        const size = this.canvas.width;
        const center = size / 2;
        
        // Scale down the radius and dotSize to fit the low-res canvas
        const radius = this.options.radius / this.options.pixelation;
        const dotSize = this.options.dotSize / this.options.pixelation;
        
        const colors = this.options.colorGradient;
        const dotCount = this.options.dotCount;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = opacity;

        for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            const x = center + Math.cos(angle) * radius * radiusScale;
            const y = center + Math.sin(angle) * radius * radiusScale;
            
            const currentDotRadius = Math.ceil(dotSize * dotScale);
            if (currentDotRadius <= 0) continue; // Don't draw 0-size dots

            let color = colors[0];
            if (i === this.currentDot) {
                color = colors[3];
            } else if (i === (this.currentDot + 1) % dotCount || i === (this.currentDot - 1 + dotCount) % dotCount) {
                color = colors[2];
            } else if (i === (this.currentDot + 2) % dotCount || i === (this.currentDot - 2 + dotCount) % dotCount) {
                color = colors[1];
            }

            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1; // 1 pixel on the low-res canvas
            
            this.ctx.beginPath();
            // We use Math.ceil to ensure dots are at least 1px on the low-res canvas
            this.ctx.arc(x, y, currentDotRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke(); // Add the outline
        }
    }

    start() {
        if (this.rotationInterval || this.loaded) return;

        const animate = () => {
            this._draw(); // Call with default options
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();

        this.rotationInterval = setInterval(() => {
            this.currentDot = (this.currentDot + 1) % this.options.dotCount;
        }, this.options.interval);
    }

    stop(animationType = 'zoom') {
        if (this.loaded) return;
        this.loaded = true;

        if (this.rotationInterval) clearInterval(this.rotationInterval);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.rotationInterval = null;
        this.animationFrameId = null;

        const duration = this.options.zoomOutDuration;
        const delay = this.options.zoomOutDelay;
        let startTime = null;

        const animateStop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed < delay) {
                requestAnimationFrame(animateStop);
                return;
            }
            
            const progress = Math.min((elapsed - delay) / duration, 1);
            const easedProgress = progress * progress * progress;

            if (animationType === 'zoom') {
                // "Shoot out" (expand radius) and "shrink" (reduce dot scale)
                const radiusScale = 1 + (0.5 * easedProgress);
                const dotScale = 1 - easedProgress;
                const opacity = 1 - easedProgress;
                this._draw({ radiusScale, dotScale, opacity });
            } else {
                const opacity = 1 - easedProgress;
                this._draw({ opacity });
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateStop);
            } else {
                this.canvas.style.opacity = 0;
            }
        };

        requestAnimationFrame(animateStop);
    }

    reset() {
        if (this.rotationInterval) clearInterval(this.rotationInterval);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        
        this.rotationInterval = null;
        this.animationFrameId = null;
        this.loaded = false;
        this.currentDot = 0;
        this.canvas.style.opacity = 1;

        this.start();
    }
    
    destroy() {
        if (this.rotationInterval) clearInterval(this.rotationInterval);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.loaded = true;

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        this.canvas = null;
        this.ctx = null;
        this.element = null;
    }
    
    // Static method to create a simple loading spinner (for API compatibility)
    static createSpinner(options = {}) {
        const spinner = new PixelatedDotLoader({
            dotCount: 8,
            radius: 20,
            dotSize: 5,
            pixelation: 1,
            colorGradient: options.colorGradient || ['#ff8000', '#ff9900', '#ffcc00', '#ffff00'],
            interval: 80,
            zoomOutDuration: 300,
            ...options
        });
        
        spinner.start();
        return spinner;
    }
}
