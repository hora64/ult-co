export class AppGridSound {
    constructor(assetUrls, volume) {
        this.assetUrls = assetUrls;
        this.volume = volume;
        this.sounds = {};
        this.currentJingle = null;

        if (typeof Howl === 'undefined') {
            console.error("AppGrid: howler.js is not loaded. Please include the library script.");
        } else {
            this._initializeSounds();
        }
    }

    _initializeSounds() {
        Howler.volume(this.volume);
        const soundKeys = ['soundClick', 'soundSelect', 'soundLaunch', 'soundSizeUp', 'soundSizeDown', 'soundGrab', 'soundOpenBox'];
        soundKeys.forEach(key => {
            const soundName = key.replace('sound', '').toLowerCase();
            if (this.assetUrls[key]) {
                this.sounds[soundName] = new Howl({
                    src: [this.assetUrls[key]]
                });
            }
        });
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    /**
     * Plays a jingle for an app
     * @deprecated This method is deprecated. Jingles are now managed by the banner system (BaseBanner).
     * @param {Object} appDataItem - The app data item
     */
    playJingleForApp(appDataItem) {
        console.warn('[AppGridSound] playJingleForApp is deprecated. Jingles are now managed by the banner system.');
        if (typeof Howl === 'undefined' || !appDataItem) return;

        if (this.currentJingle) {
            this.currentJingle.stop();
            this.currentJingle = null;
        }

        let jinglePath;
        if (appDataItem.unopened && appDataItem.unopenedJingle) {
            jinglePath = appDataItem.unopenedJingle;
        } else if (!appDataItem.unopened && appDataItem.jingle) {
            jinglePath = appDataItem.jingle;
        }

        if (jinglePath) {
            this.currentJingle = new Howl({
                src: [jinglePath],
                volume: this.volume
            });
            this.currentJingle.play();
        }
    }
    
    /**
     * Stops any currently playing jingle
     * This is useful for cleanup when banners are managing their own jingles
     */
    stopJingle() {
        if (this.currentJingle) {
            this.currentJingle.stop();
            this.currentJingle = null;
            console.log('[AppGridSound] Jingle stopped');
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (typeof Howl !== 'undefined') {
            Howler.volume(this.volume);
        }
    }

    updateAssetUrls(newAssetUrls) {
        this.assetUrls = { ...this.assetUrls, ...newAssetUrls };
        if (typeof Howl !== 'undefined') {
            const soundKeys = ['soundClick', 'soundSelect', 'soundLaunch', 'soundSizeUp', 'soundSizeDown', 'soundGrab', 'soundOpenBox'];
            soundKeys.forEach(key => {
                if (newAssetUrls[key]) {
                    const soundName = key.replace('sound', '').toLowerCase();
                    if (this.sounds[soundName]) this.sounds[soundName].unload();
                    this.sounds[soundName] = new Howl({ src: [this.assetUrls[key]] });
                }
            });
        }
    }

    destroy() {
        if (this.currentJingle) {
            this.currentJingle.stop();
            this.currentJingle = null;
        }
        if (typeof Howl !== 'undefined') Howler.unload();
        this.sounds = {};
    }
}
