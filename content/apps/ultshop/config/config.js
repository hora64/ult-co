/**
 * UltShop - Application Configuration
 * Settings for grid layout, features, and app-specific behavior
 * 
 * Note: Resolution is defined in app.js (400x480)
 * Note: Colors and asset paths are defined in CSS variables (see ultshop.html)
 */

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

/**
 * Product grid layout configuration
 * Controls how products are displayed in the storefront
 */
export const productGrid = {
    columns: 3,          // Number of columns in grid
    cardWidth: 90,       // Width of each product card (px)
    cardHeight: 90,      // Height of each product card (px)
    gap: 10,             // Gap between cards (px)
    startY: 50           // Y position where grid starts (px)
};

// ============================================================================
// APPLICATION METADATA
// ============================================================================

/**
 * Application metadata
 * Basic information about the UltShop application
 */
export const appMetadata = {
    appId: 'ultshop',
    appName: 'UltShop',
    version: '1.0.0',
    author: 'Ult & Co.',
    description: 'Digital Asset Marketplace'
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature toggles for optional functionality
 * Enable/disable features without code changes
 */
export const features = {
    enableSoundEffects: false,    // Enable UI sound effects
    enableAnimations: true,       // Enable canvas animations
    enableImagePreloading: true,  // Preload product images
    enableCart: true,             // Enable shopping cart
    enableCheckout: true,         // Enable checkout flow
    showLoadingScreen: true,      // Show loading overlay on init
    debugMode: false              // Enable debug logging
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/**
 * UI behavior and interaction settings
 */
export const uiConfig = {
    // Canvas rendering
    enableCrispEdges: true,       // Enable pixelated rendering
    canvasAntialiasing: false,    // Disable canvas antialiasing
    
    // Click/touch behavior
    clickDelay: 0,                // Delay before click action (ms)
    doubleClickThreshold: 300,    // Double-click detection time (ms)
    
    // Loading behavior
    minimumLoadTime: 500,         // Minimum time to show loading screen (ms)
    imageLoadTimeout: 5000,       // Timeout for image loading (ms)
    
    // Text rendering
    defaultFont: 'Rodin, sans-serif',
    fallbackFont: 'sans-serif',
    
    // Header and footer dimensions
    headerHeight: 50,             // Header height (px)
    footerHeight: 50,             // Footer height (px)
    
    // Sidebar width
    sidebarWidth: 0                // Sidebar width (px)
};

// ============================================================================
// INTERNATIONALIZATION
// ============================================================================

/**
 * Internationalization settings
 */
export const i18nConfig = {
    defaultLanguage: 'en-US',
    fallbackLanguage: 'en-US',
    
    // Supported languages (must match translations.js)
    supportedLanguages: [
        'en-US',
        'es-ES',
        'fr-FR',
        'de-DE',
        'ja-JP'
    ],
    
    // Detect browser language automatically
    autoDetectLanguage: true
};

// ============================================================================
// PERFORMANCE SETTINGS
// ============================================================================

/**
 * Performance optimization settings
 */
export const performanceConfig = {
    // Image optimization
    maxImageCacheSize: 50,        // Maximum images to cache
    imageQuality: 0.9,            // JPEG quality (0-1)
    
    // Canvas optimization
    canvasPoolSize: 2,            // Number of canvas contexts to pool
    enableOffscreenCanvas: false, // Use OffscreenCanvas (if available)
    
    // Lazy loading
    lazyLoadPages: true,          // Dynamically import pages
    preloadNextPage: false        // Preload next page in background
};

// ============================================================================
// COLOR SCHEME
// ============================================================================

/**
 * 3DS eShop Color Scheme
 * Colors used in the UltShop UI, inspired by the 3DS eShop image
 */
export const colorScheme = {
    // Primary gradient (orange/gold like 3DS eShop)
    primary: '#FFD580',           // Light gold/orange
    primaryDark: '#FFA54F',       // Darker orange
    primaryLight: '#FFE4B3',      // Very light gold
    
    // Secondary colors
    secondary: '#FFA500',         // Orange (for highlights)
    accent: '#FFD700',            // Gold (for special items)
    
    // Background colors (beige/yellow tones)
    bgLight: '#F5E6D3',          // Light beige
    bgMid: '#E8D4B8',            // Medium beige
    bgDark: '#D4C4A8',           // Dark beige
    
    // Text colors
    text: '#4A4A4A',             // Dark gray
    textLight: '#FFFFFF',        // White
    textSubtle: '#8B8B8B',       // Light gray
    
    // UI elements
    white: '#FFFFFF',
    danger: '#D32F2F',           // Red for back button
    success: '#4CAF50',          // Green
    
    // Gradients
    gradientStart: '#F5E6D3',    // Light beige
    gradientMid: '#E8D4B8',      // Medium beige  
    gradientEnd: '#D4C4A8'       // Dark beige
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get CSS variable value with fallback
 * @param {string} varName - CSS variable name (with or without --)
 * @param {*} defaultValue - Fallback value
 * @returns {string} Resolved value
 */
export function getThemeVar(varName, defaultValue = '') {
    const cssVarName = varName.startsWith('--') ? varName : `--${varName}`;
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVarName)
        .trim();
    
    // Remove quotes if present
    const cleanValue = value ? value.replace(/^["']|["']$/g, '') : '';
    
    return cleanValue || defaultValue;
}

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature
 * @returns {boolean} Whether feature is enabled
 */
export function isFeatureEnabled(featureName) {
    return features[featureName] === true;
}

/**
 * Get current language (from localStorage or default)
 * @returns {string} Language code
 */
export function getCurrentLanguage() {
    if (i18nConfig.autoDetectLanguage) {
        const browserLang = navigator.language || navigator.userLanguage;
        if (i18nConfig.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
    }
    
    return localStorage.getItem('ultshop-language') || i18nConfig.defaultLanguage;
}

/**
 * Set current language
 * @param {string} languageCode - Language code to set
 */
export function setLanguage(languageCode) {
    if (i18nConfig.supportedLanguages.includes(languageCode)) {
        localStorage.setItem('ultshop-language', languageCode);
        return true;
    }
    return false;
}

// ============================================================================
// THEME ASSETS
// ============================================================================

/**
 * Default theme asset paths
 */
const themeDefaults = {
    defaultAppIcon: '/content/common/assets/BlankApp_64px.png',
    unopenedIcon: '/content/common/assets/giftbox_48px.png',
    defaultBackgroundIcon: null,
    
    sounds: {
        click: '/content/common/sfx/select6.ogg',
        select: '/content/common/sfx/select5.ogg',
        launch: '/content/common/sfx/select3.ogg'
    }
};

/**
 * Gets all theme asset URLs from CSS variables with fallbacks
 * Used by ProductIcon for consistent icon rendering
 * @returns {Object} Object containing all asset URLs
 */
export function getThemeAssets() {
    return {
        // Default app icons
        defaultAppIcon: getThemeVar('--ultshop-default-app-icon', themeDefaults.defaultAppIcon),
        unopenedIcon: getThemeVar('--ultshop-unopened-icon', themeDefaults.unopenedIcon),
        defaultBackgroundIcon: getThemeVar('--ultshop-default-background-icon', themeDefaults.defaultBackgroundIcon),

        // Selection glow (from CSS variable)
        selectionGlow: getThemeVar('--ultshop-selection-glow', '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png'),

        // Sounds (for future use)
        soundClick: getThemeVar('--ultshop-sound-click', themeDefaults.sounds.click),
        soundSelect: getThemeVar('--ultshop-sound-select', themeDefaults.sounds.select),
        soundLaunch: getThemeVar('--ultshop-sound-add-cart', themeDefaults.sounds.launch)
    };
}
