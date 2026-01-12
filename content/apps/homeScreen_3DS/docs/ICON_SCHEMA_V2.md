# Icon Schema V2 - Base + Overlay Architecture

## Overview
All apps now use a consistent **base + overlay** pattern for rendering icons. This enables:
- ✅ Animated icon overlays
- ✅ Consistent wrapping behavior
- ✅ Better visual layering
- ✅ Simplified rendering logic

## Architecture

### Layer Structure
```
┌─────────────────────┐
│                     │
│   ┌───────────┐     │  ← Overlay Layer (icon)
│   │           │     │    - Can be animated
│   │  OVERLAY  │     │    - Scaled & rounded
│   │           │     │    - Replaced by gift box when wrapped
│   └───────────┘     │
│                     │
│   BASE LAYER        │  ← Base Layer (backgroundIcon)
│   (Background)      │    - Static background
│                     │    - Always full size
└─────────────────────┘
```

## App Configuration Schema

### BaseIcon Apps (e.g., Home Menu icons)
Apps where the icon IS the main visual, with an optional background.

```javascript
{
    id: "myApp",
    baseIcon: true, // Flag indicating base+overlay pattern
    
    // Base layer (static background)
    backgroundIcon: "/apps/myApp/background.png", // Optional: base texture/background
    
    // Overlay layer (main icon, can be animated)
    icon: "/apps/myApp/icon.png", // Main icon (shown as overlay)
    actualIcon: "/apps/myApp/icon.png", // Actual icon for unwrapping
    
    // Animation support (NEW!)
    animated: true, // Enable animation
    animationFrames: 8, // Number of frames
    animationSpeed: 100, // MS per frame
    
    // Wrapping
    unopened: false, // Whether wrapped
    wrapIcon: "/path/to/custom/giftbox.png" // Optional: custom gift box
}
```

### Regular Apps (e.g., Mail, Settings)
Apps with a dedicated background and overlay icon.

```javascript
{
    id: "mailApp",
    baseIcon: false, // Or omit (default)
    
    // Base layer (static background)
    backgroundIcon: "/apps/mail/background.png", // Required for regular apps
    
    // Overlay layer (icon, can be animated)
    icon: "/apps/mail/icon.png", // Overlay icon
    actualIcon: "/apps/mail/icon.png",
    
    // Animation support
    animated: false, // Static icon
    
    // Wrapping
    unopened: true, // Start wrapped
    wrapIcon: null // Use default gift box
}
```

## Rendering States

### State 1: BaseIcon Unwrapped
```
Base:    backgroundIcon OR icon (fallback)
Overlay: icon (can be animated)
Result:  Background + animated icon overlay
```

**Visual:**
```
┌─────────────────────┐
│                     │
│   ┌───────────┐     │
│   │    📱     │     │  ← Icon (animated)
│   │  ICON     │     │
│   └───────────┘     │
│                     │
│   BACKGROUND        │  ← Background texture
└─────────────────────┘
```

### State 2: BaseIcon Wrapped
```
Base:    backgroundIcon OR icon (fallback)
Overlay: wrapIcon (gift box)
Result:  Background + gift box overlay
```

**Visual:**
```
┌─────────────────────┐
│                     │
│   ┌───────────┐     │
│   │    🎁     │     │  ← Gift box
│   │  WRAPPED  │     │
│   └───────────┘     │
│                     │
│   BACKGROUND        │  ← Background texture
└─────────────────────┘
```

### State 3: Regular App Unwrapped
```
Base:    backgroundIcon
Overlay: icon (can be animated)
Result:  Background + icon overlay
```

**Visual:**
```
┌─────────────────────┐
│                     │
│   ┌───────────┐     │
│   │    ✉️     │     │  ← Icon overlay
│   │           │     │
│   └───────────┘     │
│                     │
│   APP BACKGROUND    │  ← Dedicated background
└─────────────────────┘
```

### State 4: Regular App Wrapped
```
Base:    backgroundIcon
Overlay: wrapIcon (gift box)
Result:  Background + gift box overlay
```

**Visual:**
```
┌─────────────────────┐
│                     │
│   ┌───────────┐     │
│   │    🎁     │     │  ← Gift box overlay
│   │           │     │
│   └───────────┘     │
│                     │
│   APP BACKGROUND    │  ← Dedicated background
└─────────────────────┘
```

## Animated Icons

### Configuration
```javascript
{
    id: "animatedApp",
    baseIcon: true,
    icon: "/apps/animatedApp/sprite.png", // Sprite sheet or GIF
    backgroundIcon: "/apps/animatedApp/bg.png",
    
    // Animation settings
    animated: true,
    animationFrames: 8, // Number of frames in sprite
    animationSpeed: 100 // MS per frame (100ms = 10 FPS)
}
```

### Sprite Sheet Format
Horizontal sprite sheet (frames side-by-side):
```
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ F1 │ F2 │ F3 │ F4 │ F5 │ F6 │ F7 │ F8 │
└────┴────┴────┴────┴────┴────┴────┴────┘
```

### Rendering
```javascript
// Static rendering
await AppIconRenderer.renderIcon(canvas, {
    icon: "/path/to/icon.png",
    baseIcon: true,
    backgroundIcon: "/path/to/bg.png",
    width: 64,
    height: 64
});

// Animated rendering
const stopAnimation = AppIconRenderer.renderAnimatedIcon(canvas, {
    icon: "/path/to/sprite.png",
    baseIcon: true,
    backgroundIcon: "/path/to/bg.png",
    animated: true,
    animationFrames: 8,
    animationSpeed: 100,
    width: 64,
    height: 64
});

// Stop animation when needed
stopAnimation();
```

## Migration Guide

### From Old Schema (Single Icon)
**Before:**
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png",
    unopened: false
}
```

**After (Same behavior):**
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png", // Used as overlay
    backgroundIcon: null, // Will fallback to icon
    unopened: false
}
```

**After (With background):**
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png", // Overlay
    backgroundIcon: "/apps/myApp/bg.png", // Base layer
    unopened: false
}
```

### Adding Animation
**Before (Static):**
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png"
}
```

**After (Animated):**
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/sprite.png", // Sprite sheet
    backgroundIcon: "/apps/myApp/bg.png",
    animated: true,
    animationFrames: 8,
    animationSpeed: 100
}
```

## Rendering Logic

### AppIconRenderer.renderIcon()
```javascript
// Determine layers
let baseSrc;
let overlaySrc = null;

if (baseIcon) {
    if (unopened) {
        // Wrapped baseIcon: bg + gift box
        baseSrc = backgroundIcon || baseImage || icon;
        overlaySrc = wrapIcon || unopenedImage;
    } else {
        // Unwrapped baseIcon: bg + icon (animated!)
        baseSrc = backgroundIcon || baseImage || icon;
        overlaySrc = icon;
    }
} else {
    if (unopened) {
        // Wrapped regular: bg + gift box
        baseSrc = backgroundIcon || baseImage || icon;
        overlaySrc = wrapIcon || unopenedImage;
    } else {
        // Unwrapped regular: bg + icon
        baseSrc = backgroundIcon || baseImage;
        overlaySrc = icon;
    }
}

// Draw base (full size, static)
drawImage(baseSrc, 0, 0, width, height);

// Draw overlay (scaled, rounded, can be animated)
if (overlaySrc) {
    drawImage(overlaySrc, centerX, centerY, scaledSize, scaledSize);
}
```

## Benefits

### 1. Animated Icons
- Overlays can be animated (GIF, sprite sheets, video)
- Base layer remains static for performance
- Smooth animations without redrawing base

### 2. Consistent Behavior
- All apps use same base+overlay pattern
- Wrapping works identically for all types
- Predictable rendering logic

### 3. Visual Layering
- Clear separation of background and foreground
- Better depth perception
- Professional appearance

### 4. Flexibility
- Easy to add/change backgrounds
- Easy to add/change overlays
- Easy to add custom gift boxes

### 5. Performance
- Base layer only drawn once
- Animations only affect overlay
- Efficient for many icons on screen

## Examples

### Example 1: Simple BaseIcon (No Background)
```javascript
{
    id: "homeScreen_3DS",
    baseIcon: true,
    icon: "/apps/homeScreen_3DS/icon.png",
    backgroundIcon: null, // No background, icon used as base too
    unopened: false
}
```
Result: Icon fills entire space (backward compatible)

### Example 2: BaseIcon with Background
```javascript
{
    id: "homeScreen_WiiU",
    baseIcon: true,
    icon: "/apps/homeScreen_WiiU/icon.png",
    backgroundIcon: "/apps/homeScreen_WiiU/bg.png",
    unopened: false
}
```
Result: Background + icon overlay (70% size, centered)

### Example 3: Animated BaseIcon
```javascript
{
    id: "liveApp",
    baseIcon: true,
    icon: "/apps/liveApp/animated_sprite.png",
    backgroundIcon: "/apps/liveApp/static_bg.png",
    animated: true,
    animationFrames: 12,
    animationSpeed: 83, // ~12 FPS
    unopened: false
}
```
Result: Static background + animated icon overlay

### Example 4: Wrapped BaseIcon
```javascript
{
    id: "mysteryApp",
    baseIcon: true,
    icon: "/apps/mysteryApp/icon.png",
    backgroundIcon: "/apps/mysteryApp/bg.png",
    wrapIcon: "/apps/mysteryApp/custom_gift.png",
    unopened: true
}
```
Result: Background + custom gift box overlay

### Example 5: Regular App
```javascript
{
    id: "mail",
    baseIcon: false,
    icon: "/apps/mail/envelope.png",
    backgroundIcon: "/apps/mail/mailbox_bg.png",
    unopened: true
}
```
Result: Mailbox background + gift box overlay (initially)
After unwrap: Mailbox background + envelope overlay

## Best Practices

### 1. Always Provide backgroundIcon for BaseIcon Apps
Even if it's a solid color or simple texture:
```javascript
backgroundIcon: "/common/assets/default_bg.png"
```

### 2. Design Icons at Overlay Size
Icons will be scaled to 70% by default, so design for that:
- If button is 64×64, icon displays at ~45×45
- Design icons to look good at scaled size

### 3. Keep Base Layer Simple
The base layer should be:
- Static (not animated)
- Simple (not too detailed)
- Performance-friendly (small file size)

### 4. Animate Sparingly
Only animate when it adds value:
- ✅ Clock app (ticking hands)
- ✅ Live updates (notification count)
- ✅ Status indicators (syncing, loading)
- ❌ Decorative animations everywhere

### 5. Use Sprite Sheets for Frame-Based Animation
More efficient than GIFs:
```
Sprite sheet: 1 file, manual frame control
GIF: Browser-controlled, less control
```

## Status
✅ **Implemented** - Build successful  
✅ **Backward Compatible** - Old configs still work  
✅ **Animation Ready** - Support for animated overlays  
✅ **Consistent Rendering** - All apps use base+overlay pattern
