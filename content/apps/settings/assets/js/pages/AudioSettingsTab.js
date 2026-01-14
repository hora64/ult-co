import { UIComponent, Toggle, Slider, SettingRow } from "/content/common/utils/index.js";

export class AudioSettingsTab extends UIComponent {
    constructor(app) {
        super();
        this.app = app;
        this.translations = app.translations;
        this.settings = app.settings;
        this.cssVars = app.cssVars;
        this.sounds = app.sounds;
        this.element = this.createElement('div', 'settings-tab audio-settings-tab');
    }

    render() {
        this.translations = this.app.translations;
        const t = this.translations;
        this.element.innerHTML = '';

        const theme = {};

        const settingsContainer = this.createElement('div', 'settings-container');

        const muteToggle = new Toggle({
            app: this.app,
            isActive: this.settings.audio.mute,
            onToggle: (newValue) => {
                this.settings.audio.mute = newValue;
                this.app.saveSettings();
                backgroundAudioToggle.update({ isDisabled: newValue });
                sfxSlider.update({ isDisabled: newValue });
                musicSlider.update({ isDisabled: newValue });
            },
            theme: theme,
            options: {
                accentColor: "#0d6efd",
                textColor: "#EAEAEA"
            }
        });

        const muteRow = new SettingRow({
            app: this.app,
            labelText: t.sections.audio.muteAll,
            controlElement: muteToggle,
            cssVars: this.cssVars,
            options: { textColor: "#EAEAEA" }
        });
        settingsContainer.appendChild(muteRow.element);

        const backgroundAudioToggle = new Toggle({
            app: this.app,
            isActive: this.settings.audio.backgroundAudio,
            isDisabled: this.settings.audio.mute,
            onToggle: (newValue) => {
                this.settings.audio.backgroundAudio = newValue;
                this.app.saveSettings();
            },
            theme: theme,
            options: {
                accentColor: "#0d6efd",
                textColor: "#EAEAEA"
            }
        });

        const backgroundAudioRow = new SettingRow({
            app: this.app,
            labelText: t.sections.audio.backgroundAudio,
            controlElement: backgroundAudioToggle,
            cssVars: this.cssVars,
            options: { textColor: "#EAEAEA" }
        });
        settingsContainer.appendChild(backgroundAudioRow.element);

        const sfxSlider = new Slider({
            app: this.app,
            value: this.settings.audio.volumeMultiplier.sfx,
            isDisabled: this.settings.audio.mute,
            labelText: t.sections.audio.sfxVolume,
            theme: theme,
            options: {
                accentColor: "#0d6efd",
                textColor: "#EAEAEA",
            },
            onUpdate: (newValue) => {
                this.settings.audio.volumeMultiplier.sfx = newValue;
                this.app.saveSettings();
                this.app._applyAudioSettings();
            }
        });

        const sfxRow = new SettingRow({
            app: this.app,
            labelText: t.sections.audio.sfxVolume,
            controlElement: sfxSlider,
            cssVars: this.cssVars
        });
        settingsContainer.appendChild(sfxRow.element);

        const musicSlider = new Slider({
            app: this.app,
            value: this.settings.audio.volumeMultiplier.music,
            isDisabled: this.settings.audio.mute,
            labelText: t.sections.audio.musicVolume,
            theme: theme,
            options: {
                accentColor: "#0d6efd",
                textColor: "#EAEAEA",
            },
            onUpdate: (newValue) => {
                this.settings.audio.volumeMultiplier.music = newValue;
                this.app.saveSettings();
            }
        });

        const musicRow = new SettingRow({
            app: this.app,
            labelText: t.sections.audio.musicVolume,
            controlElement: musicSlider,
            cssVars: this.cssVars,
            options: { textColor: "#EAEAEA" }
        });
        settingsContainer.appendChild(musicRow.element);

        this.element.appendChild(settingsContainer);
    }

    destroy() {
        // Child components are destroyed when innerHTML is cleared.
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}
