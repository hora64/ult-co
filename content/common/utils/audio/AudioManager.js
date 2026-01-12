
export class AudioManager {
    constructor(app) {
        this.app = app;
        this.sounds = {};
        this.audioSettings = {
            volumeMultiplier: {
                sfx: 1.0,
                music: 1.0,
            },
            backgroundAudio: true,
            mute: false,
        };
    }

    async initialize(configPath) {
        this.loadAudioSettings();
        await this._initializeSounds(configPath);
        this._applyAudioSettings();
    }

    loadAudioSettings() {
        try {
            const storedSettings = localStorage.getItem("audioSettings");
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                this.audioSettings = {
                    ...this.audioSettings,
                    ...parsedSettings,
                };
            }
        } catch (e) {
            console.error("Failed to load audio settings from localStorage:", e);
            this.audioSettings = {}; // Reset to default if corrupted
        }
    }

    saveAudioSettings() {
        try {
            localStorage.setItem("audioSettings", JSON.stringify(this.audioSettings));
        } catch (e) {
            console.error("Failed to save audio settings to localStorage:", e);
        }
    }

    async _initializeSounds(configPath) {
        try {
            const response = await fetch(configPath);
            const audioConfig = await response.json();

            for (const key in audioConfig) {
                const config = audioConfig[key];
                const volume = this._getVolume(config.type, config.volume);
                this.sounds[key] = new Howl({
                    ...config,
                    volume: volume,
                });
            }
        } catch (error) {
            console.error("Failed to load audio configuration:", error);
        }
    }

    _getVolume(type, baseVolume) {
        if (type === 'sfx') {
            return baseVolume * this.audioSettings.volumeMultiplier.sfx;
        }
        if (type === 'music') {
            return baseVolume * this.audioSettings.volumeMultiplier.music;
        }
        return baseVolume;
    }

    _applyAudioSettings() {
        Howler.mute(this.audioSettings.mute);

        for (const key in this.sounds) {
            const sound = this.sounds[key];
            const type = sound._sprite ? 'sfx' : (sound._loop ? 'music' : 'sfx'); // A simple way to distinguish
            const baseVolume = sound._volume; // Howler stores the initial volume here
            sound.volume(this._getVolume(type, baseVolume));
        }

        if (this.audioSettings.backgroundAudio) {
            Howler.autoSuspend = false;
            if (this.sounds.music && !this.sounds.music.playing()) {
                this.sounds.music.play();
            }
        } else {
            Howler.autoSuspend = true;
            if (this.sounds.music && this.sounds.music.playing()) {
                this.sounds.music.pause();
            }
        }
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}
