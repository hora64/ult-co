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

function cooldown(cooldownDuration) {
    let lastCalled = 0;
    return function(useCooldown) {
        const timeElapsed = Date.now() - lastCalled;
        if (useCooldown && timeElapsed < cooldownDuration) {
            console.log(`Function is on cooldown. Please wait ${timeElapsed}ms`);
            return false;
        }
        return !(lastCalled = Date.now(), false);
    };
}
