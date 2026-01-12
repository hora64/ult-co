/**
 * HomeScreen 3DS - Unified Configuration
 * Centralized configuration for apps, themes, and UI defaults
 */

// ============================================================================
// APP CONFIGURATION
// ============================================================================

/**
 * Apps configuration with metadata
 * @type {Object}
 */
export const appsConfig = {
    version: "1.0.0",
    lastUpdated: "2024-01-01T00:00:00Z",
    apps: [
      //  { id: "contestellations", enabled: true, folder: "contestellations" },
      //  { id: "digishop", enabled: true, folder: "digishop" },
      //  { id: "homeScreen", enabled: true, folder: "homeScreen" },
        { id: "info", enabled: true, folder: "info" },
        { id: "mail", enabled: true, folder: "mail" },
       // { id: "musicApp", enabled: true, folder: "musicApp" },
      //  { id: "oceanDemo", enabled: true, folder: "oceanDemo" },
      //  { id: "oldWebsite", enabled: true, folder: "oldWebsite" },
        { id: "settings", enabled: true, folder: "settings" },
    //    { id: "testApp", enabled: true, folder: "testApp" },
      //  { id: "ultcoCharacters", enabled: true, folder: "ultcoCharacters" },
      //  { id: "adventure", enabled: true, folder: "adventure" },
        { id: "windows", enabled: true, folder: "windows" },
        {id: "feedback", enabled: true, folder: "feedback"},
        {id: "homeScreen_WiiU", enabled: true, folder: "homeScreen_WiiU"},
        { id: "ultco2004", enabled: false, folder: "ultco2004" },
    ]
};

/**
 * Gets list of enabled app folders from configuration
 * @returns {string[]} Array of app folder names
 */
export function getEnabledAppFolders() {
    return appsConfig.apps
        .filter(app => app.enabled !== false)
        .map(app => app.folder)
        .filter(folder => folder);
}

/**
 * Apps that should appear in the top bar
 * These are quick-access apps displayed at the top of the bottom screen
 */
export const topBarAppIds = ['info', 'mail', 'settings'];

/**
 * Top bar configuration
 * Controls the appearance and behavior of the top bar
 */
export const topBarConfig = {
    minIconCount: 5,  // Minimum number of icons to display (includes apps + empty tiles)
    maxAppCount: 5,  // Maximum number of app icons before scrolling is needed
    emptyTileCount: 0 // Number of empty tiles to show after apps
};

/**
 * Apps that should always be opened (never wrapped in gift box)
 * These apps will never show the unopened/gift box state
 */
export const alwaysOpenedApps = ['info', 'mail', 'settings'];

/**
 * Apps that have manual articles available
 * Used to determine whether to show the Manual button
 */
export const appsWithManuals = [
    'mail', 
    'settings', 
    'homeScreen_3DS',
    'homeScreen_WiiU',
    'contestellations',
    'digishop',
    'musicApp',
    'adventure',
    'oceanDemo',
    'windows',
    'ultcoCharacters',
];

/**
 * Application folders that should be loaded for routing
 * This list is used by the router to dynamically import app.js modules
 * Generated from appsConfig
 */
export const appFolders = getEnabledAppFolders();

/**
 * Grid configuration
 * Controls the total number of tile spaces in the app grid
 */
export const gridConfig = {
    totalTileSpaces: 240,  // Total number of tile spaces available
    baseRows: 6,           // Base row count for storage (visual rows change with size)
    
    // App coordinate spawns - define specific positions for apps
    // Format: { appId: { row: number, col: number } }
    // NOTE: Coordinate spawns only apply to INITIAL layout creation
    // User-arranged positions take priority and will not be overridden
    coordinateSpawns: {
        // Example: info app always spawns at row 0, col 0 (on first load)
        // "info": { row: 0, col: 0 },
        // "mail": { row: 1, col: 0 },
        // "settings": { row: 2, col: 0 },
    },
    
    // Whether to respect coordinate spawns after initial layout
    // When false, spawns only apply on first grid creation
    // When true, spawns override user positions (not recommended)
    overrideUserPositions: false
};

// ============================================================================
// SELECTOR CONFIGURATION
// ============================================================================

/**
 * Selector glow configuration
 * Controls the appearance and layering of the selection indicator
 */
export const selectorConfig = {
    // Z-index positioning relative to app icon
    // 'behind' - Selector appears behind the app icon (default)
    // 'infront' - Selector appears in front of the app icon
    zPosition: 'behind',
    
    // Custom z-index values (advanced)
    zIndexBehind: 0,   // Z-index when selector is behind icon
    zIndexInfront: 10  // Z-index when selector is in front of icon
};

// ============================================================================
// ACTION BAR CONFIGURATION
// ============================================================================

/**
 * Action bar color configuration
 * Controls the appearance of the bottom action bar (Open/Manual buttons)
 */
export const actionBarConfig = {
    // Default action bar colors (can be overridden per-app via actionButtonColors)
    defaultColors: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        pressedBackgroundColor: 'rgba(255, 255, 255, 0.3)',
        disabledBackgroundColor: 'rgba(128, 128, 128, 0.3)',
        textColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    
    // Action bar background/container colors
    barBackgroundColor: 'transparent',
    barBorderColor: 'transparent',
    
    // Whether to apply gradient to action bar
    enableGradient: false,
    gradientColors: {
        start: 'rgba(0, 0, 0, 0.2)',
        end: 'rgba(0, 0, 0, 0.1)'
    }
};

/**
 * App directory paths
 * Central location for app file paths used throughout the system
 */
export const appPaths = {
    baseDirectory: '/content/apps',
    commonAssets: '/content/common/assets',
    themes: '/content/apps/homeScreen_3DS/themes',
    
    // Common app assets
    defaultIcon: '/content/common/assets/BlankApp_64px.png',
    giftBoxIcon: '/content/common/assets/giftbox_48px.png',
    
    // Helper function to get app directory
    getAppDirectory: (appId) => `/content/apps/${appId}`,
    
    // Helper function to get app icon path
    getAppIcon: (appId, iconName) => `/content/apps/${appId}/${iconName}`,
    
    // Helper function to get app file
    getAppFile: (appId, fileName) => `/content/apps/${appId}/${fileName}`
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

/**
 * Default configuration for unopened apps and home screen
 * These values can be overridden by theme CSS variables or app.js
 */
export const themeDefaults = {
    // Unopened app configuration (can be overridden per-app)
    unopened: {
        icon: '/content/common/assets/giftbox_48px.png',
        bannerModule: '/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js',
        jingle: '/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav'
    },

    // Default blank/placeholder app configuration
    defaultApp: {
        icon: '/content/common/assets/BlankApp_64px.png',
        backgroundIcon: null // Default background for non-baseIcon apps
    },

    // Sound file locations (can be overridden by themes)
    sounds: {
        click: '/content/common/sfx/select6.ogg',
        select: '/content/common/sfx/select5.ogg',
        launch: '/content/common/sfx/select3.ogg',
        sizeUp: '/content/common/sfx/select2.ogg',
        sizeDown: '/content/common/sfx/select.ogg',
        grab: '/content/common/sfx/select.ogg',
        openBox: '/content/common/sfx/open.ogg'
    },
    
    // Background music (can be overridden by themes)
    music: {
        background: '', // Empty = disabled, or path to audio file
        volume: 0.3,
        loop: true
    },

    // Selection glow sprite
    selectionGlow: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png',

    // Scrollbar assets
    scrollbar: {
        middle: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/HorizontalScrollBar_Middle.png',
        side: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/HorizontalScrollBar_Side.png'
    },

    // Size control button sprites
    sizeControls: {
        increase: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/PlusSpriteButton_64px.png',
        decrease: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/MinusSpriteButton_64px.png'
    }
};

/**
 * Gets a theme value from CSS variables with fallback to defaults
 * @param {string} varName - CSS variable name (with or without --)
 * @param {*} defaultValue - Fallback value if CSS variable not found
 * @returns {string} The resolved value
 */
export function getThemeVar(varName, defaultValue) {
    const cssVarName = varName.startsWith('--') ? varName : `--${varName}`;
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();

    // Remove quotes if present (CSS variables can include quotes)
    const cleanValue = value ? value.replace(/^["']|["']$/g, '') : '';

    return cleanValue || defaultValue;
}

/**
 * Gets all theme asset URLs from CSS variables with fallbacks
 * @returns {Object} Object containing all asset URLs
 */
export function getThemeAssets() {
    return {
        // Unopened app assets (CSS variable support)
        unopenedIcon: getThemeVar('--hs-unopened-icon', themeDefaults.unopened.icon),
        unopenedBannerModule: getThemeVar('--hs-unopened-banner-module', themeDefaults.unopened.bannerModule),
        unopenedJingle: getThemeVar('--hs-unopened-jingle', themeDefaults.unopened.jingle),

        // Default app icons (CSS variable support)
        defaultAppIcon: getThemeVar('--hs-default-app-icon', themeDefaults.defaultApp.icon),
        defaultBackgroundIcon: getThemeVar('--hs-default-background-icon', themeDefaults.defaultApp.backgroundIcon),

        // Sounds
        soundClick: getThemeVar('--hs-sound-click', themeDefaults.sounds.click),
        soundSelect: getThemeVar('--hs-sound-select', themeDefaults.sounds.select),
        soundLaunch: getThemeVar('--hs-sound-launch', themeDefaults.sounds.launch),
        soundSizeUp: getThemeVar('--hs-sound-size-up', themeDefaults.sounds.sizeUp),
        soundSizeDown: getThemeVar('--hs-sound-size-down', themeDefaults.sounds.sizeDown),
        soundGrab: getThemeVar('--hs-sound-grab', themeDefaults.sounds.grab),
        soundOpenBox: getThemeVar('--hs-sound-open-box', themeDefaults.sounds.openBox),

        // Selection glow
        selectionGlow: getThemeVar('--hs-selection-glow-sprite', themeDefaults.selectionGlow),

        // Scrollbar
        scrollBarMiddle: getThemeVar('--hs-scrollbar-middle-sprite', themeDefaults.scrollbar.middle),
        scrollBarSide: getThemeVar('--hs-scrollbar-side-sprite', themeDefaults.scrollbar.side),

        // Size controls
        sizeIncrease: getThemeVar('--hs-size-increase-sprite', themeDefaults.sizeControls.increase),
        sizeDecrease: getThemeVar('--hs-size-decrease-sprite', themeDefaults.sizeControls.decrease)
    };
}

/**
 * Resolves app-specific icon/banner/jingle properties with CSS variable fallbacks
 * Priority: app.js value > CSS variable > theme default
 * NEW SCHEMA: All apps use base + overlay pattern for consistency and animation support
 * @param {Object} appData - App data object from app.js
 * @returns {Object} Resolved properties
 */
export function resolveAppAssets(appData) {
    const themeAssets = getThemeAssets();

    // NEW SCHEMA: Separate base layer and overlay layer for all apps
    // This allows animated overlays and consistent rendering
    
    // For baseIcon apps:
    // - backgroundIcon: the static base layer (background)
    // - icon: the overlay (can be animated)
    // - When wrapped: gift box replaces the overlay
    
    // For regular apps:
    // - backgroundIcon: the static base layer
    // - icon: the overlay (can be animated)
    // - When wrapped: gift box replaces the overlay

    return {
        // Icon properties (overlay layer)
        icon: appData.icon || themeAssets.defaultAppIcon,
        actualIcon: appData.actualIcon || appData.icon || themeAssets.defaultAppIcon,

        // Base layer properties
        backgroundIcon: appData.backgroundIcon || themeAssets.defaultBackgroundIcon,
        baseImage: appData.baseImage || themeAssets.defaultBackgroundIcon,

        // Wrap/gift box properties
        wrapIcon: appData.wrapIcon || themeAssets.unopenedIcon,
        unopenedIcon: appData.wrapIcon || themeAssets.unopenedIcon,

        // Banner and jingle properties
        unopenedBannerModule: appData.unopenedBannerModule || themeAssets.unopenedBannerModule,
        unopenedJingle: appData.unopenedJingle || themeAssets.unopenedJingle,
        bannerModule: appData.bannerModule,
        banner: appData.banner,
        jingle: appData.jingle,
        bannerJingle: appData.bannerJingle,

        // NEW: Animation properties
        animated: appData.animated || false,
        animationFrames: appData.animationFrames || 1,
        animationSpeed: appData.animationSpeed || 100, // ms per frame
        
        // Preserve baseIcon flag for rendering logic
        baseIcon: appData.baseIcon || false
    };
}
