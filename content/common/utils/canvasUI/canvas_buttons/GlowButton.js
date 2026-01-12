import { CanvasButton } from '../CanvasButton.js';
import { StaticGlowEffect } from '../../richTextEffects/specialEffects/static/StaticGlowEffect.js';

export class GlowButton extends CanvasButton {
    constructor(options) {
        const { color, effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new StaticGlowEffect(),
                type: color,
                effectState: effectState
            }
        });
    }
}
