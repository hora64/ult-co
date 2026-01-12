// Function to save data to local storage
function saveToLocalStorage(key, data) {
    if (!key || data === undefined) {
        console.error('Invalid key or data provided for saving.');
        return;
    }
    try {
        const isObject = typeof data === 'object' && data !== null;
        localStorage.setItem(key, isObject ? JSON.stringify(data) : data);
        console.log(`${key} saved successfully.`);
        console.log('Saved data:', data); // Log the saved data
    } catch (e) {
        console.error('Error saving data to local storage:', e);
    }
}

// Function to load data from local storage
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    if (data === null) {
        console.log(`${key} not found.`);
        return null;
    }
    try {
        // Attempt to parse JSON data. If parsing fails, assume the data is a plain string.
        return JSON.parse(data);
    } catch (e) {
        return data; // Return as is if it's not JSON
    }
}

// Function to clear data from local storage
function clearLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        console.log(`${key} cleared successfully.`);
    } catch (e) {
        console.error('Error clearing local storage:', e);
    }
}

// Function to manage cooldowns
function cooldown(cooldownDuration) {
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
async function loadJsonData(filePath) {
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

// Function to rename class
function renameClass(oldClassName, elementId, newClassName) {
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


// Example usage of console.log
console.log('All functions are defined and ready to use.');
