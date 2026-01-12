# UltShop File Structure - Visual Reference

## Complete Directory Tree

```
content/apps/ultshop/
│
├── 📄 ultshop.html                     # Main entry point
├── 📄 app.js                           # HomeScreen integration
├── 📄 store.html                       # (Legacy - can be archived)
│
├── 📁 config/                          # 🔧 CONFIGURATION
│   ├── 📄 config.js                    # App settings, colors, resolution
│   ├── 📄 products.js                  # Product catalog data
│   └── 📄 translations.js              # Multi-language translations
│
├── 📁 assets/                          # 🎨 ASSETS & CODE
│   │
│   ├── 📁 js/                          # JavaScript modules
│   │   ├── 📄 UltShopApp.js           # Main application class
│   │   │
│   │   └── 📁 pages/                   # Page components
│   │       ├── 📄 StorefrontPage.js    # Product grid view
│   │       ├── 📄 ProductDetailPage.js # Product detail view
│   │       ├── 📄 CartPage.js          # Shopping cart view
│   │       └── 📄 PurchaseCompletePage.js # Success view
│   │
│   ├── 📁 img/                         # Images & graphics
│   │   └── 📄 README.md               # Image guidelines
│   │
│   ├── 📁 sfx/                         # Sound effects
│   │   └── 📄 README.md               # Audio guidelines
│   │
│   ├── 📁 models/                      # 3D models
│   │   └── 📄 README.md               # Model guidelines
│   │
│   └── 📁 icons/                       # App icons
│       └── 📄 store_64px.png          # Store icon
│
└── 📁 docs/                            # 📚 DOCUMENTATION
    ├── 📄 STRUCTURE_README.md          # Structure documentation
    ├── 📄 MIGRATION_GUIDE.md           # Migration instructions
    ├── 📄 QUICK_REFERENCE.md           # Quick API reference
    ├── 📄 IMPLEMENTATION_SUMMARY.md    # Implementation details
    ├── 📄 RESTRUCTURE_COMPLETE.md      # Restructure summary
    └── 📄 ULTSHOP_CANVAS_UI_IMPLEMENTATION.md # Canvas UI docs
```

## File Dependency Graph

```
ultshop.html
    └── imports UltShopApp.js
            ├── imports config/config.js
            ├── imports config/products.js
            ├── imports config/translations.js
            ├── imports ImageManager (from Canvas UI)
            │
            └── dynamically imports pages/
                    ├── StorefrontPage.js
                    ├── ProductDetailPage.js
                    ├── CartPage.js
                    └── PurchaseCompletePage.js
```

## File Size Reference

```
📄 ultshop.html                  ~2.5 KB    Entry point
📄 app.js                        ~3.0 KB    HomeScreen config

📁 config/
  📄 config.js                   ~1.5 KB    Settings
  📄 products.js                 ~1.0 KB    Catalog
  📄 translations.js             ~2.0 KB    Languages

📁 assets/js/
  📄 UltShopApp.js              ~3.0 KB    Main app
  
  📁 pages/
    📄 StorefrontPage.js         ~4.0 KB    Grid view
    📄 ProductDetailPage.js      ~3.0 KB    Details
    📄 CartPage.js               ~3.5 KB    Cart
    📄 PurchaseCompletePage.js   ~2.0 KB    Success

📁 assets/img/                   (Empty - ready for images)
📁 assets/sfx/                   (Empty - ready for sounds)
📁 assets/models/                (Empty - ready for models)

Total JavaScript: ~22.5 KB
```

## Import Chain

### Level 1: Entry Point
```javascript
// ultshop.html
import { UltShopApp } from './assets/js/UltShopApp.js';
```

### Level 2: Main App
```javascript
// UltShopApp.js
import { config } from '../config/config.js';
import { translations } from '../config/translations.js';
import { products } from '../config/products.js';
import { ImageManager } from '/content/common/utils/canvasUI/ImageManager.js';
```

### Level 3: Dynamic Pages (Lazy Loaded)
```javascript
// UltShopApp.js methods
import('./pages/StorefrontPage.js')
import('./pages/ProductDetailPage.js')
import('./pages/CartPage.js')
import('./pages/PurchaseCompletePage.js')
```

## Data Flow

```
User clicks product
    ↓
StorefrontPage detects click
    ↓
Calls app.showProductDetail(product)
    ↓
UltShopApp sets selectedProduct
    ↓
Dynamically imports ProductDetailPage
    ↓
ProductDetailPage renders product
    ↓
User clicks "Add to Cart"
    ↓
Calls app.addToCart(product)
    ↓
Product added to app.cart array
    ↓
Returns to storefront
```

## Configuration Flow

```
config/config.js
    ├── Colors → Used in all pages
    ├── Resolution → Used in UltShopApp
    ├── Grid layout → Used in StorefrontPage
    └── Paths → Used for asset loading

config/products.js
    └── Product array → Used in StorefrontPage, ProductDetailPage

config/translations.js
    └── Translation objects → Used via app.t() method
```

## Page Rendering Flow

```
Page Constructor
    └── Receives app instance
        └── Gets canvas contexts
            └── render() called
                ├── renderTopScreen()
                │   └── Draws top canvas
                └── renderBottomScreen()
                    ├── Draws bottom canvas
                    └── setupClickHandler()
                        └── Handles user interaction
```

## Key Files Quick Reference

| File | Purpose | Edit When |
|------|---------|-----------|
| `ultshop.html` | Entry point | Rarely (structure changes) |
| `app.js` | HomeScreen config | App metadata, locales |
| `config/config.js` | Settings | Colors, resolution, paths |
| `config/products.js` | Product data | Add/edit products |
| `config/translations.js` | Languages | Add/edit translations |
| `UltShopApp.js` | Main logic | Core functionality changes |
| `pages/*.js` | Page rendering | UI/layout changes |

## Asset Organization

```
assets/
├── js/              # Code
│   ├── *.js         # Main app files
│   └── pages/       # Page components
│
├── img/             # Visual assets
│   ├── products/    # Product images
│   ├── icons/       # UI icons
│   └── banners/     # Marketing banners
│
├── sfx/             # Audio assets
│   ├── ui/          # UI sounds
│   └── music/       # Background music
│
└── models/          # 3D assets
    ├── products/    # Product 3D models
    └── scenes/      # Environment models
```

## Module Responsibilities

### UltShopApp.js
- ✅ Initialize app
- ✅ Manage state (cart, current view)
- ✅ Coordinate between pages
- ✅ Handle translations
- ✅ Manage image loading

### StorefrontPage.js
- ✅ Render product grid
- ✅ Display cart button
- ✅ Handle product clicks

### ProductDetailPage.js
- ✅ Show product details
- ✅ Display product image
- ✅ Handle "Add to Cart"

### CartPage.js
- ✅ List cart items
- ✅ Calculate total
- ✅ Handle checkout

### PurchaseCompletePage.js
- ✅ Show success message
- ✅ Return to store

## Quick Navigation

Need to...
- **Add product?** → `config/products.js`
- **Change colors?** → `config/config.js`
- **Add language?** → `config/translations.js`
- **Fix storefront?** → `assets/js/pages/StorefrontPage.js`
- **Fix detail view?** → `assets/js/pages/ProductDetailPage.js`
- **Fix cart?** → `assets/js/pages/CartPage.js`
- **Change app logic?** → `assets/js/UltShopApp.js`

---

**Visual Reference Version**: 1.0  
**Last Updated**: 2024  
**Structure**: Modular & Organized ✅
