# Custom Selector Override Feature

## Overview
The `selectorOverride` property allows individual apps to use custom selection glow images instead of the default theme selector.

## Implementation Date
Added in response to request to use blue theme selector for Wii U homescreen app.

## Usage

### Basic Configuration
Add a `selectorOverride` object to your app.js:

```javascript
export const app = {
  "id": "myApp",
  "icon": "/path/to/icon.png",
  
  // Custom selector override
  "selectorOverride": {
    "enabled": true,
    "src": "/path/to/custom/selector.png"
  },
  
  // ...rest of app config
};
```

### Example: Wii U Homescreen
```javascript
// content/apps/homeScreen_WiiU/app.js
export const app = {
  "id": "homeScreen_WiiU",
  "actualIcon": "/content/apps/homeScreen_WiiU/banner/wiiU_64px.png",
  
  // Use blue theme selector instead of default
  "selectorOverride": {
    "enabled": true,
    "src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"
  },
  
  // ...rest of config
};
```

## Schema

### selectorOverride Object
```typescript
{
  "selectorOverride": {
    "enabled": boolean,    // Whether to use custom selector
    "src": string         // Path to custom selector image
  }
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether the custom selector is active |
| `src` | string | Yes | Absolute or relative path to selector image |

## How It Works

### 1. App Selection (AppGrid.js - selectApp)
When an app is selected:
1. Check if `appDataItem.selectorOverride.enabled` is true
2. If yes, use `appDataItem.selectorOverride.src` as selector
3. If no, use default `this.assetUrls.selectionGlow`

```javascript
const selectorSrc = appDataItem?.selectorOverride?.enabled 
    ? appDataItem.selectorOverride.src 
    : this.assetUrls.selectionGlow;

const glowOptions = {
    animated: false,
    frameCount: 1,
    currentFrame: 0,
    frameDuration: 100,
    customSrc: selectorSrc  // Pass custom source
};
this.renderSelectionGlow(glow, iconSize, glowOptions);
```

### 2. Glow Rendering (AppGrid.js - renderSelectionGlow)
The render function uses the custom source:
```javascript
renderSelectionGlow(canvas, iconSize, options = {}) {
    const { customSrc = null } = options;
    // ...
    img.src = customSrc || this.assetUrls.selectionGlow;
}
```

## Use Cases

### 1. Themed Apps
Different selector colors for different app categories:
```javascript
// Red selector for system apps
"selectorOverride": {
    "enabled": true,
    "src": "/content/themes/selectors/red_selector.png"
}

// Blue selector for user apps
"selectorOverride": {
    "enabled": true,
    "src": "/content/themes/selectors/blue_selector.png"
}
```

### 2. Seasonal Events
Special selectors for holiday apps:
```javascript
// Christmas apps get festive selector
"selectorOverride": {
    "enabled": true,
    "src": "/content/themes/selectors/christmas_selector.png"
}
```

### 3. Premium Apps
Gold/special selector for VIP apps:
```javascript
"selectorOverride": {
    "enabled": true,
    "src": "/content/themes/selectors/gold_selector.png"
}
```

### 4. No Selector
Disable selector entirely:
```javascript
"selectorOverride": {
    "enabled": true,
    "src": "/content/common/assets/transparent.png"  // 1x1 transparent PNG
}
```

## Selector Image Requirements

### Format
- PNG with transparency recommended
- GIF support (automatic animation)
- Any web-compatible image format

### Size
- Recommended: 128x128px (matches default selectors)
- Will be scaled to 115% of icon size automatically
- Higher resolution = better quality at large icon sizes

### Design Guidelines
- Use transparency for glow effect
- Center the glow around 64x64 icon area
- Extra padding for visual effect
- Consider animation (8 frames horizontal sprite)

## Future Enhancements

### Animated Selectors (Planned)
```javascript
"selectorOverride": {
    "enabled": true,
    "src": "/path/to/animated_selector.png",
    "animated": true,
    "frames": 8,
    "duration": 100
}
```

### Per-Size Selectors (Planned)
```javascript
"selectorOverride": {
    "enabled": true,
    "sizes": {
        "tiny": "/path/to/tiny_selector.png",
        "small": "/path/to/small_selector.png",
        "normal": "/path/to/normal_selector.png"
    }
}
```

### Effect Modifiers (Planned)
```javascript
"selectorOverride": {
    "enabled": true,
    "src": "/path/to/selector.png",
    "opacity": 0.8,
    "scale": 1.2,
    "color": "#FF0000"  // Tint color
}
```

## Backward Compatibility
- ✅ Fully backward compatible
- Apps without `selectorOverride` use default selector
- No breaking changes to existing apps
- Optional feature - enable only when needed

## Testing
1. Add `selectorOverride` to any app.js
2. Start homescreen
3. Select the app
4. Verify custom selector appears
5. Select different app without override
6. Verify default selector appears

## Files Modified
- `content/apps/homeScreen_3DS/assets/js/appGrid/AppGrid.js`
  - Updated `selectApp()` method
  - Updated `renderSelectionGlow()` method
- `content/apps/homeScreen_WiiU/app.js`
  - Added `selectorOverride` configuration

## Related Features
- Time-restricted apps (planned)
- Custom icon animations (GIF support)
- Theme system
- Banner customization

## Status
✅ **IMPLEMENTED** - Feature is complete and tested
✅ **BUILD SUCCESSFUL** - All changes compile correctly
✅ **DOCUMENTED** - Usage guide created

---

## Example Gallery

### Default Selector (Black Theme)
Used by most apps - white/blue animated glow

### Blue Theme Selector
Used by Wii U homescreen - bright blue glow

### Custom Selectors (Examples)
- Red selector for system/danger apps
- Green selector for success/confirmed apps  
- Gold selector for premium apps
- Purple selector for experimental apps
- Rainbow animated selector for special events

---

**Note**: This feature was implemented to allow the Wii U homescreen to use the blue theme selector (`Select_128px.png`) instead of the default black theme selector.
