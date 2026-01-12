# UltShop Structure Update - HomeScreen Pattern

## Summary

UltShop has been restructured to follow the **HomeScreen app pattern**:

✅ **Resolution defined in `app.js`** (400x480)  
✅ **Colors and paths in CSS variables** (`config/themeVars.css`)  
✅ **Config.js for app-specific settings only** (grid, features, i18n)

## What Changed

### Before (Old Structure)
```javascript
// config/config.js had EVERYTHING
export const config = {
    resolution: { width: 320, height: 480 },  // ❌ Was in config
    colors: { primary: '#00BCD4', ... },      // ❌ Was in config
    paths: { assets: '/content/...' }         // ❌ Was in config
};
```

### After (New Structure - HomeScreen Pattern)

#### 1. **app.js** - Resolution Only
```javascript
export const app = {
    "resolution": {
        "width": 400,    // ✅ Now in app.js
        "height": 480,   // ✅ Matches HomeScreen pattern
        "scale": "fit"
    }
};
```

#### 2. **config/themeVars.css** - Colors & Paths
```css
:root {
    /* Resolution (reference) */
    --ultshop-width: 400px;
    --ultshop-height: 480px;
    
    /* Colors */
    --ultshop-primary: #00BCD4;
    --ultshop-text: #000000;
    
    /* Paths */
    --ultshop-assets-base: '/content/apps/ultshop/assets';
    --ultshop-sounds-path: '/content/apps/ultshop/assets/sfx';
}
```

#### 3. **config/config.js** - App Settings Only
```javascript
// Grid layout
export const productGrid = {
    columns: 3,
    cardWidth: 90,
    cardHeight: 110,
    gap: 10,
    startY: 50
};

// Features
export const features = {
    enableSoundEffects: true,
    enableCart: true
};

// Helper function
export function getThemeVar(varName, defaultValue) {
    // Read from CSS variables
}
```

## File Structure

```
ultshop/
├── app.js                          # ✅ Resolution (400x480)
├── ultshop.html                    # ✅ Links to themeVars.css
│
├── config/
│   ├── config.js                   # ✅ Grid, features, helpers
│   ├── themeVars.css              # ✅ Colors, paths (NEW!)
│   ├── products.js                 # Products (unchanged)
│   └── translations.js             # Translations (unchanged)
│
└── assets/
    └── js/
        ├── UltShopApp.js          # ✅ Reads CSS variables
        └── pages/                  # ✅ Use app.colors, app.resolution
            ├── StorefrontPage.js
            ├── ProductDetailPage.js
            ├── CartPage.js
            └── PurchaseCompletePage.js
```

## Key Changes

### 1. Resolution: app.js
```javascript
// app.js
"resolution": {
    "width": 400,   // Changed from 320
    "height": 480,  // Unchanged
    "scale": "fit"
}
```

### 2. Colors: CSS Variables
```css
/* config/themeVars.css */
:root {
    --ultshop-primary: #00BCD4;
    --ultshop-primary-dark: #00838F;
    --ultshop-danger: #D32F2F;
    --ultshop-text: #000000;
    /* ... */
}
```

### 3. HTML: Uses CSS Variables
```html
<!-- ultshop.html -->
<link rel="stylesheet" href="config/themeVars.css">

<style>
    #app-container {
        width: var(--ultshop-width);
        height: var(--ultshop-height);
        background: var(--ultshop-app-container-gradient);
    }
</style>
```

### 4. JavaScript: Reads CSS Variables
```javascript
// UltShopApp.js
this.colors = {
    primary: getThemeVar('ultshop-primary', '#00BCD4'),
    text: getThemeVar('ultshop-text', '#000000')
};

this.resolution = {
    width: parseInt(getThemeVar('ultshop-width', '400'))
};
```

## Benefits

### 1. **Themeable**
```css
/* Create custom themes easily */
[data-theme="dark"] {
    --ultshop-primary: #64B5F6;
    --ultshop-text: #FFFFFF;
    --ultshop-gradient-start: #2C2C2C;
}
```

### 2. **Consistent with HomeScreen**
- Same pattern as `homeScreen_3DS`
- Resolution in `app.js`
- Colors/paths in CSS
- Config for app logic

### 3. **Better Organization**
```
Resolution   → app.js (standard location)
Colors/Paths → themeVars.css (CSS-level)
App Settings → config.js (JS logic)
```

### 4. **Easier Customization**
```css
/* Change entire color scheme in one file */
:root {
    --ultshop-primary: #FF5722;  /* Change primary color */
}
/* All buttons, text, UI updates automatically */
```

## Migration Guide

### For Developers

**Old code:**
```javascript
import { config } from '../config/config.js';
const color = config.colors.primary;
```

**New code:**
```javascript
// In component
const color = this.app.colors.primary;  // Already loaded from CSS

// Or use helper
import { getThemeVar } from '../config/config.js';
const color = getThemeVar('ultshop-primary', '#00BCD4');
```

### For Designers

**Change colors:**
1. Edit `config/themeVars.css`
2. Update CSS variables
3. Reload page

**Create theme:**
```css
/* Add to themeVars.css */
[data-theme="custom"] {
    --ultshop-primary: #YOUR_COLOR;
}
```

## CSS Variable Reference

### Resolution
```css
--ultshop-width: 400px
--ultshop-height: 480px
--ultshop-top-screen-height: 240px
--ultshop-bottom-screen-height: 240px
```

### Colors
```css
--ultshop-primary: #00BCD4
--ultshop-primary-dark: #00838F
--ultshop-accent: #FFEB3B
--ultshop-danger: #D32F2F
--ultshop-text: #000000
--ultshop-text-subtle: #004D40
```

### Paths
```css
--ultshop-assets-base: '/content/apps/ultshop/assets'
--ultshop-images-path: '/content/apps/ultshop/assets/img'
--ultshop-sounds-path: '/content/apps/ultshop/assets/sfx'
```

### Gradients
```css
--ultshop-top-screen-gradient: linear-gradient(...)
--ultshop-bottom-screen-gradient: linear-gradient(...)
```

## Testing

All functionality verified:
- ✅ App loads at 400x480
- ✅ Colors load from CSS
- ✅ Paths load from CSS
- ✅ Gradients work correctly
- ✅ All pages render properly
- ✅ Cart functionality works
- ✅ Checkout completes
- ✅ Build successful

## Compatibility

- ✅ **Backward compatible** - All features preserved
- ✅ **Matches HomeScreen pattern** - Consistent architecture
- ✅ **Theme-ready** - Easy to customize
- ✅ **Production ready** - Build passing

---

**Status**: ✅ Complete  
**Pattern**: HomeScreen-compatible  
**Resolution**: 400x480 (in app.js)  
**Colors**: CSS Variables (themeVars.css)  
**Build**: Passing ✅
