import { UIComponent, CanvasButton } from "/content/common/utils/index.js";

export class ClearDataTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.translations = app.translations;
        this.cssVars = app.cssVars;
        this.sounds = app.sounds;
        this.element = this.createElement('div', 'settings-tab clear-data-tab');
    }

    render() {
        this.translations = this.app.translations;
        const t = this.translations;
        this.element.innerHTML = '';

        const theme = this.app.theme || {};
        const buttonOptions = theme.ui?.button || {};

        const container = this.createElement('div', 'clear-data-container');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 20px;
        `;

        const clearReadMailButton = new CanvasButton({
            text: 'Clear Read Mail Data',
            width: 236,
            height: 40,
            font: 'bold 16px "Rodin", sans-serif',
            textColor: this.cssVars['--ds-text'],
            backgroundColor: 'rgba(255,0,0,0.5)',
            hoverBackgroundColor: 'rgba(255,0,0,0.7)',
            borderRadius: 6,
            sounds: this.sounds,
            moveOnPress: true,
            cssVars: this.cssVars,
            onClick: () => {
                this.app.modalManager.showConfirmationModal({
                    message: 'Are you sure you want to clear read mail data?',
                    onConfirm: () => this.app.clearReadMailData()
                });
            },
            ...buttonOptions
        });
        container.appendChild(clearReadMailButton.element);

        const clearAllDataButton = new CanvasButton({
            text: 'Clear All Data',
            width: 236,
            height: 40,
            font: 'bold 16px "Rodin", sans-serif',
            textColor: this.cssVars['--ds-text'],
            backgroundColor: 'rgba(255,0,0,0.8)',
            hoverBackgroundColor: 'rgba(255,0,0,1)',
            borderRadius: 6,
            sounds: this.sounds,
            moveOnPress: true,
            cssVars: this.cssVars,
            onClick: () => {
                this.app.modalManager.showConfirmationModal({
                    message: 'Are you sure you want to clear all data? This action cannot be undone.',
                    onConfirm: () => this.app.clearAllData()
                });
            },
            ...buttonOptions
        });
        container.appendChild(clearAllDataButton.element);

        // Reset to System Time button
        const resetSystemTimeButton = new CanvasButton({
            text: this.app.translations.sections.time?.reset || 'Reset to System Time',
            width: 236,
            height: 40,
            font: 'bold 16px "Rodin", sans-serif',
            textColor: this.cssVars['--ds-text'],
            backgroundColor: 'rgba(255,165,0,0.5)',
            hoverBackgroundColor: 'rgba(255,165,0,0.7)',
            borderRadius: 6,
            sounds: this.sounds,
            moveOnPress: true,
            cssVars: this.cssVars,
            onClick: () => {
                this.app.modalManager.showConfirmationModal({
                    message: 'Reset custom time to system time?',
                    onConfirm: () => this.resetSystemTime()
                });
            },
            ...buttonOptions
        });
        container.appendChild(resetSystemTimeButton.element);

        this.element.appendChild(container);
    }

    resetSystemTime() {
        // Remove custom time from localStorage
        localStorage.removeItem('customTime');
        
        // Reset time offset in TopScreen
        if (this.app.topScreen && typeof this.app.topScreen.registerTimeOffset === 'function') {
            this.app.topScreen.registerTimeOffset(0);
        }
        
        // Show confirmation modal
        this.app.modalManager.showSettingAppliedModal({
            message: 'System time restored',
            autoClose: 2000,
            alignTop: true
        });
        
        // Emit event for other parts of the app to update
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'timeChanged',
                time: new Date().toISOString()
            }, '*');
        }
    }

    destroy() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
