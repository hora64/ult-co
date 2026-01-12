import { TextCanvasMeasurer } from '/content/common/utils/index.js';

export class UnreadIndicator {
    constructor(options = {}) {
        this.type = options.type || 'star'; // 'star', 'dot'
        this.color = options.color || (this.type === 'dot' ? '#007bff' : '#FFD700'); // Blue for dot, Gold for star
        this.sparkleSize = 12;
        this.outerRadius = this.sparkleSize * 0.5;
        this.innerRadius = this.sparkleSize * 0.15;
        this.measurer = new TextCanvasMeasurer();
    }

    draw(ctx, x, y, time) {
        switch (this.type) {
            case 'star':
                this.drawStar(ctx, x, y, time);
                break;
            case 'dot':
                this.drawDot(ctx, x, y, time);
                break;
            default:
                this.drawStar(ctx, x, y, time);
        }
    }

    drawDot(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);

        const baseRadius = this.sparkleSize * 0.3;
        const pulsatingFactor = 0.95 + Math.sin(time * 0.002) * 0.05; // Subtle pulse
        const radius = baseRadius * pulsatingFactor;

        // Animation for a bright shine every 5 seconds
        const cycle = 5000;
        const timeInCycle = time % cycle;
        
        // Use a non-linear progress for a "flash" effect
        let animationProgress = timeInCycle / 2000; // Make the main effect last 2 seconds
        if (animationProgress > 1) animationProgress = 0;

        // Ease-out function for a quick burst
        const easedProgress = 1 - Math.pow(1 - animationProgress, 4);

        const glowRadius = easedProgress * 6; // Reduced from 10 to 6
        const glowOpacity = (1 - easedProgress) * 0.5; // Reduced opacity by 50%

        if (animationProgress > 0) {
            const glowGradient = ctx.createRadialGradient(0, 0, radius, 0, 0, glowRadius);
            const glowColor = this.measurer.adjustColor(this.color, 30); // Reduced from 60 to 30
            const opacityHex = Math.round(glowOpacity * 255).toString(16).padStart(2, '0');
            glowGradient.addColorStop(0, `${glowColor}${opacityHex}`);
            glowGradient.addColorStop(1, `${glowColor}00`);
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add a subtle shine effect to the dot
        ctx.shadowColor = this.measurer.adjustColor(this.color, 40); // Reduced from 80 to 40
        ctx.shadowBlur = 4; // Reduced from 10 to 4
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Center dot with gradient and outline for Fresnel-like edge
        const dotGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        const lightColor = this.measurer.adjustColor(this.color, 50); // Reduced from 100 to 50
        const edgeColor = this.measurer.adjustColor(this.color, 10); // Reduced from 20 to 10

        dotGradient.addColorStop(0, lightColor);
        dotGradient.addColorStop(0.7, this.color);
        dotGradient.addColorStop(0.9, edgeColor);
        dotGradient.addColorStop(1, this.measurer.adjustColor(this.color, -20));

        ctx.fillStyle = dotGradient;
        ctx.strokeStyle = this.measurer.adjustColor(this.color, -40);
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawStar(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);

        // Reduced pulse effect
        const pulsatingScale = 1 + Math.sin(time * 0.005) * 0.05;
        ctx.scale(pulsatingScale, pulsatingScale);

        // Create a radial gradient for the embossed effect
        const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, this.outerRadius
        );
        const lightColor = this.measurer.adjustColor(this.color, 30); // Reduced from 40 to 30
        const darkColor = this.measurer.adjustColor(this.color, -40);

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Reduced from 0.9 to 0.4
        gradient.addColorStop(0.3, lightColor);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, darkColor);
        ctx.fillStyle = gradient;

        // Removed 'lighter' composite operation to reduce brightness
        // ctx.globalCompositeOperation = 'lighter';

        // Add a subtle glow effect
        ctx.shadowColor = `${lightColor}66`; // Reduced opacity from 99 to 66
        ctx.shadowBlur = this.sparkleSize * 0.4; // Reduced from 0.8 to 0.4
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw a sharper 4-pointed star shape
        ctx.beginPath();
        ctx.moveTo(0, -this.outerRadius);
        ctx.lineTo(this.innerRadius, -this.innerRadius);
        ctx.lineTo(this.outerRadius, 0);
        ctx.lineTo(this.innerRadius, this.innerRadius);
        ctx.lineTo(0, this.outerRadius);
        ctx.lineTo(-this.innerRadius, this.innerRadius);
        ctx.lineTo(-this.outerRadius, 0);
        ctx.lineTo(-this.innerRadius, -this.innerRadius);
        ctx.closePath();
        ctx.fill();

        // ctx.globalCompositeOperation = 'source-over'; // Already removed above

        // Reset shadow properties
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.restore();
    }

    drawSparkle(ctx, centerX, centerY, size, opacity) {
        ctx.save();
        ctx.translate(centerX, centerY);

        const outerRadius = size * 0.5;
        const innerRadius = size * 0.15;
        const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, outerRadius
        );

        const lightColor = this.measurer.adjustColor(this.color, 40);
        const darkColor = this.measurer.adjustColor(this.color, -40);

        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.9})`);
        gradient.addColorStop(0.3, `${lightColor}${Math.round(opacity * 255).toString(16)}`);
        gradient.addColorStop(0.7, `${this.color}${Math.round(opacity * 255).toString(16)}`);
        gradient.addColorStop(1, `${darkColor}${Math.round(opacity * 0.8 * 255).toString(16)}`);
        ctx.fillStyle = gradient;

        ctx.shadowColor = `${lightColor}${Math.round(opacity * 0.9 * 255).toString(16)}`;
        ctx.shadowBlur = size * 0.8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        ctx.lineTo(innerRadius, -innerRadius);
        ctx.lineTo(outerRadius, 0);
        ctx.lineTo(innerRadius, innerRadius);
        ctx.lineTo(0, outerRadius);
        ctx.lineTo(-innerRadius, innerRadius);
        ctx.lineTo(-outerRadius, 0);
        ctx.lineTo(-innerRadius, -innerRadius);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.restore();
    }

    createSparkleEffect(canvas, appRoot, element) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        canvas.width = 100;
        canvas.height = 100;
        canvas.style.position = 'absolute';

        const elementRect = element.getBoundingClientRect();
        const appRect = appRoot.getBoundingClientRect();

        canvas.style.left = `${elementRect.left - appRect.left + elementRect.width / 2 - canvas.width / 2}px`;
        canvas.style.top = `${elementRect.top - appRect.top + elementRect.height / 2 - canvas.height / 2}px`;
        canvas.style.pointerEvents = 'none';

        return {
            canvas,
            ctx,
            animate: (onComplete) => {
                let startTime = performance.now();
                const duration = 800;

                const animateFrame = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = elapsed / duration;

                    if (progress < 1) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        const opacity = 1 - progress;
                        const radius = 5 + progress * 20;

                        ctx.strokeStyle = `rgba(255, 255, 0, ${opacity})`;
                        ctx.lineWidth = 2;

                        for (let i = 0; i < 8; i++) {
                            ctx.beginPath();
                            const angle = (Math.PI * 2 / 8) * i;
                            const startX = canvas.width / 2 + Math.cos(angle) * (radius * 0.5);
                            const startY = canvas.height / 2 + Math.sin(angle) * (radius * 0.5);
                            const endX = canvas.width / 2 + Math.cos(angle) * radius;
                            const endY = canvas.height / 2 + Math.sin(angle) * radius;
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                        }

                        requestAnimationFrame(animateFrame);
                    } else {
                        if (onComplete) onComplete();
                        canvas.remove();
                    }
                };

                requestAnimationFrame(animateFrame);
            }
        };
    }
}