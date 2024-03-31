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
    $(".window.glass.active").draggable({
        handle: ".title-bar", // Specify the handle for dragging
        cancel: '.inhalt',
        containment: 'body',
        scroll: false
    }).resizable({
        handles: 'n, e, s, w, ne, se, sw, nw',
        containment: 'body',
        minHeight: 80,
        minWidth: 138,
        maxHeight: $(window).height(),
        maxWidth: $(window).width()
    });

    $(window).resize(function() {
        $(".window.glass.active").resizable("option", "maxHeight", $(window).height());
        $(".window.glass.active").resizable("option", "maxWidth", $(window).width());
    });
});
