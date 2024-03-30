$(document).ready(function() {
	// Load and apply color settings, wallpaper, and favicon
	const hexColor = loadFromLocalStorage('colorSettings') || '#7d7d7d';
	applyColor(hexColor, false);
	
	const savedWallpaper = loadFromLocalStorage('selectedWallpaper') || 'content/assets/images/wallpapers/frutigeraero.jpg';
	applyWallpaper(savedWallpaper);
	
	const savedFavicon = loadFromLocalStorage('selectedFavicon') || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico';
	applyFavicon(savedFavicon);

	// Load and apply startup sound settings and volume
	const savedStartupSound = loadFromLocalStorage('startupSound') || 'content/assets/audio/7startup.mp3'; // Default startup sound path
	applyStartupSound(savedStartupSound);
	
	const savedVolume = loadFromLocalStorage('startupSoundVolume') || 0.2; // Default volume
	applyStartupVolume(savedVolume, false);

	// Play the startup sound immediately
	playStartupSound();

	// Set a delay before attempting to play the sound again
	setTimeout(playStartupSound, 3000); // 3000 milliseconds = 3 seconds
});

const colorCooldown = cooldown(200); // Set cooldown duration to 1000ms (1 second)
const volumeCooldown = cooldown(200);

function applyColor(hexColor, useCooldown = true) {
    if (!colorCooldown(useCooldown)) return;
    document.documentElement.style.setProperty('--title-color', hexColor);
    saveToLocalStorage('colorSettings', hexColor);
    console.log('Color applied:', hexColor);
}

function applyWallpaper(selectedWallpaper) {
    $('body').css('background-image', `url(${selectedWallpaper})`);
    saveToLocalStorage('selectedWallpaper', selectedWallpaper);
}

function applyFavicon(selectedFavicon) {
    $('#dynamicFavicon').attr('href', selectedFavicon);
    saveToLocalStorage('selectedFavicon', selectedFavicon);
}

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

function applyWallpaper(selectedWallpaper) {
	$('body').css('background-image', `url(${selectedWallpaper})`);
	saveToLocalStorage('selectedWallpaper', selectedWallpaper);
}

function applyFavicon(selectedFavicon) {
	$('#dynamicFavicon').attr('href', selectedFavicon);
	saveToLocalStorage('selectedFavicon', selectedFavicon);
}

function applyStartupSound(selectedSound) {
	$('#startup').prop('src', selectedSound);
	saveToLocalStorage('startupSound', selectedSound);
}

function applyStartupVolume(volume, useCooldown = true) {
    if (!volumeCooldown(useCooldown)) return;
    $('#startup').prop('volume', volume);
    saveToLocalStorage('startupSoundVolume', volume);
    console.log('volume applied:', volume);
}

function playStartupSound() {
	document.getElementById('startup')?.play().then(() => console.log('Startup sound played successfully')).catch(error => console.error('Failed to play startup sound:', error));
}
