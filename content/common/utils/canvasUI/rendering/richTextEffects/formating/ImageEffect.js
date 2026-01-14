import { RichTextEffect } from "../RichTextEffect.js";

/**
 * Handles images in rich text.
 * Syntax: ![alt](url)
 */
export class ImageEffect extends RichTextEffect {
    constructor(app) {
        super(app);
        this.name = "image";
        this.regex = /!\[(.*?)\]\((.*?)\)/g;
        this.isAnimated = false;
    }

    parse(match) {
        return {
            text: '', // Images don't have text content
            style: { image: match[2], alt: match[1] },
        };
    }

    apply(ctx, currentX, currentY, token, maxWidth, lineHeight, totalHeight, links) {
        const img = this.app.imageManager.getImage(token.style.image);
        let drawWidth = 0;
        let drawHeight = 0;

        if (img && img.complete) {
            const aspectRatio = img.height / img.width;
            drawWidth = Math.min(img.width, maxWidth);
            drawHeight = drawWidth * aspectRatio;
        } else {
            drawWidth = 50; // Placeholder size
            drawHeight = 50;
        }

        ctx.drawImage(img, currentX, currentY, drawWidth, drawHeight);
        
        links.push({
            rect: { x: currentX, y: currentY, width: drawWidth, height: drawHeight },
            url: token.style.image,
            type: 'image'
        });

        return { y: currentY + drawHeight, height: totalHeight + drawHeight };
    }
}
