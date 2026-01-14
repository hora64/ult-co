import { CanvasButton } from '../CanvasButton.js';
import { StaticIceEffect } from '../../richTextEffects/specialEffects/static/StaticIceEffect.js';

export class IceButton extends CanvasButton {
    constructor(options) {
        const { effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new StaticIceEffect(),
                type: null, // Ice effect doesn't have types
                effectState: effectState
            },
            textColor: 'white',
            font: 'bold 14px "Rodin", sans-serif',
            shadowOffset: { x: 0, y: 2, blur: 4, color: 'rgba(173, 216, 230, 0.7)' },
        });
    }
}
