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

