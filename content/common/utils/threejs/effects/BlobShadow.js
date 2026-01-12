import * as THREE from 'three';

/**
 * Creates a blob shadow for a given object on a horizontal plane.
 * @param {THREE.Object3D} targetObject - The object casting the shadow.
 * @param {THREE.Scene} scene - The scene to add the shadow to.
 * @param {object} options - Configuration options for the shadow.
 * @returns {object} An object with update and dispose methods.
 */
export function createBlobShadow(targetObject, scene, options = {}) {
    const {
        color = 0x000000,
        shadowRadius = 0.2,
        opacity = 0.5,
        falloff = 0.8,
        shadowPlaneSize = 1.5
    } = options;

    const shadowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uRadius: { value: shadowRadius },
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
    shadow.position.y = 0.01;
    scene.add(shadow);

    return {
        target: targetObject,
        shadow,
        update() {
            const pos = new THREE.Vector3();
            this.target.getWorldPosition(pos);
            this.shadow.position.set(pos.x, 0.01, pos.z);
        },
        dispose() {
            scene.remove(this.shadow);
            this.shadow.geometry.dispose();
            this.shadow.material.dispose();
        }
    };
}
