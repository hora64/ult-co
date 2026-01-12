import { CanvasButton } from '../CanvasButton.js';
import { NeonEffect } from '../../richTextEffects/specialEffects/static/NeonEffect.js';

export class NeonButton extends CanvasButton {
    constructor(options) {
        const { color = 'cyan', effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new NeonEffect(),
                type: color,
                effectState: effectState
            },
            textColor: 'white',
            font: 'bold 14px "Rodin", sans-serif',
            shadowOffset: { x: 0, y: 0, blur: 10, color: color },
        });
    }
}
