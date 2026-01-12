import * as allEffects from '../materials/index.js';

const effects = {};
for (const key in allEffects) {
    if (key.endsWith('Effect')) {
        const effectName = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '').replace('-effect', '');
        effects[effectName] = allEffects[key];
    }
}

export function getEffect(name) {
    return effects[name];
}

export function applyCanvasTextEffect(ctx, effectName, text, x, y, width, height, options) {
    const EffectClass = getEffect(effectName);
    if (EffectClass) {
        const effect = new EffectClass(options);
        effect.apply(ctx, x, y, width, height, text);
    } else {
        console.warn(`Effect "${effectName}" not found.`);
        ctx.fillText(text, x, y);
    }
}