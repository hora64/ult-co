import { UIComponent, TextCanvasMeasurer } from "/content/common/utils/index.js";

export class Slider extends UIComponent {
    constructor({ app, value, onUpdate, onRelease, isDisabled = false, cssVars, theme, options = {} }) {
        super();
        this.app = app;
        this.value = value ?? 0;
        this.max = options.max ?? 1;
        this.onUpdate = onUpdate;
        this.onRelease = onRelease;
        this.isDisabled = isDisabled;
        this.cssVars = cssVars;
        this.theme = theme || {};
        this.measurer = new TextCanvasMeasurer();
        this.isDragging = false;
        this.isHovered = false;

        this.options = {
            textColor: options.textColor,
            disabledColor: options.disabledColor || '#999',
            trackColor: options.trackColor,
            filledTrackColor: options.filledTrackColor,
            thumbColor: options.thumbColor,
            accentColor: options.accentColor,
            accentColorDark: options.accentColorDark,
            textEffect: options.textEffect,
            textEffectOptions: options.textEffectOptions,
            effect: options.effect,
            states: options.states || {}
        };

        this._initializeStates();
        this.element = this.render();
    }

    _initializeStates() {
        const theme = this.theme || {};
        const sliderThemeOptions = theme.ui?.slider || {};
        const { effect, states: optionStates, trackColor, filledTrackColor, thumbColor, accentColor } = this.options;

        const defaultStates = {
            default: {
                trackColor: trackColor || 'rgba(0,0,0,0.2)',
                filledTrackColor: filledTrackColor || accentColor || '#888',
                thumbColor: thumbColor || '#EAEAEA'
            },
            hover: {
                trackColor: 'rgba(0,0,0,0.3)',
                filledTrackColor: this.measurer.adjustColor(filledTrackColor || accentColor || '#888', 10),
                thumbColor: this.measurer.adjustColor(thumbColor || '#EAEAEA', 10)
            },
            disabled: {
                trackColor: '#555',
                filledTrackColor: '#777',
                thumbColor: '#999'
            }
        };

        const mergedStates = {
            default: { ...defaultStates.default, ...(optionStates.default || {}), ...(sliderThemeOptions.states?.default || {}) },
            hover: { ...defaultStates.hover, ...(optionStates.hover || {}), ...(sliderThemeOptions.states?.hover || {}) },
            disabled: { ...defaultStates.disabled, ...(optionStates.disabled || {}), ...(sliderThemeOptions.states?.disabled || {}) }
        };

        this.states = {};
        const finalEffect = effect || sliderThemeOptions.effect;

        for (const state in mergedStates) {
            const stateConfig = mergedStates[state];
            this.states[state] = {
                trackColor: stateConfig.trackColor,
                filledTrackColor: stateConfig.filledTrackColor,
                thumbColor: stateConfig.thumbColor
            };

            if (finalEffect?.instance) {
                const effectState = stateConfig.effectState || state;
                const thumbType = finalEffect.thumbType || 'default';
                const trackType = finalEffect.trackType || 'default';
                const filledTrackType = finalEffect.filledTrackType || 'accent';

                this.states[state].thumbColor = finalEffect.instance.getGradientDefinition(thumbType, effectState);
                this.states[state].trackColor = finalEffect.instance.getGradientDefinition(trackType, effectState);
                this.states[state].filledTrackColor = finalEffect.instance.getGradientDefinition(filledTrackType, effectState);
            }
        }
    }

    render() {
        const sliderWrapper = this.createElement('div', 'slider-item slider-wrapper');
        const sliderCanvas = this.createCanvas(100, 36, 'slider-canvas');
        sliderWrapper.appendChild(sliderCanvas);

        const drawSlider = () => {
            const sCtx = sliderCanvas.getContext('2d');
            const width = sliderCanvas.width;
            const height = sliderCanvas.height;
            sCtx.clearRect(0, 0, width, height);

            const currentState = this.isDisabled ? 'disabled' : (this.isHovered ? 'hover' : 'default');
            const trackColor = this.states[currentState].trackColor;
            const filledTrackColor = this.states[currentState].filledTrackColor;
            const thumbColor = this.states[currentState].thumbColor;

            const thumbRadius = 8;
            const trackHeight = 4;
            const trackY = (height - trackHeight) / 2;
            const trackWidth = width - 2 * thumbRadius;
            const trackX = thumbRadius;

            // Draw track
            this._applyBackground(sCtx, trackColor, trackX, trackY, trackWidth, trackHeight);
            sCtx.fillRect(trackX, trackY, trackWidth, trackHeight);

            // Draw filled part of the track
            const filledWidth = (this.value / this.max) * trackWidth;
            if (filledWidth > 0) {
                this._applyBackground(sCtx, filledTrackColor, trackX, trackY, filledWidth, trackHeight);
                sCtx.fillRect(trackX, trackY, filledWidth, trackHeight);
            }

            // Draw thumb
            const thumbX = trackX + (this.value / this.max) * trackWidth;
            const thumbY = height / 2;

            sCtx.save();
            if (typeof thumbColor === 'string') {
                const knobGradient = sCtx.createRadialGradient(thumbX, thumbY, 0, thumbX, thumbY, thumbRadius);
                knobGradient.addColorStop(0, thumbColor);
                if (!this.isDisabled) {
                    knobGradient.addColorStop(0.8, this.measurer.adjustColor(thumbColor, -10));
                    knobGradient.addColorStop(1, this.measurer.adjustColor(thumbColor, -20));
                }
                sCtx.fillStyle = knobGradient;
            } else {
                this._applyBackground(sCtx, thumbColor, thumbX - thumbRadius, thumbY - thumbRadius, thumbRadius * 2, thumbRadius * 2);
            }
            
            sCtx.shadowColor = 'rgba(0,0,0,0.5)';
            sCtx.shadowBlur = 4;
            sCtx.shadowOffsetY = 2;
            sCtx.beginPath();
            sCtx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
            sCtx.fill();
            sCtx.restore();

            // Knob Outline
            sCtx.strokeStyle = 'rgba(0,0,0,0.2)';
            sCtx.lineWidth = 0.5;
            sCtx.beginPath();
            sCtx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
            sCtx.stroke();
        };

        const handleInteraction = (e) => {
            if (this.isDisabled) return;
            const rect = sliderCanvas.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            let x = clientX - rect.left;

            const knobRadius = 8;
            const trackWidth = sliderCanvas.width - 2 * knobRadius;
            const trackX = knobRadius;

            let newValue = (x - trackX) / trackWidth;
            let currentValue = Math.max(0, Math.min(1, newValue));
            this.value = currentValue * this.max;
            drawSlider();
            if (this.onUpdate) this.onUpdate(this.value);
        };

        const addDragListeners = (startEvent) => {
            if (this.isDisabled) return;
            this.isDragging = true;
            startEvent.preventDefault();
            handleInteraction(startEvent);

            const moveHandler = (moveEvent) => {
                moveEvent.preventDefault();
                handleInteraction(moveEvent);
            };

            const upHandler = () => {
                this.isDragging = false;
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
                document.removeEventListener('touchmove', moveHandler);
                document.removeEventListener('touchend', upHandler);
                if (this.onRelease) this.onRelease();
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
            document.addEventListener('touchmove', moveHandler);
            document.addEventListener('touchend', upHandler);
        };

        sliderWrapper.addEventListener('mousedown', addDragListeners);
        sliderWrapper.addEventListener('touchstart', addDragListeners, { passive: false });

        sliderWrapper.addEventListener('mouseenter', () => {
            this.isHovered = true;
            drawSlider();
        });

        sliderWrapper.addEventListener('mouseleave', () => {
            this.isHovered = false;
            drawSlider();
        });

        drawSlider();

        return sliderWrapper;
    }

    _applyBackground(ctx, bg, x, y, width, height) {
        if (typeof bg === 'string') {
            if (bg.startsWith('linear-gradient')) {
                const gradient = this._parseCssGradient(ctx, bg, x, y, width, height);
                if (gradient) ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = bg;
            }
        } else if (typeof bg === 'object' && bg !== null) {
            const gradient = this._createCanvasGradient(ctx, bg, x, y, width, height);
            if (gradient) ctx.fillStyle = gradient;
        }
    }

    _createCanvasGradient(ctx, definition, x, y, width, height) {
        if (!definition || typeof definition !== 'object') return null;
        const { type = 'linear', colors, stops, start, end, center, radius } = definition;

        let gradient;
        if (type === 'linear') {
            const x1 = x + (start?.x ?? 0) * width;
            const y1 = y + (start?.y ?? 0) * height;
            const x2 = x + (end?.x ?? 1) * width;
            const y2 = y + (end?.y ?? 0) * height;
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        } else if (type === 'radial') {
            const x1 = x + (center?.x ?? 0.5) * width;
            const y1 = y + (center?.y ?? 0.5) * height;
            const r1 = (radius?.start ?? 0) * Math.max(width, height);
            const r2 = (radius?.end ?? 0.5) * Math.max(width, height);
            gradient = ctx.createRadialGradient(x1, y1, r1, x1, y1, r2);
        } else {
            return null;
        }

        const colorStops = stops || (colors ? colors.map((_, i) => i / (colors.length - 1 || 1)) : []);
        if (colors) {
            colors.forEach((color, i) => {
                gradient.addColorStop(colorStops[i], color);
            });
        }

        return gradient;
    }

    _parseCssGradient(ctx, css, x, y, width, height) {
        const parts = css.match(/linear-gradient\((.+)\)/);
        if (!parts) return null;

        const inner = parts[1];
        const colorStops = inner.split(',').map(s => s.trim());
        const anglePart = colorStops.shift();

        // Basic angle parsing (90deg is default for this component)
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        colorStops.forEach((color, i) => {
            gradient.addColorStop(i / (colorStops.length - 1), color);
        });
        return gradient;
    }

    update({ value, isDisabled }) {
        if (value !== undefined) this.value = value;
        if (isDisabled !== undefined) this.isDisabled = isDisabled;

        this._initializeStates();
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
    }
}