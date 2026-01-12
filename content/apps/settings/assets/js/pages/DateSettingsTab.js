import { UIComponent, CanvasButton } from "/content/common/utils/index.js";
import { jumpScare } from "/content/common/utils/JumpScare.js";

export class DateSettingsTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.element = this.createElement('div', 'settings-tab date-settings-tab no-scroll');
        
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
        
        const container = this.createElement('div', 'date-settings-container');
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
        titleCanvas.className = 'date-settings-title';
        const titleCtx = titleCanvas.getContext('2d');
        this._drawTextOnCanvas(
            titleCtx,
            this.app.translations.sections.time?.dateTitle || 'Set Date',
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

        // Date adjustment controls with combined background that contains everything
        const controlsWrapper = this.createElement('div', 'date-settings-controls-wrapper');
        controlsWrapper.style.cssText = `
            padding: 0px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        const dateControlsContainer = this.createElement('div', 'date-settings-controls-grid');
        dateControlsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            width: 164px;
        `;

        // Month controls (first)
        const monthGroup = this.createDateControlGroup(
            this.app.translations.sections.time?.month || 'Month',
            this.tempTime.getMonth() + 1,
            () => {
                this.tempTime.setMonth(this.tempTime.getMonth() + 1);
                this.updateDisplay();
            },
            () => {
                this.tempTime.setMonth(this.tempTime.getMonth() - 1);
                this.updateDisplay();
            }
        );
        dateControlsContainer.appendChild(monthGroup);

        // Day controls (second)
        const dayGroup = this.createDateControlGroup(
            this.app.translations.sections.time?.day || 'Day',
            this.tempTime.getDate(),
            () => {
                this.tempTime.setDate(this.tempTime.getDate() + 1);
                this.updateDisplay();
            },
            () => {
                this.tempTime.setDate(this.tempTime.getDate() - 1);
                this.updateDisplay();
            }
        );
        dateControlsContainer.appendChild(dayGroup);

        // Year controls (third)
        const yearGroup = this.createDateControlGroup(
            this.app.translations.sections.time?.year || 'Year',
            this.tempTime.getFullYear(),
            () => {
                this.tempTime.setFullYear(this.tempTime.getFullYear() + 1);
                this.updateDisplay();
            },
            () => {
                this.tempTime.setFullYear(this.tempTime.getFullYear() - 1);
                this.updateDisplay();
            }
        );
        dateControlsContainer.appendChild(yearGroup);

        controlsWrapper.appendChild(dateControlsContainer);
        container.appendChild(controlsWrapper);

        this.element.appendChild(container);
        this.updateConfirmButton();
    }

    createDateControlGroup(label, value, onIncrement, onDecrement) {
        const group = this.createElement('div', 'date-control-group');
        group.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0px;
            position: relative;
        `;

        // Background that only covers the buttons (not label or value)
        const backgroundCanvas = this.createCanvas(48, 64);
        backgroundCanvas.className = 'date-control-background';
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
        upButton.element.classList.add('date-control-up-button');
        upButton.element.style.position = 'relative';
        upButton.element.style.zIndex = '1';
        group.appendChild(upButton.element);

        // Value display (outside background)
        const valueCanvas = this.createCanvas(48, 32);
        valueCanvas.className = 'date-control-value';
        valueCanvas.style.position = 'relative';
        valueCanvas.style.zIndex = '1';
        const valueCtx = valueCanvas.getContext('2d');
        
        this._drawTextOnCanvas(
            valueCtx,
            String(value).padStart(2, '0'),
            24, 16,
            'bold 14px "Rodin", sans-serif',
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
        downButton.element.classList.add('date-control-down-button');
        downButton.element.style.position = 'relative';
        downButton.element.style.zIndex = '1';
        group.appendChild(downButton.element);

        // Label with white color (at bottom)
        const labelCanvas = this.createCanvas(48, 20);
        labelCanvas.className = 'date-control-label';
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

    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getDayName(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    updateDisplay() {
        this.render();
        this.updateConfirmButton();
    }

    updateConfirmButton() {
        const originalDate = new Date(this.customTime.getFullYear(), this.customTime.getMonth(), this.customTime.getDate());
        const newDate = new Date(this.tempTime.getFullYear(), this.tempTime.getMonth(), this.tempTime.getDate());
        this.app.emit('settingChanged', originalDate.getTime() !== newDate.getTime());
    }

    applySettings() {
        // Update only the date components
        this.customTime.setFullYear(this.tempTime.getFullYear());
        this.customTime.setMonth(this.tempTime.getMonth());
        this.customTime.setDate(this.tempTime.getDate());
        
        localStorage.setItem('customTime', this.customTime.toISOString());
        
        // Check for Halloween 2000 jump scare
        if (jumpScare.isHalloweenDate(this.customTime)) {
            console.log('🎃 Halloween 2000 detected! Triggering jump scare...');
            
            // Trigger jump scare before showing confirmation
            jumpScare.trigger({
                duration: 3000,
                onComplete: () => {
                    console.log('Jump scare complete, continuing with settings apply...');
                    this.completeSettingsApply();
                }
            });
        } else {
            // Normal flow - no jump scare
            this.completeSettingsApply();
        }
    }

    completeSettingsApply() {
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
