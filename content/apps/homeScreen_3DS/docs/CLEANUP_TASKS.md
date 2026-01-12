# HomeScreen Code Cleanup Tasks

## 1. Console Log Removal ✅
Remove all redundant console.log statements from:
- [x] `homeScreen_WiiU/app.js` - DONE
- [ ] `homeScreen_3DS/assets/js/HomeScreenApp.js` - IN PROGRESS (52 console.log calls)
- [ ] `homeScreen_3DS/assets/js/appGrid/AppGrid.js` 
- [ ] `homeScreen_3DS/assets/js/appGrid/AppGridControls.js`
- [ ] `homeScreen_3DS/assets/js/appGrid/AppIcon.js`
- [ ] Other homescreen JS files

### Console Logs to Keep:
- console.error() for actual errors
- console.warn() for important warnings  
- console.log() that are essential for debugging complex issues

### Console Logs to Remove:
- Initialization logs ("Module loading...", "Module loaded")
- Success logs ("Loaded X apps", "Created component")
- State change logs ("Language set to", "App clicked")
- Debug logs in production code

## 2. Permission Property Cleanup ✅
Simplify permissions object in all app.js files:

### Remove These Properties:
- `requiresAuth` - redundant (always false or not needed)
- `requiresFeatures` - redundant empty array
- `unlockRequirements` - redundant empty object
- `features` - redundant array of tags

### Keep Only:
- `level` - Permission level (0 = public, 1 = debug/user)
- `launchable` - Can the app be launched
- `unwrappable` - Can the app be unwrapped

### Files Updated:
- [x] `homeScreen_WiiU/app.js` - DONE
- [x] `homeScreen_3DS/app.js` - DONE
- [ ] All other app.js files in /content/apps/

## 3. Time-Restricted Apps (NEW FEATURE)
Add support for apps that are only available during certain time periods.

### Implementation:
```javascript
"timeRestriction": {
    "enabled": true,
    "start": "2024-12-01T00:00:00Z",  // ISO 8601 format
    "end": "2024-12-25T23:59:59Z",
    "timezone": "UTC"  // or "America/New_York", etc.
}
```

### Location:
- Add to app.js schema
- Check in AppGrid during app filtering
- Show special indicator for time-restricted apps
- Display message when trying to access outside time window

## 4. Action Bar Double-Tap Fix (UNWRAP)
Fix the requirement to double-tap to unwrap apps.

### Current Behavior:
1. Click app → Select it
2. Click again → Unwrap/open it

### Desired Behavior:
1. Click unopened app → Unwrap immediately
2. Click opened app → Open immediately

### Files to Modify:
- `AppGrid.js` - `_internalHandleAppClickTrigger` method
- Remove `lastSelectedAppIdForAction` tracking
- Simplify unwrap logic

## 5. GIF Support for Animated Sprites
Replace frame-based sprite sheet animation with GIF support.

### Current System:
- Horizontal sprite sheets (8 frames side-by-side)
- Manual frame extraction and cycling
- Requires frameCount and frameDuration config

### New System:
- Support animated GIF files
- Browser handles animation automatically
- Simpler configuration
- Better performance

### Implementation:
- Update `AppIconRenderer.js` to detect GIF format
- Use GIF directly instead of frame extraction
- Keep sprite sheet support for backward compatibility
- Update selector glow system

## 6. Selector Override for Apps
Allow individual apps to specify custom selection glow/effects.

### Schema Addition:
```javascript
"selectorOverride": {
    "type": "sprite",  // or "gif", "none"
    "src": "/path/to/custom/glow.png",
    "animated": true,
    "frames": 8,
    "duration": 100
}
```

### Use Cases:
- Special apps with unique selection effects
- Seasonal/themed selection glows
- Apps that need no selector (invisible)
- Apps with animated custom selectors

### Files to Modify:
- `AppGrid.js` - selectApp method
- `AppIconRenderer.js` - renderSelectionGlow method
- Schema documentation

## Priority Order:
1. **HIGH**: Console log removal (cleanup, reduce file size)
2. **HIGH**: Permission cleanup (simplify, reduce redundancy) 
3. **MEDIUM**: Double-tap unwrap fix (UX improvement)
4. **MEDIUM**: GIF animation support (feature addition)
5. **LOW**: Time-restricted apps (new feature)
6. **LOW**: Selector override (customization feature)

## Files Requiring Updates:
- content/apps/homeScreen_WiiU/app.js ✅
- content/apps/homeScreen_3DS/app.js ✅
- content/apps/homeScreen_3DS/assets/js/HomeScreenApp.js (LARGE FILE - 52 console.logs)
- content/apps/homeScreen_3DS/assets/js/appGrid/AppGrid.js
- content/apps/homeScreen_3DS/assets/js/appGrid/AppGridControls.js
- content/apps/homeScreen_3DS/assets/js/appGrid/AppIcon.js
- content/apps/homeScreen_3DS/assets/js/appGrid/AppIconRenderer.js
- All other /content/apps/*/app.js files

## Estimated Impact:
- File size reduction: ~15-20% (console log removal)
- Code clarity: Significant improvement
- Maintenance: Easier to understand and modify
- Features: 4 new capabilities added
