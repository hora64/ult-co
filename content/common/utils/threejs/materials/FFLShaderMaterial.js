import * as THREE from 'three';

const _FFLShader_vert = `
    attribute vec4 _color;
    attribute vec3 tangent;
    varying vec4 v_color;
    varying highp vec4 v_position;
    varying highp vec3 v_normal;
    varying mediump vec3 v_tangent;
    varying mediump vec2 v_texCoord;
    uniform float u_time;
    uniform int u_mode;

    #define FFL_MODULATE_MODE_TEXTURE_DIRECT 1

    #ifdef USE_SKINNING
        uniform mat4 bindMatrix;
        uniform mat4 bindMatrixInverse;
        uniform highp sampler2D boneTexture;
        mat4 getBoneMatrix( const in float i ) {
            int size = textureSize( boneTexture, 0 ).x;
            int j = int( i ) * 4;
            int x = j % size;
            int y = j / size;
            vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
            vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
            vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
            vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
            return mat4( v1, v2, v3, v4 );
        }
    #endif

    void main() {
        vec3 transformed = vec3( position );
        #ifdef USE_SKINNING
            mat4 boneMatX = getBoneMatrix( skinIndex.x );
            mat4 boneMatY = getBoneMatrix( skinIndex.y );
            mat4 boneMatZ = getBoneMatrix( skinIndex.z );
            mat4 boneMatW = getBoneMatrix( skinIndex.w );
            vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
            vec4 skinned = vec4( 0.0 );
            skinned += boneMatX * skinVertex * skinWeight.x;
            skinned += boneMatY * skinVertex * skinWeight.y;
            skinned += boneMatZ * skinVertex * skinWeight.z;
            skinned += boneMatW * skinVertex * skinWeight.w;
            skinned = skinned / (skinWeight.x + skinWeight.y + skinWeight.z + skinWeight.w);
            transformed = ( bindMatrixInverse * skinned ).xyz;
        #endif

        if (u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT) {
            float waveAmplitudeX = 0.0;
            float waveAmplitudeY = 0.0;
            float waveFrequency = 5.0;
            float waveSpeed = 2.0;

            float poleDistanceFactor = clamp(transformed.x * 2.0, 0.0, 1.0);

            float displacementX = sin(transformed.x * waveFrequency + u_time * waveSpeed) * waveAmplitudeX * poleDistanceFactor;
            float displacementY = cos(transformed.x * waveFrequency * 1.5 + u_time * waveSpeed * 0.8) * waveAmplitudeY * poleDistanceFactor;

            transformed.x += displacementX;
            transformed.y += displacementY;
        }

        v_position = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * v_position;

        vec3 objectNormal = normal;
        vec3 objectTangent = tangent.xyz;
        #ifdef USE_SKINNING
            mat4 skinMatrix = mat4( 0.0 );
            skinMatrix += skinWeight.x * boneMatX;
            skinMatrix += skinWeight.y * boneMatY;
            skinMatrix += skinWeight.z * boneMatW;
            skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
            objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
            objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
        #endif

        v_normal = normalize(normalMatrix * objectNormal);
        v_texCoord = uv;
        v_tangent = normalize(tangent);
        v_color = _color;
    }
`;

const _FFLShader_frag = `
    #ifdef GL_ES
    precision mediump float;
    #else
    # define lowp
    # define mediump
    # define highp
    #endif

    #define FFL_MODULATE_MODE_CONSTANT       0
    #define FFL_MODULATE_MODE_TEXTURE_DIRECT 1
    #define FFL_MODULATE_MODE_RGB_LAYERED    2
    #define FFL_MODULATE_MODE_ALPHA          3
    #define FFL_MODULATE_MODE_LUMINANCE_ALPHA 4
    #define FFL_MODULATE_MODE_ALPHA_OPA      5

    #define FFL_SPECULAR_MODE_BLINN 0
    #define FFL_SPECULAR_MODE_ANISO 1

    #define FFL_LIGHT_MODE_DISABLE 0
    #define FFL_LIGHT_MODE_ENABLE 1

    mediump float calculateAnisotropicSpecular(mediump vec3 light, mediump vec3 tangent, mediump vec3 eye, mediump float power ) {
        mediump float dotLT = dot(light, tangent);
        mediump float dotVT = dot(eye, tangent);
        mediump float dotLN = sqrt(1.0 - dotLT * dotLT);
        mediump float dotVR = dotLN*sqrt(1.0 - dotVT * dotVT) - dotLT * dotVT;
        return pow(max(0.0, dotVR), power);
    }

    mediump float calculateBlinnSpecular(mediump vec3 light, mediump vec3 normal, mediump vec3 eye, mediump float power) {
        return pow(max(dot(reflect(-light, normal), eye), 0.0), power);
    }

    mediump float calculateSpecularBlend(mediump float blend, mediump float blinn, mediump float aniso) {
        return mix(aniso, blinn, blend);
    }

    mediump vec3 calculateAmbientColor(mediump vec3 light, mediump vec3 material) {
        return light * material;
    }

    mediump vec3 calculateDiffuseColor(mediump vec3 light, mediump vec3 material, mediump float ln) {
        return light * material * ln;
    }

    mediump vec3 calculateSpecularColor(mediump vec3 light, mediump vec3 material, mediump float reflection, mediump float strength) {
        return light * material * reflection * strength;
    }

    mediump vec3 calculateRimColor(mediump vec3 color, mediump float normalZ, mediump float width, mediump float power) {
        return color * pow(width * (1.0 - abs(normalZ)), power);
    }

    mediump float calculateDot(mediump vec3 light, mediump vec3 normal) {
        return max(dot(light, normal), 0.1);
    }

    varying mediump vec4 v_color;
    varying highp vec4 v_position;
    varying highp vec3 v_normal;
    varying mediump vec3 v_tangent;
    varying mediump vec2 v_texCoord;

    uniform mediump vec4 u_const1;
    uniform mediump vec4 u_const2;
    uniform mediump vec4 u_const3;
    uniform mediump vec3 u_light_ambient;
    uniform mediump vec3 u_light_diffuse;
    uniform mediump vec3 u_light_dir;
    uniform bool u_light_enable;
    uniform mediump vec3 u_light_specular;
    uniform mediump vec3 u_material_ambient;
    uniform mediump vec3 u_material_diffuse;
    uniform mediump vec3 u_material_specular;
    uniform int u_material_specular_mode;
    uniform mediump float u_material_specular_power;
    uniform mediump float u_brightness;
    uniform float u_gamma;
    uniform float u_ambientIntensity;
    uniform float u_diffuseIntensity;
    uniform int u_mode;
    uniform mediump vec3 u_rim_color;
    uniform mediump float u_rim_power;

    uniform sampler2D s_texture;
    uniform float u_time;
    uniform float u_fadeOpacity;

    void main() {
        mediump vec4 originalModelTextureColor;
        mediump vec4 finalOutputColor;

        mediump float specularPower = u_material_specular_power;
        mediump float rimWidth = v_color.a;

        if (u_mode == FFL_MODULATE_MODE_CONSTANT) {
            originalModelTextureColor = u_const1;
        } else if (u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT) {
            mediump vec4 texel = texture2D(s_texture, v_texCoord);
            originalModelTextureColor = texel;
        } else if (u_mode == FFL_MODULATE_MODE_RGB_LAYERED) {
            mediump vec4 texel = texture2D(s_texture, v_texCoord);
            originalModelTextureColor = vec4(texel.r * u_const1.rgb + texel.g * u_const2.rgb + texel.b * u_const3.rgb, u_const1.a * texel.a);
        } else if (u_mode == FFL_MODULATE_MODE_ALPHA) {
            mediump vec4 texel = texture2D(s_texture, v_texCoord);
            originalModelTextureColor = vec4(u_const1.rgb, u_const1.a * texel.r);
        } else if (u_mode == FFL_MODULATE_MODE_LUMINANCE_ALPHA) {
            mediump vec4 texel = texture2D(s_texture, v_texCoord);
            originalModelTextureColor = vec4(texel.g * u_const1.rgb, u_const1.a * texel.r);
        } else if (u_mode == FFL_MODULATE_MODE_ALPHA_OPA) {
            mediump vec4 texel = texture2D(s_texture, v_texCoord);
            originalModelTextureColor = vec4(texel.r * u_const1.rgb, u_const1.a);
        }

        if (u_mode != FFL_MODULATE_MODE_CONSTANT && originalModelTextureColor.a == 0.0) {
            discard;
        }

        finalOutputColor = originalModelTextureColor;

        if (u_light_enable) {
            mediump vec3 ambient = calculateAmbientColor(u_light_ambient.xyz, u_material_ambient.xyz);
            mediump vec3 norm = normalize(v_normal);
            mediump vec3 eye = normalize(-v_position.xyz);
            mediump float fDot = calculateDot(u_light_dir, norm);
            mediump vec3 diffuse = calculateDiffuseColor(u_light_diffuse.xyz, u_material_diffuse.xyz, fDot);

            mediump float specularBlinn = calculateBlinnSpecular(u_light_dir, norm, eye, u_material_specular_power);
            mediump float reflection;
            mediump float strength = v_color.g;
            if (u_material_specular_mode == 0) {
                strength = 1.0;
                reflection = specularBlinn;
            } else {
                mediump float specularAniso = calculateAnisotropicSpecular(u_light_dir, v_tangent, eye, u_material_specular_power);
                reflection = calculateSpecularBlend(v_color.r, specularBlinn, specularAniso);
            }
            mediump vec3 specular = calculateSpecularColor(u_light_specular.xyz, u_material_specular.xyz, reflection, strength);
            mediump vec3 rimColor = calculateRimColor(u_rim_color.rgb, norm.z, rimWidth, u_rim_power);
            vec3 baseLinearColor = (ambient * u_ambientIntensity * 1.5 + diffuse * u_diffuseIntensity) * finalOutputColor.rgb * u_brightness;
            vec3 gammaColor = pow(baseLinearColor, vec3(1.0 / u_gamma));
            finalOutputColor.rgb = gammaColor + specular + rimColor;
        }

        finalOutputColor.a *= u_fadeOpacity;
        gl_FragColor = vec4(finalOutputColor.rgb, finalOutputColor.a);
    }
`;

export class FFLShaderMaterial extends THREE.ShaderMaterial {
    static defaultLightAmbient = new THREE.Color(0.73, 0.73, 0.73);
    static defaultLightDiffuse = new THREE.Color(0.6, 0.6, 0.6);
    static defaultLightSpecular = new THREE.Color(0.7, 0.7, 0.7);
    static defaultLightDir = new THREE.Vector3(-0.4531539381, 0.4226179123, 0.7848858833);
    static defaultRimColor = new THREE.Color(0.3, 0.3, 0.3);
    static defaultRimPower = 2.0;
    static defaultBrightness = 1.0;
    static defaultGamma = 2.2;
    static defaultDiffuseIntensity = 1.0;
    static defaultAmbientIntensity = 1.0;
    static defaultLightDirection = this.defaultLightDir;

    static materialParams = [{
        ambient: new THREE.Color(0.85, 0.75, 0.75),
        diffuse: new THREE.Color(0.75, 0.75, 0.75),
        specular: new THREE.Color(0.3, 0.3, 0.3),
        specularPower: 1.2,
        specularMode: 0
    },
    {
        ambient: new THREE.Color(1.0, 1.0, 1.0),
        diffuse: new THREE.Color(0.7, 0.7, 0.7),
        specular: new THREE.Color(0.0, 0.0, 0.0),
        specularPower: 40.0,
        specularMode: 1
    },
    {
        ambient: new THREE.Color(0.9, 0.85, 0.85),
        diffuse: new THREE.Color(0.75, 0.75, 0.75),
        specular: new THREE.Color(0.22, 0.22, 0.22),
        specularPower: 1.5,
        specularMode: 0
    },
    {
        ambient: new THREE.Color(0.85, 0.75, 0.75),
        diffuse: new THREE.Color(0.75, 0.75, 0.75),
        specular: new THREE.Color(0.3, 0.3, 0.3),
        specularPower: 1.2,
        specularMode: 0
    },
    {
        ambient: new THREE.Color(1.0, 1.0, 1.0),
        diffuse: new THREE.Color(0.7, 0.7, 0.7),
        specular: new THREE.Color(0.35, 0.35, 0.35),
        specularPower: 10.0,
        specularMode: 1
    },
    {
        ambient: new THREE.Color(0.75, 0.75, 0.75),
        diffuse: new THREE.Color(0.72, 0.72, 0.72),
        specular: new THREE.Color(0.3, 0.3, 0.3),
        specularPower: 1.5,
        specularMode: 0
    },
    {
        ambient: new THREE.Color(1.0, 1.0, 1.0),
        diffuse: new THREE.Color(0.7, 0.7, 0.7),
        specular: new THREE.Color(0.0, 0.0, 0.0),
        specularPower: 40.0,
        specularMode: 1
    },
    {
        ambient: new THREE.Color(1.0, 1.0, 1.0),
        diffuse: new THREE.Color(0.7, 0.7, 0.7),
        specular: new THREE.Color(0.0, 0.0, 0.0),
        specularPower: 40.0,
        specularMode: 1
    },
    {
        ambient: new THREE.Color(1.0, 1.0, 1.0),
        diffuse: new THREE.Color(0.7, 0.7, 0.7),
        specular: new THREE.Color(0.0, 0.0, 0.0),
        specularPower: 40.0,
        specularMode: 1
    },
    {
        ambient: new THREE.Color(0.95622, 0.95622, 0.95622),
        diffuse: new THREE.Color(0.49673, 0.49673, 0.49673),
        specular: new THREE.Color(0.24099, 0.24099, 0.24099),
        specularPower: 3.0,
        specularMode: 0
    },
    {
        ambient: new THREE.Color(0.95622, 0.95622, 0.95622),
        diffuse: new THREE.Color(1.08497, 1.08497, 1.08497),
        specular: new THREE.Color(0.2409, 0.2409, 0.2409),
        specularPower: 3.0,
        specularMode: 0
    }];

    constructor(options = {}) {
        const uniforms = {
            u_light_ambient: { value: FFLShaderMaterial.defaultLightAmbient },
            u_light_diffuse: { value: FFLShaderMaterial.defaultLightDiffuse },
            u_light_specular: { value: FFLShaderMaterial.defaultLightSpecular },
            u_light_dir: { value: FFLShaderMaterial.defaultLightDir.clone() },
            u_light_enable: { value: true },
            u_rim_color: { value: FFLShaderMaterial.defaultRimColor },
            u_rim_power: { value: FFLShaderMaterial.defaultRimPower },
            u_brightness: { value: FFLShaderMaterial.defaultBrightness },
            u_gamma: { value: FFLShaderMaterial.defaultGamma },
            u_diffuseIntensity: { value: FFLShaderMaterial.defaultDiffuseIntensity },
            u_ambientIntensity: { value: FFLShaderMaterial.defaultAmbientIntensity },
            u_time: { value: 0.0 },
            u_fadeOpacity: { value: 1.0 }
        };
        super({
            vertexShader: _FFLShader_vert,
            fragmentShader: _FFLShader_frag,
            uniforms: uniforms,
            transparent: true
        });

        this._modulateType = 0;
        this.useSpecularModeBlinn = false;
        this.setValues(options);
        this.uniforms.u_fadeOpacity.value = options.opacity ?? 1.0;
    }

    set ambientIntensity(value) { this.uniforms.u_ambientIntensity.value = value; }
    get ambientIntensity() { return this.uniforms.u_ambientIntensity.value; }
    set diffuseIntensity(value) { this.uniforms.u_diffuseIntensity.value = value; }
    get diffuseIntensity() { return this.uniforms.u_diffuseIntensity.value; }
    set gamma(value) { this.uniforms.u_gamma.value = value; }
    get gamma() { return this.uniforms.u_gamma.value; }
    set brightness(value) { this.uniforms.u_brightness.value = value; }
    get brightness() { return this.uniforms.u_brightness.value; }
    get color() {
        if (!this.uniforms.u_const1) {
            return null;
        } else if (this._color3) {
            return this._color3;
        }
        const color4 = (this.uniforms.u_const1).value;
        const color3 = new THREE.Color(color4.x, color4.y, color4.z);
        this._color3 = color3;
        return color3;
    }
    set color(value) {
        function toColor4(color, opacity = 1.0) {
            return new THREE.Vector4(color.r, color.g, color.b, opacity);
        }
        if (Array.isArray(value)) {
            (this.uniforms.u_const1) = { value: toColor4(value[0]) };
            (this.uniforms.u_const2) = { value: toColor4(value[1]) };
            (this.uniforms.u_const3) = { value: toColor4(value[2]) };
            return;
        }
        const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
        this._color3 = color3;
        (this.uniforms.u_const1) = { value: toColor4(color3, 1.0) };
    }
    get modulateMode() { return this.uniforms.u_mode ? this.uniforms.u_mode.value : null; }
    set modulateMode(value) { this.uniforms.u_mode = { value: value }; }
    get lightEnable() { return this.uniforms.u_light_enable ? this.uniforms.u_light_enable.value : null; }
    set lightEnable(value) { this.uniforms.u_light_enable = { value: value }; }
    set useSpecularModeBlinn(value) {
        this._useSpecularModeBlinn = value;
        if (this._modulateType !== undefined) {
            this.modulateType = this._modulateType;
        }
    }
    get useSpecularModeBlinn() { return this._useSpecularModeBlinn; }
    get modulateType() { return this._modulateType; }
    set modulateType(value) {
        const matParam = FFLShaderMaterial.materialParams[value];
        if (!matParam) { return; }
        this._modulateType = value;
        this.uniforms.u_material_ambient = { value: matParam.ambient };
        this.uniforms.u_material_diffuse = { value: matParam.diffuse || new THREE.Color() };
        this.uniforms.u_material_specular = { value: matParam.specular };
        this.uniforms.u_material_specular_mode = { value: this._useSpecularModeBlinn ? 0 : matParam.specularMode };
        this.uniforms.u_material_specular_power = { value: matParam.specularPower };
    }
    get map() { return this.uniforms.s_texture ? this.uniforms.s_texture.value : null; }
    set map(value) { this.uniforms.s_texture = { value: value }; }
    set time(value) { this.uniforms.u_time.value = value; }
    get time() { return this.uniforms.u_time.value; }
}
