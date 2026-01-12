import { cooldown } from './common-utils.js';

const colorCooldown = cooldown(100);
const volumeCooldown = cooldown(200);

export function applyColor({
    red,
    green,
    blue
}, useCooldown = true) {
    if (!colorCooldown(useCooldown)) return;
    const rgbColor = `rgb(${red}, ${green}, ${blue})`;
    document.documentElement.style.setProperty('--title-color', rgbColor);
    localStorage.setItem('colorSettings', rgbColor);
    console.log('Color applied:', rgbColor);
}

export function applyWallpaper(selectedWallpaper) {
    document.body.style.backgroundImage = `url(${selectedWallpaper})`;
    localStorage.setItem('selectedWallpaper', selectedWallpaper);
}

export function applyFavicon(selectedFavicon) {
    const faviconEl = document.getElementById('dynamicFavicon');
    if (faviconEl) {
        faviconEl.setAttribute('href', selectedFavicon);
        localStorage.setItem('selectedFavicon', selectedFavicon);
    } else {
        console.warn('Favicon element not found');
    }
}

export function applyCursor(selectedCursor) {
    document.documentElement.style.cursor = `url(${selectedCursor}), auto`;
    localStorage.setItem('selectedCursor', selectedCursor);
    console.log('Cursor applied:', selectedCursor);
}

export function applyStartupSound(selectedSound) {
    const startupEl = document.getElementById('startup');
    if (startupEl) {
        startupEl.setAttribute('src', selectedSound);
        localStorage.setItem('startupSound', selectedSound);
    } else {
        console.warn('Startup audio element not found');
    }
}

export function applyStartupVolume(volume, useCooldown = true) {
    if (!volumeCooldown(useCooldown)) return;
    const startupEl = document.getElementById('startup');
    if (startupEl) {
        startupEl.volume = volume;
        localStorage.setItem('startupSoundVolume', volume.toString());
        console.log('Volume applied:', volume);
    } else {
        console.warn('Startup audio element not found');
    }
}

export function playStartupSound() {
    const startupEl = document.getElementById('startup');
    if (startupEl) {
        startupEl.play()
            .then(() => console.log('Startup sound played successfully'))
            .catch(error => console.error('Failed to play startup sound:', error));
    } else {
        console.warn('Startup audio element not found');
    }
}

export function applySliderColor() {
    const red = parseInt(document.getElementById('red-slider').value, 10);
    const green = parseInt(document.getElementById('green-slider').value, 10);
    const blue = parseInt(document.getElementById('blue-slider').value, 10);
    const rgbColor = {
        red,
        green,
        blue
    };
    applyColor(rgbColor);
}

export function parseColor(rgbString) {
    const rgbValues = rgbString.match(/\d+/g);
    if (rgbValues) {
        return {
            red: parseInt(rgbValues[0], 10),
            green: parseInt(rgbValues[1], 10),
            blue: parseInt(rgbValues[2], 10)
        };
    }
    return null;
}