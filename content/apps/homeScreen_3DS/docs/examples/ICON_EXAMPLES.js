/**
 * Example App Configurations - Icon Schema V2
 * Demonstrates all icon configuration patterns and features
 */

// ============================================================================
// EXAMPLE 1: Simple BaseIcon (No Background)
// ============================================================================
export const simpleBaseIconApp = {
    id: "simpleApp",
    baseIcon: true,
    icon: "/apps/simpleApp/icon.png",
    backgroundIcon: null, // No background - icon used as base too
    unopened: false,
    
    locales: {
        "en-US": {
            label: "Simple App",
            description: "Basic icon without background"
        }
    }
};

// ============================================================================
// EXAMPLE 2: BaseIcon with Background
// ============================================================================
export const baseIconWithBackground = {
    id: "styledApp",
    baseIcon: true,
    icon: "/apps/styledApp/icon.png", // Overlay (70% size, centered)
    backgroundIcon: "/apps/styledApp/background.png", // Base layer (full size)
    unopened: false,
    
    locales: {
        "en-US": {
            label: "Styled App",
            description: "Icon with custom background"
        }
    }
};

// ============================================================================
// EXAMPLE 3: Animated BaseIcon
// ============================================================================
export const animatedBaseIcon = {
    id: "liveApp",
    baseIcon: true,
    icon: "/apps/liveApp/sprite_8frames.png", // 8-frame horizontal sprite sheet
    backgroundIcon: "/apps/liveApp/static_bg.png", // Static background
    
    // Animation settings
    animated: true,
    animationFrames: 8, // Number of frames in sprite
    animationSpeed: 100, // MS per frame (100ms = 10 FPS)
    
    unopened: false,
    
    locales: {
        "en-US": {
            label: "Live App",
            description: "App with animated icon overlay"
        }
    }
};

// ============================================================================
// EXAMPLE 4: Wrapped BaseIcon (Custom Gift Box)
// ============================================================================
export const wrappedBaseIcon = {
    id: "mysteryApp",
    baseIcon: true,
    icon: "/apps/mysteryApp/icon.png", // Hidden until unwrapped
    actualIcon: "/apps/mysteryApp/icon.png", // Same as icon
    backgroundIcon: "/apps/mysteryApp/background.png", // Visible even when wrapped
    
    // Wrapping configuration
    unopened: true,
    wrapIcon: "/apps/mysteryApp/custom_giftbox.png", // Custom gift box overlay
    
    // Unwrapping banner/jingle
    unopenedBannerModule: "/apps/mysteryApp/unwrap_banner.js",
    unopenedJingle: "/apps/mysteryApp/unwrap_sound.wav",
    
    locales: {
        "en-US": {
            label: "Mystery App",
            description: "Wrapped app with custom gift box"
        }
    }
};

// ============================================================================
// EXAMPLE 5: Regular App (Background + Icon)
// ============================================================================
export const regularApp = {
    id: "mailApp",
    baseIcon: false, // Or omit (default)
    icon: "/apps/mailApp/envelope_icon.png", // Overlay icon
    actualIcon: "/apps/mailApp/envelope_icon.png",
    backgroundIcon: "/apps/mailApp/mailbox_background.png", // Required for regular apps
    
    unopened: false,
    
    locales: {
        "en-US": {
            label: "Mail",
            description: "Regular app with background and icon"
        }
    }
};

// ============================================================================
// EXAMPLE 6: Wrapped Regular App (Default Gift Box)
// ============================================================================
export const wrappedRegularApp = {
    id: "secretApp",
    baseIcon: false,
    icon: "/apps/secretApp/icon.png",
    actualIcon: "/apps/secretApp/icon.png",
    backgroundIcon: "/apps/secretApp/background.png",
    
    // Wrapping with default gift box
    unopened: true,
    wrapIcon: null, // Use default gift box from theme
    
    locales: {
        "en-US": {
            label: "Secret App",
            description: "Wrapped regular app"
        }
    }
};

// ============================================================================
// EXAMPLE 7: Animated Regular App
// ============================================================================
export const animatedRegularApp = {
    id: "weatherApp",
    baseIcon: false,
    icon: "/apps/weatherApp/weather_sprite.png", // Animated overlay
    actualIcon: "/apps/weatherApp/weather_sprite.png",
    backgroundIcon: "/apps/weatherApp/sky_background.png", // Static background
    
    // Animation settings
    animated: true,
    animationFrames: 12, // 12-frame weather animation
    animationSpeed: 83, // ~12 FPS (1000ms / 12 frames)
    
    unopened: false,
    
    locales: {
        "en-US": {
            label: "Weather",
            description: "Weather app with animated clouds"
        }
    }
};

// ============================================================================
// EXAMPLE 8: Clock App (Animated BaseIcon with Real-Time Update)
// ============================================================================
export const clockApp = {
    id: "clockApp",
    baseIcon: true,
    icon: "/apps/clockApp/clock_hands_sprite.png", // Animated clock hands
    backgroundIcon: "/apps/clockApp/clock_face.png", // Static clock face
    
    // Animation settings
    animated: true,
    animationFrames: 60, // 60 frames for smooth second hand
    animationSpeed: 1000, // 1 second per frame
    
    unopened: false,
    
    // Custom animation handler (optional)
    customAnimation: true, // Flag to use custom time-based animation
    
    locales: {
        "en-US": {
            label: "Clock",
            description: "Real-time clock with animated hands"
        }
    }
};

// ============================================================================
// EXAMPLE 9: Notification Badge (Overlay with Dynamic Content)
// ============================================================================
export const notificationApp = {
    id: "messagesApp",
    baseIcon: false,
    icon: "/apps/messagesApp/icon.png", // Static icon
    backgroundIcon: "/apps/messagesApp/background.png",
    
    // Dynamic badge overlay (handled by app code)
    showBadge: true,
    badgeCount: 5, // Number to display on badge
    
    unopened: false,
    
    locales: {
        "en-US": {
            label: "Messages",
            description: "Messaging app with notification badge"
        }
    }
};

// ============================================================================
// EXAMPLE 10: Home Screen Apps (Should Never Be Wrapped)
// ============================================================================
export const homeScreenApp = {
    id: "homeScreen_3DS",
    baseIcon: true,
    icon: "/apps/homeScreen_3DS/icon.png",
    actualIcon: "/apps/homeScreen_3DS/icon.png",
    backgroundIcon: null, // Simple icon, no background
    
    // IMPORTANT: Home screen apps should never be wrapped
    unopened: false,
    
    permissions: {
        level: 0,
        unwrappable: false, // Cannot be wrapped/unwrapped
        launchable: true
    },
    
    locales: {
        "en-US": {
            label: "3DS Home Menu",
            description: "Nintendo 3DS theme"
        }
    }
};

// ============================================================================
// RENDERING USAGE EXAMPLES
// ============================================================================

/**
 * Example: Render a static icon
 */
async function renderStaticIcon(canvas, app) {
    await AppIconRenderer.renderIcon(canvas, {
        icon: app.icon,
        baseIcon: app.baseIcon,
        backgroundIcon: app.backgroundIcon,
        unopened: app.unopened,
        wrapIcon: app.wrapIcon,
        width: 64,
        height: 64
    });
}

/**
 * Example: Render an animated icon
 */
function renderAnimatedIcon(canvas, app) {
    const stopAnimation = AppIconRenderer.renderAnimatedIcon(canvas, {
        icon: app.icon,
        baseIcon: app.baseIcon,
        backgroundIcon: app.backgroundIcon,
        unopened: app.unopened,
        wrapIcon: app.wrapIcon,
        animated: true,
        animationFrames: app.animationFrames,
        animationSpeed: app.animationSpeed,
        width: 64,
        height: 64
    });
    
    // Store stop function to cancel animation later
    return stopAnimation;
}

/**
 * Example: Render with custom animation (like clock)
 */
function renderClockIcon(canvas, app) {
    let lastSecond = -1;
    
    const updateClock = async () => {
        const now = new Date();
        const currentSecond = now.getSeconds();
        
        // Only redraw when second changes
        if (currentSecond !== lastSecond) {
            lastSecond = currentSecond;
            
            await AppIconRenderer.renderIcon(canvas, {
                icon: app.icon,
                baseIcon: app.baseIcon,
                backgroundIcon: app.backgroundIcon,
                animated: true,
                animationFrame: currentSecond, // Use real time
                width: 64,
                height: 64
            });
        }
        
        requestAnimationFrame(updateClock);
    };
    
    updateClock();
}

// ============================================================================
// MIGRATION EXAMPLES
// ============================================================================

/**
 * BEFORE (Old Schema): Single icon, no layers
 */
const oldSchemaApp = {
    id: "oldApp",
    baseIcon: true,
    icon: "/apps/oldApp/icon.png",
    unopened: false
};

/**
 * AFTER (New Schema): Backward compatible
 * Works exactly the same - icon used for both base and overlay
 */
const migratedApp_Compatible = {
    id: "oldApp",
    baseIcon: true,
    icon: "/apps/oldApp/icon.png",
    backgroundIcon: null, // Fallback to icon
    unopened: false
};

/**
 * AFTER (New Schema): With improvements
 * Add background for better appearance
 */
const migratedApp_Improved = {
    id: "oldApp",
    baseIcon: true,
    icon: "/apps/oldApp/icon.png", // Now as overlay
    backgroundIcon: "/apps/oldApp/new_background.png", // New base layer
    unopened: false
};

/**
 * AFTER (New Schema): With animation
 * Make it animated!
 */
const migratedApp_Animated = {
    id: "oldApp",
    baseIcon: true,
    icon: "/apps/oldApp/animated_sprite.png", // Replace with sprite
    backgroundIcon: "/apps/oldApp/new_background.png",
    animated: true,
    animationFrames: 8,
    animationSpeed: 100,
    unopened: false
};

// ============================================================================
// SPRITE SHEET CREATION GUIDE
// ============================================================================

/**
 * How to create sprite sheets for animated icons:
 * 
 * 1. Create individual frames (e.g., 8 frames at 64×64px each)
 * 2. Arrange horizontally in a single image:
 *    ┌────┬────┬────┬────┬────┬────┬────┬────┐
 *    │ F1 │ F2 │ F3 │ F4 │ F5 │ F6 │ F7 │ F8 │
 *    └────┴────┴────┴────┴────┴────┴────┴────┘
 *    Result: 512×64px image (8 frames × 64px wide)
 * 
 * 3. Save as PNG with transparency
 * 4. Configure in app.js:
 *    animated: true,
 *    animationFrames: 8,
 *    animationSpeed: 100
 * 
 * IconLoader will automatically extract the correct frame during rendering.
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * DO:
 * ✅ Always provide backgroundIcon for baseIcon apps (even if simple)
 * ✅ Design icon overlays at 70% of button size
 * ✅ Use sprite sheets for frame-based animation
 * ✅ Keep base layers static and simple
 * ✅ Animate only when it adds value
 * ✅ Test animations at different speeds
 * ✅ Provide fallbacks for animated icons
 * 
 * DON'T:
 * ❌ Don't animate the base layer
 * ❌ Don't make base layers too complex
 * ❌ Don't animate everything (performance!)
 * ❌ Don't use huge sprite sheets (file size!)
 * ❌ Don't forget actualIcon for wrapped apps
 * ❌ Don't wrap home screen apps
 */
