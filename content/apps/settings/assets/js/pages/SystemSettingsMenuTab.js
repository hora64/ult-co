import { UIComponent, CanvasButton } from "/content/common/utils/index.js";

export class SystemSettingsMenuTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.translations = app.translations;
        this.cssVars = app.cssVars;
        this.sounds = app.sounds;
        this.element = this.createElement('div', 'settings-tab system-settings-menu-tab');
        this.menuButtons = [];
        this.currentPage = 0;
        this.itemsPerPage = 3;
        this.animationDirection = 'none';
    }

    render() {
        this.translations = this.app.translations;
        const t = this.translations;
        this.element.innerHTML = '';

        const mainContainer = this.createElement('div', 'system-settings-main-container');

        const menuItems = [
            { id: 'audio', label: t.sections.audio.title },
            { id: 'time', label: t.sections.time?.timePage || 'Time' },
            { id: 'date', label: t.sections.time?.datePage || 'Date' },
            { id: 'timezone', label: t.sections.regional.timeZone },
            { id: 'language', label: t.sections.regional.language },
            { id: 'data', label: this.app.translations.mainMenu.dataManagement, disabled: !this.app.mailDataExists },
            { id: 'clear-data', label: 'Clear Data' },
            { id: 'debug-mode', label: 'Debug Mode' }
        ];

        const totalPages = Math.ceil(menuItems.length / this.itemsPerPage);

        const animateAndChangePage = (direction, newPage) => {
            this.currentPage = newPage;
            this.render();
        };

        const contentWrapper = this.createElement('div', 'content-wrapper');
        
        const pageSelectorContainer = this.createElement('div', 'page-selector-container');
        if (totalPages > 1) {
            for (let i = 0; i < totalPages; i++) {
                const pageButton = new CanvasButton({
                    text: `${i + 1}`,
                    width: 24,
                    height: 24,
                    font: 'bold 14px "Rodin", sans-serif',
                    textColor: this.cssVars['--ds-text'],
                    backgroundColor: this.currentPage === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    hoverBackgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 12,
                    sounds: this.sounds,
                    moveOnPress: true,
                    cssVars: this.cssVars,
                    onClick: () => {
                        if (i === this.currentPage) return;
                        const direction = i > this.currentPage ? 'left' : 'right';
                        animateAndChangePage(direction, i);
                    }
                });
                pageSelectorContainer.appendChild(pageButton.element);
            }
        }
        contentWrapper.appendChild(pageSelectorContainer);

        const menuContainer = this.createElement('div', 'main-menu-container');

        this.menuButtons = [];
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        for (let i = startIndex; i < endIndex && i < menuItems.length; i++) {
            const item = menuItems[i];
            const button = new CanvasButton({
                text: item.label,
                width: 236,
                height: 40,
                font: 'bold 16px "Rodin", sans-serif',
                textColor: this.cssVars['--ds-text'],
                backgroundColor: 'rgba(255,255,255,0.1)',
                hoverBackgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                sounds: this.sounds,
                moveOnPress: true,
                cssVars: this.cssVars,
                onClick: () => {
                    if (!item.disabled) {
                        this.app.navigateTo(item.id);
                    }
                }
            });
            menuContainer.appendChild(button.element);
            this.menuButtons.push(button);
        }

        contentWrapper.appendChild(menuContainer);
        mainContainer.appendChild(contentWrapper);

        this.element.appendChild(mainContainer);
    }

    destroy() {
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
