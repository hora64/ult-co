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
    const redSlider = $(fileName).find('#window-red-slider');
    const greenSlider = $(fileName).find('#window-green-slider');
    const blueSlider = $(fileName).find('#window-blue-slider');

    if (colors) {
        redSlider.val(colors.red);
        greenSlider.val(colors.green);
        blueSlider.val(colors.blue);
    }

    redSlider.on('input', function() {
        updateColor(fileName);
    });

    greenSlider.on('input', function() {
        updateColor(fileName);
    });

    blueSlider.on('input', function() {
        updateColor(fileName);
    });

    // Initial color setting
    updateColor(fileName);
}

function updateColor(fileName) {
    const red = $(fileName).find('#window-red-slider').val();
    const green = $(fileName).find('#window-green-slider').val();
    const blue = $(fileName).find('#window-blue-slider').val();
    $(document).trigger('colorChange', { red, green, blue });
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
