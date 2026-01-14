import { RichTextEffect } from "../RichTextEffect.js";

/**
 * Handles YouTube embeds in rich text.
 * Syntax: @[youtube](videoId)
 */
export class YouTubeEffect extends RichTextEffect {
    constructor(app) {
        super(app);
        this.name = "youtube";
        this.regex = /@\[youtube\]\((.*?)\)/g;
        this.isAnimated = false;
    }

    parse(match) {
        return {
            text: '',
            style: { youtube: match[1] },
        };
    }

    apply(ctx, currentX, currentY, token, maxWidth, lineHeight, totalHeight, links) {
        const videoId = token.style.youtube;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        const img = this.app.imageManager.getImage(thumbnailUrl);
        
        let drawWidth = maxWidth;
        let drawHeight = (maxWidth * 9) / 16;

        if (img && img.complete) {
            ctx.drawImage(img, currentX, currentY, drawWidth, drawHeight);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(currentX, currentY, drawWidth, drawHeight);
            ctx.fillStyle = 'white';
            ctx.fillText("Loading YouTube...", currentX + 10, currentY + 20);
        }

        // Draw play button overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(currentX + drawWidth / 2, currentY + drawHeight / 2, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(currentX + drawWidth / 2 - 10, currentY + drawHeight / 2 - 15);
        ctx.lineTo(currentX + drawWidth / 2 + 15, currentY + drawHeight / 2);
        ctx.lineTo(currentX + drawWidth / 2 - 10, currentY + drawHeight / 2 + 15);
        ctx.closePath();
        ctx.fill();

        links.push({
            rect: { x: currentX, y: currentY, width: drawWidth, height: drawHeight },
            url: `youtube:${videoId}`,
            type: 'youtube-embed'
        });

        return { y: currentY + drawHeight, height: totalHeight + drawHeight };
    }
}
