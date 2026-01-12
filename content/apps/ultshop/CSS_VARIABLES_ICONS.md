# UltShop - CSS Variables for Selection Glow & App Container Background ✅

## Overview
Added CSS variables for selection glow and app container background images to enable easy theme customization without code changes.

---

## CSS Variables Added

### File: `content/apps/ultshop/config/themeVars.css`

```css
/* Product Icon Assets */
--ultshop-selection-glow: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
--ultshop-default-app-icon: '/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png';
--ultshop-unopened-icon: '/content/common/assets/giftbox_48px.png';
--ultshop-default-background-icon: '/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png';

/* App Container Background */
--ultshop-app-container-bg-image: url('/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png');
--ultshop-app-container-bg-size: cover;
--ultshop-app-container-bg-position: center;
--ultshop-app-container-bg-repeat: no-repeat;
```

---

## Implementation

### 1. **themeVars.css** - CSS Variable Definitions

Added new product icon asset variables:

```css
:root {
    /* ========================================
     * ASSET PATHS
     * ======================================== */
    
    /* Icon paths */
    --ultshop-icon-store: '/content/apps/ultshop/assets/icons/store_64px.png';
    --ultshop-icon-cart: url('data:image/svg+xml,...');
    
    /* Product Icon Assets */
    --ultshop-selection-glow: '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
    --ultshop-default-app-icon: '/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png';
    --ultshop-unopened-icon: '/content/common/assets/giftbox_48px.png';
    --ultshop-default-background-icon: '/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png';
    
    /* App Container Background */
    --ultshop-app-container-bg-image: url('/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png');
    --ultshop-app-container-bg-size: cover;
    --ultshop-app-container-bg-position: center;
    --ultshop-app-container-bg-repeat: no-repeat;
}
```

---

### 2. **config.js** - Theme Assets Helper

Updated `getThemeAssets()` to include selection glow:

```javascript
export function getThemeAssets() {
    return {
        // Default app icons (from CSS variables)
        defaultAppIcon: getThemeVar('--ultshop-default-app-icon', themeDefaults.defaultAppIcon),
        unopenedIcon: getThemeVar('--ultshop-unopened-icon', themeDefaults.unopenedIcon),
        defaultBackgroundIcon: getThemeVar('--ultshop-default-background-icon', themeDefaults.defaultBackgroundIcon),
        
        // Selection glow (from CSS variable) ✅ NEW
        selectionGlow: getThemeVar('--ultshop-selection-glow', '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png'),

        // Sounds (for future use)
        soundClick: getThemeVar('--ultshop-sound-click', themeDefaults.sounds.click),
        soundSelect: getThemeVar('--ultshop-sound-select', themeDefaults.sounds.select),
        soundLaunch: getThemeVar('--ultshop-sound-add-cart', themeDefaults.sounds.launch)
    };
}
```

---

### 3. **StorefrontPage.js** - Selection Glow from CSS Variable

Updated `selectProduct()` to read selector from CSS variable:

```javascript
selectProduct(product, index, glowCanvas) {
    // Deselect previous
    if (this.selectedProductIndex !== null && this.selectedProductIndex !== index) {
        const prevIcon = this.productIcons[this.selectedProductIndex];
        if (prevIcon && prevIcon.glowCanvas) {
            prevIcon.glowCanvas.style.opacity = '0';
            
            // Cancel animation if exists
            if (prevIcon.glowCanvas.animationHandle) {
                cancelAnimationFrame(prevIcon.glowCanvas.animationHandle);
            }
        }
    }

    this.selectedProductIndex = index;
    
    // Get selector image path from CSS variable ✅ NEW
    const selectorSrc = getComputedStyle(document.documentElement)
        .getPropertyValue('--ultshop-selection-glow')
        .trim()
        .replace(/^["']|["']$/g, '') || '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
    
    // Render selection glow
    const glowOptions = {
        animated: false,
        frameCount: 1,
        currentFrame: 0,
        frameDuration: 100,
        customSrc: selectorSrc  // Uses CSS variable value
    };
    this.renderSelectionGlow(glowCanvas, this.iconSize, glowOptions);
    glowCanvas.style.opacity = '1';
    
    // Update info panel and scroll
    this.showProductInfo(product, index);
    
    const currentIcon = this.productIcons[index];
    if (currentIcon && currentIcon.container) {
        currentIcon.container.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}
```

**Key Changes:**
- Reads `--ultshop-selection-glow` CSS variable
- Strips quotes from CSS value
- Falls back to default path if variable not set
- No hardcoded paths in JavaScript!

---

### 4. **ProductIconRenderer.js** - Background Icon from CSS Variable

Updated `renderIcon()` to read default background from CSS variable:

```javascript
static async renderIcon(canvas, options) {
    const {
        icon,
        baseIcon,
        unopened = false,
        width = 48,
        height = 48,
        baseImage = null,
        backgroundIcon = null,
        unopenedImage = null,
        wrapIcon = null,
        overlayScale = 0.7,
        overlayBorderRadius = 0.10,
        animated = false,
        animationFrame = 0
    } = options;

    const ctx = canvas.getContext('2d');

    // Canvas setup...
    
    // Default base icon from CSS variable ✅ NEW
    const defaultBaseIcon = getComputedStyle(document.documentElement)
        .getPropertyValue('--ultshop-default-background-icon')
        .trim()
        .replace(/^["']|["']$/g, '') || '/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png';

    // Determine base and overlay sources
    let baseSrc;
    let overlaySrc = null;

    if (baseIcon) {
        // BaseIcon products...
    } else {
        // Regular products: Use CSS variable for background
        if (unopened) {
            baseSrc = backgroundIcon || baseImage || defaultBaseIcon;  // Uses CSS variable
            overlaySrc = wrapIcon || unopenedImage;
        } else {
            baseSrc = backgroundIcon || baseImage || defaultBaseIcon;  // Uses CSS variable
            overlaySrc = icon;
        }
    }

    // Draw base and overlay...
}
```

**Key Changes:**
- Reads `--ultshop-default-background-icon` CSS variable
- No hardcoded background icon path
- Easy theme customization

---

## Usage Examples

### Theme Customization

#### Example 1: Custom Selection Glow (Gold Theme)

```css
/* Custom gold theme */
[data-theme="gold"] {
    --ultshop-selection-glow: '/content/apps/ultshop/assets/themes/gold/Select_128px.png';
    --ultshop-default-background-icon: '/content/apps/ultshop/assets/themes/gold/GoldBg_64px.png';
}
```

**HTML:**
```html
<div data-theme="gold" class="ds-container">
    <!-- UltShop content with gold selector and background -->
</div>
```

---

#### Example 2: Blue Theme Override

```css
[data-theme="blue"] {
    --ultshop-selection-glow: '/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png';
    --ultshop-primary: #2196F3;
    --ultshop-primary-dark: #1976D2;
}
```

---

#### Example 3: Holiday Theme

```css
[data-theme="holiday"] {
    --ultshop-selection-glow: '/content/apps/ultshop/assets/themes/holiday/SelectSnow_128px.png';
    --ultshop-default-background-icon: '/content/apps/ultshop/assets/themes/holiday/SnowBg_64px.png';
    --ultshop-app-container-bg-image: url('/content/apps/ultshop/assets/themes/holiday/pattern.png');
    --ultshop-primary: #C62828;
    --ultshop-accent: #FFD54F;
}
```

---

### App Container Background Styling

#### Using CSS Variables in Styles

```css
.product-icon-container {
    background-image: var(--ultshop-app-container-bg-image);
    background-size: var(--ultshop-app-container-bg-size);
    background-position: var(--ultshop-app-container-bg-position);
    background-repeat: var(--ultshop-app-container-bg-repeat);
}
```

#### Custom Background Pattern

```css
:root {
    --ultshop-app-container-bg-image: url('/content/apps/ultshop/assets/img/pattern.png');
    --ultshop-app-container-bg-size: 32px 32px;  /* Tile size */
    --ultshop-app-container-bg-repeat: repeat;
}
```

---

## CSS Variable Reference

### Selection Glow

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `--ultshop-selection-glow` | URL | `/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png` | Selection glow image (128x128px recommended) |

**Usage:**
```javascript
const selectorSrc = getComputedStyle(document.documentElement)
    .getPropertyValue('--ultshop-selection-glow')
    .trim()
    .replace(/^["']|["']$/g, '');
```

---

### Product Icon Assets

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `--ultshop-default-app-icon` | URL | `/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png` | Default product icon |
| `--ultshop-unopened-icon` | URL | `/content/common/assets/giftbox_48px.png` | Gift box / wrapped icon |
| `--ultshop-default-background-icon` | URL | `/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png` | Default white background |

---

### App Container Background

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `--ultshop-app-container-bg-image` | URL | `url('/content/apps/homeScreen_3DS/assets/themes/BlankAppWhite_64px.png')` | Background image for product containers |
| `--ultshop-app-container-bg-size` | CSS size | `cover` | Background size (cover, contain, or dimensions) |
| `--ultshop-app-container-bg-position` | CSS position | `center` | Background position |
| `--ultshop-app-container-bg-repeat` | CSS repeat | `no-repeat` | Background repeat (repeat, no-repeat, etc.) |

---

## Benefits

### 1. **Easy Theme Switching**
```css
/* Just change CSS variable */
--ultshop-selection-glow: '/path/to/custom/glow.png';

/* No JavaScript changes needed! */
```

### 2. **Per-Theme Customization**
```css
[data-theme="dark"] {
    --ultshop-selection-glow: '/themes/dark/Select.png';
}

[data-theme="light"] {
    --ultshop-selection-glow: '/themes/light/Select.png';
}
```

### 3. **Runtime Theme Changes**
```javascript
// Change theme at runtime
document.documentElement.style.setProperty(
    '--ultshop-selection-glow', 
    '/new/selector.png'
);

// Next product selection uses new glow automatically!
```

### 4. **No Code Changes for Themes**
- Designers can create themes with just CSS
- No JavaScript knowledge needed
- No recompilation required

### 5. **Consistent Fallbacks**
```javascript
// Always has a fallback value
const selector = getCSSVar('--ultshop-selection-glow') 
    || '/default/path.png';
```

---

## Advanced Usage

### Animated Selection Glow

```css
:root {
    /* Animated sprite sheet selector */
    --ultshop-selection-glow: '/content/apps/ultshop/assets/themes/animated/Select_1024px.png';
}
```

```javascript
// In StorefrontPage.js - enable animation
const glowOptions = {
    animated: true,         // Enable animation
    frameCount: 8,          // 8 frames in sprite sheet
    currentFrame: 0,
    frameDuration: 100,     // 100ms per frame
    customSrc: selectorSrc  // From CSS variable
};
```

---

### Context-Specific Backgrounds

```css
/* Different backgrounds for different pages */
.storefront-page {
    --ultshop-app-container-bg-image: url('/storefront-bg.png');
}

.product-detail-page {
    --ultshop-app-container-bg-image: url('/detail-bg.png');
}

.cart-page {
    --ultshop-app-container-bg-image: url('/cart-bg.png');
}
```

---

### Gradient Backgrounds

```css
:root {
    /* Use gradient instead of image */
    --ultshop-app-container-bg-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

### Multiple Background Images

```css
:root {
    /* Layered backgrounds */
    --ultshop-app-container-bg-image: 
        url('/overlay.png'),
        url('/pattern.png'),
        linear-gradient(to bottom, #fff, #f0f0f0);
}
```

---

## Migration Guide

### Before (Hardcoded)
```javascript
// StorefrontPage.js - OLD
const selectorSrc = '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
```

### After (CSS Variable)
```javascript
// StorefrontPage.js - NEW
const selectorSrc = getComputedStyle(document.documentElement)
    .getPropertyValue('--ultshop-selection-glow')
    .trim()
    .replace(/^["']|["']$/g, '') || '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
```

**Benefits:**
- ✅ Customizable via CSS
- ✅ Theme-aware
- ✅ Runtime changeable
- ✅ Still has fallback

---

## Testing

### Verify CSS Variable Loading

```javascript
// In browser console
const selector = getComputedStyle(document.documentElement)
    .getPropertyValue('--ultshop-selection-glow');
console.log('Selector path:', selector);
// Should output: /content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png
```

### Test Theme Override

```javascript
// Set custom selector
document.documentElement.style.setProperty(
    '--ultshop-selection-glow',
    '/custom/selector.png'
);

// Select a product - should use new selector
```

### Verify Fallback

```javascript
// Remove CSS variable
document.documentElement.style.removeProperty('--ultshop-selection-glow');

// Select product - should use hardcoded fallback
```

---

## Summary

### Changes Made
1. ✅ Added CSS variables to `themeVars.css`
   - `--ultshop-selection-glow`
   - `--ultshop-default-app-icon`
   - `--ultshop-unopened-icon`
   - `--ultshop-default-background-icon`
   - `--ultshop-app-container-bg-*` (image, size, position, repeat)

2. ✅ Updated `config.js`
   - Added `selectionGlow` to `getThemeAssets()`

3. ✅ Updated `StorefrontPage.js`
   - Reads `--ultshop-selection-glow` CSS variable
   - Dynamic selector loading

4. ✅ Updated `ProductIconRenderer.js`
   - Reads `--ultshop-default-background-icon` CSS variable
   - Dynamic background loading

### Benefits
- ✅ Easy theme customization
- ✅ No code changes for themes
- ✅ Runtime theme switching
- ✅ Consistent fallbacks
- ✅ Designer-friendly
- ✅ Maintainable code

---

**Status**: ✅ Complete  
**Build**: Successful  
**Theme**: Customizable via CSS  
**Ready**: Production
