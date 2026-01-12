import { UIComponent, OptionSelector } from "/content/common/utils/index.js";

export class TimeZoneSettingsTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.element = this.createElement('div', 'settings-tab timezone-settings-tab');
        this.tempTimeZone = this.app.settings.timeZone;
        this.timeZoneOptions = [
            { value: 'Etc/GMT+12', display: 'UTC-12' }, { value: 'Pacific/Midway', display: 'SST' },
            { value: 'Pacific/Honolulu', display: 'HST' }, { value: 'America/Anchorage', display: 'AKST' },
            { value: 'America/Los_Angeles', display: 'PST' }, { value: 'America/Denver', display: 'MST' },
            { value: 'America/Chicago', display: 'CST' }, { value: 'America/New_York', display: 'EST' },
            { value: 'America/Caracas', display: 'VET' }, { value: 'America/Argentina/Buenos_Aires', display: 'ART' },
            { value: 'Atlantic/South_Georgia', display: 'GST' }, { value: 'Atlantic/Azores', display: 'AZOT' },
            { value: 'Europe/London', display: 'GMT' }, { value: 'Europe/Berlin', display: 'CET' },
            { value: 'Europe/Helsinki', display: 'EET' }, { value: 'Europe/Moscow', display: 'MSK' },
            { value: 'Asia/Dubai', display: 'GST' }, { value: 'Asia/Karachi', display: 'PKT' },
            { value: 'Asia/Kolkata', display: 'IST' }, { value: 'Asia/Dhaka', display: 'BST' },
            { value: 'Asia/Bangkok', display: 'ICT' }, { value: 'Asia/Singapore', display: 'SGT' },
            { value: 'Asia/Tokyo', display: 'JST' }, { value: 'Australia/Sydney', display: 'AEST' }
        ];
    }

    render() {
        this.element.innerHTML = '';

        const theme = this.app.theme || {};
        const optionSelectorOptions = theme.ui?.optionSelector || {};

        const optionSelector = new OptionSelector({
            app: this.app,
            options: this.timeZoneOptions,
            currentOptionValue: this.tempTimeZone,
            onOptionChange: (newValue) => {
                this.tempTimeZone = newValue;
                this.updateConfirmButton();
            },
            labelText: this.app.translations.sections.regional.timeZone,
            buttonWidth: 80,
            buttonHeight: 32,
            theme: theme,
            ...optionSelectorOptions
        });
        this.element.appendChild(optionSelector.element);

        this.updateConfirmButton();
    }

    updateConfirmButton() {
        this.app.emit('settingChanged', this.app.settings.timeZone !== this.tempTimeZone);
    }

    destroy() {
        // The confirm button is in the footer, which is cleared by the main app.
        // We only need to worry about cleaning up the main element.
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
        this.confirmButton = null; // Release reference
    }
}
