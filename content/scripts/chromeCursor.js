document.addEventListener('DOMContentLoaded', () => {
    // Custom cursor URL
    const customCursorURL = 'url("content/assets/images/cur/chrome/chrome.cur"), default';

    // Apply custom cursor to all input elements, buttons, and input[type="range"] sliders
    const interactiveElements = document.querySelectorAll('input, button');

    // Function to change cursor on mouse enter
    function changeCursorOnHover(element) {
        element.addEventListener('mouseenter', () => {
            document.body.style.cursor = customCursorURL;
        });

        element.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'default'; // Reset to default cursor when not hovering
        });
    }

    // Apply custom cursor change on hover to all selected elements
    interactiveElements.forEach(changeCursorOnHover);

    // Change cursor on mouse down for draggable interactions and reset on mouse up
    document.addEventListener('mousedown', () => {
        document.body.style.cursor = customCursorURL;
    });

    document.addEventListener('mouseup', () => {
        document.body.style.cursor = 'default'; // Reset to default cursor after mouse release
    });
});
