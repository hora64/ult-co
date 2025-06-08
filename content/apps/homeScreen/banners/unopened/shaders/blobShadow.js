import * as THREE from 'three';

export function createBlobShadow(targetObject, scene, options = {}) {
    // Calculate model dimensions for automatic sizing
    const box = new THREE.Box3().setFromObject(targetObject);
    const size = box.isEmpty() ? new THREE.Vector3(1, 1, 1) : box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.z);
    const modelHeight = size.y;

    // Set default options with model-aware fallbacks
    const {
        color = 0x000000,
        radius = 0.5,
        opacity = 0.5,
        falloff = 0.8,
        scaleFactor = maxDimension * 0.5,  // More accurate default scaling
        fadeDistance = modelHeight * 1.5,  // Better distance calculation
        shadowSize = maxDimension * 1.2    // Better size relative to model
    } = options;

    // Create optimized shader material
    const shadowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uRadius: { value: radius },
            uOpacity: { value: opacity },
            uFalloff: { value: falloff }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = (uv - 0.5) * 2.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform vec3 uColor;
            uniform float uRadius;
            uniform float uOpacity;
            uniform float uFalloff;
            void main() {
                float dist = length(vUv);
                float alpha = 1.0 - smoothstep(uRadius * uFalloff, uRadius, dist);
                gl_FragColor = vec4(uColor, alpha * uOpacity);
            }
        `,
        transparent: true,
        depthWrite: false
    });

    // Create shadow plane
    const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1), // Unit size, scaled by shadowSize
        shadowMaterial
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    shadow.scale.set(shadowSize, shadowSize, shadowSize);
    scene.add(shadow);

    return {
        target: targetObject,
        shadow,
        scaleFactor,
        fadeDistance,
        update() {
            // Get current world position
            const position = new THREE.Vector3();
            this.target.getWorldPosition(position);
            
            // Update shadow position
            this.shadow.position.set(position.x, 0.01, position.z);
            
            // Calculate dynamic properties based on height
            const heightRatio = position.y / this.fadeDistance;
            const scale = this.scaleFactor * (1 + heightRatio * heightRatio);
            this.shadow.scale.setScalar(scale);
            
            // Fade shadow as object gets higher
            const calculatedOpacity = opacity / (1 + heightRatio * heightRatio);
            this.shadow.material.uniforms.uOpacity.value = Math.max(0.1, calculatedOpacity);
        },
        dispose() {
            scene.remove(this.shadow);
            this.shadow.geometry.dispose();
            this.shadow.material.dispose();
        }
    };
}