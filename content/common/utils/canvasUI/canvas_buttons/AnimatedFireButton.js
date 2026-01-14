import { CanvasButton } from '../CanvasButton.js';
import { FireEffect } from '../../richTextEffects/specialEffects/animated/FireEffect.js';

export class AnimatedFireButton extends CanvasButton {
    constructor(options) {
        const { effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new FireEffect(),
                type: null, // Fire effect doesn't have types
                effectState: effectState
            },
            textColor: 'white',
            font: 'bold 14px "Rodin", sans-serif',
            shadowOffset: { x: 0, y: 2, blur: 4, color: 'rgba(255,165,0,0.5)' },
        });
    }
}
