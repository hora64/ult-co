// UltShop Main Application Class
import { productGrid, appMetadata, features, uiConfig, i18nConfig, getThemeVar, getCurrentLanguage, colorScheme } from '/content/apps/ultshop/config/config.js';
import { translations } from '/content/apps/ultshop/config/translations.js';
import { products } from '/content/apps/ultshop/config/products.js';
import { ImageManager } from '/content/common/utils/canvasUI/ImageManager.js';
import { UIComponent } from '/content/common/utils/canvasUI/UIComponent.js';
import { RichTextRenderer } from '/content/common/utils/canvasUI/rendering/RichTextRenderer.js';
import { IconLoader } from '/content/apps/ultshop/assets/js/IconLoader.js';
import { PixelatedDotLoader } from '/content/common/utils/LoadingCircle.js';

export class UltShopApp extends UIComponent {
    constructor() {
        super();
        this.topScreen = document.getElementById('top-screen');
        this.bottomScreen = document.getElementById('bottom-screen');
        
        this.imageManager = new ImageManager();
        this.richTextRenderer = new RichTextRenderer(this);
        this.currentView = 'storefront';
        this.currentPage = null;
        this.storefrontPageNumber = 0; // Track storefront page number
        this.cart = [];
        this.selectedProduct = null;
        this.language = getCurrentLanguage();
        this.translations = translations[this.language] || translations['en-US'];
        this.products = products;
        this.loadingSpinner = null; // Changed from loadingCircle
        this.sortBy = 'featured'; // NEW: Default sort option
        this.searchTerm = ''; // NEW: Search term for filtering products
        
        // Load configuration
        this.productGrid = productGrid;
        this.metadata = appMetadata;
        this.features = features;
        
        // Canvas elements for backgrounds
        this.topCanvas = null;
        this.bottomCanvas = null;
        this.topCtx = null;
        this.bottomCtx = null;
        
        // Get resolution from CSS variables (fallback to config values)
        this.resolution = {
            width: parseInt(getThemeVar('ultshop-width', '400')) || 400,
            height: parseInt(getThemeVar('ultshop-height', '480')) || 480,
            topScreen: {
                width: parseInt(getThemeVar('ultshop-width', '400')) || 400,
                height: parseInt(getThemeVar('ultshop-top-screen-height', '240')) || 240
            },
            bottomScreen: {
                width: 320, // Bottom screen is 320px wide
                height: parseInt(getThemeVar('ultshop-bottom-screen-height', '240')) || 240
            }
        };
        
        // Use 3DS eShop color scheme
        this.colors = colorScheme;
        
        // CSS vars for RichTextRenderer
        this.cssVars = {
            '--ds-accent-blue': this.colors.primary,
            '--ds-text': this.colors.text,
            '--ds-text-subtle': this.colors.textSubtle
        };
        
        // Get asset paths from CSS variables
        this.paths = {
            assets: getThemeVar('ultshop-assets-base', '/content/apps/ultshop/assets'),
            images: getThemeVar('ultshop-images-path', '/content/apps/ultshop/assets/img'),
            sounds: getThemeVar('ultshop-sounds-path', '/content/apps/ultshop/assets/sfx'),
            models: getThemeVar('ultshop-models-path', '/content/apps/ultshop/assets/models'),
            fonts: getThemeVar('ultshop-fonts-path', '/content/common/fonts')
        };

        // Font configuration
        this.font = {
            family: 'Rodin, sans-serif',
            path: '/content/common/fonts/FOT-RodinNTLG Pro DB.otf'
        };
        
        // Mock time system for RichTextRenderer
        this.timeSystem = {
            globalTime: 0
        };
        
        // Initialize IconLoader with app metadata
        IconLoader.init({
            appId: this.metadata.appId,
            appVersion: this.metadata.version,
            useIndexedDB: true
        });
    }

    /**
     * Translate a key with optional replacements
     * @param {string} key - Translation key
     * @param {object} replacements - Key-value pairs for replacements
     * @returns {string} Translated string
     */
    t(key, replacements = {}) {
        let str = this.translations[key] || key;
        for (const [k, v] of Object.entries(replacements)) {
            str = str.replace(`{${k}}`, v);
        }
        return str;
    }

    /**
     * Initialize the application
     */
    async init() {
        // Preload font FIRST to prevent FOUT
        await this.preloadFont();
        
        // Preload product images BEFORE creating UI
        if (this.features.enableImagePreloading) {
            await this.preloadImages();
        }
        
        // Create background canvases (optional - for visual effects)
        this.topCanvas = document.createElement('canvas');
        this.topCanvas.width = this.resolution.topScreen.width;
        this.topCanvas.height = this.resolution.topScreen.height;
        this.topCanvas.style.position = 'absolute';
        this.topCanvas.style.top = '0';
        this.topCanvas.style.left = '0';
        this.topCanvas.style.zIndex = '0';
        this.topScreen.appendChild(this.topCanvas);
        this.topCtx = this.topCanvas.getContext('2d');
        this.topCtx.imageSmoothingEnabled = false;

        // Bottom screen uses DOM elements, no background canvas needed

        // Start animation loop for metallic effects
        this.startAnimationLoop();

        // Initialize views - START WITH HOME PAGE
        this.renderHome();
    }

    /**
     * Start animation loop for time-based effects (metallic, etc.)
     */
    startAnimationLoop() {
        const animate = (timestamp) => {
            this.timeSystem.globalTime = timestamp * 0.001; // Convert to seconds
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    /**
     * Render the home page (welcome screen)
     */
    renderHome() {
        this.currentView = 'home';
        this.selectedProduct = null;
        
        this.showLoading();
        this.clearCurrentPage();
        
        // Import and render home page
        import('/content/apps/ultshop/assets/js/pages/HomePage.js').then(module => {
            const HomePage = module.HomePage;
            this.currentPage = new HomePage(this);
            
            this.hideLoading();
            this.currentPage.render();
        });
    }

    /**
     * Preload all product images
     */
    async preloadImages() {
        console.log('[UltShop] Preloading product images...');
        const imagesToPreload = [];
        
        // Collect all unique images (both icons and displayImages)
        this.products.forEach(p => {
            if (p.icon && !imagesToPreload.includes(p.icon)) {
                imagesToPreload.push(p.icon);
            }
            if (p.displayImage && !imagesToPreload.includes(p.displayImage)) {
                imagesToPreload.push(p.displayImage);
            }
        });
        
        console.log(`[UltShop] Preloading ${imagesToPreload.length} images...`);
        const promises = imagesToPreload.map(url => this.imageManager.preloadImage(url));
        
        await Promise.all(promises).catch(err => {
            console.warn('[UltShop] Some images failed to preload:', err);
        });
        
        console.log('[UltShop] Image preloading complete');
    }

    /**
     * Preload font to prevent random loading failures
     */
    async preloadFont() {
        try {
            console.log('[UltShop] Preloading font...');
            const font = new FontFace('Rodin', `url(${this.font.path})`);
            await font.load();
            document.fonts.add(font);
            console.log('[UltShop] Font preloaded successfully');
        } catch (error) {
            console.warn('[UltShop] Font preload failed, will use fallback:', error);
        }
    }

    /**
     * Show loading indicator with pixelated dot animation
     */
    showLoading() {
        if (this.loadingSpinner) return; // Already showing
        
        // Convert primary color to gradient colors
        const primaryColor = this.colors.primary;
        const colorGradient = this.generateColorGradient(primaryColor);
        
        this.loadingSpinner = PixelatedDotLoader.createSpinner({
            parent: this.bottomScreen,
            dotCount: 8,
            radius: 16,
            dotSize: 4,
            pixelation: 1,
            interval: 80,
            zoomOutDuration: 300,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000
        });
    }

    /**
     * Hide loading indicator with zoom animation
     */
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.stop('zoom');
            setTimeout(() => {
                if (this.loadingSpinner) {
                    this.loadingSpinner.destroy();
                    this.loadingSpinner = null;
                }
            }, 400); // Wait for animation to complete
        }
    }
    
    /**
     * Generate color gradient from a base color
     * @param {string} baseColor - Base color in hex format
     * @returns {Array<string>} Array of 4 gradient colors
     */
    generateColorGradient(baseColor) {
        // Parse hex color
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Generate gradient by lightening the color
        const lighten = (amount) => {
            const newR = Math.min(255, r + amount);
            const newG = Math.min(255, g + amount);
            const newB = Math.min(255, b + amount);
            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        };
        
        return [
            baseColor,           // Original
            lighten(30),         // Slightly lighter
            lighten(60),         // Medium lighter
            lighten(90)          // Lightest
        ];
    }

    /**
     * Clear and hide current page
     */
    clearCurrentPage() {
        if (this.currentPage && this.currentPage.destroy) {
            this.currentPage.destroy();
        }
        
        // Remove all page containers
        const pages = this.bottomScreen.querySelectorAll('.page-container');
        pages.forEach(page => page.remove());
    }

    /**
     * Render the storefront view
     */
    renderStorefront() {
        this.currentView = 'storefront';
        this.selectedProduct = null;
        
        // Show loading before clearing page
        this.showLoading();
        
        // Clear current page first
        this.clearCurrentPage();
        
        // Import and render storefront
        import('/content/apps/ultshop/assets/js/pages/StorefrontPage.js').then(module => {
            const StorefrontPage = module.StorefrontPage;
            this.currentPage = new StorefrontPage(this);
            // Restore the page number
            this.currentPage.currentPage = this.storefrontPageNumber;
            
            // Hide loading BEFORE rendering to prevent overlay
            this.hideLoading();
            
            // Render page after loading is hidden
            this.currentPage.render();
        });
    }

    /**
     * Show product detail view
     * @param {object} product - Product to display
     */
    showProductDetail(product) {
        this.selectedProduct = product;
        this.currentView = 'detail';
        
        this.showLoading();
        this.clearCurrentPage();
        
        // Import and render product detail
        import('/content/apps/ultshop/assets/js/pages/ProductDetailPage.js').then(module => {
            const ProductDetailPage = module.ProductDetailPage;
            this.currentPage = new ProductDetailPage(this);
            
            // Hide loading BEFORE rendering to prevent overlay
            this.hideLoading();
            
            // Render page after loading is hidden
            this.currentPage.render();
        });
    }

    /**
     * Show filter page
     */
    showFilterPage() {
        this.currentView = 'filter';
        this.selectedProduct = null;
        
        this.showLoading();
        this.clearCurrentPage();
        
        // Import and render filter page
        import('/content/apps/ultshop/assets/js/pages/FilterPage.js').then(module => {
            const FilterPage = module.FilterPage;
            this.currentPage = new FilterPage(this);
            
            // Hide loading BEFORE rendering to prevent overlay
            this.hideLoading();
            
            // Render page after loading is hidden
            this.currentPage.render();
        });
    }

    /**
     * Show shopping cart view
     */
    showCart() {
        this.currentView = 'cart';
        this.selectedProduct = null;
        
        this.showLoading();
        this.clearCurrentPage();
        
        // Import and render cart
        import('/content/apps/ultshop/assets/js/pages/CartPage.js').then(module => {
            const CartPage = module.CartPage;
            this.currentPage = new CartPage(this);
            
            // Hide loading BEFORE rendering to prevent overlay
            this.hideLoading();
            
            // Render page after loading is hidden
            this.currentPage.render();
        });
    }

    /**
     * Complete checkout process
     */
    checkout() {
        this.cart = [];
        this.currentView = 'complete';
        
        this.showLoading();
        this.clearCurrentPage();
        
        // Import and render purchase complete
        import('/content/apps/ultshop/assets/js/pages/PurchaseCompletePage.js').then(module => {
            const PurchaseCompletePage = module.PurchaseCompletePage;
            this.currentPage = new PurchaseCompletePage(this);
            
            // Hide loading BEFORE rendering to prevent overlay
            this.hideLoading();
            
            // Render page after loading is hidden
            this.currentPage.render();
        });
    }

    /**
     * Add product to cart
     * @param {object} product - Product to add
     */
    addToCart(product) {
        this.cart.push(product);
    }
}
