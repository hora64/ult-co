# Fix: BaseIcon Apps Showing Double Gift Box When Wrapped

## ⚠️ SUPERSEDED BY ICON SCHEMA V2
This fix has been superseded by the new **Icon Schema V2** which provides a comprehensive solution.

**See:** `ICON_SCHEMA_V2.md` for the complete architecture.

## Quick Summary
The issue of double gift boxes for wrapped baseIcon apps has been resolved by implementing a consistent **base + overlay** pattern for ALL apps (both baseIcon and regular apps).

### Solution Overview:
- ✅ All apps now use base layer + overlay layer
- ✅ When wrapped: base + gift box overlay
- ✅ When unwrapped: base + icon overlay
- ✅ Supports animated icon overlays
- ✅ No more double gift box issues

## New Architecture

### BaseIcon Apps (Unwrapped)
```
Base:    backgroundIcon (or icon as fallback)
Overlay: icon (can be animated)
Result:  Background + icon overlay
```

### BaseIcon Apps (Wrapped)
```
Base:    backgroundIcon (or icon as fallback)
Overlay: wrapIcon (gift box)
Result:  Background + gift box overlay
```

### Regular Apps (Unwrapped)
```
Base:    backgroundIcon
Overlay: icon (can be animated)
Result:  Background + icon overlay
```

### Regular Apps (Wrapped)
```
Base:    backgroundIcon
Overlay: wrapIcon (gift box)
Result:  Background + gift box overlay
```

## Files Modified

### `content/apps/homeScreen_3DS/config/config.js`
- Updated `resolveAppAssets()` to support new schema
- Added animation properties (`animated`, `animationFrames`, `animationSpeed`)
- Simplified logic - no special cases needed

### `content/apps/homeScreen_3DS/assets/js/appGrid/AppIconRenderer.js`
- Restructured `renderIcon()` to always use base+overlay pattern
- Added `renderAnimatedIcon()` for animated overlays
- Added support for `backgroundIcon` and `wrapIcon` parameters
- All rendering paths now consistent

## Benefits

1. **No More Double Icons**: Consistent rendering prevents double gift boxes
2. **Animated Icons**: Overlay layer can be animated (GIF, sprite sheets)
3. **Consistent Behavior**: All apps follow same rendering pattern
4. **Better Visuals**: Clear separation of background and foreground
5. **Simplified Code**: No special cases needed for baseIcon vs regular apps

## Migration

### Old Schema (Still Supported)
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png",
    unopened: false
}
```

### New Schema (Recommended)
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png", // Overlay layer
    backgroundIcon: "/apps/myApp/bg.png", // Base layer
    animated: false, // Animation support
    unopened: false
}
```

## For Complete Details
See `ICON_SCHEMA_V2.md` for:
- Complete architecture documentation
- Migration guide
- Animated icon examples
- Best practices
- Rendering logic details

## Status
✅ **RESOLVED** - Issue fixed by Icon Schema V2  
✅ **Build Successful**  
✅ **Backward Compatible**  
✅ **Animation Ready**
