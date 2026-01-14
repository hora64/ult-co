import { CanvasButton } from '../CanvasButton.js';
import { StaticGemstoneEffect } from '../../richTextEffects/specialEffects/static/StaticGemstoneEffect.js';

export class GemstoneButton extends CanvasButton {
    constructor(options) {
        const { gemstoneType, effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new StaticGemstoneEffect(),
                type: gemstoneType,
                effectState: effectState
            }
        });
    }
}
