# PixelatedDotLoader - Visual Reference

## What It Looks Like

```
     ●        ← Brightest (yellow) - Current dot
   ●   ●      ← Medium-bright - Adjacent dots (±1)
  ●     ●     ← Light - Nearby dots (±2)
   ●   ●      ← Base color - Distant dots (±3+)
     ●        

All dots have white pixel outlines
Dots rotate clockwise every 80ms
```

## Animation States

### 1. Entrance
```
Spinner appears instantly at center
Dots start rotating immediately
Colors cycle smoothly
```

### 2. Active State
```
8 dots in circular formation
Rotating color gradient effect
White pixel outlines for definition
Smooth 60fps animation
```

### 3. Exit (Zoom)
```
Step 1: Dots expand outward (radius +50%)
Step 2: Dots shrink (scale to 0)
Step 3: Fade to transparent
Duration: 300ms
```

## Color Gradient Example

For primary color `#007bff` (blue):
```
Dot #0 (current):  #90c9ff  (brightest)
Dot ±1:            #60aaff  (medium-bright)
Dot ±2:            #3095ff  (light)
Dot ±3+:           #007bff  (base)
```

## Size Comparison

### Actual Display Size
```
Total size: ~80px × 80px
Dot circle radius: 16px × 8 = 128px (on screen)
Individual dot size: 8px × 8 = 64px (on screen)
```

### Internal Canvas Resolution
```
Canvas width: 10px (low-res)
Canvas height: 10px (low-res)
Pixelation scale: 8x
Final display: 80px × 80px
```

## Positioning

```
┌─────────────────────────────┐
│      Bottom Screen          │
│                             │
│           ● ● ●             │  ← Centered
│          ●     ●            │     horizontally
│           ● ● ●             │     and vertically
│                             │
│                             │
└─────────────────────────────┘
```

## Technical Specs

```
Dot Count:        8
Circle Radius:    16px (base) × 8 (scale) = 128px display
Dot Size:         8px (base) × 8 (scale) = 64px display
Rotation Speed:   80ms per dot
Pixelation:       8× (retro blocky style)
Frame Rate:       60fps (smooth)
Exit Duration:    300ms
```

## Color Gradient Pattern

```
Frame 1:  [●][ ][ ][ ][ ][ ][ ][ ]  ← Yellow (brightest)
Frame 2:  [ ][●][ ][ ][ ][ ][ ][ ]  ← Rotation advances
Frame 3:  [ ][ ][●][ ][ ][ ][ ][ ]
Frame 4:  [ ][ ][ ][●][ ][ ][ ][ ]
...and so on

Colors follow the highlighted dot:
  Current (●): colors[3] - Brightest yellow
  Next ±1:     colors[2] - Medium-bright
  Next ±2:     colors[1] - Light
  Rest:        colors[0] - Base color
```

## White Outline Detail

```
Each dot has a 1px white stroke:
  ╔═══╗
  ║ ● ║  ← White border
  ╚═══╝    (1px on low-res canvas)

This provides visual definition and
separates dots from background
```

## Exit Animation Sequence

```
Time:  0ms     100ms    200ms    300ms
       ─────────────────────────────→
       
Radius: [■■■■] [■■■■■■] [■■■■■■■] [■■■■■■■■]
                                   (150% of original)

Dots:   [●●●●] [●●●●]   [●●]      [·]
                                   (scale to 0)

Opacity: 100%   75%      50%       0%
```

## Integration Points

```javascript
// Show loader
app.showLoading();
  ↓
  Creates PixelatedDotLoader
  ↓
  Starts rotation animation
  ↓
  Color gradient cycles

// Hide loader  
app.hideLoading();
  ↓
  Triggers zoom exit animation
  ↓
  Dots expand and shrink
  ↓
  Fades to transparent
  ↓
  Destroyed after 400ms
```

## Quick Setup

```javascript
import { PixelatedDotLoader } from '/content/common/utils/LoadingCircle.js';

// Create spinner
const spinner = PixelatedDotLoader.createSpinner({
    colorGradient: ['#ff8000', '#ff9900', '#ffcc00', '#ffff00']
});

// Stop with zoom animation
spinner.stop('zoom');

// Clean up
setTimeout(() => spinner.destroy(), 400);
```

---

**Perfect for**: Retro-style apps, pixel art interfaces, Nintendo DS-inspired UIs
**Performance**: Excellent (60fps, low memory)
**Browser Support**: All modern browsers
