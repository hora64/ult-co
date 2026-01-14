/**
 * Example: Integrating Version Checker into an Individual App
 * 
 * This file demonstrates how to add version checking to a specific app
 * that runs in an iframe. Copy this code pattern to any app that needs
 * version checking functionality.
 */

// Import the version checker utilities
import { versionChecker } from '/content/common/utils/versionChecker.js';
import { initializeVersionCheckerUI } from '/content/common/utils/versionCheckerUI.js';

/**
 * Initialize version checking for this app
 */
async function initializeVersioning() {
    try {
        // Option 1: Silent version check (no UI)
        const result = await versionChecker.checkVersion();
        
        if (result.hasChanged) {
            console.log('[App] Version updated!', {
                from: result.storedVersion,
                to: result.currentVersion,
                dataCleared: result.dataCleared
            });
            
            // You can add custom logic here, e.g.:
            // - Show a custom notification
            // - Reload app-specific data
            // - Redirect to a "What's New" page
        }

        // Option 2: With UI (uncomment to use)
        /*
        const ui = await initializeVersionCheckerUI({
            position: 'bottom-right',
            showOnVersionChange: true,
            autoHideDelay: 5000,
            enableShortcut: true
        });
        */

        // Option 3: Custom version change handler
        /*
        versionChecker.onVersionChange = async (newVersion, oldVersion) => {
            // Show app-specific notification
            alert(`App updated from ${oldVersion} to ${newVersion}!`);
            
            // Reload app-specific data
            await reloadAppData();
        };
        */

    } catch (error) {
        console.error('[App] Version check failed:', error);
    }
}

/**
 * Example: Check version before critical operations
 */
async function beforeCriticalOperation() {
    const info = await versionChecker.getVersionInfo();
    
    if (!info.match) {
        // Version mismatch detected
        const shouldUpdate = confirm(
            'A new version is available. Update now? (Recommended)'
        );
        
        if (shouldUpdate) {
            await versionChecker.forceUpdate();
            window.location.reload();
        }
    }
    
    // Proceed with operation
}

/**
 * Example: Manual version check button
 */
function setupVersionCheckButton() {
    const button = document.createElement('button');
    button.textContent = 'Check for Updates';
    button.onclick = async () => {
        button.disabled = true;
        button.textContent = 'Checking...';
        
        try {
            const result = await versionChecker.checkVersion();
            
            if (result.hasChanged) {
                alert(`Updated to version ${result.currentVersion}!`);
                window.location.reload();
            } else {
                alert('You have the latest version!');
            }
        } catch (error) {
            alert('Failed to check version: ' + error.message);
        } finally {
            button.disabled = false;
            button.textContent = 'Check for Updates';
        }
    };
    
    document.body.appendChild(button);
}

/**
 * Example: Display version in footer
 */
async function displayVersionInFooter() {
    const info = await versionChecker.getVersionInfo();
    
    const footer = document.querySelector('footer') || document.body;
    const versionElement = document.createElement('div');
    versionElement.className = 'app-version';
    versionElement.textContent = `Version ${info.currentVersion || 'Unknown'}`;
    versionElement.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        font-size: 11px;
        color: #666;
        opacity: 0.7;
    `;
    
    footer.appendChild(versionElement);
}

/**
 * Example: Listen for version change messages from parent
 */
function setupVersionMessageListener() {
    window.addEventListener('message', async (event) => {
        if (event.data.type === 'checkVersion') {
            const result = await versionChecker.checkVersion();
            
            // Send result back to parent
            event.source.postMessage({
                type: 'versionCheckResult',
                result: result
            }, event.origin);
        }
    });
}

/**
 * Example: Conditional feature based on version
 */
async function enableFeatureIfVersionSupported(minVersion) {
    const info = await versionChecker.getVersionInfo();
    const currentVersion = info.currentVersion || '0.0.0';
    
    // Simple version comparison (for real use, consider a library like semver)
    const current = currentVersion.split('.').map(Number);
    const min = minVersion.split('.').map(Number);
    
    const isSupported = current[0] > min[0] || 
                       (current[0] === min[0] && current[1] > min[1]) ||
                       (current[0] === min[0] && current[1] === min[1] && current[2] >= min[2]);
    
    if (isSupported) {
        console.log('Feature enabled for version', currentVersion);
        // Enable feature
    } else {
        console.log('Feature requires version', minVersion, 'or higher');
        // Show upgrade message
    }
}

// ============================================================================
// Integration Examples
// ============================================================================

/**
 * PATTERN 1: Simple integration (recommended for most apps)
 */
export async function initApp_Simple() {
    // Check version on app load
    await initializeVersioning();
    
    // Your app initialization code here...
}

/**
 * PATTERN 2: With UI and custom handler
 */
export async function initApp_WithUI() {
    // Initialize with UI
    const ui = await initializeVersionCheckerUI({
        position: 'bottom-right',
        showOnVersionChange: true
    });
    
    // Add custom version change logic
    versionChecker.onVersionChange = async (newVersion, oldVersion) => {
        console.log(`App updated: ${oldVersion} → ${newVersion}`);
        // Custom logic here
    };
    
    // Your app initialization code here...
}

/**
 * PATTERN 3: Aggressive update strategy
 */
export async function initApp_AggressiveUpdate() {
    const result = await versionChecker.checkVersion();
    
    // Force reload on any version change
    if (result.hasChanged) {
        alert('App has been updated. Reloading...');
        setTimeout(() => window.location.reload(), 1000);
        return; // Stop initialization
    }
    
    // Your app initialization code here...
}

/**
 * PATTERN 4: Silent background checking
 */
export async function initApp_BackgroundCheck() {
    // Start app immediately
    // Your app initialization code here...
    
    // Check version in background
    versionChecker.checkVersion().then(result => {
        if (result.hasChanged) {
            // Show non-intrusive notification
            console.info('New version available. Reload to update.');
            
            // Optional: Add update banner
            const banner = document.createElement('div');
            banner.textContent = 'Update available! Click to reload.';
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #4caf50;
                color: white;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                z-index: 9999;
            `;
            banner.onclick = () => window.location.reload();
            document.body.appendChild(banner);
        }
    });
}

// ============================================================================
// Usage in your app.js
// ============================================================================

/*
// In your app.js file:

import { initializeVersioning } from './versionIntegrationExample.js';

// At the start of your app initialization
async function initYourApp() {
    // Initialize version checking
    await initializeVersioning();
    
    // Rest of your app initialization
    setupUI();
    loadData();
    startApp();
}

initYourApp();
*/

// Export for use in other files
export {
    initializeVersioning,
    beforeCriticalOperation,
    setupVersionCheckButton,
    displayVersionInFooter,
    setupVersionMessageListener,
    enableFeatureIfVersionSupported
};
