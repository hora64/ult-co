// Common utilities for handling deep links and audio fades

/**
 * Listens for deep-link messages from a parent window and executes a callback.
 * @param {function} callback - The function to call with the deep-link slug.
 */
function handleDeepLink(callback) {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'deep-link' && event.data.slug) {
            console.log('Deep-link message received:', event.data.slug);
            callback(event.data.slug);
        }
    });
}

/**
 * Listens for audio fade requests from a parent window and executes a callback.
 * @param {function} callback - The function to call to initiate the audio fade.
 */
function handleAudioFade(callback) {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'requestAudioFade') {
            console.log('Audio fade request received.');
            callback();
        }
    });
}

/**
 * Creates a cooldown function.
 * @param {number} cooldownDuration - The duration of the cooldown in milliseconds.
 * @returns {function} A function that accepts a boolean to use the cooldown.
 */
export function cooldown(cooldownDuration) {
    let lastCalled = 0;
    return function(useCooldown) {
        const timeElapsed = Date.now() - lastCalled;
        if (useCooldown && timeElapsed < cooldownDuration) {
            console.log(`Function is on cooldown. Please wait ${cooldownDuration - timeElapsed}ms`);
            return false;
        }
        lastCalled = Date.now();
        return true;
    };
}

/**
 * Loads JSON data from a file.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<Object[]>} A promise that resolves to the loaded JSON data.
 */
export async function loadJsonData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading JSON data from ${filePath}:`, error);
        return [];
    }
}

/**
 * Renames a class for elements with a specific old class name within a given element.
 * @param {string} oldClassName - The old class name to be replaced.
 * @param {string} elementId - The ID of the element containing the targets.
 * @param {string} newClassName - The new class name to assign.
 */
export function renameClass(oldClassName, elementId, newClassName) {
    const element = document.getElementById(elementId);
    if (element) {
        const targetElements = element.querySelectorAll(`.${oldClassName}`);
        targetElements.forEach(target => {
            target.classList.remove(oldClassName);
            target.classList.add(newClassName);
        });
        console.log(`Renamed class from ${oldClassName} to ${newClassName} for element ${elementId}.`);
    } else {
        console.error(`Element with id ${elementId} not found.`);
    }
}

export function startCountdown({ 
    dom, 
    start, 
    end, 
    onStartMessage = "Countdown will begin soon.", 
    onEndMessage = "Deadline has passed.",
    onTBDMessage = "To Be Determined.",
    onCanceledMessage = "This event has been canceled.",
    status 
}) {
    const element = document.getElementById(dom);
    if (!element) {
        console.error(`Countdown DOM element with id ${dom} not found.`);
        return;
    }

    if (status === 'canceled') {
        element.innerHTML = onCanceledMessage;
        return;
    }

    if (status === 'TBD' || !end) {
        element.innerHTML = onTBDMessage;
        return;
    }

    let countdownInterval;

    const runCountdown = () => {
        const now = new Date().getTime();

        if (start && now < start) {
            element.innerHTML = onStartMessage;
            // Check again in 1 second
            setTimeout(runCountdown, 1000); 
            return;
        }

        // Clear any existing interval before starting a new one
        if (countdownInterval) clearInterval(countdownInterval);

        const update = () => {
            const now_inner = new Date().getTime();
            const timeRemaining = end - now_inner;

            if (timeRemaining < 0) {
                clearInterval(countdownInterval);
                element.innerHTML = onEndMessage;
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            element.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };
        
        update();
        countdownInterval = setInterval(update, 1000);
    };

    runCountdown();
}
