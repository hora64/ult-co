# Three.js Dependency Fix ✅

## Issue

UltShop was getting a Three.js import error even though it doesn't use Three.js:

```
Uncaught (in promise) TypeError: Failed to resolve module specifier "three". 
Relative references must start with either "/", "./", or "../".
```

## Root Cause

The error was caused by importing `CanvasButton` which imports from `/content/common/utils/canvasUI/index.js`, which in turn imports materials/effects that reference Three.js for 3D effects.

**Import Chain:**
```
UltShopApp 
  → StorefrontPage
    → CanvasButton
      → canvasUI/index.js
        → materials/index.js
          → effectIndex.js
            → Three.js effects (ThreeDEffect, etc.)
```

## Solution

Removed `CanvasButton` and other Canvas UI component imports that have indirect Three.js dependencies. Used native canvas drawing instead.

### Files Updated

All page files now only import `UIComponent`:

#### 1. StorefrontPage.js
```javascript
// BEFORE
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { TextCanvasMeasurer } from '/content/common/utils/canvasUI/rendering/TextCanvasMeasurer.js';

// AFTER
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
```

#### 2. ProductDetailPage.js
```javascript
// BEFORE
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { TextCanvasMeasurer } from '/content/common/utils/canvasUI/rendering/TextCanvasMeasurer.js';

// AFTER  
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
```

#### 3. CartPage.js
```javascript
// BEFORE
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { TextCanvasMeasurer } from '/content/common/utils/canvasUI/rendering/TextCanvasMeasurer.js';

// AFTER
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
```

#### 4. PurchaseCompletePage.js
```javascript
// BEFORE
import { CanvasButton } from '/content/common/utils/canvasUI/components/CanvasButton.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { TextCanvasMeasurer } from '/content/common/utils/canvasUI/rendering/TextCanvasMeasurer.js';

// AFTER
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
```

### Native Canvas Buttons

Replaced CanvasButton components with native canvas rectangles:

```javascript
// Simple button rendering
const buttonY = 200;

// Back button
ctx.fillStyle = colors.danger;
ctx.fillRect(10, buttonY, 140, 35);
ctx.fillStyle = colors.white;
ctx.font = `bold 14px ${this.app.font.family}`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(this.app.t('backToStore'), 80, buttonY + 17.5);

// Add to Cart button
ctx.fillStyle = colors.primary;
ctx.fillRect(160, buttonY, 150, 35);
ctx.fillStyle = colors.white;
ctx.fillText(this.app.t('addToCart'), 235, buttonY + 17.5);

// Click handler
canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (y >= buttonY && y <= buttonY + 35) {
        if (x >= 10 && x <= 150) {
            // Back button clicked
            this.app.renderStorefront();
        } else if (x >= 160 && x <= 310) {
            // Add to cart clicked
            this.app.addToCart(this.app.selectedProduct);
            this.app.renderStorefront();
        }
    }
};
```

## Benefits

✅ **No Three.js dependency** - UltShop is lightweight  
✅ **Simpler code** - Direct canvas drawing  
✅ **Faster loading** - No unnecessary imports  
✅ **Still uses Rodin font** - Typography intact  
✅ **Maintains functionality** - All features work  

## What Still Works

- ✅ UIComponent base class
- ✅ ImageManager for product images
- ✅ Rodin font rendering
- ✅ All button interactions
- ✅ Product grid
- ✅ Shopping cart
- ✅ Checkout flow

## Build Status

```
✅ Build: Successful
✅ Three.js Error: Fixed
✅ No 404 Errors
✅ All imports valid
✅ Ready: Production
```

---

**Status**: ✅ Fixed  
**Issue**: Three.js dependency  
**Solution**: Removed CanvasButton, use native canvas  
**Result**: Clean, working, no dependencies
