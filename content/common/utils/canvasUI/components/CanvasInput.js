import { UIComponent } from "/content/common/utils/index.js";
import { TextCanvasMeasurer } from "/content/common/utils/index.js";

export class CanvasInput extends UIComponent {
    constructor({
        placeholder = "Type here...",
        value = "",
        width = 200,
        height = 32,
        font = '14px "Rodin", sans-serif',
        textColor = "#333",
        backgroundColor = "#fff",
        borderColor = "#ccc",
        focusBorderColor = "#007bff",
        placeholderColor = "#999",
        padding = 8,
        borderRadius = 4,
        onUpdate,
        onFocus,
        onBlur,
        appInstance
    } = {}) {
        super();
        
        this.placeholder = placeholder;
        this.value = value;
        this.width = width;
        this.height = height;
        this.font = font;
        this.textColor = textColor;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.focusBorderColor = focusBorderColor;
        this.placeholderColor = placeholderColor;
        this.padding = padding;
        this.borderRadius = borderRadius;
        this.onUpdate = onUpdate;
        this.onFocus = onFocus;
        this.onBlur = onBlur;
        this.appInstance = appInstance;
        
        this.isFocused = false;
        this.cursorPosition = 0;
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.measurer = new TextCanvasMeasurer();
        
        this.element = this.render();
        this.setupEventListeners();
    }

    render() {
        const container = this.createElement('div', 'canvas-input-wrapper');
        container.style.position = 'relative';
        container.style.width = `${this.width}px`;
        container.style.height = `${this.height}px`;
        
        // Hidden input for handling actual text input
        this.hiddenInput = this.createElement('input', 'canvas-input-hidden');
        this.hiddenInput.type = 'text';
        this.hiddenInput.value = this.value;
        this.hiddenInput.style.position = 'absolute';
        this.hiddenInput.style.left = '-9999px';
        this.hiddenInput.style.opacity = '0';
        
        // Canvas for rendering
        this.canvas = this.createCanvas(this.width, this.height, 'canvas-input-display');
        this.canvas.style.cursor = 'text';
        this.ctx = this.canvas.getContext('2d');
        
        container.appendChild(this.hiddenInput);
        container.appendChild(this.canvas);
        
        this.draw();
        return container;
    }

    setupEventListeners() {
        // Canvas click to focus
        this.canvas.addEventListener('click', (e) => {
            this.focus();
            this.setCursorFromClick(e);
        });
        
        // Hidden input events
        this.hiddenInput.addEventListener('input', (e) => {
            this.value = e.target.value;
            this.cursorPosition = e.target.selectionStart;
            this.draw();
            if (this.onUpdate) this.onUpdate(this.value);
        });
        
        this.hiddenInput.addEventListener('focus', () => {
            this.isFocused = true;
            this.draw();
            if (this.onFocus) this.onFocus();
        });
        
        this.hiddenInput.addEventListener('blur', () => {
            this.isFocused = false;
            this.draw();
            if (this.onBlur) this.onBlur();
        });
        
        this.hiddenInput.addEventListener('keydown', (e) => {
            requestAnimationFrame(() => {
                this.cursorPosition = this.hiddenInput.selectionStart;
                this.selectionStart = this.hiddenInput.selectionStart;
                this.selectionEnd = this.hiddenInput.selectionEnd;
                this.draw();
            });
        });
        
        this.hiddenInput.addEventListener('keyup', (e) => {
            this.cursorPosition = this.hiddenInput.selectionStart;
            this.selectionStart = this.hiddenInput.selectionStart;
            this.selectionEnd = this.hiddenInput.selectionEnd;
            this.draw();
        });
    }

    setCursorFromClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.padding;
        
        this.ctx.font = this.font;
        let clickPosition = 0;
        
        for (let i = 0; i <= this.value.length; i++) {
            const textWidth = this.ctx.measureText(this.value.substring(0, i)).width;
            if (x <= textWidth) {
                clickPosition = i;
                break;
            }
            clickPosition = i;
        }
        
        this.cursorPosition = clickPosition;
        this.hiddenInput.selectionStart = clickPosition;
        this.hiddenInput.selectionEnd = clickPosition;
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = this.isFocused ? this.focusBorderColor : this.borderColor;
        ctx.lineWidth = this.isFocused ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(0.5, 0.5, this.width - 1, this.height - 1, this.borderRadius);
        ctx.stroke();
        
        // Set text properties
        ctx.font = this.font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        
        const textY = this.height / 2;
        const textX = this.padding;
        const maxTextWidth = this.width - (this.padding * 2);
        
        if (this.value) {
            // Draw text
            ctx.fillStyle = this.textColor;
            
            // Clip text to input area
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.padding, 0, maxTextWidth, this.height);
            ctx.clip();
            
            ctx.fillText(this.value, textX, textY);
            ctx.restore();
            
            // Draw cursor if focused
            if (this.isFocused) {
                const cursorText = this.value.substring(0, this.cursorPosition);
                const cursorX = textX + ctx.measureText(cursorText).width;
                
                if (cursorX >= this.padding && cursorX <= this.width - this.padding) {
                    ctx.strokeStyle = this.textColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(cursorX, this.padding);
                    ctx.lineTo(cursorX, this.height - this.padding);
                    ctx.stroke();
                }
            }
        } else if (!this.isFocused) {
            // Draw placeholder
            ctx.fillStyle = this.placeholderColor;
            ctx.fillText(this.placeholder, textX, textY);
        }
    }

    focus() {
        this.hiddenInput.focus();
    }

    blur() {
        this.hiddenInput.blur();
    }

    setValue(newValue) {
        this.value = newValue;
        this.hiddenInput.value = newValue;
        this.cursorPosition = newValue.length;
        this.draw();
    }

    getValue() {
        return this.value;
    }

    resize() {
        this.draw();
    }

    destroy() {
        super.destroy();
    }
}