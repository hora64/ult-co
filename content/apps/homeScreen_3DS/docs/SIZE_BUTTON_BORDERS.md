# Size Button Border Colors Feature

## Overview
The footer size control buttons (+ and - buttons) now support customizable left and right border colors that can be themed to match your UI design. This creates a 3D beveled effect that makes the buttons appear more tactile and polished.

## Visual Effect
The borders create a subtle 3D effect:
- **Left border**: Lighter color (highlight/light source)
- **Right border**: Darker color (shadow)

This simulates lighting from the left side, giving buttons depth and dimension.

## CSS Variables

### Border Colors

```css
:root {
    /* Left border (highlight) */
    --size-btn-border-left: rgba(255, 255, 255, 0.3);
    
    /* Right border (shadow) */
    --size-btn-border-right: rgba(0, 0, 0, 0.3);
    
    /* Border width */
    --size-btn-border-width: 2px;
}
```

### Hover State Colors

```css
:root {
    /* Left border on hover */
    --size-btn-border-left-hover: rgba(255, 255, 255, 0.5);
    
    /* Right border on hover */
    --size-btn-border-right-hover: rgba(0, 0, 0, 0.5);
}
```

### Active/Pressed State Colors

```css
:root {
    /* Left border when pressed */
    --size-btn-border-left-active: rgba(255, 255, 255, 0.7);
    
    /* Right border when pressed */
    --size-btn-border-right-active: rgba(0, 0, 0, 0.7);
}
```

### Disabled State Colors

```css
:root {
    /* Left border when disabled */
    --size-btn-border-left-disabled: rgba(100, 100, 100, 0.3);
    
    /* Right border when disabled */
    --size-btn-border-right-disabled: rgba(50, 50, 50, 0.3);
}
```

## Theme Examples

### Black Theme (Default)
Creates a subtle monochrome 3D effect:

```css
--size-btn-border-left: rgba(255, 255, 255, 0.3);
--size-btn-border-right: rgba(0, 0, 0, 0.5);
--size-btn-border-left-hover: rgba(255, 255, 255, 0.5);
--size-btn-border-right-hover: rgba(0, 0, 0, 0.7);
--size-btn-border-left-active: rgba(255, 255, 255, 0.7);
--size-btn-border-right-active: rgba(0, 0, 0, 0.9);
```

### Blue Theme
Uses blue-tinted colors for a cohesive look:

```css
--size-btn-border-left: rgba(150, 200, 255, 0.4);
--size-btn-border-right: rgba(20, 60, 120, 0.4);
--size-btn-border-left-hover: rgba(150, 200, 255, 0.6);
--size-btn-border-right-hover: rgba(20, 60, 120, 0.6);
--size-btn-border-left-active: rgba(180, 220, 255, 0.8);
--size-btn-border-right-active: rgba(40, 80, 150, 0.8);
```

### Red Theme
Uses red-tinted colors:

```css
--size-btn-border-left: rgba(255, 150, 150, 0.4);
--size-btn-border-right: rgba(120, 20, 20, 0.4);
--size-btn-border-left-hover: rgba(255, 150, 150, 0.6);
--size-btn-border-right-hover: rgba(120, 20, 20, 0.6);
--size-btn-border-left-active: rgba(255, 180, 180, 0.8);
--size-btn-border-right-active: rgba(150, 40, 40, 0.8);
```

## Customization Tips

### 1. Match Your Theme Colors
Use tinted versions of your theme's primary color:
```css
/* For a green theme */
--size-btn-border-left: rgba(150, 255, 150, 0.4);
--size-btn-border-right: rgba(20, 120, 20, 0.4);
```

### 2. Adjust Border Width
Change the thickness of the borders:
```css
/* Thicker borders */
--size-btn-border-width: 3px;

/* Thinner borders */
--size-btn-border-width: 1px;
```

### 3. Opacity Control
Adjust transparency for subtle or bold effects:
```css
/* Subtle borders */
--size-btn-border-left: rgba(255, 255, 255, 0.2);
--size-btn-border-right: rgba(0, 0, 0, 0.2);

/* Bold borders */
--size-btn-border-left: rgba(255, 255, 255, 0.6);
--size-btn-border-right: rgba(0, 0, 0, 0.6);
```

### 4. Remove Borders
Set opacity to 0 or use transparent:
```css
--size-btn-border-left: transparent;
--size-btn-border-right: transparent;
```

### 5. Invert Light Direction
For a different lighting effect, swap the colors:
```css
/* Light from right instead of left */
--size-btn-border-left: rgba(0, 0, 0, 0.3);
--size-btn-border-right: rgba(255, 255, 255, 0.3);
```

## Visual States

### Normal State
```
┌────────────────┐
│░ [+] Button   █│  ← Left: light, Right: dark
└────────────────┘
```

### Hover State
Borders become more prominent:
```
┌────────────────┐
│░░ [+] Button  ██│  ← Borders intensify
└────────────────┘
```

### Active/Pressed State
Borders reach maximum intensity:
```
┌────────────────┐
│░░░ [+] Button ███│  ← Maximum border contrast
└────────────────┘
```

### Disabled State
Borders become muted and desaturated:
```
┌────────────────┐
│▒ [+] Button   ▓│  ← Gray, low contrast
└────────────────┘
```

## Integration in Theme Definitions

Add to your theme's `cssVars` object in the theme definition JSON:

```json
{
  "cssVars": {
    "--size-btn-border-left": "rgba(255, 255, 255, 0.3)",
    "--size-btn-border-right": "rgba(0, 0, 0, 0.3)",
    "--size-btn-border-left-hover": "rgba(255, 255, 255, 0.5)",
    "--size-btn-border-right-hover": "rgba(0, 0, 0, 0.5)",
    "--size-btn-border-left-active": "rgba(255, 255, 255, 0.7)",
    "--size-btn-border-right-active": "rgba(0, 0, 0, 0.7)",
    "--size-btn-border-width": "2px"
  }
}
```

## Design Principles

### 1. Consistency
Keep the same border style across all footer buttons for visual consistency.

### 2. Contrast
Ensure sufficient contrast between left and right borders to create the 3D effect.

### 3. Theme Harmony
Match border colors to your theme's color palette for a cohesive design.

### 4. Accessibility
Don't rely solely on borders for button state indication - the button sprites already provide clear visual feedback.

### 5. Subtlety
Start with subtle borders and increase intensity only if needed. Over-pronounced borders can look dated.

## Browser Compatibility
- All modern browsers support RGBA colors
- Border styling is CSS2.1 standard (universal support)
- CSS variables fallback to default values if not supported
- No JavaScript required

## Performance
- Pure CSS implementation
- No runtime calculations
- Hardware accelerated by browser
- Minimal rendering overhead

## Accessibility
- Borders provide additional visual cues for button boundaries
- Enhances tactile appearance for better UX
- Disabled state borders help indicate non-interactive elements
- Works with screen readers (buttons remain semantic HTML)

## Future Enhancements
Potential additions:
- Top/bottom borders for complete 3D bevel
- Gradient borders for smoother transitions
- Animated border color transitions
- Per-button border customization
- Border radius adjustments
