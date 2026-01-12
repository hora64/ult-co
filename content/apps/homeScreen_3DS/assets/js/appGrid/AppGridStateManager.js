export class AppGridStateManager {
    constructor(storageKey, gridStateKey, appOrderKey, gridLayoutKey) {
        this.storageKey = storageKey;
        this.gridStateKey = gridStateKey;
        this.appOrderKey = appOrderKey;
        this.gridLayoutKey = gridLayoutKey || 'appGridLayout2D'; // 2D array structure
    }

    loadOpenedState() {
        try {
            const storedState = localStorage.getItem(this.storageKey);
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                if (typeof parsedState === 'object' && parsedState !== null && !Array.isArray(parsedState)) {
                    return parsedState;
                }
            }
        } catch (error) {
            console.error(`AppGrid: Failed to load or parse state from localStorage key "${this.storageKey}".`, error);
        }
        return {};
    }

    saveOpenedState(openedApps) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(openedApps));
        } catch (error) {
            console.error(`AppGrid: Failed to save state to localStorage key "${this.storageKey}".`, error);
        }
    }

    loadGridState() {
        try {
            const storedState = localStorage.getItem(this.gridStateKey);
            if (storedState) {
                const parsedState = JSON.parse(storedState);
                if (typeof parsedState === 'object' && parsedState !== null) {
                    return parsedState;
                }
            }
        } catch (error) {
            console.error(`AppGrid: Failed to load or parse grid state from localStorage key "${this.gridStateKey}".`, error);
        }
        return {};
    }

    saveGridState(state) {
        try {
            localStorage.setItem(this.gridStateKey, JSON.stringify(state));
        } catch (error) {
            console.error(`AppGrid: Failed to save grid state to localStorage key "${this.gridStateKey}".`, error);
        }
    }

    loadAppOrder() {
        try {
            const storedOrder = localStorage.getItem(this.appOrderKey);
            if (storedOrder) {
                return JSON.parse(storedOrder);
            }
        } catch (error) {
            console.error(`AppGrid: Failed to load app order from localStorage key "${this.appOrderKey}".`, error);
        }
        return null;
    }

    saveAppOrder(appIds) {
        try {
            localStorage.setItem(this.appOrderKey, JSON.stringify(appIds));
        } catch (error) {
            console.error(`AppGrid: Failed to save app order to localStorage key "${this.appOrderKey}".`, error);
        }
    }

    /**
     * Load grid layout as a 2D array
     * @returns {Array<Array<string|null>>|null} 2D array where each cell contains an app ID or null for empty
     */
    loadGridLayout2D() {
        try {
            const storedLayout = localStorage.getItem(this.gridLayoutKey);
            if (storedLayout) {
                const parsed = JSON.parse(storedLayout);
                // Handle both old format (just array) and new format (object with grid, rows, columns)
                if (Array.isArray(parsed)) {
                    return parsed;
                } else if (parsed && parsed.grid && Array.isArray(parsed.grid)) {
                    // If it's the object format, just return the grid array
                    return parsed.grid;
                }
            }
        } catch (error) {
            console.error(`AppGrid: Failed to load 2D grid layout from localStorage key "${this.gridLayoutKey}".`, error);
        }
        return null;
    }

    /**
     * Save grid layout as a 2D array
     * @param {Array<Array<string|null>>} layout2D - 2D array of app IDs
     */
    saveGridLayout2D(layout2D) {
        try {
            // Save just the array directly for simplicity
            localStorage.setItem(this.gridLayoutKey, JSON.stringify(layout2D));
            console.log('AppGrid: Grid layout saved to localStorage');
        } catch (error) {
            console.error(`AppGrid: Failed to save 2D grid layout to localStorage key "${this.gridLayoutKey}".`, error);
        }
    }

    resetAppOrder() {
        try {
            localStorage.removeItem(this.appOrderKey);
            localStorage.removeItem(this.gridLayoutKey);
            console.log("App order reset. Please reload for changes to take effect.");
        } catch (error) {
            console.error(`AppGrid: Failed to reset app order in localStorage key "${this.appOrderKey}".`, error);
        }
    }

    getUserLanguage() {
        const language = localStorage.getItem('userLanguage');
        if (language) {
            console.log(`AppGrid: User's preferred language: ${language}`);
            return language;
        } else {
            console.log('AppGrid: No user language found in local storage. Using default "en-US".');
            return 'en-US'; // Default language
        }
    }
}
