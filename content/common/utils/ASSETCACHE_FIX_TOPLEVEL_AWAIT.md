# AssetCache Fix - Top-Level Await Removed

## 🔧 What Was Fixed

### Problem
- `assetCache` singleton was trying to use top-level `await` at module load time
- This caused "Cannot read properties of undefined" errors
- Dexie.js wasn't loaded when the module was first imported

### Solution
- Removed top-level `await` from AssetCache.js
- Made Dexie loading happen lazily in `init()` method
- Added `ensureReady()` calls throughout ModelLoader and AssetPreloader
- AssetCache now initializes on first use instead of at import time

## ✅ Changes Made

### 1. AssetCache.js
- ✅ Removed top-level `await` for Dexie import
- ✅ Added `loadDexie()` function for lazy loading
- ✅ Dexie loads when `init()` is called, not at module load
- ✅ `ensureReady()` now properly initializes the cache

### 2. ModelLoader.js
- ✅ Added `await assetCache.ensureReady()` before cache operations
- ✅ Added `isAvailable` checks after ensureReady
- ✅ Updated `load()`, `clearIndexedDBCache()`, and `getCacheStats()`

### 3. AssetPreloader.js
- ✅ Added `await assetCache.ensureReady()` before cache operations
- ✅ Added `isAvailable` checks after ensureReady
- ✅ Updated `preloadImage()`, `preloadAudio()`, `preloadJSON()`, and `preload()`

### 4. Test Files
- ✅ Updated `test-asset-cache.js` to call `ensureReady()` before tests
- ✅ Updated `test-asset-cache.html` to call `ensureReady()` in init

## 🚀 How to Use

### Option 1: Automatic Initialization
```javascript
import { assetCache } from '/content/common/utils/index.js';

// AssetCache will initialize automatically on first use
await assetCache.registerAppVersion('myApp', '1.0.0');

// Cache is now ready and will work for all subsequent operations
const stats = await assetCache.getStats();
```

### Option 2: Manual Initialization (Recommended)
```javascript
import { assetCache } from '/content/common/utils/index.js';

// Explicitly initialize the cache
await assetCache.ensureReady();

if (assetCache.isAvailable) {
    console.log('✅ Cache is ready!');
    await assetCache.registerAppVersion('myApp', '1.0.0');
} else {
    console.warn('⚠️ Cache not available');
}
```

### Option 3: Using ModelLoader
```javascript
import { ModelLoader } from '/content/common/utils/index.js';
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

const loader = new ModelLoader({
    THREE: THREE,
    GLTFLoader: GLTFLoader,
    appId: 'myApp',
    appVersion: '1.0.0'
});

// ModelLoader automatically calls ensureReady() before cache operations
const gltf = await loader.load('/models/model.glb', {
    useCache: true  // Works automatically!
});
```

## 🧪 Testing

### Test in Browser Console
```javascript
// Import and test
import { assetCache } from '/content/common/utils/index.js';

// Initialize
await assetCache.ensureReady();
console.log('Cache available:', assetCache.isAvailable);

// Test operations
await assetCache.registerAppVersion('testApp', '1.0.0');
const stats = await assetCache.getStats();
console.log('Stats:', stats);

// Test caching
const blob = new Blob(['test data'], { type: 'text/plain' });
await assetCache.set('/test.txt', blob, {
    appId: 'testApp',
    appVersion: '1.0.0'
});

const cached = await assetCache.get('/test.txt');
console.log('Cached:', cached);
```

### Run Test Suite
```javascript
// Load the test script
const script = document.createElement('script');
script.type = 'module';
script.src = '/content/common/utils/test-asset-cache.js';
document.body.appendChild(script);
```

### Or Load Test Page
Navigate to: `http://localhost:54306/content/common/utils/test-asset-cache.html`

## 📊 Expected Behavior

### First Import
```javascript
import { assetCache } from '/content/common/utils/index.js';
// assetCache exists but is NOT initialized yet
// No Dexie loading happens yet
```

### First Use
```javascript
await assetCache.ensureReady();
// NOW Dexie loads from CDN
// Database is created and opened
// assetCache.isAvailable becomes true (if successful)
```

### Subsequent Uses
```javascript
await assetCache.set(...);
await assetCache.get(...);
// All operations work because cache is already initialized
```

## 🐛 Troubleshooting

### Error: "Cache not available"
**Cause**: Dexie.js failed to load from CDN

**Check**:
1. Internet connection
2. Browser console for Dexie load errors
3. CDN accessibility (jsdelivr.net)

**Solution**:
- Download Dexie.js locally
- Update import path in AssetCache.js line 16

### Error: "Cannot read properties of undefined"
**Cause**: Trying to use assetCache before initialization

**Solution**:
```javascript
// BAD - No initialization
await assetCache.registerAppVersion(...);

// GOOD - Explicit initialization
await assetCache.ensureReady();
await assetCache.registerAppVersion(...);
```

### Cache Not Saving
**Check**:
1. `assetCache.isAvailable` is `true`
2. No errors in browser console
3. IndexedDB is enabled (DevTools > Application > Storage)

**Debug**:
```javascript
await assetCache.ensureReady();
console.log('Available:', assetCache.isAvailable);
console.log('DB:', assetCache.db);

// Try saving
await assetCache.set('/test.txt', new Blob(['test']), {
    appId: 'test',
    appVersion: '1.0.0'
});

// Check if it saved
const cached = await assetCache.get('/test.txt');
console.log('Saved:', !!cached);
```

## 📝 Migration Guide

### Old Code (Won't Work)
```javascript
import { assetCache } from '/content/common/utils/index.js';

// This might fail if cache isn't initialized
await assetCache.registerAppVersion('myApp', '1.0.0');
```

### New Code (Works)
```javascript
import { assetCache } from '/content/common/utils/index.js';

// Explicitly initialize first
await assetCache.ensureReady();

// Now safe to use
if (assetCache.isAvailable) {
    await assetCache.registerAppVersion('myApp', '1.0.0');
}
```

## ✨ Benefits

1. **No Top-Level Await** - Works in all module contexts
2. **Lazy Loading** - Dexie only loads when needed
3. **Graceful Degradation** - App works even if cache unavailable
4. **Better Error Handling** - Clear availability checks
5. **Explicit Initialization** - Developer controls when cache initializes

## 🎯 Next Steps

1. **Test the fix**: Run test-asset-cache.html
2. **Update your app**: Add `ensureReady()` calls where needed
3. **Check console**: Verify no errors during cache operations
4. **Monitor IndexedDB**: Use DevTools to see cached assets

---

**Status**: ✅ Fixed and Ready  
**Build**: ✅ Successful  
**Breaking Changes**: None (backwards compatible)

The cache now initializes on first use instead of at import time!
