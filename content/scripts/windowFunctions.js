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

function toggleContainer(controlElementId, containerElementId) {
    var controlElement = document.getElementById(controlElementId);
    var containerElement = document.getElementById(containerElementId);
    
    if (containerElement && controlElement) {
        containerElement.style.display = controlElement.checked ? 'block' : 'none';
    } else {
        console.error('One or more elements not found:', controlElementId, containerElementId);
    }
}

function disableContainer(containerElementId) {
    var containerElement = document.getElementById(containerElementId);
    
    if (containerElement) {
        containerElement.style.display = 'none';
    } else {
        console.error('Element not found:', containerElementId);
    }
}

// Add an event listener to the radio buttons for changing the mouse trail color
document.querySelectorAll('input[name="mouseTrailColorSelect"]').forEach(radio => {
    radio.addEventListener('change', function() {
        // Assuming toggleRgbSliders is defined elsewhere or is a placeholder for actual functionality
    });
});

// Function to switch tabs and display corresponding content
function switchTab(tabId) {
    // Hide all tab content sections
    $('article[role="tabpanel"]').hide().attr('hidden', true);
    // Show the selected tab content and remove the hidden attribute
    $('#' + tabId).show().removeAttr('hidden');

    // Update aria-selected for all tabs
    $('menu[role="tablist"] button').attr('aria-selected', 'false');
    // Mark the current tab as selected
    $('menu[role="tablist"] button[aria-controls="' + tabId + '"]').attr('aria-selected', 'true');
}

$(document).ready(function() {
    // Activate the first tab and setup tab switching
    $('[role="tab"]:first').click();
    let firstTabId = $('menu[role="tablist"] button:first').attr('aria-controls');
    switchTab(firstTabId);
    $('menu[role="tablist"] button').click(function() {
        var tabId = $(this).attr('aria-controls');
        switchTab(tabId);
    });

    // Make the window draggable and resizable
    $("#app-settings").draggable({
        handle: ".title-bar",
        containment: 'window'
    }).resizable({
        handles: "n, e, s, w, ne, se, sw, nw",
        minHeight: 200,
        minWidth: 200
    });
});
