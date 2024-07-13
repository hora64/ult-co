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
    const window = button.closest('.window');
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
