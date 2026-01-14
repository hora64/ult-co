import { TextCanvasMeasurer } from '/content/common/utils/index.js';

export class UnreadIndicator {
    constructor(options = {}) {
        this.type = options.type || 'star'; // 'star', 'dot', 'new', 'urgent', 'always', 'hourglass'
        
        // Set default colors based on type according to the documentation
        const defaultColors = {
            'star': '#fd7e14',    // Orange - Featured
            'dot': '#0d6efd',     // Blue - Unread
            'new': '#198754',     // Green - New content
            'urgent': '#dc3545',  // Red - Time-sensitive
            'always': '#9c27b0',  // Purple - Always visible
            'hourglass': '#ffc107' // Amber - Time-limited
        };
        
        this.color = options.color || defaultColors[this.type] || '#FFD700';
        
        // Support for gradient colors
        if (options.gradient) {
            this.gradient = options.gradient;
        } else {
            this.gradient = null;
        }
        
        // Always show if type is 'always'
        this.alwaysShow = this.type === 'always';
        
        // Time range for hourglass indicators
        this.timeRange = options.timeRange || null; // { start: ISO date, end: ISO date }
        
        // Rotating ball text effect (for new and urgent badges)
        this.rotatingText = options.rotatingText !== undefined ? options.rotatingText : false;
        
        // Read state for hourglass
        this.isRead = options.isRead !== undefined ? options.isRead : false;
        
        this.sparkleSize = 12;
        this.outerRadius = this.sparkleSize * 0.5;
        this.innerRadius = this.sparkleSize * 0.15;
        this.measurer = new TextCanvasMeasurer();
    }

    draw(ctx, x, y, time, isRead) {
        // Allow isRead to be passed dynamically at draw time
        const readState = isRead !== undefined ? isRead : this.isRead;
        
        switch (this.type) {
            case 'star':
                this.drawStar(ctx, x, y, time);
                break;
            case 'dot':
                this.drawDot(ctx, x, y, time);
                break;
            case 'new':
                this.drawNew(ctx, x, y, time);
                break;
            case 'urgent':
                this.drawUrgent(ctx, x, y, time);
                break;
            case 'always':
                this.drawAlways(ctx, x, y, time);
                break;
            case 'hourglass':
                this.drawHourglass(ctx, x, y, time, readState);
                break;
            default:
                this.drawStar(ctx, x, y, time);
        }
    }

    // Helper method to create gradient fill style
    _createGradientFill(ctx, centerX, centerY, radius) {
        if (this.gradient && Array.isArray(this.gradient) && this.gradient.length >= 2) {
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            this.gradient.forEach((colorStop, index) => {
                const position = index / (this.gradient.length - 1);
                gradient.addColorStop(position, colorStop);
            });
            return gradient;
        }
        return null;
    }

    drawAlways(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);

        // Static size - no pulsing
        const radius = this.sparkleSize * 0.3;

        // Constant subtle glow (no animation cycles)
        ctx.shadowColor = this.measurer.adjustColor(this.color, 40);
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Solid gradient for depth
        const badgeGradient = this._createGradientFill(ctx, 0, 0, radius) ||
            ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        if (!this.gradient) {
            const lightColor = this.measurer.adjustColor(this.color, 50);
            const edgeColor = this.measurer.adjustColor(this.color, -10);
            badgeGradient.addColorStop(0, lightColor);
            badgeGradient.addColorStop(0.65, this.color);
            badgeGradient.addColorStop(0.9, edgeColor);
            badgeGradient.addColorStop(1, this.measurer.adjustColor(this.color, -30));
        }

        ctx.fillStyle = badgeGradient;
        ctx.strokeStyle = this.measurer.adjustColor(this.color, -50);
        ctx.lineWidth = 0.6;

        // Draw circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw centered dot for emphasis
        const centerDotRadius = radius * 0.3;
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.measurer.adjustColor(this.color, 80);
        ctx.beginPath();
        ctx.arc(0, 0, centerDotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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
        const dotGradient = this._createGradientFill(ctx, 0, 0, radius) || 
            ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        if (!this.gradient) {
            const lightColor = this.measurer.adjustColor(this.color, 50);
            const edgeColor = this.measurer.adjustColor(this.color, 10);
            dotGradient.addColorStop(0, lightColor);
            dotGradient.addColorStop(0.7, this.color);
            dotGradient.addColorStop(0.9, edgeColor);
            dotGradient.addColorStop(1, this.measurer.adjustColor(this.color, -20));
        }

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
        const gradient = this._createGradientFill(ctx, 0, 0, this.outerRadius) ||
            ctx.createRadialGradient(0, 0, 0, 0, 0, this.outerRadius);
        
        if (!this.gradient) {
            const lightColor = this.measurer.adjustColor(this.color, 30);
            const darkColor = this.measurer.adjustColor(this.color, -40);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(0.3, lightColor);
            gradient.addColorStop(0.7, this.color);
            gradient.addColorStop(1, darkColor);
        }
        
        ctx.fillStyle = gradient;

        // Add a subtle glow effect
        const lightColor = this.measurer.adjustColor(this.color, 30);
        ctx.shadowColor = `${lightColor}66`;
        ctx.shadowBlur = this.sparkleSize * 0.4;
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

        // Reset shadow properties
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.restore();
    }

    drawNew(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);

        const baseRadius = this.sparkleSize * 0.35;
        const pulsatingFactor = 1 + Math.sin(time * 0.003) * 0.08; // Gentle pulse
        const radius = baseRadius * pulsatingFactor;

        // Subtle glow effect for new indicator
        const cycle = 3000;
        const timeInCycle = time % cycle;
        let animationProgress = timeInCycle / 1500;
        if (animationProgress > 1) animationProgress = 0;

        const easedProgress = 1 - Math.pow(1 - animationProgress, 3);
        const glowRadius = easedProgress * 5;
        const glowOpacity = (1 - easedProgress) * 0.4;

        if (animationProgress > 0) {
            const glowGradient = ctx.createRadialGradient(0, 0, radius, 0, 0, glowRadius);
            const glowColor = this.measurer.adjustColor(this.color, 40);
            const opacityHex = Math.round(glowOpacity * 255).toString(16).padStart(2, '0');
            glowGradient.addColorStop(0, `${glowColor}${opacityHex}`);
            glowGradient.addColorStop(1, `${glowColor}00`);
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw badge circle FIRST
        ctx.shadowColor = this.measurer.adjustColor(this.color, 50);
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Gradient for depth
        const badgeGradient = this._createGradientFill(ctx, 0, 0, radius) ||
            ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        if (!this.gradient) {
            const lightColor = this.measurer.adjustColor(this.color, 60);
            const edgeColor = this.measurer.adjustColor(this.color, -10);
            badgeGradient.addColorStop(0, lightColor);
            badgeGradient.addColorStop(0.6, this.color);
            badgeGradient.addColorStop(0.9, edgeColor);
            badgeGradient.addColorStop(1, this.measurer.adjustColor(this.color, -30));
        }

        ctx.fillStyle = badgeGradient;
        ctx.strokeStyle = this.measurer.adjustColor(this.color, -50);
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Reset shadow before drawing text
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;

        if (this.rotatingText) {
            // Rotating ball effect - text rotates around Y-axis
            this._drawRotatingBallText(ctx, 'N', radius, pulsatingFactor, time);
        } else {
            // Standard text rendering
            this._drawStandardText(ctx, 'N', pulsatingFactor);
        }
        
        ctx.restore();
    }

    drawUrgent(ctx, x, y, time) {
        ctx.save();
        ctx.translate(x, y);

        // More aggressive pulse for urgent
        const pulsatingFactor = 1 + Math.sin(time * 0.008) * 0.15;
        const radius = (this.sparkleSize * 0.35) * pulsatingFactor;

        // Fast flashing glow effect
        const cycle = 1500; // Faster cycle for urgency
        const timeInCycle = time % cycle;
        let animationProgress = timeInCycle / 750;
        if (animationProgress > 1) animationProgress = 0;

        const easedProgress = 1 - Math.pow(1 - animationProgress, 2);
        const glowRadius = easedProgress * 8;
        const glowOpacity = (1 - easedProgress) * 0.6;

        if (animationProgress > 0) {
            const glowGradient = ctx.createRadialGradient(0, 0, radius, 0, 0, glowRadius);
            const glowColor = this.measurer.adjustColor(this.color, 50);
            const opacityHex = Math.round(glowOpacity * 255).toString(16).padStart(2, '0');
            glowGradient.addColorStop(0, `${glowColor}${opacityHex}`);
            glowGradient.addColorStop(1, `${glowColor}00`);
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw badge circle FIRST
        ctx.shadowColor = this.measurer.adjustColor(this.color, 60);
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Gradient for urgent badge
        const badgeGradient = this._createGradientFill(ctx, 0, 0, radius) ||
            ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        if (!this.gradient) {
            const lightColor = this.measurer.adjustColor(this.color, 70);
            const edgeColor = this.measurer.adjustColor(this.color, -15);
            badgeGradient.addColorStop(0, lightColor);
            badgeGradient.addColorStop(0.5, this.color);
            badgeGradient.addColorStop(0.85, edgeColor);
            badgeGradient.addColorStop(1, this.measurer.adjustColor(this.color, -40));
        }

        ctx.fillStyle = badgeGradient;
        ctx.strokeStyle = this.measurer.adjustColor(this.color, -60);
        ctx.lineWidth = 0.7;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Reset shadow before drawing text
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;

        if (this.rotatingText) {
            // Rotating ball effect - text rotates around Y-axis
            this._drawRotatingBallText(ctx, '!', radius, pulsatingFactor, time);
        } else {
            // Standard text rendering
            this._drawStandardText(ctx, '!', pulsatingFactor, true);
        }
        
        ctx.restore();
    }

    _drawStandardText(ctx, text, pulsatingFactor, isUrgent = false) {
        // Apply inverse scale to keep text size constant
        const textScale = 1 / pulsatingFactor;
        ctx.save();
        ctx.scale(textScale, textScale);
        
        // Much stronger text shadow for legibility
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw text with strong shadow
        ctx.fillStyle = '#ffffff';
        ctx.font = isUrgent ? 'bold 8px Arial' : 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text shadow layers for better contrast
        for (let i = 0; i < 3; i++) {
            ctx.fillText(text, 0, isUrgent ? 0 : 0.5);
        }
        
        ctx.restore();
    }

    _drawRotatingBallText(ctx, text, radius, pulsatingFactor, time) {
        // Calculate rotation angle for ball effect
        const rotationSpeed = 0.002; // Adjust speed
        const angle = (time * rotationSpeed) % (Math.PI * 2);
        
        // Calculate 3D projection (Y-axis rotation)
        const scaleX = Math.abs(Math.cos(angle)); // Width compression
        const offsetX = Math.sin(angle) * radius * 0.2; // Horizontal movement
        
        // Apply inverse scale to keep text size constant relative to pulsing
        const textScale = 1 / pulsatingFactor;
        ctx.save();
        ctx.scale(textScale, textScale);
        
        // Apply 3D transformation
        ctx.save();
        ctx.translate(offsetX, 0);
        ctx.scale(scaleX, 1);
        
        // Adjust opacity based on rotation (fade at edges)
        const opacity = 0.4 + (scaleX * 0.6); // Range: 0.4 to 1.0
        
        // Strong text shadow for legibility
        ctx.shadowBlur = 2;
        ctx.shadowColor = `rgba(0, 0, 0, ${opacity * 0.8})`;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw text with opacity based on rotation
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = text === '!' ? 'bold 8px Arial' : 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text shadow layers for better contrast
        for (let i = 0; i < 3; i++) {
            ctx.fillText(text, 0, text === '!' ? 0 : 0.5);
        }
        
        ctx.restore();
        ctx.restore();
    }

    drawHourglass(ctx, x, y, time, isRead = false) {
        ctx.save();
        ctx.translate(x, y);

        // Calculate time-based state
        let sandProgress = 0;
        let isDisabled = false;
        let isExpired = false;
        
        if (this.timeRange && this.timeRange.start && this.timeRange.end) {
            const now = Date.now();
            const startTime = new Date(this.timeRange.start).getTime();
            const endTime = new Date(this.timeRange.end).getTime();
            
            if (now < startTime) {
                // Before start time - disabled state
                isDisabled = true;
                sandProgress = 0;
            } else if (now > endTime) {
                // After end time - expired
                isExpired = true;
                sandProgress = 1;
            } else {
                // During active period - calculate actual progress
                const totalDuration = endTime - startTime;
                const elapsed = now - startTime;
                sandProgress = elapsed / totalDuration;
            }
        } else {
            // No time range - use looping animation (legacy behavior)
            sandProgress = (time * 0.0005) % 1;
        }

        // Determine colors based on state and read status
        let glassColor, sandColor, glowColor, outlineColor, woodColor;
        let shouldGlow = !isRead && !isDisabled; // Only glow when unread and not disabled
        
        if (isDisabled) {
            // Grayed out, desaturated look
            glassColor = 'rgba(200, 200, 200, 0.3)';
            sandColor = '#808080';
            glowColor = '#606060';
            outlineColor = '#505050';
            woodColor = '#6B5D52';
        } else if (isExpired) {
            // Dimmed but still visible
            glassColor = 'rgba(255, 235, 200, 0.2)';
            sandColor = this.measurer.adjustColor(this.color, -40);
            glowColor = this.measurer.adjustColor(this.color, -30);
            outlineColor = this.measurer.adjustColor(this.color, -60);
            woodColor = '#8B6F47';
        } else if (isRead) {
            // Read state - no glow, dimmed colors
            glassColor = 'rgba(255, 235, 200, 0.15)';
            sandColor = this.measurer.adjustColor('#FFF8DC', -20);
            glowColor = this.measurer.adjustColor(this.color, -20);
            outlineColor = this.measurer.adjustColor('#D4AF37', -30);
            woodColor = this.measurer.adjustColor('#8B6F47', -15);
        } else {
            // Active unread colors with glow
            glassColor = 'rgba(255, 255, 255, 0.2)';
            sandColor = '#FFF8DC';
            glowColor = this.measurer.adjustColor(this.color, 45);
            outlineColor = '#D4AF37';
            woodColor = '#8B6F47';
        }

        const size = 4.5;
        
        // Add subtle glow to the hourglass only when unread
        if (shouldGlow) {
            ctx.shadowBlur = 3;
            ctx.shadowColor = glowColor + '60';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // Draw wood base at top
        this._drawWoodBase(ctx, 0, -size - 1, size * 1.6, woodColor, isDisabled);
        
        // Draw wood base at bottom
        this._drawWoodBase(ctx, 0, size + 1, size * 1.6, woodColor, isDisabled);

        // Reset shadow for glass drawing
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';

        // Draw glass bulbs with semi-transparent fill
        ctx.fillStyle = glassColor;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = isDisabled ? 0.6 : 0.8;

        // Top glass bulb
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, -size);
        ctx.lineTo(-size * 0.3, -size * 0.1);
        ctx.lineTo(size * 0.3, -size * 0.1);
        ctx.lineTo(size * 0.7, -size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bottom glass bulb
        ctx.beginPath();
        ctx.moveTo(-size * 0.7, size);
        ctx.lineTo(-size * 0.3, size * 0.1);
        ctx.lineTo(size * 0.3, size * 0.1);
        ctx.lineTo(size * 0.7, size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw sand
        ctx.fillStyle = sandColor;
        
        if (!isDisabled) {
            // Draw sand in top half (decreasing as time passes - sand falls out)
            const topSandHeight = (1 - sandProgress) * (size * 0.8);
            if (topSandHeight > 0.5) {
                ctx.beginPath();
                // Top sand fills from bottom of top bulb upward
                const topSandY = -size * 0.1 - topSandHeight;
                ctx.moveTo(-size * 0.6, -size * 0.1);
                ctx.lineTo(-size * 0.25, topSandY);
                ctx.lineTo(size * 0.25, topSandY);
                ctx.lineTo(size * 0.6, -size * 0.1);
                ctx.closePath();
                ctx.fill();
            }

            // Draw sand in bottom half (increasing as time passes - sand accumulates)
            const bottomSandHeight = sandProgress * (size * 0.8);
            if (bottomSandHeight > 0.5) {
                ctx.beginPath();
                // Bottom sand fills from top of bottom bulb downward
                const bottomSandY = size * 0.1 + bottomSandHeight;
                ctx.moveTo(-size * 0.6, size * 0.1);
                ctx.lineTo(-size * 0.25, bottomSandY);
                ctx.lineTo(size * 0.25, bottomSandY);
                ctx.lineTo(size * 0.6, size * 0.1);
                ctx.closePath();
                ctx.fill();
            }

            // Draw falling sand stream in the middle
            if (sandProgress > 0 && sandProgress < 1) {
                ctx.fillStyle = sandColor;
                ctx.globalAlpha = 0.6;
                ctx.fillRect(-0.5, -size * 0.1, 1, size * 0.2);
                ctx.globalAlpha = 1.0;
            }
        } else {
            // Disabled state - all sand at top (fill entire top bulb)
            ctx.beginPath();
            ctx.moveTo(-size * 0.6, -size * 0.1);
            ctx.lineTo(-size * 0.25, -size * 0.9);
            ctx.lineTo(size * 0.25, -size * 0.9);
            ctx.lineTo(size * 0.6, -size * 0.1);
            ctx.closePath();
            ctx.fill();
        }

        // Draw the bottleneck circle
        ctx.fillStyle = outlineColor;
        ctx.beginPath();
        ctx.arc(0, 0, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawWoodBase(ctx, x, y, width, woodColor, isDisabled) {
        ctx.save();
        ctx.translate(x, y);

        const height = 1.5;
        const halfWidth = width / 2;

        // Create wood grain gradient
        const woodGradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
        const darkWood = this.measurer.adjustColor(woodColor, -20);
        const lightWood = this.measurer.adjustColor(woodColor, 10);
        
        woodGradient.addColorStop(0, darkWood);
        woodGradient.addColorStop(0.5, lightWood);
        woodGradient.addColorStop(1, darkWood);

        // Draw wooden base
        ctx.fillStyle = woodGradient;
        ctx.fillRect(-halfWidth, -height / 2, width, height);

        // Draw border outline
        ctx.strokeStyle = this.measurer.adjustColor(woodColor, -30);
        ctx.lineWidth = 0.3;
        ctx.strokeRect(-halfWidth, -height / 2, width, height);

        // Draw wood grain texture lines
        if (!isDisabled) {
            ctx.strokeStyle = this.measurer.adjustColor(woodColor, -10) + '40';
            ctx.lineWidth = 0.2;
            
            for (let i = 0; i < 3; i++) {
                const lineY = -height / 2 + (height / 4) * (i + 1);
                ctx.beginPath();
                ctx.moveTo(-halfWidth + 1, lineY);
                ctx.lineTo(halfWidth - 1, lineY);
                ctx.stroke();
            }
        }

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
