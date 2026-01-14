export class DataManager {
    async loadJsonData(filePath) {
        try {
            // Resolve the path relative to the document's base URI
            const absoluteUrl = new URL(filePath, document.baseURI).href;

            if (filePath.endsWith('.js')) {
                const module = await import(absoluteUrl);
                return module.appData;
            }
            const response = await fetch(absoluteUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading JSON data from ${filePath}:`, error);
            return null;
        }
    }

    saveToLocalStorage(key, data) {
        if (!key || data === undefined) {
            console.error('Invalid key or data provided for saving.');
            return;
        }
        try {
            const isObject = typeof data === 'object' && data !== null;
            localStorage.setItem(key, isObject ? JSON.stringify(data) : data);
        } catch (e) {
            console.error('Error saving data to local storage:', e);
        }
    }

    loadFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        if (data === null) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }

    clearLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error clearing local storage:', e);
        }
    }
}