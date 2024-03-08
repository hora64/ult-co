function playStartupSound() {
	var music = document.getElementById('startup');
	if (music) {
		// Set volume to 20% of maximum
		music.volume = 0.2;
		// Attempt to play the audio
		var promise = music.play();
		if (promise !== undefined) {
			promise.then(_ => {
				// Audio playback successful
				console.log('Startup sound played successfully');
			}).catch(error => {
				// Audio playback failed
				console.error('Failed to play startup sound:', error);
			});
		}
	}
}
// Wait for the full page content to load
window.addEventListener('DOMContentLoaded', (event) => {
	// Set a delay before attempting to play the sound
	setTimeout(playStartupSound, 3000); // 3000 milliseconds = 3 seconds
});