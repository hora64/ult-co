import { UIComponent, OptionSelector } from "/content/common/utils/index.js";

export class LanguageSettingsTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.element = this.createElement('div', 'settings-tab language-settings-tab');
        this.tempLanguage = this.app.settings.language;
        this.languageMap = [{
            value: 'en-US',
            display: 'English'
        }, {
            value: 'es-ES',
            display: 'Español'
        }, {
            value: 'fr-FR',
            display: 'Français'
        }, {
            value: 'de-DE',
            display: 'Deutsch'
        }, {
            value: 'ja-JP',
            display: '日本語'
        }, {
            value: 'ko-KR',
            display: '한국어'
        }, {
            value: 'pt-BR',
            display: 'Português'
        }, {
            value: 'pi-RR',
            display: 'Pirate'
        }, {
            value: 'ma-RS',
            display: 'Martian'
        }, {
            value: 'dr-AC',
            display: 'Clanker'
        }, {
            value: 'uw-UU',
            display: 'UwU Speak'
        }, {
            value: 'le-ET',
            display: '1337 Sp34k'
        }, {
            value: 'va-LY',
            display: 'Valley Girl'
        }];
    }

    render() {
        this.element.innerHTML = '';

        const theme = this.app.theme || {};
        const optionSelectorOptions = theme.ui?.optionSelector || {};

        const optionSelector = new OptionSelector({
            app: this.app,
            options: this.languageMap,
            currentOptionValue: this.tempLanguage,
            onOptionChange: (newValue) => {
                this.tempLanguage = newValue;
                this.updateConfirmButton();
            },
            labelText: this.app.translations.sections.regional.language,
            theme: theme,
            ...optionSelectorOptions
        });
        this.element.appendChild(optionSelector.element);

        this.updateConfirmButton();
    }

    updateConfirmButton() {
        this.app.emit('settingChanged', this.app.settings.language !== this.tempLanguage);
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
