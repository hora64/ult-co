$(document).ready(function() {
    // Load and apply startup sound
    const savedStartupSound = loadFromLocalStorage('startupSound') || 'content/assets/audio/7startup.mp3'; // Default startup sound path
    applyStartupSound(savedStartupSound);

    const savedVolume = loadFromLocalStorage('startupSoundVolume') || 0.2; // Default volume
    applyStartupVolume(savedVolume);
});

function applyStartupSound(selectedSound) {
    $('#startup').prop('src', selectedSound);
    saveToLocalStorage('startupSound', selectedSound);
}

function applyStartupVolume(volume) {
    $('#startup').prop('volume', volume);
    saveToLocalStorage('startupSoundVolume', volume);
}

function playStartupSound() {
    document.getElementById('startup')?.play().then(() => console.log('Startup sound played successfully')).catch(error => console.error('Failed to play startup sound:', error));
}


// Wait for the full page content to load
window.addEventListener('DOMContentLoaded', (event) => {
    // Play the startup sound immediately
    playStartupSound();

    // Set a delay before attempting to play the sound again
    setTimeout(playStartupSound, 3000); // 3000 milliseconds = 3 seconds
});
