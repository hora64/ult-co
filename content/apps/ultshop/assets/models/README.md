# UltShop 3D Models

This directory contains 3D model assets for UltShop:

- Product 3D previews
- Store environment models
- UI element models
- Loading animations

## Usage

Models can be loaded using Three.js GLTFLoader:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/content/apps/ultshop/assets/models/product.glb', (gltf) => {
    scene.add(gltf.scene);
});
```

## Format Guidelines

- Format: GLB or GLTF 2.0
- Optimize for web (use Draco compression)
- Keep poly count reasonable (< 50k triangles)
- Include PBR materials
