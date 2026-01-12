# Icon Schema V2 - Quick Reference

## TL;DR
All apps now use **base layer + overlay layer** for consistent rendering and animation support.

## Basic Patterns

### Pattern 1: Simple Icon (Backward Compatible)
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png",
    unopened: false
}
```
→ Icon used for both base and overlay

### Pattern 2: Icon with Background
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png",          // Overlay (70% size)
    backgroundIcon: "/apps/myApp/bg.png",   // Base (100% size)
    unopened: false
}
```
→ Background + icon overlay

### Pattern 3: Animated Icon
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/sprite.png",         // Sprite sheet
    backgroundIcon: "/apps/myApp/bg.png",
    animated: true,
    animationFrames: 8,                      // Frame count
    animationSpeed: 100,                     // MS per frame
    unopened: false
}
```
→ Background + animated icon overlay

### Pattern 4: Wrapped Icon
```javascript
{
    id: "myApp",
    baseIcon: true,
    icon: "/apps/myApp/icon.png",
    backgroundIcon: "/apps/myApp/bg.png",
    unopened: true,                          // Wrapped!
    wrapIcon: "/custom/giftbox.png"         // Optional custom
}
```
→ Background + gift box overlay

## Rendering

### Static Icon
```javascript
await AppIconRenderer.renderIcon(canvas, {
    icon: app.icon,
    baseIcon: app.baseIcon,
    backgroundIcon: app.backgroundIcon,
    unopened: app.unopened,
    width: 64,
    height: 64
});
```

### Animated Icon
```javascript
const stop = AppIconRenderer.renderAnimatedIcon(canvas, {
    icon: app.icon,
    baseIcon: app.baseIcon,
    backgroundIcon: app.backgroundIcon,
    animated: true,
    animationFrames: 8,
    animationSpeed: 100,
    width: 64,
    height: 64
});

// Later: stop();
```

## Property Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | string | required | Main icon (overlay layer) |
| `baseIcon` | boolean | false | Use base+overlay pattern |
| `backgroundIcon` | string | null | Background image (base layer) |
| `unopened` | boolean | false | Show gift box overlay |
| `wrapIcon` | string | null | Custom gift box image |
| `animated` | boolean | false | Enable animation |
| `animationFrames` | number | 1 | Number of frames in sprite |
| `animationSpeed` | number | 100 | Milliseconds per frame |

## Layer Order

```
┌─────────────────────────────┐
│                             │
│   ┌─────────────────┐       │  ← OVERLAY LAYER
│   │                 │       │    - icon (animated)
│   │    OVERLAY      │       │    - OR wrapIcon (gift box)
│   │    70% size     │       │    - Scaled & centered
│   │                 │       │    - Rounded corners
│   └─────────────────┘       │
│                             │
│   BASE LAYER                │  ← BASE LAYER
│   100% size                 │    - backgroundIcon
│   (Static background)       │    - OR icon (fallback)
│                             │    - Full size, static
└─────────────────────────────┘
```

## Common Use Cases

### Use Case: Home Menu Icon
```javascript
{
    id: "homeScreen_3DS",
    baseIcon: true,
    icon: "/apps/homeScreen_3DS/icon.png",
    unopened: false  // Never wrapped!
}
```

### Use Case: Mail App
```javascript
{
    id: "mail",
    baseIcon: false,
    icon: "/apps/mail/envelope.png",
    backgroundIcon: "/apps/mail/mailbox.png",
    unopened: true  // Initially wrapped
}
```

### Use Case: Clock
```javascript
{
    id: "clock",
    baseIcon: true,
    icon: "/apps/clock/hands_sprite.png",
    backgroundIcon: "/apps/clock/face.png",
    animated: true,
    animationFrames: 60,
    animationSpeed: 1000  // 1 second per frame
}
```

### Use Case: Live Notifications
```javascript
{
    id: "messages",
    baseIcon: true,
    icon: "/apps/messages/icon_sprite.png",
    backgroundIcon: "/apps/messages/bg.png",
    animated: true,
    animationFrames: 2,  // Blink effect
    animationSpeed: 500  // 0.5s per frame
}
```

## Sprite Sheet Format

Horizontal sprite sheet:
```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ F1  │ F2  │ F3  │ F4  │ F5  │ F6  │ F7  │ F8  │
│64px │64px │64px │64px │64px │64px │64px │64px │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
Total: 512×64px for 8 frames
```

## Do's and Don'ts

### ✅ DO:
- Use `backgroundIcon` for baseIcon apps
- Design icons at 70% of button size
- Keep base layers simple and static
- Use sprite sheets for animations
- Test at different sizes

### ❌ DON'T:
- Don't animate base layers
- Don't wrap home screen apps
- Don't forget `actualIcon` for wrapped apps
- Don't use huge sprite sheets
- Don't animate everything

## Migration

### Old Config → New Config
```javascript
// Before
{
    icon: "/icon.png",
    baseIcon: true
}

// After (improved)
{
    icon: "/icon.png",              // Overlay
    backgroundIcon: "/bg.png",       // Base
    baseIcon: true
}
```

### Static → Animated
```javascript
// Before
{
    icon: "/icon.png"
}

// After
{
    icon: "/sprite.png",             // Replace with sprite
    animated: true,
    animationFrames: 8,
    animationSpeed: 100
}
```

## Troubleshooting

### Issue: Double gift box
**Cause**: Old rendering code  
**Fix**: Update to Icon Schema V2

### Issue: Icon too large
**Cause**: Not using overlay properly  
**Fix**: Set `baseIcon: true` and use `backgroundIcon`

### Issue: Animation not working
**Cause**: Missing animation properties  
**Fix**: Add `animated: true`, `animationFrames`, `animationSpeed`

### Issue: No background showing
**Cause**: `backgroundIcon` not set  
**Fix**: Provide `backgroundIcon` path

## Performance Tips

1. **Limit animations**: Max 5-10 on screen
2. **Use sprite sheets**: More efficient than GIFs
3. **Pause off-screen**: Stop animations when hidden
4. **Simple base layers**: Keep backgrounds simple
5. **Reasonable frame counts**: 8-12 frames is enough

## File Structure
```
/apps/myApp/
  ├── icon.png              ← Main icon
  ├── background.png        ← Base layer
  ├── sprite_8frames.png    ← Animated sprite
  ├── custom_giftbox.png    ← Custom wrap icon
  └── app.js                ← Configuration
```

## Need More Info?

- **Full Guide**: `ICON_SCHEMA_V2.md`
- **Examples**: `ICON_EXAMPLES.js`
- **Summary**: `ICON_SCHEMA_V2_SUMMARY.md`

---

**Quick Start**: Copy a pattern above → Replace paths → Test!
