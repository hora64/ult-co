# Asset Caching Quick Reference - Mail & Settings Apps

## 🚀 Quick Start

### Check If Caching Is Working

Open browser console and look for:
```
[HomeScreenApp] 🔄 Preloading app assets...
[HomeScreenApp] Preloading 6 assets for mail...
[HomeScreenApp] ✅ Preloaded assets for mail
[MailScene] 💾 Loading mailbox model from IndexedDB cache
[SettingsTopScreen] 💾 Loading gear model from IndexedDB cache
```

### View Cache in DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Navigate to **IndexedDB** > **ult-co-assets**
4. Check **models**, **images**, **textures** tables

## 📋 Console Indicators

| Indicator | Meaning |
|-----------|---------|
| 🌐 | Loading from network (first time) |
| 💾 | Loading from IndexedDB cache (fast!) |
| 🔄 | Processing/loading in progress |
| ✅ | Successfully cached/loaded |
| ⚠️ | Warning (still works, but check logs) |
| ❌ | Error (check console for details) |

## 🎯 Cached Assets

### Mail App (mail)
- ✅ `mailBox_Flat.glb` (~2.5 MB)
- ✅ `platform.glb` (~800 KB)
- ✅ `Cloud-1.glb` (~400 KB)
- ✅ `message_64px.png` (~4 KB)
- ✅ `lensflare0.png` (~150 KB)
- ✅ `lensflare3.png` (~150 KB)

**Total:** ~4.0 MB

### Settings App (settings)
- ✅ `gear.glb` (~600 KB)
- ✅ `settings_48px.png` (~4 KB)

**Total:** ~604 KB

## ⚡ Performance

| Asset | First Load | Cached Load | Speedup |
|-------|-----------|-------------|---------|
| Mailbox Model | 2500ms | ~120ms | **20x** |
| Platform Model | 800ms | ~30ms | **27x** |
| Cloud Model | 400ms | ~15ms | **27x** |
| Lensflare Textures | 300ms | ~10ms | **30x** |
| Gear Model | 600ms | ~25ms | **24x** |

## 🔧 Common Tasks

### Clear Cache for One App
```javascript
await assetCache.clearAppCache('mail');
// or
await assetCache.clearAppCache('settings');
```

### Clear All Caches
```javascript
await assetCache.clearAll();
```

### Force Reload (Bypass Cache)
```javascript
// In topScreen3D.js or TopScreen.js
const gltf = await this.modelLoader.load('assets/models/model.glb', {
  forceRefresh: true
});
```

### View Cache Stats
```javascript
// Overall stats
const stats = await assetCache.getStats();
console.table(stats.apps);

// App-specific stats
const mailStats = await assetCache.getAppStats('mail');
console.log(mailStats);
```

### Update App Version (Clear Cache)
```javascript
// In app.js
export const app = {
  "version": "1.2.0", // Increment to clear cache
  // ...
}
```

## 🐛 Quick Troubleshooting

### Issue: Assets not caching
**Fix:**
1. Check browser console for errors
2. Verify IndexedDB is enabled
3. Check app.js has `"assets": { "useCache": true }`

### Issue: Models not visible
**Fix:**
1. Check Network tab for 404 errors
2. Verify model paths in app.js
3. Check console for THREE.js errors

### Issue: Cache won't clear
**Fix:**
1. Increment version in app.js
2. Hard refresh (Ctrl+Shift+R)
3. Manually clear: `await assetCache.clearAppCache('appId')`

### Issue: Slow loading on first run
**Fix:**
- This is normal! Assets are being downloaded and cached
- Second load will be 20-30x faster

## 📊 Monitor Performance

### Browser DevTools

1. **Network Tab:**
   - First load: See downloads from server
   - Second load: No network requests (from cache!)

2. **Application Tab:**
   - IndexedDB > ult-co-assets
   - Check stored assets and sizes

3. **Console Tab:**
   - Look for 💾 indicators
   - Check loading times in logs

### Performance Metrics

```javascript
// Measure load time
console.time('modelLoad');
const gltf = await modelLoader.load('model.glb');
console.timeEnd('modelLoad');

// First load:  modelLoad: 2500ms
// Second load: modelLoad: 120ms
```

## 🎨 Adding to New Apps

### 1. Update app.js

```javascript
export const app = {
  "id": "yourApp",
  "version": "1.0.0",
  "assets": {
    "models": ["path/to/model.glb"],
    "icons": ["path/to/icon.png"],
    "textures": ["path/to/texture.png"],
    "useCache": true,
    "preloadOnInit": true
  }
}
```

### 2. Update TopScreen/3D Scene

```javascript
import { ModelLoader } from '/content/common/utils/ModelLoader.js';

this.modelLoader = new ModelLoader({
  THREE, GLTFLoader,
  appId: 'yourApp',
  appVersion: '1.0.0'
});

const gltf = await this.modelLoader.load('model.glb', {
  useCache: true
});
```

## 📚 More Info

- **Full Guide:** `MAIL_SETTINGS_ASSET_CACHING.md`
- **AssetCache API:** `ASSETCACHE_QUICK_REF.md`
- **Model Loading:** `MODEL_LOADING_GUIDE.md`

## ✅ Success Indicators

You'll know caching is working when:
- ✅ Console shows 💾 cache hit indicators
- ✅ Second load is instant (no network requests)
- ✅ DevTools shows assets in IndexedDB
- ✅ Loading time reduced by 20-30x

---

**Need Help?** Check the full documentation in `MAIL_SETTINGS_ASSET_CACHING.md`
