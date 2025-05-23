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



