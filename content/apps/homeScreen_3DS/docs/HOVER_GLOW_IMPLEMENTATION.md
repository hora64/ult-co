# Hover Glow Canvas Implementation

## Overview
Replaced the scale-up/down hover animations with a canvas-based glow effect that uses semi-transparent colors to provide visual feedback without changing the icon size.

## Changes Made

### 1. CSS Changes (AppGridUI.js)

#### Removed Scale Transformations
- **App Icons on Hover**: Removed `transform: scale(1.05)` - icons now stay at `scale(1.0)`
- **App Icons Selected**: Removed `transform: scale(1.1)` - selected icons stay at `scale(1.0)`
- **Empty Tiles on Hover**: Removed `transform: scale(1.05)` - tiles stay at `scale(1.0)`
- **Empty Tiles Selected**: Removed `transform: scale(1.1)` - selected tiles stay at `scale(1.0)`

#### Added Hover Glow Styles
```css
.hover-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(0);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    will-change: opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    z-index: 0;
}

.app-icon-container:hover .hover-glow {
    opacity: 1;
}

.app-icon-container.dragging .hover-glow {
    opacity: 0 !important;
}
```

### 2. JavaScript Changes (AppGridRendering.js)

#### Added Hover Glow Canvas to Icons
- Created `renderHoverGlow()` method that draws a radial gradient glow on canvas
- Added hover glow canvas element to each app icon in `createIcon()`
- Added hover glow canvas element to each empty tile in `createEmptyTile()`

#### Hover Glow Rendering
```javascript
renderHoverGlow(canvas, size) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Get hover glow color from CSS variable or use default
    const computedStyle = getComputedStyle(document.documentElement);
    const hoverColor = computedStyle.getPropertyValue('--hover-glow-color').trim() || 'rgba(255, 255, 255, 0.15)';
    
    // Draw circular glow with radial gradient
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
    gradient.addColorStop(0, hoverColor);
    gradient.addColorStop(0.7, hoverColor.replace(/[\d.]+\)$/, '0.05)'));
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}
```

### 3. Theme Integration

Added `--hover-glow-color` CSS variable to theme definitions:

#### Black Theme
```json
"--hover-glow-color": "rgba(255, 255, 255, 0.15)"
```

#### Blue Theme
```json
"--hover-glow-color": "rgba(102, 160, 255, 0.25)"
```

#### Red Theme
```json
"--hover-glow-color": "rgba(255, 102, 102, 0.25)"
```

## Benefits

1. **No Layout Shifts**: Icons maintain their size, preventing layout reflow
2. **Subtle Visual Feedback**: Semi-transparent glow provides clear hover indication
3. **Theme Customizable**: Color can be customized per theme via CSS variables
4. **Performance**: Canvas rendering is efficient and hardware-accelerated
5. **Consistent Behavior**: Works the same way across all icon types (apps and empty tiles)

## Customization

To customize the hover glow color in your theme:

```json
{
  "cssVars": {
    "--hover-glow-color": "rgba(R, G, B, A)"
  }
}
```

Where:
- `R`, `G`, `B` are RGB color values (0-255)
- `A` is alpha/opacity (0.0-1.0, recommended: 0.15-0.30)

Example colors:
- White glow: `rgba(255, 255, 255, 0.15)`
- Blue glow: `rgba(102, 160, 255, 0.25)`
- Red glow: `rgba(255, 102, 102, 0.25)`
- Green glow: `rgba(102, 255, 102, 0.25)`
- Gold glow: `rgba(255, 215, 0, 0.30)`

## Technical Details

### Canvas Size
- Hover glow canvas is 115% of icon size (`iconSize * 1.15`)
- Uses device pixel ratio for sharp rendering on high-DPI displays

### Rendering Strategy
- Radial gradient from center outward
- Inner stop at 50% radius with full color opacity
- Outer stop at 70% radius fades to near-transparent
- Edge at 100% radius is fully transparent

### Performance Considerations
- Canvas is pre-rendered once during icon creation
- No animation or redrawing on hover (just CSS opacity change)
- Hardware-accelerated via GPU compositing
- `will-change: opacity` hint for browser optimization

## Browser Compatibility
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback: If CSS variables not supported, uses default white glow
- Graceful degradation on older browsers
