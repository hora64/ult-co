import { CanvasButton } from '../CanvasButton.js';
import { StaticMetallicEffect } from '../richTextEffects/specialEffects/static/StaticMetallicEffect.js';

export class MetallicButton extends CanvasButton {
    constructor(options) {
        const { metalType = 'gold', effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new StaticMetallicEffect(),
                type: metalType,
                effectState: effectState
            }
        });
    }
}
