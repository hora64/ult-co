import '/content/common/libs/jquery/jquery.js';
import '/content/common/libs/jquery/jquery-ui.js';
import '/content/common/utils/windows/mouse/click.js';
import { startCountdown } from '/content/common/utils/windows/common-utils.js';
import {
    applyColor,
    applyWallpaper,
    applyFavicon,
    applyCursor,
    applyStartupSound,
    applyStartupVolume,
    playStartupSound,
    applySliderColor,
    parseColor
} from '/content/common/utils/windows/settingsManager.js';
import {
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    loadContent,
    loadPageHashContent,
    initializeWindows
} from '/content/common/utils/windows/windowFunctions.js';

document.addEventListener('DOMContentLoaded', function () {
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        $("#app-error").load("content/windows/mobileError.html", function () {
            document.getElementById('error-box').focus();
        });
    } else {
        $("#app-main").load("content/windows/main.html", function () {
            initializeWindows();
            makeWindowsResizableAndDraggable();
        });
        // Initialize the hash content loader which will handle iframe messages
        loadPageHashContent();
    }

    // Listen for audio fade requests
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'requestAudioFade') {
            console.log("Audio fade requested. Implement fade logic if audio is present.");
        }
    });

    const savedColor = localStorage.getItem('colorSettings') || 'rgb(125, 125, 125)';
    applyColor(parseColor(savedColor), false);

    const savedWallpaper = localStorage.getItem('selectedWallpaper') || 'content/assets/images/wallpapers/NewsRoomWallpaper.jpg';
    applyWallpaper(savedWallpaper);

    const savedFavicon = localStorage.getItem('selectedFavicon') || 'content/assets/images/icons/ultcoFrutigerAeroBlue_px64.ico';
    applyFavicon(savedFavicon);

    const savedCursor = localStorage.getItem('selectedCursor') || 'content/assets/images/cur/chrome/chrome.cur';
    applyCursor(savedCursor);

    const savedStartupSound = localStorage.getItem('startupSound') || 'content/assets/audio/7startup.mp3';
    applyStartupSound(savedStartupSound);

    const savedVolume = parseFloat(localStorage.getItem('startupSoundVolume')) || 0.2;
    applyStartupVolume(savedVolume, false);

    playStartupSound();
    setTimeout(playStartupSound, 3000);

    // Event delegation for window controls and other actions
    $(document.body).on('click', '[data-action]', function () {
        const action = $(this).data('action');
        const target = $(this).data('target');
        const url = $(this).data('url');
        const page = $(this).data('page');

        switch (action) {
            case 'minimize-window':
                minimizeWindow(this);
                break;
            case 'maximize-window':
                maximizeWindow(this);
                break;
            case 'close-window':
                closeWindow(this);
                break;
            case 'load-content':
                if (target && url && page) {
                    loadContent(target, url, page);
                }
                break;
            case 'play-startup-sound':
                playStartupSound();
                break;
        }
    });

    $(document.body).on('input', '[data-action="apply-slider-color"]', applySliderColor);
    $(document.body).on('input', '[data-action="apply-startup-volume"]', function () {
        applyStartupVolume(this.value);
    });
    $(document.body).on('mouseup', '[data-action="apply-startup-volume"]', function () {
        applyStartupVolume(this.value, false);
    });
    $(document.body).on('click', 'input[name="wallpaperselect"]', function () {
        applyWallpaper(this.value);
    });
    $(document.body).on('click', 'input[name="faviconSelect"]', function () {
        applyFavicon(this.value);
    });
    $(document.body).on('click', 'input[name="startupSoundSelect"]', function () {
        applyStartupSound(this.value);
    });

    // Expose common functions to the global scope for use in inline scripts
    window.startCountdown = startCountdown;
});

function makeWindowsResizableAndDraggable() {
    // Bring window to front on click
    $(document).on('mousedown', '.window', function () {
        $(this).css('z-index', $.topZIndex++);
    });

    $(".window").draggable({
        handle: ".title-bar",
        start: function () {
            // The mousedown event will have already handled the z-index.
        }
    }).resizable({
        handles: "n, e, s, w, ne, se, sw, nw",
        minHeight: 200,
        minWidth: 200
    });

    // Initialize z-index management
    $.topZIndex = 100;
}
