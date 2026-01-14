import {
    DataManager
} from '/content/common/utils/data.js';

export class ThemeManager {
    constructor() {
        this.dataManager = new DataManager();
        this.availableThemes = ['black', 'blue', 'red']; // Available theme IDs
    }

    getSavedTheme() {
        const savedThemeId = this.dataManager.loadFromLocalStorage('theme') || 'black';
        console.log(`Found saved theme: ${savedThemeId}`);
        return savedThemeId;
    }

    /**
     * Loads a theme from its JSON definition file
     * @param {string} themeId - Theme identifier (e.g., 'black', 'blue', 'red')
     * @returns {Promise<Object>} Theme configuration object
     */
    async loadThemeDefinition(themeId) {
        try {
            const response = await fetch(`/content/common/themes/${themeId}Theme/${themeId.charAt(0).toUpperCase() + themeId.slice(1)}ThemeDefinition.json`);
            if (!response.ok) {
                throw new Error(`Failed to load theme definition: ${response.statusText}`);
            }
            const themeDefinition = await response.json();
            console.log(`Loaded theme definition for ${themeId}:`, themeDefinition);
            return themeDefinition;
        } catch (error) {
            console.error(`Error loading theme ${themeId}:`, error);
            return null;
        }
    }

    /**
     * Applies CSS variables from theme definition
     * @param {Object} cssVars - Object containing CSS variable definitions
     */
    applyCssVars(cssVars) {
        if (!cssVars) return;
        
        const root = document.documentElement;
        Object.entries(cssVars).forEach(([varName, value]) => {
            // Ensure variable name starts with --
            const cssVarName = varName.startsWith('--') ? varName : `--${varName}`;
            root.style.setProperty(cssVarName, value);
            console.log(`Applied CSS var: ${cssVarName} = ${value}`);
        });
    }

    async loadTheme(themeId, appGrid) {
        if (!appGrid) {
            console.error('AppGrid instance was not provided to loadTheme.');
            return;
        }
        if (!themeId) {
            console.warn('No theme id provided; skipping theme loading.');
            return;
        }

        // Load theme definition from JSON
        const themeDefinition = await this.loadThemeDefinition(themeId);
        if (!themeDefinition) {
            console.error(`Failed to load theme "${themeId}". Using default theme.`);
            this.dataManager.clearLocalStorage('theme');
            return;
        }

        let themeUpdated = false;
        const root = document.documentElement;

        // Apply colors (backward compatibility)
        if (themeDefinition.colors) {
            if (themeDefinition.colors.topScreen) {
                root.style.setProperty('--theme-top-screen-bg', themeDefinition.colors.topScreen);
            }
            if (themeDefinition.colors.bottomScreen) {
                root.style.setProperty('--theme-bottom-screen-bg', themeDefinition.colors.bottomScreen);
            }
            themeUpdated = true;
        }

        // Apply CSS variables from theme definition
        if (themeDefinition.cssVars) {
            this.applyCssVars(themeDefinition.cssVars);
            themeUpdated = true;
        }
        
        // Update app grid assets
        if (themeDefinition.assets && typeof appGrid.updateAssetUrls === 'function') {
            appGrid.updateAssetUrls(themeDefinition.assets);
            themeUpdated = true;
        }

        if (themeUpdated) {
            console.log('Theme update process complete!');
        }

        // Return theme object with all data for backward compatibility
        return {
            id: themeId,
            ...themeDefinition,
            cssVars: themeDefinition.cssVars || {}
        };
    }
}