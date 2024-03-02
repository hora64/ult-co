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
        handle: ".title-bar"
    });
	$(".window.glass.active").resizable({
		handles: 'n, e, s, w, ne, se, sw, nw',
		containment: 'body',
		minHeight: 80,
		minWidth: 138,
		maxHeight: $(window).height(),
		maxWidth: $(window).width()
	});
    // Function to apply the color from sliders
    function applyColor() {
        var red = $('#red-slider').val(),
            green = $('#green-slider').val(),
            blue = $('#blue-slider').val();
        document.documentElement.style.setProperty('--title-color', `rgb(${red}, ${green}, ${blue})`);
    }


    // Event handler for the color sliders
    $('#red-slider, #green-slider, #blue-slider').on('input', applyColor);

    // Activate the first tab on document ready
    $(document).ready(function() {
        $('[role="tab"]:first').click();
    });

})(jQuery);
