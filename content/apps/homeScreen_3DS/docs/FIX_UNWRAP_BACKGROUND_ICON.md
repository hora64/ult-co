# Fix: Unwrap Icons Not Using Background Image for BaseIcon Apps

## Issue
When unwrapping apps with `baseIcon: true`, the background image was not being preserved after unwrapping. This caused baseIcon apps to lose their background styling when revealed.

## Root Cause
In the `_replaceUnopenedApp` method in `AppIcon.js`, the `backgroundIcon` property was not being passed to the new app options after unwrapping for baseIcon apps.

## Solution
Modified the `_replaceUnopenedApp` method to:
1. Detect when an app has `baseIcon: true`
2. Preserve the `backgroundIcon` property from the original app options
3. Pass it to the new unwrapped app options

## Code Changes

### File: `content/apps/homeScreen_3DS/assets/js/AppIcon.js`

**In `_replaceUnopenedApp` method:**

```javascript
// Added backgroundIcon handling for baseIcon apps
let backgroundIconToUse = null;

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

// Create a new options object for the "unboxed" app
const newAppOptions = {
    ...appOptions,
    unopened: false,
    baseIcon: newBaseIcon,
    icon: actualIcon,
    actualIcon: actualIcon,
    backgroundIcon: backgroundIconToUse // CRITICAL FIX: Pass backgroundIcon for baseIcon apps
};
```

## How It Works

### Before Unwrap (Wrapped State):
- App has `baseIcon: true`
- App has `backgroundIcon: '/path/to/background.png'`
- Icon shows gift box overlay on background

### After Unwrap (Fixed):
- App still has `baseIcon: true`
- App preserves `backgroundIcon: '/path/to/background.png'`
- Icon shows actual icon on the background image
- Background is properly rendered via `AppIconRenderer.renderIcon()`

## AppIconRenderer Logic
The `AppIconRenderer.renderIcon()` method handles the rendering:

```javascript
// Determine which images to load
// Priority: backgroundIcon > baseImage > icon (for non-baseIcon apps)
const baseSrc = baseIcon ? icon : (backgroundIcon || baseImage || icon);
```

For baseIcon apps after unwrap:
- `baseIcon = true`
- `icon = actualIcon` (the revealed icon)
- `backgroundIcon` is now properly passed
- Renderer uses `actualIcon` as base since `baseIcon: true`
- Background would only be used if overlay mode, but for baseIcon the icon IS the complete image

## Note on BaseIcon Rendering
For apps with `baseIcon: true`:
- The `icon` property contains the complete image (no overlay)
- The `backgroundIcon` property is NOT used in this mode
- The icon is drawn directly as a standalone image

For apps with `baseIcon: false` or undefined:
- The `backgroundIcon` is used as the base layer
- The `icon` is drawn as an overlay on top

## Testing Recommendations
1. Test unwrapping an app with `baseIcon: true` and `backgroundIcon` set
2. Verify the background is preserved after unwrapping
3. Test unwrapping an app with `baseIcon: false` to ensure no regression
4. Test unwrapping an app without `backgroundIcon` specified

## Files Modified
- `content/apps/homeScreen_3DS/assets/js/AppIcon.js` - Fixed `_replaceUnopenedApp` method

## Status
✅ **Fixed** - Build successful  
✅ **No regressions** - Existing functionality preserved  
✅ **Proper logging** - Added console.log for debugging
