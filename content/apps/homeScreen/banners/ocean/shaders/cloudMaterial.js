import * as THREE from 'three';
export function createCloudMaterial(options = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      camPos: { value: options.camPos || new THREE.Vector3() },
      fresnelPower: { value: options.fresnelPower || 0.5 },
      time: { value: options.time || 0 },
      lightIntensity: { value: options.lightIntensity || 1.0 },
      lightColor: { value: options.lightColor|| new THREE.Color(0xffffff) },
      rainIntensity: { value: options.rainIntensity || 0 },
      tintColor: { value: options.tintColor || new THREE.Color(0xffffff) },
      tintIntensity: { value: options.tintIntensity || 0.0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vHeight;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(cameraPosition - worldPosition.xyz);
        float minY = -0.5;
        float maxY = 0.5;
        vHeight = clamp((position.y - minY) / (maxY - minY), 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float fresnelPower;
      uniform float time;
      uniform float lightIntensity;
      uniform vec3 lightColor;
      uniform float rainIntensity;
      uniform vec3 tintColor;
      uniform float tintIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vHeight;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewDir);
        float fresnel = pow(clamp(1.0 - dot(normal, viewDir), 0.0, 1.0), fresnelPower);
        
        vec3 topColor = mix(vec3(0.3, 0.3, 0.4), vec3(1.0, 1.0, 1.0), lightIntensity);
        vec3 midColor = mix(vec3(0.2, 0.2, 0.3), vec3(0.5, 0.5, 0.5), lightIntensity);
        vec3 bottomColor = mix(vec3(0.1, 0.1, 0.2), vec3(0.2, 0.2, 0.2), lightIntensity);
        
        // Darken clouds when raining
        if (rainIntensity > 0.0) {
          topColor = mix(topColor, topColor * 0.7, rainIntensity);
          midColor = mix(midColor, midColor * 0.7, rainIntensity);
          bottomColor = mix(bottomColor, bottomColor * 0.7, rainIntensity);
        }
        
        float safeHeight = clamp(vHeight, 0.0, 1.0);
        vec3 color;
        
        if(safeHeight > 0.8) {
          color = topColor;
        } else if(safeHeight > 0.3) {
          float t = (safeHeight - 0.3) / 0.5;
          color = mix(midColor, topColor, clamp(t, 0.0, 1.0));
        } else {
          float t = safeHeight / 0.3;
          color = mix(bottomColor, midColor, clamp(t, 0.0, 1.0));
        }
        
        color *= mix(vec3(0.7), vec3(1.0), lightIntensity);
        color = mix(color, vec3(1.0), clamp(fresnel * 0.3, 0.0, 0.3));
        color = max(color, vec3(0.3));
        
        // Apply tint
        color = mix(color, color * tintColor, tintIntensity);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });
}