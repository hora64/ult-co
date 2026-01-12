import { UIComponent } from "/content/common/utils/index.js";
import { CanvasButton } from "/content/common/utils/index.js";
import { Scrollbar } from "/content/common/utils/index.js";
import { RichTextRenderer } from "/content/common/utils/index.js";
export class OptionSelector extends UIComponent {
    constructor({ app, options, currentOptionValue, onOptionChange, labelText, buttonWidth = 120, buttonHeight = 40 }) {
        super();
        this.app = app;
        this.options = options;
        this.currentOptionValue = currentOptionValue;
        this.onOptionChange = onOptionChange;
        this.labelText = labelText;
        this.buttonWidth = buttonWidth;
        this.buttonHeight = buttonHeight;
        this.element = this.createElement('div', 'option-selector-wrapper');
        this.richTextRenderer = new RichTextRenderer(this.app);
        this.buttons = [];
        this.render();
    }

    render() {
        this.element.innerHTML = '';

        if (this.labelText) {
            const labelCanvas = this.createElement('canvas', 'option-label-canvas');
            labelCanvas.width = 280;
            labelCanvas.height = 30;
            const ctx = labelCanvas.getContext('2d');
            ctx.font = 'bold 20px "Rodin", sans-serif';
            ctx.fillStyle = this.app.cssVars['--ds-text'] || '#EAEAEA';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.labelText, labelCanvas.width / 2, labelCanvas.height / 2);
            this.element.appendChild(labelCanvas);
        }

        const scrollerWrapper = this.createElement('div', 'option-scroller-wrapper');
        const buttonsContainer = this.createElement('div', 'option-buttons-container');

        // Use app's theme options if available
        const buttonOptions = this.app.theme?.ui?.optionSelector || {};

        this.options.forEach(item => {
            const isSelected = item.value === this.currentOptionValue;
            const button = new CanvasButton({
                app: this.app,
                text: item.display,
                width: this.buttonWidth,
                height: this.buttonHeight,
                isActive: isSelected,
                font: 'bold 14px "Rodin", sans-serif',
                textColor: this.app.cssVars['--ds-text'],
                backgroundColor: this.app.cssVars['--ds-button-bg'],
                hoverBackgroundColor: this.app.cssVars['--ds-button-hover-bg'],
                selectedBackgroundColor: this.app.cssVars['--ds-accent-primary'],
                selectedHoverBackgroundColor: this.app.cssVars['--ds-accent-primary-dark'],
                borderRadius: 6,
                sounds: this.app.sounds,
                cssVars: this.app.cssVars,
                onClick: () => {
                    if (this.currentOptionValue !== item.value) {
                        this.currentOptionValue = item.value;
                        if (this.onOptionChange) {
                            this.onOptionChange(item.value);
                        }
                        this.buttons.forEach(b => {
                            b.button.isActive = (b.item.value === this.currentOptionValue);
                        });
                    }
                },
                ...buttonOptions
            });
            this.buttons.push({ button, item });
            buttonsContainer.appendChild(button.element);
        });

        scrollerWrapper.appendChild(buttonsContainer);
        this.element.appendChild(scrollerWrapper);

        const scrollbar = new Scrollbar(scrollerWrapper, this.app, {
            orientation: 'horizontal'
        });
        this.element.appendChild(scrollbar.element);
    }

    destroy() {
        this.element.innerHTML = '';
    }
}