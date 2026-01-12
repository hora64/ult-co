# Model Loading with AssetCache - Complete Guide

This guide shows how to load 3D models (.glb/.gltf) from your site and cache them in IndexedDB for faster subsequent loads.

## Quick Start

### 1. Import Dependencies

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';
import { assetCache } from '/content/common/utils/AssetCache.js';
```

### 2. Initialize ModelLoader

```javascript
// Create ModelLoader instance
const modelLoader = new ModelLoader({
    THREE: THREE,
    GLTFLoader: GLTFLoader,
    appId: 'myApp',          // Your app ID
    appVersion: '1.0.0'      // Your app version
});
```

### 3. Load a Model with Caching

```javascript
// Load model (automatically caches in IndexedDB)
const gltf = await modelLoader.load('/models/present.glb');

// Add to scene
scene.add(gltf.scene);

// Second load will use cache (much faster!)
const gltf2 = await modelLoader.load('/models/present.glb');
```

## Complete Example

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';

class MyBanner {
    constructor(container, appData) {
        this.container = container;
        this.appData = appData;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.modelLoader = null;
        this.loadedModel = null;
    }

    async init() {
        // Setup THREE.js scene
        this.setupScene();

        // Initialize ModelLoader
        this.modelLoader = new ModelLoader({
            THREE: THREE,
            GLTFLoader: GLTFLoader,
            appId: this.appData.id || 'myApp',
            appVersion: this.appData.version || '1.0.0'
        });

        // Load model with caching
        try {
            console.log('[MyBanner] Loading 3D model...');
            
            const gltf = await this.modelLoader.load(
                '/content/apps/myApp/models/mymodel.glb',
                {
                    useCache: true,          // Use IndexedDB cache
                    forceRefresh: false,     // Don't force network fetch
                    onProgress: (xhr) => {
                        const percent = (xhr.loaded / xhr.total) * 100;
                        console.log(`Loading: ${percent.toFixed(2)}%`);
                    }
                }
            );

            // Add model to scene
            this.loadedModel = gltf.scene;
            this.scene.add(this.loadedModel);

            // Get model info
            const info = this.modelLoader.getModelInfo(gltf);
            console.log('[MyBanner] Model info:', info);

            // Get textures
            const textures = await this.modelLoader.getTextures(gltf);
            console.log(`[MyBanner] Loaded ${textures.length} textures`);

            // Start animation
            this.animate();

            console.log('[MyBanner] Model loaded and cached!');
        } catch (error) {
            console.error('[MyBanner] Failed to load model:', error);
        }
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            400 / 240,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);

        // Create renderer
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(400, 240);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7.5);
        this.scene.add(dirLight);
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;

        // Rotate model
        if (this.loadedModel) {
            this.loadedModel.rotation.y += 0.01;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    cleanup() {
        // Dispose model
        if (this.loadedModel) {
            this.modelLoader.dispose(this.loadedModel);
            this.scene.remove(this.loadedModel);
            this.loadedModel = null;
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
        }

        console.log('[MyBanner] Cleaned up');
    }
}

// Export banner creation function
export async function createBannerScene(canvasElement, appData) {
    const container = canvasElement.parentElement || document.createElement('div');
    const banner = new MyBanner(container, appData);
    await banner.init();

    return {
        scene: banner.scene,
        camera: banner.camera,
        renderer: banner.renderer,
        dispose: () => banner.cleanup(),
        banner
    };
}
```

## Advanced Features

### Preload Multiple Models

```javascript
const modelUrls = [
    '/models/present.glb',
    '/models/platform.glb',
    '/models/character.glb'
];

const models = await modelLoader.preloadModels(modelUrls, {
    onProgress: (current, total, url) => {
        console.log(`Preloading: ${current}/${total} - ${url}`);
    }
});

// Access preloaded models
const present = models.get('/models/present.glb');
const platform = models.get('/models/platform.glb');
```

### Force Refresh from Network

```javascript
// Bypass cache and load fresh from network
const gltf = await modelLoader.load('/models/updated_model.glb', {
    forceRefresh: true
});
```

### Clone Models for Reuse

```javascript
// Load once
const gltf = await modelLoader.load('/models/tree.glb');

// Clone multiple times
const tree1 = modelLoader.clone(gltf);
const tree2 = modelLoader.clone(gltf);
const tree3 = modelLoader.clone(gltf);

// Position clones
tree1.position.set(-5, 0, 0);
tree2.position.set(0, 0, 0);
tree3.position.set(5, 0, 0);

scene.add(tree1, tree2, tree3);
```

### Extract Model Information

```javascript
const gltf = await modelLoader.load('/models/character.glb');
const info = modelLoader.getModelInfo(gltf);

console.log('Bounding box:', info.boundingBox);
console.log('Mesh count:', info.meshCount);
console.log('Material count:', info.materialCount);
console.log('Triangle count:', info.triangleCount);
console.log('Animations:', info.animationCount);
```

### Get Cache Statistics

```javascript
const stats = await modelLoader.getCacheStats();

console.log('App ID:', stats.appId);
console.log('Version:', stats.version);
console.log('Cached models:', stats.models);
console.log('Memory cache:', stats.memoryCache);
console.log('Total cached:', stats.total);
```

### Clear Caches

```javascript
// Clear specific model from memory
modelLoader.clearMemoryCache('/models/old_model.glb');

// Clear all memory caches
modelLoader.clearAllMemoryCaches();

// Clear specific model from IndexedDB
await modelLoader.clearIndexedDBCache('/models/old_model.glb');

// Clear all IndexedDB caches for this app
await assetCache.clearAppCache('myApp');
```

## Integration with Unopened Banner

```javascript
// content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js

import { BaseBanner } from '/content/common/utils/threejs/BaseBanner.js';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';

export class UnopenedBanner extends BaseBanner {
    constructor(container, appData) {
        super(container, appData);
        this.modelLoader = null;
        this.present = null;
    }

    async init() {
        await super.init();

        // Initialize ModelLoader
        this.modelLoader = new ModelLoader({
            THREE: THREE,
            GLTFLoader: GLTFLoader,
            appId: 'homeScreen_3DS',
            appVersion: '1.0.0'
        });

        // Load present model with caching
        try {
            const gltf = await this.modelLoader.load(
                '/content/apps/homeScreen_3DS/assets/models/present_small.glb',
                { useCache: true }
            );

            this.present = gltf.scene;
            this.present.scale.set(0.8, 0.8, 0.8);
            this.bannerRoot.add(this.present);

            // Get textures
            this.gltfTextures = await this.modelLoader.getTextures(gltf);

            console.log('[UnopenedBanner] Model loaded from cache!');
        } catch (error) {
            console.error('[UnopenedBanner] Failed to load model:', error);
        }

        this.startAnimationLoop();
    }

    animate() {
        if (!this.present) return;

        const elapsed = this.clock.getElapsedTime();
        
        // Rotate present
        this.present.rotation.y = elapsed * 0.5;
        
        // Bob up and down
        this.present.position.y = Math.sin(elapsed * 2) * 0.1;
    }

    cleanup() {
        // Dispose model
        if (this.present) {
            this.modelLoader.dispose(this.present);
        }

        super.cleanup();
    }
}
```

## Cache Invalidation

The ModelLoader automatically handles cache invalidation when you update your app version:

```javascript
// app.js
export const app = {
    id: "myApp",
    version: "1.0.1",  // <-- Increment this when models change
    // ... rest of config
};
```

When the version changes, the AssetCache will automatically clear all cached models for your app.

## Performance Benefits

### Without Caching
- **First Load**: Download 2.5MB model from network (~3-5 seconds)
- **Second Load**: Download again (~3-5 seconds)
- **Third Load**: Download again (~3-5 seconds)

### With Caching
- **First Load**: Download and cache (~3-5 seconds)
- **Second Load**: Load from IndexedDB (~0.1-0.5 seconds) ⚡
- **Third Load**: Load from IndexedDB (~0.1-0.5 seconds) ⚡

**Result**: 10-50x faster subsequent loads!

## Best Practices

### 1. Initialize Once per App

```javascript
// Create a singleton instance
let modelLoaderInstance = null;

export function getModelLoader(appData) {
    if (!modelLoaderInstance) {
        modelLoaderInstance = new ModelLoader({
            THREE: THREE,
            GLTFLoader: GLTFLoader,
            appId: appData.id,
            appVersion: appData.version
        });
    }
    return modelLoaderInstance;
}
```

### 2. Preload Critical Models

```javascript
// Preload models during app initialization
async function preloadAssets() {
    const critical = [
        '/models/ui_elements.glb',
        '/models/character.glb'
    ];

    await modelLoader.preloadModels(critical);
    console.log('Critical models preloaded!');
}
```

### 3. Clean Up When Done

```javascript
// Always dispose models when no longer needed
class MyApp {
    destroy() {
        // Dispose all models
        this.models.forEach(model => {
            this.modelLoader.dispose(model);
        });

        // Clear memory caches
        this.modelLoader.clearAllMemoryCaches();
    }
}
```

### 4. Handle Errors Gracefully

```javascript
async function loadModel(url) {
    try {
        const gltf = await modelLoader.load(url);
        return gltf;
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
        
        // Fall back to default model
        const fallback = await modelLoader.load('/models/default.glb');
        return fallback;
    }
}
```

## Troubleshooting

### Model Not Caching

**Problem**: Model loads from network every time

**Solutions**:
1. Check `useCache: true` is set
2. Verify Dexie.js is loaded
3. Check browser supports IndexedDB
4. Verify app version hasn't changed

### Cache Not Clearing

**Problem**: Old models still showing after update

**Solutions**:
1. Increment app version in app.js
2. Manually clear: `await assetCache.clearAppCache('myApp')`
3. Clear browser IndexedDB manually

### Memory Leaks

**Problem**: Memory usage keeps growing

**Solutions**:
1. Call `modelLoader.dispose()` on models
2. Clear memory cache: `modelLoader.clearAllMemoryCaches()`
3. Remove from scene before disposing

### CORS Errors

**Problem**: Can't load models from different domain

**Solutions**:
1. Serve models from same domain
2. Configure CORS headers on server
3. Use relative URLs

## Browser Support

- ✅ Chrome/Edge (80+)
- ✅ Firefox (75+)
- ✅ Safari (14+)
- ❌ IE11 (not supported)

## File Size Recommendations

- **Small models** (<500KB): Always cache
- **Medium models** (500KB-5MB): Cache, consider compression
- **Large models** (>5MB): Consider splitting or using LOD

## Related Documentation

- [AssetCache API Reference](./ASSETCACHE_INTEGRATION_GUIDE.md)
- [BaseBanner Guide](./BASE_BANNER_GUIDE.md)
- [THREE.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

---

**Status**: ✅ **Ready to Use**  
**Last Updated**: 2024  
**Author**: GitHub Copilot
