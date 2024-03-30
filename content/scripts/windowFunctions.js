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

$(document).ready(function() {
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

	// Initial display setup
	let firstTabId = $('menu[role="tablist"] button:first').attr('aria-controls');
	switchTab(firstTabId);

	// Bind click event to tabs
	$('menu[role="tablist"] button').click(function() {
		var tabId = $(this).attr('aria-controls');
		switchTab(tabId);
	});
});



// Function to apply the color from sliders and save to localStorage
function applyColor() {
	// Wrap updateColorTheme with debounce
	const debouncedUpdateColorTheme = debounce(function() {
		const red = document.getElementById('window-red-slider').value,
			green = document.getElementById('window-green-slider').value,
			blue = document.getElementById('window-blue-slider').value;

		// Update the CSS variable
		document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);

		// Save the color settings to localStorage
		localStorage.setItem('colorSettings', JSON.stringify({
			red,
			green,
			blue
		}));
		console.log('Saved Colors:', {
			red,
			green,
			blue
		});
	}, 100);

	// Setup event listeners for the color sliders
	document.getElementById('window-red-slider').addEventListener('input', debouncedUpdateColorTheme);
	document.getElementById('window-green-slider').addEventListener('input', debouncedUpdateColorTheme);
	document.getElementById('window-blue-slider').addEventListener('input', debouncedUpdateColorTheme);
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
		document.getElementById('window-red-slider').value = colors.red;
		document.getElementById('window-green-slider').value = colors.green;
		document.getElementById('window-blue-slider').value = colors.blue;
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

document.addEventListener('DOMContentLoaded', function() {
	// Event listener for the mouse click effect toggle
	document.getElementById('enable-click-effect').addEventListener('change', function() {
		toggleCheckboxEffect(this);
	});

	// Event listener for the mouse trail toggle
	document.getElementById('enable-mouse-trail').addEventListener('change', function() {
		toggleCheckboxEffect(this);
	});

	// Initialize the visibility based on the checkbox state
	toggleCheckboxEffect(document.getElementById('enable-click-effect'));
	toggleCheckboxEffect(document.getElementById('enable-mouse-trail'));
});

function toggleCheckboxEffect(checkbox) {
	// Find the next sibling element with the class 'hiddenCheckbox'
	let nextHiddenCheckbox = checkbox.parentElement.nextElementSibling;
	while (nextHiddenCheckbox && !nextHiddenCheckbox.classList.contains('hiddenCheckbox')) {
		nextHiddenCheckbox = nextHiddenCheckbox.nextElementSibling;
	}

	// If a corresponding 'hiddenCheckbox' element is found, toggle its display
	if (nextHiddenCheckbox) {
		if (checkbox.checked) {
			nextHiddenCheckbox.style.display = 'block'; // Show the settings
		} else {
			nextHiddenCheckbox.style.display = 'none'; // Hide the settings
		}
	}
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
