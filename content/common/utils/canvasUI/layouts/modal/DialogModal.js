/**
 * @file Defines the DialogModal class, a versatile UI component for creating various modal dialogs.
 * This component can render confirmation modals with titles and messages, as well as dropdown-style modals for selections.
 * It leverages the Canvas API for rendering, allowing for rich, themeable, and animated dialogs.
 */

import { UIComponent, CanvasButton, Scrollbar } from "../../../index.js";
import { TextCanvasMeasurer } from "../../../index.js";

/**
 * Represents a dialog modal that can be used for confirmations, information display, or selection from a list of options.
 * The modal's appearance and behavior are highly customizable through constructor options.
 */
export class DialogModal extends UIComponent {
    /**
     * Constructs a new DialogModal instance.
     * @param {object} options - The configuration options for the modal.
     * @param {string} [options.title] - The title to be displayed at the top of the modal.
     * @param {string} [options.message] - The main message or content of the modal.
     * @param {Array<object>} [options.options] - An array of options for dropdown-style modals. If provided, `renderDropdown` is used.
     * @param {*} [options.currentValue] - The currently selected value, used in dropdown modals.
     * @param {Function} [options.onConfirm] - Callback function executed when the confirm button is clicked.
     * @param {Function} [options.onSelect] - Callback function for dropdown modals, executed when the confirm button is clicked.
     * @param {Function} [options.onCancel] - Callback function executed when the cancel button is clicked or the modal is closed.
     * @param {string} [options.modalId] - A unique identifier for the modal, used for styling and specific logic (e.g., 'language', 'timezone').
     * @param {object} options.translations - An object containing translated strings for UI elements.
     * @param {object} options.cssVars - An object with CSS variable values for default styling.
     * @param {object} options.sounds - An object containing sound instances for UI feedback.
     * @param {object} options.appInstance - A reference to the main application instance.
     * @param {object} options.theme - The current theme object, containing styling information.
     * @param {object} [options.buttonOptions={}] - Custom options to pass to the CanvasButton components.
     * @param {object} [options.modalOptions={}] - Custom options for the modal's appearance (e.g., colors, dropShadow).
     * @param {boolean} [options.showCancel=true] - Whether to display the cancel button.
     * @param {number|null} [options.autoClose=null] - If set, the duration in milliseconds after which the modal automatically cancels.
     * @param {string} [options.confirmText] - Custom text for the confirm button.
     * @param {string} [options.cancelText] - Custom text for the cancel button.
     * @param {boolean} [options.alignTop=false] - Whether to align the text to the top.
     * @param {number} [options.dialogWidth=240] - The width of the dialog.
     * @param {number} [options.dialogHeight=170] - The height of the dialog.
     * @param {number} [options.minWidth=240] - The minimum width of the dialog.
     * @param {number} [options.minHeight=170] - The minimum height of the dialog.
     * @param {number} [options.borderRadius=12] - The border radius of the dialog.
     * @param {number} [options.titleHeight=40] - The height of the title area.
     * @param {number} [options.messageMaxWidth=200] - The maximum width of the message text.
     * @param {number} [options.buttonAreaHeight=60] - The height of the button area.
     * @param {number} [options.buttonHeight=42] - The height of the buttons.
     * @param {string} [options.fontMessage='14px "Rodin", sans-serif'] - The font for the message text.
     * @param {string} [options.fontTitle='bold 16px "Rodin", sans-serif'] - The font for the title text.
     * @param {string} [options.fontButton='bold 14px "Rodin", sans-serif'] - The font for the button text.
     */
    constructor({
        title,
        message,
        customContent,
        options,
        currentValue,
        onConfirm,
        onSelect,
        onCancel,
        modalId,
        translations,
        cssVars,
        sounds,
        appInstance,
        theme,
        buttonOptions = {},
        modalOptions = {},
        showCancel = true,
        showTitle = true,
        showConfirm = true,
        autoClose = null,
        confirmText,
        cancelText,
        alignTop = false,
        dialogWidth = 240,
        dialogHeight = 170,
        minWidth = 240,
        minHeight = 170,
        borderRadius = 12,
        titleHeight = 40,
        messageMaxWidth = 200,
        buttonAreaHeight = 60,
        buttonHeight = 42,
        fontMessage = '14px "Rodin", sans-serif',
        fontTitle = 'bold 16px "Rodin", sans-serif',
        fontButton = 'bold 14px "Rodin", sans-serif'
    }) {
        super();
        this.title = title;
        this.message = message;
        this.customContent = customContent;
        this.options = options;
        this.currentValue = currentValue;
        this.onConfirm = onConfirm;
        this.onSelect = onSelect;
        this.onCancel = onCancel;
        this.modalId = modalId;
        this.translations = translations;
        this.cssVars = cssVars;
        this.sounds = sounds;
        this.appInstance = appInstance;
        this.theme = theme;
        this.measurer = new TextCanvasMeasurer();
        this.buttonOptions = buttonOptions;
        this.modalOptions = modalOptions;
        this.tempValue = currentValue;
        this.showCancel = showCancel;
        this.showTitle = showTitle;
        this.showConfirm = showConfirm;
        this.autoClose = autoClose;
        this.confirmText = confirmText;
        this.cancelText = cancelText;
        this.buttons = modalOptions.buttons;
        this.alignTop = alignTop;

        const calculatedWidth = this.message ? this._measureTextHeight(this.message, fontMessage, messageMaxWidth) > 20 ? dialogWidth : 200 : minWidth;
        const calculatedHeight = this.message ? 120 + this._measureTextHeight(this.message, fontMessage, messageMaxWidth) : minHeight;

        this.dialogWidth = modalOptions.width || Math.max(dialogWidth !== 240 ? dialogWidth : calculatedWidth, minWidth);
        this.dialogHeight = modalOptions.height || Math.max(dialogHeight !== 170 ? dialogHeight : calculatedHeight, minHeight);
        this.borderRadius = borderRadius;
        this.titleHeight = titleHeight;
        this.messageMaxWidth = messageMaxWidth;
        this.buttonAreaHeight = buttonAreaHeight;
        this.buttonHeight = buttonHeight;
        this.fontMessage = fontMessage;
        this.fontTitle = fontTitle;
        this.fontButton = fontButton;

        // Initial render of the modal element.
        this.element = this.render();

        // If autoClose is configured, set a timeout to trigger the onCancel callback.
        if (this.autoClose) {
            setTimeout(() => {
                if (this.onCancel) {
                    this.onCancel();
                }
            }, this.autoClose);
        }
    }

    /**
     * Updates the button options and re-renders the modal.
     * @param {object} buttonOptions - New options to apply to the buttons.
     */
    setButtonOptions(buttonOptions) {
        this.buttonOptions = buttonOptions;
        this.element = this.render();
    }

    /**
     * Main render method. Determines whether to render a confirmation or dropdown modal
     * based on the presence of the `options` property.
     * @returns {HTMLElement} The root element of the rendered modal.
     */
    render() {
        if (this.options) {
            return this.renderDropdown();
        }
        return this.renderConfirmation();
    }

    /**
     * Renders a confirmation-style modal.
     * This modal typically includes a title, a message, and confirm/cancel buttons.
     * @returns {HTMLElement} The container element for the confirmation modal.
     */
    renderConfirmation() {
        // --- Configuration and Constants ---
        const DIALOG_WIDTH = this.dialogWidth;
        const DIALOG_HEIGHT = this.dialogHeight;
        const BORDER_RADIUS = this.borderRadius;
        const TITLE_HEIGHT = this.titleHeight;
        const MESSAGE_MAX_WIDTH = this.messageMaxWidth;
        const BUTTON_AREA_HEIGHT = this.buttonAreaHeight;
        const BUTTON_HEIGHT = this.buttonHeight;
        const FONT_MESSAGE = this.fontMessage;
        const FONT_TITLE = this.fontTitle;
        const FONT_BUTTON = this.fontButton;

        // --- Layout Calculation ---
        const hasTitle = this.showTitle && this.title && this.title.trim() !== '';
        const titleHeight = hasTitle ? TITLE_HEIGHT : 0;
        const messagePadding = hasTitle ? 20 : 40;
        let messageY = titleHeight + messagePadding;
        let messageBaseline = 'top';

        if (!hasTitle && (this.autoClose || this.alignTop)) {
            messageY = DIALOG_HEIGHT / 2;
            messageBaseline = 'middle';
        }


        // --- Element Creation ---
        const modalContainer = this.createElement('div', 'modal-dialog-container');

        // --- Main Canvas Drawing ---
        const modalDialogCanvas = this.createCanvas(DIALOG_WIDTH, DIALOG_HEIGHT, 'modal-dialog-wrapper');
        const ctx = modalDialogCanvas.getContext('2d');

        // Draw the main modal background
        ctx.fillStyle = this.modalOptions.backgroundColor || this.cssVars['--ds-bg-modal'];
        ctx.beginPath();
        ctx.roundRect(0, 0, DIALOG_WIDTH, DIALOG_HEIGHT, BORDER_RADIUS);
        ctx.fill();

        // Draw modal outline if specified
        if (this.modalOptions.outline) {
            ctx.strokeStyle = this.modalOptions.outline.color || 'rgba(255,255,255,0.2)';
            ctx.lineWidth = this.modalOptions.outline.width || 1;
            ctx.stroke();
        }

        // Draw a separate background for the message area if specified
        if (this.modalOptions.messageBackgroundColor) {
            ctx.fillStyle = this.modalOptions.messageBackgroundColor;
            ctx.fillRect(0, titleHeight, DIALOG_WIDTH, DIALOG_HEIGHT - titleHeight - BUTTON_AREA_HEIGHT);
        }

        // --- Title Rendering ---
        if (hasTitle) {
            // Draw title background with rounded top corners
            ctx.fillStyle = this.modalOptions.titleBackgroundColor || 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.moveTo(0, titleHeight);
            ctx.lineTo(0, BORDER_RADIUS);
            ctx.quadraticCurveTo(0, 0, BORDER_RADIUS, 0);
            ctx.lineTo(DIALOG_WIDTH - BORDER_RADIUS, 0);
            ctx.quadraticCurveTo(DIALOG_WIDTH, 0, DIALOG_WIDTH, BORDER_RADIUS);
            ctx.lineTo(DIALOG_WIDTH, titleHeight);
            ctx.closePath();
            ctx.fill();

            // Draw title text
            this._drawTextOnCanvas(
                ctx, this.title, DIALOG_WIDTH / 2, titleHeight / 2, FONT_TITLE,
                this.modalOptions.textColor || this.cssVars['--ds-text'], 'center', 'middle'
            );
        }

        // --- Custom Content or Message Rendering ---
        if (this.customContent) {
            // Insert custom HTML/canvas content
            const contentWrapper = this.createElement('div', 'modal-custom-content');
            contentWrapper.style.cssText = `
                position: absolute;
                top: ${titleHeight}px;
                left: 0;
                width: ${DIALOG_WIDTH}px;
                height: ${DIALOG_HEIGHT - titleHeight - BUTTON_AREA_HEIGHT}px;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: auto;
            `;
            if (this.modalOptions.maxContentHeight) {
                contentWrapper.style.maxHeight = `${this.modalOptions.maxContentHeight}px`;
            }
            contentWrapper.appendChild(this.customContent);
            modalContainer.appendChild(contentWrapper);
        } else if (this.message) {
            // --- Message Rendering ---
            this._drawTextOnCanvas(
                ctx, this.message, DIALOG_WIDTH / 2, messageY, FONT_MESSAGE,
                this.modalOptions.textColor || this.cssVars['--ds-text'], 'center', messageBaseline, MESSAGE_MAX_WIDTH
            );
        }

        // --- Button Creation ---
        const buttonContainer = this.createElement('div', 'modal-buttons');

        if (this.buttons && this.buttons.length > 0) {
            const totalButtons = this.buttons.length;
            const buttonWidth = (DIALOG_WIDTH - 10 * (totalButtons + 1)) / totalButtons;

            this.buttons.forEach((buttonDef, index) => {
                let borderRadius = 6;
                if (totalButtons > 1) {
                    if (index === 0) { // First button
                        borderRadius = [0, 0, 0, BORDER_RADIUS];
                    }
                    if (index === totalButtons - 1) { // Last button
                        borderRadius = [0, 0, BORDER_RADIUS, 0];
                    }
                } else { // Single button
                    borderRadius = [0, 0, BORDER_RADIUS, BORDER_RADIUS];
                }

                const button = new CanvasButton({
                    text: buttonDef.text,
                    width: buttonWidth,
                    height: BUTTON_HEIGHT,
                    backgroundColor: buttonDef.backgroundColor || 'transparent',
                    hoverBackgroundColor: this.measurer.adjustColor(buttonDef.backgroundColor || this.cssVars['--ds-accent-red'] || '#D9534F', 20),
                    textColor: buttonDef.textColor || this.modalOptions.textColor || this.cssVars['--ds-text'],
                    font: FONT_BUTTON,
                    sounds: this.sounds,
                    onClick: () => {
                        if (buttonDef.action) buttonDef.action();
                    },
                    ...this.buttonOptions,
                    borderRadius: borderRadius
                });
                buttonContainer.appendChild(button.element);
            });
        } else {
            const showConfirmButton = this.showConfirm && !this.autoClose;

            if (showConfirmButton) {
                const confirmButton = new CanvasButton({
                    text: this.confirmText || this.translations.modals.confirm,
                    width: this.showCancel ? 110 : DIALOG_WIDTH,
                    height: BUTTON_HEIGHT,
                    backgroundColor: this.modalOptions.confirmBackgroundColor || this.modalOptions.accentColor || this.cssVars['--ds-accent-red'] || '#D9534F',
                    hoverBackgroundColor: this.measurer.adjustColor(this.modalOptions.confirmBackgroundColor || this.modalOptions.accentColor || this.cssVars['--ds-accent-red'] || '#D9534F', 20),
                    textColor: this.modalOptions.confirmTextColor || 'white',
                    font: FONT_BUTTON,
                    sounds: this.sounds,
                    onClick: () => {
                        if (this.sounds?.filterApply) this.sounds.filterApply.play();
                        if (this.onConfirm) this.onConfirm();
                    },
                    ...this.buttonOptions,
                    borderRadius: this.showCancel ? 6 : [0, 0, BORDER_RADIUS, BORDER_RADIUS]
                });
                buttonContainer.appendChild(confirmButton.element);
            }

            if (this.showCancel) {
                const cancelButton = new CanvasButton({
                    text: this.cancelText || this.translations.modals.cancel,
                    width: 110,
                    height: BUTTON_HEIGHT,
                    backgroundColor: this.modalOptions.cancelBackgroundColor || 'transparent',
                    textColor: this.modalOptions.cancelTextColor || this.modalOptions.textColor || this.cssVars['--ds-text'],
                    sounds: this.sounds,
                    onClick: () => {
                        if (this.onCancel) this.onCancel();
                    },
                    ...this.buttonOptions,
                    borderRadius: 6
                });
                buttonContainer.appendChild(cancelButton.element);
            }
        }

        // --- Final Assembly ---
        modalContainer.appendChild(modalDialogCanvas);
        modalContainer.appendChild(buttonContainer);

        return modalContainer;
    }


    /**
     * Renders a dropdown-style modal for selecting from a list of options.
     * @returns {HTMLElement} The container element for the dropdown modal.
     */
    renderDropdown() {
        // --- Element Creation ---
        const dropdownDialog = this.createElement('div', 'dropdown-dialog');
        if (this.modalId) {
            dropdownDialog.classList.add(`modal-type-${this.modalId}`);
        }

        // Special case for 'language' modal to use a custom canvas background
        if (this.modalId === 'language') {
            const bgCanvas = this.createElement('canvas');
            bgCanvas.style.position = 'absolute';
            bgCanvas.style.top = '0';
            bgCanvas.style.left = '0';
            bgCanvas.style.zIndex = '-1';
            dropdownDialog.appendChild(bgCanvas);

            dropdownDialog.style.background = 'transparent';
            dropdownDialog.style.border = 'none';

            // Draw the background on the next animation frame to ensure dimensions are correct
            requestAnimationFrame(() => {
                if (!dropdownDialog.offsetParent) return;
                bgCanvas.width = dropdownDialog.offsetWidth;
                bgCanvas.height = dropdownDialog.offsetHeight;
                const bgCtx = bgCanvas.getContext('2d');
                bgCtx.fillStyle = this.modalOptions.backgroundColor || this.cssVars['--ds-bg-modal'];
                bgCtx.strokeStyle = this.modalOptions.borderColor || '#555';
                bgCtx.lineWidth = 1;
                bgCtx.beginPath();
                bgCtx.roundRect(0.5, 0.5, bgCanvas.width - 1, bgCanvas.height - 1, 8);
                bgCtx.fill();
                bgCtx.stroke();
            });
        }

        // --- Header ---
        const headerCanvas = this.createCanvas(260, 40, 'modal-header-canvas');
        const headerCtx = headerCanvas.getContext('2d');
        this._drawTextOnCanvas(headerCtx, this.title, headerCanvas.width / 2, 20,
            'bold 16px "Rodin", sans-serif', this.modalOptions.textColor || this.cssVars['--ds-text'], 'center', 'middle');
        dropdownDialog.appendChild(headerCanvas);

        // --- Options List and Scrollbar ---
        const listWrapper = this.createElement('div', 'options-list-wrapper');
        const optionsList = this.createElement('div', 'options-list');
        const dropdownScrollbar = new Scrollbar(optionsList, this.appInstance);

        listWrapper.appendChild(optionsList);
        listWrapper.appendChild(dropdownScrollbar.element);
        // Add fade effects for the scrollable area
        listWrapper.appendChild(this.createElement('div', 'modal-top-fade'));
        listWrapper.appendChild(this.createElement('div', 'modal-bottom-fade'));
        dropdownDialog.appendChild(listWrapper);

        // Render the actual option buttons into the list
        this.renderOptions(optionsList, dropdownScrollbar);

        // --- Footer Buttons ---
        const buttonContainer = this.createElement('div', 'modal-buttons dropdown-buttons');

        const confirmButton = new CanvasButton({
            text: this.confirmText || this.translations.modals.confirm,
            width: 110,
            height: 42,
            backgroundColor: this.modalOptions.confirmBackgroundColor || this.modalOptions.accentColor || this.cssVars['--ds-accent-blue'],
            hoverBackgroundColor: this._adjustColor(this.modalOptions.confirmBackgroundColor || this.modalOptions.accentColor || this.cssVars['--ds-accent-blue'], 20),
            textColor: this.modalOptions.confirmTextColor || 'white',
            font: 'bold 14px "Rodin", sans-serif',
            sounds: this.sounds,
            onClick: () => {
                if (this.onSelect) this.onSelect(this.tempValue);
            },
            ...this.buttonOptions
        });

        const cancelButton = new CanvasButton({
            text: this.cancelText || this.translations.modals.cancel,
            width: 110,
            height: 42,
            backgroundColor: this.modalOptions.cancelBackgroundColor || 'transparent',
            textColor: this.modalOptions.cancelTextColor || this.modalOptions.textColor || this(cssVars['--ds-text']),
            sounds: this.sounds,
            onClick: () => {
                if (this.onCancel) this.onCancel();
            },
            ...this.buttonOptions
        });

        buttonContainer.appendChild(cancelButton.element);
        buttonContainer.appendChild(confirmButton.element);
        dropdownDialog.appendChild(buttonContainer);

        return dropdownDialog;
    }

    /**
     * Renders the individual option buttons for a dropdown modal.
     * It clears the list and re-creates buttons, highlighting the currently selected one.
     * @param {HTMLElement} optionsList - The container element for the option buttons.
     * @param {Scrollbar} dropdownScrollbar - The scrollbar instance to update after rendering.
     */
    renderOptions(optionsList, dropdownScrollbar) {
        optionsList.innerHTML = '';
        this.optionButtons = [];
        let buttonWidth;
        let font = '14px "Rodin", sans-serif';

        // Adjust button width and font based on the modal type
        if (this.modalId === 'timezone') {
            buttonWidth = 48;
        } else if (this.modalId === 'language') {
            buttonWidth = 80;
            font = '13px "Rodin", sans-serif';
        } else {
            buttonWidth = 80;
        }

        // Create a CanvasButton for each option
        this.options.forEach(option => {
            const isSelected = option.value === this.tempValue;
            const optionButton = new CanvasButton({
                text: option.display,
                width: buttonWidth,
                height: 32,
                font: font,
                textAlign: 'center',
                isActive: isSelected,
                textColor: this.modalOptions.textColor || this.cssVars['--ds-text'],
                backgroundColor: 'transparent',
                hoverBackgroundColor: 'rgba(255,255,255,0.1)',
                selectedBackgroundColor: this.modalOptions.accentColor || this.cssVars['--ds-accent-blue'],
                sounds: this.sounds,
                onClick: () => {
                    const currentScrollTop = optionsList.scrollTop;
                    this.tempValue = option.value;
                    this.optionButtons.forEach(btn => {
                        btn.button.isActive = (btn.option.value === this.tempValue);
                    });
                    optionsList.scrollTop = currentScrollTop;
                },
                ...this.buttonOptions
            });
            this.optionButtons.push({ button: optionButton, option: option });
            optionsList.appendChild(optionButton.element);
        });
        // Update the scrollbar to reflect the new content
        dropdownScrollbar.update();
    }

    /**
     * Measures the wrapped height of a given text string.
     * @param {string} text - The text to measure.
     * @param {string} font - The CSS font string.
     * @param {number} maxWidth - The maximum width the text can occupy before wrapping.
     * @returns {number} The estimated height of the text.
     */
    _measureTextHeight(text, font, maxWidth) {
        return this.measurer.estimateWrappedTextHeight(text, font, maxWidth);
    }

    /**
     * Adjusts a hex color by a given amount.
     * @param {string} hex - The hex color string (e.g., '#RRGGBB').
     * @param {number} amount - The amount to adjust each color component by (can be negative).
     * @returns {string} The new hex color string.
     */
    _adjustColor(hex, amount) {
        return '#' + hex.replace(/^#/, '').replace(/../g, color =>
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
        );
    }

    /**
     * A utility function to draw wrapped text on a canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} text - The text to draw.
     * @param {number} x - The x-coordinate to start drawing.
     * @param {number} y - The y-coordinate to start drawing.
     * @param {string} font - The CSS font string.
     * @param {string} color - The CSS color string.
     * @param {string} [textAlign='left'] - The text alignment.
     * @param {string} [textBaseline='alphabetic'] - The text baseline.
     * @param {number} [maxWidth] - The maximum width for the text before wrapping.
     */
    _drawTextOnCanvas(ctx, text, x, y, font, color, textAlign = 'left', textBaseline = 'alphabetic', maxWidth) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        if (maxWidth) {
            // Handle text wrapping
            const isJapanese = this.appInstance?.settings.language === 'ja-JP';
            const units = isJapanese ? text.split('') : text.split(' '); // Split by character for Japanese, by word otherwise
            let line = '';
            const lineHeight = parseInt(font, 10) * 1.4;
            let currentY = y;

            for (let n = 0; n < units.length; n++) {
                const unit = units[n];
                const separator = (isJapanese || line === '') ? '' : ' ';
                let testLine = line + separator + unit;
                let metrics = ctx.measureText(testLine);

                // If the line exceeds max width, draw the previous line and start a new one
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, x, currentY);
                    line = unit;
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            // Draw the last line
            ctx.fillText(line, x, currentY);
        } else {
            // If no maxWidth, draw the text in a single line
            ctx.fillText(text, x, y);
        }
    }
}
