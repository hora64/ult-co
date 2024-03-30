$(document).ready(function() {
    const colors = loadColorSettings();
    if (colors) {
        // Assuming loadColorSettings() returns an object with red, green, and blue properties
        // Convert RGB to Hex since color picker uses hex value
        const hexColor = rgbToHex(colors.red, colors.green, colors.blue);
        document.documentElement.style.setProperty('--title-color', hexColor);
        $('#window-color-picker').val(hexColor);
    } else {
        // Default color if no saved settings
        $('#window-color-picker').val('#7d7d7d'); // Example default color
    }

    applyColor(); // Set up color change handling
    applyWallpaper(); // Assuming function setup remains the same
    applyFavicon(); // Assuming function setup remains the same
});

function applyColor() {
    $('#window-color-picker').on('input', function() {
        const hexColor = $(this).val();
        document.documentElement.style.setProperty('--title-color', hexColor);
        // Assuming saveColorSettings() needs RGB format
        const {r, g, b} = hexToRgb(hexColor);
        saveColorSettings(r, g, b);
    });
}

// Utility function to convert RGB to Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Utility function to convert Hex to RGB
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return {r, g, b};
}


function applyWallpaper() {
    const savedWallpaper = getSavedWallpaper();
    if (savedWallpaper) {
        $('body').css('background-image', `url(${savedWallpaper})`);
        $('input[name="wallpaperselect"][value="' + savedWallpaper + '"]').prop('checked', true);
    }

    $('input[name="wallpaperselect"]').change(function() {
        const newWallpaper = $(this).val();
        $('body').css('background-image', `url(${newWallpaper})`);
        saveSelectedWallpaper(newWallpaper);
    });
}

function applyFavicon() {
    const savedFavicon = getSavedFavicon();
    if (savedFavicon) {
        $('#dynamicFavicon').attr('href', savedFavicon);
        $('input[name="faviconSelect"][value="' + savedFavicon + '"]').prop('checked', true);
    }

    $('input[name="faviconSelect"]').change(function() {
        if ($(this).is(':checked')) {
            const newFavicon = $(this).val();
            $('#dynamicFavicon').attr('href', newFavicon);
            saveSelectedFavicon(newFavicon);
        }
    });
}
