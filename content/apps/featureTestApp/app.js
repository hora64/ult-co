/**
 * Test App - Demonstrates New HomeScreen Features
 * 
 * Features demonstrated:
 * - Action button color overrides (purple theme)
 * - Custom selector override
 * - onSelect callback
 * - onOpen callback (NEW)
 * - Timezone support (NEW)
 * - Coordinate spawns (NEW - via config)
 * 
 * This app shows how all the new features work together.
 */

export const app = {
  "id": "featureTestApp",
  "enabled": true,
  
  // Basic App Info
  "locales": {
    "en-US": {
      "label": "Feature Test",
      "description": "Tests new homescreen features"
    }
  },
  
  // Icon Configuration
  "icon": "/content/common/assets/BlankApp_64px.png",
  "actualIcon": "/content/common/assets/BlankApp_64px.png",
  
  // NEW FEATURE 1: Custom Selector Override
  // This will use the blue theme selector instead of the default
  "selectorOverride": {
    "enabled": true,
    "src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"
  },
  
  // NEW FEATURE 2: Action Button Color Overrides
  // Purple theme for this app's action buttons
  "actionButtonColors": {
    "backgroundColor": "rgba(138, 43, 226, 0.3)",
    "hoverBackgroundColor": "rgba(138, 43, 226, 0.5)",
    "pressedBackgroundColor": "rgba(138, 43, 226, 0.7)",
    "disabledBackgroundColor": "rgba(128, 128, 128, 0.3)",
    "textColor": "white"
  },
  
  // NEW FEATURE 3: onSelect Callback
  // Called whenever this app is selected (not launched)
  "onSelect": (app, appGrid) => {
    console.log('[FeatureTestApp] onSelect called!');
    console.log('  App:', app.localizedLabel);
    console.log('  AppGrid instance:', appGrid);
    
    // Example: Get timezone info
    const homeScreen = window.homeScreenApp || appGrid.homeScreenApp;
    if (homeScreen) {
      const timeZone = homeScreen.getUserTimeZone();
      const currentTime = homeScreen.formatDate(new Date(), {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      console.log(`  Current Time: ${currentTime} (${timeZone})`);
    }
    
    // Example: Track selection
    if (window.analytics) {
      window.analytics.track('app_selected', {
        app_id: app.id,
        app_name: app.localizedLabel
      });
    }
    
    // Example: Play custom sound
    try {
      appGrid.playSound('select');
    } catch (e) {
      console.log('  Sound playback not available');
    }
    
    // Example: Update status
    const status = document.getElementById('topScreenStatus');
    if (status) {
      status.textContent = `Selected: ${app.localizedLabel} (NEW FEATURES!)`;
    }
  },
  
  // NEW FEATURE 4: onOpen Callback
  // Called when app is about to launch (before onClick)
  "onOpen": (app, appGrid) => {
    console.log('[FeatureTestApp] onOpen called!');
    console.log('  App:', app.localizedLabel);
    console.log('  About to launch...');
    
    // Example: Log launch time with timezone
    const homeScreen = window.homeScreenApp || appGrid.homeScreenApp;
    if (homeScreen) {
      const launchTime = homeScreen.formatDate(new Date());
      console.log(`  Launch Time: ${launchTime}`);
      console.log(`  Timezone: ${homeScreen.getUserTimeZone()}`);
    }
    
    // Example: Pre-launch validation
    if (!app.permissions || !app.permissions.launchable) {
      console.warn('  App is not launchable!');
      return;
    }
    
    // Example: Track launch
    if (window.analytics) {
      window.analytics.track('app_opened', {
        app_id: app.id,
        app_name: app.localizedLabel,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Launch callback - called when app is opened
  "onClick": (app, appGrid, languageData) => {
    console.log('[FeatureTestApp] onClick called - launching app');
    
    const homeScreen = window.homeScreenApp || appGrid.homeScreenApp;
    
    // Get timezone info for display
    let timeZoneInfo = 'Unknown';
    let currentTime = 'Unknown';
    if (homeScreen) {
      timeZoneInfo = homeScreen.getUserTimeZone();
      currentTime = homeScreen.formatDate(new Date(), {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    // Show modal demonstrating all features
    if (window.modalManager) {
      window.modalManager.showInfoModal({
        title: 'Feature Test App',
        message: `This app demonstrates:\n\n1. Body Background Canvas (in top screen, z-index -1)\n2. Action Button Color Overrides (purple)\n3. Selector Override (blue selector)\n4. onSelect Lambda Function\n5. onOpen Lambda Function ✨ NEW\n6. Timezone Support ✨ NEW\n7. Coordinate Spawns ✨ NEW\n\nCurrent Time:\n${currentTime}\n\nTimezone: ${timeZoneInfo}\n\nAll features working! ✅`,
        onConfirm: () => {
          console.log('[FeatureTestApp] Modal closed');
        }
      });
    } else {
      alert(`Feature Test App\n\nAll new features are working!\n\n✅ Body Background Canvas (top screen)\n✅ Action Button Colors (purple)\n✅ Custom Selector (blue)\n✅ onSelect Callback\n✅ onOpen Callback (NEW)\n✅ Timezone Support (NEW)\n✅ Coordinate Spawns (NEW)\n\nCurrent Time: ${currentTime}\nTimezone: ${timeZoneInfo}`);
    }
  },
  
  // Permissions
  "permissions": {
    "level": 0,
    "launchable": true,
    "unwrappable": true
  },
  
  // Banner Configuration
  "banner": "/content/common/assets/BlankApp_64px.png",
  "bannerAnimated": false,
  
  // Additional metadata
  "category": "testing",
  "version": "2.0.0",
  "author": "HomeScreen Team"
};
