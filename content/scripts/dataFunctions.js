function saveColorSettings(hexColor) {
    // Directly store the hex color string
    localStorage.setItem('colorSettings', hexColor);
    console.log('Color Settings Saved:', hexColor); // Log the saved color
}

function loadColorSettings() {
    // Directly retrieve the hex color string
    const savedColorSettings = localStorage.getItem('colorSettings');
    return savedColorSettings ? savedColorSettings : null; // Return null if not found
}

function saveSelectedWallpaper(wallpaperPath) {
    localStorage.setItem('selectedWallpaper', wallpaperPath);
    console.log('Wallpaper Path Saved:', wallpaperPath); // Log the saved wallpaper path
}

function getSavedWallpaper() {
    return localStorage.getItem('selectedWallpaper');
}

function saveSelectedFavicon(faviconPath) {
    localStorage.setItem('selectedFavicon', faviconPath);
    console.log('Favicon Path Saved:', faviconPath); // Log the saved favicon path
}

function getSavedFavicon() {
    return localStorage.getItem('selectedFavicon');
}
