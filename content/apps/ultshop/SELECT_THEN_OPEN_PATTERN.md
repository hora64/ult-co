# UltShop - Select-Then-Open Click Pattern (HomeScreen) ✅

## Overview
Implemented the HomeScreen 3DS click pattern where the **first click selects** a product and the **second click opens** it. This provides better UX by letting users browse product info before committing to open the detail page.

---

## HomeScreen Pattern

### Click Behavior
```javascript
// From homeScreen_3DS AppGrid._internalHandleAppClickTrigger

// First Click: Select
if (!wasSelectedBeforeThisClick) {
    this.bannerManager.loadBanner(appDataItem);
    this.selectApp(appId, iconWrapper, true);
    this.lastSelectedAppIdForAction = appId;
}

// Second Click: Open/Launch
if (wasSelectedBeforeThisClick && this.lastSelectedAppIdForAction === appId) {
    this.launchSelectedApp(appDataItem, iconWrapper);
    this.lastSelectedAppIdForAction = null;
}
```

---

## UltShop Implementation

### File Modified
- `content/apps/ultshop/assets/js/pages/StorefrontPage.js`

### Methods Added/Updated

#### 1. **handleProductClick** (New)
Main click handler implementing the select-then-open pattern

```javascript
handleProductClick(event, product, index, glowCanvas) {
    const wasSelectedBeforeClick = this.selectedProductIndex === index;
    
    // Always select on click
    this.selectProduct(product, index, glowCanvas);
    
    // If already selected, open detail page (second click)
    if (wasSelectedBeforeClick) {
        console.log('[StorefrontPage] Second click - opening product detail:', product.name);
        this.app.showProductDetail(product);
    } else {
        console.log('[StorefrontPage] First click - product selected:', product.name);
    }
}
```

**Logic Flow:**
1. Check if product was already selected before this click
2. Always call `selectProduct()` to update selection state
3. If it was already selected → **Open detail page** (second click)
4. If not already selected → **Just select it** (first click)

---

#### 2. **createProductIcon** (Updated)
Updated to use the new click handler and add hover effects

```javascript
createProductIcon(product, index) {
    // ...create icon container...
    
    // Store product data for click handling
    iconContainerWrapper.dataset.productIndex = index;
    iconContainerWrapper.dataset.productId = product.id || index;
    
    // Create ProductIcon with new click handler
    const iconContainer = this.productIconSystem.createProduct({
        label: product.name,
        icon: product.icon,
        width: this.iconSize,
        height: this.iconSize,
        onClick: (e) => {
            // HomeScreen pattern: First click selects, second click opens
            this.handleProductClick(e, product, index, glowCanvas);
        }
    });
    
    // Hover effects
    if (button) {
        button.onmouseenter = () => {
            // Show dim glow on hover if not selected
            if (this.selectedProductIndex !== index) {
                glowCanvas.style.opacity = '0.5';
            }
        };
        
        button.onmouseleave = () => {
            // Hide hover glow if not selected
            if (this.selectedProductIndex !== index) {
                glowCanvas.style.opacity = '0';
            }
        };
    }
    
    // ...rest of setup...
}
```

**Features:**
- ✅ Stores product index and ID in dataset
- ✅ Uses `handleProductClick` for click handling
- ✅ Adds hover effects (dim glow when not selected)
- ✅ Hover glow automatically hides when not selected

---

#### 3. **selectProduct** (Updated)
Enhanced to support the new click pattern

```javascript
selectProduct(product, index, glowCanvas) {
    // Deselect previous product
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
    
    // Render selection glow
    const selectorSrc = '/content/apps/homeScreen_3DS/assets/themes/blackTheme/Select_128px.png';
    const glowOptions = {
        animated: false,
        frameCount: 1,
        currentFrame: 0,
        frameDuration: 100,
        customSrc: selectorSrc
    };
    this.renderSelectionGlow(glowCanvas, this.iconSize, glowOptions);
    glowCanvas.style.opacity = '1';
    
    // Update info panel
    this.showProductInfo(product, index);
    
    // Scroll into view
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

**Features:**
- ✅ Deselects previous product
- ✅ Cancels any ongoing animations
- ✅ Renders selection glow
- ✅ Updates info panel
- ✅ Scrolls selected product into view

---

## User Experience

### Before (Direct Navigation)
```
User clicks product
    ↓
Immediately opens detail page
    ↓
User might not know what they clicked
    ↓
Must use back button to browse more
```

**Issues:**
- ❌ No preview of product info
- ❌ Commits to detail page immediately
- ❌ Harder to browse multiple products
- ❌ More back-and-forth navigation

---

### After (Select-Then-Open)
```
User clicks product (1st click)
    ↓
Product selected + info shown
    ↓
User reads name, price, description
    ↓
User clicks again if interested (2nd click)
    ↓
Detail page opens
```

**Benefits:**
- ✅ See product info before opening
- ✅ Browse multiple products easily
- ✅ Only open detail when ready
- ✅ Less navigation required
- ✅ Better for browsing experience

---

## Visual Feedback

### Hover State (Not Selected)
```
Product Icon
    ↓
Mouse enters
    ↓
Dim glow appears (opacity: 0.5)
    ↓
Mouse leaves
    ↓
Glow disappears
```

### First Click (Selection)
```
Product Icon
    ↓
First click
    ↓
Full glow appears (opacity: 1.0)
    ↓
Info panel updates
    ↓
Scrolls into view
    ↓
Product remains selected
```

### Second Click (Open)
```
Selected Product
    ↓
Second click
    ↓
Detail page opens
    ↓
User views full product details
```

---

## Code Flow Diagram

```
┌─────────────────────┐
│   User Action       │
└──────────┬──────────┘
           │
           ▼
   ┌──────────────┐
   │ Click Product│
   └──────┬───────┘
          │
          ▼
   ┌─────────────────────────┐
   │ handleProductClick()    │
   │ - Check if selected     │
   └──────┬──────────────────┘
          │
          ├─────────────────┐
          │                 │
          ▼                 ▼
    [Not Selected]    [Already Selected]
          │                 │
          ▼                 ▼
    selectProduct()   showProductDetail()
          │                 │
          ▼                 │
    ┌──────────────┐        │
    │ Show glow    │        │
    │ Update info  │        │
    │ Scroll view  │        │
    └──────────────┘        │
                            ▼
                    ┌──────────────┐
                    │ Open detail  │
                    │ page         │
                    └──────────────┘
```

---

## Comparison Table

| Feature | Before | After |
|---------|--------|-------|
| **First Click** | Opens detail page | Selects product + shows info |
| **Second Click** | N/A | Opens detail page |
| **Hover** | No feedback | Dim glow (0.5 opacity) |
| **Selection Glow** | Custom rectangle | HomeScreen selector image |
| **Info Preview** | ❌ None | ✅ Name, price, description |
| **Browse Multiple** | ❌ Hard | ✅ Easy |
| **Navigation** | ❌ Many page changes | ✅ Less page changes |
| **User Control** | ❌ Immediate commit | ✅ Preview before commit |

---

## HomeScreen Pattern Adoption

### What We Copied
From `homeScreen_3DS/assets/js/appGrid/AppGrid.js`:

1. **Select-then-open logic**
   ```javascript
   wasSelectedBeforeClick → 2nd click → open
   !wasSelectedBeforeClick → 1st click → select
   ```

2. **Selection state tracking**
   ```javascript
   this.selectedProductIndex
   // Equivalent to HomeScreen's selectedAppId
   ```

3. **Visual feedback pattern**
   ```javascript
   // Glow opacity states:
   // 0.0 = not selected, not hovered
   // 0.5 = hovered but not selected
   // 1.0 = selected
   ```

4. **Scroll into view on selection**
   ```javascript
   container.scrollIntoView({
       behavior: 'smooth',
       block: 'nearest',
       inline: 'center'
   });
   ```

### What We Adapted
- **Product context**: Changed from "app" to "product"
- **Action**: Changed from "launch app" to "show detail page"
- **Info panel**: Uses existing product info panel instead of banner
- **Selector**: Uses HomeScreen selector image

---

## Event Flow

### Complete Click Sequence

```
User hovers product icon
    ↓
onmouseenter fires
    ↓
Check if selected
    ↓
If not selected: Show dim glow (0.5 opacity)
    ↓
User moves mouse away
    ↓
onmouseleave fires
    ↓
If not selected: Hide glow (0 opacity)
    ↓
User clicks product
    ↓
onClick fires
    ↓
handleProductClick called
    ↓
Check wasSelectedBeforeClick
    ↓
Call selectProduct(product, index, glowCanvas)
    ↓
    ├─ Deselect previous product
    ├─ Update selectedProductIndex
    ├─ Render selection glow (full opacity)
    ├─ Update info panel
    └─ Scroll into view
    ↓
If wasSelectedBeforeClick:
    ↓
    Call app.showProductDetail(product)
    ↓
    Navigate to detail page
```

---

## Developer Notes

### Adding Click Tracking
```javascript
handleProductClick(event, product, index, glowCanvas) {
    const wasSelectedBeforeClick = this.selectedProductIndex === index;
    
    // Track selection
    if (!wasSelectedBeforeClick) {
        analytics.track('product_selected', {
            product_id: product.id,
            product_name: product.name
        });
    }
    
    this.selectProduct(product, index, glowCanvas);
    
    // Track opening
    if (wasSelectedBeforeClick) {
        analytics.track('product_opened', {
            product_id: product.id,
            product_name: product.name
        });
        this.app.showProductDetail(product);
    }
}
```

### Custom Selection Effects
```javascript
selectProduct(product, index, glowCanvas) {
    // ...existing code...
    
    // Custom effect for premium products
    if (product.category === 'premium') {
        glowCanvas.classList.add('premium-glow');
    }
    
    // Play selection sound
    if (this.app.soundEnabled) {
        this.playSound('select');
    }
}
```

### Keyboard Navigation (Future)
```javascript
// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        this.selectNextProduct();
    } else if (e.key === 'ArrowLeft') {
        this.selectPreviousProduct();
    } else if (e.key === 'Enter') {
        if (this.selectedProductIndex !== null) {
            const product = this.app.products[this.selectedProductIndex];
            this.app.showProductDetail(product);
        }
    }
});
```

---

## Testing Checklist

- [x] First click selects product
- [x] Selection glow appears
- [x] Info panel updates
- [x] Product scrolls into view
- [x] Second click opens detail page
- [x] Hover shows dim glow
- [x] Hover glow hides when mouse leaves
- [x] Previous selection clears when new product selected
- [x] Animation cleanup on deselect
- [x] Works with all products
- [x] Build successful

---

## Future Enhancements

### 1. **Double-Click Support**
```javascript
handleProductClick(event, product, index, glowCanvas) {
    const now = Date.now();
    const timeSinceLastClick = now - (this.lastClickTime || 0);
    
    if (timeSinceLastClick < 300) {
        // Double click detected - open immediately
        this.app.showProductDetail(product);
        this.lastClickTime = 0;
    } else {
        // Single click - select
        this.selectProduct(product, index, glowCanvas);
        this.lastClickTime = now;
    }
}
```

### 2. **Context Menu (Right Click)**
```javascript
iconContainer.oncontextmenu = (e) => {
    e.preventDefault();
    this.showProductContextMenu(e, product);
};
```

### 3. **Touch Gestures**
```javascript
// Long press to select
// Tap to open if already selected
let touchStartTime;

iconContainer.ontouchstart = () => {
    touchStartTime = Date.now();
};

iconContainer.ontouchend = (e) => {
    const touchDuration = Date.now() - touchStartTime;
    
    if (touchDuration > 500) {
        // Long press - show context menu
        this.showProductContextMenu(e, product);
    } else {
        // Normal tap - select or open
        this.handleProductClick(e, product, index, glowCanvas);
    }
};
```

---

## Summary

### Changes Made
- ✅ Added `handleProductClick()` method
- ✅ Updated `createProductIcon()` to use new click handler
- ✅ Enhanced `selectProduct()` with proper state management
- ✅ Added hover effects (dim glow)
- ✅ Implemented select-then-open pattern from HomeScreen

### User Benefits
- ✅ Browse products before committing
- ✅ See info without opening detail page
- ✅ Easier to compare multiple products
- ✅ Less back-and-forth navigation
- ✅ Better overall UX

### Technical Benefits
- ✅ Consistent with HomeScreen pattern
- ✅ Clean state management
- ✅ Proper event handling
- ✅ Animation cleanup
- ✅ Extensible for future features

---

**Pattern Source**: `homeScreen_3DS/assets/js/appGrid/AppGrid.js` → `_internalHandleAppClickTrigger()`  
**Implementation**: `ultshop/assets/js/pages/StorefrontPage.js` → `handleProductClick()`  
**Status**: ✅ Complete  
**Build**: Successful
