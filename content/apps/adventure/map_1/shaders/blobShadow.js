import * as THREE from 'three';

/**
 * Creates and manages a blob shadow for a given 3D object.
 * @param {THREE.Object3D} targetObject - The object to cast the shadow.
 * @param {THREE.Scene} scene - The Three.js scene to add the shadow to.
 * @param {object} [options] - Configuration options for the shadow.
 * @param {number} [options.color=0x000000] - Color of the shadow.
 * @param {number} [options.shadowRadius=0.2] - Visual radius of the shadow effect.
 * @param {number} [options.opacity=0.5] - Opacity of the shadow.
 * @param {number} [options.falloff=0.8] - Falloff of the shadow's edges.
 * @param {number} [options.fadeDistance=5] - Distance over which the shadow fades with height.
 * @param {number} [options.shadowPlaneSize=1.5] - Size of the shadow plane geometry.
 * @returns {{target: THREE.Object3D, shadow: THREE.Mesh, update: Function, dispose: Function}} Shadow instance with update and dispose methods.
 */
export function createBlobShadow(targetObject, scene, options = {}) {
    const {
        color = 0x000000,
        shadowRadius = 0.2, // Lowered default radius
        opacity = 0.5,
        falloff = 0.8,
        fadeDistance = 5,
        shadowPlaneSize = 1.5 // Renamed for clarity
    } = options;

    const shadowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uRadius: { value: shadowRadius }, // Use the new shadowRadius
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

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(shadowPlaneSize, shadowPlaneSize), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01; // Slightly above the plane to avoid z-fighting
    scene.add(shadow);

    return {
        target: targetObject,
        shadow,
        update() {
            const pos = new THREE.Vector3();
            this.target.getWorldPosition(pos);
            this.shadow.position.set(pos.x, 0.01, pos.z); // Keep shadow on the ground plane
            const height = pos.y; // Get the height of the object
            // Adjust scale and opacity based on height
            const dynamicScale = 1.0 + (height / fadeDistance) ** 2; // Use fadeDistance from closure
            this.shadow.scale.set(dynamicScale, dynamicScale, dynamicScale);
            const dynamicOpacity = 1.0 / (1.0 + (height / fadeDistance) ** 2);
            this.shadow.material.uniforms.uOpacity.value = Math.max(0.2, dynamicOpacity * opacity); // Use initial opacity from closure
        },
        dispose() {
            scene.remove(this.shadow);
            this.shadow.geometry.dispose();
            this.shadow.material.dispose();
        }
    };
}
