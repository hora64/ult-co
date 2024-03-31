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
    // Flags to track the state of dragging and resizing
    let isDragging = false;
    let isResizing = false;

    $(".window.glass.active").draggable({
        handle: ".title-bar",
        cancel: '.inhalt',
        containment: 'body',
        scroll: false,
        start: function(event, ui) {
            // Prevent dragging if resizing is active
            if (isResizing) {
                $(this).draggable('disable');
            } else {
                isDragging = true;
            }
        },
        stop: function(event, ui) {
            isDragging = false;
            // Re-enable dragging once the drag action has stopped
            $(this).draggable('enable');
        }
    }).resizable({
        handles: 'e, s, w',
        containment: 'body',
        minHeight: 80,
        minWidth: 138,
        maxHeight: $(window).height(),
        maxWidth: $(window).width(),
        start: function(event, ui) {
            // Prevent resizing if dragging is active
            if (isDragging) {
                $(this).resizable('disable');
            } else {
                isResizing = true;
            }
        },
        stop: function(event, ui) {
            isResizing = false;
            // Re-enable resizing once the resize action has stopped
            $(this).resizable('enable');
        }
    });

    $(window).resize(function() {
        var maxHeight = $(window).height();
        var maxWidth = $(window).width();

        // Update the resizable options
        $(".window.glass.active").resizable("option", "maxHeight", maxHeight);
        $(".window.glass.active").resizable("option", "maxWidth", maxWidth);

        // Adjustments for window-body as previously
        $(".window.glass.active .window-body").each(function() {
            var $this = $(this);
            var padding = 10; // Example padding
            var titleBarHeight = $this.siblings(".title-bar").outerHeight(true) || 0;
            var bodyMaxHeight = maxHeight - titleBarHeight - (padding * 2);
            $this.css({
                'max-height': bodyMaxHeight + 'px',
                'overflow-y': 'auto'
            });
        });
    });
});
