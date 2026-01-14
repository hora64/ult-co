import { Material } from "../Material.js";

/**
 * Applies a typing animation with a blinking cursor to text.
 * Syntax: {typingcursor|text}
 * Example: {typingcursor|Typing...}
 */
export class TypingCursorEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'typingcursor';
        this.regex = /{typingcursor\|([^}]+)}/g;
        this.isAnimated = true;
        this.currentTime = 0;
        this.text = '';
    }

    getMaterial(name) {
        if (name === this.name) {
            return new TypingCursorEffect();
        }
        return null;
    }

    parse(match) {
        this.text = match[1];
        return {
            text: '', // Initially empty
            style: {
                effect: this.name
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        const typingSpeed = 100;
        const blinkSpeed = 500;
        const charsToShow = Math.min(this.text.length, Math.floor(this.currentTime / typingSpeed));
        const displayedText = this.text.substring(0, charsToShow);

        ctx.fillText(displayedText, x, y);

        const showCursor = charsToShow < this.text.length || (Math.floor(this.currentTime / blinkSpeed) % 2 === 0);

        if (showCursor) {
            const cursorX = x + ctx.measureText(displayedText).width;
            const baseFontSize = parseInt(ctx.font);
            ctx.fillRect(cursorX, y - baseFontSize * 0.8, 2, baseFontSize);
        }
    }

    update(deltaTime) {
        this.currentTime += deltaTime;
    }
}
