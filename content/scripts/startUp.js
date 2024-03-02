document.addEventListener('DOMContentLoaded', (event) => {
    var sound = document.getElementById('startup');
    sound.play().catch(error => {
        // Autoplay policy might prevent the sound from playing until a user interaction
        console.error("Autoplay was prevented.", error);
        // You can implement a user interaction requirement here, if necessary.
    });
});
