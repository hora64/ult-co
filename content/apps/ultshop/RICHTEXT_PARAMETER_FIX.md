# UltShop - RichText Parameter Type Fix ✅

## Error Fixed

```
RichTextRenderer.js:422 Uncaught (in promise) TypeError: baseFont.indexOf is not a function
    at RichTextRenderer.renderInlineFormattedText (RichTextRenderer.js:422:56)
    at StorefrontPage.showProductInfo (StorefrontPage.js:614:35)
```

---

## Problem

The `renderInlineFormattedText` method expects a **font string** as the `baseFont` parameter, but a **number** was being passed instead.

### Incorrect Call (Line 614)
```javascript
this.app.richTextRenderer.renderInlineFormattedText(
    priceCtx,
    priceTokens.tokens,
    142,  // x
    12,   // y
    16,   // ❌ WRONG: fontSize as number
    this.app.colors.textLight,
    268,
    1,
    false,
    0,
    true,  // ❌ Extra parameters that don't exist
    this.app.font.family
);
```

### Method Signature
```javascript
renderInlineFormattedText(
    ctx,              // CanvasRenderingContext2D
    tokens,           // Array<token>
    x,                // number
    y,                // number
    baseFont,         // ✅ string (e.g., 'bold 16px Rodin')
    baseColor,        // string (e.g., '#FFFFFF')
    maxWidth,         // number
    lineSpacingFactor,// number
    measureOnly,      // boolean
    lineStartX        // number (optional)
)
```

---

## Solution

Changed the 5th parameter from a number to a proper font string:

```javascript
this.app.richTextRenderer.renderInlineFormattedText(
    priceCtx,
    priceTokens.tokens,
    142,  // x - Center horizontally
    12,   // y - Center vertically
    `bold 16px ${this.app.font.family}`,  // ✅ FIXED: baseFont string
    this.app.colors.textLight,  // baseColor
    268,  // maxWidth
    1,    // lineSpacing
    false,  // measureOnly
    0    // lineStartX for wrapping
);
```

---

## Font String Format

The `baseFont` parameter must be a valid CSS font string:

### Valid Formats
```javascript
// With font weight and family
`bold 16px Rodin`

// With style, weight, size, family
`italic bold 16px Rodin, sans-serif`

// Just size and family
`16px Rodin`

// With CSS font shorthand
`normal bold 16px/1.2 Rodin`
```

### Invalid Formats
```javascript
16                    // ❌ Just a number
'16'                  // ❌ String number
'16px'                // ❌ Missing font family
'Rodin'               // ❌ Missing size
```

---

## RichTextRenderer Font Parsing

The renderer parses the font string using this regex:

```javascript
// From RichTextRenderer._renderStyledWord (line 422)
const fontParts = originalFont.match(
    /^(italic\s)?(bold\s)?([\d.]+)(px|pt|em|rem|%|vw|vh)\s(.+)$/i
) || [];

// Captured groups:
// [1] = fontStyle (italic)
// [2] = fontWeight (bold)
// [3] = fontSize (number part)
// [4] = fontUnit (px, pt, etc.)
// [5] = fontFamily (Rodin, sans-serif, etc.)
```

**This is why `baseFont.indexOf` was failing:**
- When passed `16` (number), it doesn't have an `indexOf` method
- The regex expected a string to parse

---

## Common Usage Patterns

### Product Price
```javascript
const priceTokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
this.app.richTextRenderer.renderInlineFormattedText(
    ctx, priceTokens.tokens,
    x, y,
    `bold 16px ${this.app.font.family}`,  // Font string
    this.app.colors.textLight,
    maxWidth,
    1,
    false,
    0
);
```

### Product Name
```javascript
const nameTokens = this.app.richTextRenderer.parseInlineFormatting(product.name);
this.app.richTextRenderer.renderInlineFormattedText(
    ctx, nameTokens.tokens,
    x, y,
    `bold 14px ${this.app.font.family}`,  // Font string
    this.app.colors.text,
    maxWidth,
    1.2,
    false,
    0
);
```

### Product Description
```javascript
const descTokens = this.app.richTextRenderer.parseInlineFormatting(product.description);
this.app.richTextRenderer.renderInlineFormattedText(
    ctx, descTokens.tokens,
    x, y,
    `12px ${this.app.font.family}`,  // Font string (no bold)
    this.app.colors.text,
    maxWidth,
    1.4,
    false,
    0
);
```

---

## Parameter Reference

| Position | Name | Type | Example | Description |
|----------|------|------|---------|-------------|
| 1 | ctx | CanvasRenderingContext2D | `canvas.getContext('2d')` | Canvas context |
| 2 | tokens | Array | `parsed.tokens` | Parsed text tokens |
| 3 | x | number | `142` | Starting X position |
| 4 | y | number | `12` | Starting Y position |
| 5 | baseFont | **string** | `'bold 16px Rodin'` | CSS font string |
| 6 | baseColor | string | `'#FFFFFF'` | Text color |
| 7 | maxWidth | number | `268` | Max width for wrapping |
| 8 | lineSpacingFactor | number | `1` | Line spacing multiplier |
| 9 | measureOnly | boolean | `false` | Measure without rendering |
| 10 | lineStartX | number | `0` | Start X for line wrapping |

---

## Related Methods

### parseInlineFormatting
```javascript
const result = this.app.richTextRenderer.parseInlineFormatting(text);
// Returns: { tokens: Array, isAnimated: boolean }
```

### draw (High-level)
```javascript
this.app.richTextRenderer.draw(
    ctx,
    text,        // Raw text string
    x, y,
    width, height,
    {
        font: 'bold 16px Rodin',  // ✅ Font string
        fontSize: 16,              // Optional override
        color: '#FFFFFF',
        hAlign: 'center',
        vAlign: 'middle',
        lineSpacingFactor: 1.2
    }
);
```

---

## Testing

### Before Fix
```
❌ TypeError: baseFont.indexOf is not a function
❌ Product prices not rendering
❌ Console error on page load
```

### After Fix
```
✅ Build successful
✅ Product prices render correctly
✅ RichText metallic effects work
✅ Text wrapping functions properly
✅ No console errors
```

---

## Summary

**Issue**: Passing number instead of font string to `renderInlineFormattedText`  
**Fix**: Changed `16` to `'bold 16px Rodin'`  
**Impact**: Product price rendering now works  
**Status**: ✅ Complete

---

**Build**: Passing  
**Error**: Resolved  
**Ready**: Production
