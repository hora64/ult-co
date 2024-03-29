// Vanilla JS window control functions
function minimizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? '' : 'none';
}

function maximizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = '';
    if (window.style.maxWidth === '100%') {
        window.style.maxWidth = '';
        window.style.height = '';
    } else {
        window.style.maxWidth = '100%';
        window.style.height = '100%';
    }
}

function closeWindow(button) {
    const window = button.closest('.window');
    window.style.display = 'none';
}

// Function to show tab panel
window.showTabPanel = function(tab) {
    var selectedPanelId = tab.getAttribute('aria-controls');
    document.querySelectorAll('[role="tabpanel"]').forEach(function(panel) {
        panel.hidden = true;
    });
    document.getElementById(selectedPanelId).hidden = false;
    document.querySelectorAll('[role="tab"]').forEach(function(tab) {
        tab.setAttribute('aria-selected', 'false');
    });
    tab.setAttribute('aria-selected', 'true');
};

(function($) {
    // Make the window draggable
    $(".window.glass.active").draggable({
        handle: ".title-bar",
        containment: 'window' // Restrict dragging to within the viewport
    });

    // Function to apply the color from sliders and save to localStorage
    function applyColor() {
        var red = $('#red-slider').val(),
            green = $('#green-slider').val(),
            blue = $('#blue-slider').val();
        // Update the CSS variable
        document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);
        // Save the color settings to localStorage
        localStorage.setItem('colorSettings', JSON.stringify({red, green, blue}));
    }

    // Event handler for the color sliders
    $('#red-slider, #green-slider, #blue-slider').on('input', applyColor);

    // Load and apply saved wallpaper and color settings on document ready
    $(document).ready(function() {
        var savedWallpaper = localStorage.getItem('selectedWallpaper');
        console.log('Saved Wallpaper:', savedWallpaper);
        if(savedWallpaper) {
            $('body').css('background-image', 'url(' + savedWallpaper + ')');
            $('input[name="wallpaperselect"][value="' + savedWallpaper + '"]').prop('checked', true);
        }

        var savedColorSettings = localStorage.getItem('colorSettings');
        console.log('Saved Color Settings:', savedColorSettings);
        if(savedColorSettings) {
            var colors = JSON.parse(savedColorSettings);
            $('#red-slider').val(colors.red);
            $('#green-slider').val(colors.green);
            $('#blue-slider').val(colors.blue);
            applyColor(); // Apply the loaded color settings
        }

        // Save the selected wallpaper to localStorage on change
        $('input[name="wallpaperselect"]').change(function() {
            var newWallpaper = $(this).val();
            $('body').css('background-image', 'url(' + newWallpaper + ')');
            localStorage.setItem('selectedWallpaper', newWallpaper);
        });

        $('[role="tab"]:first').click(); // Activate the first tab
    });
})(jQuery);
