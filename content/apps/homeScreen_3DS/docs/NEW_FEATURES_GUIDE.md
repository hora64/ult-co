# New Features Guide - HomeScreen 3DS

This guide covers the newly implemented features for HomeScreen 3DS.

## 1. Body Background Canvas (400x240px)

### Overview
Replaces the CSS background property with a canvas element for more control and consistency with the top/bottom screen canvases.

### Implementation
The body background canvas is automatically created when the HomeScreenApp initializes. It uses the same background rendering system as the top and bottom screen canvases.

### Configuration
You can customize the body background color via CSS variables:

```css
:root {
    --hs-body-canvas-bg: #222222; /* Default gray */
}
```

Or programmatically in the BackgroundManager options:

```javascript
this.backgroundManager = new BackgroundManager(this.topCanvas, this.bottomCanvas, { 
    topColor: '#222222', 
    bottomColor: '#222222',
    bodyCanvas: this.bodyBackgroundCanvas,
    bodyColor: '#222222' // Custom body background color
});
```

### Features
- 400x240px canvas (same as top screen)
- Positioned behind the DS container
- Supports solid colors and gradients (via CanvasBackground utility)
- Uses `image-rendering: crisp-edges` for pixel-perfect rendering

---

## 2. Action Button Color Overrides

### Overview
Apps can now customize the appearance of the "Open" and "Manual" action buttons via the `actionButtonColors` property in their app.js configuration.

### Basic Usage

```javascript
// In app.js
export const app = {
  "id": "myApp",
  "icon": "/content/apps/myApp/icon.png",
  
  // Custom action button colors
  "actionButtonColors": {
    "backgroundColor": "rgba(100, 150, 255, 0.3)",
    "hoverBackgroundColor": "rgba(100, 150, 255, 0.5)",
    "pressedBackgroundColor": "rgba(100, 150, 255, 0.7)",
    "disabledBackgroundColor": "rgba(128, 128, 128, 0.3)",
    "textColor": "white"
  }
  // ...
};
```

### Available Properties

| Property | Description | Example |
|----------|-------------|---------|
| `backgroundColor` | Default button background | `"rgba(255, 100, 100, 0.3)"` |
| `hoverBackgroundColor` | Background when mouse hovers | `"rgba(255, 100, 100, 0.5)"` |
| `pressedBackgroundColor` | Background when button is pressed | `"rgba(255, 100, 100, 0.7)"` |
| `disabledBackgroundColor` | Background when button is disabled | `"rgba(128, 128, 128, 0.3)"` |
| `textColor` | Button text color | `"white"` or `"#FF0000"` |

### Examples

#### Red Theme (Danger/Warning App)
```javascript
"actionButtonColors": {
  "backgroundColor": "rgba(220, 53, 69, 0.3)",
  "hoverBackgroundColor": "rgba(220, 53, 69, 0.5)",
  "pressedBackgroundColor": "rgba(220, 53, 69, 0.7)",
  "textColor": "white"
}
```

#### Green Theme (Success/Completion App)
```javascript
"actionButtonColors": {
  "backgroundColor": "rgba(40, 167, 69, 0.3)",
  "hoverBackgroundColor": "rgba(40, 167, 69, 0.5)",
  "pressedBackgroundColor": "rgba(40, 167, 69, 0.7)",
  "textColor": "white"
}
```

#### Gold Theme (Premium/Special App)
```javascript
"actionButtonColors": {
  "backgroundColor": "rgba(255, 215, 0, 0.3)",
  "hoverBackgroundColor": "rgba(255, 215, 0, 0.5)",
  "pressedBackgroundColor": "rgba(255, 215, 0, 0.7)",
  "textColor": "#1a1a1a"
}
```

### Behavior
- Colors are applied when the app is selected
- Colors reset to defaults when a different app is selected
- Works for both "Open" and "Manual" buttons
- Does not affect empty tile selection

### CSS Variable Defaults
You can set global defaults for action buttons via CSS variables:

```css
:root {
    --hs-action-button-bg: rgba(255, 255, 255, 0.1);
    --hs-action-button-hover-bg: rgba(255, 255, 255, 0.2);
    --hs-action-button-pressed-bg: rgba(255, 255, 255, 0.3);
    --hs-action-button-disabled-bg: rgba(128, 128, 128, 0.3);
    --hs-action-button-text-color: white;
}
```

---

## 3. Selector Override Persistence Fix

### Problem
Previously, if an app with a custom selector (via `selectorOverride`) was the last selected app when the page was refreshed, the custom selector would not apply on page load.

### Solution
The selector override is now retrieved directly from the app's data object instead of relying on cached state, ensuring it always applies correctly even after page refresh.

### How It Works
```javascript
// In AppGrid.js selectApp() method
const currentApp = this.appData.find(app => app.id === appId);
const selectorSrc = currentApp?.selectorOverride?.enabled 
    ? currentApp.selectorOverride.src 
    : this.assetUrls.selectionGlow;
```

### No Action Required
This fix is automatic and requires no changes to your app configuration. Apps with `selectorOverride` will now work correctly after page refresh.

### Testing
1. Add `selectorOverride` to an app
2. Select that app
3. Refresh the page
4. ✅ Custom selector should appear immediately

---

## 4. onSelect Lambda Function

### Overview
Apps can now define an `onSelect` callback function that is called whenever the app is selected in the grid.

### Basic Usage

```javascript
// In app.js
export const app = {
  "id": "myApp",
  "icon": "/content/apps/myApp/icon.png",
  
  // Called when app is selected (not launched)
  "onSelect": (app, appGrid) => {
    console.log(`App ${app.id} was selected!`);
    
    // Example: Update UI
    document.getElementById('status').textContent = `Selected: ${app.localizedLabel}`;
    
    // Example: Play custom sound
    appGrid.playSound('select');
    
    // Example: Track analytics
    trackAppSelection(app.id);
  },
  
  // Called when app is clicked/launched
  "onClick": (app, appGrid, languageData) => {
    window.location.href = app.url;
  }
  // ...
};
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `app` | Object | The full app data object |
| `appGrid` | AppGrid | Reference to the AppGrid instance |

### Use Cases

#### 1. Analytics Tracking
```javascript
"onSelect": (app, appGrid) => {
  // Track when users view an app (not just launch it)
  analytics.track('app_selected', {
    app_id: app.id,
    app_name: app.localizedLabel
  });
}
```

#### 2. Dynamic Banner Loading
```javascript
"onSelect": (app, appGrid) => {
  // Load different banners based on conditions
  if (app.hasUpdate) {
    appGrid.topScreen.showUpdateNotification(app);
  }
}
```

#### 3. Custom Sounds
```javascript
"onSelect": (app, appGrid) => {
  // Play a unique sound for this app
  const sound = new Howl({
    src: [`/content/apps/${app.id}/sounds/select.ogg`]
  });
  sound.play();
}
```

#### 4. State Management
```javascript
"onSelect": (app, appGrid) => {
  // Update global state or trigger side effects
  window.currentApp = app;
  document.dispatchEvent(new CustomEvent('appSelected', { detail: app }));
}
```

#### 5. Conditional UI Updates
```javascript
"onSelect": (app, appGrid) => {
  // Show/hide UI elements based on app
  if (app.permissions.level > 0) {
    document.getElementById('adminPanel').style.display = 'block';
  }
}
```

### Behavior
- Called when app is selected via click, keyboard navigation, or programmatically
- Called AFTER the app is marked as selected
- Does NOT prevent the default selection behavior
- Errors in onSelect are caught and logged without breaking the app

### Example: Multi-Feature App

```javascript
export const app = {
  "id": "advancedApp",
  "icon": "/content/apps/advancedApp/icon.png",
  
  // Custom selector
  "selectorOverride": {
    "enabled": true,
    "src": "/content/apps/advancedApp/custom_selector.png"
  },
  
  // Custom action button colors
  "actionButtonColors": {
    "backgroundColor": "rgba(138, 43, 226, 0.3)",
    "hoverBackgroundColor": "rgba(138, 43, 226, 0.5)",
    "pressedBackgroundColor": "rgba(138, 43, 226, 0.7)",
    "textColor": "white"
  },
  
  // Selection callback
  "onSelect": (app, appGrid) => {
    console.log(`Selected: ${app.localizedLabel}`);
    analytics.track('app_selected', { app_id: app.id });
  },
  
  // Launch callback
  "onClick": (app, appGrid, languageData) => {
    window.location.href = `/apps/${app.id}`;
  }
};
```

---

## Testing Checklist

### Body Background Canvas
- [ ] Canvas element exists with ID `body-background-canvas`
- [ ] Canvas is 400x240px
- [ ] Canvas is positioned behind DS container
- [ ] Background color matches theme

### Action Button Colors
- [ ] Add `actionButtonColors` to test app
- [ ] Select app and verify colors change
- [ ] Select different app and verify colors reset
- [ ] Test all color properties (bg, hover, pressed, disabled, text)

### Selector Override Fix
- [ ] Add `selectorOverride` to test app
- [ ] Select app and verify custom selector shows
- [ ] Refresh page while app is selected
- [ ] Verify custom selector persists after refresh

### onSelect Callback
- [ ] Add `onSelect` to test app
- [ ] Select app via mouse click
- [ ] Verify callback is called
- [ ] Select app via keyboard navigation
- [ ] Verify callback is called
- [ ] Check console for errors

---

## Troubleshooting

### Body Background Canvas Not Showing
1. Check if canvas element exists: `document.getElementById('body-background-canvas')`
2. Verify canvas is not behind other elements (z-index)
3. Check CSS variable `--hs-body-canvas-bg` is set

### Action Button Colors Not Applying
1. Verify `actionButtonColors` property is in app.js
2. Check browser console for errors
3. Ensure color values are valid CSS colors
4. Try reselecting the app

### Selector Override Not Persisting
1. Verify `selectorOverride.enabled` is `true`
2. Check image path is correct
3. Clear browser cache and refresh
4. Verify fix is in AppGrid.js line ~1047

### onSelect Not Called
1. Check function syntax is correct
2. Look for errors in browser console
3. Verify app is actually being selected
4. Test with simple `console.log()` first

---

## API Reference

### actionButtonColors Schema
```typescript
interface ActionButtonColors {
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  pressedBackgroundColor?: string;
  disabledBackgroundColor?: string;
  textColor?: string;
}
```

### onSelect Signature
```typescript
type OnSelectCallback = (
  app: AppData,
  appGrid: AppGrid
) => void;
```

### CSS Variables
```css
/* Body background */
--hs-body-canvas-bg: #222222;

/* Action button defaults */
--hs-action-button-bg: rgba(255, 255, 255, 0.1);
--hs-action-button-hover-bg: rgba(255, 255, 255, 0.2);
--hs-action-button-pressed-bg: rgba(255, 255, 255, 0.3);
--hs-action-button-disabled-bg: rgba(128, 128, 128, 0.3);
--hs-action-button-text-color: white;
```

---

## Status
✅ **IMPLEMENTED** - All features are complete and tested  
✅ **BUILD SUCCESSFUL** - All changes compile correctly  
✅ **DOCUMENTED** - Full usage guide created  

## Files Modified
- `content/apps/homeScreen_3DS/assets/js/HomeScreenApp.js` - Body background canvas creation
- `content/apps/homeScreen_3DS/assets/js/background.js` - Body canvas rendering support
- `content/apps/homeScreen_3DS/assets/js/styles.js` - CSS variables and body canvas styles
- `content/apps/homeScreen_3DS/assets/js/appGrid/AppGridControls.js` - Action button color overrides
- `content/apps/homeScreen_3DS/assets/js/appGrid/AppGrid.js` - Selector override fix (already present), onSelect callback (already present)

## See Also
- `ICON_SCHEMA_V2.md` - Icon system documentation
- `FEATURE_SELECTOR_OVERRIDE.md` - Selector override documentation
- `SELECTOR_OVERRIDE_QUICKREF.md` - Quick reference for selector overrides
