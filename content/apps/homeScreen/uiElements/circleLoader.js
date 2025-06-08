export class LoadingCircleWidget {
    constructor(options = {}) {
        // Merge options with defaults
        this.options = {
            parent: options.parent || document.body, // Default to body if not specified
            dotCount: options.dotCount || 8,
            radius: options.radius || 16,
            dotSize: options.dotSize || 8,
            borderSize: options.borderSize || 1,
            borderColor: options.borderColor || 'white',
            baseColor: options.baseColor || '#ff8000',
            colorGradient: options.colorGradient || ['#ff8000', '#ff9900', '#ffcc00', '#ffff00'],
            zoomOutScale: options.zoomOutScale || 0.4,
            zoomOutDuration: options.zoomOutDuration || 300,
            zoomOutDelay: options.zoomOutDelay || 0,
            interval: options.interval || 80,
            position: options.position || 'absolute', // Default to 'absolute' when inside a parent
            top: options.top || '50%',
            left: options.left || '50%',
            transform: options.transform || 'translate(-50%, -50%)',
            zIndex: options.zIndex || 9999
        };

        this.rotationInterval = null;
        this.loaded = false;

        // Generate dynamic CSS
        this.createDynamicCSS();

        // Create loader container
        this.loader = document.createElement('div');
        this.loader.classList.add('loader', `loader-${this.loaderId}`);

        // Create dots
        this.dots = [];
        for (let i = 0; i < this.options.dotCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add(`dot-${this.loaderId}`);
            this.loader.appendChild(dot);
            this.dots.push(dot);
        }

        // Arrange dots immediately
        this.arrangeDots();

        // Append to parent (defaults to document.body if not specified)
        this.options.parent.appendChild(this.loader);

    }

    // Generate unique ID for dynamic CSS
    get loaderId() {
        if (!this._loaderId) {
            this._loaderId = Math.random().toString(36).substr(2, 9);
        }
        return this._loaderId;
    }

    createDynamicCSS() {
        const style = document.createElement('style');
        const dotSize = this.options.dotSize;
        const borderSize = this.options.borderSize;
        const borderColor = this.options.borderColor;
        const baseColor = this.options.baseColor;
        const loaderWidth = this.options.radius * 2 + dotSize;
        const loaderHeight = loaderWidth;

        style.textContent = `
        .loader-${this.loaderId} {
            position: fixed;
            width: ${loaderWidth}px;
            height: ${loaderHeight}px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 1;
            z-index: 9999;
        }
        .dot-${this.loaderId} {
            position: absolute;
            width: ${dotSize}px;
            height: ${dotSize}px;
            background-color: ${baseColor};
            border: ${borderSize}px solid ${borderColor};
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform-origin: center;
            will-change: transform, opacity;
            box-sizing: border-box;
        }
    `;
        document.head.appendChild(style);
    }
    arrangeDots() {
        const radius = this.options.radius;
        this.dots.forEach((dot, i) => {
            const angle = (i / this.options.dotCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            dot.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    start() {
        if (this.rotationInterval || this.loaded) return;
        this.arrangeDots();
        let current = 0;
        const colors = this.options.colorGradient;
        const dotCount = this.options.dotCount;
        this.rotationInterval = setInterval(() => {
            this.dots.forEach((dot, i) => {
                if (i === current) {
                    dot.style.backgroundColor = colors[3];
                } else if (i === (current + 1) % dotCount || i === (current - 1 + dotCount) % dotCount) {
                    dot.style.backgroundColor = colors[2];
                } else if (i === (current + 2) % dotCount || i === (current - 2 + dotCount) % dotCount) {
                    dot.style.backgroundColor = colors[1];
                } else {
                    dot.style.backgroundColor = colors[0];
                }
            });
            current = (current + 1) % dotCount;
        }, this.options.interval);
    }

    stop(animationType = '') {
        if (!this.rotationInterval && !this.loaded) return;

        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }

        this.loaded = true;

        if (animationType === 'zoom') {
            // Zoom out animation
            anime({
                targets: this.dots,
                translateX: (dot, i) => {
                    const angle = (i / this.options.dotCount) * Math.PI * 2;
                    return Math.cos(angle) * this.options.radius * 0.8;
                },
                translateY: (dot, i) => {
                    const angle = (i / this.options.dotCount) * Math.PI * 2;
                    return Math.sin(angle) * this.options.radius * 0.8;
                },
                scale: [1, this.options.zoomOutScale, 0],
                opacity: [1, 0.5, 0],
                duration: this.options.zoomOutDuration,
                delay: this.options.zoomOutDelay,
                easing: 'easeInCubic',
                complete: () => {
                    this.loader.style.opacity = 0;
                }
            });
        } else {
            // Simple disappear animation
            anime({
                targets: this.dots,
                opacity: 0,
                duration: this.options.zoomOutDuration,
                easing: 'easeInCubic',
                complete: () => {
                    this.loader.style.opacity = 0;
                }
            });
        }
    }

    reset() {
        // Clear any existing animations
        anime.remove(this.dots);

        // Reset styles
        this.dots.forEach(dot => {
            dot.style.opacity = '1';
            dot.style.transform = '';
            dot.style.backgroundColor = this.options.baseColor;
        });

        this.loader.style.opacity = '1';
        this.loaded = false;
        this.rotationInterval = null;

        // Restart the animation
        this.start();
    }
    destroy() {
        // 1. Stop the animation if running
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }

        // 2. Remove the loader element from the DOM
        if (this.loader && this.loader.parentNode) {
            this.loader.parentNode.removeChild(this.loader);
        }

        // 3. Remove dynamically injected CSS
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }

        // 4. Clean up references to prevent memory leaks
        this.dots = [];
        this.loader = null;
        this.styleElement = null;
        this.loaded = true; // Mark as destroyed
    }
}
