/**
 * Schema Test Suite - Main Export
 * Comprehensive testing of all app.js schema configurations
 */

import {
    minimalApp,
    staticIconApp,
    baseIconApp,
    animatedIconApp,
    wrappedApp,
    customSelectorApp,
    customButtonsApp,
    onSelectApp,
    onOpenApp,
    allFeaturesApp
} from './schemaTests.js';

// Export test suite for manual loading
export {
    minimalApp,
    staticIconApp,
    baseIconApp,
    animatedIconApp,
    wrappedApp,
    customSelectorApp,
    customButtonsApp,
    onSelectApp,
    onOpenApp,
    allFeaturesApp
};

// Main app export (schema test index)
export const app = {
    "id": "schemaTestSuite",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Schema Tests",
            "description": "App configuration test suite"
        }
    },
    
    // Icon
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "actualIcon": null,
    "baseIcon": false,
    "backgroundIcon": null,
    "baseImage": null,
    "wrapIcon": null,
    "unopenedIcon": null,
    
    // Banner
    "banner": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "bannerAnimated": false,
    "bannerModule": null,
    "bannerJingle": null,
    "jingle": null,
    
    // No unwrapping
    "unopened": false,
    "unopenedBannerModule": null,
    "unopenedJingle": null,
    
    // No overrides
    "selectorOverride": null,
    "actionButtonColors": null,
    "onSelect": null,
    "onOpen": null,
    
    // No animation
    "animated": false,
    "animationFrames": null,
    "animationSpeed": null,
    
    "permissions": {
        "level": 0,
        "launchable": true,
        "unwrappable": false
    },
    
    "onClick": (app, appGrid, languageData) => {
        const testList = `Schema Test Suite

10 Test Apps Available:

1. Minimal App
   - Only required fields
   - All optional fields: null

2. Static Icon
   - Single icon layer
   - No animation

3. Base Icon
   - Background + overlay
   - Two-layer rendering

4. Animated Icon
   - Sprite sheet animation
   - Multiple frames

5. Wrapped App
   - Gift box wrapper
   - Unwrap functionality

6. Custom Selector
   - Blue selector override
   - Per-app selector

7. Custom Buttons
   - Purple button theme
   - Per-app colors

8. onSelect Test
   - Selection callback
   - Console logging

9. onOpen Test
   - Launch callback
   - Timezone logging

10. All Features
    - Every feature enabled
    - Complete configuration

To test: Load these apps via AppConfigLoader`;

        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: 'Schema Test Suite',
                message: testList
            });
        } else {
            alert(testList);
        }
    }
};
