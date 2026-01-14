// Animated Effects
export * from './animated/FireEffect.js';
export * from './animated/GlitchEffect.js';
export * from './animated/GlowEffect.js';
export * from './animated/IceEffect.js';
export * from './animated/InkBleedEffect.js';
export * from './animated/MatrixEffect.js';
export * from './animated/MetallicEffect.js';
export * from './animated/NeonPulseEffect.js';
export * from './animated/PrizeEffect.js';
export * from './animated/RainbowEffect.js';
export * from './animated/RainbowFadeEffect.js';
export * from './animated/RainbowWaveEffect.js';
export * from './animated/RetroScanlinesEffect.js';
export * from './animated/TypingCursorEffect.js';
export * from './animated/TypewriterEffect.js';
export * from './animated/WaveTextEffect.js';
export * from './animated/BubblingEffect.js';
export * from './animated/MagmaEffect.js';
export * from './animated/WaterEffect.js';

// Static Effects
export * from './static/ThreeDEffect.js';
export * from './static/TextShadow3DEffect.js';
export * from './static/MirrorEffect.js';
export * from './static/NeonEffect.js';
export * from './static/OutlineGlowEffect.js';
export * from './static/StaticColorEffect.js';
export * from './static/StaticFineGlitterEffect.js';
export * from './static/StaticGemstoneEffect.js';
export * from './static/StaticHologramEffect.js';
export * from './static/SteelEffect.js';
export * from './static/EnvelopePaper.js';
export * from './static/LightPaper.js';
export * from './static/StandardPaper.js';
export * from './static/WhitePaper.js';
export * from './static/RoughPaper.js';
export * from './static/EchoEffect.js';
export * from './static/StaticWoodEffect.js';
export * from './static/StaticStoneEffect.js';

export function getMaterial(name) {
    const materialName = name.toLowerCase() + 'effect';
    for (const key in exports) {
        if (typeof exports[key] === 'function' && key.toLowerCase() === materialName) {
            return exports[key];
        }
    }
    return null;
}
