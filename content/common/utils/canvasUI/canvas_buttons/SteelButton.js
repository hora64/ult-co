import { MetallicButton } from './MetallicButton.js';

export class SteelButton extends MetallicButton {
    constructor(options) {
        super({
            ...options,
            metalType: 'steel',
        });
    }
}
