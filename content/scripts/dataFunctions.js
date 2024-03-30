function saveColorSettings(hexColor) {
    localStorage.setItem('colorSettings', hexColor);
    console.log('Color Settings Saved:', hexColor); // Log the saved color
}

function loadColorSettings() {
    const savedColorSettings = localStorage.getItem('colorSettings');
    return savedColorSettings ? savedColorSettings : null; // Return null if not found
}

function saveSelectedWallpaper(wallpaperPath) {
    localStorage.setItem('selectedWallpaper', wallpaperPath);
    console.log('Wallpaper Path Saved:', wallpaperPath); // Log the saved wallpaper path
}

function getSavedWallpaper() {
    const wallpaper = localStorage.getItem('selectedWallpaper');
    console.log(wallpaper ? `Wallpaper Loaded: ${wallpaper}` : 'No Wallpaper Found.');
    return wallpaper ? wallpaper : null; // Returns the wallpaper or null
}

function saveSelectedFavicon(faviconPath) {
    localStorage.setItem('selectedFavicon', faviconPath);
    console.log('Favicon Path Saved:', faviconPath); // Log the saved favicon path
}

function getSavedFavicon() {
    const favicon = localStorage.getItem('selectedFavicon');
    console.log(favicon ? `Favicon Loaded: ${favicon}` : 'No Favicon Found.');
    return favicon ? favicon : null; // Returns the favicon or null
}

// Renamed function to load mouse click config from local storage
function getMouseClickConfig() {
    var configData = localStorage.getItem('configData');
    if (!configData) {
        console.error('Mouse click config data not found in local storage.');
        return null;
    }
    return JSON.parse(configData);
}

// Renamed function to save mouse click config to local storage
function saveMouseClickConfig(config) {
    if (!config) {
        console.error('No mouse click config data provided.');
        return;
    }
    localStorage.setItem('configData', JSON.stringify(config));
    console.log('Mouse click config data saved successfully.');
}
