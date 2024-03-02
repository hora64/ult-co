document.getElementById('playButton').addEventListener('click', function() {
    var sound = document.getElementById('startup');
    sound.play().then(() => {
        // Hide the button after successful play
        this.style.display = 'none';
    }).catch(error => {
        console.error("Error playing the sound:", error);
    });
});
