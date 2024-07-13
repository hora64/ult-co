export function initDraggable(element, handle) {
    $(element).draggable({
        handle: handle,
        containment: 'body'
    });
}

export function minimizeWindow(button) {
    const shadowRoot = button.closest('.window').getRootNode();
    const window = shadowRoot.querySelector('.window');
    const windowBody = shadowRoot.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? '' : 'none';
    window.classList.remove('maximized');
}

export function maximizeWindow(button) {
    const shadowRoot = button.closest('.window').getRootNode();
    const window = shadowRoot.querySelector('.window');
    const windowBody = shadowRoot.querySelector('.window-body');
    windowBody.style.display = '';
    if (window.style.maxWidth === '100%') {
        window.classList.remove('maximized');
        window.style.maxWidth = '';
        window.style.height = '';
    } else {
        window.classList.add('maximized');
        window.style.maxWidth = '100%';
        window.style.height = '100%';
    }
    window.classList.remove('minimized');
}

export function closeWindow(button) {
    const shadowRoot = button.closest('div[part="window"]').getRootNode();
    const window = shadowRoot.host;
    window.remove();
}

export function toggleContainer(controlElementId, containerElementId) {
    const controlElement = document.getElementById(controlElementId);
    const containerElement = document.getElementById(containerElementId);
    if (containerElement && controlElement) {
        containerElement.style.display = controlElement.checked ? 'block' : 'none';
    } else {
        console.error('Element not found:', controlElementId, containerElementId);
    }
}

export function initializeShadowContent(containerId, windowId, stylesheetUrl, htmlPageUrl, draggableFunction) {
    const windowElement = document.getElementById(windowId);

    if (!windowElement) {
        console.error(`Element with ID ${windowId} not found.`);
        return;
    }

    // Create a new div with the contentId and append it to the window element
    const newDiv = document.createElement('div');
    newDiv.id = containerId;
    newDiv.className = 'centered-container';
    windowElement.appendChild(newDiv);

    // Attach a shadow root to the new div
    const shadowRoot = newDiv.attachShadow({ mode: 'open' });

    // Load the stylesheet exclusively within the shadow root
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetUrl;
    shadowRoot.appendChild(link);

    // Create the window body in the shadow root
    const windowBody = document.createElement('div');
    windowBody.className = 'window-body';
    shadowRoot.appendChild(windowBody);

    // Load the content into the newly created div
    $.get(htmlPageUrl, function(data) {
        $(windowBody).html(data);
        // Initialize draggable functionality after content is loaded
        if (typeof draggableFunction === 'function') {
            draggableFunction(newDiv, windowBody.querySelector('.title-bar'));
        } else {
            console.error('Provided draggableFunction is not a function.');
        }
    });
}