import * as THREE from 'three';
export function createSkyMaterial(timeSystem, skyRadius, options = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: `
      varying vec3 vPos; 
      void main() { 
        vPos = normalize(position); 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
      }`,
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3 topColor;
      uniform vec3 middleColor;
      uniform vec3 bottomColor;
      uniform vec3 tintColor;
      uniform float tintIntensity;
      
      void main() {
        float f = clamp(vPos.y, 0., 1.);
        vec3 col = mix(middleColor, topColor, f); 
        col = mix(col, bottomColor, pow(f, 1.5)); 
        col = mix(col, col * tintColor, tintIntensity);
        gl_FragColor = vec4(col, 1);
      }`,
    uniforms: {
      topColor: { value: options.topColor || timeSystem.currentSkyColors.top },
      middleColor: { value: options.middleColor || timeSystem.currentSkyColors.middle },
      bottomColor: { value: options.bottomColor || timeSystem.currentSkyColors.bottom },
      tintColor: { value: options.tintColor || new THREE.Color(0xffffff) },
      tintIntensity: { value: options.tintIntensity || 0.0 }
    }
  });
}