# Fix: HomeScreen_WiiU Showing as Wrapped (Gift Box Icon)

## Issue
The Wii U homescreen app was displaying as wrapped (with a gift box overlay) instead of showing the actual icon. Homescreen apps should always appear unwrapped.

![Bug Image](../../../docs/images/wiiu-wrapped-bug.png)
*The Wii U icon was incorrectly showing the gift box overlay*

## Root Cause
Two configuration issues:

1. **App Configuration**: `homeScreen_WiiU/app.js` had `"unopened": true` set
2. **Global Configuration**: `homeScreen_WiiU` was not in the `alwaysOpenedApps` list in `config.js`

## Solution

### 1. Updated `config.js`
Added both homescreen apps to the `alwaysOpenedApps` list:

```javascript
/**
 * Apps that should always be opened (never wrapped in gift box)
 * These apps will never show the unopened/gift box state
 */
export const alwaysOpenedApps = [
    'info', 
    'mail', 
    'settings', 
    'homeScreen_3DS',    // ADDED
    'homeScreen_WiiU'    // ADDED
];
```

### 2. Updated `homeScreen_WiiU/app.js`
Changed `unopened` from `true` to `false`:

```javascript
export const app = {
  "id": "homeScreen_WiiU",
  "baseIcon": true,
  "icon": "/content/apps/homeScreen_WiiU/banner/wiiU_64px.png",
  "actualIcon": "/content/apps/homeScreen_WiiU/banner/wiiU_64px.png",
  "unopened": false, // FIXED: Was true, now false
  // ...
}
```

## Why Homescreen Apps Should Never Be Wrapped

Homescreen apps are launcher applications that provide the interface for accessing other apps. They should always be visible and accessible without needing to be "unwrapped" first.

### Apps That Should Never Be Wrapped:
- ✅ `homeScreen_3DS` - 3DS-style launcher
- ✅ `homeScreen_WiiU` - Wii U-style launcher  
- ✅ `info` - Core information app
- ✅ `mail` - Core communication app
- ✅ `settings` - Core system settings

## How It Works

### The `alwaysOpenedApps` Configuration
This array is checked during app initialization in `AppGrid._processAppData()`:

```javascript
_processAppData() {
    this.appData.forEach((app, index) => {
        // Check if app should be unopened
        if (typeof app.unopened !== 'boolean') {
            const isOpenedInStorage = this.openedApps[app.id] === true;
            app.unopened = !isOpenedInStorage;
        }
        
        // Override for always-opened apps
        if (alwaysOpenedApps.includes(app.id)) {
            app.unopened = false; // Force opened state
        }
    });
}
```

### The `unopened` Property
- **`unopened: true`**: App shows with gift box overlay
- **`unopened: false`**: App shows actual icon
- **`undefined`**: Checked against localStorage to restore user's unwrap state

## Files Modified

1. `content/apps/homeScreen_3DS/config/config.js`
   - Added `homeScreen_3DS` and `homeScreen_WiiU` to `alwaysOpenedApps`

2. `content/apps/homeScreen_WiiU/app.js`
   - Changed `unopened` from `true` to `false`

## Testing

✅ **Build successful**  
✅ **Wii U icon now shows correctly (no gift box)**  
✅ **3DS icon remains correctly displayed**  
✅ **Other apps' wrap/unwrap behavior unaffected**

## Before vs After

### Before:
```javascript
// config.js
alwaysOpenedApps = ['info', 'mail', 'settings']; // Missing homescreen apps!

// app.js
"unopened": true, // Wrong!
```
Result: 🎁 Gift box shown

### After:
```javascript
// config.js
alwaysOpenedApps = ['info', 'mail', 'settings', 'homeScreen_3DS', 'homeScreen_WiiU'];

// app.js
"unopened": false, // Correct!
```
Result: ✅ Actual icon shown

## Related Systems

### Icon Rendering
The `AppIconRenderer` checks the `unopened` flag to determine which icon to display:
- If `unopened === true`: Shows `wrapIcon` (gift box) overlay
- If `unopened === false`: Shows `actualIcon` (real app icon)

### Storage System
The `openedApps` object in localStorage tracks which apps have been unwrapped by the user. However, apps in `alwaysOpenedApps` bypass this check and are always shown as opened.

## Status
✅ **FIXED** - Both homescreen apps now display correctly without gift box overlay
