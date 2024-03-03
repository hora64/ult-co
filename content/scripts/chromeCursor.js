document.addEventListener('DOMContentLoaded', () => {
    // Set custom cursor on document load
    document.body.style.cursor = 'url("/path/to/defaultCursor.cur"), default';

    // Change cursor on mouse down anywhere in the document
    document.addEventListener('mousedown', () => {
        document.body.style.cursor = 'url("/path/to/clickCursor.cur"), default';
    });

    // Reset cursor on mouse up
    document.addEventListener('mouseup', () => {
        document.body.style.cursor = 'url("/path/to/defaultCursor.cur"), default';
    });

    // Example: Change cursor when hovering over a specific element
    const specialElement = document.getElementById('specialElement');
    if (specialElement) {
        specialElement.addEventListener('mouseenter', () => {
            document.body.style.cursor = 'url("/path/to/hoverCursor.cur"), pointer';
        });

        specialElement.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'url("/path/to/defaultCursor.cur"), default';
        });
    }
});
