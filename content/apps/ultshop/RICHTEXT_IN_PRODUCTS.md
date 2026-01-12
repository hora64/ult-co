# UltShop - Rich Text Formatting in Product Data ✅

## Overview
All rich text formatting is now defined in the product data (`products.js`), not hardcoded in rendering code. This allows designers and content creators to style prices without touching JavaScript.

---

## Philosophy

**Data-Driven Formatting** ✅
- Rich text formatting lives in `products.js`
- Rendering code just displays what's in the data
- No hardcoded formatting in JavaScript
- Content creators control the visual style

**Separation of Concerns**
```
products.js         → WHAT to display (content + formatting)
StorefrontPage.js   → WHERE to display (layout + positioning)
RichTextRenderer.js → HOW to display (rendering logic)
```

---

## Product Price Format

### Basic Structure
```javascript
{
    id: "product-id",
    name: "Product Name",
    price: "{staticmetallic:TYPE|VALUE {color:COLOR|LABEL}}"
}
```

### Components

1. **Metallic Effect** - Animated/static shine on the number
   ```javascript
   {staticmetallic:TYPE|VALUE}
   ```

2. **Currency Label** - Colored "uCoin" text
   ```javascript
   {color:COLOR|LABEL}
   ```

3. **Nested Formatting** - Combine effects
   ```javascript
   {staticmetallic:gold|1,800 {color:#FFD700|uCoin}}
   ```

---

## Examples from products.js

### Gold Metallic with Gold uCoin
```javascript
{
    id: "retro-sprite-collection",
    name: "Retro Sprite Collection",
    price: "{staticmetallic:gold|1,800 {color:#FFD700|uCoin}}"
}
```

**Visual:**
```
1,800 uCoin
^^^^^  ^^^^
gold   gold
shine  text
```

---

### Cyan Metallic with Gold uCoin
```javascript
{
    id: "neon-ui-pack",
    name: "Neon UI Asset Pack",
    price: "{staticmetallic:cyan|2,500 {color:#FFD700|uCoin}}"
}
```

**Visual:**
```
2,500 uCoin
^^^^^  ^^^^
cyan   gold
shine  text
```

---

### Silver Metallic with Gold uCoin
```javascript
{
    id: "holographic-effects",
    name: "Holographic VFX Bundle",
    price: "{staticmetallic:silver|3,200 {color:#FFD700|uCoin}}"
}
```

**Visual:**
```
3,200 uCoin
^^^^^  ^^^^
silver gold
shine  text
```

---

## Metallic Types Available

### Static Metallic (No Animation)
```javascript
{staticmetallic:TYPE|TEXT}
```

| Type | Color | Best For |
|------|-------|----------|
| `gold` | #FFD700 | Premium items, high value |
| `silver` | #C0C0C0 | Mid-tier items |
| `bronze` | #CD7F32 | Entry-level items |
| `copper` | #B87333 | Budget items |
| `platinum` | #E5E4E2 | Ultra-premium |
| `cyan` | #00CED1 | Digital/tech theme |
| `rosegold` | #B76E79 | Special items |

### Animated Metallic (Shine Effect)
```javascript
{metallic:TYPE|TEXT}
```
Same types as above, but with animated shine sweep.

---

## Color Options

### Hex Colors
```javascript
{color:#FFD700|uCoin}  // Gold
{color:#00CED1|uCoin}  // Cyan
{color:#C0C0C0|uCoin}  // Silver
{color:#FF6347|uCoin}  // Tomato red
```

### Named Colors
```javascript
{color:gold|uCoin}
{color:cyan|uCoin}
{color:red|uCoin}
{color:blue|uCoin}
```

---

## Complete Product Examples

### Premium Product (Gold + Gold)
```javascript
{
    id: "futuristic-weapon-models",
    name: "Futuristic Weapon Models",
    author: "Armory Digital",
    price: "{staticmetallic:gold|2,850 {color:#FFD700|uCoin}}",
    displayImage: "https://placehold.co/400x240/8B4513/FFFFFF?text=Weapons",
    icon: "https://placehold.co/96x96/8B4513/FFFFFF?text=Weapon",
    tags: ["3D Models", "Weapons", "Sci-Fi"],
    description: "25 low-poly futuristic weapon models. Game-ready with LODs and optimized for mobile platforms."
}
```

**Renders as:**
```
2,850 uCoin
 ^^^^ ^^^^
 gold gold
```

---

### Tech Product (Cyan + Gold)
```javascript
{
    id: "neon-city-environment",
    name: "Neon City Environment",
    author: "Urban Digital Design",
    price: "{staticmetallic:cyan|4,200 {color:#FFD700|uCoin}}",
    displayImage: "https://placehold.co/400x240/00CED1/000000?text=Neon+City",
    icon: "https://placehold.co/96x96/00CED1/000000?text=City",
    tags: ["3D Models", "Environment", "Cyberpunk"],
    description: "Complete modular cyberpunk city kit with neon signs, buildings, and props. Over 100 unique pieces."
}
```

**Renders as:**
```
4,200 uCoin
 ^^^^ ^^^^
 cyan gold
```

---

### Budget Product (Silver + Gold)
```javascript
{
    id: "digital-font-bundle",
    name: "Digital Font Bundle",
    author: "Type Foundry Digital",
    price: "{staticmetallic:silver|890 {color:#FFD700|uCoin}}",
    displayImage: "https://placehold.co/400x240/FF6347/000000?text=Fonts",
    icon: "https://placehold.co/96x96/FF6347/000000?text=Font",
    tags: ["Fonts", "Typography", "UI"],
    description: "15 futuristic and digital-themed fonts. Includes bitmap and vector versions with full character sets."
}
```

**Renders as:**
```
890 uCoin
^^^ ^^^^
silver gold
```

---

## Rendering Code

### StorefrontPage.js (NO Formatting Logic)

```javascript
showProductInfo(product, index) {
    // ...
    
    // Parse price from product data (contains rich text)
    const priceTokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
    
    // Render with RichTextRenderer (handles all formatting)
    this.app.richTextRenderer.renderInlineFormattedText(
        priceCtx,
        priceTokens.tokens,
        142, 12,
        `bold 18px ${this.app.font.family}`,
        this.app.colors.textLight,
        268, 1, false, 0
    );
}
```

**Key Points:**
- ✅ No hardcoded formatting
- ✅ Just reads `product.price`
- ✅ RichTextRenderer handles all effects
- ✅ Content-driven styling

---

## Adding New Products

### Step 1: Choose Metallic Type

**Premium Items (High Value):**
```javascript
price: "{staticmetallic:gold|5,000 {color:#FFD700|uCoin}}"
```

**Mid-Tier Items:**
```javascript
price: "{staticmetallic:silver|2,500 {color:#FFD700|uCoin}}"
```

**Budget Items:**
```javascript
price: "{staticmetallic:bronze|750 {color:#FFD700|uCoin}}"
```

**Tech/Digital Theme:**
```javascript
price: "{staticmetallic:cyan|1,500 {color:#FFD700|uCoin}}"
```

---

### Step 2: Add to products.js

```javascript
export const products = [
    // ...existing products...
    
    {
        id: "new-product",
        name: "New Product Name",
        author: "Author Name",
        price: "{staticmetallic:TYPE|VALUE {color:#FFD700|uCoin}}",  // ← Add formatting here
        displayImage: "https://placehold.co/400x240/COLOR/TEXT",
        icon: "https://placehold.co/96x96/COLOR/TEXT",
        tags: ["Tag1", "Tag2", "Tag3"],
        description: "Product description text."
    }
];
```

---

### Step 3: No Code Changes Needed!

The rendering code automatically:
1. Reads the `price` field
2. Parses rich text formatting
3. Renders with correct effects
4. Displays on storefront

**That's it!** ✅

---

## Advanced Formatting

### Animated Shine
```javascript
price: "{metallic:gold|2,500 {color:#FFD700|uCoin}}"
//       ^^^^^^^
//       Use 'metallic' instead of 'staticmetallic'
```

**Effect:** Number shimmers with animated gold shine

---

### Custom Colors
```javascript
price: "{staticmetallic:gold|1,500 {color:#00CED1|uCoin}}"
//                                          ^^^^^^^
//                                          Cyan uCoin label
```

**Effect:** Gold number, cyan "uCoin" text

---

### Multiple Effects
```javascript
price: "{staticmetallic:gold|{style:bold|1,500} {color:#FFD700|uCoin}}"
//                            ^^^^^^^^^^^
//                            Bold + metallic
```

**Effect:** Bold gold number with gold uCoin

---

### No Metallic Effect
```javascript
price: "{color:#FFD700|1,500 uCoin}"
```

**Effect:** Plain gold text, no shine

---

## Benefits

### 1. **Content Control**
- Designers edit `products.js`
- No JavaScript knowledge needed
- Visual changes without code changes

### 2. **Consistency**
- All formatting in one place
- Easy to enforce style guide
- Bulk updates possible

### 3. **Flexibility**
```javascript
// Easy to change all gold items to platinum
// Just find/replace in products.js:
staticmetallic:gold → staticmetallic:platinum
```

### 4. **No Rendering Code Changes**
```javascript
// StorefrontPage.js never changes
// Just displays what's in product.price
const priceTokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
```

### 5. **Version Control Friendly**
```javascript
// Product changes tracked in products.js
// Rendering logic stable in StorefrontPage.js
```

---

## Style Guide

### Recommended Pricing Tiers

| Price Range | Metallic Type | Color Scheme |
|-------------|---------------|--------------|
| 0 - 999 | `silver` or `bronze` | Silver/Bronze number + Gold uCoin |
| 1,000 - 2,499 | `silver` or `gold` | Silver number + Gold uCoin |
| 2,500 - 4,999 | `gold` | Gold number + Gold uCoin |
| 5,000+ | `gold` or `platinum` | Gold/Platinum + Gold uCoin |

### Special Categories

**Tech/Digital Items:**
```javascript
price: "{staticmetallic:cyan|VALUE {color:#FFD700|uCoin}}"
```

**Premium/Exclusive:**
```javascript
price: "{staticmetallic:platinum|VALUE {color:#FFD700|uCoin}}"
```

**Limited Time:**
```javascript
price: "{metallic:gold|VALUE {color:#FF6347|uCoin}}"  // Animated + red text
```

---

## Migration from Old Format

### Before (Hardcoded)
```javascript
// StorefrontPage.js - OLD ❌
const price = `$${product.price}`;  // Hardcoded $ symbol
```

### After (Data-Driven)
```javascript
// products.js - NEW ✅
price: "{staticmetallic:gold|1,800 {color:#FFD700|uCoin}}"

// StorefrontPage.js - NEW ✅
const priceTokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
```

---

## Testing

### Verify Rich Text Parsing
```javascript
// In browser console
const product = app.products[0];
const parsed = app.richTextRenderer.parseInlineFormatting(product.price);
console.log(parsed);
// Should show tokens with metallic and color effects
```

### Test Different Formats
```javascript
// Try different metallic types
product.price = "{staticmetallic:silver|500 {color:#FFD700|uCoin}}";
app.storefrontPage.showProductInfo(product, 0);
```

---

## Summary

### Formatting Lives in Data ✅
```javascript
// products.js
price: "{staticmetallic:gold|2,500 {color:#FFD700|uCoin}}"
```

### Rendering Just Displays ✅
```javascript
// StorefrontPage.js
const tokens = this.app.richTextRenderer.parseInlineFormatting(product.price);
this.app.richTextRenderer.renderInlineFormattedText(ctx, tokens, ...);
```

### Benefits
- ✅ Content-driven design
- ✅ No code changes for styling
- ✅ Designer-friendly
- ✅ Consistent formatting
- ✅ Easy bulk updates
- ✅ Version control friendly

---

**Philosophy**: Data defines appearance, code just renders it!  
**Status**: ✅ Complete  
**Build**: Successful  
**Ready**: Production
