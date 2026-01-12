import { UIComponent, CanvasButton } from "/content/common/utils/index.js";

export class MainMenuTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.element = this.createElement('div', 'settings-tab main-menu-container');
        this.buttons = {};
    }

    render() {
        if (!this.app.translations || !this.app.translations.mainMenu) {
            this.element.innerHTML = 'Loading...';
            return;
        }

        this.element.innerHTML = ''; // Clear previous content

        const menuItems = [
            { id: 'system', label: this.app.translations.mainMenu.systemSettings },
            { id: 'achievements', label: this.app.translations.mainMenu.achievements, disabled: false },
        ];

        const buttonWidth = 113;
        const buttonHeight = Math.round(buttonWidth * (3 / 5)); // 68
        let currentRow = null;

        menuItems.forEach((item, index) => {
            if (index % 2 === 0) {
                currentRow = this.createElement('div', 'main-menu-row');
                this.element.appendChild(currentRow);
            }

            const button = new CanvasButton({
                app: this.app,
                text: item.label,
                width: buttonWidth,
                height: buttonHeight,
                font: 'bold 14px "Rodin", sans-serif',
                disabled: item.disabled,
                textColor: '#FFFFFF',
                onClick: () => {
                    if (item.id === 'achievements') {
                        this.app.modalManager.showInfoModal({
                            title: this.app.translations.modals.achievementsTitle,
                            message: this.app.translations.modals.achievementsMessage,
                        });
                    } else {
                        this.app.navigateTo(item.id, button.element);
                    }
                }
            });
            this.buttons[item.id] = button;
            currentRow.appendChild(button.element);
        });
    }

    destroy() {
        Object.values(this.buttons).forEach(button => {
            if (typeof button.destroy === 'function') {
                button.destroy();
            }
        });
        this.buttons = {};
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
        if (this.appGrid) {
            this.appGrid.destroy();
        }
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
