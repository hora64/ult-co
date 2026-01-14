import { CanvasButton } from '../CanvasButton.js';
import { StaticFineGlitterEffect } from '../../richTextEffects/specialEffects/static/StaticFineGlitterEffect.js';

export class FineGlitterButton extends CanvasButton {
    constructor(options) {
        const { glitterType, effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new StaticFineGlitterEffect(),
                type: glitterType,
                effectState: effectState
            }
        });
    }
}
