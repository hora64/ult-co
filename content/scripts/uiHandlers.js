// Assuming jQuery is available
$(document).ready(function() {
    const colors = loadColorSettings();
    if (colors) {
        // Apply loaded color settings
        document.documentElement.style.setProperty('--title-color', `rgb(${colors.red}, ${colors.green}, ${colors.blue})`);
        // Update slider positions
        $('#window-red-slider').val(colors.red);
        $('#window-green-slider').val(colors.green);
        $('#window-blue-slider').val(colors.blue);
    }

    applyColor(); // Set up color change handling
    applyWallpaper(); // Set up wallpaper application
    applyFavicon(); // Set up favicon application
});

function applyColor() {
    // Setup event listeners for color change
    $('#window-red-slider, #window-green-slider, #window-blue-slider').on('input', function() {
        // Debounced update color theme
        clearTimeout(window.colorDebounce);
        window.colorDebounce = setTimeout(function() {
            const red = $('#window-red-slider').val(),
                green = $('#window-green-slider').val(),
                blue = $('#window-blue-slider').val();
            document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);
            saveColorSettings(red, green, blue);
        }, 100);
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

