// Vanilla JS window control functions for basic window manipulation
function minimizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? 'block' : 'none';
}

function maximizeWindow(button) {
    const window = button.closest('.window');
    window.classList.toggle('maximized');
}

function closeWindow(button) {
    const window = button.closest('.window');
    window.remove();
}

// Toggle display based on checkbox or button click
function toggleContainer(controlElementId, containerElementId) {
    const controlElement = document.getElementById(controlElementId);
    const containerElement = document.getElementById(containerElementId);
    if (containerElement && controlElement) {
        containerElement.style.display = controlElement.checked ? 'block' : 'none';
    } else {
        console.error('Element not found:', controlElementId, containerElementId);
    }
}

// Disable a container by its ID
function disableContainer(containerElementId) {
    const containerElement = document.getElementById(containerElementId);
    if (containerElement) {
        containerElement.style.display = 'none';
    } else {
        console.error('Element not found:', containerElementId);
    }
}

// Function to switch tabs and display corresponding content, defined globally for accessibility
function switchTab(tabId) {
    const $tabPanels = $('article[role="tabpanel"]');
    const $tabs = $('menu[role="tablist"] button');

    $tabPanels.hide().attr('hidden', true);
    $('#' + tabId).show().removeAttr('hidden');
    $tabs.attr('aria-selected', 'false');
    $(`[aria-controls="${tabId}"]`).attr('aria-selected', 'true');
}

$(document).ready(function() {
    // Initial tab setup
    const firstTabId = $('[role="tab"]:first').attr('aria-controls');
    switchTab(firstTabId);

    // Event delegation for tab switching to accommodate dynamic content
    $('menu[role="tablist"]').on('click', 'button', function() {
        switchTab($(this).attr('aria-controls'));
    });

    // Enhance the app settings window with draggable and resizable features
    $("#app-settings").draggable({
        handle: ".title-bar",
        containment: 'window'
    }).resizable({
        handles: "n, e, s, w, ne, se, sw, nw",
        minHeight: 200,
        minWidth: 200
    });

    // Optimize radio buttons event handling for changing mouse trail color
    $('input[name="mouseTrailColorSelect"]').on('change', function() {
        // Implement the RGB sliders toggle functionality here
    });
});
