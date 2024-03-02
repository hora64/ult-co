setTimeout(() => {
    var music = document.getElementById('startup');
    music.volume = 0.2;
    var promise = music.play();
    if (promise !== undefined) {
        promise.then(_ => {
            console.log('start up sound');
        }).catch(error => {
            console.log('FAILED AT start up sound');
            // Attempt to mute and play might not be effective due to browser policies on autoplay,
            // and unmuting immediately after playing could still block the sound.
            // It's included here for consistency with your original example, 
            // but you may consider alternative ways to handle autoplay failure, 
            // such as showing a play button for user interaction.
            music.muted = true;
            music.play();
            music.muted = false;
        });
    }
}, 30);
