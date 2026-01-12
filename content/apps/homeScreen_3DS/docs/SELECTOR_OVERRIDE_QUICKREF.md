# Selector Override Quick Reference

## Basic Syntax
```javascript
"selectorOverride": {
    "enabled": true,
    "src": "/path/to/custom/selector.png"
}
```

## Real Example
```javascript
// In app.js
export const app = {
  "id": "homeScreen_WiiU",
  "actualIcon": "/content/apps/homeScreen_WiiU/banner/wiiU_64px.png",
  
  "selectorOverride": {
    "enabled": true,
    "src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"
  },
  
  "permissions": {
    "level": 0,
    "launchable": false,
    "unwrappable": true
  }
  // ...
};
```

## Common Selectors

### Default Theme Selectors
```javascript
// Black theme (default)
"src": "/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png"

// Blue theme  
"src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"

// Other theme selectors
"src": "/content/common/themes/[themeName]/Select_128px.png"
```

### Disable Selector
```javascript
"selectorOverride": {
    "enabled": false  // Uses default theme selector
}
// Or omit the property entirely
```

## Image Requirements
- **Format**: PNG (recommended), GIF, or any web format
- **Size**: 128x128px recommended
- **Transparency**: Required for glow effect
- **Location**: Anywhere in `/content/` directory

## Testing Checklist
- [ ] Add `selectorOverride` to app.js
- [ ] Verify image path is correct
- [ ] Start homescreen
- [ ] Select the app
- [ ] Custom selector should appear
- [ ] Select different app
- [ ] Other apps use default selector

## Troubleshooting

### Selector Not Showing
1. Check `enabled: true`
2. Verify image path is correct (use absolute path)
3. Check browser console for 404 errors
4. Ensure image file exists at specified path

### Wrong Selector Showing
1. Clear browser cache (Ctrl+Shift+R)
2. Check spelling of `src` path
3. Verify `enabled: true` (not `false`)

### Selector Too Large/Small
- Selector is automatically scaled to 115% of icon size
- Image should be 128x128px for best results
- Create smaller/larger variants if needed

## Status
✅ Implemented
✅ Build successful
✅ Tested with Wii U homescreen

## See Also
- `FEATURE_SELECTOR_OVERRIDE.md` - Full documentation
- `ICON_SCHEMA_V2.md` - Icon system documentation
- Theme configuration files
