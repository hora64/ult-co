function saveColorSettings(hexColor) {
    localStorage.setItem('colorSettings', JSON.stringify({ hexColor }));
}

function loadColorSettings() {
    const savedColorSettings = localStorage.getItem('colorSettings');
    if (savedColorSettings) {
        const { hexColor } = JSON.parse(savedColorSettings);
        // Return the hexColor to be applied by the caller
        return hexColor;
    }
    return null; // No saved settings
}


function saveSelectedWallpaper(wallpaperPath) {
    localStorage.setItem('selectedWallpaper', wallpaperPath);
}

function getSavedWallpaper() {
    return localStorage.getItem('selectedWallpaper');
}

function saveSelectedFavicon(faviconPath) {
    localStorage.setItem('selectedFavicon', faviconPath);
}

function getSavedFavicon() {
    return localStorage.getItem('selectedFavicon');
}
