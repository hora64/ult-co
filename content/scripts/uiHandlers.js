$(document).ready(function() {
    const fileName = getCurrentFileName();

    const colors = loadColorSettings(fileName);
    if (colors) {
        applyColor(fileName, colors);
        applyWallpaper(fileName);
        applyFavicon(fileName);
    }

    // Custom event listeners for color change
    $(document).on('colorChange', function(event, data) {
        const { red, green, blue } = data;
        document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);
        saveColorSettings(red, green, blue);
    });

    // Custom event listeners for wallpaper change
    $(document).on('wallpaperChange', function(event, data) {
        $('body').css('background-image', `url(${data})`);
        saveSelectedWallpaper(data);
    });

    // Custom event listeners for favicon change
    $(document).on('faviconChange', function(event, data) {
        $('#dynamicFavicon').attr('href', data);
        saveSelectedFavicon(data);
    });
});

function applyColor(fileName, colors) {
    $(fileName).find('#window-red-slider, #window-green-slider, #window-blue-slider').on('input', function() {
        clearTimeout(window.colorDebounce);
        window.colorDebounce = setTimeout(function() {
            const red = $(fileName).find('#window-red-slider').val(),
                green = $(fileName).find('#window-green-slider').val(),
                blue = $(fileName).find('#window-blue-slider').val();
            $(document).trigger('colorChange', { red, green, blue });
        }, 100);
    });
}

function applyWallpaper(fileName) {
    $(fileName).find('input[name="wallpaperselect"]').change(function() {
        const newWallpaper = $(this).val();
        $(document).trigger('wallpaperChange', newWallpaper);
    });
}

function applyFavicon(fileName) {
    $(fileName).find('input[name="faviconSelect"]').change(function() {
        if ($(this).is(':checked')) {
            const newFavicon = $(this).val();
            $(document).trigger('faviconChange', newFavicon);
        }
    });
}

function getCurrentFileName() {
    // Get the current URL
    const url = window.location.href;
    // Extract the filename from the URL
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    return fileName;
}
