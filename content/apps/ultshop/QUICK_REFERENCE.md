# UltShop Canvas UI - Quick Reference

## Launching UltShop
```javascript
// From homeScreen or other apps
appGrid.launchApp({ id: 'ultshop' });
```

## Views & Navigation

### Storefront View
- Displays product grid (3 columns)
- Cart button in top-right
- Click product card to view details

### Product Detail View
- Shows product image in top screen
- Product info and description in bottom screen
- "Back to Store" button (left)
- "Add to Cart" button (right)

### Cart View
- Lists all cart items
- Shows total price
- "Back to Store" button (left)
- "Checkout" button (right, disabled if cart empty)

### Purchase Complete View
- Success message
- "Back to Store" button

## API Reference

### UltShopApp Class
```javascript
class UltShopApp {
    constructor()
    async init()                      // Initialize app
    async preloadImages()             // Load product images
    renderStorefront()                // Show product grid
    showProductDetail(product)        // Show product details
    showCart()                        // Show shopping cart
    checkout()                        // Complete purchase
    t(key, replacements)              // Translate string
}
```

## Translation Keys
```javascript
{
    store: 'UltShop',
    cart: 'Cart',
    viewCart: 'View Cart ({count})',
    addToCart: 'Add to Cart',
    backToStore: 'Back to Store',
    checkout: 'Checkout',
    cartEmpty: 'Your cart is empty',
    total: 'Total: {amount}',
    purchaseComplete: 'Purchase Complete!',
    thankYou: 'Thank you for your purchase!'
}
```

## Adding New Products
```javascript
// In ultshop.html, products array:
{
    id: "unique-product-id",
    name: "Product Name",
    author: "Creator/Studio Name",
    price: "$XX.XX",
    image: "https://placehold.co/400x240/COLOR/TEXT?text=Product",
    tags: ["Category1", "Category2"],
    description: "Detailed product description..."
}
```

## Canvas Dimensions
- Top Screen: 320x240
- Bottom Screen: 320x240
- Total Container: 320x480

## Color Scheme
```css
Primary: #00BCD4 (Cyan)
Primary Dark: #00838F (Dark Cyan)
Secondary: #B2EBF2 (Light Cyan)
Accent: #FFEB3B (Yellow, for cart)
Danger: #D32F2F (Red, for back/cancel)
Text: #000000 (Black)
Text Subtle: #004D40 (Dark Teal)
Background Gradient: #B2EBF2 → #80DEEA
```

## Event Handling
```javascript
// Click detection on canvas
this.bottomCanvas.onclick = (e) => {
    const rect = this.bottomCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check button bounds
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        // Handle click
    }
};
```

## DigiShop Redirect
DigiShop automatically redirects to UltShop:
```javascript
// In digishop/app.js onClick handler
const ultshop = appGrid.apps.find(a => a.id === 'ultshop');
if (ultshop) {
    appGrid.launchApp(ultshop);
}
```

## Troubleshooting

### Images not loading
- Check image URLs are accessible
- Verify ImageManager is initialized
- Check browser console for CORS errors

### Canvas not rendering
- Verify canvas dimensions match container
- Check getContext('2d') is successful
- Ensure fonts are loaded before rendering

### Click detection not working
- Verify click coordinates calculation
- Check button bounds are correct
- Ensure onclick handler is attached

## Dependencies
- `/content/common/utils/canvasUI/UIComponent.js`
- `/content/common/utils/canvasUI/ImageManager.js`
- `/content/common/utils/canvasUI/rendering/index.js`
- Font: Rodin (`/content/common/fonts/FOT-RodinNTLG Pro DB.otf`)

## Browser Compatibility
- Requires Canvas API support
- Requires ES6 modules
- Tested on modern browsers (Chrome, Firefox, Edge)

---

**Quick Start**: Open `ultshop.html` in browser or launch via homeScreen  
**Documentation**: See `ULTSHOP_CANVAS_UI_IMPLEMENTATION.md`  
