$(document).ready(function() {
    // Load and apply startup sound
    const savedStartupSound = loadFromLocalStorage('startupSoundUrl') || 'content/assets/audio/7startup.mp3'; // Default startup sound path
    const savedVolume = loadFromLocalStorage('startupSoundVolume') || 0.2; // Default volume
    applyStartupSound(savedStartupSound);
    applyVolume(savedVolume);
});

function applyStartupSound(selectedSoundUrl) {
    var audioElement = document.getElementById('startup');
    if (audioElement) {
        audioElement.src = selectedSoundUrl;
    }
    saveToLocalStorage('startupSoundUrl', selectedSoundUrl); // Save the new selection
    playStartupSound();
}

function applyVolume(volume) {
    var music = document.getElementById('startup');
    if (music) {
        music.volume = volume;
        saveToLocalStorage('startupSoundVolume', volume); // Save the new volume
        playStartupSound();
    }
}

function playStartupSound() {
    var music = document.getElementById('startup');
    if (music) {
        music.play()
            .then(() => {
                // Audio playback successful
                console.log('Startup sound played successfully');
            })
            .catch(error => {
                // Audio playback failed
                console.error('Failed to play startup sound:', error);
            });
    }
}
// Wait for the full page content to load
window.addEventListener('DOMContentLoaded', (event) => {
    // Play the startup sound immediately
    playStartupSound();

    // Set a delay before attempting to play the sound again
    setTimeout(playStartupSound, 3000); // 3000 milliseconds = 3 seconds
});
