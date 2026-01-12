import { CanvasButton } from '../CanvasButton.js';
import { NeonPulseEffect } from '../../richTextEffects/specialEffects/animated/NeonPulseEffect.js';

export class AnimatedNeonPulseButton extends CanvasButton {
    constructor(options) {
        const { color = 'magenta', effectState, ...rest } = options;
        super({
            ...rest,
            effect: {
                instance: new NeonPulseEffect(),
                type: color,
                effectState: effectState
            },
            textColor: 'white',
            font: 'bold 14px "Rodin", sans-serif',
            shadowOffset: { x: 0, y: 0, blur: 10, color: color },
        });
    }
}
