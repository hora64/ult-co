import * as THREE from 'three';

// ---------------------------------------------------------------------
// Vertex Shader for FFLShaderMaterial
// Derived from MiiDefaultShader.vsh found in Miitomo.
// ---------------------------------------------------------------------
const _FFLShader_vert = /* glsl */ `
// Input attribute variables to the vertex shader
//attribute vec4 position;           //!< Input: Position information
//attribute vec2 uv;                 //!< Input: Texture coordinates
//attribute vec3 normal;             //!< Input: Normal vector
// All provided by three.js ^^

// Vertex color is not actually the color of the shape, as such
// it is a custom attribute _COLOR in the glTF

attribute vec4 _color;             //!< Input: Vertex color
attribute vec3 tangent;            //!< Input: Tangent vector

// Output to fragment shader
varying    vec4 v_color;          //!< Output: Vertex color
varying    vec4 v_position;         //!< Output: Position information
varying    vec3 v_normal;           //!< Output: Normal vector
// NOTE: ^^ Those two need to be highp to avoid weird black dot issue on Android
varying mediump vec3 v_tangent;            //!< Output: Tangent vector
varying mediump vec2 v_texCoord;           //!< Output: Texture coordinates

// Uniforms
//uniform mat3 normalMatrix;          //!< Uniform: Normal matrix of the model
//uniform mat4 modelViewMatrix;         //!< Uniform: Projection matrix
//uniform mat4 projectionMatrix;          //!< Uniform: Model matrix
// All provided by three.js ^^

uniform float u_time; // For flag animation
uniform int u_mode; // To check if it's the flag material (FFL_MODULATE_MODE_TEXTURE_DIRECT)

#define FFL_MODULATE_MODE_TEXTURE_DIRECT 1

// skinning_pars_vertex.glsl.js
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

void main()
{

    // begin_vertex.glsl.js
    vec3 transformed = vec3( position );
// skinbase_vertex.glsl.js
#ifdef USE_SKINNING
    mat4 boneMatX = getBoneMatrix( skinIndex.x );
    mat4 boneMatY = getBoneMatrix( skinIndex.y );
    mat4 boneMatZ = getBoneMatrix( skinIndex.z );
    mat4 boneMatW = getBoneMatrix( skinIndex.w );
    // skinning_vertex.glsl.js
    vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
    vec4 skinned = vec4( 0.0 );
    skinned += boneMatX * skinVertex * skinWeight.x;
    skinned += boneMatY * skinVertex * skinWeight.y;
    skinned += boneMatZ * skinVertex * skinWeight.z;
    skinned += boneMatW * skinVertex * skinWeight.w;
    transformed = ( bindMatrixInverse * skinned ).xyz;
#endif

    // Apply flag-like animation only to the flag material (u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT)
    // This creates a wave effect predominantly in the X-axis with slight Y-axis movement.
    // The wave originates from the "leftmost" side of the flag (lower X values).
    if (u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT) {
        float waveAmplitudeX = 0.0; // Main movement in X (horizontal wave)
        float waveAmplitudeY = 0.0; // Slight movement in Y (vertical ripple)
        float waveFrequency = 5.0; // Number of waves along the flag's length
        float waveSpeed = 2.0; // Speed of the wave animation

        // Use transformed.x to scale the amplitude, making it 0 at the pole (assuming pole is at x=0).
        // Clamp to prevent excessive amplitude for very wide flags.
        float poleDistanceFactor = clamp(transformed.x * 2.0, 0.0, 1.0); 

        // Main movement in X (horizontal wave)
        float displacementX = sin(transformed.x * waveFrequency + u_time * waveSpeed) * waveAmplitudeX * poleDistanceFactor;
        
        // Slight movement in Y (vertical ripple)
        float displacementY = cos(transformed.x * waveFrequency * 1.5 + u_time * waveSpeed * 0.8) * waveAmplitudeY * poleDistanceFactor;

        transformed.x += displacementX;
        transformed.y += displacementY;
    }


    // Transform vertex coordinates
    v_position = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position =  projectionMatrix * v_position;

    vec3 objectNormal = normal;
    vec3 objectTangent = tangent.xyz;
// skinnormal_vertex.glsl.js
#ifdef USE_SKINNING
    mat4 skinMatrix = mat4( 0.0 );
    skinMatrix += skinWeight.x * boneMatX;
    skinMatrix += skinWeight.y * boneMatY;
    skinMatrix += skinWeight.z * boneMatZ;
    skinMatrix += skinWeight.w * boneMatW;
    skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

    objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
    objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;

#endif

    // Transform normal
    v_normal = normalize(normalMatrix * objectNormal);

    // Output other information
    v_texCoord = uv;
    // Safe normalize
    if (tangent != vec3(0.0, 0.0, 0.0))
    {
        v_tangent = normalize(normalMatrix * objectTangent);
    }
    else
    {
        v_tangent = vec3(0.0, 0.0, 0.0);
    }

    v_color = _color;
}
`;

// ---------------------------------------------------------------------
// Fragment Shader for FFLShaderMaterial
// Mostly unmodified from MiiDefaultShader.fsh found in Miitomo.
// ---------------------------------------------------------------------
const _FFLShader_frag = /* glsl */ `
//
//  sample.flg
//  Fragment shader
//  Copyright (c) 2014 Nintendo Co., Ltd. All rights reserved.
//
//

#ifdef GL_ES
precision mediump float;
#else
#   define lowp
#   define mediump
#   define highp
#endif


//
//  Constant Definitions
//

/// Modulation modes
#define FFL_MODULATE_MODE_CONSTANT      0
#define FFL_MODULATE_MODE_TEXTURE_DIRECT 1
#define FFL_MODULATE_MODE_RGB_LAYERED   2
#define FFL_MODULATE_MODE_ALPHA         3
#define FFL_MODULATE_MODE_LUMINANCE_ALPHA 4
#define FFL_MODULATE_MODE_ALPHA_OPA     5

/// Specular modes
#define FFL_SPECULAR_MODE_BLINN 0
#define FFL_SPECULAR_MODE_ANISO 1

/// Light ON/OFF
#define FFL_LIGHT_MODE_DISABLE 0
#define FFL_LIGHT_MODE_ENABLE 1

/// Blending Modes for additional textures
#define FFL_BLEND_MODE_NONE      0
#define FFL_BLEND_MODE_ADD       1
#define FFL_BLEND_MODE_MULTIPLY  2
#define FFL_BLEND_MODE_SCREEN    3


//
//  Function Definitions
//

/**
 * @brief Calculates anisotropic specular reflection.
 * @param[in] light           Light direction
 * @param[in] tangent Tangent vector
 * @param[in] eye             Eye direction
 * @param[in] power           Sharpness/Power
 */
mediump float calculateAnisotropicSpecular(mediump vec3 light, mediump vec3 tangent, mediump vec3 eye, mediump float power )
{
    mediump float dotLT = dot(light, tangent);
    mediump float dotVT = dot(eye, tangent);
    mediump float dotLN = sqrt(1.0 - dotLT * dotLT);
    mediump float dotVR = dotLN*sqrt(1.0 - dotVT * dotVT) - dotLT * dotVT;

    return pow(max(0.0, dotVR), power);
}

/**
 * @brief Calculates Blinn-Phong specular reflection.
 * @param[in] light           Light direction
 * @param[in] normal  Normal vector
 * @param[in] eye             Eye direction
 * @param[in] power           Sharpness/Power
 */
mediump float calculateBlinnSpecular(mediump vec3 light, mediump vec3 normal, mediump vec3 eye, mediump float power)
{
    return pow(max(dot(reflect(-light, normal), eye), 0.0), power);
}

/**
 * @brief Blends anisotropic and Blinn-Phong specular values.
 * @param[in] blend Blend factor
 * @param[in] blinn Blinn value
 * @param[in] aniso Anisotropic value
 */
mediump float calculateSpecularBlend(mediump float blend, mediump float blinn, mediump float aniso)
{
    return mix(aniso, blinn, blend);
}

/**
 * @brief Calculates ambient color.
 * @param[in] light           Light color
 * @param[in] material Material color
 */
mediump vec3 calculateAmbientColor(mediump vec3 light, mediump vec3 material)
{
    return light * material;
}

/**
 * @brief Calculates diffuse color.
 * @param[in] light           Light color
 * @param[in] material Material color
 * @param[in] ln              Dot product of light and normal
 */
mediump vec3 calculateDiffuseColor(mediump vec3 light, mediump vec3 material, mediump float ln)
{
    return light * material * ln;
}

/**
 * @brief Calculates specular color.
 * @param[in] light           Light color
 * @param[in] material        Material color
 * @param[in] reflection Reflection factor
 * @param[in] strength    Strength
 */
mediump vec3 calculateSpecularColor(mediump vec3 light, mediump vec3 material, mediump float reflection, mediump float strength)
{
    return light * material * reflection * strength;
}

/**
 * @brief Calculates rim lighting color.
 * @param[in] color           Rim color
 * @param[in] normalZ Normal's Z-component
 * @param[in] width           Rim width
 * * @param[in] power           Rim sharpness
 */
mediump vec3 calculateRimColor(mediump vec3 color, mediump float normalZ, mediump float width, mediump float power)
{
    return color * pow(width * (1.0 - abs(normalZ)), power);
}

/**
 * @brief Calculates dot product of light direction and normal.
 * @note Special implementation.
 */
mediump float calculateDot(mediump vec3 light, mediump vec3 normal)
{
    return max(dot(light, normal), 0.1);
}

// Varying variables from vertex shader
varying mediump vec4 v_color;           //!< Output: Vertex color
varying highp    vec4 v_position;          //!< Output: Position
varying highp    vec3 v_normal;            //!< Output: Normal vector
// NOTE: ^^ Those two need to be highp to avoid weird black dot issue on Android
varying mediump vec3 v_tangent;           //!< Output: Tangent vector
varying mediump vec2 v_texCoord;          //!< Output: Texture coordinates

/// Constant colors
uniform mediump vec4  u_const1; ///< const color 1
uniform mediump vec4  u_const2; ///< const color 2
uniform mediump vec4  u_const3; ///< const color 3

/// Light settings
uniform mediump vec3 u_light_ambient;  ///< Ambient light color in camera space
uniform mediump vec3 u_light_diffuse;  ///< Diffuse light color
uniform mediump vec3 u_light_dir;      ///< Light direction
uniform bool u_light_enable;           ///< Enable/Disable lighting
uniform mediump vec3 u_light_specular; ///< Specular light intensity

/// Material settings
uniform mediump vec3 u_material_ambient;           ///< Ambient material setting
uniform mediump vec3 u_material_diffuse;           ///< Diffuse material setting
uniform mediump vec3 u_material_specular;          ///< Specular material setting
uniform int u_material_specular_mode;             ///< Specular reflection mode
uniform mediump float u_material_specular_power; ///< Specular sharpness
uniform float u_brightness; ///< Brightness multiplier
uniform float u_gamma;
uniform float u_ambientIntensity;
uniform float u_diffuseIntensity;
/// Modulation setting
uniform int u_mode;    ///< Drawing mode

/// Rim settings
uniform mediump vec3  u_rim_color;
uniform mediump float u_rim_power;

// Samplers
uniform sampler2D s_texture;  // Original model texture
uniform sampler2D s_texture2; // Second texture (emblem)
uniform int u_blendMode;      // Blend mode for original texture over flagPrint
uniform bool u_blendTextureEnabled; // Enable/disable emblem and blending
uniform float u_emblemScale;  // Scale factor for the emblem texture
uniform float u_blendIntensity; // Intensity for blending the original texture over flagPrint


// -------------------------------------------------------
// Main function
void main()
{
    mediump vec4 originalModelTextureColor; // This will be the color from s_texture
    mediump vec4 finalOutputColor; // This will be the final color before lighting

    mediump float specularPower = u_material_specular_power;
    mediump float rimWidth      = v_color.a;

    // Get original model texture color (from s_texture)
    if(u_mode == FFL_MODULATE_MODE_CONSTANT)
    {
        originalModelTextureColor = u_const1; // If no texture, use constant color as base
    }
    else if(u_mode == FFL_MODULATE_MODE_TEXTURE_DIRECT)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        originalModelTextureColor = texel; // Use texture's own RGB and A
    }
    else if(u_mode == FFL_MODULATE_MODE_RGB_LAYERED)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        originalModelTextureColor = vec4(texel.r * u_const1.rgb + texel.g * u_const2.rgb + texel.b * u_const3.rgb, u_const1.a * texel.a);
    }
    else if(u_mode == FFL_MODULATE_MODE_ALPHA)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        originalModelTextureColor = vec4(u_const1.rgb, u_const1.a * texel.r);
    }
    else if(u_mode == FFL_MODULATE_MODE_LUMINANCE_ALPHA)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        originalModelTextureColor = vec4(texel.g * u_const1.rgb, u_const1.a * texel.r);
    }
    else if(u_mode == FFL_MODULATE_MODE_ALPHA_OPA)
    {
        mediump vec4 texel = texture2D(s_texture, v_texCoord);
        originalModelTextureColor = vec4(texel.r * u_const1.rgb, u_const1.a);
    }

    // Avoids little outline around mask elements
    if(u_mode != FFL_MODULATE_MODE_CONSTANT && originalModelTextureColor.a == 0.0)
    {
        discard;
    }

    // Handle emblem (s_texture2) only if blending is enabled
    if (u_blendTextureEnabled) {
        // 1. Rotate 180 degrees: (uv - 0.5) * -1.0 + 0.5
        // 2. Scale down and center: (rotatedTexCoord - 0.5) * u_emblemScale + 0.5
        vec2 rotatedTexCoord = (v_texCoord - 0.5) * vec2(-1.0, -1.0) + 0.5;
        vec2 scaledTexCoord = (rotatedTexCoord - 0.5) * u_emblemScale + 0.5;

        mediump vec4 emblemColor;
        // Check if scaledTexCoord is outside [0,1] range, and make it transparent if so
        if (scaledTexCoord.x < 0.0 || scaledTexCoord.x > 1.0 ||
            scaledTexCoord.y < 0.0 || scaledTexCoord.y > 1.0) {
            emblemColor = vec4(0.0, 0.0, 0.0, 0.0); // Transparent outside emblem area
        } else {
            emblemColor = texture2D(s_texture2, scaledTexCoord);
        }

        // Calculate flagPrint: base color (u_const1) mixed with emblem (s_texture2)
        // Using emblem's alpha to blend with u_const1
        mediump vec4 flagPrint;
        flagPrint.rgb = mix(u_const1.rgb, emblemColor.rgb, emblemColor.a);
        // Combine alphas: if emblem is opaque, it dictates the alpha; otherwise, blend with base alpha
        flagPrint.a = mix(u_const1.a, emblemColor.a, emblemColor.a);


        // Now, lighten flagPrint using the original model texture (originalModelTextureColor)
        // "Lightened via using" suggests a Screen blend mode.
        switch (u_blendMode) { // Re-using u_blendMode for this new blend operation
            case FFL_BLEND_MODE_ADD:
                finalOutputColor.rgb = clamp(flagPrint.rgb + originalModelTextureColor.rgb, 0.0, 1.0);
                finalOutputColor.a = flagPrint.a + originalModelTextureColor.a * (1.0 - flagPrint.a);
                break;
            case FFL_BLEND_MODE_MULTIPLY:
                finalOutputColor.rgb = flagPrint.rgb * originalModelTextureColor.rgb;
                finalOutputColor.a = flagPrint.a * originalModelTextureColor.a;
                break;
            case FFL_BLEND_MODE_SCREEN:
                // Calculate screen blend result
                vec3 screenResultRgb = 1.0 - (1.0 - flagPrint.rgb) * (1.0 - originalModelTextureColor.rgb);
                float screenResultAlpha = 1.0 - (1.0 - flagPrint.a) * (1.0 - originalModelTextureColor.a);
                
                // Mix with original flagPrint based on u_blendIntensity
                finalOutputColor.rgb = mix(flagPrint.rgb, screenResultRgb, u_blendIntensity);
                finalOutputColor.a = mix(flagPrint.a, screenResultAlpha, u_blendIntensity);
                break;
            case FFL_BLEND_MODE_NONE:
            default:
                finalOutputColor = flagPrint; // If no blend mode, just use flagPrint
                break;
        }
    } else {
        // If blending is disabled (no emblem loaded or blendTextureEnabled is false),
        // the originalModelTextureColor is the final color.
        finalOutputColor = originalModelTextureColor;
    }


    if(u_light_enable)
    {
        /// Ambient light calculation
        mediump vec3 ambient = calculateAmbientColor(u_light_ambient.xyz, u_material_ambient.xyz);

        /// Normalize normal vector
        mediump vec3 norm = normalize(v_normal);

        /// Eye vector
        mediump vec3 eye = normalize(-v_position.xyz);

        // Light direction dot product
        mediump float fDot = calculateDot(u_light_dir, norm);

        /// Diffuse calculation
        mediump vec3 diffuse = calculateDiffuseColor(u_light_diffuse.xyz, u_material_diffuse.xyz, fDot); // Corrected from u_material_diffuses

        /// Specular calculation
        mediump float specularBlinn = calculateBlinnSpecular(u_light_dir, norm, eye, u_material_specular_power);

        /// Declare variable for specular value
        mediump float reflection;
        mediump float strength = v_color.g;
        if(u_material_specular_mode == 0)
        {
            /// Blinn model
            strength = 1.0;
            reflection = specularBlinn;
        }
        else
        {
            /// Anisotropic model
            mediump float specularAniso = calculateAnisotropicSpecular(u_light_dir, v_tangent, eye, u_material_specular_power);
            reflection = calculateSpecularBlend(v_color.r, specularBlinn, specularAniso);
        }
        /// Get specular color
        mediump vec3 specular = calculateSpecularColor(u_light_specular.xyz, u_material_specular.xyz, reflection, strength);

        // Calculate rim color
        mediump vec3 rimColor = calculateRimColor(u_rim_color.rgb, norm.z, rimWidth, u_rim_power);

        // Final color calculation with lighting
        vec3 baseLinearColor =  (ambient * u_ambientIntensity + diffuse * u_diffuseIntensity) * finalOutputColor.rgb * u_brightness;
        vec3 gammaColor = pow(baseLinearColor, vec3(1.0 / u_gamma));

        finalOutputColor.rgb = gammaColor + specular + rimColor;

    }

    // Apply brightness before output
    gl_FragColor = vec4(finalOutputColor.rgb, finalOutputColor.a);
}
`;
// ---------------------------------------------------------------------
// FFLShaderMaterial Class
// ---------------------------------------------------------------------
/**
 * Custom THREE.ShaderMaterial using the FFLShader.
 * @augments {THREE.ShaderMaterial}
 */
export class FFLShaderMaterial extends THREE.ShaderMaterial {
    // Default light and rim light uniforms.

    /**
     * Blending modes for additional textures.
     * @enum {number}
     */
    static FFLBlendMode = {
        NONE: 0,
        ADD: 1,
        MULTIPLY: 2,
        SCREEN: 3
    };

    /**
     * Default ambient light color.
     * @type {import('three').Color}
     */
    static defaultLightAmbient = new THREE.Color(0.73, 0.73, 0.73) /* .convertSRGBToLinear() */ ;
    /**
     * Default diffuse light color.
     * @type {import('three').Color}
     */
    static defaultLightDiffuse = new THREE.Color(0.6, 0.6, 0.6) /* .convertSRGBToLinear() */ ;
    /**
     * Default specular light color.
     * @type {import('three').Color}
     */
    static defaultLightSpecular = new THREE.Color(0.7, 0.7, 0.7) /* .convertSRGBToLinear() */ ;
    /**
     * Default light direction.
     * @type {import('three').Vector3}
     */
    static defaultLightDir = new THREE.Vector3(-0.4531539381, 0.4226179123, 0.7848858833);
    /**
     * Default rim color.
     * @type {import('three').Color}
     */
    static defaultRimColor = new THREE.Color(0.3, 0.3, 0.3) /* .convertSRGBToLinear() */ ;
    /**
     * Default rim power (intensity).
     * @type {number}
     */
    static defaultRimPower = 2.0;
    static defaultBrightness = 1.0;
    static defaultGamma = 2.2;
    static defaultDiffuseIntensity = 1.0;
    static defaultAmbientIntensity = 1.0;
    /**
     * Alias for default light direction.
     * @type {import('three').Vector3}
     */
    static defaultLightDirection = this.defaultLightDir;

    /**
     * Material uniform table mapping to FFLModulateType.
     * Reference: https://github.com/aboood40091/FFL-Testing/blob/master/src/Shader.cpp
     * @package
     */
    static materialParams = [{
            // FFL_MODULATE_TYPE_SHAPE_FACELINE
            ambient: new THREE.Color(0.85, 0.75, 0.75) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.75, 0.75, 0.75) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.3, 0.3, 0.3) /* .convertSRGBToLinear() */ ,
            specularPower: 1.2,
            specularMode: 0
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_BEARD
            ambient: new THREE.Color(1.0, 1.0, 1.0) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.7, 0.7, 0.7) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.0, 0.0, 0.0) /* .convertSRGBToLinear() */ ,
            specularPower: 40.0,
            specularMode: 1
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_NOSE
            ambient: new THREE.Color(0.9, 0.85, 0.85) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.75, 0.75, 0.75) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.22, 0.22, 0.22) /* .convertSRGBToLinear() */ ,
            specularPower: 1.5,
            specularMode: 0
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_FOREHEAD
            ambient: new THREE.Color(0.85, 0.75, 0.75) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.75, 0.75, 0.75) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.3, 0.3, 0.3) /* .convertSRGBToLinear() */ ,
            specularPower: 1.2,
            specularMode: 0
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_HAIR
            ambient: new THREE.Color(1.0, 1.0, 1.0) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.7, 0.7, 0.7) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.35, 0.35, 0.35) /* .convertSRGBToLinear() */ ,
            specularPower: 10.0,
            specularMode: 1
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_CAP
            ambient: new THREE.Color(0.75, 0.75, 0.75) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.72, 0.72, 0.72) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.3, 0.3, 0.3) /* .convertSRGBToLinear() */ ,
            specularPower: 1.5,
            specularMode: 0
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_MASK
            ambient: new THREE.Color(1.0, 1.0, 1.0) /* .convertSRGBToLinear() */ ,
            diffuses: new THREE.Color(0.7, 0.7, 0.7) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.0, 0.0, 0.0) /* .convertSRGBToLinear() */ ,
            specularPower: 40.0,
            specularMode: 1
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_NOSELINE
            ambient: new THREE.Color(1.0, 1.0, 1.0) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.7, 0.7, 0.7) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.0, 0.0, 0.0) /* .convertSRGBToLinear() */ ,
            specularPower: 40.0,
            specularMode: 1
        },
        {
            // FFL_MODULATE_TYPE_SHAPE_GLASS
            ambient: new THREE.Color(1.0, 1.0, 1.0) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.7, 0.7, 0.7) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.0, 0.0, 0.0) /* .convertSRGBToLinear() */ ,
            specularPower: 40.0,
            specularMode: 1
        },

        {
            // body
            ambient: new THREE.Color(0.95622, 0.95622, 0.95622) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(0.49673, 0.49673, 0.49673) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.24099, 0.24099, 0.24099) /* .convertSRGBToLinear() */ ,
            specularPower: 3.0,
            specularMode: 0
        },
        {
            // pants
            ambient: new THREE.Color(0.95622, 0.95622, 0.95622) /* .convertSRGBToLinear() */ ,
            diffuse: new THREE.Color(1.08497, 1.08497, 1.08497) /* .convertSRGBToLinear() */ ,
            specular: new THREE.Color(0.2409, 0.2409, 0.2409) /* .convertSRGBToLinear() */ ,
            specularPower: 3.0,
            specularMode: 0
        }
    ];

    /** @typedef {import('three').IUniform<import('three').Vector4>} IUniformVector4 */

    /**
     * Constructs an FFLShaderMaterial instance.
     * @param {import('three').ShaderMaterialParameters & FFLShaderMaterialParameters} [options] -
     * Parameters for the material.
     */
    constructor(options = {}) {
        // Set default uniforms.
        /** @type {Object<string, import('three').IUniform>} */
        const uniforms = {
            u_light_ambient: {
                value: FFLShaderMaterial.defaultLightAmbient
            },
            u_light_diffuse: {
                value: FFLShaderMaterial.defaultLightDiffuse
            },
            u_light_specular: {
                value: FFLShaderMaterial.defaultLightSpecular
            },
            u_light_dir: {
                value: FFLShaderMaterial.defaultLightDir.clone()
            },
            u_light_enable: {
                value: true
            }, // Default to true.
            u_rim_color: {
                value: FFLShaderMaterial.defaultRimColor
            },
            u_rim_power: {
                value: FFLShaderMaterial.defaultRimPower
            },
            u_brightness: {
                value: FFLShaderMaterial.defaultBrightness
            },
            u_gamma: {
                value: FFLShaderMaterial.defaultGamma
            },
            u_diffuseIntensity: {
                value: FFLShaderMaterial.defaultDiffuseIntensity
            },
            u_ambientIntensity: {
                value: FFLShaderMaterial.defaultAmbientIntensity
            },
            // New uniforms for blending and emblem
            s_texture2: {
                value: new THREE.TextureLoader().load('https://placehold.co/64x64/000000/FFFFFF?text=Default') // Default to a placeholder emblem image
            },
            u_blendMode: {
                value: FFLShaderMaterial.FFLBlendMode.SCREEN // Default to Lighten (Screen)
            },
            u_blendTextureEnabled: {
                value: false // Only enable if map2 is actually set
            },
            u_emblemScale: {
                value: 2.0 // Default emblem scale to 2.0
            },
            u_blendIntensity: {
                value: 0.1 // Default blend intensity for the original texture
            },
            u_time: {
                value: 0.0 // New uniform for time-based animation
            }
        };
        // Construct the ShaderMaterial using the shader source.
        super({
            vertexShader: _FFLShader_vert,
            fragmentShader: _FFLShader_frag,
            uniforms: uniforms
        });

        // Initialize default values.
        /** @type {FFLModulateType} */
        this._modulateType = 0;
        this.useSpecularModeBlinn = false;

        // Use the setters to set the rest of the uniforms.
        this.setValues(options);
    }

    /**
     * Sets the ambient intensity multiplier.
     * @param {number} value - Ambient intensity multiplier.
     */
    set ambientIntensity(value) {
        this.uniforms.u_ambientIntensity.value = value;
    }

    /**
     * Gets the ambient intensity multiplier.
     * @returns {number} Ambient intensity multiplier.
     */
    get ambientIntensity() {
        return this.uniforms.u_ambientIntensity.value;
    }

    /**
     * Sets the diffuse intensity multiplier.
     * @param {number} value - Diffuse intensity multiplier.
     */
    set diffuseIntensity(value) {
        this.uniforms.u_diffuseIntensity.value = value;
    }

    /**
     * Gets the diffuse intensity multiplier.
     * @returns {number} Diffuse intensity multiplier.
     */
    get diffuseIntensity() {
        return this.uniforms.u_diffuseIntensity.value;
    }

    /**
     * Sets the gamma correction value.
     * @param {number} value - Gamma value.
     */
    set gamma(value) {
        this.uniforms.u_gamma.value = value;
    }

    /**
     * Gets the gamma correction value.
     * @returns {number} Gamma value.
     */
    get gamma() {
        return this.uniforms.u_gamma.value;
    }

    /**
     * Sets the brightness multiplier
     * @param {number} value - Brightness multiplier (1.0 = no change)
     */
    set brightness(value) {
        this.uniforms.u_brightness.value = value;
    }

    /**
     * Gets the brightness multiplier.
     * @returns {number} Brightness multiplier.
     */
    get brightness() {
        return this.uniforms.u_brightness.value;
    }

    /**
     * Gets the constant color (u_const1) uniform as THREE.Color.
     * @returns {import('three').Color|null} The constant color, or null if it is not set.
     */
    get color() {
        if (!this.uniforms.u_const1) {
            // If color is not set, return null.
            return null;
        } else if (this._color3) {
            // Use cached THREE.Color instance if it is set.
            return this._color3;
        }
        // Get THREE.Color from u_const1 (Vector4).
        const color4 = /** @type {IUniformVector4} */ (this.uniforms.u_const1).value;
        const color3 = new THREE.Color(color4.x, color4.y, color4.z);
        this._color3 = color3; // Cache the THREE.Color instance.
        return color3;
    }

    /**
     * Sets the constant color uniforms from THREE.Color.
     * @param {import('three').Color|Array<import('three').Color>} value - The
     * constant color (u_const1), or multiple (u_const1/2/3) to set the uniforms for.
     */
    set color(value) {
        /**
         * @param {import('three').Color} color - THREE.Color instance.
         * @param {number} opacity - Opacity mapped to .a.
         * @returns {import('three').Vector4} Vector4 containing color and opacity.
         */
        function toColor4(color, opacity = 1.0) {
            return new THREE.Vector4(color.r, color.g, color.b, opacity);
        }
        // Set an array of colors, assumed to have 3 elements.
        if (Array.isArray(value)) {
            // Assign multiple color instances to u_const1/2/3.
            /** @type {IUniformVector4} */
            (this.uniforms.u_const1) = {
                value: toColor4(value[0])
            };
            /** @type {IUniformVector4} */
            (this.uniforms.u_const2) = {
                value: toColor4(value[1])
            };
            /** @type {IUniformVector4} */
            (this.uniforms.u_const3) = {
                value: toColor4(value[2])
            };
            return;
        }
        // Set single color as THREE.Color, defaulting to white.
        const color3 = value ? value : new THREE.Color(1.0, 1.0, 1.0);
        /** @type {import('three').Color} */
        this._color3 = color3;
        // Assign single color with white as a placeholder.
        const opacity = this.opacity;
        if (this._opacity) {
            // if _opacity is set then the above returned it, delete when done
            delete this._opacity;
        }
        /** @type {IUniformVector4} */
        (this.uniforms.u_const1) = {
            value: toColor4(color3, opacity)
        };
    }

    /**
     * Gets the opacity of the constant color.
     * @returns {number} The opacity value.
     */
    // @ts-ignore - Already defined on parent class.
    get opacity() {
        if (!this.uniforms.u_const1) {
            // Get from _opacity if it is set before constant color.
            return this._opacity ? this._opacity : 1;
        }
        // Return w (alpha) of the constant color uniform.
        return /** @type {IUniformVector4} */ (this.uniforms.u_const1).value.w;
    }

    /**
     * Sets the opacity of the constant color.
     * NOTE: that this is actually set in the constructor
     * of Material, meaning it is the only one set BEFORE uniforms are
     * @param {number} value - The new opacity value.
     */
    // @ts-ignore - Already defined on parent class.
    set opacity(value) {
        if (!this.uniforms || !this.uniforms.u_const1) {
            // Store here for later when color is set.
            this._opacity = 1;
            return;
        }
        /** @type {IUniformVector4} */
        (this.uniforms.u_const1).value.w = value;
    }

    /**
     * Gets the value of the modulateMode uniform.
     * @returns {FFLModulateMode|null} The modulateMode value, or null if it is unset.
     */
    get modulateMode() {
        return this.uniforms.u_mode ? this.uniforms.u_mode.value : null;
    }

    /**
     * Sets the value of the modulateMode uniform.
     * @param {FFLModulateMode} value - The new modulateMode value.
     */
    set modulateMode(value) {
        this.uniforms.u_mode = {
            value: value
        };
    }

    /**
     * Gets the value determining whether lighting is enabled or not.
     * @returns {boolean|null} The lightEnable value, or null if it is unset.
     */
    get lightEnable() {
        return this.uniforms.u_light_enable ? this.uniforms.u_light_enable.value : null;
    }

    /**
     * Sets the value determining whether lighting is enabled or not.
     * @param {boolean} value - The lightEnable value.
     */
    set lightEnable(value) {
        this.uniforms.u_light_enable = {
            value: value
        };
    }

    /**
     * Sets whether to override specular mode with 0.
     * @param {boolean} value - The useSpecularModeBlinn value.
     */
    set useSpecularModeBlinn(value) {
        this._useSpecularModeBlinn = value; // Private property.
        if (this._modulateType !== undefined) {
            // Set material again if it was already set.
            this.modulateType = this._modulateType;
        }
    }

    /**
     * Gets the value for whether to override specular mode with 0.
     * @returns {boolean|undefined} The useSpecularModeBlinn value.
     */
    get useSpecularModeBlinn() {
        return this._useSpecularModeBlinn;
    }

    /**
     * Gets the modulateType value.
     * @returns {FFLModulateType|undefined} The modulateType value if it is set.
     */
    get modulateType() {
        // This isn't actually a uniform so this is a private property.
        return this._modulateType;
    }

    /**
     * Sets the material uniforms based on the modulate type value.
     * @param {FFLModulateType} value - The new modulateType value.
     */
    set modulateType(value) {
        // Get material uniforms for modulate type from materialParams table.
        const matParam = FFLShaderMaterial.materialParams[value];
        if (!matParam) {
            // Out of bounds modulateType that don't have materials
            // are usually for mask/faceline textures, so don't throw error
            return;
        }
        this._modulateType = value;

        // Set material uniforms from matParam object.
        this.uniforms.u_material_ambient = {
            value: matParam.ambient
        };
        this.uniforms.u_material_diffuse = {
            value: matParam.diffuse
        };
        this.uniforms.u_material_specular = {
            value: matParam.specular
        };
        this.uniforms.u_material_specular_mode = {
            // Force value of 0 if useSpecularModeBlinn is set.
            value: this._useSpecularModeBlinn ? 0 : matParam.specularMode
        };
        this.uniforms.u_material_specular_power = {
            value: matParam.specularPower
        };
    }

    /**
     * Gets the texture map if it is set.
     * @returns {import('three').Texture|null} The texture map, or null if it is unset.
     */
    get map() {
        return this.uniforms.s_texture ? this.uniforms.s_texture.value : null;
    }

    /**
     * Sets the texture map (s_texture uniform).
     * @param {import('three').Texture} value - The new texture map.
     */
    set map(value) {
        this.uniforms.s_texture = {
            value: value
        };
    }

    /**
     * Gets the second texture map if it is set.
     * @returns {import('three').Texture|null} The second texture map, or null if it is unset.
     */
    get map2() {
        return this.uniforms.s_texture2 ? this.uniforms.s_texture2.value : null;
    }

    /**
     * Sets the second texture map (s_texture2 uniform). Also enables/disables blending.
     * @param {import('three').Texture|null} value - The new second texture map.
     */
    set map2(value) {
        this.uniforms.s_texture2.value = value || new THREE.TextureLoader().load('https://placehold.co/64x64/000000/FFFFFF?text=Default'); // Set to default emblem if null
        this.uniforms.u_blendTextureEnabled.value = (value !== null); // Enable blending only if a texture is provided
    }

    /**
     * Gets the blend mode value.
     * @returns {FFLBlendMode} The blend mode value.
     */
    get blendMode() {
        return this.uniforms.u_blendMode.value;
    }

    /**
     * Sets the blend mode value.
     * @param {FFLBlendMode} value - The new blend mode value.
     */
    set blendMode(value) {
        this.uniforms.u_blendMode.value = value;
    }

    /**
     * Gets the emblem scale value.
     * @returns {number} The emblem scale value.
     */
    get emblemScale() {
        return this.uniforms.u_emblemScale.value;
    }

    /**
     * Sets the emblem scale value.
     * @param {number} value - The new emblem scale value.
     */
    set emblemScale(value) {
        this.uniforms.u_emblemScale.value = value;
    }

    /**
     * Gets the blend intensity value.
     * @returns {number} The blend intensity value.
     */
    get blendIntensity() {
        return this.uniforms.u_blendIntensity.value;
    }

    /**
     * Sets the blend intensity value.
     * @param {number} value - The new blend intensity value.
     */
    set blendIntensity(value) {
        this.uniforms.u_blendIntensity.value = value;
    }

    /**
     * Gets the light direction.
     * @returns {import('three').Vector3} The light direction.
     */
    get lightDirection() {
        // Should always be set as long as this is constructed.
        return this.uniforms.u_light_dir.value;
    }

    /**
     * Sets the light direction.
     * @param {import('three').Vector3} value - The new light direction.
     */
    set lightDirection(value) {
        this.uniforms.u_light_dir = {
            value: value
        };
    }

    /**
     * Sets the time uniform for animation.
     * @param {number} value - The current time in seconds.
     */
    set time(value) {
        this.uniforms.u_time.value = value;
    }

    /**
     * Gets the time uniform for animation.
     * @returns {number} The current time in seconds.
     */
    get time() {
        return this.uniforms.u_time.value;
    }
}
