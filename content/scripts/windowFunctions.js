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
    // Wrap updateColorTheme with debounce
    const debouncedUpdateColorTheme = debounce(function() {
        const red = document.getElementById('red-slider').value,
            green = document.getElementById('green-slider').value,
            blue = document.getElementById('blue-slider').value;

        // Update the CSS variable
        document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);

        // Save the color settings to localStorage
        localStorage.setItem('colorSettings', JSON.stringify({red, green, blue}));
        console.log('Saved Colors:', {red, green, blue});
    }, 100);

    // Setup event listeners for the color sliders
    document.getElementById('red-slider').addEventListener('input', debouncedUpdateColorTheme);
    document.getElementById('green-slider').addEventListener('input', debouncedUpdateColorTheme);
    document.getElementById('blue-slider').addEventListener('input', debouncedUpdateColorTheme);
}

// Debounce function to limit how often a function can fire
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Separate function to load and apply saved color settings
function loadColorData() {
    const savedColorSettings = localStorage.getItem('colorSettings');
    if (savedColorSettings) {
        const colors = JSON.parse(savedColorSettings);
        document.getElementById('red-slider').value = colors.red;
        document.getElementById('green-slider').value = colors.green;
        document.getElementById('blue-slider').value = colors.blue;
        console.log('Loaded Saved Colors:', colors);
        // Apply the loaded color settings immediately without debounce
        document.documentElement.style.setProperty('--title-color', `rgb(${colors.red}, ${colors.green}, ${colors.blue})`);
    }
}

// Function to apply the wallpaper
function applyWallpaper() {
    var savedWallpaper = localStorage.getItem('selectedWallpaper');
    if (savedWallpaper) {
        $('body').css('background-image', 'url(' + savedWallpaper + ')');
        $('input[name="wallpaperselect"][value="' + savedWallpaper + '"]').prop('checked', true);
        console.log('Saved Wallpaper:', savedWallpaper);
    }

    $('input[name="wallpaperselect"]').change(function() {
        var newWallpaper = $(this).val();
        $('body').css('background-image', 'url(' + newWallpaper + ')');
        localStorage.setItem('selectedWallpaper', newWallpaper);
        console.log('New Wallpaper Set:', newWallpaper);
    });
}

$(document).ready(function() {
    loadColorData(); // Load and apply saved color settings on startup
    applyColor(); // Initialize color slider functionality
    applyWallpaper(); // Apply the saved or default wallpaper

    // Activate the first tab
    $('[role="tab"]:first').click();
});

$(function() {
    // Make the window draggable
    $(".window.glass.active").draggable({
        handle: ".title-bar",
        containment: 'window'
    });

    // Make the window resizable
    $(".window.glass.active").resizable({
        handles: "n, e, s, w, ne, se, sw, nw",
        minHeight: 150,
        minWidth: 200
    });
});

