document.addEventListener('DOMContentLoaded', () => {
    // Set custom cursor for all input elements and buttons
    const inputsAndButtons = document.querySelectorAll('input, button');

    inputsAndButtons.forEach(element => {
        element.addEventListener('mouseenter', () => {
            // Change cursor when hovering
            document.body.style.cursor = 'url("content/assets/images/cur/chrome/chrome.cur"), default';
        });

        element.addEventListener('mouseleave', () => {
            // Reset cursor when not hovering
            document.body.style.cursor = 'default';
        });
    });

    // For dragging interactions (primarily affects input[type="range"])
    inputsAndButtons.forEach(element => {
        element.addEventListener('mousedown', () => {
            // Change cursor when starting to drag/click
            document.body.style.cursor = 'url("content/assets/images/cur/chrome/chrome.cur"), default';
        });

        // Consider resetting the cursor on mouseup globally to cover cases
        // where the mouse is released outside the element
        document.addEventListener('mouseup', () => {
            document.body.style.cursor = 'default'; // Reset to default after mouse release
        });
    });
});
