import { Material } from "../Material.js";

/**
 * Applies a bubbling animation effect to text.
 * Syntax: {bubbling:color|text}
 * Example: {bubbling:rgba(173, 216, 230, 0.7)|Bubbling Text}
 */
export class BubblingEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.name = 'bubbling';
        this.regex = /{bubbling:([^|]+)\|([^}]+)}/g;
        this.isAnimated = true;
        this.bubbleColor = 'rgba(173, 216, 230, 0.7)';
        this.parsedBubbleColor = this.hexToRgb(this.bubbleColor);
        this.bubbles = [];
    }

    getMaterial(name) {
        if (name === this.name) {
            return new BubblingEffect();
        }
        return null;
    }

    parse(match) {
        return {
            text: match[2],
            style: {
                effect: this.name,
                color: match[1]
            }
        };
    }

    apply(ctx, x, y, width, height, text) {
        ctx.fillText(text, x, y);

        this.bubbles.forEach(bubble => {
            const alpha = 1 - bubble.y / height;
            ctx.fillStyle = `rgba(${this.parsedBubbleColor.r}, ${this.parsedBubbleColor.g}, ${this.parsedBubbleColor.b}, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    update(deltaTime) {
        // Create new bubbles
        if (Math.random() < 0.5) {
            this.bubbles.push({
                x: Math.random() * this.options.width,
                y: this.options.height,
                size: 1 + Math.random() * 2,
                speed: 1 + Math.random() * 2
            });
        }

        // Update and remove old bubbles
        this.bubbles = this.bubbles.filter(bubble => {
            bubble.y -= bubble.speed * (deltaTime / 16);
            return bubble.y > 0;
        });
    }
}
