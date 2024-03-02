var music = document.getElementById('startup');
music.volume = 0.2; // Set the volume to 20%

var promise = music.play();

if (promise !== undefined) {
    promise.then(() => {
        // Autoplay started successfully
        console.log("Playback started successfully.");
    }).catch(error => {
        // Autoplay was prevented.
        console.log("Playback was prevented. Error:", error);
        // Show a UI element to let the user manually start playback
    });
}
