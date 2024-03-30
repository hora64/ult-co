$(document).ready(function() {
    const hexColor = loadColorSettings();
    if (hexColor) {
        // Apply the loaded hex color setting directly
        document.documentElement.style.setProperty('--title-color', hexColor);
        $('#window-color-picker').val(hexColor);
    } else {
        // Default color if no saved settings
        $('#window-color-picker').val('#7d7d7d'); // Example default color
    }

    applyColor(); // Set up color change handling
    // Assuming functions applyWallpaper() and applyFavicon() remain unchanged
});

function applyColor() {
    $('#window-color-picker').on('input', function() {
        const hexColor = $(this).val();
        document.documentElement.style.setProperty('--title-color', hexColor);
        saveColorSettings(hexColor); // Directly save the hex value
    });
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
