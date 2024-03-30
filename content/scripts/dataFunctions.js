function saveColorSettings(hexColor) {
    // Directly store the hex color string
    localStorage.setItem('colorSettings', hexColor);
}

function loadColorSettings() {
    // Directly retrieve the hex color string
    const savedColorSettings = localStorage.getItem('colorSettings');
    return savedColorSettings ? savedColorSettings : null; // Return null if not found
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
