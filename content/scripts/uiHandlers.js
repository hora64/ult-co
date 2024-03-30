
$(document).ready(function() {
    // Initial settings load without cooldown
    const hexColor = loadFromLocalStorage('colorSettings') || '#7d7d7d';
    applyColor(hexColor, false);
    
    const savedWallpaper = loadFromLocalStorage('selectedWallpaper') || 'content/assets/images/wallpapers/frutigeraero.jpg';
    applyWallpaper(savedWallpaper);

    const savedFavicon = loadFromLocalStorage('selectedFavicon') || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico';
    applyFavicon(savedFavicon);
});

let lastCalled = 0;
function applyColor(hexColor, useCooldown = true) {
    const now = Date.now();
    // Check if we should apply cooldown and if it's within the cooldown period
    if (useCooldown && (now - lastCalled < 500)) {
        console.log("Action is cooling down. Please wait.");
        return;
    }
    lastCalled = now; // Update the last called timestamp if cooldown is used

    // Apply the color change
    document.documentElement.style.setProperty('--title-color', hexColor);
    saveToLocalStorage('colorSettings', hexColor);
    console.log('Color applied:', hexColor);
}
function applyWallpaper(selectedWallpaper) {
    $('body').css('background-image', `url(${selectedWallpaper})`);
    saveToLocalStorage('selectedWallpaper', selectedWallpaper);
}

function applyFavicon(selectedFavicon) {
    $('#dynamicFavicon').attr('href', selectedFavicon);
    saveToLocalStorage('selectedFavicon', selectedFavicon);
}

// Debounce function remains unchanged
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
