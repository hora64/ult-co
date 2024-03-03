function playStartupSound() {
    var music = document.getElementById('startup');
    if (music) {
        music.volume = 0.2;
        var promise = music.play();

        if (promise !== undefined) {
            promise.then(_ => {
                console.log('start up sound');
                // Successfully started playback
            }).catch(error => {
                console.error('Failed to play start up sound:', error);
            });
        }
    }
}

// Ensures the event listener is properly added after the document is fully loaded
window.addEventListener('DOMContentLoaded', (event) => {
    document.body.addEventListener('click', playStartupSound, {once: true});
});
