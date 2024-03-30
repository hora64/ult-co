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
    radio.addEventListener('change', toggleRgbSliders);
});

document.addEventListener('DOMContentLoaded', function() {
    // Activate the first tab
    document.querySelector('[role="tab"]:first-of-type').click();
});

document.addEventListener('DOMContentLoaded', function() {
    // Function to switch tabs and display corresponding content
    function switchTab(tabId) {
        // Hide all tab content sections
        document.querySelectorAll('article[role="tabpanel"]').forEach(tab => {
            tab.style.display = 'none';
            tab.setAttribute('hidden', true);
        });
        // Show the selected tab content and remove the hidden attribute
        document.getElementById(tabId).style.display = '';
        document.getElementById(tabId).removeAttribute('hidden');

        // Update aria-selected for all tabs
        document.querySelectorAll('menu[role="tablist"] button').forEach(tabBtn => {
            tabBtn.setAttribute('aria-selected', 'false');
        });
        // Mark the current tab as selected
        document.querySelector('menu[role="tablist"] button[aria-controls="' + tabId + '"]').setAttribute('aria-selected', 'true');
    }

    // Initial display setup
    let firstTabId = document.querySelector('menu[role="tablist"] button:first-of-type').getAttribute('aria-controls');
    switchTab(firstTabId);

    // Bind click event to tabs
    document.querySelectorAll('menu[role="tablist"] button').forEach(tabBtn => {
        tabBtn.addEventListener('click', function() {
            var tabId = this.getAttribute('aria-controls');
            switchTab(tabId);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Make the window draggable
    document.getElementById('settingsWindow').querySelector('.title-bar').addEventListener('mousedown', function(event) {
        const window = event.target.closest('.window');
        if (window) {
            const initialX = event.clientX - window.getBoundingClientRect().left;
            const initialY = event.clientY - window.getBoundingClientRect().top;

            function moveWindow(event) {
                window.style.left = event.clientX - initialX + 'px';
                window.style.top = event.clientY - initialY + 'px';
            }

            function stopMovingWindow() {
                document.removeEventListener('mousemove', moveWindow);
                document.removeEventListener('mouseup', stopMovingWindow);
            }

            document.addEventListener('mousemove', moveWindow);
            document.addEventListener('mouseup', stopMovingWindow);
        }
    });

    // Make the window resizable
    document.getElementById('settingsWindow').querySelector('.window-body').addEventListener('mousedown', function(event) {
        const window = event.target.closest('.window');
        if (window) {
            const initialWidth = window.offsetWidth;
            const initialHeight = window.offsetHeight;
            const initialX = event.clientX;
            const initialY = event.clientY;

            function resizeWindow(event) {
                const width = initialWidth + (event.clientX - initialX);
                const height = initialHeight + (event.clientY - initialY);
                window.style.width = width + 'px';
                window.style.height = height + 'px';
            }

            function stopResizingWindow() {
                document.removeEventListener('mousemove', resizeWindow);
                document.removeEventListener('mouseup', stopResizingWindow);
            }

            document.addEventListener('mousemove', resizeWindow);
            document.addEventListener('mouseup', stopResizingWindow);
        }
    });
});
