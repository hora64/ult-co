import * as THREE from "three";

export class SkyMaterial extends THREE.ShaderMaterial {
    constructor(options = {}) {
        super({
            side: THREE.BackSide,
            vertexShader: `
                varying vec3 vPos;
                varying vec3 vWorldPosition;
                void main() {
                    vPos = normalize(position);
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                varying vec3 vPos;
                varying vec3 vWorldPosition;
                uniform vec3 topColor;
                uniform vec3 middleColor;
                uniform vec3 bottomColor;
                uniform vec3 tintColor;
                uniform float tintIntensity;
                uniform vec3 sunPosition;
                uniform vec3 moonPosition;
                uniform float sunHaloIntensity;
                uniform float moonHaloIntensity;

                void main() {
                    float f = clamp(vPos.y, 0.0, 1.0);
                    vec3 col = mix(middleColor, topColor, f);
                    col = mix(col, bottomColor, pow(1.0 - f, 1.5));
                    col = mix(col, col * tintColor, tintIntensity);
                    
                    // Add sun and moon halos only when above horizon
                    if (vPos.y > 0.0 && (sunHaloIntensity > 0.0 || moonHaloIntensity > 0.0)) {
                        vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
                        
                        if (sunHaloIntensity > 0.0) {
                            float sunHaloPower = max(0.0, pow(max(0.0, dot(normalize(sunPosition), viewDirection)), 30.0));
                            col = mix(col, vec3(0.9, 0.9, 0.8) * sunHaloPower, sunHaloPower * sunHaloIntensity);
                        }
                        
                        if (moonHaloIntensity > 0.0) {
                            float moonHaloPower = max(0.0, pow(max(0.0, dot(normalize(moonPosition), viewDirection)), 30.0));
                            col = mix(col, vec3(0.7, 0.8, 1.0) * moonHaloPower, moonHaloPower * moonHaloIntensity);
                        }
                    }
                    
                    gl_FragColor = vec4(col, 1.0);
                }`,
            uniforms: {
                topColor: { value: options.topColor || new THREE.Color(0.9, 1.0, 1.3) },
                middleColor: { value: options.middleColor || new THREE.Color(0.5, 0.8, 1.1) },
                bottomColor: { value: options.bottomColor || new THREE.Color(0.2, 0.4, 0.9) },
                tintColor: { value: options.tintColor || new THREE.Color(0xffffff) },
                tintIntensity: { value: options.tintIntensity || 0.0 },
                sunPosition: { value: options.sunPosition || new THREE.Vector3(0, 1, 0) },
                moonPosition: { value: options.moonPosition || new THREE.Vector3(0, -1, 0) },
                sunHaloIntensity: { value: options.sunHaloIntensity !== undefined ? options.sunHaloIntensity : 0.3 },
                moonHaloIntensity: { value: options.moonHaloIntensity !== undefined ? options.moonHaloIntensity : 0.3 }
            },
        });
    }
}
