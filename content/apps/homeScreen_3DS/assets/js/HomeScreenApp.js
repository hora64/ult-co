import {
    LoadingCircle,
    UIComponent,
    Article,
    RichTextRenderer,
    ImageManager,
    SlimScrollIndicator
} from "/content/common/utils/index.js";
import { AppGridControls } from './appGrid/AppGridControls.js';
import { AppIcon } from './appGrid/AppIcon.js';
import { AppGrid } from "./appGrid/AppGrid.js";
import { ModalManager } from "/content/common/utils/canvasUI/layouts/modal/ModalManager.js";
import { DataManager } from "/content/common/utils/data.js";
import { loadAppConfig, getEnabledAppFolders, getFallbackConfig } from "./appGrid/AppConfigLoader.js";
import {
    ThemeManager
} from './theme.js';
import {
    CanvasManager
} from './canvas.js';
import {
    StyleManager
} from './styles.js';
import {
    BackgroundManager
} from './background.js';
import {
    TopScreen
} from './TopScreen.js';
import { unwrap } from '../banners/unopened/unopened.js';
import { translations } from '../../i18n.js';
import { getPermissionLevel, canViewApp, canLaunchApp } from "/content/common/utils/permissions.js";
import { topBarAppIds, alwaysOpenedApps, themeDefaults, getThemeAssets } from '../../config/config.js';
import { assetCache } from '/content/common/utils/AssetCache.js';
import { AssetPreloader } from '/content/common/utils/AssetPreloader.js';



class HomeScreenApp extends UIComponent {
    /**
     * Creates a new HomeScreenApp instance
     * Initializes all managers, components, and UI elements
     */
    constructor() {
        super();
        this.topScreenElement = document.getElementById('topScreen');
        this.bottomScreenElement = document.getElementById('bottomScreen');

        this.topCanvas = document.createElement('canvas');
        this.topCanvas.id = 'top-canvas';
        this.topCanvas.width = 400;
        this.topCanvas.height = 240;
        this.topScreenElement.appendChild(this.topCanvas);

        this.bottomCanvas = document.createElement('canvas');
        this.bottomCanvas.id = 'bottom-canvas';
        this.bottomCanvas.width = 320;
        this.bottomCanvas.height = 240;
        this.bottomScreenElement.appendChild(this.bottomCanvas);

        // Create body background canvas (400x240px) in top screen with z-index -1
        this.bodyBackgroundCanvas = document.createElement('canvas');
        this.bodyBackgroundCanvas.id = 'body-background-canvas';
        this.bodyBackgroundCanvas.width = 400;
        this.bodyBackgroundCanvas.height = 240;
        this.bodyBackgroundCanvas.style.position = 'absolute';
        this.bodyBackgroundCanvas.style.top = '0';
        this.bodyBackgroundCanvas.style.left = '0';
        this.bodyBackgroundCanvas.style.width = '400px';
        this.bodyBackgroundCanvas.style.height = '240px';
        this.bodyBackgroundCanvas.style.zIndex = '-1';
        this.bodyBackgroundCanvas.style.imageRendering = 'crisp-edges';
        this.topScreenElement.insertBefore(this.bodyBackgroundCanvas, this.topScreenElement.firstChild);

        this.loaderWidget = null;
        this.themeManager = new ThemeManager();
        this.languageData = {};
        this.currentLanguage = 'en';
        this.settings = {
            language: 'en-US' // DialogModal checks this.appInstance.settings.language
        };
        this.dataManager = new DataManager();
        this.canvasManager = new CanvasManager();
        this.styleManager = new StyleManager();
        this.imageManager = new ImageManager();
        this.richTextRenderer = new RichTextRenderer(this);
        this.backgroundManager = new BackgroundManager(this.topCanvas, this.bottomCanvas, { 
            topColor: '#222222', 
            bottomColor: '#222222',
            bodyCanvas: this.bodyBackgroundCanvas,
            bodyColor: '#222222'
        });
        this.appGridVisible = true;
        this.scrollIndicator = null;
        this.appGridControls = null;
        this.appGridInstance = null;
        this.article = null;
        this.bottomScreenWrapper = null;
        this.topScreen = null;
        this.bottomTopBar = null;
        this.modalManager = null; // Will be initialized after DOM setup

        // Track unread counts for apps
        this.unreadCounts = {};

        this.cssVars = {
            blockSpacing: 10,
            articleContentHorizontalPadding: 0,
            articleContentVerticalPadding: 15,
            '--ds-bg': '#222222',
            '--ds-bg-modal': '#2C2C2C',
            '--ds-text': '#EAEAEA',
            '--ds-text-subtle': '#999999',
            '--ds-accent-blue': '#5BC0DE',
            '--ds-accent-red': '#D9534F'
        };

        this.articleTitleTextWidth = 256;
        this.articleTitleLineSpacingFactor = 1.2;
        this.articleContentTextWidth = 256;
        this.userTimeZone = null; // Will use browser's local timezone

        this.isReady = new Promise(resolve => {
            this.resolveIsReady = resolve;
        });

        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "deep-link" && event.data.slug) {
                this.handleDeepLink(event.data.slug);
            }
        });
    }

    /**
     * Translates a text key using current language data
     * @param {string} key - Translation key
     * @param {Object} [options] - Template variables for interpolation
     * @returns {string} Translated text
     */
    t(key, options) {
        let text = this.languageData[key] || key;
        if (options) {
            Object.keys(options).forEach(k => {
                text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), options[k]);
            });
        }
        return text;
    }

    /**
     * Loads unread counts from localStorage
     * @private
     */
    loadUnreadCounts() {
        try {
            const stored = localStorage.getItem('homeScreen_unreadCounts');
            if (stored) {
                this.unreadCounts = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load unread counts:', error);
            this.unreadCounts = {};
        }
    }

    /**
     * Saves unread counts to localStorage
     * @private
     */
    saveUnreadCounts() {
        try {
            localStorage.setItem('homeScreen_unreadCounts', JSON.stringify(this.unreadCounts));
        } catch (error) {
            console.error('Failed to save unread counts:', error);
        }
    }

    /**
     * Sets the unread count for a specific app
     * @param {string} appId - The app ID
     * @param {number} count - The unread count
     */
    setUnreadCount(appId, count) {
        this.unreadCounts[appId] = count;
        this.saveUnreadCounts();

        // Update top screen total
        if (this.topScreen) {
            const totalUnread = Object.values(this.unreadCounts).reduce((sum, c) => sum + c, 0);
            this.topScreen.setUnreadCount(totalUnread);
        }

        // Update top bar via appGridControls if app is there
        if (this.appGridControls) {
            this.appGridControls.updateUnreadCount(appId, count);
        }

        // Update app grid if app is there
        if (this.appGridInstance) {
            const app = this.appGridInstance.appData.find(a => a.id === appId);
            if (app) {
                app.unreadCount = count;
            }
        }
    }

    /**
     * Gets the unread count for a specific app
     * @param {string} appId - The app ID
     * @returns {number} The unread count
     */
    getUnreadCount(appId) {
        return this.unreadCounts[appId] || 0;
    }

    /**
     * Increments the unread count for a specific app
     * @param {string} appId - The app ID
     * @param {number} [amount=1] - Amount to increment by
     */
    incrementUnreadCount(appId, amount = 1) {
        const current = this.getUnreadCount(appId);
        this.setUnreadCount(appId, current + amount);
    }

    /**
     * Clears the unread count for a specific app
     * @param {string} appId - The app ID
     */
    clearUnreadCount(appId) {
        this.setUnreadCount(appId, 0);
    }

    /**
     * Sets the application language
     * @param {string} lang - Language code (e.g., 'en-US', 'ja-JP')
     */
    async setLanguage(lang) {
        this.currentLanguage = lang;
        this.settings.language = lang; // Update settings for DialogModal
        this.languageData = translations[lang] || translations['en-US'];
        console.log(`Language set to ${lang}`);
    }

    /**
     * Gets the user's preferred language
     * @returns {string} Language code
     */
    getUserLanguage() {
        return localStorage.getItem('userLanguage') || navigator.language || 'en-US';
    }

    /**
     * Gets the user's timezone
     * @returns {string} IANA timezone identifier (e.g., 'America/New_York')
     */
    getUserTimeZone() {
        // Try to get from settings first
        if (this.settings.timeZone) {
            return this.settings.timeZone;
        }
        
        // Fall back to browser's timezone
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (error) {
            console.warn('Failed to get timezone, using UTC', error);
            return 'UTC';
        }
    }

    /**
     * Sets the user's timezone
     * @param {string} timeZone - IANA timezone identifier
     */
    setUserTimeZone(timeZone) {
        try {
            // Validate timezone by attempting to create a formatter
            Intl.DateTimeFormat(undefined, { timeZone });
            this.settings.timeZone = timeZone;
            localStorage.setItem('userTimeZone', timeZone);
            console.log(`Timezone set to ${timeZone}`);
        } catch (error) {
            console.error(`Invalid timezone: ${timeZone}`, error);
        }
    }

    /**
     * Formats a date according to user's timezone and locale
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const timeZone = this.getUserTimeZone();
        const locale = this.getUserLanguage();
        
        const defaultOptions = {
            timeZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        
        try {
            return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateObj.toLocaleString();
        }
    }

    /**
     * Gets current time in user's timezone
     * @returns {Date} Current date/time
     */
    getCurrentTime() {
        return new Date();
    }

    /**
     * Loads required JavaScript modules (Three.js, etc.)
     * @returns {Promise<Object>} Object containing loaded modules
     */
    async loadModules() {
        try {
            console.log('Loading modules...');
            const threeModule = await import('three');
            const {
                OrbitControls
            } = await import('OrbitControls');
            const {
                GLTFLoader
            } = await import('GLTFLoader');
            console.log('All modules loaded successfully');
            return {
                LoadingCircleWidget: LoadingCircle,
                AppIcon,
                AppGrid,
                three: threeModule,
                OrbitControls,
                GLTFLoader
            };
        } catch (error) {
            console.error("A module failed to load:", error);
            throw error;
        }
    }

    /**
     * Creates screen asset containers and elements
     * @returns {Object} Object containing created elements
     */
    createScreenAssets() {
        if (!this.topScreenElement || !this.bottomScreenElement) {
            throw new Error("Parent screen elements could not be found.");
        }

        // Create loader container
        const loaderContainer = document.createElement('div');
        loaderContainer.id = 'Loader';
        loaderContainer.style.position = 'relative';
        loaderContainer.style.zIndex = '10';
        this.topScreenElement.appendChild(loaderContainer);

        const bottomScreenWrapper = document.createElement('div');
        bottomScreenWrapper.id = 'bottom-screen-wrapper';
        this.bottomScreenElement.appendChild(bottomScreenWrapper);
        this.bottomScreenWrapper = bottomScreenWrapper;

        const appGridContainer = document.createElement('div');
        appGridContainer.id = 'bottomScreenGrid';
        bottomScreenWrapper.appendChild(appGridContainer);

        const manualContainer = document.createElement('div');
        manualContainer.id = 'manualContainer';
        manualContainer.style.display = 'none';
        this.bottomScreenElement.appendChild(manualContainer);

        // Create modal container in bottom screen instead of body
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        modalContainer.className = 'modal-overlay';
        modalContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
        `;

        // Add style to show modal when active
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay.active {
                display: flex !important;
            }
        `;
        document.head.appendChild(style);

        // Append to bottom screen instead of body
        this.bottomScreenElement.appendChild(modalContainer);

        return {
            loaderContainer,
            appGridContainer,
            manualContainer,
            bottomScreenWrapper,
            modalContainer
        };
    }

    /**
     * Main initialization method
     * Loads all apps, creates UI components, and sets up the home screen
     */
    async main() {
        try {
            this.backgroundManager.createBackgrounds();
            await document.fonts.load('12px RodinProDB');
            console.log('Fonts loaded and ready for canvas rendering.');

            // Log the topBarAppIds and alwaysOpenedApps for debugging
            console.log('topBarAppIds:', topBarAppIds);
            console.log('alwaysOpenedApps:', alwaysOpenedApps);

            let modules;
            try {
                modules = await this.loadModules();
            } catch (moduleError) {
                this.handleModuleError(moduleError);
                return;
            }

            const {
                loaderContainer,
                appGridContainer,
                manualContainer,
                bottomScreenWrapper,
                modalContainer
            } = this.createScreenAssets();

            // Initialize ModalManager and expose it globally
            this.modalManager = new ModalManager(modalContainer, {
                translations: this.languageData,
                cssVars: this.cssVars,
                sounds: {}, // Will be updated when sound system is available
                appInstance: this,
                theme: null, // Will be updated when theme is loaded
                options: {}
            });

            // Expose modalManager globally so app onClick handlers can use it
            window.modalManager = this.modalManager;
            console.log('[HomeScreenApp] ModalManager initialized and exposed globally');

            this.loaderWidget = new modules.LoadingCircleWidget({
                size: 40,
                color: "#007bff"
            });
            loaderContainer.appendChild(this.loaderWidget.element);
            this.loaderWidget.start();

            const userLanguage = this.getUserLanguage();
            await this.setLanguage(userLanguage);

            // Load timezone from localStorage or use browser default
            const storedTimeZone = localStorage.getItem('userTimeZone');
            if (storedTimeZone) {
                try {
                    // Validate stored timezone
                    Intl.DateTimeFormat(undefined, { timeZone: storedTimeZone });
                    this.settings.timeZone = storedTimeZone;
                    console.log(`Loaded timezone from storage: ${storedTimeZone}`);
                } catch (error) {
                    console.warn(`Invalid stored timezone ${storedTimeZone}, using browser default`);
                    this.settings.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                }
            } else {
                console.log(`Using browser timezone: ${this.settings.timeZone}`);
            }

            // Update ModalManager with loaded translations
            if (this.modalManager) {
                this.modalManager.translations = this.languageData;
                console.log('[HomeScreenApp] Updated ModalManager translations:', this.languageData);
            }

            // Load app configuration from JSON file
            let appConfig;
            let appFolders;

            try {
                appConfig = await loadAppConfig();
                appFolders = getEnabledAppFolders(appConfig);
                console.log(`Loaded ${appFolders.length} apps from configuration`);
            } catch (error) {
                console.error('Failed to load app configuration, using fallback:', error);
                appConfig = getFallbackConfig();
                appFolders = getEnabledAppFolders(appConfig);
            }

            if (appFolders.length === 0) {
                throw new Error('No apps found in configuration. Please check apps.json');
            }

            const appDataPromises = appFolders.map(folder =>
                import(`/content/apps/${folder}/app.js`)
                    .then(module => module.app)
                    .catch(error => {
                        console.warn(`No app.js found for ${folder}, skipping.`);
                        return null;
                    })
            );
            let appData = (await Promise.all(appDataPromises)).filter(data => data !== null);

            if (!appData || appData.length === 0) {
                throw new Error('Failed to load essential application data from app modules.');
            }

            // Filter apps based on permissions
            const currentLevel = getPermissionLevel();
            appData = appData.filter(app => {
                const appLevel = app.permissions?.level ?? 0;
                return currentLevel >= appLevel && canViewApp(app);
            });
            console.log(`Loaded ${appData.length} apps after permission filtering`);

            appData = this.processAppData(appData);

            // Initialize AssetCache and register app versions
            console.log('[HomeScreenApp] 🔄 Initializing asset cache...');
            try {
                await assetCache.ensureReady();
                
                // Register app versions for cache management
                for (const app of appData) {
                    if (app.version) {
                        await assetCache.registerAppVersion(app.id, app.version);
                        console.log(`[HomeScreenApp] Registered ${app.id} version ${app.version}`);
                    }
                }
                
                console.log('[HomeScreenApp] ✅ Asset cache initialized');
            } catch (error) {
                console.warn('[HomeScreenApp] Asset cache initialization failed, continuing without caching:', error);
            }

            // Preload assets for apps with asset configuration
            console.log('[HomeScreenApp] 🔄 Preloading app assets...');
            const preloadPromises = appData
                .filter(app => app.assets && app.assets.preloadOnInit)
                .map(async (app) => {
                    try {
                        const preloader = new AssetPreloader({
                            appId: app.id,
                            appVersion: app.version || '1.0.0',
                            THREE: modules.three,
                            GLTFLoader: modules.GLTFLoader
                        });

                        const assetUrls = [
                            ...(app.assets.models || []),
                            ...(app.assets.icons || []),
                            ...(app.assets.textures || []),
                            ...(app.assets.audio || [])
                        ].filter(url => url); // Remove null/undefined

                        if (assetUrls.length > 0) {
                            console.log(`[HomeScreenApp] Preloading ${assetUrls.length} assets for ${app.id}...`);
                            
                            await preloader.preloadAll(assetUrls, {
                                useCache: app.assets.useCache !== false,
                                onProgress: (current, total, url) => {
                                    console.log(`[HomeScreenApp] ${app.id}: ${current}/${total} - ${url}`);
                                },
                                onError: (url, error) => {
                                    console.warn(`[HomeScreenApp] Failed to preload ${url} for ${app.id}:`, error);
                                }
                            });
                            
                            console.log(`[HomeScreenApp] ✅ Preloaded assets for ${app.id}`);
                        }
                    } catch (error) {
                        console.warn(`[HomeScreenApp] Asset preloading failed for ${app.id}:`, error);
                    }
                });

            // Wait for all preloading to complete (non-blocking)
            Promise.all(preloadPromises).then(() => {
                console.log('[HomeScreenApp] ✅ All app assets preloaded');
            }).catch(error => {
                console.warn('[HomeScreenApp] Some assets failed to preload:', error);
            });

            // Load unread counts from localStorage
            this.loadUnreadCounts();

            // Apply unread counts to app data
            appData.forEach(app => {
                if (this.unreadCounts[app.id]) {
                    app.unreadCount = this.unreadCounts[app.id];
                }
            });

            // Separate top bar apps from grid apps
            const topBarApps = appData.filter(app => topBarAppIds.includes(app.id)).map(app => {
                // Resolve icon path to absolute path
                const resolvedIcon = app.icon && !app.icon.startsWith('/') && !app.icon.startsWith('http')
                    ? `/content/apps/${app.id}/${app.icon}`
                    : app.icon;

                return {
                    ...app,
                    actualIcon: resolvedIcon,  // Set actualIcon with resolved path
                    icon: resolvedIcon          // Also update icon
                };
            });
            const gridApps = appData.filter(app => !topBarAppIds.includes(app.id));

            console.log('[HomeScreenApp] Total apps loaded:', appData.length);
            console.log('[HomeScreenApp] Available app IDs:', appData.map(a => a.id));
            console.log('[HomeScreenApp] Top bar apps found:', topBarApps.length, topBarApps.map(a => a.id));
            console.log('[HomeScreenApp] Grid apps count:', gridApps.length);
            console.log('[HomeScreenApp] Top bar apps with resolved paths:', topBarApps);

            // Create TopScreen component
            this.topScreen = new TopScreen(this);
            this.topScreenElement.appendChild(this.topScreen.element);
            this.topScreen.show();

            const iconSystem = new modules.AppIcon({
                defaultBaseImage: '/content/common/assets/BlankApp_64px.png',
                unopenedImage: '/content/common/assets/giftbox_48px.png'
            });

            // Use gridApps instead of all appData for the grid
            this.appGridInstance = new modules.AppGrid(appGridContainer, gridApps, iconSystem, this.topScreenElement, {
                topScreen: this.topScreen, // Pass topScreen to use unified banner loading
                onSelectionChange: (app) => {
                    if (this.appGridControls) {
                        this.appGridControls.onGridSelectionChange(app);
                    }
                }
            });

            await this.appGridInstance.initialize();

            // Create and wait for AppGridControls to initialize (now includes top bar)
            this.appGridControls = new AppGridControls(this);
            await this.appGridControls.isReady;

            // Create top bar apps using AppGridControls
            console.log('[HomeScreenApp] Creating top bar with apps:', topBarApps.length, topBarApps.map(a => a.id));
            if (topBarApps.length === 0) {
                console.warn('[HomeScreenApp] No top bar apps found! This is unexpected.');
            }
            this.appGridControls.createTopBarAppButtons(topBarApps);

            // Verify top bar element exists and has content
            if (this.appGridControls.topBarElement) {
                console.log('[HomeScreenApp] Top bar element created, children count:', this.appGridControls.topBarElement.children.length);
                bottomScreenWrapper.appendChild(this.appGridControls.topBarElement);
            } else {
                console.error('[HomeScreenApp] Top bar element is null!');
            }

            // Create and add Home Menu Settings button on top left
            const homeMenuButton = await this.appGridControls.createHomeMenuButton();
            if (homeMenuButton) {
                bottomScreenWrapper.appendChild(homeMenuButton);
            }

            // Add size controls
            if (this.appGridControls.sizeControls && this.appGridControls.sizeControls.element) {
                bottomScreenWrapper.insertBefore(this.appGridControls.sizeControls.element, appGridContainer);
            }

            // Create SlimScrollIndicator with border and better base color
            this.scrollIndicator = new SlimScrollIndicator(appGridContainer, {
                color: getComputedStyle(document.documentElement).getPropertyValue('--hs-scrollbar-thumb').trim() || 'rgba(100, 150, 255, 0.6)',
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--hs-scrollbar-track').trim() || 'rgba(0, 0, 0, 0.2)',
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--hs-scrollbar-thumb-border').trim() || 'rgba(100, 150, 255, 0.8)',
                baseColor: getComputedStyle(document.documentElement).getPropertyValue('--hs-scrollbar-base-color').trim() || 'rgba(255, 100, 100, 0.5)',
                sizeClass: this.appGridInstance.sizeClasses[this.appGridInstance.currentSizeIndex] || 'normal-icons'
            });

            // Connect scroll indicator to AppGrid
            this.appGridInstance.setScrollbar(this.scrollIndicator);

            // Insert scroll indicator between top bar and grid
            // Position: After top bar, before grid
            if (this.appGridControls.topBarElement) {
                // Insert after top bar
                bottomScreenWrapper.insertBefore(this.scrollIndicator.element, appGridContainer);
            } else {
                // Fallback: append to wrapper
                bottomScreenWrapper.appendChild(this.scrollIndicator.element);
            }

            // Add button container
            if (this.appGridControls.buttonContainer) {
                bottomScreenWrapper.appendChild(this.appGridControls.buttonContainer);
            }

            const themeId = this.themeManager.getSavedTheme();
            const theme = await this.themeManager.loadTheme(themeId, this.appGridInstance);
            this.cssVars = { ...this.cssVars, ...theme.cssVars };

            // Update ModalManager with loaded theme
            if (this.modalManager) {
                this.modalManager.updateTheme(theme);
            }

            // Update scroll indicator colors from theme
            if (theme.assets && theme.assets.scrollbarThumb) {
                this.scrollIndicator.setColors(theme.assets.scrollbarThumb);
            }

            // Set initial button state
            const initialSelectedApp = this.appGridInstance.appData.find(app => app.id === this.appGridInstance.selectedAppId);
            if (initialSelectedApp) {
                this.appGridControls.updateOpenButton(initialSelectedApp);
            }

            this.resolveIsReady();

            // Add reset to default layout option in settings
            const settingsApp = topBarApps.find(app => app.id === 'settings');
            if (settingsApp) {
                if (!settingsApp.settings) {
                    settingsApp.settings = [];
                }
                settingsApp.settings.push({
                    id: 'reset-layout',
                    type: 'button',
                    label: 'Reset App Layout',
                    action: () => {
                        if (this.appGridInstance) {
                            this.appGridInstance.resetAppOrder();
                            alert("App layout has been reset. Please refresh the page to see the changes.");
                        }
                    }
                });
            }

        } catch (err) {
            this.handleInitializationError(err);
        } finally {
            if (this.loaderWidget) {
                this.loaderWidget.stop();
                // Remove the loader container from DOM
                const loaderContainer = document.getElementById('Loader');
                if (loaderContainer && loaderContainer.parentElement) {
                    loaderContainer.parentElement.removeChild(loaderContainer);
                }
                this.loaderWidget = null;
            }
        }
    }

    /**
     * Handles deep link navigation to articles
     * @param {string} slug - Article slug to navigate to
     */
    async handleDeepLink(slug) {
        await this.isReady;

        try {
            const mailAppModule = await import('/content/apps/mail/app.js');
            const mailData = mailAppModule.app.manualArticle;
            let articleData = null;

            if (mailData.slug === slug) {
                articleData = mailData;
            } else {
                const mailApp = mailAppModule.app;
                if (mailApp.articles) {
                    articleData = mailApp.articles.find(a => a.slug === slug);
                }
            }

            if (articleData) {
                this.showArticle(articleData);
            } else {
                console.warn(`Article with slug '${slug}' not found.`);
            }
        } catch (error) {
            console.error("Error handling deep link:", error);
        }
    }

    /**
     * Draws text on a canvas context
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} font - Font specification
     * @param {string} fillStyle - Fill color
     * @param {string} textAlign - Text alignment
     * @param {string} textBaseline - Text baseline
     * @param {number} maxWidth - Maximum width
     * @param {number} lineSpacingFactor - Line spacing multiplier
     * @private
     */
    _drawTextOnCanvas(context, text, x, y, font, fillStyle, textAlign, textBaseline, maxWidth, lineSpacingFactor) {
        this.canvasManager.renderTextToCanvas(context, text, x, y, font, fillStyle, textAlign, textBaseline, maxWidth, lineSpacingFactor);
    }

    /**
     * Shows the manual/help article for an app
     * NOTE: Manuals are currently not implemented - shows info modal instead
     * @param {Object|null} selectedApp - App to show manual for, or null for general manual
     */
    async showManual(selectedApp = null) {
        await this.isReady;

        // Show info modal that manuals are not implemented
        if (this.modalManager) {
            const appName = selectedApp?.localizedLabel || selectedApp?.label || 'this app';
            this.modalManager.showInfoModal({
                title: 'Manual Not Available',
                message: `Manuals are not currently implemented.\n\nThe manual system for ${appName} will be available in a future update.`,
                onConfirm: () => {
                    console.log('[HomeScreenApp] Manual not available modal closed');
                }
            });
        }

        /* COMMENTED OUT - Manual loading code (not currently implemented)
        let manualArticleData = null;

        // If a specific app is selected, try to load its manual
        if (selectedApp && selectedApp.id) {
            try {
                console.log(`Attempting to load manual for app: ${selectedApp.id}`);
                const appModule = await import(`/content/apps/${selectedApp.id}/app.js`);

                if (appModule.app && appModule.app.manualArticle) {
                    const manual = appModule.app.manualArticle;

                    if (manual.title || manual.content || manual.locales) {
                        manualArticleData = manual;
                        console.log(`Loaded manual for app: ${selectedApp.id}`);
                    } else {
                        console.warn(`Manual for ${selectedApp.id} has unsupported format, falling back to default`);
                    }
                } else {
                    console.log(`No manual article found for app: ${selectedApp.id}, using default`);
                }
            } catch (error) {
                console.warn(`Could not load manual for app: ${selectedApp.id}`, error);
            }
        }

        // If no app-specific manual was found, fall back to mail app's manual
        if (!manualArticleData) {
            console.log('Loading default manual (website overview from mail app)');
            const mailAppModule = await import('/content/apps/mail/app.js');
            manualArticleData = mailAppModule.app.manualArticle;
        }

        if (manualArticleData) {
            this.showArticle(manualArticleData);
        } else {
            console.error('No manual article available');
        }
        */
    }

    /**
     * Displays an article in the article viewer
     * @param {Object} articleData - Article data with title, content, etc.
     */
    showArticle(articleData) {
        console.log('[HomeScreenApp] showArticle called with:', articleData);

        if (this.article) {
            this.article.destroy();
        }

        const manualContainer = document.getElementById('manualContainer');
        console.log('[HomeScreenApp] Manual container found:', !!manualContainer);

        manualContainer.innerHTML = '';
        manualContainer.style.display = 'block';
        manualContainer.style.pointerEvents = 'auto'; // Ensure manual can receive clicks

        const localizedArticle = this.getLocalizedArticle(articleData);
        console.log('[HomeScreenApp] Localized article result:', localizedArticle);
        console.log('[HomeScreenApp] Creating Article with appInstance:', this);
        console.log('[HomeScreenApp] Article cssVars:', this.cssVars);
        console.log('[HomeScreenApp] Article richTextRenderer:', !!this.richTextRenderer);
        console.log('[HomeScreenApp] Article imageManager:', !!this.imageManager);

        this.article = new Article({
            appInstance: this,
            article: localizedArticle,
            cssVars: this.cssVars,
            richTextRenderer: this.richTextRenderer,
            onClose: () => {
                if (this.article) {
                    this.article.destroy();
                }
                this.article = null;
                manualContainer.style.display = 'none';
                manualContainer.style.pointerEvents = 'none'; // Prevent clicks when hidden
                this.toggleUI(true);
            }
        });

        console.log('[HomeScreenApp] Article component created:', this.article);
        console.log('[HomeScreenApp] Article element:', this.article.element);

        manualContainer.appendChild(this.article.element);
        console.log('[HomeScreenApp] Article element appended to container');

        this.toggleUI(false);
    }

    /**
     * Gets the localized version of an article
     * @param {Object} articleData - Article data with locales
     * @returns {Object} Localized article data
     */
    getLocalizedArticle(articleData) {
        console.log('[HomeScreenApp] getLocalizedArticle called with:', articleData);
        console.log('[HomeScreenApp] Article has locales?', !!articleData.locales);

        if (!articleData.locales) {
            console.log('[HomeScreenApp] No locales, returning article as-is');
            return articleData;
        }

        const userLanguage = this.getUserLanguage();
        console.log('[HomeScreenApp] User language:', userLanguage);

        const locale = articleData.locales[userLanguage] || articleData.locales['en-US'] || articleData.locales['en'];
        console.log('[HomeScreenApp] Selected locale:', locale);

        if (locale) {
            const localizedArticle = { ...articleData, ...locale };
            console.log('[HomeScreenApp] Localized article:', localizedArticle);
            return localizedArticle;
        }

        console.log('[HomeScreenApp] No matching locale, returning original article');
        return articleData;
    }

    /**
     * Toggles UI element visibility (for article view)
     * Controls, top bar, and action buttons remain visible and interactive
     * Only hides grid and scroll indicator when manual is shown
     * @param {boolean} show - Whether to show or hide UI elements
     */
    toggleUI(show) {
        const visibility = show ? 'visible' : 'hidden';
        const opacity = show ? 1 : 0;
        const pointerEvents = show ? 'auto' : 'none';

        const elementsToToggle = [];

        // Only hide grid and scroll indicator, NOT controls, top bar, or action buttons
        if (this.appGridInstance && this.appGridInstance.container) {
            elementsToToggle.push(this.appGridInstance.container);
        }
        if (this.scrollIndicator && this.scrollIndicator.element) {
            elementsToToggle.push(this.scrollIndicator.element);
        }

        // Controls, top bar, size controls, and action buttons remain visible and interactive at all times
        // This allows users to switch apps, adjust settings, or close manual while viewing

        elementsToToggle.forEach(el => {
            if (el) {
                el.style.visibility = visibility;
                el.style.opacity = opacity;
                el.style.pointerEvents = pointerEvents;
            }
        });
    }

    /**
     * Handles unwrapping an unopened app
     * Displays unwrap animation and reveals the actual app
     * @param {Object} app - The app to unwrap
     */
    async handleUnwrap(app) {
        // Check if app can be unwrapped
        if (!canViewApp(app) || app.permissions?.unwrappable === false) {
            console.warn(`Cannot unwrap ${app.id}: insufficient permissions or unwrappable = false`);
            return;
        }

        // Use custom unwrap banner animation
        await unwrap(this.topScreenElement, app, () => {
            // Callback after animation completes
            this.appGridControls.updateOpenButton({ ...app, unopened: false });
        }, {
            duration: 1500,
            sounds: this.appGridInstance?.soundManager?.sounds
        });

        // Trigger the app grid's unwrap logic
        this.appGridInstance.triggerUnwrap(app, () => {
            this.appGridControls.updateOpenButton({ ...app, unopened: false });
        });
    }

    /**
     * Processes app data and converts string onClick handlers to functions
     * Also sets unopened state based on app configuration and storage
     * @param {Array} appData - Array of app data objects
     * @returns {Array} Processed app data array
     */
    processAppData(appData) {
        // Load opened state directly from localStorage (AppGrid not created yet)
        let openedApps = {};
        try {
            const storedOpenedApps = localStorage.getItem('openedApps');
            if (storedOpenedApps) {
                openedApps = JSON.parse(storedOpenedApps);
                console.log('[HomeScreenApp] Loaded opened apps from localStorage:', openedApps);
            }
        } catch (error) {
            console.error('[HomeScreenApp] Failed to load opened apps from localStorage:', error);
        }

        return appData.map(app => {
            // Convert string onClick to function
            if (app.onClick && typeof app.onClick === 'string') {
                try {
                    app.onClick = new Function('app', 'appGrid', 'languageData', `return (${app.onClick})(app, appGrid, languageData)`);
                } catch (e) {
                    console.error(`Error creating function from string for app "${app.id}":`, e);
                    app.onClick = () => console.error(`Invalid onClick handler for ${app.id}`);
                }
            }

            // Set unopened state
            // Check if app should always be opened
            if (alwaysOpenedApps.includes(app.id)) {
                app.unopened = false;
                console.log(`[HomeScreenApp] ${app.id} is set to always opened (never wrapped)`);
            } else {
                // Check if app has been opened before in localStorage
                const hasBeenOpened = openedApps[app.id] === true;

                // Only set unopened if not in storage (defaults to wrapped for new apps)
                if (hasBeenOpened) {
                    app.unopened = false;
                    console.log(`[HomeScreenApp] ${app.id} has been opened before - not wrapped`);
                } else if (typeof app.unopened !== 'boolean') {
                    app.unopened = true;
                    console.log(`[HomeScreenApp] ${app.id} is set to unopened (wrapped) - first time`);
                }
            }

            return app;
        });
    }

    /**
     * Handles module loading errors
     * @param {Error} moduleError - The error that occurred
     */
    handleModuleError(moduleError) {
        console.error('Module loading failed, attempting fallback:', moduleError);
        if (this.bottomScreenElement) {
            this.bottomScreenElement.innerHTML = '';
            const errorContainer = document.createElement('div');
            errorContainer.style.cssText = 'color: red; padding: 20px; text-align: center; font-family: "Rodin", "RodinProDB", sans-serif;';
            errorContainer.innerHTML = `
            <h3 style="font-family: 'Rodin', 'RodinProDB', sans-serif;">Module Loading Failed</h3>
            <p style="font-family: 'Rodin', 'RodinProDB', sans-serif;">Error: ${moduleError.message}</p>
            <p style="font-family: 'Rodin', 'RodinProDB', sans-serif;">Check browser console for details</p>
            <p style="font-family: 'Rodin', 'RodinProDB', sans-serif;">Make sure the development server is running</p>
        `;
            this.bottomScreenElement.appendChild(errorContainer);
        }
    }

    /**
     * Handles initialization errors
     * @param {Error} err - The error that occurred
     */
    handleInitializationError(err) {
        console.error("Failed to initialize application:", err);
        if (this.bottomScreenElement) {
            this.bottomScreenElement.innerHTML = '';
            const errorCanvas = this.canvasManager.renderTextToCanvas('Failed to load. Check console.', {
                fontCss: '16px RodinProDB',
                fillStyle: 'red',
                width: 320,
                height: 240
            });
            this.bottomScreenElement.appendChild(errorCanvas);
        }
    }

    /**
     * Initializes the home screen application
     * Sets up styles, event listeners, and starts main() method
     */
    init() {
        this.styleManager.injectStyles();
        
        // Expose homeScreenApp globally so apps can access timezone and other utilities
        window.homeScreenApp = this;
        
        window.addEventListener('unhandledrejection', event => {
            console.error('Unhandled promise rejection:', event.reason);
        });
        
        // Listen for time change events from settings app
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'timeChanged' && event.data.time) {
                console.log('[HomeScreen] Time changed event received:', event.data.time);
                const customTime = new Date(event.data.time);
                const systemTime = new Date();
                const offset = customTime.getTime() - systemTime.getTime();
                
                // Update TopScreen with new offset
                if (this.topScreen && typeof this.topScreen.registerTimeOffset === 'function') {
                    this.topScreen.registerTimeOffset(offset);
                }
            }
        });
        
        this.main();
        document.addEventListener('selectstart', e => {
            const target = e.target;
            if (target.classList.contains('appgrid-size-btn') || target.closest('.app-icon')) {
                e.preventDefault();
            }
        });
    }
}

const app = new HomeScreenApp();
app.init();