    _replaceUnopenedApp(currentAppContainer, appOptions, appGridInstance, onUnwrapComplete) {
        // The old button will be replaced, so we should clean up its options from the map
        const oldButton = currentAppContainer.querySelector('.app-button');
        if (oldButton) {
            this.elementOptionsMap.delete(oldButton);
        }

        // CRITICAL FIX: Handle baseIcon apps differently
        // When baseIcon: true, the icon IS the complete image, no overlay needed
        let actualIcon;
        let newBaseIcon;
        let backgroundIconToUse = null;
        
        // When unwrapping, we MUST use actualIcon - never fall back to icon as it contains the gift box
        if (!appOptions.actualIcon) {
            console.error('[AppIcon] Cannot unwrap app - actualIcon is not defined!', appOptions);
            // Attempt recovery by using icon if it's not a placeholder URL
            actualIcon = appOptions.icon?.includes('placehold.co') ? null : appOptions.icon;
            if (!actualIcon) {
                console.error('[AppIcon] No valid icon found for unwrapping');
                return;
            }
        } else {
            actualIcon = appOptions.actualIcon;
        }
        
        if (appOptions.baseIcon === true) {
            // For baseIcon apps, the icon is the complete standalone image
            // Keep baseIcon: true and use actualIcon as the base
            newBaseIcon = true;
            // CRITICAL FIX: Preserve backgroundIcon for baseIcon apps
            // This ensures the background is used when unwrapped
            backgroundIconToUse = appOptions.backgroundIcon || this.defaultBackgroundIcon;
        } else {
            // For normal apps with base+overlay, use actualIcon as the overlay
            newBaseIcon = false;
            // backgroundIcon not needed for overlay mode
        }
        
        // Resolve relative icon path to absolute if needed
        if (actualIcon && !actualIcon.startsWith('/') && !actualIcon.startsWith('http')) {
            actualIcon = `/content/apps/${appOptions.id}/${actualIcon}`;
            console.log('[AppIcon] Resolved relative icon path to:', actualIcon);
        }

        // Create a new options object for the "unboxed" app
        const newAppOptions = {
            ...appOptions,
            unopened: false,
            baseIcon: newBaseIcon, // Preserve baseIcon flag
            icon: actualIcon,
            actualIcon: actualIcon,
            backgroundIcon: backgroundIconToUse // CRITICAL FIX: Pass backgroundIcon for baseIcon apps
        };
        
        console.log('[AppIcon] Creating unwrapped app with baseIcon:', newBaseIcon, 'icon:', actualIcon, 'backgroundIcon:', backgroundIconToUse);

        const newAppVisualContainer = this.createApp(newAppOptions);

        if (currentAppContainer.parentNode) {
            currentAppContainer.parentNode.replaceChild(newAppVisualContainer, currentAppContainer);
            console.log('[AppIcon] Replaced unopened container with actual app container');
        }

        // Notify the AppGrid that a replacement happened so it can update its state and reload banner
        if (appGridInstance && typeof appGridInstance.updateAfterAppReplacement === 'function') {
            console.log('[AppIcon] Calling updateAfterAppReplacement on AppGrid');
            appGridInstance.updateAfterAppReplacement(newAppVisualContainer, newAppOptions, onUnwrapComplete);
        } else {
            // Call the onUnwrapComplete callback if provided and AppGrid didn't handle it
            if (typeof onUnwrapComplete === 'function') {
                console.log('[AppIcon] Calling onUnwrapComplete directly');
                onUnwrapComplete(appOptions);
            }
        }
    }
