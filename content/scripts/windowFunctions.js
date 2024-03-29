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

// Function to apply the color from sliders and save to localStorage
function applyColor() {
    // Debounce function to limit how often a given function can fire
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Function to update the color theme from sliders and save to localStorage, debounced
    const updateColorThemeDebounced = debounce(function updateColorTheme() {
        var red = document.getElementById('red-slider').value,
            green = document.getElementById('green-slider').value,
            blue = document.getElementById('blue-slider').value;
        document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);
        localStorage.setItem('colorSettings', JSON.stringify({red, green, blue}));
        console.log(localStorage.getItem('colorSettings'));
    }, 250);

    document.getElementById('red-slider').addEventListener('input', updateColorThemeDebounced);
    document.getElementById('green-slider').addEventListener('input', updateColorThemeDebounced);
    document.getElementById('blue-slider').addEventListener('input', updateColorThemeDebounced);
}

// Function to apply the wallpaper
function applyWallpaper() {
    var savedWallpaper = localStorage.getItem('selectedWallpaper');
    console.log('Saved Wallpaper:', savedWallpaper);
    if(savedWallpaper) {
        $('body').css('background-image', 'url(' + savedWallpaper + ')');
        $('input[name="wallpaperselect"][value="' + savedWallpaper + '"]').prop('checked', true);
    }

    $('input[name="wallpaperselect"]').change(function() {
        var newWallpaper = $(this).val();
        $('body').css('background-image', 'url(' + newWallpaper + ')');
        localStorage.setItem('selectedWallpaper', newWallpaper);
        console.log('New Wallpaper Set:', newWallpaper);
    });
}

$(document).ready(function() {
    applyWallpaper(); // Apply the saved or default wallpaper
    applyColor(); // Apply the saved or default color theme

    // Activate the first tab
    $('[role="tab"]:first').click();
});

$(function() {
    // Make the window draggable
    $(".window.glass.active").draggable({
        handle: ".title-bar",
        containment: 'window'
    });
});
