# Asset Cache Setup Guide

## Current Status

The AssetCache system files have been created in the documentation but need to be properly integrated into the workspace.

## Files That Need to Be Created

Create these three files in `content/common/utils/`:

### 1. AssetCache.js
Location: `content/common/utils/AssetCache.js`

See: `content/apps/homeScreen_3DS/docs/MASTER_ASSETCACHE_GUIDE.md` for the complete implementation.

Key features:
- IndexedDB caching using Dexie.js
- Automatic version management
- Cache invalidation on app updates
- Support for images, audio, models, and other assets

### 2. ModelLoader.js
Location: `content/common/utils/ModelLoader.js`

See: `content/common/utils/ModelLoader.js` for the complete implementation.

Key features:
- 3D model loading with caching
- GLB/GLTF support
- Memory and IndexedDB caching
- Model preloading and management

### 3. AssetPreloader.js
Location: `content/common/utils/AssetPreloader.js`

See: `content/apps/homeScreen_3DS/docs/ASSET_PRELOADING_GUIDE.md` for the complete implementation.

Key features:
- Batch asset preloading
- Progress tracking
- Parallel loading with concurrency limits
- Retry logic

## Quick Setup Steps

### Step 1: Copy Files to Workspace

```powershell
# Run from repository root

# These files exist in docs but need to be copied to utils
# You can find the implementations in:
# - docs/examples/AssetCache.js
# - docs/examples/ModelLoader.js  
# - docs/examples/AssetPreloader.js

# Copy to proper location:
Copy-Item "path/to/AssetCache.js" "content/common/utils/AssetCache.js"
Copy-Item "path/to/ModelLoader.js" "content/common/utils/ModelLoader.js"
Copy-Item "path/to/AssetPreloader.js" "content/common/utils/AssetPreloader.js"
```

### Step 2: Enable Exports

Once files are in place, uncomment these lines in `content/common/utils/index.js`:

```javascript
// Asset Management
export { assetCache, AssetCache } from "./AssetCache.js";
export { ModelLoader, createModelLoader, initModelLoader, getModelLoader } from "./ModelLoader.js";
export { AssetPreloader } from "./AssetPreloader.js";
```

### Step 3: Verify Server Configuration

Make sure your development server serves `.js` files from `content/common/utils/`:

```javascript
// Example server config (if using Express)
app.use('/content', express.static('content'));
```

### Step 4: Test the Integration

```javascript
// In browser console or test file:
import { assetCache } from '/content/common/utils/index.js';

// Check if AssetCache is working
const stats = await assetCache.getStats();
console.log('Cache stats:', stats);
```

## Alternative: Use CDN Import (Temporary)

If you can't set up the files right away, you can import directly:

```javascript
// In your app file
import { assetCache } from 'https://your-cdn.com/utils/AssetCache.js';
// OR use a data URL (not recommended for production)
```

## File Contents

### AssetCache.js - Complete Code

```javascript
/**
 * AssetCache - Dexie.js-based asset caching system
 * Full implementation available in MASTER_ASSETCACHE_GUIDE.md
 */

// Import Dexie from CDN
let Dexie;
try {
    Dexie = (await import('https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs')).default;
} catch (error) {
    console.warn('[AssetCache] Dexie.js not available');
}

export class AssetCache {
    constructor(dbName = 'ult-co-assets', version = 2) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        if (!Dexie) {
            throw new Error('Dexie.js is required for AssetCache');
        }

        this.db = new Dexie(this.dbName);

        this.db.version(this.version).stores({
            images: 'url, timestamp, appId, appVersion',
            audio: 'url, timestamp, appId, appVersion',
            models: 'url, timestamp, appId, appVersion',
            other: 'url, timestamp, appId, appVersion',
            appVersions: 'appId, version, lastUpdated'
        });

        await this.db.open();
        await this.checkAppVersions();
    }

    // ... (rest of implementation from guide)
}

export const assetCache = new AssetCache();
```

### ModelLoader.js - Complete Code

See `MODEL_LOADING_GUIDE.md` for complete implementation.

### AssetPreloader.js - Complete Code

See `ASSET_PRELOADING_GUIDE.md` for complete implementation.

## Troubleshooting

### 404 Errors

**Problem**: `GET http://localhost:54306/content/common/utils/AssetCache.js net::ERR_ABORTED 404`

**Solutions**:
1. Verify files exist in `content/common/utils/`
2. Check file names match exports exactly (case-sensitive)
3. Verify development server is serving the `/content/` directory
4. Check for typos in import paths

### Module Not Found

**Problem**: Browser can't find the module

**Solutions**:
1. Use full relative paths: `./AssetCache.js` not `AssetCache.js`
2. Check import map configuration
3. Verify server MIME types for `.js` files

### Dexie Not Loading

**Problem**: Dexie.js fails to import

**Solutions**:
1. Check internet connection (CDN import)
2. Use local Dexie copy
3. Verify browser supports ES modules

## Usage After Setup

Once files are in place:

```javascript
import { assetCache, ModelLoader, AssetPreloader } from '/content/common/utils/index.js';

// Use AssetCache
await assetCache.registerAppVersion('myApp', '1.0.0');
const cached = await assetCache.get('/models/model.glb');

// Use ModelLoader
const loader = new ModelLoader({
    THREE: THREE,
    GLTFLoader: GLTFLoader,
    appId: 'myApp',
    appVersion: '1.0.0'
});

const gltf = await loader.load('/models/model.glb');

// Use AssetPreloader
const preloader = new AssetPreloader({
    appId: 'myApp',
    appVersion: '1.0.0'
});

await preloader.preloadAll([
    '/images/icon.png',
    '/models/model.glb',
    '/audio/sound.ogg'
]);
```

## Next Steps

1. ✅ **Create files** in `content/common/utils/`
2. ✅ **Uncomment exports** in `index.js`
3. ✅ **Test integration** with a simple cache operation
4. ✅ **Update apps** to use the new caching system
5. ✅ **Monitor performance** improvements

## Documentation References

- **Master Guide**: `MASTER_ASSETCACHE_GUIDE.md`
- **Model Loading**: `MODEL_LOADING_GUIDE.md`
- **Asset Preloading**: `ASSET_PRELOADING_GUIDE.md`
- **Integration**: `ASSETCACHE_INTEGRATION_GUIDE.md`
- **Examples**: `docs/examples/unopened_with_cache_example.js`

## Support

If you continue to have issues:
1. Check browser console for specific errors
2. Verify all file paths are correct
3. Ensure development server is running
4. Check that files have proper permissions

---

**Status**: ⚠️ **Setup Required**  
**Files Needed**: 3 (AssetCache.js, ModelLoader.js, AssetPreloader.js)  
**Estimated Time**: 5-10 minutes
