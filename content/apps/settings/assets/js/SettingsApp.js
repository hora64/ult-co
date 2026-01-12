import { UIComponent, TextCanvasMeasurer, LocalStorage, DateTimeFormatter, Scrollbar, CanvasButton } from "/content/common/utils/index.js";
import { ModalManager } from "/content/common/utils/canvasUI/layouts/modal/ModalManager.js";
import { TopScreen } from "./TopScreen.js";
import { translations as settingsTranslations } from "../../i18n.js";
import { MainMenuTab } from './pages/MainMenuTab.js';
import { SystemSettingsMenuTab } from './pages/SystemSettingsMenuTab.js';
import { AudioSettingsTab } from './pages/AudioSettingsTab.js';
import { TimeZoneSettingsTab } from './pages/TimeZoneSettingsTab.js';
import { TimeSettingsTab } from './pages/TimeSettingsTab.js';
import { DateSettingsTab } from './pages/DateSettingsTab.js';
import { LanguageSettingsTab } from './pages/LanguageSettingsTab.js';
import { ClearDataTab } from "./pages/ClearDataTab.js";
import { DebugModeTab } from "./pages/DebugModeTab.js";
import { CanvasBackground } from "/content/common/utils/canvasUI/background.js";

export class SettingsApp extends UIComponent {
    constructor(rootId) {
        super();
        this.root = document.getElementById(rootId);
        this.appId = 'settings-app';
        this.Debug = false;

        this.settings = {
            audio: {
                mute: false,
                backgroundAudio: true,
                volumeMultiplier: {
                    sfx: 1.0,
                    music: 1.0
                }
            },
            timeZone: luxon.DateTime.local().zoneName,
            language: 'en-US'
        };

        this.minimizedSections = {
            audio: true,
            regional: true
        };

        this.currentView = 'main';
        this.lastNavigationElement = null;

        this.mailDataExists = false;
        this.translations = {};
        this.sounds = {};
        this.cssVars = this.getCSSVariables();
        this.measurer = new TextCanvasMeasurer();
        this.dateTimeFormatter = new DateTimeFormatter();
        this.modalManager = null;
        this.areTabsRendered = false;
        this.eventListeners = {};
    }

    on(eventName, listener) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(listener);
    }

    off(eventName, listener) {
        if (!this.eventListeners[eventName]) {
            return;
        }
        this.eventListeners[eventName] = this.eventListeners[eventName].filter(
            l => l !== listener
        );
    }

    emit(eventName, ...args) {
        if (!this.eventListeners[eventName]) {
            return;
        }
        this.eventListeners[eventName].forEach(listener => listener(...args));
    }

    async start() {
        this.injectStyles();
        await document.fonts.load('1px "Rodin"', ' ');
        await document.fonts.ready;

        await this.loadSettings();
        await this.loadLanguageFile(this.settings.language);
        this._initializeSounds();
        this._applyAudioSettings();
        await this.renderLayout();
        await this.renderTabs();

        this.on('settingChanged', (isChanged) => {
            if (this.confirmButton) {
                this.confirmButton.update({
                    disabled: !isChanged,
                    backgroundColor: isChanged ? this.cssVars['--ds-accent-blue'] : 'rgba(255,255,255,0.1)',
                });
            }
        });

        this.sounds.appLaunch.play();

        if (window.parent !== window) {
            window.parent.postMessage({ type: 'app-ready' }, '*');
        }
    }

    async loadLanguageFile(langCode) {
        this.translations = settingsTranslations[langCode] || settingsTranslations['en-US'];
        this.currentLanguage = langCode;
        this.appLabel = this.translations.appLabel || 'Settings';
        console.log(`Language set to ${langCode}`);
    }

    async loadSettings() {
        this.Debug = localStorage.getItem('Debug') === 'true';
        this.settings.audio = {
            ...this.settings.audio,
            ...LocalStorage.get('audioSettings', {})
        };

        const storedTimeZone = localStorage.getItem('userTimeZone');
        if (storedTimeZone) {
            this.settings.timeZone = storedTimeZone;
            this.dateTimeFormatter = new DateTimeFormatter(storedTimeZone);
        }

        const storedLanguage = localStorage.getItem('userLanguage');
        if (storedLanguage) {
            this.settings.language = storedLanguage;
        }

        this.mailDataExists = !!LocalStorage.get('mailApp_readStatusMap') || !!LocalStorage.get('mailApp_unreadCount');
    }

    saveSettings() {
        LocalStorage.set('audioSettings', this.settings.audio);
        localStorage.setItem('userTimeZone', this.settings.timeZone);
        localStorage.setItem('userLanguage', this.settings.language);
        this.dateTimeFormatter = new DateTimeFormatter(this.settings.timeZone);
        this._applyAudioSettings();
    }

    async renderLayout() {
        this.root.innerHTML = '';

        this.topScreen = new TopScreen(this);
        this.root.appendChild(this.topScreen.element);

        this.bottomScreen = this.createElement('div', 'bottom-screen');

        this.bottomScreenCanvas = this.createCanvas(320, 240, 'bottom-screen-canvas');
        this.bottomScreen.appendChild(this.bottomScreenCanvas);

        const contentArea = this.createElement('div', 'content-area');

        this.tabContainer = this.createElement('div', 'tab-container');
        this.tabClasses = {
            main: MainMenuTab,
            system: SystemSettingsMenuTab,
            audio: AudioSettingsTab,
            timezone: TimeZoneSettingsTab,
            time: TimeSettingsTab,
            date: DateSettingsTab,
            language: LanguageSettingsTab,
            'clear-data': ClearDataTab,
            'debug-mode': DebugModeTab
        };
        this.tabs = {};

        this.scrollWrapper = this.createElement('div', 'scroll-wrapper');
        this.scrollWrapper.appendChild(this.tabContainer);

        contentArea.appendChild(this.scrollWrapper);

        this.drawBottomScreenBackground({ bottomScreenBackground: this.cssVars['--ds-bg'] });

        this.footerContainer = this.createElement('div', 'footer-container');

        this.modalContainer = this.createElement('div', 'modal-container');
        this.modalManager = new ModalManager(this.modalContainer, {
            translations: this.translations,
            cssVars: this.cssVars,
            sounds: this.sounds,
            appInstance: this,
            theme: {},
            options: {
                dropShadow: 'none'
            }
        });

        this.bottomScreen.appendChild(contentArea);
        this.bottomScreen.appendChild(this.footerContainer);
        this.bottomScreen.appendChild(this.modalContainer);

        this.root.appendChild(this.bottomScreen);
        this.topScreen.show();

        this.modalManager.setButtonOptions({});
        this.renderFooter();
    }

    navigateTo(viewId, buttonElement) {
        if (!this.tabClasses[viewId]) {
            console.warn(`Navigation failed: Tab with id "${viewId}" not found.`);
            return;
        }
        this.lastNavigationElement = buttonElement;

        this.footerContainer.style.transition = 'transform 0.3s ease-in-out';
        this.footerContainer.style.transform = 'translateY(100%)';

        const currentTab = this.tabs[this.currentView];
        if (currentTab) {
            currentTab.element.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
            currentTab.element.style.opacity = '0';
            currentTab.element.style.transform = 'translateY(10px)';
        }

        setTimeout(() => {
            this.currentView = viewId;
            this.renderTabs();

            const newTab = this.tabs[this.currentView];
            if (!newTab) return;

            newTab.element.style.transition = 'opacity 0.2s ease-in, transform 0.2s ease-in';
            newTab.element.style.opacity = '0';
            newTab.element.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                newTab.element.style.opacity = '1';
                newTab.element.style.transform = 'translateY(0)';
                this.footerContainer.style.transform = 'translateY(0)';
            }, 50);
        }, 200);
    }

    renderFooter() {
        this.footerContainer.innerHTML = '';

        const isMainView = this.currentView === 'main';
        const hasConfirmButton = ['language', 'timezone', 'time', 'date'].includes(this.currentView);

        this.footerContainer.className = 'footer-container';

        if (isMainView) {
            const exitButton = new CanvasButton({
                text: this.translations.footer.exit,
                width: 320,
                height: 32,
                borderRadius: [16, 16, 0, 0], // Increased from 12 to 16 for rounder corners
                onClick: () => this.handleExit(),
                sounds: this.sounds,
                textColor: '#FFFFFF',
                font: 'bold 16px "Rodin", sans-serif',
                moveOnPress: true,
                sideBorderColor: 'rgba(255, 255, 255, 0.3)',
                sideBorderWidth: 1.5,
                sideBorderSides: 'both'
            });
            this.footerContainer.appendChild(exitButton.element);
        } else {
            this.footerContainer.classList.add('back-view');
            const backButton = new CanvasButton({
                text: this.translations.footer.back,
                width: 64,
                height: 32,
                borderRadius: [0, 12, 0, 0],
                onClick: () => this.handleBack(),
                sounds: this.sounds,
                textColor: '#FFFFFF',
                font: 'bold 16px "Rodin", sans-serif',
                sideBorderColor: 'rgba(255, 255, 255, 0.3)',
                sideBorderWidth: 1.5,
                sideBorderSides: 'right',
                moveOnPress: true
            });
            this.footerContainer.appendChild(backButton.element);

            if (hasConfirmButton) {
                this.footerContainer.classList.add('has-confirm-button');
                this.confirmButton = new CanvasButton({
                    text: this.translations.footer.confirm,
                    width: 100,
                    height: 32,
                    borderRadius: [12, 0, 0, 0],
                    disabled: true,
                    onClick: () => {
                        const activeTab = this.tabs[this.currentView];
                        let message = 'Setting Applied';
                        let needsReload = false;

                        if (this.currentView === 'language') {
                            this.settings.language = activeTab.tempLanguage;
                            localStorage.setItem('userLanguage', this.settings.language);
                            message = this.translations.confirmation.languageChange;
                            needsReload = true;
                        } else if (this.currentView === 'timezone') {
                            this.settings.timeZone = activeTab.tempTimeZone;
                            localStorage.setItem('userTimeZone', this.settings.timeZone);
                            message = this.translations.confirmation.timeZoneChange;
                        } else if (this.currentView === 'time' || this.currentView === 'date') {
                            activeTab.applySettings();
                            message = this.translations.confirmation.timeChange;
                        }
                        this.saveSettings();

                        this.modalManager.showSettingAppliedModal({
                            message: message,
                            autoClose: 2000,
                            alignTop: true,
                            onConfirm: () => {
                                if (needsReload) {
                                    window.location.reload();
                                } else {
                                    this.handleBack();
                                }
                            }
                        });
                    },
                    font: 'bold 16px "Rodin", sans-serif',
                    sounds: this.sounds,
                    textColor: '#FFFFFF',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    sideBorderColor: 'rgba(255, 255, 255, 0.3)',
                    sideBorderWidth: 1.5,
                    sideBorderSides: 'left',
                    moveOnPress: true
                });
                this.footerContainer.appendChild(this.confirmButton.element);
            }
        }
    }

    updateFooter() {
        this.renderFooter();
    }

    renderTabs() {
        for (const tabId in this.tabs) {
            if (tabId !== this.currentView) {
                if (this.tabs[tabId]) {
                    this.tabs[tabId].destroy();
                    delete this.tabs[tabId];
                }
            }
        }

        if (!this.tabs[this.currentView]) {
            const TabClass = this.tabClasses[this.currentView];
            if (TabClass) {
                this.tabs[this.currentView] = new TabClass(this);
                this.tabContainer.appendChild(this.tabs[this.currentView].element);
            }
        }

        const activeTab = this.tabs[this.currentView];
        if (activeTab) {
            activeTab.element.classList.add('active');
            if (typeof activeTab.render === 'function') {
                console.log(`Rendering tab: ${this.currentView}`);
                activeTab.render();
            }
        }

        this.updateFooter();
        if (this.scrollbar) {
            this.scrollbar.update();
            this.scrollbar.element.style.display = 'none';
            if (this.topFade) this.topFade.style.display = 'none';
            if (this.bottomFade) this.bottomFade.style.display = 'none';
        }
    }

    initializeSettingsViews() {
        if (!this.translations || !this.settings) {
            return;
        }
    }

    drawBottomScreenBackground(theme) {
        const ctx = this.bottomScreenCanvas.getContext('2d');
        const bg = theme.bottomScreenBackground || this.cssVars['--ds-bg'];
        CanvasBackground.draw(ctx, 320, 240, bg);
    }

    _createSectionHeader(text, sectionId, isPageHeader = false) {
        const header = this.createElement('div', 'section-header');
        if (!isPageHeader) {
            const isMinimized = this.minimizedSections[sectionId];
            header.addEventListener('click', () => {
                this.minimizedSections[sectionId] = !this.minimizedSections[sectionId];
                this.renderTabs();
            });
        }

        const canvas = this.createElement('canvas', 'section-header-canvas');
        header.appendChild(canvas);

        canvas.width = 256;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');

        if (!isPageHeader) {
            const isMinimized = this.minimizedSections[sectionId];
            ctx.fillStyle = this.cssVars['--ds-text'];
            ctx.beginPath();

            if (isMinimized) {
                ctx.moveTo(5, 15);
                ctx.lineTo(11, 19);
                ctx.lineTo(5, 23);
            } else {
                ctx.moveTo(5, 16);
                ctx.lineTo(13, 16);
                ctx.lineTo(9, 21);
            }

            ctx.closePath();
            ctx.fill();
        }
        this._drawTextOnCanvas(ctx, text, isPageHeader ? 10 : 25, 18, 'bold 16px "Rodin", sans-serif', this.cssVars['--ds-text'], 'left', 'middle');

        return header;
    }

    _createFooterNote(text) {
        const canvas = this.createCanvas(236, 48, 'footer-note-canvas');
        const ctx = canvas.getContext('2d');
        this._drawTextOnCanvas(ctx, text, 118, 24, '12px "Rodin", sans-serif', this.cssVars['--ds-text-subtle'], 'center', 'middle', 236);
        return canvas;
    }

    handleBack() {
        this.footerContainer.style.transition = 'transform 0.3s ease-in-out';
        this.footerContainer.style.transform = 'translateY(100%)';

        const currentTab = this.tabs[this.currentView];
        if (currentTab) {
            currentTab.element.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
            currentTab.element.style.opacity = '0';
            currentTab.element.style.transform = 'translateY(10px)';
        }

        setTimeout(() => {
            const backMapping = {
                'audio': 'system',
                'timezone': 'system',
                'time': 'system',
                'date': 'system',
                'language': 'system',
                'system': 'main',
                'clear-data': 'system',
                'debug-mode': 'system'
            };
            this.currentView = backMapping[this.currentView] || 'main';
            this.renderTabs();

            const newTab = this.tabs[this.currentView];
            if (!newTab) return;

            newTab.element.style.transition = 'opacity 0.2s ease-in, transform 0.2s ease-in';
            newTab.element.style.opacity = '0';
            newTab.element.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                newTab.element.style.opacity = '1';
                newTab.element.style.transform = 'translateY(0)';
                this.footerContainer.style.transform = 'translateY(0)';
            }, 50);
        }, 200);
    }

    handleExit() {
        this.sounds.appExit.play();
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'launchApp',
                appId: 'homeScreen',
                label: 'Home Screen',
                location: 'content/apps/homeScreen_3DS/homeScreen_3DS.html'
            }, '*');
        } else {
            console.warn('Not running in an iframe, cannot post message to parent.');
        }
    }

    destroy() {
        if (this.sounds) {
            Object.values(this.sounds).forEach(sound => sound.unload());
            this.sounds = {};
        }

        if (this.topScreen && typeof this.topScreen.destroy === 'function') {
            this.topScreen.destroy();
        }

        for (const tabId in this.tabs) {
            if (this.tabs[tabId] && typeof this.tabs[tabId].destroy === 'function') {
                this.tabs[tabId].destroy();
            }
        }

        if (this.footerButton && typeof this.footerButton.destroy === 'function') {
            this.footerButton.destroy();
        }
        if (this.modalManager && typeof this.modalManager.destroy === 'function') {
            this.modalManager.destroy();
        }

        if (this.root) {
            this.root.innerHTML = '';
        }

        if (window.parent !== window) {
            window.parent.postMessage({ type: 'app-destroyed', appId: this.appId }, '*');
        }
    }

    clearReadMailData() {
        LocalStorage.remove('mailApp_readStatusMap');
        this.mailDataExists = !!LocalStorage.get('mailApp_unreadCount');
        this.renderTabs();
        console.log('Read mail data cleared.');
    }

    clearAllData() {
        LocalStorage.remove('mailApp_readStatusMap');
        LocalStorage.remove('mailApp_unreadCount');
        this.mailDataExists = false;
        this.renderTabs();
        console.log('All mail data cleared.');
    }

    _initializeSounds() {
        this.sounds = {
            click: new Howl({ src: ['https://assets.codepen.io/210284/transform.mp3'] }),
            inputFocus: new Howl({ src: ['https://assets.codepen.io/210284/soft-blip.mp3'] }),
            inputBlur: new Howl({ src: ['https://assets.codepen.io/210284/soft-blip-down.mp3'] }),
            filterApply: new Howl({ src: ['https://assets.codepen.io/210284/confirmation_001.mp3'] }),
            typing: new Howl({ src: ['https://assets.codepen.io/210284/keyboard-tap.mp3'], volume: 0.2 }),
            appLaunch: new Howl({ src: ['https://assets.codepen.io/210284/app-launch.mp3'] }),
            appExit: new Howl({ src: ['https://assets.codepen.io/210284/app-close.mp3'] })
        };
    }

    _applyAudioSettings() {
        const sfxVol = this.settings.audio.volumeMultiplier.sfx;
        Howler.mute(this.settings.audio.mute);
        Object.values(this.sounds).forEach(sound => {
            if (sound.volume) sound.volume(sfxVol);
        });
    }

    getCSSVariables() {
        const style = getComputedStyle(document.documentElement);
        return {
            '--ds-bg': style.getPropertyValue('--ds-bg').trim() || '#222222',
            '--ds-bg-modal': style.getPropertyValue('--ds-bg-modal').trim() || '#1C1C1C',
            '--ds-bg-grad': style.getPropertyValue('--ds-bg-grad').trim() || 'linear-gradient(180deg, #2C2C2C 0%, #1C1C1C 100%)',
            '--ds-text': style.getPropertyValue('--ds-text').trim() || '#EAEAEA',
            '--ds-text-subtle': style.getPropertyValue('--ds-text-subtle').trim() || '#999999',
            '--ds-accent-primary': style.getPropertyValue('--ds-accent-primary').trim() || '#0d6efd',
            '--ds-accent-primary-dark': style.getPropertyValue('--ds-accent-primary-dark').trim() || '#0b5ed7',
            '--ds-accent-danger': style.getPropertyValue('--ds-accent-danger').trim() || '#dc3545',
            '--ds-button-bg': style.getPropertyValue('--ds-button-bg').trim() || 'rgba(255, 255, 255, 0.1)',
            '--ds-button-hover-bg': style.getPropertyValue('--ds-button-hover-bg').trim() || 'rgba(255, 255, 255, 0.2)',
            '--ds-button-disabled-bg': style.getPropertyValue('--ds-button-disabled-bg').trim() || 'rgba(255, 255, 255, 0.1)'
        };
    }

    _drawTextOnCanvas(ctx, text, x, y, font, color, textAlign = 'left', textBaseline = 'alphabetic', maxWidth) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        if (maxWidth) {
            const isJapanese = this.settings.language === 'ja-JP';
            const units = isJapanese ? text.split('') : text.split(' ');
            let line = '';
            const lineHeight = parseInt(font, 10) * 1.4;

            for (let n = 0; n < units.length; n++) {
                const unit = units[n];
                const separator = (isJapanese || line === '') ? '' : ' ';
                let testLine = line + separator + unit;
                let metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, x, y);
                    line = unit;
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
        } else {
            ctx.fillText(text, x, y);
        }
    }

    injectStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @font-face {
                font-family: "Rodin";
                src: url("/content/common/fonts/FOT-RodinNTLG Pro DB.otf") format("opentype");
            }
            
            :root {
                --ds-bg: #222222;
                --ds-bg-modal: #1C1C1C;
                --ds-bg-grad: linear-gradient(180deg, #2C2C2C 0%, #1C1C1C 100%);
                --ds-text: #EAEAEA;
                --ds-text-subtle: #999999;
                --ds-accent-primary: #0d6efd;
                --ds-accent-primary-dark: #0b5ed7;
                --ds-accent-danger: #dc3545;
                --ds-button-bg: rgba(255, 255, 255, 0.1);
                --ds-button-hover-bg: rgba(255, 255, 255, 0.2);
                --ds-button-disabled-bg: rgba(255, 255, 255, 0.1);
            }

            body {
                background: #1A1A1A;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: "Rodin", Arial, sans-serif;
                overflow: hidden;
                image-rendering: pixelated;
                -webkit-font-smoothing: none;
            }

            .ds-container {
                width: 400px;
                height: 480px;
                background: black;
                user-select: none;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .top-screen {
                width: 400px;
                height: 240px;
                background: var(--ds-bg-grad);
                flex-shrink: 0;
            }

            .bottom-screen {
                width: 320px;
                height: 240px;
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .bottom-screen-canvas {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 0;
            }

            .content-area {
                flex: 1;
                overflow: hidden;
                position: relative;
                z-index: 1;
            }

            .tab-container {
                width: 100%;
                height: 100%;
                position: relative;
            }

            .scroll-wrapper {
                width: 100%;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                scrollbar-width: none;
            }

            .scroll-wrapper::-webkit-scrollbar {
                display: none;
            }

            .settings-container {
                padding: 10px 20px 0px 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                width: 100%;
            }

            .settings-tab {
                display: none;
                flex-direction: column;
                gap: 10px;
                width: 100%;
                padding: 10px 20px 0px 20px;
                transition: opacity 0.3s ease, transform 0.3s ease;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 0;
                transform: translateX(20px);
            }

            .settings-tab.no-scroll {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                padding: 20px;
                align-items: center;
                justify-content: center;
            }

            .settings-tab.active {
                display: flex;
                opacity: 1;
                transform: translateX(0);
                position: static;
            }

            .settings-tab.main-menu-container {
                flex-direction: column;
                align-items: center;
                gap: 10px;
                padding: 20px 0px 0px 0px;
                width: 100%;
                flex-grow: 1;
                justify-content: center;
            }
            
            .main-menu-container {
                display: flex;
                gap: 10px;
                width: 100%;
                flex-grow: 1;
                justify-content: center;
                flex-direction: column;
            }
            
            .page-selector-container {
                display: flex;
                justify-content: center;
                gap: 10px;
            }

            .buttons-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }

            .main-menu-row {
                display: flex;
                justify-content: center;
                width: 236px;
                gap: 10px;
            }

            .section-container {
                position: relative;
            }

            .section-header {
                cursor: pointer;
                padding: 0 5px;
                height: 36px;
                display: flex;
                align-items: center;
            }

            .section-content {
                display: flex;
                flex-direction: column;
                padding: 0 10px 10px;
                gap: 4px;
            }

            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 36px;
                width: 280px;
            }

            .list-fade {
                position: absolute;
                width: 320px;
                height: 15px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 5;
                pointer-events: none;
            }

            .top-fade {
                top: 0;
                background: linear-gradient(180deg, var(--ds-bg) 0%, transparent 100%);
            }

            .bottom-fade {
                bottom: 0px;
                background: linear-gradient(0deg, var(--ds-bg) 0%, transparent 100%);
            }

            .slider-wrapper {
                cursor: pointer;
            }

            .full-width-button {
                width: 100%;
                margin-top: 10px;
                gap: 4px;
            }

            .footer-note-canvas {
                margin: 15px auto 0;
            }

            .footer-container {
                width: 100%;
                height: 32px;
                background: var(--ds-bg);
                flex-shrink: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1;
            }

            .footer-container.back-view {
                justify-content: flex-start;
            }

            .footer-container.has-confirm-button {
                justify-content: space-between;
            }

            .canvas-button {
                all: unset;
                display: block;
            }

            .custom-scrollbar {
                flex-shrink: 0;
                cursor: grab;
            }

            .modal-container {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s, visibility 0.2s;
                z-index: 1000;
                backdrop-filter: blur(4px);
            }

            .modal-container.active {
                opacity: 1;
                visibility: visible;
            }

            .dropdown-dialog {
                position: relative;
                width: 280px;
                max-height: 220px;
                padding: 10px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                background: var(--ds-bg-modal);
            }

            .modal-header-canvas {
                margin-bottom: 5px;
            }

            .options-list-wrapper {
                flex: 1;
                display: flex;
                overflow: hidden;
                position: relative;
            }

            .options-list {
                flex-grow: 1;
                overflow-y: auto;
                scrollbar-width: none;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 5px;
                padding: 10px 0;
            }

            .options-list::-webkit-scrollbar {
                display: none;
            }

            .modal-dialog-container {
                position: relative;
                overflow: hidden;
            }

            .modal-buttons {
                display: flex;
                justify-content: space-around;
                width: 100%;
                position: absolute;
                bottom: 10px;
            }

            .dropdown-buttons {
                position: static;
                margin-top: 15px;
            }

            .modal-top-fade,
            .modal-bottom-fade {
                position: absolute;
                left: 0;
                width: calc(100% - 16px);
                height: 15px;
                z-index: 2;
                pointer-events: none;
            }

            .modal-top-fade {
                top: 0;
                background: linear-gradient(180deg, var(--ds-bg-modal) 20%, transparent 100%);
            }

            .modal-bottom-fade {
                bottom: 0;
                background: linear-gradient(0deg, var(--ds-bg-modal) 20%, transparent 100%);
            }

            .audio-settings-tab {
                padding: 0px;
            }

            .system-settings-menu-tab {
                padding: 0;
                overflow: hidden;
                justify-content: center;
                align-items: center;
            }

            .system-settings-main-container {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height: 200px;
            }

            .arrow-container .canvas-button {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .arrow-container {
                display: flex;
                align-items: center;
                height: 100%;
            }

            .content-wrapper {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
            }

            .button-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 10px;
            }

            .option-buttons-container {
                display: grid;
                grid-template-rows: repeat(2, 1fr);
                grid-auto-flow: column;
                gap: 10px;
                padding: 10px;
                width: -moz-fit-content;
                width: fit-content;
            }

            .settings-tab.language-settings-tab,
            .settings-tab.timezone-settings-tab {
                padding: 0px;
                justify-content: center;
            }

            .timezone-settings-tab .option-buttons-container {
                display: grid;
                grid-template-rows: repeat(3, 1fr);
                grid-auto-flow: column;
                gap: 10px;
                padding: 10px;
                width: -moz-fit-content;
                width: fit-content;
            }

            .time-settings-tab {
                padding: 0px;
                justify-content: center;
                align-items: center;
            }

            .time-settings-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                width: 100%;
                height: 100%;
                justify-content: center;
            }

            .date-settings-tab {
                padding: 0px;
                justify-content: center;
                align-items: center;
            }

            .date-settings-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                width: 100%;
                height: 100%;
                justify-content: center;
            }

            .option-selector-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                gap: 10px;
            }

            .option-label {
                font-size: 16px;
                font-weight: bold;
                color: var(--ds-text);
            }

            .option-scroller-container {
                position: relative;
                width: 100%;
            }

            .option-scroller-container::before,
            .option-scroller-container::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                width: 15px;
                pointer-events: none;
                z-index: 2;
            }

            .option-scroller-container::before {
                left: 0;
                background: linear-gradient(to right, var(--ds-bg) 20%, transparent);
            }

            .option-scroller-container::after {
                right: 0;
                background: linear-gradient(to left, var(--ds-bg) 20%, transparent);
            }

            .option-scroller-wrapper {
                width: 100%;
                overflow-x: auto;
                scrollbar-width: none;
            }

            .option-scroller-wrapper::-webkit-scrollbar {
                display: none;
            }

            .system-settings-menu-tab .content-wrapper {
                left: 50%;
                transform: translateX(-50%);
                padding: 0px 20px 0px 20px;
                position: absolute;
            }

            .system-settings-menu-tab .page-selector-container {
                padding-top: 10px;
            }

            @keyframes fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}
