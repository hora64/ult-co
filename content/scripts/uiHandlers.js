$(document).ready(function() {
    // Load and apply color settings or apply default color
    const hexColor = loadColorSettings() || '#7d7d7d'; // Default color if no saved settings
    applyColor(hexColor); // Set up color change handling with the loaded color
    
    // Load saved wallpaper and apply
    const savedWallpaper = getSavedWallpaper() || 'content/assets/images/wallpapers/frutigeraero.jpg'; // Default wallpaper path
    applyWallpaper(savedWallpaper);

    // Load saved favicon and apply
    const savedFavicon = getSavedFavicon() || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico'; // Default favicon path
    applyFavicon(savedFavicon);
});


// Rest of your functions remain unchanged


function applyColor(hexColor) {
    // If no hexColor is provided, load the initial color setting or use default
    document.documentElement.style.setProperty('--title-color', hexColor);
    $('#window-color-picker').val(hexColor);

    // Debounced function to handle color changes
    const handleColorChange = debounce(function(hexColor) {
        document.documentElement.style.setProperty('--title-color', hexColor);
        saveColorSettings(hexColor);
        console.log('Color applied:', hexColor);
    }, 500);
}


// Apply wallpaper function with parameter
function applyWallpaper(selectedWallpaper) {
    $('body').css('background-image', `url(${selectedWallpaper})`);
    saveSelectedWallpaper(selectedWallpaper); // Save the new selection
}

// Apply favicon function with parameter
function applyFavicon(selectedFavicon) {
    $('#dynamicFavicon').attr('href', selectedFavicon);
    saveSelectedFavicon(selectedFavicon); // Save the new selection
}

// Radio button event handlers for wallpaper selection
$('input[name="wallpaperselect"]').change(function() {
    applyWallpaper($(this).val());
});

// Radio button event handlers for favicon selection
$('input[name="faviconSelect"]').change(function() {
    applyFavicon($(this).val());
});

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
