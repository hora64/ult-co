import { UIComponent, CanvasButton } from "/content/common/utils/index.js";

export class DebugModeTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.element = this.createElement('div', 'settings-tab debug-mode-tab');
    }

    render() {
        this.element.innerHTML = '';
        const t = this.app.translations.debugMode;

        const titleCanvas = this.createElement('canvas');
        titleCanvas.width = 280;
        titleCanvas.height = 30;
        const titleCtx = titleCanvas.getContext('2d');
        this.app._drawTextOnCanvas(titleCtx, t.title, titleCanvas.width / 2, titleCanvas.height / 2, 'bold 20px "Rodin", sans-serif', this.app.cssVars['--ds-text'], 'center', 'middle');
        this.element.appendChild(titleCanvas);

        const infoCanvas = this.createElement('canvas');
        infoCanvas.width = 280;
        infoCanvas.height = 80;
        const infoCtx = infoCanvas.getContext('2d');
        this.app._drawTextOnCanvas(infoCtx, t.description, infoCanvas.width / 2, 20, '14px "Rodin", sans-serif', this.app.cssVars['--ds-text'], 'center', 'top', 260);
        this.element.appendChild(infoCanvas);

        if (this.app.Debug) {
            const disableButton = new CanvasButton({
                app: this.app,
                text: t.disableAndRestart,
                width: 240,
                height: 40,
                onClick: () => {
                    localStorage.setItem('Debug', 'false');
                    this.app.modalManager.showConfirmationModal({
                        title: t.restartingTitle,
                        message: t.restartingMessage,
                        showCancel: false,
                        onConfirm: () => window.location.reload()
                    });
                },
                ...(this.app.theme?.ui?.button || {})
            });
            this.element.appendChild(disableButton.element);
        } else {
            const enableButton = new CanvasButton({
                app: this.app,
                text: t.enableAndRestart,
                width: 240,
                height: 40,
                onClick: () => {
                    localStorage.setItem('Debug', 'true');
                    this.app.modalManager.showConfirmationModal({
                        title: t.restartingTitle,
                        message: t.restartingMessage,
                        showCancel: false,
                        onConfirm: () => window.location.reload()
                    });
                },
                ...(this.app.theme?.ui?.button || {})
            });
            this.element.appendChild(enableButton.element);
        }
    }

    destroy() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
