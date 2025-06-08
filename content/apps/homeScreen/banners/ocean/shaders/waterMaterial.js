import * as THREE from 'three';
export function createWaterMaterial(options = {}) {
  const loader = new THREE.TextureLoader();
  const tex1 = loader.load(options.textureOne || 'banners/ocean/textures/water1.png');
  const tex2 = loader.load(options.textureTwo || 'banners/ocean/textures/water2.png');
  [tex1, tex2].forEach(tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  });

  return new THREE.ShaderMaterial({
    uniforms: {
      tex1: { value: tex1 },
      tex2: { value: tex2 },
      time: { value: options.time || 0 },
      sunDirection: { value: options.sunDirection || new THREE.Vector3(5, 5, 5).normalize() },
      moonDirection: { value: options.moonDirection || new THREE.Vector3(-5, 5, -5).normalize() },
      lightIntensity: { value: options.lightIntensity || 1.0 },
      lightColor: { value: options.lightColor || new THREE.Color(0xffffff) },
      ambientIntensity: { value: options.ambientIntensity || 0.3 },
      rainIntensity: { value: options.rainIntensity || 0 },
      tintColor: { value: options.tintColor || new THREE.Color(0xffffff) },
      tintIntensity: { value: options.tintIntensity || 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv * 7.5;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tex1, tex2;
      uniform float time;
      uniform vec3 sunDirection;
      uniform vec3 moonDirection;
      uniform float lightIntensity;
      uniform vec3 lightColor;
      uniform float ambientIntensity;
      uniform float rainIntensity;
      uniform vec3 tintColor;
      uniform float tintIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      vec3 applyLighting(vec3 baseColor, vec3 lightDir, vec3 lightColor, float intensity) {
        vec3 normal = normalize(vNormal);
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * lightColor * intensity;
        
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = spec * lightColor * intensity * 0.5;
        
        return baseColor * (diffuse + specular + vec3(ambientIntensity));
      }
      
      void main() {
        float angle = radians(time * 1.0);
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 uv1 = rot * (vUv + vec2(time * 0.004, time * 0.003));
        vec2 uv2 = rot * (vUv + vec2(-time * 0.004, time * 0.006));
        vec3 c1 = texture2D(tex1, uv1).rgb;
        vec3 c2 = texture2D(tex2, uv2).rgb;
        float tex1Factor = dot(c1, vec3(0.333));
        vec3 blendedColor = c1 + c2 * tex1Factor;
        blendedColor *= blendedColor;
        
        // Apply rain effect
        if (rainIntensity > 0.0) {
          float rainEffect = rainIntensity * 0.5;
          blendedColor = mix(blendedColor, blendedColor * vec3(0.7, 0.8, 0.9), rainEffect);
          float rainDisturbance = sin(time * 10.0 + vUv.x * 50.0) * rainIntensity * 0.1;
          blendedColor.r += rainDisturbance * 0.1;
        }
        
        float globalRadius = length(vWorldPosition.xz);
        float edgeFactor = smoothstep(2.5, 3.0, globalRadius);
        vec3 edgeColor = mix(vec3(0.05, 0.1, 0.2), vec3(0.01, 0.02, 0.05), clamp(1.0 - lightIntensity, 0.0, 1.0));
        blendedColor = mix(blendedColor, edgeColor, edgeFactor);
        
        blendedColor = applyLighting(blendedColor, sunDirection, lightColor, lightIntensity);
        
        // Apply tint
        blendedColor = mix(blendedColor, blendedColor * tintColor, tintIntensity);
        
        blendedColor = pow(blendedColor, vec3(1.0/2.2));
        gl_FragColor = vec4(blendedColor, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });
}