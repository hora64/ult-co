# Sky Material Consolidation

## Overview
Consolidated the sky shader implementation from multiple apps into a single, reusable `SkyMaterial` class in the common utilities directory.

## Changes Made

### 1. **Updated Common SkyMaterial** (`content/common/utils/threejs/materials/SkyMaterial.js`)
   - Enhanced with sun and moon halo support
   - Added `vWorldPosition` varying for proper view direction calculations
   - Added new uniforms:
     - `sunPosition`: Position of the sun for halo effect
     - `moonPosition`: Position of the moon for halo effect
     - `sunHaloIntensity`: Controls sun halo brightness (default: 0.3)
     - `moonHaloIntensity`: Controls moon halo brightness (default: 0.3)
   - Halos only render when above horizon (`vPos.y > 0.0`)
   - Improved gradient calculation: `mix(col, bottomColor, pow(1.0 - f, 1.5))`

### 2. **Updated Mail App** (`content/apps/mail/assets/js/topScreen3D.js`)
   - Removed custom `_createSkyMaterial` shader code
   - Now imports and uses `SkyMaterial` from common utilities
   - Simplified `_createSkyMaterial` method to instantiate `SkyMaterial` class
   - Added sun/moon position updates in animation loop
   - Changed from hemisphere to full sphere geometry

### 3. **Updated Ocean Demo** (`content/apps/oceanDemo/banner/shaders/skyMaterial.js`)
   - Changed from custom `THREE.ShaderMaterial` to using common `SkyMaterial`
   - Maintained backward compatibility with `createSkyMaterial` function
   - Added support for sun/moon halos (disabled by default with intensity 0.0)

## Features

### Sky Gradient
- Natural gradient from bottom → middle → top colors
- Uses improved power function for smoother transitions
- Properly handles full sphere geometry (both upper and lower hemispheres)

### Sun & Moon Halos
- Optional halo effects around sun and moon
- Configurable intensity (0.0 = off, higher = more visible)
- Sun halo: Warm yellowish glow (0.9, 0.9, 0.8)
- Moon halo: Cool bluish glow (0.7, 0.8, 1.0)
- Power factor of 30 for focused, realistic halos
- Only renders above horizon for realism

### Tint System
- Optional color tinting for atmospheric effects
- Controlled by `tintColor` and `tintIntensity`
- Useful for weather effects, time-of-day adjustments

## Usage Examples

### Basic Usage (Mail App)
```javascript
import { SkyMaterial } from '/content/common/utils/threejs/materials/SkyMaterial.js';

const skyMaterial = new SkyMaterial({
    topColor: timeSystem.skyColors.morning.top,
    middleColor: timeSystem.skyColors.morning.middle,
    bottomColor: timeSystem.skyColors.morning.bottom,
    sunPosition: timeSystem.sunPosition,
    moonPosition: timeSystem.moonPosition,
    sunHaloIntensity: 0.3,
    moonHaloIntensity: 0.3
});

// Update colors and positions in animation loop
skyMaterial.uniforms.topColor.value.copy(newTopColor);
skyMaterial.uniforms.sunPosition.value.copy(newSunPosition);
```

### Advanced Usage with Tinting
```javascript
const skyMaterial = new SkyMaterial({
    topColor: new THREE.Color(0x73a8f0),
    middleColor: new THREE.Color(0x75b7f1),
    bottomColor: new THREE.Color(0xadd4f6),
    tintColor: new THREE.Color(0xff8844),
    tintIntensity: 0.2, // Warm sunset tint
    sunHaloIntensity: 0.5,
    moonHaloIntensity: 0.0
});
```

### Ocean Demo Compatibility
```javascript
import { createSkyMaterial } from './shaders/skyMaterial.js';

// Maintains old function signature for backward compatibility
const skyMaterial = createSkyMaterial(timeSystem, skyRadius, {
    tintColor: new THREE.Color(0xffffff),
    tintIntensity: 0.1
});
```

## Benefits

1. **Code Reusability**: Single source of truth for sky rendering
2. **Maintainability**: Bug fixes and improvements apply to all apps
3. **Performance**: Optimized shader code shared across apps
4. **Consistency**: Same visual quality across different scenes
5. **Extensibility**: Easy to add new features (stars, aurora, etc.)
6. **Backward Compatible**: Existing apps continue to work without changes

## Migration Guide

To migrate an app using custom sky shaders:

1. Import `SkyMaterial`:
   ```javascript
   import { SkyMaterial } from '/content/common/utils/threejs/materials/SkyMaterial.js';
   ```

2. Replace custom shader with class instantiation:
   ```javascript
   // Old
   const skyMaterial = new THREE.ShaderMaterial({ /* custom shader */ });
   
   // New
   const skyMaterial = new SkyMaterial({ /* options */ });
   ```

3. Update uniform references if needed:
   ```javascript
   // Access uniforms the same way
   skyMaterial.uniforms.topColor.value.copy(newColor);
   ```

4. Add sun/moon position updates (optional):
   ```javascript
   skyMaterial.uniforms.sunPosition.value.copy(sunPos);
   skyMaterial.uniforms.moonPosition.value.copy(moonPos);
   ```

## Performance Notes

- Conditional halo rendering (`if (vPos.y > 0.0)`) prevents unnecessary calculations
- Halos disabled by setting intensity to 0.0 (completely skipped in shader)
- Single `normalize()` call on vertex position in vertex shader
- Efficient gradient calculation using power functions

## Future Enhancements

Potential additions to consider:
- [ ] Star field rendering for night sky
- [ ] Aurora borealis effect
- [ ] Cloud layer integration
- [ ] Atmospheric scattering
- [ ] Procedural nebula
- [ ] Time-of-day preset system

## Testing

Tested and working in:
- ✅ Mail App (with day/night cycle)
- ✅ Ocean Demo Banner
- ✅ Full sphere geometry
- ✅ Custom time system integration
- ✅ Sun and moon halo effects

## Related Files

- `content/common/utils/threejs/materials/SkyMaterial.js` - Main shader class
- `content/apps/mail/assets/js/topScreen3D.js` - Mail app implementation
- `content/apps/oceanDemo/banner/shaders/skyMaterial.js` - Ocean demo wrapper
- `content/common/utils/threejs/materials/CloudMaterial.js` - Complementary cloud shader
- `content/common/utils/threejs/materials/FFLShaderMaterial.js` - Related material system

## Build Status

✅ All builds successful
✅ No TypeScript/compilation errors
✅ Backward compatible with existing apps
