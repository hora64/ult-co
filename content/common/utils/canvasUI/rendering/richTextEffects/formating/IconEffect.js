import { RichTextEffect } from '../RichTextEffect.js';

const imageCache = new Map();

/**
 * Renders an inline icon from an image file.
 * Syntax: {icon:img=src, link=href, onclick=action, size=scale, subscript=true, superscript=true}
 * - img: The source of the image for the icon. URL or local path.
 * - link: (Optional) URL to open when the icon is clicked.
 * - onclick: (Optional) Action to perform when the icon is clicked.
 * - size: (Optional) Scale multiplier relative to font size. Default = 1.0
 * - subscript: (Optional) Renders the icon as subscript.
 * - superscript: (Optional) Renders the icon as superscript.
 *
 * Example: {icon:img=path/to/image.png, link=https://example.com, onclick=myAction, size=1.5}
 */
export class IconEffect extends RichTextEffect {
    constructor() {
        super();
        this.regex = /\{icon:([^\}]+)\}/g;
        this.name = 'icon';
    }

    parse(match) {
        const attributes = match[1];
        const style = { [this.name]: true };

        const attrRegex = /(\w+)=([^,]+)/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
            style[attrMatch[1]] = attrMatch[2];
        }

        return {
            text: ' ', // placeholder for layout
            style,
        };
    }

    /**
     * Loads the image into the cache.
     * @param {string} src The image source.
     * @returns {Promise<HTMLImageElement | null>} A promise that resolves with the image element or null on error.
     */
    async loadImage(src) {
        if (!src) return null;
        if (imageCache.has(src)) return imageCache.get(src);

        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                imageCache.set(src, image);
                resolve(image);
            };
            image.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                imageCache.set(src, null);
                resolve(null);
            };
            image.src = src;
        });
    }

    // `preload` is now an async method to await image loading.
    async preload(token) {
        const { img } = token.style;
        return this.loadImage(img);
    }

    async apply(ctx, text, x, y, token, baseFontSize, lineHeight, links) {
        const { img, link, onclick, size, subscript, superscript } = token.style;
        const image = await this.loadImage(img); // Wait for the image to load
        if (!image) return; // Exit if the image failed to load

        const scale = size ? Math.min(parseFloat(size), 5) : 1.0;
        let iconHeight = baseFontSize * scale;
        let iconWidth = (image.width / image.height) * iconHeight;
        let yOffset = 0;

        if (subscript) {
            const scriptScale = 0.8;
            iconHeight *= scriptScale;
            iconWidth *= scriptScale;
            yOffset = iconHeight * 0.2;
        } else if (superscript) {
            const scriptScale = 0.8;
            iconHeight *= scriptScale;
            iconWidth *= scriptScale;
            yOffset = -iconHeight * 0.4;
        }

        const iconY = y - (iconHeight - baseFontSize) / 2 + yOffset;
        ctx.drawImage(image, x, iconY, iconWidth, iconHeight);

        if (link || onclick) {
            links.push({
                x,
                y: iconY,
                width: iconWidth,
                height: iconHeight,
                url: link,
                action: onclick,
            });
        }
    }

    async measure(token, baseFontSize) {
        const image = await this.loadImage(token.style.img); // Wait for the image
        if (!image) return 0;

        const { size, subscript, superscript } = token.style;
        const scale = size ? Math.min(parseFloat(size), 5) : 1.0;
        let iconHeight = baseFontSize * scale;
        let iconWidth = (image.width / image.height) * iconHeight;

        if (subscript || superscript) {
            const scriptScale = 0.8;
            iconWidth *= scriptScale;
        }

        return iconWidth;
    }
}