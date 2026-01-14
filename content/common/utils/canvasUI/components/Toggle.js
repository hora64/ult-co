import { UIComponent, TextCanvasMeasurer } from "/content/common/utils/index.js";

export class Toggle extends UIComponent {
    constructor({ app, label, isActive, onToggle, isDisabled = false, sounds, theme, options = {} }) {
        super();
        this.app = app;
        this.label = label;
        this.isActive = isActive;
        this.onToggle = onToggle;
        this.isDisabled = isDisabled;
        this.sounds = sounds;
        this.theme = theme || {};
        this.measurer = new TextCanvasMeasurer();
        this.isHovered = false;

        this.options = {
            textColor: options.textColor,
            disabledColor: options.disabledColor || '#999',
            trackColor: options.trackColor,
            thumbColor: options.thumbColor,
            accentColor: options.accentColor,
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
        const toggleThemeOptions = theme.ui?.toggle || {};
        const { effect, states: optionStates, trackColor, thumbColor, accentColor } = this.options;

        const defaultStates = {
            default: { // Corresponds to 'off'
                trackColor: trackColor || 'rgba(0,0,0,0.2)',
                thumbColor: thumbColor || '#EAEAEA'
            },
            active: { // Corresponds to 'on'
                trackColor: accentColor || '#888',
                thumbColor: '#FFFFFF'
            },
            hover: {
                trackColor: this.measurer.adjustColor(trackColor || 'rgba(0,0,0,0.2)', 10),
                thumbColor: this.measurer.adjustColor(thumbColor || '#EAEAEA', 10)
            },
            'hover:active': {
                trackColor: this.measurer.adjustColor(accentColor || '#888', 10),
                thumbColor: '#FFFFFF'
            },
            disabled: {
                trackColor: '#555',
                thumbColor: '#999'
            }
        };

        const mergedStates = {
            default: { ...defaultStates.default, ...(optionStates.default || {}), ...(toggleThemeOptions.states?.default || {}) },
            active: { ...defaultStates.active, ...(optionStates.active || {}), ...(toggleThemeOptions.states?.active || {}) },
            hover: { ...defaultStates.hover, ...(optionStates.hover || {}), ...(toggleThemeOptions.states?.hover || {}) },
            'hover:active': { ...defaultStates['hover:active'], ...(optionStates['hover:active'] || {}), ...(toggleThemeOptions.states?.['hover:active'] || {}) },
            disabled: { ...defaultStates.disabled, ...(optionStates.disabled || {}), ...(toggleThemeOptions.states?.disabled || {}) }
        };

        this.states = {};
        const finalEffect = effect || toggleThemeOptions.effect;

        for (const state in mergedStates) {
            const stateConfig = mergedStates[state];
            this.states[state] = {
                trackColor: stateConfig.trackColor,
                thumbColor: stateConfig.thumbColor
            };

            if (finalEffect?.instance) {
                const effectState = stateConfig.effectState || state;
                const thumbType = finalEffect.thumbType || 'default';
                const trackType = finalEffect.trackType || (state.includes('active') ? 'accent' : 'default');

                this.states[state].thumbColor = finalEffect.instance.getGradientDefinition(thumbType, effectState);
                this.states[state].trackColor = finalEffect.instance.getGradientDefinition(trackType, effectState);
            }
        }
    }

    render() {
        let labelCanvas;
        if (this.label) {
            labelCanvas = this.createCanvas(170, 36);
            const labelCtx = labelCanvas.getContext('2d');
            if (this.options.textEffect) {
                applyCanvasTextEffect(labelCtx, this.options.textEffect, this.label, 0, 18, 170, 36, {
                    ...this.options.textEffectOptions,
                    font: '14px "Rodin", sans-serif',
                    color: this.isDisabled ? this.options.disabledColor : (this.options.textColor || '#EAEAEA'),
                    textAlign: 'left',
                    textBaseline: 'middle'
                });
            } else {
                this._drawTextOnCanvas(labelCtx, this.label, 0, 18, '14px "Rodin", sans-serif',
                    this.isDisabled ? this.options.disabledColor : (this.options.textColor || '#EAEAEA'), 'left', 'middle');
            }
        }


        const toggleButton = this._createCanvasButton({
            width: 60,
            height: 24,
            onClick: () => {
                if (!this.isDisabled) {
                    if (this.sounds?.click) this.sounds.click.play();
                    this.isActive = !this.isActive;
                    this.update({ isActive: this.isActive });
                    if (this.onToggle) this.onToggle(this.isActive);
                }
            },
            isDisabled: this.isDisabled
        });

        const btnCanvas = toggleButton.querySelector('canvas');
        this.ctx = btnCanvas.getContext('2d');
        const drawToggle = (ctx, options) => {
            const btnCtx = ctx;
            const width = 60;
            const height = 24;
            btnCtx.clearRect(0, 0, width, height);

            const currentState = this._getCurrentState();
            const trackColor = currentState.trackColor;
            const knobColor = currentState.thumbColor;

            const knobRadius = 8;
            const trackHeight = 20;
            const trackWidth = width - 4;
            const trackX = 2;
            const trackY = (height - trackHeight) / 2;

            // Track
            btnCtx.save();
            this._applyBackground(btnCtx, trackColor, trackX, trackY, trackWidth, trackHeight);
            btnCtx.shadowColor = 'rgba(0,0,0,0.3)';
            btnCtx.shadowBlur = 3;
            btnCtx.shadowOffsetY = 1;
            btnCtx.beginPath();
            btnCtx.roundRect(trackX, trackY, trackWidth, trackHeight, 10);
            btnCtx.fill();
            btnCtx.restore();

            // Knob
            const knobX = this.isActive ? (width - knobRadius - 4) : (knobRadius + 4);
            const knobY = height / 2;
            btnCtx.save();

            const knobGradient = btnCtx.createRadialGradient(knobX, knobY, 0, knobX, knobY, knobRadius);
            knobGradient.addColorStop(0, this.options.thumbColor || '#FFFFFF');
            knobGradient.addColorStop(0.8, this.measurer.adjustColor(this.options.thumbColor || '#EAEAEA', -10));
            knobGradient.addColorStop(1, this.measurer.adjustColor(this.options.thumbColor || '#C0C0C0', -20));

            this._applyBackground(btnCtx, knobColor, knobX - knobRadius, knobY - knobRadius, knobRadius * 2, knobRadius * 2);
            btnCtx.shadowColor = 'rgba(0,0,0,0.5)';
            btnCtx.shadowBlur = 4;
            btnCtx.shadowOffsetY = 2;
            btnCtx.beginPath();
            btnCtx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
            btnCtx.fill();
            btnCtx.restore();

            // Knob Outline
            btnCtx.strokeStyle = 'rgba(0,0,0,0.2)';
            btnCtx.lineWidth = 0.5;
            btnCtx.beginPath();
            btnCtx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
            btnCtx.stroke();
        };

        toggleButton.addEventListener('mouseenter', () => {
            this.isHovered = true;
            drawToggle(this.ctx, {
                ...this.options,
                value: this.value
            });
        });
        toggleButton.addEventListener('mouseleave', () => {
            this.isHovered = false;
            drawToggle(this.ctx, {
                ...this.options,
                value: this.value
            });
        });
        drawToggle(this.ctx, {
            ...this.options,
            value: this.value
        });

        return toggleButton;
    }

    destroy() {
        super.destroy();
    }

    _getCurrentState() {
        if (this.isDisabled) return this.states.disabled;
        if (this.isHovered) {
            return this.isActive ? (this.states['hover:active'] || this.states.active) : (this.states.hover || this.states.default);
        }
        return this.isActive ? this.states.active : this.states.default;
    }

    update({ isActive, isDisabled }) {
        if (isActive !== undefined) this.isActive = isActive;
        if (isDisabled !== undefined) this.isDisabled = isDisabled;

        this._initializeStates();
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
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

    _applyBackground(ctx, bg, x, y, width, height) {
        if (typeof bg === 'string') {
            ctx.fillStyle = bg;
        } else if (typeof bg === 'object' && bg !== null) {
            const gradient = this._createCanvasGradient(ctx, bg, x, y, width, height);
            if (gradient) ctx.fillStyle = gradient;
        }
    }

    _createCanvasButton({ width, height, onClick, isDisabled = false }) {
        const button = this.createElement('button', 'canvas-button');
        button.disabled = isDisabled;
        button.style.width = `${width}px`;
        button.style.height = `${height}px`;

        const canvas = this.createCanvas(width, height);
        button.appendChild(canvas);

        button.addEventListener('click', (e) => {
            if (!isDisabled && onClick) {
                onClick(e);
            }
        });

        return button;
    }
}