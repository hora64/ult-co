class MyWindow extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <div class="window">
                <div class="title-bar">
                    <button onclick="minimizeWindow(this)">Minimize</button>
                    <button onclick="maximizeWindow(this)">Maximize</button>
                    <button onclick="closeWindow(this)">Close</button>
                </div>
                <div class="window-body">
                    Window Content
                </div>
            </div>
            <style>
                .window {
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin: 10px;
                    position: relative;
                    width: 300px;
                    height: 200px;
                }
                .window-body {
                    display: block;
                }
                .maximized {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                }
                .title-bar {
                    cursor: move;
                    background: #eee;
                    padding: 5px;
                    border-bottom: 1px solid #ccc;
                }
            </style>
        `;

        this.windowElement = shadow.querySelector('.window');
        this.titleBar = shadow.querySelector('.title-bar');
    }

    connectedCallback() {
        $(this.windowElement).draggable({
            handle: this.titleBar,
            containment: 'body'
        });
    }
}

customElements.define('my-window', MyWindow);

function minimizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
    windowBody.style.display = windowBody.style.display === 'none' ? '' : 'none';
    window.classList.remove('maximized');
}

function maximizeWindow(button) {
    const window = button.closest('.window');
    const windowBody = window.querySelector('.window-body');
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

function closeWindow(button) {
    const window = button.closest('.window');
    window.remove();
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
