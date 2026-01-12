import { UIComponent, TextCanvasMeasurer, applyCanvasTextEffect, RichTextRenderer } from '../index.js';

export class CanvasButton extends UIComponent {
    constructor({
        app,
        text,
        sprite,
        width,
        height,
        onClick,
        font = '14px "FOT-RodinNTLG Pro DB", "Rodin", sans-serif',
        textColor = 'black',
        textBaseline = 'middle',
        textAlign = 'center', // Default alignment is 'center'
        textOffsetX = 0, // Pixel offset for text X position
        textOffsetY = 0, // Pixel offset for text Y position
        backgroundColor = '#1a1a1a',
        hoverBackgroundColor,
        selectedBackgroundColor,
        selectedHoverBackgroundColor,
        pressedBackgroundColor,
        disabledBackgroundColor,
        activeBackgroundColor, // Kept for backward compatibility
        borderRadius = 4,
        borderColor,
        sideBorderColor = null,
        sideBorderWidth = 2,
        sideBorderSides = 'left', // 'left', 'right', 'both', or null
        pulseColor = null,
        shadowOffset = { x: 0, y: 2, blur: 4, color: 'rgba(0,0,0,0.2)' },
        isActive = false,
        isDisabled = false,
        isCompleted = false,
        marqueeEnabled = true,
        marqueeDirection = 'left', // 'left' or 'right'
        marqueeSpeed = 0.1,
        marqueeGap = 20, // Gap for seamless marquee loop
        sounds,
        highlightDirection = 'top',
        highlightEnabled = true,
        moveOnPress = false,
        effect = null,
        effectStates = ['backgroundColor', 'hoverBackgroundColor', 'pressedBackgroundColor', 'selectedBackgroundColor'],
        states = {},
        spriteScale = 1.0 // New parameter for sprite scaling
    }) {
        super();

        // --- State Management Refactor ---
        const mergedStates = {
            default: { text: typeof text === 'object' ? text.default : text, backgroundColor: backgroundColor, effect: effect, icon: sprite, marqueeSpeed: marqueeSpeed },
            hover: { text: text?.hover, backgroundColor: hoverBackgroundColor, icon: sprite },
            pressed: { text: text?.pressed, backgroundColor: pressedBackgroundColor || activeBackgroundColor, icon: sprite },
            selected: { text: text?.selected, backgroundColor: selectedBackgroundColor, icon: sprite },
            selectedHover: { text: text?.selectedHover, backgroundColor: selectedHoverBackgroundColor, icon: sprite },
            focused: { text: text?.focused, icon: sprite },
            disabled: { text: text?.disabled, backgroundColor: disabledBackgroundColor || 'rgba(128, 128, 128, 0.5)', icon: sprite },
            ...states
        };

        this.states = {};
        for (const state in mergedStates) {
            const stateConfig = mergedStates[state];
            this.states[state] = {
                text: stateConfig.text,
                backgroundColor: stateConfig.backgroundColor,
                icon: stateConfig.icon,
                marqueeSpeed: stateConfig.marqueeSpeed
            };

            if (stateConfig.effect) {
                const effectState = stateConfig.effect.effectState || state;
                const gradient = stateConfig.effect.instance.getGradientDefinition(stateConfig.effect.type, effectState);
                this.states[state].backgroundColor = gradient;
            }
        }

        if (effect && !states.default?.effect) {
            const getGradient = (state) => effect.instance.getGradientDefinition(effect.type, state);
            if (effectStates.includes('backgroundColor')) this.states.default.backgroundColor = getGradient('default');
            if (effectStates.includes('hoverBackgroundColor')) this.states.hover.backgroundColor = getGradient('hover');
            if (effectStates.includes('pressedBackgroundColor')) this.states.pressed.backgroundColor = getGradient('pressed');
            if (effectStates.includes('selectedBackgroundColor')) this.states.selected.backgroundColor = getGradient('selected');
            if (effectStates.includes('focused')) this.states.focused.backgroundColor = getGradient('focused');
        }
        // --- End State Management Refactor ---

        this.sprite = sprite;
        this.spriteScale = spriteScale; // Store sprite scale
        this.width = width;
        this.height = height;
        this.onClick = onClick;
        this.font = font;
        this.textColor = textColor;
        this.textBaseline = textBaseline;
        this.textAlign = textAlign; // Store the text alignment
        this.textOffsetX = textOffsetX; // Store the text X offset
        this.textOffsetY = textOffsetY; // Store the text Y offset

        this.app = app;
        if (this.app) {
            this.richTextRenderer = new RichTextRenderer(this.app);
        }

        this.borderRadius = borderRadius;
        this.pulseColor = pulseColor;
        this.shadowOffset = shadowOffset;
        this.borderColor = borderColor || 'rgba(0, 0, 0, 0.2)';
        this.sideBorderColor = sideBorderColor;
        this.sideBorderWidth = sideBorderWidth;
        this.sideBorderSides = sideBorderSides;
        this.sounds = sounds;
        this.marqueeEnabled = marqueeEnabled;
        this.marqueeDirection = marqueeDirection;
        this.marqueeSpeed = marqueeSpeed;
        this.marqueeGap = marqueeGap;
        this.highlightDirection = highlightDirection;
        this.highlightEnabled = highlightEnabled;
        this.moveOnPress = moveOnPress;

        this._isActive = isActive;
        this._isDisabled = isDisabled;
        this._isCompleted = isCompleted;

        this.isHovered = false;
        this.isPressed = false;
        this.isFocused = false;
        this.isPulsing = false;
        this.pulseStartTime = 0;
        this.animationFrameId = null;

        this.marqueeAnimationId = null;
        this.marqueeOffset = 0;
        this.textWidth = 0;

        this.isGradientAnimating = false;
        this.gradientAnimationId = null;
        this._gradientAnimationStartTime = 0;

        this.element = this.render();
    }

    setText(newText) {
        if (this.states.default) {
            this.states.default.text = newText;
        }
        this.draw();
        this._updateMarqueeState();
    }

    get isActive() { return this._isActive; }
    set isActive(value) {
        if (this._isActive !== value) {
            this._isActive = value;
            this.draw();
            this._updateGradientAnimationState();
        }
    }

    get isDisabled() { return this._isDisabled; }
    set isDisabled(value) {
        if (this._isDisabled !== value) {
            this._isDisabled = value;
            this.element.disabled = value;
            this.draw();
            this._updateGradientAnimationState();
        }
    }

    get isCompleted() { return this._isCompleted; }
    set isCompleted(value) {
        if (this._isCompleted !== value) {
            this._isCompleted = value;
            this.draw();
            this._updateGradientAnimationState();
        }
    }

    _createGradient(ctx, definition) {
        if (!definition || typeof definition !== 'object') return null;

        const { type = 'linear', colors, stops, animation } = definition;
        const { width, height } = this;

        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return 'rgba(0,0,0,0)';
        }

        let { start, end, center, radius } = definition;

        if (this.isGradientAnimating && animation) {
            const now = performance.now();
            const elapsedTime = now - this._gradientAnimationStartTime;
            const progress = (elapsedTime % animation.duration) / animation.duration;

            if (animation.type === 'rotate') {
                const angle = progress * 2 * Math.PI;
                const cX = 0.5, cY = 0.5, r = 0.5;
                start = { x: cX + r * Math.cos(angle), y: cY + r * Math.sin(angle) };
                end = { x: cX - r * Math.cos(angle), y: cY - r * Math.sin(angle) };
            } else if (animation.type === 'pulse') {
                const pulseProgress = 0.5 + Math.sin(progress * 2 * Math.PI) * 0.5;
                if (radius) {
                    radius.end = (definition.radius.end || 0.5) * pulseProgress;
                }
            }
        }

        let gradient;

        if (type === 'linear') {
            const x1 = (start?.x ?? 0) * width;
            const y1 = (start?.y ?? 0) * height;
            const x2 = (end?.x ?? 1) * width;
            const y2 = (end?.y ?? 0) * height;
            if (![x1, y1, x2, y2].every(Number.isFinite)) {
                return 'rgba(0,0,0,0)';
            }
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        } else if (type === 'radial') {
            const x1 = (center?.x ?? 0.5) * width;
            const y1 = (center?.y ?? 0.5) * height;
            const r1 = (radius?.start ?? 0) * Math.max(width, height);
            const r2 = (radius?.end ?? 0.5) * Math.max(width, height);
            if (![x1, y1, r1, r2].every(Number.isFinite)) {
                return 'rgba(0,0,0,0)';
            }
            gradient = ctx.createRadialGradient(x1, y1, r1, x1, y1, r2);
        } else {
            return null;
        }

        const colorStops = stops || colors.map((_, i) => i / (colors.length - 1 || 1));
        colors.forEach((color, i) => {
            gradient.addColorStop(colorStops[i], color);
        });

        return gradient;
    }

    _getCurrentText() {
        if (this.isDisabled) return this.states.disabled?.text || this.states.default?.text || '';
        if (this.isPressed) return this.states.pressed?.text || this.states.hover?.text || this.states.default?.text || '';
        if (this.isActive) return this.states.selected?.text || this.states.default?.text || '';
        if (this.isFocused) return this.states.focused?.text || this.states.hover?.text || this.states.default?.text || '';
        if (this.isHovered) return this.states.hover?.text || this.states.default?.text || '';
        return this.states.default?.text || '';
    }

    _getCurrentMarqueeSpeed() {
        const defaultSpeed = this.states.default?.marqueeSpeed ?? this.marqueeSpeed;
        if (this.isDisabled) return this.states.disabled?.marqueeSpeed ?? defaultSpeed;
        if (this.isPressed) return this.states.pressed?.marqueeSpeed ?? this.states.hover?.marqueeSpeed ?? defaultSpeed;
        if (this.isActive) return this.states.selected?.marqueeSpeed ?? defaultSpeed;
        if (this.isFocused) return this.states.focused?.marqueeSpeed ?? this.states.hover?.marqueeSpeed ?? defaultSpeed;
        if (this.isHovered) return this.states.hover?.marqueeSpeed ?? defaultSpeed;
        return defaultSpeed;
    }

    _getCurrentIcon() {
        if (this.isDisabled) return this.states.disabled?.icon || this.states.default?.icon;
        if (this.isPressed) return this.states.pressed?.icon || this.states.hover?.icon || this.states.default?.icon;
        if (this.isActive) return this.states.selected?.icon || this.states.default?.icon;
        if (this.isFocused) return this.states.focused?.icon || this.states.hover?.icon || this.states.default?.icon;
        if (this.isHovered) return this.states.hover?.icon || this.states.default?.icon;
        return this.states.default?.icon;
    }

    _getCurrentBackground() {
        const getState = (state, fallbackState) => this.states[state]?.backgroundColor || this.states[fallbackState]?.backgroundColor;

        if (this.isDisabled) return getState('disabled', 'default');
        if (this.isPressed) return getState('pressed', 'hover');
        if (this.isActive && this.isHovered) return getState('selectedHover', 'selected');
        if (this.isActive) return getState('selected', 'default');
        if (this.isFocused) return getState('focused', 'hover');
        if (this.isHovered) return getState('hover', 'default');
        return this.states.default?.backgroundColor;
    }

    _startGradientAnimation() {
        if (this.gradientAnimationId) return;
        this.isGradientAnimating = true;
        this._gradientAnimationStartTime = performance.now();
        const animate = () => {
            if (!this.isGradientAnimating) return;
            this.draw();
            this.gradientAnimationId = requestAnimationFrame(animate);
        };
        this.gradientAnimationId = requestAnimationFrame(animate);
    }

    _stopGradientAnimation() {
        if (this.gradientAnimationId) {
            cancelAnimationFrame(this.gradientAnimationId);
        }
        this.gradientAnimationId = null;
        this.isGradientAnimating = false;
    }

    _updateGradientAnimationState() {
        const currentBg = this._getCurrentBackground();
        const shouldAnimate = typeof currentBg === 'object' && currentBg !== null && !!currentBg.animation;

        if (shouldAnimate && !this.isGradientAnimating) {
            this._startGradientAnimation();
        } else if (!shouldAnimate && this.isGradientAnimating) {
            this._stopGradientAnimation();
        }
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

    _drawSideBorders(ctx, width, height) {
        if (!this.sideBorderColor) return;

        ctx.save();
        ctx.strokeStyle = this.sideBorderColor;
        ctx.lineWidth = this.sideBorderWidth;

        // Get border radius info
        let radius = this.borderRadius;
        if (typeof radius === 'number') {
            radius = { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };
        } else if (Array.isArray(radius)) {
            radius = { topLeft: radius[0], topRight: radius[1], bottomRight: radius[2], bottomLeft: radius[3] };
        } else {
            radius = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, ...radius };
        }

        const offset = this.sideBorderWidth / 2;

        // Draw left border
        if (this.sideBorderSides === 'left' || this.sideBorderSides === 'both') {
            ctx.beginPath();
            ctx.moveTo(offset, radius.topLeft);
            ctx.lineTo(offset, height - radius.bottomLeft);
            ctx.stroke();
        }

        // Draw right border
        if (this.sideBorderSides === 'right' || this.sideBorderSides === 'both') {
            ctx.beginPath();
            ctx.moveTo(width - offset, radius.topRight);
            ctx.lineTo(width - offset, height - radius.bottomRight);
            ctx.stroke();
        }

        ctx.restore();
    }

    draw(pulseProgress = 0) {
        const ctx = this.canvas.getContext('2d');
        const { width, height } = this.canvas;

        ctx.clearRect(0, 0, width, height);
        let bgColor = this._getCurrentBackground();
        let shadowOffsetToApply = { ...this.shadowOffset };
        let domOffsetX = 0, domOffsetY = 0;

        ctx.filter = 'none';
        if (this.isDisabled) {
            shadowOffsetToApply = { x: 0, y: 0, blur: 0, color: 'transparent' };
        } else {
            if (this.isPressed) {
                if (this.moveOnPress) {
                    domOffsetY += this.element.classList.contains('sub-tab-button') ? 0 : 2;
                    domOffsetX += this.element.classList.contains('sub-tab-button') ? 2 : 0;
                }
                shadowOffsetToApply = { x: 0, y: 0, blur: 0, color: 'transparent' };
            } else if (this.isActive) {
                domOffsetY += this.element.classList.contains('nav-tab') ? 4 : 0;
                domOffsetX += this.element.classList.contains('sub-tab-button') ? 4 : 0;
            }
        }

        this.element.style.left = `${domOffsetX}px`;
        this.element.style.top = `${domOffsetY}px`;

        ctx.save();
        ctx.shadowColor = shadowOffsetToApply.color;
        ctx.shadowBlur = shadowOffsetToApply.blur;
        ctx.shadowOffsetX = shadowOffsetToApply.x;
        ctx.shadowOffsetY = shadowOffsetToApply.y;

        if (typeof bgColor === 'string') {
            if (!(bgColor.startsWith('rgba') && bgColor.endsWith(',0)'))) {
                ctx.fillStyle = bgColor;
                this._drawRoundedRect(ctx, 0, 0, width, height, this.borderRadius);
                ctx.fill();
            }
        } else if (typeof bgColor === 'object' && bgColor !== null) {
            const gradient = this._createGradient(ctx, bgColor);
            if (gradient) {
                ctx.fillStyle = gradient;
                this._drawRoundedRect(ctx, 0, 0, width, height, this.borderRadius);
                ctx.fill();
            }
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 1;
        const outlineInset = 0.5;
        this._drawRoundedRect(ctx, outlineInset, outlineInset, width - 2 * outlineInset, height - 2 * outlineInset, this.borderRadius);
        ctx.stroke();
        ctx.restore();

        // Draw side borders if specified
        if (this.sideBorderColor) {
            this._drawSideBorders(ctx, width, height);
        }

        if (this.highlightEnabled) {
            ctx.save();
            this._drawRoundedRect(ctx, 0, 0, width, height, this.borderRadius);
            ctx.clip();

            // More detailed highlight with multiple layers
            let radius = this.borderRadius;
            if (typeof radius === 'number') { radius = { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius }; }
            else if (Array.isArray(radius)) { radius = { topLeft: radius[0], topRight: radius[1], bottomRight: radius[2], bottomLeft: radius[3] }; }
            else { radius = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, ...radius }; }

            // Draw highlight edge stroke
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            switch (this.highlightDirection) {
                case 'bottom':
                    ctx.moveTo(0, height - radius.bottomLeft);
                    ctx.quadraticCurveTo(0, height, radius.bottomLeft, height);
                    ctx.lineTo(width - radius.bottomRight, height);
                    ctx.quadraticCurveTo(width, height, width, height - radius.bottomRight);
                    break;
                case 'left':
                    ctx.moveTo(radius.topLeft, 0);
                    ctx.quadraticCurveTo(0, 0, 0, radius.topLeft);
                    ctx.lineTo(0, height - radius.bottomLeft);
                    ctx.quadraticCurveTo(0, height, radius.bottomLeft, height);
                    break;
                case 'right':
                    ctx.moveTo(width - radius.topRight, 0);
                    ctx.quadraticCurveTo(width, 0, width, radius.topRight);
                    ctx.lineTo(width, height - radius.bottomRight);
                    ctx.quadraticCurveTo(width, height, width - radius.bottomRight, height);
                    break;
                case 'top':
                default:
                    ctx.moveTo(0, radius.topLeft);
                    ctx.quadraticCurveTo(0, 0, radius.topLeft, 0);
                    ctx.lineTo(width - radius.topRight, 0);
                    ctx.quadraticCurveTo(width, 0, width, radius.topRight);
                    break;
            }
            ctx.stroke();

            // Add subtle inner glow effect
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            switch (this.highlightDirection) {
                case 'bottom':
                    ctx.moveTo(1, height - radius.bottomLeft - 1);
                    ctx.quadraticCurveTo(1, height - 1, radius.bottomLeft + 1, height - 1);
                    ctx.lineTo(width - radius.bottomRight - 1, height - 1);
                    ctx.quadraticCurveTo(width - 1, height - 1, width - 1, height - radius.bottomRight - 1);
                    break;
                case 'left':
                    ctx.moveTo(radius.topLeft + 1, 1);
                    ctx.quadraticCurveTo(1, 1, 1, radius.topLeft + 1);
                    ctx.lineTo(1, height - radius.bottomLeft - 1);
                    ctx.quadraticCurveTo(1, height - 1, radius.bottomLeft + 1, height - 1);
                    break;
                case 'right':
                    ctx.moveTo(width - radius.topRight - 1, 1);
                    ctx.quadraticCurveTo(width - 1, 1, width - 1, radius.topRight + 1);
                    ctx.lineTo(width - 1, height - radius.bottomRight - 1);
                    ctx.quadraticCurveTo(width - 1, height - 1, width - radius.bottomRight - 1, height - 1);
                    break;
                case 'top':
                default:
                    ctx.moveTo(1, radius.topLeft + 1);
                    ctx.quadraticCurveTo(1, 1, radius.topLeft + 1, 1);
                    ctx.lineTo(width - radius.topRight - 1, 1);
                    ctx.quadraticCurveTo(width - 1, 1, width - 1, radius.topRight + 1);
                    break;
            }
            ctx.stroke();
            ctx.restore();

            // Add gradient overlay for depth
            ctx.save();
            this._drawRoundedRect(ctx, 0, 0, width, height, this.borderRadius);
            ctx.clip();
            const highlightGradient = ctx.createLinearGradient(0, 0, 0, height);
            highlightGradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
            highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.05)`);
            highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            ctx.fillStyle = highlightGradient;
            ctx.fillRect(0, 0, width, height);

            const shadowGradient = ctx.createLinearGradient(0, 0, 0, height);
            shadowGradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
            shadowGradient.addColorStop(0.5, `rgba(0, 0, 0, 0.05)`);
            shadowGradient.addColorStop(1, `rgba(0, 0, 0, 0.15)`);
            ctx.fillStyle = shadowGradient;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

        if (this.isPulsing && this.pulseColor && !this.isDisabled) {
            const radius = pulseProgress * (Math.min(width, height) / 2 * 1.5);
            const opacity = 0.5 * (1 - pulseProgress);
            const r = parseInt(this.pulseColor.slice(1, 3), 16);
            const g = parseInt(this.pulseColor.slice(3, 5), 16);
            const b = parseInt(this.pulseColor.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const currentIcon = this._getCurrentIcon();
        if (currentIcon) {
            const baseSpriteSize = 20;
            const spriteSize = baseSpriteSize * this.spriteScale;
            if (currentIcon.complete && currentIcon.naturalWidth !== 0) {
                ctx.drawImage(currentIcon, (width - spriteSize) / 2, (height - spriteSize) / 2, spriteSize, spriteSize);
            }
        }

        const currentText = this._getCurrentText();
        if (currentText) {
            this._drawTextOnCanvas(ctx, currentText, width / 2, height / 2, this.font, this.textColor, this.textAlign, this.textBaseline);
        }

        // Draw side borders if enabled
        if (this.sideBorderColor && this.sideBorderWidth > 0) {
            ctx.save();
            ctx.strokeStyle = this.sideBorderColor;
            ctx.lineWidth = this.sideBorderWidth;
            ctx.beginPath();
            if (this.sideBorderSides === 'left' || this.sideBorderSides === 'both') {
                ctx.moveTo(0, this.borderRadius);
                ctx.lineTo(0, height - this.borderRadius);
            }
            if (this.sideBorderSides === 'right' || this.sideBorderSides === 'both') {
                ctx.moveTo(width, this.borderRadius);
                ctx.lineTo(width, height - this.borderRadius);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    startMarquee() {
        if (this.marqueeAnimationId) cancelAnimationFrame(this.marqueeAnimationId);
        this.marqueeOffset = 0;

        const animateMarquee = () => {
            const currentSpeed = this._getCurrentMarqueeSpeed();

            if (this.marqueeDirection === 'right') {
                this.marqueeOffset += currentSpeed;
                if (this.marqueeOffset >= this.textWidth + this.marqueeGap) {
                    this.marqueeOffset -= this.textWidth + this.marqueeGap;
                }
            } else { // 'left'
                this.marqueeOffset -= currentSpeed;
                if (this.marqueeOffset <= -(this.textWidth + this.marqueeGap)) {
                    this.marqueeOffset += this.textWidth + this.marqueeGap;
                }
            }

            this.draw();
            this.marqueeAnimationId = requestAnimationFrame(animateMarquee);
        };
        this.marqueeAnimationId = requestAnimationFrame(animateMarquee);
    }

    stopMarquee() {
        if (this.marqueeAnimationId) {
            cancelAnimationFrame(this.marqueeAnimationId);
            this.marqueeAnimationId = null;
        }
        this.marqueeOffset = 0;
        this.draw();
    }

    startPulse() {
        this.isPulsing = true;
        this.pulseStartTime = performance.now();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        const animate = (currentTime) => {
            const elapsed = currentTime - this.pulseStartTime;
            const duration = 500;
            const progress = elapsed / duration;
            if (progress < 1) {
                this.draw(progress);
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                this.isPulsing = false;
                this.animationFrameId = null;
                this.draw();
            }
        };
        this.animationFrameId = requestAnimationFrame(animate);
    }

    render() {
        const button = this.createElement('button', 'canvas-button');
        this.element = button;
        this.canvas = this.createCanvas(this.width, this.height);
        button.appendChild(this.canvas);
        button.disabled = this.isDisabled;

        // Add all: unset to reset all default button styles
        button.style.all = 'unset';

        // Re-apply necessary styles after reset
        button.style.position = 'relative';
        button.style.display = 'inline-block';
        button.style.cursor = this.isDisabled ? 'default' : 'pointer';
        button.style.userSelect = 'none';
        button.style.boxSizing = 'border-box';
        button.style.width = `${this.width}px`;
        button.style.height = `${this.height}px`;
        button.style.pointerEvents = 'auto'; // Ensure button is clickable after 'all: unset'

        new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'disabled')) {
                    this.draw();
                }
            });
        }).observe(button, { attributes: true });

        button.addEventListener('mouseenter', () => {
            if (this.isDisabled) return;
            this.isHovered = true;
            if (this.sounds?.hover) this.sounds.hover.play();
            this.draw();
            this._updateGradientAnimationState();
            this._updateMarqueeState();
        });
        button.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.isPressed = false;
            this.draw();
            this._updateGradientAnimationState();
            this._updateMarqueeState();
        });
        button.addEventListener('mousedown', () => {
            if (this.isDisabled) return;
            this.isPressed = true;
            this.draw();
            this._updateGradientAnimationState();
            this._updateMarqueeState();
        });
        
        // Add global mouseup listener to reset pressed state even when mouse leaves button
        document.addEventListener('mouseup', () => {
            if (this.isPressed) {
                this.isPressed = false;
                this.draw();
                this._updateGradientAnimationState();
                this._updateMarqueeState();
            }
        });
        
        button.addEventListener('mouseup', () => {
            if (this.isDisabled) return;
            this.isPressed = false;
            this.draw();
            this._updateGradientAnimationState();
            this._updateMarqueeState();
        });

        button.addEventListener('focus', () => {
            if (this.isDisabled) return;
            this.isFocused = true;
            this.draw();
            this._updateMarqueeState();
        });

        button.addEventListener('blur', () => {
            this.isFocused = false;
            this.draw();
            this._updateMarqueeState();
        });

        if (this.onClick) {
            button.addEventListener('click', (e) => {
                if (this.isDisabled) return;
                if (this.pulseColor) this.startPulse();
                this.onClick(e);
            });
        }

        const initialDraw = () => {
            this.draw();
            this._updateMarqueeState();
            this._updateGradientAnimationState();
        };

        const currentIcon = this._getCurrentIcon();
        if (currentIcon && !currentIcon.complete) {
            currentIcon.onerror = () => {
                console.error("Sprite image failed to load:", currentIcon.src);
                initialDraw();
            };
            currentIcon.onload = initialDraw;
        } else {
            initialDraw();
        }

        return button;
    }

    _updateMarqueeState() {
        const currentText = this._getCurrentText();
        if (!currentText || !this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        ctx.font = this.font;

        if (this.richTextRenderer) {
            const parsed = this.richTextRenderer.parseInlineFormatting(currentText);
            const measurement = this.richTextRenderer.renderInlineFormattedText(ctx, parsed.tokens, 0, 0, this.font, this.textColor, this.width, 1.2, true);
            this.textWidth = measurement.width;
        } else {
            this.textWidth = ctx.measureText(currentText).width;
        }

        const isOverflowing = this.textWidth > this.width - 10;
        const wasMarqueeRunning = !!this.marqueeAnimationId;
        const shouldMarqueeRun = isOverflowing && this.marqueeEnabled;

        if (shouldMarqueeRun) {
            if (!wasMarqueeRunning) {
                this.startMarquee();
            }
        } else if (wasMarqueeRunning) {
            this.stopMarquee();
        }
    }

    setSettings(options = {}) {
        Object.keys(options).forEach(key => {
            if (options[key] !== undefined) {
                this[key] = options[key];
            }
        });

        if (options.width !== undefined) {
            this.canvas.width = this.width;
            this.element.style.width = `${this.width}px`;
        }
        if (options.height !== undefined) {
            this.canvas.height = this.height;
            this.element.style.height = `${this.height}px`;
        }
        this.element.disabled = this.isDisabled;

        this.draw();
        this._updateMarqueeState();
        this._updateGradientAnimationState();
    }

    update(options = {}) {
        this.setSettings(options);
    }

    _drawTextOnCanvas(ctx, text, x, y, font, color, textAlign, textBaseline) {
        ctx.save();
        ctx.font = font;
        ctx.textBaseline = textBaseline;

        // Apply text offsets
        x += this.textOffsetX || 0;
        y += this.textOffsetY || 0;

        // Clip the text within the button's rounded rectangle bounds
        this._drawRoundedRect(ctx, 0, 0, this.width, this.height, this.borderRadius);
        ctx.clip();

        const isOverflowing = this.textWidth > this.width - 10;
        // Marquee effect is only used when enabled and the text is overflowing.
        const useMarquee = isOverflowing && this.marqueeEnabled;

        if (this.richTextRenderer) {
            const parsed = this.richTextRenderer.parseInlineFormatting(text);
            if (useMarquee) {
                const fadeWidth = 4;
                const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
                const fadeStop = Math.min(0.5, fadeWidth / this.width);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(fadeStop, this.textColor);
                gradient.addColorStop(1 - fadeStop, this.textColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;

                const secondTextX = this.marqueeDirection === 'right'
                    ? this.marqueeOffset - this.textWidth - this.marqueeGap
                    : this.marqueeOffset + this.textWidth + this.marqueeGap;

                this.richTextRenderer.renderInlineFormattedText(ctx, parsed.tokens, this.marqueeOffset, y, this.font, this.textColor, this.width, 1.2, false, 'middle');
                this.richTextRenderer.renderInlineFormattedText(ctx, parsed.tokens, secondTextX, y, this.font, this.textColor, this.width, 1.2, false, 'middle');
            } else {
                const measurement = this.richTextRenderer.renderInlineFormattedText(ctx, parsed.tokens, 0, 0, font, color, this.width, 1.2, true);
                let textX = x;
                if (textAlign === 'center') {
                    textX = x - (measurement.width / 2);
                } else if (textAlign === 'right') {
                    textX = this.width - measurement.width - 10; // 10px padding
                } else {
                    textX = 10; // 10px padding
                }
                this.richTextRenderer.renderInlineFormattedText(ctx, parsed.tokens, textX, y, font, color, this.width, 1.2, false, 'middle');
            }
        } else {
            // Plain text rendering
            if (useMarquee) {
                const fadeWidth = 4;
                const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
                const fadeStop = Math.min(0.5, fadeWidth / this.width);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(fadeStop, color);
                gradient.addColorStop(1 - fadeStop, color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.textAlign = 'left';

                const secondTextX = this.marqueeDirection === 'right'
                    ? this.marqueeOffset - this.textWidth - this.marqueeGap
                    : this.marqueeOffset + this.textWidth + this.marqueeGap;

                ctx.fillText(text, this.marqueeOffset, y);
                ctx.fillText(text, secondTextX, y);
            } else {
                ctx.textAlign = textAlign;
                ctx.fillStyle = color;
                ctx.fillText(text, x, y);
            }
        }
        ctx.restore();
    }
}
