$(document).ready(function() {
    // Load and apply color settings or apply default color
    const hexColor = loadFromLocalStorage('colorSettings') || '#7d7d7d'; // Default color if no saved settings
    applyColor(hexColor);
    
    // Load saved wallpaper and apply
    const savedWallpaper = loadFromLocalStorage('selectedWallpaper') || 'content/assets/images/wallpapers/frutigeraero.jpg'; // Default wallpaper path
    applyWallpaper(savedWallpaper);

    // Load saved favicon and apply
    const savedFavicon = loadFromLocalStorage('selectedFavicon') || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico'; // Default favicon path
    applyFavicon(savedFavicon);
});

function applyColor(hexColor) {
    document.documentElement.style.setProperty('--title-color', hexColor);
    $('#window-color-picker').val(hexColor);

    // Adjusted debounce function to handle color changes
    $('#window-color-picker').on('input', debounce(function() {
        const newColor = $(this).val();
        document.documentElement.style.setProperty('--title-color', newColor);
        saveToLocalStorage('colorSettings', newColor);
        console.log('Color applied:', newColor);
    }, 500));
}

function applyWallpaper(selectedWallpaper) {
    $('body').css('background-image', `url(${selectedWallpaper})`);
    saveToLocalStorage('selectedWallpaper', selectedWallpaper); // Save the new selection
}

function applyFavicon(selectedFavicon) {
    $('#dynamicFavicon').attr('href', selectedFavicon);
    saveToLocalStorage('selectedFavicon', selectedFavicon); // Save the new selection
}

// Assuming the debounce function is defined elsewhere in your script as provided


function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
