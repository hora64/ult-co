// Vanilla JS window control functions targeting ".window-7" class
function minimizeWindow(button) {
    const window = button.closest('.window-7');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? '' : 'none';
}

function maximizeWindow(button) {
    const window = button.closest('.window-7');
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
    const window = button.closest('.window-7');
    window.style.display = 'none';
}

// Function to show tab panel, assuming it applies globally and not just to ".window-7"
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

// Global function to apply color from sliders
function applyColor() {
    var red = document.getElementById('red-slider').value,
        green = document.getElementById('green-slider').value,
        blue = document.getElementById('blue-slider').value;
    document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);
}

// jQuery for DOM ready, event binding, and additional functionality
$(document).ready(function() {
    // Make the ".window-7.glass.active" draggable
    $(".window-7.glass.active").draggable({
        handle: ".title-bar",
        containment: 'window',
    });

    // Event handler for the color sliders
    $('#red-slider, #green-slider, #blue-slider').on('input', applyColor);

    // Activate the first tab, assuming tabs are global and not just within ".window-7"
    $('[role="tab"]:first').click();
});
