document.body.addEventListener('click', function playStartupSound() {
    var music = document.getElementById('startup');
    if (music) {
        music.volume = 0.2;
        var promise = music.play();

        if (promise !== undefined) {
            promise.then(_ => {
                console.log('start up sound');
                // Remove the event listener to prevent the sound from playing on every click
                document.body.removeEventListener('click', playStartupSound);
            }).catch(error => {
                console.error('Failed to play start up sound:', error);
            });
        }
    }
}, {once: true}); // Ensures the listener is removed after the first execution
