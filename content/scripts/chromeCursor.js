document.addEventListener('DOMContentLoaded', () => {
    // Set custom cursor for sliders
    const sliders = document.querySelectorAll('input[type="range"]');

    sliders.forEach(slider => {
        slider.addEventListener('mouseenter', () => {
            document.body.style.cursor = 'url("content/assets/images/cur/chrome/chrome.cur"), default';
        });

        slider.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'default'; // Reset to default or any other cursor you prefer
        });
    });

    // If you want to change the cursor while dragging the slider thumb, 
    // you can listen to the mousedown and mouseup events on each slider.
    sliders.forEach(slider => {
        slider.addEventListener('mousedown', () => {
            document.body.style.cursor = 'url("content/assets/images/cur/chrome/chrome.cur"), default';
        });

        // Since mouseup might not always fire on the slider (if the user drags the mouse out of the slider),
        // it might be safer to attach this listener to the whole document.
        document.addEventListener('mouseup', () => {
            document.body.style.cursor = 'default'; // Reset to default after releasing the mouse
        });
    });
});
