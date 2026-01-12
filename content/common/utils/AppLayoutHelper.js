/**
 * AppLayoutHelper - Processes app configurations for different homescreen layouts
 * Handles layout-specific icons, banners, jingles, and state management
 * @class
 */
export class AppLayoutHelper {
    /**
     * Creates a new AppLayoutHelper instance
     * @param {string} [layoutType='3ds'] - The layout type (e.g., '3ds', 'switch', 'modern')
     */
    constructor(layoutType = '3ds') {
        this.layoutType = layoutType;
        console.log(`[AppLayoutHelper] Initialized with layout type: ${layoutType}`);
    }

    /**
     * Processes an app object and applies layout-specific configuration
     * Handles backward compatibility with old flat structure
     * @param {Object} app - The raw app configuration object
     * @param {Object} options - Processing options
     * @param {boolean} [options.isTopBar=false] - Whether this app is in the top bar
     * @param {boolean} [options.forceOpened=false] - Force app to be in opened state
     * @returns {Object} Processed app object with layout-specific properties
     */
    processApp(app, options = {}) {
        const { isTopBar = false, forceOpened = false } = options;
        
        // Create a copy to avoid mutating original
        const processedApp = { ...app };
        
        // Determine if app should be in unopened state
        const canBeUnopened = app.state?.canBeUnopened ?? true;
        const alwaysOpened = app.state?.alwaysOpened ?? false;
        const shouldBeOpened = isTopBar || forceOpened || alwaysOpened || !canBeUnopened;
        
        // Check if app uses new layout system
        if (app.layouts && app.layouts[this.layoutType]) {
            console.log(`[AppLayoutHelper] Processing ${app.id} with layout: ${this.layoutType}`);
            this._applyLayoutConfig(processedApp, shouldBeOpened);
        } else if (app.layouts) {
            // App has layouts but not for current type, fallback to first available
            const fallbackLayout = Object.keys(app.layouts)[0];
            console.warn(`[AppLayoutHelper] Layout ${this.layoutType} not found for ${app.id}, using ${fallbackLayout}`);
            this.layoutType = fallbackLayout;
            this._applyLayoutConfig(processedApp, shouldBeOpened);
        } else {
            // Legacy app with flat structure - convert to new format
            console.log(`[AppLayoutHelper] Converting legacy app ${app.id} to layout format`);
            this._applyLegacyConfig(processedApp, shouldBeOpened);
        }
        
        // Mark unopened state
        processedApp.unopened = !shouldBeOpened && canBeUnopened;
        
        // Add metadata
        processedApp._layoutType = this.layoutType;
        processedApp._isTopBar = isTopBar;
        processedApp._processed = true;
        
        console.log(`[AppLayoutHelper] Processed ${app.id}:`, {
            layout: this.layoutType,
            isTopBar,
            unopened: processedApp.unopened,
            icon: processedApp.icon,
            banner: processedApp.banner || processedApp.bannerModule
        });
        
        return processedApp;
    }

    /**
     * Applies layout-specific configuration from app.layouts
     * @param {Object} app - The app object to modify
     * @param {boolean} shouldBeOpened - Whether app should be in opened state
     * @private
     */
    _applyLayoutConfig(app, shouldBeOpened) {
        const layoutConfig = app.layouts[this.layoutType];
        
        if (!layoutConfig) {
            console.error(`[AppLayoutHelper] Layout config missing for ${this.layoutType}`);
            return;
        }
        
        if (shouldBeOpened) {
            // Use opened state properties
            app.icon = layoutConfig.icon;
            app.banner = layoutConfig.banner;
            app.bannerModule = layoutConfig.bannerModule;
            app.bannerJingle = layoutConfig.bannerJingle;
            app.actualIcon = layoutConfig.icon; // Store actual icon for reference
        } else {
            // Use unopened/wrapped state properties
            const unopenedConfig = layoutConfig.unopened || {};
            
            app.icon = unopenedConfig.icon || '/content/common/assets/giftbox_64px.png';
            app.banner = unopenedConfig.banner;
            app.bannerModule = unopenedConfig.bannerModule;
            app.bannerJingle = unopenedConfig.jingle;
            
            // Store the opened config for when app is unwrapped
            app.actualIcon = layoutConfig.icon;
            app.actualBanner = layoutConfig.banner;
            app.actualBannerModule = layoutConfig.bannerModule;
            app.actualBannerJingle = layoutConfig.bannerJingle;
        }
    }

    /**
     * Converts legacy flat config to new layout format
     * Provides backward compatibility
     * @param {Object} app - The app object to modify
     * @param {boolean} shouldBeOpened - Whether app should be in opened state
     * @private
     */
    _applyLegacyConfig(app, shouldBeOpened) {
        if (shouldBeOpened) {
            // Use opened properties (already in flat structure)
            app.actualIcon = app.icon;
        } else {
            // Use unopened properties if they exist
            const unopenedIcon = app.unopenedIcon || '/content/common/assets/giftbox_64px.png';
            const unopenedBanner = app.unopenedBanner;
            const unopenedBannerModule = app.unopenedBannerModule;
            const unopenedJingle = app.unopenedJingle;
            
            // Store actual (opened) properties
            app.actualIcon = app.icon;
            app.actualBanner = app.banner;
            app.actualBannerModule = app.bannerModule;
            app.actualBannerJingle = app.bannerJingle;
            
            // Set current (unopened) properties
            app.icon = unopenedIcon;
            app.banner = unopenedBanner;
            app.bannerModule = unopenedBannerModule;
            app.bannerJingle = unopenedJingle;
        }
    }

    /**
     * Unwraps an app (transitions from unopened to opened state)
     * @param {Object} app - The app object to unwrap
     * @returns {Object} The unwrapped app object
     */
    unwrapApp(app) {
        if (!app.unopened) {
            console.warn(`[AppLayoutHelper] Attempted to unwrap already opened app: ${app.id}`);
            return app;
        }
        
        console.log(`[AppLayoutHelper] Unwrapping app: ${app.id}`);
        
        // Restore actual (opened) properties
        app.icon = app.actualIcon;
        app.banner = app.actualBanner;
        app.bannerModule = app.actualBannerModule;
        app.bannerJingle = app.actualBannerJingle;
        app.unopened = false;
        
        return app;
    }

    /**
     * Processes a batch of apps
     * @param {Array} apps - Array of app objects
     * @param {Object} options - Processing options
     * @returns {Array} Processed apps
     */
    processBatch(apps, options = {}) {
        return apps.map(app => this.processApp(app, options));
    }

    /**
     * Gets the current layout type
     * @returns {string} Current layout type
     */
    getLayoutType() {
        return this.layoutType;
    }

    /**
     * Sets the layout type
     * @param {string} layoutType - New layout type
     */
    setLayoutType(layoutType) {
        console.log(`[AppLayoutHelper] Changing layout from ${this.layoutType} to ${layoutType}`);
        this.layoutType = layoutType;
    }

    /**
     * Validates an app configuration
     * @param {Object} app - App object to validate
     * @returns {Object} Validation result with warnings
     */
    validateApp(app) {
        const warnings = [];
        const errors = [];
        
        // Check for required fields
        if (!app.id) errors.push('Missing required field: id');
        if (!app.locales) warnings.push('Missing locales - app label may not display correctly');
        
        // Check layout configuration
        if (!app.layouts && !app.icon) {
            errors.push('App must have either layouts config or legacy icon property');
        }
        
        // Check if top bar app has unopened properties (should warn)
        if (app.state?.alwaysOpened) {
            if (app.layouts) {
                Object.keys(app.layouts).forEach(layoutKey => {
                    const layout = app.layouts[layoutKey];
                    if (layout.unopened) {
                        warnings.push(`Top bar app ${app.id} has unopened config in ${layoutKey} layout that will be ignored`);
                    }
                });
            }
            if (app.unopenedIcon || app.unopenedBanner || app.unopenedJingle) {
                warnings.push(`Top bar app ${app.id} has unopened properties that will be ignored`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Migrates old app config to new layout format
     * @param {Object} oldApp - Old format app
     * @param {string} [targetLayout='3ds'] - Target layout type
     * @returns {Object} New format app
     */
    static migrateToLayoutFormat(oldApp, targetLayout = '3ds') {
        const newApp = { ...oldApp };
        
        // Create layouts object
        newApp.layouts = {
            [targetLayout]: {
                icon: oldApp.icon,
                banner: oldApp.banner,
                bannerModule: oldApp.bannerModule,
                bannerJingle: oldApp.bannerJingle
            }
        };
        
        // Add unopened config if it exists
        if (oldApp.unopenedIcon || oldApp.unopenedBanner || oldApp.unopenedBannerModule || oldApp.unopenedJingle) {
            newApp.layouts[targetLayout].unopened = {
                icon: oldApp.unopenedIcon,
                banner: oldApp.unopenedBanner,
                bannerModule: oldApp.unopenedBannerModule,
                jingle: oldApp.unopenedJingle
            };
        }
        
        // Add state config
        newApp.state = {
            canBeUnopened: !!oldApp.unopenedIcon,
            alwaysOpened: false
        };
        
        // Remove old properties
        delete newApp.icon;
        delete newApp.banner;
        delete newApp.bannerModule;
        delete newApp.bannerJingle;
        delete newApp.unopenedIcon;
        delete newApp.unopenedBanner;
        delete newApp.unopenedBannerModule;
        delete newApp.unopenedJingle;
        
        console.log(`[AppLayoutHelper] Migrated ${oldApp.id} to layout format:`, newApp.layouts);
        
        return newApp;
    }

    /**
     * Creates a default layout config for an app
     * @param {string} appId - App ID
     * @param {string} iconPath - Path to icon
     * @param {string} [layoutType='3ds'] - Layout type
     * @returns {Object} Default layout config
     */
    static createDefaultLayout(appId, iconPath, layoutType = '3ds') {
        return {
            id: appId,
            layouts: {
                [layoutType]: {
                    icon: iconPath || `/content/apps/${appId}/icon.png`,
                    banner: null,
                    bannerModule: null,
                    bannerJingle: null,
                    unopened: {
                        icon: '/content/common/assets/giftbox_64px.png',
                        banner: '/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js',
                        bannerModule: '/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js',
                        jingle: '/content/common/banners/unopened/TestJingle.mp3'
                    }
                }
            },
            state: {
                canBeUnopened: true,
                alwaysOpened: false
            }
        };
    }
}
