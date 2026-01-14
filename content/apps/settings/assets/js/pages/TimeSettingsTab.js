import { UIComponent, CanvasButton } from "/content/common/utils/index.js";

export class TimeSettingsTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.element = this.createElement('div', 'settings-tab time-settings-tab no-scroll');
        
        // Remove padding
        this.element.style.padding = '0';
        
        // Get current time from localStorage or use system time
        const storedTime = localStorage.getItem('customTime');
        if (storedTime) {
            this.customTime = new Date(storedTime);
        } else {
            this.customTime = new Date();
        }
        
        this.tempTime = new Date(this.customTime);
    }

    render() {
        this.element.innerHTML = '';
        
        const container = this.createElement('div', 'time-settings-container');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            height: 100%;
        `;

        // Title
        const titleCanvas = this.createCanvas(280, 30);
        titleCanvas.className = 'time-settings-title';
        const titleCtx = titleCanvas.getContext('2d');
        this._drawTextOnCanvas(
            titleCtx,
            this.app.translations.sections.time?.timeTitle || 'Set Time',
            140, 15,
            'bold 18px "Rodin", sans-serif',
            this.app.cssVars['--ds-text'],
            'center', 'middle'
        );
        container.appendChild(titleCanvas);

        // Divider line with rounded edges
        const dividerCanvas = this.createCanvas(260, 2);
        dividerCanvas.className = 'settings-divider';
        const dividerCtx = dividerCanvas.getContext('2d');
        dividerCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        dividerCtx.beginPath();
        dividerCtx.roundRect(0, 0, 260, 2, 1);
        dividerCtx.fill();
        container.appendChild(dividerCanvas);

        // Time adjustment controls with combined background that contains everything
        const controlsWrapper = this.createElement('div', 'time-settings-controls-wrapper');
        controlsWrapper.style.cssText = `
            padding: 0px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        const controlsContainer = this.createElement('div', 'time-settings-controls-grid');
        controlsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            width: 164px;
        `;

        // Hour controls (12-hour format)
        const hour12 = this.tempTime.getHours() % 12 || 12;
        
        const hourGroup = this.createTimeControlGroup(
            this.app.translations.sections.time?.hour || 'Hour',
            hour12,
            null,
            () => {
                this.tempTime.setHours(this.tempTime.getHours() + 1);
                this.updateDisplay();
            },
            () => {
                this.tempTime.setHours(this.tempTime.getHours() - 1);
                this.updateDisplay();
            }
        );
        controlsContainer.appendChild(hourGroup);

        // Minute controls
        const minuteGroup = this.createTimeControlGroup(
            this.app.translations.sections.time?.minute || 'Minute',
            this.tempTime.getMinutes(),
            null,
            () => {
                this.tempTime.setMinutes(this.tempTime.getMinutes() + 1);
                this.updateDisplay();
            },
            () => {
                this.tempTime.setMinutes(this.tempTime.getMinutes() - 1);
                this.updateDisplay();
            }
        );
        controlsContainer.appendChild(minuteGroup);

        // AM/PM toggle
        const ampm = this.tempTime.getHours() >= 12 ? 'PM' : 'AM';
        const ampmGroup = this.createAMPMToggle(ampm);
        controlsContainer.appendChild(ampmGroup);

        controlsWrapper.appendChild(controlsContainer);
        container.appendChild(controlsWrapper);

        this.element.appendChild(container);
        this.updateConfirmButton();
    }

    createTimeControlGroup(label, value, suffix, onIncrement, onDecrement) {
        const group = this.createElement('div', 'time-control-group');
        group.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0px;
            position: relative;
        `;

        // Background that only covers the buttons (not label or value)
        const backgroundCanvas = this.createCanvas(48, 64);
        backgroundCanvas.className = 'time-control-background';
        backgroundCanvas.style.position = 'absolute';
        backgroundCanvas.style.top = '0px';
        backgroundCanvas.style.left = '0';
        backgroundCanvas.style.zIndex = '0';
        const bgCtx = backgroundCanvas.getContext('2d');
        bgCtx.fillStyle = 'rgba(0,0,0,0.2)';
        bgCtx.fillRect(0, 0, 48, 64);
        group.appendChild(backgroundCanvas);

        // Up button
        const upButton = new CanvasButton({
            text: '▲',
            width: 48,
            height: 32,
            font: 'bold 12px "Rodin", sans-serif',
            textColor: this.app.cssVars['--ds-text'],
            backgroundColor: 'rgba(255,255,255,0.1)',
            hoverBackgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: [8, 8, 0, 0],
            shadowOffset: { x: 0, y: 0, blur: 0, color: 'transparent' },
            sounds: this.app.sounds,
            moveOnPress: false,
            cssVars: this.app.cssVars,
            onClick: onIncrement
        });
        upButton.element.classList.add('time-control-up-button');
        upButton.element.style.position = 'relative';
        upButton.element.style.zIndex = '1';
        group.appendChild(upButton.element);

        // Value display (outside background)
        const valueCanvas = this.createCanvas(48, 32);
        valueCanvas.className = 'time-control-value';
        valueCanvas.style.position = 'relative';
        valueCanvas.style.zIndex = '1';
        const valueCtx = valueCanvas.getContext('2d');
        
        const displayValue = String(value).padStart(2, '0');
        const displayText = suffix ? `${displayValue} ${suffix}` : displayValue;
        
        this._drawTextOnCanvas(
            valueCtx,
            displayText,
            24, 16,
            suffix ? 'bold 10px "Rodin", sans-serif' : 'bold 14px "Rodin", sans-serif',
            this.app.cssVars['--ds-text'],
            'center', 'middle'
        );
        group.appendChild(valueCanvas);

        // Down button
        const downButton = new CanvasButton({
            text: '▼',
            width: 48,
            height: 32,
            font: 'bold 12px "Rodin", sans-serif',
            textColor: this.app.cssVars['--ds-text'],
            backgroundColor: 'rgba(255,255,255,0.1)',
            hoverBackgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: [0, 0, 8, 8],
            shadowOffset: { x: 0, y: 0, blur: 0, color: 'transparent' },
            sounds: this.app.sounds,
            moveOnPress: false,
            cssVars: this.app.cssVars,
            onClick: onDecrement
        });
        downButton.element.classList.add('time-control-down-button');
        downButton.element.style.position = 'relative';
        downButton.element.style.zIndex = '1';
        group.appendChild(downButton.element);

        // Label with white color (at bottom)
        const labelCanvas = this.createCanvas(48, 20);
        labelCanvas.className = 'time-control-label';
        labelCanvas.style.position = 'relative';
        labelCanvas.style.zIndex = '1';
        const labelCtx = labelCanvas.getContext('2d');
        this._drawTextOnCanvas(
            labelCtx,
            label,
            24, 10,
            'bold 10px "Rodin", sans-serif',
            '#FFFFFF',
            'center', 'middle'
        );
        group.appendChild(labelCanvas);

        return group;
    }

    createAMPMToggle(currentValue) {
        const group = this.createElement('div', 'time-control-group ampm-toggle-group');
        group.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0px;
            position: relative;
        `;

        // Background that only covers the buttons (not label or value)
        const backgroundCanvas = this.createCanvas(48, 64);
        backgroundCanvas.className = 'time-control-background ampm-background';
        backgroundCanvas.style.position = 'absolute';
        backgroundCanvas.style.top = '0px';
        backgroundCanvas.style.left = '0';
        backgroundCanvas.style.zIndex = '0';
        const bgCtx = backgroundCanvas.getContext('2d');
        bgCtx.fillStyle = 'rgba(0,0,0,0.2)';
        bgCtx.fillRect(0, 0, 48, 64);
        group.appendChild(backgroundCanvas);

        // AM button
        const amButton = new CanvasButton({
            text: 'AM',
            width: 48,
            height: 32,
            font: 'bold 10px "Rodin", sans-serif',
            textColor: this.app.cssVars['--ds-text'],
            backgroundColor: currentValue === 'AM' ? 'rgba(100,150,255,0.5)' : 'rgba(255,255,255,0.1)',
            hoverBackgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: [8, 8, 0, 0],
            shadowOffset: { x: 0, y: 0, blur: 0, color: 'transparent' },
            sounds: this.app.sounds,
            moveOnPress: false,
            cssVars: this.app.cssVars,
            onClick: () => {
                const hours = this.tempTime.getHours();
                if (hours >= 12) {
                    this.tempTime.setHours(hours - 12);
                    this.updateDisplay();
                }
            }
        });
        amButton.element.classList.add('ampm-button', 'am-button');
        amButton.element.style.position = 'relative';
        amButton.element.style.zIndex = '1';
        group.appendChild(amButton.element);

        // Value display (outside background)
        const valueCanvas = this.createCanvas(48, 32);
        valueCanvas.className = 'time-control-value ampm-value';
        valueCanvas.style.position = 'relative';
        valueCanvas.style.zIndex = '1';
        const valueCtx = valueCanvas.getContext('2d');
        
        this._drawTextOnCanvas(
            valueCtx,
            currentValue,
            24, 16,
            'bold 12px "Rodin", sans-serif',
            this.app.cssVars['--ds-text'],
            'center', 'middle'
        );
        group.appendChild(valueCanvas);

        // PM button
        const pmButton = new CanvasButton({
            text: 'PM',
            width: 48,
            height: 32,
            font: 'bold 10px "Rodin", sans-serif',
            textColor: this.app.cssVars['--ds-text'],
            backgroundColor: currentValue === 'PM' ? 'rgba(100,150,255,0.5)' : 'rgba(255,255,255,0.1)',
            hoverBackgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: [0, 0, 8, 8],
            shadowOffset: { x: 0, y: 0, blur: 0, color: 'transparent' },
            sounds: this.app.sounds,
            moveOnPress: false,
            cssVars: this.app.cssVars,
            onClick: () => {
                const hours = this.tempTime.getHours();
                if (hours < 12) {
                    this.tempTime.setHours(hours + 12);
                    this.updateDisplay();
                }
            }
        });
        pmButton.element.classList.add('ampm-button', 'pm-button');
        pmButton.element.style.position = 'relative';
        pmButton.element.style.zIndex = '1';
        group.appendChild(pmButton.element);

        // Label with white color (at bottom)
        const labelCanvas = this.createCanvas(48, 20);
        labelCanvas.className = 'time-control-label ampm-label';
        labelCanvas.style.position = 'relative';
        labelCanvas.style.zIndex = '1';
        const labelCtx = labelCanvas.getContext('2d');
        this._drawTextOnCanvas(
            labelCtx,
            'AM/PM',
            24, 10,
            'bold 8px "Rodin", sans-serif',
            '#FFFFFF',
            'center', 'middle'
        );
        group.appendChild(labelCanvas);

        return group;
    }

    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    updateDisplay() {
        this.render();
        this.updateConfirmButton();
    }

    updateConfirmButton() {
        const originalTime = new Date(0, 0, 0, this.customTime.getHours(), this.customTime.getMinutes(), this.customTime.getSeconds());
        const newTime = new Date(0, 0, 0, this.tempTime.getHours(), this.tempTime.getMinutes(), this.tempTime.getSeconds());
        this.app.emit('settingChanged', originalTime.getTime() !== newTime.getTime());
    }

    applySettings() {
        // Update only the time components
        this.customTime.setHours(this.tempTime.getHours());
        this.customTime.setMinutes(this.tempTime.getMinutes());
        this.customTime.setSeconds(this.tempTime.getSeconds());
        
        localStorage.setItem('customTime', this.customTime.toISOString());
        
        // Register offset with top screen immediately
        if (this.app.topScreen && typeof this.app.topScreen.registerTimeOffset === 'function') {
            const offset = this.customTime.getTime() - new Date().getTime();
            this.app.topScreen.registerTimeOffset(offset);
        }
        
        // Emit event for other parts of the app to update
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'timeChanged',
                time: this.customTime.toISOString()
            }, '*');
        }
    }

    _drawTextOnCanvas(ctx, text, x, y, font, color, textAlign = 'left', textBaseline = 'alphabetic', maxWidth) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        if (maxWidth) {
            const isJapanese = this.app.settings.language === 'ja-JP';
            const units = isJapanese ? text.split('') : text.split(' ');
            let line = '';
            const lineHeight = parseInt(font, 10) * 1.4;

            for (let n = 0; n < units.length; n++) {
                const unit = units[n];
                const separator = (isJapanese || line === '') ? '' : ' ';
                let testLine = line + separator + unit;
                let metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, x, y);
                    line = unit;
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
        } else {
            ctx.fillText(text, x, y);
        }
    }

    destroy() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
