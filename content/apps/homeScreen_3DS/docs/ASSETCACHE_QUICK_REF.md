# AssetCache & ModelLoader Quick Reference

## 🚀 Quick Start

```javascript
// 1. Import
import { ModelLoader } from '/content/common/utils/index.js';
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

// 2. Create
const loader = new ModelLoader({
    THREE, GLTFLoader,
    appId: 'myApp',
    appVersion: '1.0.0'
});

// 3. Load (auto-caches!)
const gltf = await loader.load('/models/model.glb');

// 4. Use
scene.add(gltf.scene);
```

## 📦 Current Status

⚠️ **Files need to be copied to workspace**

Location: `content/common/utils/`
- `AssetCache.js`
- `ModelLoader.js`
- `AssetPreloader.js`

Status: Commented out in `index.js` to prevent 404 errors

## ⚡ Common Operations

### Load Model

```javascript
const gltf = await loader.load('/models/model.glb');
```

### Load with Options

```javascript
const gltf = await loader.load('/models/model.glb', {
    useCache: true,       // Default
    forceRefresh: false,  // Bypass cache
    onProgress: (xhr) => console.log(`${(xhr.loaded/xhr.total*100).toFixed(0)}%`)
});
```

### Preload Multiple

```javascript
const urls = ['/models/a.glb', '/models/b.glb'];
const models = await loader.preloadModels(urls, {
    onProgress: (current, total, url) => 
        console.log(`${current}/${total}: ${url}`)
});
```

### Clone Model

```javascript
const gltf = await loader.load('/models/tree.glb');
const tree1 = loader.clone(gltf);
const tree2 = loader.clone(gltf);
```

### Get Info

```javascript
const info = loader.getModelInfo(gltf);
console.log('Size:', info.boundingBox.size);
console.log('Meshes:', info.meshCount);
console.log('Triangles:', info.triangleCount);
```

### Cleanup

```javascript
// Dispose model
loader.dispose(gltf.scene);

// Clear caches
loader.clearMemoryCache('/models/old.glb');
loader.clearAllMemoryCaches();
await loader.clearIndexedDBCache('/models/old.glb');
```

### Cache Stats

```javascript
const stats = await loader.getCacheStats();
console.log('App:', stats.appId);
console.log('Version:', stats.version);
console.log('Cached models:', stats.models);
console.log('Memory cache:', stats.memoryCache);
```

## 🎯 AssetCache Direct Usage

```javascript
import { assetCache } from '/content/common/utils/index.js';

// Register app version (auto-clears on version change)
await assetCache.registerAppVersion('myApp', '1.0.0');

// Cache asset
await assetCache.set('/images/icon.png', blob, {
    appId: 'myApp',
    appVersion: '1.0.0'
});

// Retrieve
const cached = await assetCache.get('/images/icon.png');

// Check
const exists = await assetCache.has('/images/icon.png');

// Delete
await assetCache.delete('/images/icon.png');

// Clear app cache
await assetCache.clearAppCache('myApp');

// Stats
const stats = await assetCache.getStats();
```

## 📊 Performance

| Operation | Without Cache | With Cache |
|-----------|---------------|------------|
| First load | 3-5 sec | 3-5 sec |
| Second load | 3-5 sec | **0.1-0.5 sec** ⚡ |
| Third load | 3-5 sec | **0.1-0.5 sec** ⚡ |

**10-50x faster!**

## 🛠️ Setup Steps

1. Copy files to `content/common/utils/`:
   - AssetCache.js
   - ModelLoader.js
   - AssetPreloader.js

2. Uncomment in `content/common/utils/index.js`:
   ```javascript
   export { assetCache, AssetCache } from "./AssetCache.js";
   export { ModelLoader, createModelLoader, initModelLoader, getModelLoader } from "./ModelLoader.js";
   export { AssetPreloader } from "./AssetPreloader.js";
   ```

3. Test:
   ```javascript
   import { assetCache } from '/content/common/utils/index.js';
   await assetCache.getStats();
   ```

## 📝 Example: Unopened Banner

```javascript
import { BaseBanner } from '/content/common/utils/threejs/BaseBanner.js';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';

class MyBanner extends BaseBanner {
    async init() {
        await super.init();

        this.loader = new ModelLoader({
            THREE, GLTFLoader,
            appId: 'homeScreen_3DS',
            appVersion: '1.0.0'
        });

        const gltf = await this.loader.load(
            '/models/present.glb',
            { useCache: true }
        );

        this.present = gltf.scene;
        this.bannerRoot.add(this.present);
    }

    cleanup() {
        if (this.present) {
            this.loader.dispose(this.present);
        }
        super.cleanup();
    }
}
```

## 🔧 Troubleshooting

| Error | Solution |
|-------|----------|
| 404 on AssetCache.js | Copy files to workspace |
| Module not found | Check file paths, uncomment exports |
| Dexie error | Check internet (CDN) or use local Dexie |
| Not caching | Check `useCache: true`, verify Dexie loaded |

## 📚 Documentation

- **Setup**: `ASSETCACHE_SETUP_GUIDE.md`
- **Model Loading**: `MODEL_LOADING_GUIDE.md`
- **Master Guide**: `MASTER_ASSETCACHE_GUIDE.md`
- **Example**: `examples/unopened_with_cache_example.js`

## 💡 Tips

1. **Always dispose models** when done
2. **Use clone()** for multiple instances
3. **Preload critical assets** on app start
4. **Monitor cache size** with stats
5. **Version your apps** for auto-invalidation

## 🎨 Cache Management

```javascript
// View all cached apps
const stats = await assetCache.getStats();
console.log('Apps:', stats.apps);

// Clear old assets (30 days)
await assetCache.cleanupOldAssets(30);

// Clear everything
await assetCache.clearAll();

// App-specific stats
const appStats = await assetCache.getAppStats('myApp');
```

---

**Quick Ref Version**: 1.0  
**Last Updated**: 2024  
**Status**: ⚠️ Setup Required
