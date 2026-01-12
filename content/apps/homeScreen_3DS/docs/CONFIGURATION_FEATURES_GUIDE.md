# Configuration Features Guide - HomeScreen 3DS

This guide covers the new configuration-based features for HomeScreen 3DS.

## 1. Coordinate Spawns (Respects User Positions)

### Overview
Define specific spawn positions for apps in the grid, but **only on initial layout creation**. User-arranged positions always take priority.

### Configuration

Edit `content/apps/homeScreen_3DS/config/config.js`:

```javascript
export const gridConfig = {
    totalTileSpaces: 240,
    baseRows: 6,
    
    // App coordinate spawns - define specific positions for apps
    // NOTE: Only applies to INITIAL layout creation
    // User-arranged positions take priority and will NOT be overridden
    coordinateSpawns: {
        "info": { row: 0, col: 0 },      // Info app at top-left (first load only)
        "mail": { row: 1, col: 0 },      // Mail app below info
        "settings": { row: 2, col: 0 },  // Settings below mail
    },
    
    // Whether to respect coordinate spawns after initial layout
    // When false (default), spawns only apply on first grid creation
    // When true, spawns override user positions (not recommended)
    overrideUserPositions: false
};
```

### Behavior

**First Load (No Saved Layout):**
- Coordinate spawns are applied
- Apps with spawns placed at specified positions
- Remaining apps fill in order

**Subsequent Loads (Saved Layout Exists):**
- User-arranged layout is loaded from localStorage
- Coordinate spawns are **ignored**
- User positions are **preserved**

**Adding New Apps:**
- New apps are integrated into existing layout
- New apps do NOT use coordinate spawns
- Fills empty spaces or adds new columns

### Example Use Cases

#### System Apps in Fixed Positions (First Load Only)
```javascript
coordinateSpawns: {
    "info": { row: 0, col: 0 },
    "mail": { row: 1, col: 0 },
    "settings": { row: 2, col: 0 }
}
```

#### Grouped by Category
```javascript
coordinateSpawns: {
    // Communication (column 0)
    "mail": { row: 0, col: 0 },
    "chat": { row: 1, col: 0 },
    
    // Entertainment (column 1)
    "music": { row: 0, col: 1 },
    "video": { row: 1, col: 1 }
}
```

### Important Notes

1. **User positions always win** - Once user rearranges apps, spawns are ignored
2. **Spawns only apply on first load** - When no saved layout exists
3. **Safe to configure** - Won't break existing user layouts
4. **Recommended setting**: `overrideUserPositions: false`

---

## 2. Selector Z-Index Configuration

### Overview
Control whether the selector glow appears **behind** or **in front** of app icons.

### CSS Configuration

Edit your theme CSS or use CSS variables:

```css
:root {
    /* Selector z-position: 'behind' or 'infront' */
    --selector-z-position: behind;
    
    /* Z-index values */
    --selector-z-index-behind: 0;
    --selector-z-index-infront: 10;
}
```

### Options

#### Behind (Default)
```css
--selector-z-position: behind;
```
- Selector appears behind app icon
- Standard 3DS look
- Icon is fully visible

#### In Front
```css
--selector-z-position: infront;
```
- Selector appears in front of app icon
- Glow overlays icon
- More prominent selection indicator

### Custom Z-Index Values

```css
/* Fine-tune layering */
--selector-z-index-behind: -1;   /* Further behind */
--selector-z-index-infront: 100; /* Way in front */
```

### Per-Theme Configuration

**Black Theme (default):**
```css
--selector-z-position: behind;
--selector-z-index-behind: 0;
```

**Blue Theme (more prominent):**
```css
--selector-z-position: infront;
--selector-z-index-infront: 10;
```

### Use Cases

1. **Standard look** - Selector behind icon (`behind`)
2. **High contrast** - Selector in front for better visibility (`infront`)
3. **Custom themes** - Match your theme's visual style
4. **Accessibility** - In front mode for better selection visibility

---

## 3. Empty Tile Sprite Support

### Overview
Use a custom sprite image for empty tiles instead of the default drawn tile.

### Configuration

**CSS Variables:**
```css
:root {
    /* Path to empty tile sprite (128x128px recommended) */
    --empty-tile-sprite: url('/content/apps/homeScreen_3DS/assets/themes/blackTheme/emptytile_128px.png');
    
    /* Enable sprite mode */
    --empty-tile-use-sprite: true;
}
```

### Default Behavior (Drawn Tile)

```css
--empty-tile-use-sprite: false;
```

- Empty tiles are drawn on canvas
- Uses CSS color variables
- Customizable colors:
  - `--empty-tile-color`
  - `--empty-tile-border`
  - `--empty-tile-hover-color`

### Sprite Mode

```css
--empty-tile-use-sprite: true;
--empty-tile-sprite: url('/path/to/sprite.png');
```

- Loads sprite image
- Scales to tile size
- Falls back to drawn tile if sprite fails

### Creating Empty Tile Sprites

**Recommended Specifications:**
- **Size**: 128×128px
- **Format**: PNG with transparency
- **Style**: Match your theme
- **Content**: Simple geometric shape or icon

**Example Sprites:**
1. **Dot** - Small centered dot
2. **Plus** - Plus icon for "add folder"
3. **Grid** - Grid pattern
4. **Empty Box** - Outline of empty box
5. **Themed Icon** - Custom icon matching theme

### Per-Theme Sprites

**Black Theme:**
```css
--empty-tile-sprite: url('/content/apps/homeScreen_3DS/assets/themes/blackTheme/emptytile_128px.png');
--empty-tile-use-sprite: true;
```

**Blue Theme:**
```css
--empty-tile-sprite: url('/content/apps/homeScreen_3DS/assets/themes/blueTheme/emptytile_128px.png');
--empty-tile-use-sprite: true;
```

### Fallback Behavior

If sprite fails to load:
1. Console warning is logged
2. Falls back to drawn tile
3. Uses color CSS variables
4. No visual errors

---

## 4. Action Bar Color Override

### Overview
Customize the appearance of the bottom action bar (container for Open/Manual buttons).

### CSS Configuration

```css
:root {
    /* Action bar background */
    --action-bar-bg: transparent;
    
    /* Action bar border */
    --action-bar-border: transparent;
    
    /* Enable gradient background */
    --action-bar-gradient-enabled: false;
    
    /* Gradient colors (if enabled) */
    --action-bar-gradient-start: rgba(0, 0, 0, 0.2);
    --action-bar-gradient-end: rgba(0, 0, 0, 0.1);
}
```

### Examples

#### Transparent (Default)
```css
--action-bar-bg: transparent;
--action-bar-border: transparent;
--action-bar-gradient-enabled: false;
```

#### Solid Background
```css
--action-bar-bg: rgba(0, 0, 0, 0.3);
--action-bar-border: 1px solid rgba(255, 255, 255, 0.1);
```

#### Gradient Background
```css
--action-bar-gradient-enabled: true;
--action-bar-gradient-start: rgba(0, 0, 0, 0.4);
--action-bar-gradient-end: rgba(0, 0, 0, 0.1);
```

#### Themed Bar
```css
/* Dark theme */
--action-bar-bg: rgba(20, 20, 20, 0.8);
--action-bar-border: 1px solid rgba(255, 255, 255, 0.2);

/* Light theme */
--action-bar-bg: rgba(240, 240, 240, 0.8);
--action-bar-border: 1px solid rgba(0, 0, 0, 0.1);

/* Blue theme */
--action-bar-gradient-enabled: true;
--action-bar-gradient-start: rgba(0, 100, 200, 0.3);
--action-bar-gradient-end: rgba(0, 50, 150, 0.2);
```

### Per-App Button Colors

Apps can still override individual button colors via `actionButtonColors`:

```javascript
// In app.js
"actionButtonColors": {
    "backgroundColor": "rgba(138, 43, 226, 0.3)",
    "hoverBackgroundColor": "rgba(138, 43, 226, 0.5)",
    "pressedBackgroundColor": "rgba(138, 43, 226, 0.7)"
}
```

This overrides the buttons themselves, not the action bar container.

### Difference: Bar vs Buttons

**Action Bar (Container):**
- Background behind buttons
- Border around entire action area
- Gradient across whole bar
- Set via CSS variables

**Action Buttons (Open/Manual):**
- Individual button colors
- Per-app customization
- Set via `actionButtonColors` in app.js

### Use Cases

1. **Subtle bar** - Transparent with slight gradient
2. **Prominent bar** - Solid background for emphasis
3. **Themed bar** - Match theme colors
4. **Bordered bar** - Separate from grid visually
5. **Glassmorphic** - Blurred background effect

---

## Complete Configuration Example

```javascript
// config.js
export const gridConfig = {
    totalTileSpaces: 240,
    baseRows: 6,
    coordinateSpawns: {
        "info": { row: 0, col: 0 },
        "mail": { row: 1, col: 0 },
        "settings": { row: 2, col: 0 }
    },
    overrideUserPositions: false // Respect user layout
};

export const selectorConfig = {
    zPosition: 'behind',
    zIndexBehind: 0,
    zIndexInfront: 10
};

export const actionBarConfig = {
    defaultColors: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        pressedBackgroundColor: 'rgba(255, 255, 255, 0.3)',
        textColor: 'white'
    },
    barBackgroundColor: 'rgba(0, 0, 0, 0.2)',
    enableGradient: true,
    gradientColors: {
        start: 'rgba(0, 0, 0, 0.3)',
        end: 'rgba(0, 0, 0, 0.1)'
    }
};
```

```css
/* styles.css or theme CSS */
:root {
    /* Selector */
    --selector-z-position: behind;
    --selector-z-index-behind: 0;
    --selector-z-index-infront: 10;
    
    /* Empty Tiles */
    --empty-tile-sprite: url('/content/apps/homeScreen_3DS/assets/themes/blackTheme/emptytile_128px.png');
    --empty-tile-use-sprite: true;
    
    /* Action Bar */
    --action-bar-bg: rgba(0, 0, 0, 0.2);
    --action-bar-border: 1px solid rgba(255, 255, 255, 0.1);
    --action-bar-gradient-enabled: true;
    --action-bar-gradient-start: rgba(0, 0, 0, 0.3);
    --action-bar-gradient-end: rgba(0, 0, 0, 0.1);
}
```

---

## Testing Checklist

### Coordinate Spawns
- [ ] Set coordinate spawns in config.js
- [ ] Clear localStorage (`localStorage.clear()`)
- [ ] Reload page - apps should appear at spawn positions
- [ ] Rearrange an app manually
- [ ] Reload page - manual arrangement should persist
- [ ] Verify spawns don't override user layout

### Selector Z-Index
- [ ] Set `--selector-z-position: behind`
- [ ] Select app - glow behind icon
- [ ] Set `--selector-z-position: infront`
- [ ] Select app - glow in front of icon
- [ ] Test with different themes

### Empty Tile Sprite
- [ ] Create 128×128px empty tile sprite
- [ ] Set `--empty-tile-sprite` path
- [ ] Set `--empty-tile-use-sprite: true`
- [ ] Reload page - sprite should appear
- [ ] Test sprite loading failure (bad path)
- [ ] Verify fallback to drawn tile

### Action Bar Colors
- [ ] Set `--action-bar-bg`
- [ ] Reload page - bar background visible
- [ ] Enable gradient with `--action-bar-gradient-enabled: true`
- [ ] Verify gradient renders
- [ ] Test with different themes
- [ ] Verify per-app button colors still work

---

## Troubleshooting

### Coordinate Spawns Not Working
1. Check if saved layout exists (`localStorage.getItem('appGridLayout2D')`)
2. Clear layout: `localStorage.removeItem('appGridLayout2D')`
3. Reload page to apply spawns
4. Verify `overrideUserPositions: false` in config

### Selector Not Changing Position
1. Verify CSS variable syntax: `behind` or `infront`
2. Check browser DevTools for CSS variable value
3. Clear cache and reload
4. Inspect element - check z-index value

### Empty Tile Sprite Not Loading
1. Check console for 404 errors
2. Verify sprite path is correct
3. Check sprite file exists
4. Verify `--empty-tile-use-sprite: true`
5. Check sprite is 128×128px (recommended)

### Action Bar Colors Not Applying
1. Check CSS variable syntax
2. Inspect element with DevTools
3. Verify gradient syntax if using gradients
4. Clear browser cache
5. Check for CSS conflicts

---

## Summary

| Feature | Configuration | Default |
|---------|--------------|---------|
| **Coordinate Spawns** | `gridConfig.coordinateSpawns` | Empty object |
| **User Position Override** | `gridConfig.overrideUserPositions` | `false` |
| **Selector Z-Position** | `--selector-z-position` | `behind` |
| **Empty Tile Sprite** | `--empty-tile-use-sprite` | `false` |
| **Action Bar Background** | `--action-bar-bg` | `transparent` |
| **Action Bar Gradient** | `--action-bar-gradient-enabled` | `false` |

---

## Status

✅ **Coordinate Spawns** - Implemented with user position protection  
✅ **Selector Z-Index** - CSS variable configuration  
✅ **Empty Tile Sprite** - Sprite support with fallback  
✅ **Action Bar Colors** - Full customization support  

All features are production-ready and backward compatible.

---

**Version:** 3.0.0  
**Last Updated:** 2024  
**Build Status:** ✅ Success
