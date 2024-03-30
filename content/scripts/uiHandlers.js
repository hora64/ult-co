$(document).ready(function() {
    // Load and apply color settings or apply default color
    const hexColor = loadColorSettings() || '#7d7d7d'; // Default color if no saved settings
    document.documentElement.style.setProperty('--title-color', hexColor);
    $('#window-color-picker').val(hexColor);
    document.getElementById('window-color-picker').value(hexColor);
    applyColor(); // Set up color change handling
    applyWallpaper(); // Apply saved wallpaper or default
    applyFavicon(); // Apply saved favicon or default
});


function applyColor() {
    $('#window-color-picker').on('input', function() {
        const hexColor = $(this).val();
        document.documentElement.style.setProperty('--title-color', hexColor);
        saveColorSettings(hexColor); // Directly save the hex value
    });
}




function applyWallpaper() {
    const savedWallpaper = getSavedWallpaper() || 'content/assets/images/wallpapers/frutigeraero.jpg'; // Default wallpaper path
    $('body').css('background-image', `url(${savedWallpaper})`);
    $('input[name="wallpaperselect"][value="'${savedWallpaper}'"]').prop('checked', true);

    $('input[name="wallpaperselect"]').change(function() {
        const newWallpaper = $(this).val();
        $('body').css('background-image', `url(${newWallpaper})`);
        saveSelectedWallpaper(newWallpaper);
    });
}


function applyFavicon() {
    const savedFavicon = getSavedFavicon() || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico'; // Default favicon path
    $('#dynamicFavicon').attr('href', savedFavicon);
    $('input[name="faviconSelect"][value="'${savedFavicon}'"]').prop('checked', true);

    $('input[name="faviconSelect"]').change(function() {
        if ($(this).is(':checked')) {
            const newFavicon = $(this).val();
            $('#dynamicFavicon').attr('href', newFavicon);
            saveSelectedFavicon(newFavicon);
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

