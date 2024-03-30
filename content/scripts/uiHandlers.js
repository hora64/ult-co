$(document).ready(function() {
    const hexColor = loadFromLocalStorage('colorSettings') || '#7d7d7d';
    applyColor(hexColor, false);
    
    const savedWallpaper = loadFromLocalStorage('selectedWallpaper') || 'content/assets/images/wallpapers/frutigeraero.jpg';
    applyWallpaper(savedWallpaper);

    const savedFavicon = loadFromLocalStorage('selectedFavicon') || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico';
    applyFavicon(savedFavicon);
});

function applyColor(hexColor, useCooldown = true) {
    if (checkCooldown(useCooldown)) return;

    document.documentElement.style.setProperty('--title-color', hexColor);
    saveToLocalStorage('colorSettings', hexColor);
    console.log('Color applied:', hexColor);
}

function checkCooldown(useCooldown) {
    const now = Date.now();
    if (useCooldown && (now - lastCalled < 200)) {
        console.log(`Color function is cooling down. Please wait ${now - lastCalled}ms`);
        return true;
    }
    lastCalled = now;
    return false;
}

function applyWallpaper(selectedWallpaper) {
    $('body').css('background-image', `url(${selectedWallpaper})`);
    saveToLocalStorage('selectedWallpaper', selectedWallpaper);
}

function applyFavicon(selectedFavicon) {
    $('#dynamicFavicon').attr('href', selectedFavicon);
    saveToLocalStorage('selectedFavicon', selectedFavicon);
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
