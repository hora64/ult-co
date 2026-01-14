/**
 * JumpScare Module
 * Displays a Halloween jump scare when the date is set to 10/31/2000
 * Fits within 3DS-style top (400x240) and bottom (320x240) screens
 */

export class JumpScare {
    constructor() {
        this.isActive = false;
        this.topOverlay = null;
        this.bottomOverlay = null;
        // URL to the scary image - using Employment-Job-Application-791x1024.png
        // Place this image in: content/common/assets/Employment-Job-Application-791x1024.png
        this.scaryImageUrl = '/content/common/assets/Employment-Job-Application-791x1024.png';
        this.audioUrl = '/content/common/assets/huh.ogg';
    }

    /**
     * Checks if the given date is October 31, 2000 (Halloween)
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is 10/31/2000
     */
    isHalloweenDate(date) {
        return date.getDate() === 31 && 
               date.getMonth() === 9 && // October is month 9 (0-indexed)
               date.getFullYear() === 2000;
    }

    /**
     * Triggers the jump scare animation
     * @param {Object} options - Configuration options
     * @param {Function} options.onComplete - Callback when animation completes
     * @param {number} options.duration - Duration in milliseconds (default: 3000)
     */
    trigger(options = {}) {
        if (this.isActive) return;
        
        const {
            onComplete = () => {},
            duration = 3000
        } = options;

        this.isActive = true;

        // Get the top and bottom screen elements
        let topScreen = document.getElementById('topScreen');
        let bottomScreen = document.getElementById('bottomScreen');

        // Fallback: if elements not found, create fullscreen overlays on body
        const useFallback = !topScreen || !bottomScreen;
        
        if (useFallback) {
            console.warn('[JumpScare] Screen elements not found, using fullscreen fallback');
            this.createFullscreenFallback(onComplete, duration);
            return;
        }

        // Create top screen overlay with scary image (instant, no fade)
        this.topOverlay = document.createElement('div');
        this.topOverlay.className = 'jumpscare-top-overlay';
        this.topOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        `;

        // Create image element for jump scare (no animation)
        const scaryImage = document.createElement('img');
        scaryImage.src = this.scaryImageUrl;
        scaryImage.alt = 'Scary Image';
        scaryImage.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            filter: contrast(1.2) brightness(1.1);
        `;
        
        // Handle image load error
        scaryImage.onerror = () => {
            console.error('[JumpScare] Failed to load image:', this.scaryImageUrl);
            scaryImage.alt = '⚠️ IMAGE NOT FOUND';
            scaryImage.style.fontSize = '48px';
            scaryImage.style.color = '#ff0000';
        };
        
        this.topOverlay.appendChild(scaryImage);

        // Create bottom screen overlay (empty black screen, no text, instant)
        this.bottomOverlay = document.createElement('div');
        this.bottomOverlay.className = 'jumpscare-bottom-overlay';
        this.bottomOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
        `;

        // Add overlays to screens
        topScreen.appendChild(this.topOverlay);
        bottomScreen.appendChild(this.bottomOverlay);

        // Play huh.ogg audio
        this.playAudio();

        // Auto-dismiss after duration
        const autoDismissTimeout = setTimeout(() => {
            this.dismiss(onComplete);
        }, duration);

        // Allow click to dismiss early
        const clickHandler = () => {
            clearTimeout(autoDismissTimeout);
            this.dismiss(onComplete);
        };
        this.bottomOverlay.addEventListener('click', clickHandler);
        this.topOverlay.addEventListener('click', clickHandler);

        // Log the scare
        console.log('🎃 JUMP SCARE TRIGGERED! Happy Halloween 2000! 🎃');
    }

    /**
     * Creates a fullscreen fallback overlay when screen elements aren't available
     * @param {Function} onComplete - Callback when dismissed
     * @param {number} duration - Duration in milliseconds
     */
    createFullscreenFallback(onComplete, duration) {
        // Create single fullscreen overlay (instant, no fade)
        this.topOverlay = document.createElement('div');
        this.topOverlay.className = 'jumpscare-fullscreen-overlay';
        this.topOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
        `;

        // Create image for jump scare (no animation)
        const scaryImage = document.createElement('img');
        scaryImage.src = this.scaryImageUrl;
        scaryImage.alt = 'Scary Image';
        scaryImage.style.cssText = `
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
            filter: contrast(1.2) brightness(1.1);
        `;
        
        // Handle image load error
        scaryImage.onerror = () => {
            console.error('[JumpScare] Failed to load image:', this.scaryImageUrl);
            scaryImage.alt = '⚠️ IMAGE NOT FOUND';
            scaryImage.style.fontSize = '48px';
            scaryImage.style.color = '#ff0000';
        };
        
        this.topOverlay.appendChild(scaryImage);

        // Add to body
        document.body.appendChild(this.topOverlay);

        // Play huh.ogg audio
        this.playAudio();

        // Auto-dismiss after duration
        const autoDismissTimeout = setTimeout(() => {
            this.dismiss(onComplete);
        }, duration);

        // Allow click to dismiss early
        const clickHandler = () => {
            clearTimeout(autoDismissTimeout);
            this.dismiss(onComplete);
        };
        this.topOverlay.addEventListener('click', clickHandler);

        console.log('🎃 JUMP SCARE TRIGGERED (Fullscreen Fallback)! Happy Halloween 2000! 🎃');
    }

    /**
     * Plays the huh.ogg audio file
     */
    playAudio() {
        try {
            const audio = new Audio(this.audioUrl);
            audio.volume = 1.0; // Full volume
            audio.play().catch(error => {
                console.warn('[JumpScare] Could not play audio:', error);
            });
        } catch (error) {
            console.warn('[JumpScare] Audio playback failed:', error);
        }
    }

    /**
     * Dismisses the jump scare overlay instantly (no fade-out to prevent pixelization)
     * @param {Function} onComplete - Callback when dismissed
     */
    dismiss(onComplete = () => {}) {
        if (!this.isActive) return;

        // Remove overlays instantly (no fade-out animation)
        if (this.topOverlay && this.topOverlay.parentElement) {
            this.topOverlay.remove();
        }
        if (this.bottomOverlay && this.bottomOverlay.parentElement) {
            this.bottomOverlay.remove();
        }
        
        this.topOverlay = null;
        this.bottomOverlay = null;
        this.isActive = false;
        onComplete();
    }

    /**
     * Force removes the jump scare immediately
     */
    forceRemove() {
        if (this.topOverlay && this.topOverlay.parentElement) {
            this.topOverlay.remove();
        }
        if (this.bottomOverlay && this.bottomOverlay.parentElement) {
            this.bottomOverlay.remove();
        }
        this.topOverlay = null;
        this.bottomOverlay = null;
        this.isActive = false;
    }
}

// Export a singleton instance
export const jumpScare = new JumpScare();
