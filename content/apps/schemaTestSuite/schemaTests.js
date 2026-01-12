/**
 * Schema Test Suite - Complete App Configurations
 * Tests all possible app.js schema configurations with null values for unused properties
 */

// ============================================================================
// TEST APP 1: Minimal Configuration (All Optional Fields = null)
// ============================================================================

export const minimalApp = {
    "id": "schema_test_minimal",
    "enabled": true,
    
    // Basic Info
    "locales": {
        "en-US": {
            "label": "Minimal App",
            "description": "Tests minimal required configuration"
        }
    },
    
    // Icon (required)
    "icon": "/content/common/assets/BlankApp_64px.png",
    
    // All optional properties explicitly set to null
    "actualIcon": null,
    "baseIcon": null,
    "backgroundIcon": null,
    "baseImage": null,
    "wrapIcon": null,
    "unopenedIcon": null,
    
    // Banner properties
    "banner": null,
    "bannerAnimated": null,
    "bannerModule": null,
    "bannerJingle": null,
    "jingle": null,
    
    // Unopened properties
    "unopened": false,
    "unopenedBannerModule": null,
    "unopenedJingle": null,
    
    // Feature properties
    "selectorOverride": null,
    "actionButtonColors": null,
    "onSelect": null,
    "onOpen": null,
    
    // Animation properties
    "animated": null,
    "animationFrames": null,
    "animationSpeed": null,
    
    // Permissions
    "permissions": {
        "level": 0,
        "launchable": true,
        "unwrappable": false
    },
    
    // Click handler
    "onClick": (app, appGrid, languageData) => {
        alert(`${app.localizedLabel}\n\nAll optional schema fields: null\nConfiguration: Minimal`);
    }
};

// ============================================================================
// TEST APP 2: Static Icon (Single Layer)
// ============================================================================

export const staticIconApp = {
    "id": "schema_test_static",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Static Icon",
            "description": "Single static icon, no layers"
        }
    },
    
    // Icon configuration
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "actualIcon": null, // Will use icon
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
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: Static Icon\nLayers: 1 (icon only)`);
    }
};

// ============================================================================
// TEST APP 3: Base Icon with Background
// ============================================================================

export const baseIconApp = {
    "id": "schema_test_baseicon",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Base Icon",
            "description": "Background + overlay icon layers"
        }
    },
    
    // Base icon configuration
    "baseIcon": true, // Enable two-layer rendering
    "backgroundIcon": "/content/apps/homeScreen_3DS/assets/themes/blackTheme/BlankApp_64px.png",
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png",
    "actualIcon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png",
    "baseImage": null, // Will use backgroundIcon
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
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: Base Icon\nLayers: 2 (background + icon)\nbaseIcon: true`);
    }
};

// ============================================================================
// TEST APP 4: Animated Icon
// ============================================================================

export const animatedIconApp = {
    "id": "schema_test_animated",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Animated Icon",
            "description": "Animated sprite sheet icon"
        }
    },
    
    // Icon with animation
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png",
    "actualIcon": null,
    "baseIcon": false,
    "backgroundIcon": null,
    "baseImage": null,
    "wrapIcon": null,
    "unopenedIcon": null,
    
    // Animation settings
    "animated": true,
    "animationFrames": 4,
    "animationSpeed": 150,
    
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
    
    "permissions": {
        "level": 0,
        "launchable": true,
        "unwrappable": false
    },
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: Animated Icon\nFrames: 4\nSpeed: 150ms\nanimated: true`);
    }
};

// ============================================================================
// TEST APP 5: Wrapped (Unopened) App
// ============================================================================

export const wrappedApp = {
    "id": "schema_test_wrapped",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Wrapped App",
            "description": "Gift box wrapper test"
        }
    },
    
    // Icon (hidden until unwrapped)
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "actualIcon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "baseIcon": false,
    "backgroundIcon": null,
    "baseImage": null,
    
    // Wrap configuration
    "unopened": true,
    "wrapIcon": "/content/common/assets/giftbox_48px.png",
    "unopenedIcon": "/content/common/assets/giftbox_48px.png",
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    
    // Banner (shown after unwrap)
    "banner": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "bannerAnimated": false,
    "bannerModule": null,
    "bannerJingle": null,
    "jingle": null,
    
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
        "unwrappable": true
    },
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: Wrapped\nunopened: true\nCan be unwrapped`);
    }
};

// ============================================================================
// TEST APP 6: Custom Selector Override
// ============================================================================

export const customSelectorApp = {
    "id": "schema_test_selector",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Custom Selector",
            "description": "Blue selector override"
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
    
    // Selector override
    "selectorOverride": {
        "enabled": true,
        "src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"
    },
    
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
    
    // No other overrides
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
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: Custom Selector\nselectorOverride: enabled\nCustom blue selector`);
    }
};

// ============================================================================
// TEST APP 7: Action Button Colors
// ============================================================================

export const customButtonsApp = {
    "id": "schema_test_buttons",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "Custom Buttons",
            "description": "Purple action button theme"
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
    
    // Action button colors
    "actionButtonColors": {
        "backgroundColor": "rgba(138, 43, 226, 0.3)",
        "hoverBackgroundColor": "rgba(138, 43, 226, 0.5)",
        "pressedBackgroundColor": "rgba(138, 43, 226, 0.7)",
        "disabledBackgroundColor": "rgba(128, 128, 128, 0.3)",
        "textColor": "white"
    },
    
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
    
    // No other overrides
    "selectorOverride": null,
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
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: Custom Buttons\nactionButtonColors: purple theme\nButtons change when selected`);
    }
};

// ============================================================================
// TEST APP 8: onSelect Lambda
// ============================================================================

export const onSelectApp = {
    "id": "schema_test_onselect",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "onSelect Test",
            "description": "Logs when selected"
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
    
    // onSelect callback
    "onSelect": (app, appGrid) => {
        console.log(`[Schema Test] onSelect called for ${app.id}`);
        const homeScreen = window.homeScreenApp;
        if (homeScreen) {
            const time = homeScreen.formatDate(new Date(), {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            console.log(`  Selected at: ${time}`);
        }
    },
    
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
    
    // No other overrides
    "selectorOverride": null,
    "actionButtonColors": null,
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
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: onSelect\nCheck console for selection logs`);
    }
};

// ============================================================================
// TEST APP 9: onOpen Lambda
// ============================================================================

export const onOpenApp = {
    "id": "schema_test_onopen",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "onOpen Test",
            "description": "Logs when opening"
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
    
    // onOpen callback
    "onOpen": (app, appGrid) => {
        console.log(`[Schema Test] onOpen called for ${app.id}`);
        const homeScreen = window.homeScreenApp;
        if (homeScreen) {
            const time = homeScreen.formatDate(new Date());
            console.log(`  Opening at: ${time}`);
            console.log(`  Timezone: ${homeScreen.getUserTimeZone()}`);
        }
    },
    
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
    
    // No other overrides
    "selectorOverride": null,
    "actionButtonColors": null,
    "onSelect": null,
    
    // No animation
    "animated": false,
    "animationFrames": null,
    "animationSpeed": null,
    
    "permissions": {
        "level": 0,
        "launchable": true,
        "unwrappable": false
    },
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\nConfiguration: onOpen\nCheck console for launch logs`);
    }
};

// ============================================================================
// TEST APP 10: All Features Combined
// ============================================================================

export const allFeaturesApp = {
    "id": "schema_test_all",
    "enabled": true,
    
    "locales": {
        "en-US": {
            "label": "All Features",
            "description": "Every schema feature enabled"
        }
    },
    
    // Base icon with layers
    "baseIcon": true,
    "backgroundIcon": "/content/apps/homeScreen_3DS/assets/themes/blackTheme/BlankApp_64px.png",
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png",
    "actualIcon": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png",
    "baseImage": "/content/apps/homeScreen_3DS/assets/themes/blackTheme/BlankApp_64px.png",
    
    // Start wrapped
    "unopened": true,
    "wrapIcon": "/content/common/assets/giftbox_48px.png",
    "unopenedIcon": "/content/common/assets/giftbox_48px.png",
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    
    // Animation
    "animated": true,
    "animationFrames": 2,
    "animationSpeed": 200,
    
    // Banner
    "banner": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png",
    "bannerAnimated": false,
    "bannerModule": null,
    "bannerJingle": null,
    "jingle": null,
    
    // Custom selector
    "selectorOverride": {
        "enabled": true,
        "src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"
    },
    
    // Custom buttons
    "actionButtonColors": {
        "backgroundColor": "rgba(255, 165, 0, 0.3)",
        "hoverBackgroundColor": "rgba(255, 165, 0, 0.5)",
        "pressedBackgroundColor": "rgba(255, 165, 0, 0.7)",
        "textColor": "white"
    },
    
    // Callbacks
    "onSelect": (app, appGrid) => {
        console.log(`[All Features] Selected: ${app.id}`);
    },
    
    "onOpen": (app, appGrid) => {
        console.log(`[All Features] Opening: ${app.id}`);
    },
    
    "permissions": {
        "level": 0,
        "launchable": true,
        "unwrappable": true
    },
    
    "onClick": (app) => {
        alert(`${app.localizedLabel}\n\n✅ Base Icon (2 layers)\n✅ Wrapped\n✅ Animated\n✅ Custom Selector\n✅ Custom Buttons\n✅ onSelect\n✅ onOpen\n\nAll features active!`);
    }
};

// Export all test apps
export const schemaTestApps = [
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
];
