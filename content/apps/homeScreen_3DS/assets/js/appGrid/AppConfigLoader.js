/**
 * AppConfigLoader - Utility for loading and managing app configurations
 * @module AppConfigLoader
 * 
 * Loads from the centralized config/config.js configuration.
 */

import { appsConfig, getEnabledAppFolders as getEnabledAppFoldersFromConfig } from '../../../config/config.js';

const DEFAULT_CONFIG_PATH = '/content/common/configs/apps.json';

/**
 * Loads the app configuration from the centralized config
 * @param {string} [configPath] - Deprecated - kept for backward compatibility
 * @returns {Promise<Object>} The configuration object
 */
export async function loadAppConfig(configPath) {
    try {
        if (configPath && configPath !== DEFAULT_CONFIG_PATH) {
            console.warn(`Custom config path "${configPath}" is deprecated. Using centralized appLists.js`);
        }
        
        console.log('Loading app configuration from centralized appLists.js');
        
        // Return the configuration from the JavaScript module
        console.log(`✓ Loaded app configuration v${appsConfig.version || 'unknown'}`);
        console.log(`  - Total apps defined: ${appsConfig.apps.length}`);
        console.log(`  - Enabled apps: ${appsConfig.apps.filter(app => app.enabled !== false).length}`);
        
        return appsConfig;
    } catch (error) {
        console.error('Failed to load app configuration:', error);
        throw error;
    }
}

/**
 * Gets list of enabled app folders from configuration
 * @param {Object} [config] - Optional config object (uses centralized config if not provided)
 * @returns {string[]} Array of app folder names
 */
export function getEnabledAppFolders(config) {
    // If no config provided, use the centralized configuration function
    if (!config) {
        return getEnabledAppFoldersFromConfig();
    }
    
    // Otherwise use the provided config (for backward compatibility)
    if (!config || !config.apps) {
        console.warn('Invalid config object provided to getEnabledAppFolders');
        return [];
    }
    
    return config.apps
        .filter(app => app.enabled !== false) // Enable by default if not specified
        .map(app => app.folder)
        .filter(folder => folder); // Remove any null/undefined folders
}

/**
 * Gets app configuration by ID
 * @param {Object} config - The loaded configuration object
 * @param {string} appId - The app ID to find
 * @returns {Object|null} The app config object or null if not found
 */
export function getAppConfigById(config, appId) {
    if (!config || !config.apps) {
        return null;
    }
    
    return config.apps.find(app => app.id === appId) || null;
}

/**
 * Checks if an app is enabled in the configuration
 * @param {Object} config - The loaded configuration object
 * @param {string} appId - The app ID to check
 * @returns {boolean} True if the app is enabled
 */
export function isAppEnabled(config, appId) {
    const appConfig = getAppConfigById(config, appId);
    return appConfig ? appConfig.enabled !== false : false;
}

/**
 * Gets apps sorted by priority (lower priority numbers load first)
 * @param {Object} config - The loaded configuration object
 * @returns {Object[]} Array of app config objects sorted by priority
 */
export function getAppsByPriority(config) {
    if (!config || !config.apps) {
        return [];
    }
    
    return [...config.apps]
        .filter(app => app.enabled !== false)
        .sort((a, b) => {
            const priorityA = a.priority ?? 100;
            const priorityB = b.priority ?? 100;
            return priorityA - priorityB;
        });
}

/**
 * Creates a fallback configuration if loading fails
 * @returns {Object} A minimal valid configuration
 */
export function getFallbackConfig() {
    console.warn('Using fallback app configuration');
    return {
        version: "1.0.0-fallback",
        apps: [
            { id: "homeScreen_3DS", enabled: true, folder: "homeScreen_3DS", required: true },
            { id: "settings", enabled: true, folder: "settings", required: true },
            { id: "mail", enabled: true, folder: "mail" }
        ]
    };
}

export default {
    loadAppConfig,
    getEnabledAppFolders,
    getAppConfigById,
    isAppEnabled,
    getAppsByPriority,
    getFallbackConfig
};
