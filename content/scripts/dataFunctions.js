function saveColorSettings(red, green, blue) {
    localStorage.setItem('colorSettings', JSON.stringify({ red, green, blue }));
}

function loadColorSettings() {
    const savedColorSettings = localStorage.getItem('colorSettings');
    if (savedColorSettings) {
        const colors = JSON.parse(savedColorSettings);
        // Return the colors to be applied by the caller
        return colors;
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
