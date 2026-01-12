import { UIComponent } from "/content/common/utils/index.js";

export class Scrollbar extends UIComponent {
    constructor(scrollableContainer, appInstance, {
        orientation = 'vertical',
        colors: {
            trackColor = 'rgba(0,0,0,0.15)',
            thumbColor = '#DDDDDD',
            thumbHoverColor = '#606060',
            highlightColor = 'rgba(255,255,255,0.4)',
            outlineOuterColor = 'rgba(0, 0, 0, 0.1)',
            outlineInnerColor = 'rgba(128, 128, 128, 0.1)'
        } = {},
        showGripLines = true,
        showHighlight = true,
        useGradient = true,
        showOutline = true,
        thumbGradient = [
            { stop: 0, color: '#DDDDDD' },
            { stop: 0.9, color: '#DDDDDD' },
            { stop: 1, color: '#CCCCCC' }
        ],
        animatedGradient = false,
        minThumbSize = 20,
        effect = null,
        states = {},
        className = 'custom-scrollbar'
    } = {}) {
        super();
        this.container = scrollableContainer;
        this.app = appInstance;
        this.orientation = orientation;
        this.colors = {
            trackColor,
            thumbColor,
            thumbHoverColor,
            highlightColor,
            outlineOuterColor,
            outlineInnerColor
        };

        this.showGripLines = showGripLines;
        this.showHighlight = showHighlight;
        this.useGradient = useGradient;
        this.showOutline = showOutline;
        this.thumbGradient = thumbGradient;
        this.minThumbSize = minThumbSize;
        this.animatedGradient = animatedGradient;
        this.effect = effect;
        this.initialStates = states;

        this.animationFrameId = null;
        this.animationOffset = 0;
        this.gradientSpeed = 1;
        this.lastDimensions = {};
        this.isHoveringThumb = false; // Track if hovering over thumb specifically

        if (typeof this.animatedGradient === 'object' && this.animatedGradient.speed) {
            this.gradientSpeed = this.animatedGradient.speed;
        }

        this.element = document.createElement("canvas");
        this.element.className = className;
        this.ctx = this.element.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.isDragging = false;
        this.isHovering = false;
        this.startPos = 0;
        this.startScroll = 0;
        this.lastScroll = this.orientation === 'vertical' ? this.container.scrollTop : this.container.scrollLeft;
        this.scrollSoundTimeout = null;

        this.isPageScroller = this.container === document.body;

        this._initializeStates();
        this._bindMethods();
        this._addEventListeners();

        // Defer the initial update to allow the DOM to settle.
        setTimeout(this.update, 0);
    }

    _initializeStates() {
        const theme = this.app.theme || {};
        const scrollbarThemeOptions = theme.ui?.scrollbar || {};

        const { effect, initialStates, colors, thumbGradient, useGradient } = this;

        const defaultThumbBg = useGradient
            ? this._convertThumbGradientToDefinition(thumbGradient)
            : colors.thumbColor;

        const mergedStates = {
            default: { thumbBackground: defaultThumbBg, trackBackground: colors.trackColor },
            hover: { thumbBackground: colors.thumbHoverColor, trackBackground: colors.trackColor },
            dragging: { thumbBackground: colors.thumbHoverColor, trackBackground: colors.trackColor },
            ...initialStates,
            ...scrollbarThemeOptions.states
        };

        this.states = {};
        for (const state in mergedStates) {
            const stateConfig = mergedStates[state];
            this.states[state] = {
                thumbBackground: stateConfig.thumbBackground,
                trackBackground: stateConfig.trackBackground
            };

            if (stateConfig.effect || effect || scrollbarThemeOptions.effect) {
                const effectInstance = stateConfig.effect?.instance || effect?.instance || scrollbarThemeOptions.effect?.instance;
                if (effectInstance) {
                    const thumbEffectType = stateConfig.effect?.thumbType || effect?.thumbType || scrollbarThemeOptions.effect?.thumbType || 'default';
                    const trackEffectType = stateConfig.effect?.trackType || effect?.trackType || scrollbarThemeOptions.effect?.trackType || 'background';

                    const effectState = stateConfig.effect?.effectState || state;

                    this.states[state].thumbBackground = effectInstance.getGradientDefinition(thumbEffectType, effectState);
                    this.states[state].trackBackground = effectInstance.getGradientDefinition(trackEffectType, effectState);
                }
            }
        }
    }

    _convertThumbGradientToDefinition(thumbGradientArray) {
        if (!thumbGradientArray || !Array.isArray(thumbGradientArray)) {
            return this.colors.thumbColor;
        }
        return {
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            stops: thumbGradientArray.map(g => g.stop),
            colors: thumbGradientArray.map(g => g.color),
            animation: this.animatedGradient ? {
                type: 'scroll', // Custom type for scrollbar
                duration: 2000 / (typeof this.animatedGradient === 'object' ? this.animatedGradient.speed || 1 : 1)
            } : null
        };
    }

    _bindMethods() {
        this.onThumbMouseDown = this.onThumbMouseDown.bind(this);
        this.onThumbMouseMove = this.onThumbMouseMove.bind(this);
        this.onThumbMouseUp = this.onThumbMouseUp.bind(this);
        this.onThumbTouchStart = this.onThumbTouchStart.bind(this);
        this.onThumbTouchMove = this.onThumbTouchMove.bind(this);
        this.onThumbTouchEnd = this.onThumbTouchEnd.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.update = this.update.bind(this);
        this.animate = this.animate.bind(this);
    }

    _addEventListeners() {
        this.element.addEventListener("mousedown", this.onThumbMouseDown);
        this.element.addEventListener("mousemove", this.onMouseMove); // Add mousemove to track thumb hover
        document.addEventListener("mousemove", this.onThumbMouseMove);
        document.addEventListener("mouseup", this.onThumbMouseUp);
        this.element.addEventListener("touchstart", this.onThumbTouchStart, { passive: false });
        document.addEventListener("touchmove", this.onThumbTouchMove, { passive: false });
        document.addEventListener("touchend", this.onThumbTouchEnd);
        this.element.addEventListener("mouseenter", this.onMouseEnter);
        this.element.addEventListener("mouseleave", this.onMouseLeave);
        this.container.addEventListener("scroll", this.update);
        window.addEventListener("resize", this.update);

        this.observer = new MutationObserver(this.update);
        this.observer.observe(this.container, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
        });

        // Defer the initial update to allow the DOM to settle.
        setTimeout(this.update, 0);
    }

    destroy() {
        this.stopAnimation();

        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        this.element.removeEventListener("mousedown", this.onThumbMouseDown);
        this.element.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mousemove", this.onThumbMouseMove);
        document.removeEventListener("mouseup", this.onThumbMouseUp);
        this.element.removeEventListener("touchstart", this.onThumbTouchStart);
        document.removeEventListener("touchmove", this.onThumbTouchMove);
        document.removeEventListener("touchend", this.onThumbTouchEnd);
        this.element.removeEventListener("mouseenter", this.onMouseEnter);
        this.element.removeEventListener("mouseleave", this.onMouseLeave);
        this.container.removeEventListener("scroll", this.update);
        window.removeEventListener("resize", this.update);

        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }

    animate(timestamp) {
        const thumbBg = this._getCurrentThumbBackground();
        if (thumbBg?.animation) {
            this.animationOffset = (timestamp / thumbBg.animation.duration) % 1;
        }

        const { viewSize, contentSize, thumbSize, thumbPos } = this.lastDimensions;
        if (viewSize !== undefined) {
            this.drawScrollbar(viewSize, contentSize, thumbSize, thumbPos);
        }

        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    startAnimation() {
        const thumbBg = this._getCurrentThumbBackground();
        const shouldAnimate = thumbBg && typeof thumbBg === 'object' && thumbBg.animation;
        if (!this.animationFrameId && shouldAnimate) {
            this.animationFrameId = requestAnimationFrame(this.animate);
        }
    }

    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Check if mouse is over the thumb area
     */
    _isMouseOverThumb(e) {
        if (!this.lastDimensions.thumbSize) return false;

        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scrollbarSize = 14;
        const thumbPrimarySize = 10;

        const thumbX = this.orientation === 'vertical' ? (scrollbarSize - thumbPrimarySize) / 2 : this.lastDimensions.thumbPos;
        const thumbY = this.orientation === 'vertical' ? this.lastDimensions.thumbPos : (scrollbarSize - thumbPrimarySize) / 2;
        const thumbW = this.orientation === 'vertical' ? thumbPrimarySize : this.lastDimensions.thumbSize;
        const thumbH = this.orientation === 'vertical' ? this.lastDimensions.thumbSize : thumbPrimarySize;

        return x >= thumbX && x <= thumbX + thumbW && y >= thumbY && y <= thumbY + thumbH;
    }

    /**
     * Handle mouse movement on the scrollbar element
     */
    onMouseMove(e) {
        const wasHoveringThumb = this.isHoveringThumb;
        this.isHoveringThumb = this._isMouseOverThumb(e);

        // Update cursor only when thumb hover state changes
        if (this.isHoveringThumb !== wasHoveringThumb) {
            if (this.isHoveringThumb) {
                this.element.style.cursor = "grab";
            } else {
                this.element.style.cursor = "default";
            }
        }

        // Update visual state if changed
        if (this.isHoveringThumb !== wasHoveringThumb) {
            this.update();
        }
    }

    onMouseEnter() {
        this.isHovering = true;
        this.update();
    }

    onMouseLeave() {
        this.isHovering = false;
        this.isHoveringThumb = false;
        this.element.style.cursor = "default";
        this.update();
    }

    onThumbMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const currentPos = this.orientation === 'vertical' ? e.clientY : e.clientX;
        const dPos = currentPos - this.startPos;
        const scrollRatio = this.orientation === 'vertical'
            ? this._getScrollDimension('scrollHeight') / this._getScrollDimension('clientHeight')
            : this._getScrollDimension('scrollWidth') / this._getScrollDimension('clientWidth');

        const newScroll = this.startScroll + dPos * scrollRatio;

        if (this.isPageScroller) {
            if (this.orientation === 'vertical') {
                window.scrollTo(this._getScrollPosition('scrollLeft'), newScroll);
            } else {
                window.scrollTo(newScroll, this._getScrollPosition('scrollTop'));
            }
        } else {
            if (this.orientation === 'vertical') {
                this.container.scrollTop = newScroll;
            } else {
                this.container.scrollLeft = newScroll;
            }
        }
    }

    onThumbMouseDown(e) {
        // Only start dragging if over the thumb
        if (!this._isMouseOverThumb(e)) return;

        this.isDragging = true;
        this.startPos = this.orientation === 'vertical' ? e.clientY : e.clientX;
        this.startScroll = this._getScrollPosition(this.orientation === 'vertical' ? 'scrollTop' : 'scrollLeft');
        this.element.style.cursor = "grabbing";
        this.update();
    }

    onThumbMouseUp() {
        this.isDragging = false;
        // Reset cursor based on current thumb hover state
        if (this.isHoveringThumb) {
            this.element.style.cursor = "grab";
        } else {
            this.element.style.cursor = "default";
        }
        this.update();
    }

    onThumbTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const currentPos = this.orientation === 'vertical' ? e.touches[0].clientY : e.touches[0].clientX;
        const dPos = currentPos - this.startPos;
        const scrollRatio = this.orientation === 'vertical'
            ? this._getScrollDimension('scrollHeight') / this._getScrollDimension('clientHeight')
            : this._getScrollDimension('scrollWidth') / this._getScrollDimension('clientWidth');

        const newScroll = this.startScroll + dPos * scrollRatio;

        if (this.isPageScroller) {
            if (this.orientation === 'vertical') {
                window.scrollTo(this._getScrollPosition('scrollLeft'), newScroll);
            } else {
                window.scrollTo(newScroll, this._getScrollPosition('scrollTop'));
            }
        } else {
            if (this.orientation === 'vertical') {
                this.container.scrollTop = newScroll;
            } else {
                this.container.scrollLeft = newScroll;
            }
        }
    }

    onThumbTouchStart(e) {
        this.isDragging = true;
        this.startPos = this.orientation === 'vertical' ? e.touches[0].clientY : e.touches[0].clientX;
        this.startScroll = this._getScrollPosition(this.orientation === 'vertical' ? 'scrollTop' : 'scrollLeft');
        this.element.style.cursor = "grabbing";
        e.preventDefault();
        this.update();
    }

    onThumbTouchEnd() {
        this.isDragging = false;
        this.element.style.cursor = "default";
        this.update();
    }

    _getCurrentThumbBackground() {
        if (this.isDragging) return this.states.dragging?.thumbBackground || this.states.hover?.thumbBackground || this.states.default.thumbBackground;
        if (this.isHoveringThumb) return this.states.hover?.thumbBackground || this.states.default.thumbBackground; // Changed from isHovering to isHoveringThumb
        return this.states.default.thumbBackground;
    }

    _getCurrentTrackBackground() {
        if (this.isDragging) return this.states.dragging?.trackBackground || this.states.hover?.trackBackground || this.states.default.trackBackground;
        if (this.isHovering) return this.states.hover?.trackBackground || this.states.default.trackBackground;
        return this.states.default.trackBackground;
    }

    drawScrollbar(viewSize, contentSize, thumbSize, thumbPos) {
        const canvas = this.element;
        const ctx = this.ctx;
        const scrollbarSize = 14;
        const trackSize = 4;
        const thumbPrimarySize = 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const trackX = this.orientation === 'vertical' ? (scrollbarSize - trackSize) / 2 : 0;
        const trackY = this.orientation === 'vertical' ? 0 : (scrollbarSize - trackSize) / 2;
        const trackW = this.orientation === 'vertical' ? trackSize : canvas.width;
        const trackH = this.orientation === 'vertical' ? canvas.height : trackSize;

        ctx.save();
        const trackBg = this._getCurrentTrackBackground();
        this._applyBackground(ctx, trackBg, trackX, trackY, trackW, trackH);
        this._drawRoundedRect(ctx, trackX, trackY, trackW, trackH, 2);
        ctx.fill();
        ctx.restore();

        const thumbX = Math.round(this.orientation === 'vertical' ? (scrollbarSize - thumbPrimarySize) / 2 : thumbPos);
        const thumbY = Math.round(this.orientation === 'vertical' ? thumbPos : (scrollbarSize - thumbPrimarySize) / 2);
        const thumbW = Math.round(this.orientation === 'vertical' ? thumbPrimarySize : thumbSize);
        const thumbH = Math.round(this.orientation === 'vertical' ? thumbSize : thumbPrimarySize);

        ctx.save();
        const thumbBg = this._getCurrentThumbBackground();
        this._applyBackground(ctx, thumbBg, thumbX, thumbY, thumbW, thumbH);
        ctx.beginPath();
        ctx.roundRect(thumbX, thumbY, thumbW, thumbH, 5);
        ctx.fill();
        ctx.restore();

        if (this.showOutline) {
            ctx.save();
            const layers = 2;
            const outerColor = this._parseColor(this.colors.outlineOuterColor);
            const innerColor = this._parseColor(this.colors.outlineInnerColor);
            ctx.lineWidth = 1;

            for (let i = 0; i < layers; i++) {
                const ratio = layers > 1 ? i / (layers - 1) : 1;
                const r = Math.round(outerColor[0] + (innerColor[0] - outerColor[0]) * ratio);
                const g = Math.round(outerColor[1] + (innerColor[1] - outerColor[1]) * ratio);
                const b = Math.round(outerColor[2] + (innerColor[2] - outerColor[2]) * ratio);
                const a = outerColor[3] + (innerColor[3] - outerColor[3]) * ratio;
                ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;

                const inset = (i * 0.5) + (ctx.lineWidth / 2);
                const radius = Math.max(0, 5 - inset);

                ctx.beginPath();
                ctx.roundRect(thumbX + inset, thumbY + inset, thumbW - (inset * 2), thumbH - (inset * 2), radius);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (this.showHighlight) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(thumbX, thumbY, thumbW, thumbH, 5);
            ctx.clip();
            const highlightGradient = ctx.createLinearGradient(0, thumbY, 0, thumbY + thumbH);
            const highlightParts = this._parseColor(this.colors.highlightColor);

            highlightGradient.addColorStop(0, `rgba(${highlightParts[0]}, ${highlightParts[1]}, ${highlightParts[2]}, ${highlightParts[3]})`);
            highlightGradient.addColorStop(0.2, `rgba(${highlightParts[0]}, ${highlightParts[1]}, ${highlightParts[2]}, ${highlightParts[3] * 0.25})`);
            highlightGradient.addColorStop(1, `rgba(${highlightParts[0]}, ${highlightParts[1]}, ${highlightParts[2]}, 0.0)`);
            ctx.fillStyle = highlightGradient;
            ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
            ctx.restore();
        }

        if (this.showGripLines && thumbSize >= 20) {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            const gripCenterX = thumbX + thumbW / 2;
            const gripCenterY = thumbY + thumbH / 2;

            const lineLength = this.orientation === 'vertical' ? thumbW * 0.4 : thumbH * 0.4;
            const lineOffset = 2;

            ctx.beginPath();
            if (this.orientation === 'vertical') {
                ctx.moveTo(gripCenterX - lineLength / 2, gripCenterY - lineOffset);
                ctx.lineTo(gripCenterX + lineLength / 2, gripCenterY - lineOffset);
                ctx.moveTo(gripCenterX - lineLength / 2, gripCenterY + lineOffset);
                ctx.lineTo(gripCenterX + lineLength / 2, gripCenterY + lineOffset);
            } else {
                ctx.moveTo(gripCenterX - lineOffset, gripCenterY - lineLength / 2);
                ctx.lineTo(gripCenterX - lineOffset, gripCenterY + lineLength / 2);
                ctx.moveTo(gripCenterX + lineOffset, gripCenterY - lineLength / 2);
                ctx.lineTo(gripCenterX + lineOffset, gripCenterY + lineLength / 2);
            }
            ctx.stroke();
        }
    }

    _applyBackground(ctx, bg, x, y, width, height) {
        if (typeof bg === 'string') {
            ctx.fillStyle = bg;
        } else if (typeof bg === 'object' && bg !== null) {
            const gradient = this._createCanvasGradient(ctx, bg, x, y, width, height);
            if (gradient) ctx.fillStyle = gradient;
        }
    }

    _createCanvasGradient(ctx, definition, x, y, width, height) {
        if (!definition || typeof definition !== 'object') return null;
        const { type = 'linear', colors, stops, animation } = definition;
        let { start, end, center, radius } = definition;

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

        const colorStops = stops || colors.map((_, i) => i / (colors.length - 1 || 1));

        if (animation && this.animationFrameId) {
            colorStops.forEach((stop, i) => {
                gradient.addColorStop((stop + this.animationOffset) % 1, colors[i]);
            });
            colorStops.forEach((stop, i) => {
                gradient.addColorStop((stop + this.animationOffset - 1) % 1, colors[i]);
            });
        } else {
            colorStops.forEach((stop, i) => {
                gradient.addColorStop(stop, colors[i]);
            });
        }

        return gradient;
    }

    update() {
        if (this.observer) {
            this.observer.disconnect();
        }

        const viewSize = this._getScrollDimension(this.orientation === 'vertical' ? 'clientHeight' : 'clientWidth');
        const contentSize = this._getScrollDimension(this.orientation === 'vertical' ? 'scrollHeight' : 'scrollWidth');

        if (contentSize <= viewSize) {
            this.element.style.display = "none";
            this.stopAnimation();
            return;
        }

        this.element.style.display = "block";
        if (this.orientation === 'vertical') {
            this.element.height = viewSize;
            this.element.width = 14;
        } else {
            this.element.height = 14;
            this.element.width = viewSize;
        }

        const thumbSize = Math.max(this.minThumbSize, viewSize * (viewSize / contentSize));
        const scrollPos = this._getScrollPosition(this.orientation === 'vertical' ? 'scrollTop' : 'scrollLeft');
        const scrollPercentage = (contentSize > viewSize) ? (scrollPos / (contentSize - viewSize)) : 0;
        const thumbPos = scrollPercentage * (viewSize - thumbSize);

        this.lastDimensions = { viewSize, contentSize, thumbSize, thumbPos };

        const newScroll = this._getScrollPosition(this.orientation === 'vertical' ? 'scrollTop' : 'scrollLeft');
        if (this.app && this.app.sounds && this.app.sounds.scroll && this.lastScroll !== newScroll) {
            clearTimeout(this.scrollSoundTimeout);
            this.app.sounds.scroll.play();
            this.scrollSoundTimeout = setTimeout(() => { }, 100);
        }
        this.lastScroll = newScroll;

        this.drawScrollbar(viewSize, contentSize, thumbSize, thumbPos);

        const thumbBg = this._getCurrentThumbBackground();
        const shouldAnimate = thumbBg && typeof thumbBg === 'object' && thumbBg.animation;

        if (shouldAnimate) {
            this.startAnimation();
        } else {
            this.stopAnimation();
        }

        if (this.observer) {
            this.observer.observe(this.container, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
            });
        }
    }

    setSettings(options = {}) {
        // Update simple properties
        const simpleProps = ['orientation', 'showOutline', 'showGripLines', 'showHighlight', 'useGradient', 'minThumbSize', 'animatedGradient', 'effect'];
        simpleProps.forEach(prop => {
            if (options[prop] !== undefined) this[prop] = options[prop];
        });

        if (options.thumbGradient !== undefined) this.thumbGradient = options.thumbGradient;
        if (options.states !== undefined) this.initialStates = options.states;

        if (typeof this.animatedGradient === 'object' && this.animatedGradient.speed) {
            this.gradientSpeed = this.animatedGradient.speed;
        } else if (this.animatedGradient) {
            this.gradientSpeed = 1;
        }

        if (options.colors) {
            Object.assign(this.colors, options.colors);
        }

        this._initializeStates();
        this.update();
    }

    _getScrollDimension(dimension) {
        if (this.isPageScroller) {
            return document.documentElement[dimension];
        }
        return this.container[dimension];
    }

    _getScrollPosition(position) {
        if (this.isPageScroller) {
            return document.documentElement[position] || document.body[position];
        }
        return this.container[position];
    }

    _drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    _parseColor(colorString) {
        if (!colorString) return null;
        const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            return [
                parseInt(match[1], 10),
                parseInt(match[2], 10),
                parseInt(match[3], 10),
                match[4] !== undefined ? parseFloat(match[4]) : 1
            ];
        }
        return null;
    }
}