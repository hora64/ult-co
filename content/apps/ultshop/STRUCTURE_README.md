# UltShop - Modular Structure

## Directory Structure

```
ultshop/
├── ultshop.html                    # Main entry point
├── app.js                          # App configuration for homeScreen
├── config/                         # Configuration files
│   ├── config.js                   # App settings and constants
│   ├── products.js                 # Product catalog
│   └── translations.js             # Multi-language support
├── assets/                         # Asset files
│   ├── js/                         # JavaScript modules
│   │   ├── UltShopApp.js          # Main application class
│   │   └── pages/                  # Page components
│   │       ├── StorefrontPage.js   # Product grid view
│   │       ├── ProductDetailPage.js # Product details
│   │       ├── CartPage.js         # Shopping cart
│   │       └── PurchaseCompletePage.js # Checkout success
│   ├── img/                        # Images
│   │   └── README.md
│   ├── sfx/                        # Sound effects
│   │   └── README.md
│   └── models/                     # 3D models
│       └── README.md
└── docs/                           # Documentation
    ├── ULTSHOP_CANVAS_UI_IMPLEMENTATION.md
    ├── QUICK_REFERENCE.md
    └── IMPLEMENTATION_SUMMARY.md
```

## File Purposes

### Core Files

**ultshop.html**
- Main HTML entry point
- Minimal structure (screens + loading overlay)
- Imports UltShopApp module

**app.js**
- Configuration for homeScreen integration
- App metadata, permissions, locales
- Manual article content

### Configuration (`config/`)

**config.js**
- App-wide settings and constants
- Display resolution, colors, paths
- Grid layout parameters
- Centralized configuration

**products.js**
- Product catalog data
- Product objects with id, name, price, images, etc.
- Easy to extend with new products

**translations.js**
- Multi-language support
- Translation keys and values
- Currently supports: en-US, es-ES, fr-FR, de-DE, ja-JP

### JavaScript (`assets/js/`)

**UltShopApp.js**
- Main application class
- Handles initialization, state management
- Coordinates between pages
- Cart management

**pages/StorefrontPage.js**
- Product grid rendering
- Cart button
- Click handling for products

**pages/ProductDetailPage.js**
- Product details display
- Add to cart functionality
- Back navigation

**pages/CartPage.js**
- Cart items display
- Total calculation
- Checkout button

**pages/PurchaseCompletePage.js**
- Success confirmation
- Return to store

### Assets (`assets/`)

**img/** - Images and graphics
**sfx/** - Sound effects and audio
**models/** - 3D models (GLB/GLTF)

## Usage

### Adding a New Product

Edit `config/products.js`:

```javascript
{
    id: "new-product-id",
    name: "Product Name",
    author: "Creator Name",
    price: "$XX.XX",
    image: "https://...",
    tags: ["Category1", "Category2"],
    description: "Product description..."
}
```

### Adding a New Language

Edit `config/translations.js`:

```javascript
'xx-XX': {
    store: 'Translation',
    cart: 'Translation',
    // ... other keys
}
```

### Changing Colors

Edit `config/config.js`:

```javascript
colors: {
    primary: '#00BCD4',
    // ... other colors
}
```

### Adding a New Page

1. Create new page file in `assets/js/pages/`
2. Export a class with `render()` method
3. Import and call from `UltShopApp.js`

Example:
```javascript
// assets/js/pages/NewPage.js
export class NewPage {
    constructor(app) {
        this.app = app;
        this.topCtx = app.topCanvas.getContext('2d');
        this.bottomCtx = app.bottomCanvas.getContext('2d');
    }
    
    render() {
        // Render logic
    }
}
```

## Architecture Benefits

### Modular Design
- Each component is self-contained
- Easy to maintain and update
- Clear separation of concerns

### Scalability
- Easy to add new products
- Simple to add new languages
- Straightforward to add new pages

### Maintainability
- Configuration in one place
- Consistent code structure
- Well-documented

### Performance
- Lazy loading of pages (dynamic imports)
- Efficient canvas rendering
- Minimal DOM manipulation

## Development Workflow

1. **Edit Config** - Update `config/` files for data changes
2. **Modify Pages** - Edit `pages/` for UI changes
3. **Update Styles** - Modify colors in `config/config.js`
4. **Test** - Open `ultshop.html` in browser
5. **Deploy** - All files are ready for production

## Integration with Canvas UI

UltShop uses the Canvas UI framework:
- `ImageManager` for efficient image loading
- Canvas-based rendering for performance
- Consistent with other apps in the ecosystem

## Browser Compatibility

- Requires ES6 module support
- Requires Canvas API
- Tested on modern browsers (Chrome, Firefox, Edge)

## Future Enhancements

Potential additions:
- Sound effects integration
- 3D product previews
- Search/filter functionality
- User reviews
- Purchase history
- Animation effects

---

**Version**: 2.0.0  
**Status**: Production Ready  
**Last Updated**: 2024
