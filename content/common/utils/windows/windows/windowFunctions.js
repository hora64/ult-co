var zIndexCounter = 1000; // Start with a high z-index value

function minimizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? '' : 'none';
    window.classList.remove('maximized'); // Ensure maximizing state is toggled off for visual consistency
}

function maximizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = '';
    if (window.classList.contains('maximized')) {
        window.classList.remove('maximized');
        window.style.maxWidth = '';
        window.style.height = '';
    } else {
        window.classList.add('maximized');
        window.style.maxWidth = '100%';
        window.style.height = '100%';
    }
    window.classList.remove('minimized'); // Ensure minimizing state is toggled off if window is maximized
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

function switchTab(tabId, tabPath) {
    const $tabPanels = $('article[role="tabpanel"]');
    const $tabs = $('menu[role="tablist"] button');

    // Hide all tab panels and mark them as hidden
    $tabPanels.hide().attr('hidden', true);

    // Load the content for the selected tab using the provided path
    $('#' + tabId).load(tabPath, function(response, status, xhr) {
        if (status === "error") {
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

function loadTabContent(containerId, tabId, url) {
    $("#" + containerId + " " + tabId).load(url); // Load content from the specified URL into the tab within the container
}

function unloadTabContent(containerId, tabSelector) {
    $("#" + containerId + " " + tabSelector).empty(); // Empty the content of the specified tab within the container
}

function selectTab(tabButton, containerId) {
    // Remove aria-selected from all tabs within the specified container
    $("#" + containerId + " menu[role='tablist'] button").attr("aria-selected", "false");
    // Set aria-selected to true for the clicked tab
    $(tabButton).attr("aria-selected", "true");
}

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

// jQuery to initialize draggable and resizable windows
$(function() {
    var activeWindowSelector = ".window.glass";
    
    // Initialize zIndex counter
    var zIndexCounter = 1000; // Start with a high z-index value

    $(".window.glass").draggable({
        handle: ".title-bar",
        containment: 'body',
        start: function(event, ui) {
            // Increase zIndexCounter and apply it to the dragged element
            zIndexCounter++;
            $(this).css('z-index', zIndexCounter);
        }
    });

    $(".window.glass").resizable({
        // Add options if needed
    });

    // Bring the window to the front on click
    $(document).on('click', '.window', function() {
        zIndexCounter++;
        $(this).css('z-index', zIndexCounter);
    });

    // Function to apply the color from sliders
    function applySliderColor() {
        var red = $('#red-slider').val(),
            green = $('#green-slider').val(),
            blue = $('#blue-slider').val();
        var rgbColor = `rgb(${red}, ${green}, ${blue})`;
        applyColor(rgbColor, false); // Applying color without cooldown
    }

    // Event handler for the color sliders
    $('#red-slider, #green-slider, #blue-slider').on('input change', applySliderColor);

    // Activate the first tab on document ready
    $(document).ready(function() {
        $('[role="tab"]:first').click();
    });
});

function loadContent(container, url, page) {
    const newDivId = `app-${page}`;
    $(container).append(`<div id="${newDivId}" class="draggable"></div>`);
    $(`#${newDivId}`).load(url, function(response, status, xhr) {
        if (status === "error") {
            console.log("Error loading content: " + xhr.status + " " + xhr.statusText);
        }
    });
}

function redirectToVideo(url) {
    window.location.href = url;
}

function loadJudgingSheet(url, page) {
    const newDivId = `app-${page}`;
    $('#app-contest').append(`<div id="${newDivId}" class="draggable"><div class="judging-sheet"><iframe src="${url}" frameborder="0" width="100%" height="500px"></iframe></div></div>`);
}

function loadPageHashContent() {
                $.getJSON('content/jsonLists/pageHashes.json', function (data) {
                    console.log("Page Hashes:", data); // Log the pageHashes data to the console
                    const hash = window.location.hash.substring(1);
                    console.log("Current Hash:", hash); // Log the current hash

                    const contentUrl = data[hash];
                    if (contentUrl) {
                        const baseHash = hash.replace(/-(info|judgingSheet|resultsVideo)$/, '');
                        if (hash.endsWith("-info")) {
                            loadContent('#app-container', contentUrl, baseHash);
                        } else if (hash.endsWith("-judgingSheet")) {
                            loadJudgingSheet(contentUrl, baseHash);
                        } else if (hash.endsWith("-results-vid")) {
                            redirectToVideo(contentUrl);
                        } else {
                            loadContent('#app-container', contentUrl, baseHash);
                        }
                    } else {
                        console.log("No matching content for hash:", hash);
                    }
                });
}
