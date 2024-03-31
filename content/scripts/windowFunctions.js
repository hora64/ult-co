// Vanilla JS window control functions for basic window manipulation
function minimizeWindow(button) {
	const window = button.closest('.window');
	const windowBody = window.querySelector('.window-body');
	windowBody.style.display = windowBody.style.display === 'none' ? 'block' : 'none';
	// Ensure maximizing state is toggled off for visual consistency
	window.classList.remove('maximized');
}

function maximizeWindow(button) {
	const window = button.closest('.window');
	if (window.classList.contains('maximized')) {
		window.classList.remove('maximized');
		window.style.removeProperty('max-width');
		window.style.removeProperty('height');
	} else {
		window.classList.add('maximized');
		window.style.maxWidth = '100%';
		window.style.height = '100%';
	}
	// Ensure minimizing state is toggled off if window is maximized
	window.classList.remove('minimized');
}

function closeWindow(button) {
	const window = button.closest('.window');
	window.remove(); // Simply remove the window element
}

function toggleContainer(controlElementId, containerElementId) {
	const controlElement = document.getElementById(controlElementId);
	const containerElement = document.getElementById(containerElementId);
	if (containerElement && controlElement) {
		containerElement.style.display = controlElement.checked ? 'block' : 'none';
	} else {
		console.error('Element not found:', controlElementId, containerElementId);
	}
}

function disableContainer(containerElementId) {
	const containerElement = document.getElementById(containerElementId);
	if (containerElement) {
		containerElement.style.display = 'none';
	} else {
		console.error('Element not found:', containerElementId);
	}
}

// Function to switch tabs and display corresponding content, defined globally for accessibility
function switchTab(tabId, tabPath) {
	const $tabPanels = $('article[role="tabpanel"]');
	const $tabs = $('menu[role="tablist"] button');

	// Hide all tab panels and mark them as hidden
	$tabPanels.hide().attr('hidden', true);

	// Load the content for the selected tab using the provided path
	$('#' + tabId).load(tabPath, function(response, status, xhr) {
		if (status == "error") {
			console.error("Failed to load tab content:", xhr.status, xhr.statusText);
			// Optionally, display an error message within the tab content area
			$(this).html("Sorry, there was an error loading the content.");
		} else {
			// Show the loaded content
			$(this).show().removeAttr('hidden');
		}
	});

	// Update aria-selected for all tabs
	$tabs.attr('aria-selected', 'false');
	$(`button[aria-controls="${tabId}"]`).attr('aria-selected', 'true');
}
// Global function to load tab content
function loadTabContent(tabId, url) {
	$(tabId).load(url); // Load content from the specified URL into the tab
}

// Global function to unload tab content
function unloadTabContent(tabSelector) {
	$(tabSelector).empty(); // Empty the content of the specified tab
}

// jQuery for draggable and resizable behaviors on "#app-settings"
$(function() {
    var activeWindowSelector = ".window.glass.active";
    
    $(activeWindowSelector).each(function() {
        // Capture initial dimensions
        var $element = $(this);
        var initialWidth = $element.outerWidth();
        var initialHeight = $element.outerHeight();

        // Initialize draggable
        $element.draggable({
            handle: ".title-bar",
            cancel: '.inhalt',
            containment: 'body',
            scroll: false,
            start: function(event, ui) {
                if ($element.resizable("option", "disabled")) {
                    $(this).data('allowDrag', true);
                } else {
                    $(this).data('allowDrag', false);
                    return false; // Prevent dragging if resizable is enabled but not allowed
                }
            },
            drag: function(event, ui) {
                if (!$(this).data('allowDrag')) {
                    return false; // Cancel dragging dynamically if not allowed
                }
            },
            stop: function(event, ui) {
                $(this).data('allowDrag', false); // Reset flag after drag stops
            }
        });

        // Initialize resizable
        $element.resizable({
            handles: 'e, s, w',
            containment: 'body',
            minWidth: initialWidth,
            minHeight: initialHeight,
            start: function(event, ui) {
                if ($element.draggable("option", "disabled")) {
                    $(this).data('allowResize', true);
                } else {
                    $(this).data('allowResize', false);
                    return false; // Prevent resizing if draggable is enabled but not allowed
                }
            },
            resize: function(event, ui) {
                if (!$(this).data('allowResize')) {
                    return false; // Cancel resizing dynamically if not allowed
                }
            },
            stop: function(event, ui) {
                $(this).data('allowResize', false); // Reset flag after resize stops
            }
        });
    });

    // Adjust maximum height and width on window resize
    $(window).resize(function() {
        var maxHeight = $(window).height();
        var maxWidth = $(window).width();

        $(activeWindowSelector).each(function() {
            $(this).resizable("option", "maxHeight", maxHeight).resizable("option", "maxWidth", maxWidth);
            
            // Adjust the .window-body inside each active window
            $(this).find(".window-body").css({
                'max-height': maxHeight - $(this).find(".title-bar").outerHeight(true) - 20, // Consider title bar height and padding
                'overflow-y': 'auto' // Ensure scrollability
            });
        });
    });
});
