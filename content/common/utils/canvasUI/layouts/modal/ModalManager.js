/**
 * @file Defines the ModalManager class, a controller for managing and displaying various types of modals.
 * It handles the lifecycle of modals, including their creation, display, and dismissal.
 * It ensures that only one modal is active at a time and provides a consistent API for showing different modal types.
 */

import { UIComponent } from "../../../index.js";
import { DialogModal } from "./DialogModal.js";

/**
 * Manages the display and lifecycle of modal dialogs within the application.
 * It acts as a centralized controller, abstracting the details of modal creation and management
 * from the rest of the application.
 */
export class ModalManager extends UIComponent {
    /**
     * Constructs a new ModalManager instance.
     * @param {HTMLElement} containerElement - The DOM element that will contain the modals and overlay.
     * @param {object} options - Configuration options for the modal manager.
     * @param {object} options.translations - An object containing translated strings for UI elements.
     * @param {object} options.cssVars - An object with CSS variable values for default styling.
     * @param {object} options.sounds - An object containing sound instances for UI feedback.
     * @param {object} options.appInstance - A reference to the main application instance.
     * @param {object} [options.theme] - The current theme object.
     * @param {object} [options.options={}] - Default options to apply to all modals created by this manager.
     */
    constructor(containerElement, { translations, cssVars, sounds, appInstance, theme, options = {} }) {
        super();
        this.container = containerElement;
        this.translations = translations;
        this.cssVars = cssVars;
        this.sounds = sounds;
        this.appInstance = appInstance;
        this.theme = theme || {}; // <-- Changed line
        this.currentModal = null;
        this.isActive = false;
        this.options = options;

        this.setupContainer();
    }

    /**
     * Updates the button options for the currently active modal.
     * @param {object} buttonOptions - New options to apply to the modal's buttons.
     */
    setButtonOptions(buttonOptions) {
        if (this.currentModal) {
            this.currentModal.setButtonOptions(buttonOptions);
        }
    }

    /**
     * Sets up the modal container, adding a click listener to the overlay for dismissing modals.
     */
    setupContainer() {
        this.container.addEventListener('click', (e) => {
            // If the click is on the container itself (the overlay), hide the modal.
            if (e.target === this.container) {
                this.hideModal();
            }
        });
    }

    /**
     * Shows a simple informational modal with a single confirm button.
     * @param {object} props - Properties for the info modal.
     * @param {string} props.title - The title of the modal.
     * @param {string} props.message - The message to display.
     * @param {Function} [props.onConfirm] - Callback for when the confirm button is clicked.
     */
    showInfoModal({ title, message, onConfirm }) {
        this.showModal({
            title,
            message,
            onConfirm,
            showCancel: false,
            onCancel: () => this.hideModal()
        });
    }

    /**
     * Shows a modal with a dropdown list of options for the user to select from.
     * @param {object} props - Properties for the dropdown modal.
     * @param {string} props.title - The title of the modal.
     * @param {Array<object>} props.options - The array of options to display.
     * @param {*} props.currentValue - The initially selected value.
     * @param {string} props.modalId - A unique ID for the modal type.
     * @param {Function} props.onSelect - Callback executed with the selected value when confirmed.
     */
    showDropdownModal({ title, options, currentValue, modalId, onSelect }) {
        this.showModal({
            title,
            options,
            currentValue,
            modalId,
            onSelect,
            onCancel: () => this.hideModal()
        });
    }

    /**
     * Shows a confirmation modal with confirm and cancel buttons.
     * @param {object} props - Properties for the confirmation modal.
     * @param {string} props.title - The title of the modal.
     * @param {string} props.message - The confirmation message.
     * @param {Function} props.onConfirm - Callback for when the confirm button is clicked.
     */
    showConfirmationModal({ title, message, onConfirm }) {
        this.showModal({
            title,
            message,
            onConfirm,
            onCancel: () => this.hideModal()
        });
    }

    /**
     * Shows a simple, auto-closing modal to confirm a setting has been applied.
     * @param {object} props - Properties for the setting applied modal.
     * @param {string} props.message - The message to display.
     * @param {Function} [props.onConfirm] - Callback executed after the modal closes.
     * @param {number} [props.autoClose=2000] - Duration before auto-closing.
     * @param {boolean} [props.alignTop=false] - Whether to align the text to the top.
     */
    showSettingAppliedModal({ message, onConfirm, autoClose = 2000, alignTop = false }) {
        this.showModal({
            message: message || 'Setting Applied',
            showTitle: false,
            showCancel: false,
            showConfirm: false,
            autoClose: autoClose,
            onConfirm: onConfirm,
            alignTop: alignTop,
            modalOptions: {
                dropShadow: 'none'
            }
        });
    }

    /**
     * The core method for creating and displaying a modal. It instantiates a `DialogModal`
     * and manages its presentation and lifecycle.
     * @param {object} props - The properties to pass to the `DialogModal` constructor.
     */
    showModal(props) {
        this.isActive = true;
        if (this.sounds?.inputFocus) this.sounds.inputFocus.play();

        // Clear any previous modal and activate the container
        this.container.innerHTML = '';
        this.container.classList.add('active');

        // Create a new DialogModal, merging theme, manager, and call-specific options
        this.currentModal = new DialogModal({
            ...props,
            translations: this.translations,
            cssVars: this.cssVars,
            sounds: this.sounds,
            appInstance: this.appInstance,
            theme: this.theme,
            buttonOptions: this.theme.ui?.button || {},
            modalOptions: { ...(this.theme.ui?.modal || {}), ...this.options, ...props.modalOptions },
            // Wrap callbacks to ensure hideModal is called after the original callback
            onSelect: (value) => {
                if (props.onSelect) props.onSelect(value);
                this.hideModal();
            },
            onConfirm: () => {
                if (props.onConfirm) props.onConfirm();
                this.hideModal();
            },
            onCancel: () => {
                if (props.onCancel) props.onCancel();
                this.hideModal();
            }
        });

        // Animate the modal in
        this.currentModal.element.style.opacity = '0';
        this.currentModal.element.style.transition = 'opacity 0.2s ease-in';
        this.container.appendChild(this.currentModal.element);

        requestAnimationFrame(() => {
            this.currentModal.element.style.opacity = '1';
        });
    }

    /**
     * Shows a simple, temporary notification message that disappears after a set duration.
     * @param {string} message - The notification message to display.
     * @param {number} [duration=2000] - The duration in milliseconds before the notification auto-hides.
     */
    showNotificationModal(message, duration = 2000) {
        this.isActive = true;
        this.container.innerHTML = '';
        this.container.classList.add('active');

        const notificationElement = this.createElement('div', 'notification-modal');
        notificationElement.textContent = message;

        this.container.appendChild(notificationElement);

        setTimeout(() => {
            this.hideModal();
        }, duration);
    }

    /**
     * Hides the currently active modal with a fade-out animation.
     */
    hideModal() {
        if (this.sounds?.inputBlur) this.sounds.inputBlur.play();
        this.isActive = false;

        // Animate modal element out
        if (this.currentModal && this.currentModal.element) {
            this.currentModal.element.style.transition = 'opacity 0.2s ease-out';
            this.currentModal.element.style.opacity = '0';
        }
        // Animate overlay background out
        this.container.style.transition = 'background-color 0.2s ease-out';
        this.container.style.backgroundColor = 'transparent';

        // Clean up the DOM after the animation completes
        setTimeout(() => {
            this.currentModal = null;
            this.container.classList.remove('active');
            this.container.innerHTML = '';
            // Reset background color for the next modal
            this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }, 200);
    }

    /**
     * Updates the theme for the modal manager and the currently active modal.
     * @param {object} theme - The new theme object to apply.
     */
    updateTheme(theme) {
        this.theme = theme;
        if (this.currentModal) {
            // If a modal is active, update its theme and button options dynamically
            this.currentModal.updateTheme(theme);
            this.currentModal.setButtonOptions(theme.ui?.button || {});
        }
    }
}
