import { TextCanvasMeasurer } from "/content/common/utils/index.js";
import * as allEffects from './richTextEffects/rich-text-effects-index.js';

/**
 * A comprehensive renderer for rich text content on a canvas.
 * It parses a markdown-like syntax into formatted text, handling various
 * block types (paragraphs, lists, tables), inline styles (bold, italic),
 * and special effects (links, icons, custom animated effects).
 */
export class RichTextRenderer {
    /**
     * Initializes the RichTextRenderer.
     * @param {object} app - The main application instance, used to access global resources like CSS variables.
     */
    constructor(app) {
        this.app = app;
        this.measurer = new TextCanvasMeasurer();
        this.effects = {};
        this.renderedEffects = new Set();

        // Dynamically load all exported effects from the effects index file.
        for (const effectName in allEffects) {
            const EffectClass = allEffects[effectName];
            if (typeof EffectClass !== 'function' || !EffectClass.prototype) {
                continue;
            }
            const effectInstanceName = effectName.replace('Effect', '').toLowerCase();

            try {
                if (effectName === 'getMaterial') {
                    continue;
                }
                const effectInstance = new EffectClass(this.app, {});
                if (effectInstance.name) {
                    this.effects[effectInstance.name] = effectInstance;
                } else {
                    effectInstance.name = effectInstanceName;
                    this.effects[effectInstanceName] = effectInstance;
                }
            } catch (error) {
                console.error(`Failed to load effect ${effectName}:`, error);
            }
        }

        //This is a hack to get the old effects to work
        if (allEffects.ThreeDEffect) {
            this.effects.threed = new allEffects.ThreeDEffect(this.app, {});
        }
    }

    /**
     * Preloads any asynchronous data required by the text tokens, such as images for icons.
     * This should be called after parsing and before rendering to avoid pop-in.
     * @param {Array<object>} tokens - An array of parsed text tokens.
     * @returns {Promise<void>} A promise that resolves when all data is preloaded.
     */
    async preloadData(tokens = []) {
        const preloadPromises = [];
        for (const token of tokens) {
            if (token.type === 'container') {
                preloadPromises.push(this.preloadData(token.children));
            }
            // Call preload on any effect that has a preload method.
            for (const styleKey in token.style) {
                const effect = this.effects[styleKey];
                if (effect && typeof effect.preload === 'function') {
                    preloadPromises.push(effect.preload(token));
                }
            }
        }
        await Promise.all(preloadPromises);
    }

    /**
     * Parses a string with inline formatting tags into a series of tokens.
     * @param {string} text - The text to parse.
     * @param {object} [options={}] - Parsing options.
     * @param {Array<string>} [options.disableEffects=[]] - A list of effect names to disable during parsing.
     * @returns {{tokens: Array<object>, isAnimated: boolean}} An object containing the token array and a flag indicating if any effects are animated.
     */
    parseInlineFormatting(text = "", options = {}) {
        const { disableEffects = [] } = options;
        const tokens = [];
        let lastIndex = 0;
        let isAnimated = false;

        // Combine all registered effect regexes into a single regex for efficient matching.
        const activeEffects = Object.values(this.effects).filter(effect => effect.regex && !disableEffects.includes(effect.name));
        const combinedRegexParts = activeEffects.map(effect => `(?<${effect.name}>${effect.regex.source})`);

        // Add regex for built-in formats directly.
        combinedRegexParts.push('(?<style>\\{style:([^\\|]+?)\\|(.*?)\\})');
        combinedRegexParts.push('(?<link>\\[((?:[^\\[\\]]|\\[[^\\]]*\\])*)\\]\\(([^)]+)\\))');
        // Fixed color regex to properly capture hex colors and color names
        combinedRegexParts.push('(?<color>\\{color:(#[0-9a-fA-F]{6}|[a-zA-Z]+)\\|(.*?)\\})');

        const combinedRegex = new RegExp(combinedRegexParts.join('|'), 'gs');

        let match;
        while ((match = combinedRegex.exec(text)) !== null) {
            // Add any plain text before the current match.
            if (match.index > lastIndex) {
                tokens.push({
                    text: text.substring(lastIndex, match.index),
                    style: {},
                });
            }

            const groups = match.groups;
            let token;

            // Process the matched group.
            if (groups.style) {
                const styleMatch = /\{style:([^\|]+?)\|(.*?)\}/gs.exec(groups.style);
                if (styleMatch) {
                    const options = styleMatch[1].split(',');
                    const content = styleMatch[2];
                    const style = {};

                    const styleMap = {
                        sub: () => style.subscript = true,
                        sup: () => style.superscript = true,
                        italic: () => style.italic = true,
                        underline: () => style.underline = true,
                        strikethrough: () => style.strikethrough = true,
                    };

                    options.forEach(option => {
                        option = option.trim();
                        
                        // Handle basic styles
                        if (styleMap[option]) {
                            styleMap[option]();
                        } 
                        // Handle bold with optional value
                        else if (option.startsWith('bold')) {
                            const [, value] = option.split('=');
                            style.bold = value || 'auto'; // 'native', 'pseudo', or 'auto'
                        } 
                        // Handle color
                        else if (option.startsWith('color=')) {
                            style.color = option.slice(6);
                        } 
                        // Handle highlight
                        else if (option.startsWith('highlight=')) {
                            style.highlight = option.slice(10);
                        }
                        // Handle ALL effect properties with parameters
                        else if (option.includes('=')) {
                            const [effectName, params] = option.split('=', 2);
                            const effect = this.effects[effectName.toLowerCase()];
                            if (effect) {
                                // Store effect name and parameters
                                style[effectName.toLowerCase()] = params;
                            }
                        }
                        // Handle effect properties without parameters
                        else {
                            const effect = this.effects[option.toLowerCase()];
                            if (effect) {
                                style[option.toLowerCase()] = true;
                            }
                        }
                    });

                    // Recursively parse the content within the style tag.
                    const nestedContent = this.parseInlineFormatting(content, { disableEffects: Object.keys(style).filter(k => this.effects[k]) });
                    token = {
                        type: 'container',
                        style: style,
                        children: nestedContent.tokens,
                        isAnimated: nestedContent.isAnimated,
                    };
                    
                    // Check if any of the styles are animated effects
                    for (const styleKey in style) {
                        const effect = this.effects[styleKey];
                        if (effect && effect.isAnimated) {
                            isAnimated = true;
                            token.isAnimated = true;
                            break;
                        }
                    }
                    
                    if (token.isAnimated) isAnimated = true;
                }
            } else if (groups.link) {
                const linkMatch = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\(([^)]+)\)/g.exec(groups.link);
                if (linkMatch) {
                    const innerText = linkMatch[1];
                    const url = linkMatch[2];

                    // Recursively parse the link text.
                    const nestedContent = this.parseInlineFormatting(innerText, { disableEffects: ['link'] });

                    token = {
                        type: 'container',
                        style: {
                            link: url,
                            underline: true,
                        },
                        children: nestedContent.tokens,
                        isAnimated: nestedContent.isAnimated,
                    };
                    if (token.isAnimated) isAnimated = true;
                }
            } else if (groups.color) {
                // Handle color formatting: {color:colorValue|text}
                const colorMatch = /\{color:(#[0-9a-fA-F]{6}|[a-zA-Z]+)\|(.*?)\}/gs.exec(groups.color);
                if (colorMatch) {
                    const colorValue = colorMatch[1];
                    const content = colorMatch[2];

                    // Recursively parse the content within the color tag
                    const nestedContent = this.parseInlineFormatting(content, { disableEffects: ['color'] });

                    token = {
                        type: 'container',
                        style: {
                            color: colorValue,
                        },
                        children: nestedContent.tokens,
                        isAnimated: nestedContent.isAnimated,
                    };
                    if (token.isAnimated) isAnimated = true;
                }
            } else {
                // Handle other dynamic effects.
                for (const effectName in this.effects) {
                    if (groups[effectName] && !disableEffects.includes(effectName)) {
                        const effect = this.effects[effectName];
                        const effectMatch = new RegExp(effect.regex.source, 'g').exec(groups[effectName]);
                        if (effectMatch) {
                            token = effect.parse(effectMatch);
                            if (token.isAnimated) {
                                isAnimated = true;
                            }
                            break;
                        }
                    }
                }
            }

            if (token) tokens.push(token);
            lastIndex = match.index + match[0].length;
        }

        // Add any remaining plain text.
        if (lastIndex < text.length) {
            tokens.push({ text: text.substring(lastIndex), style: {} });
        }
        return { tokens, isAnimated };
    }

    /**
     * Parses a multi-line string into block-level elements like paragraphs, lists, etc.
     * @param {string} text - The full text content to parse.
     * @returns {Array<object>} An array of block objects.
     */
    parseBlockContent(text) {
        if (typeof text !== 'string') {
            console.warn('RichTextRenderer.parseBlockContent received non-string input:', text);
            text = String(text); // Attempt to convert to string
        }
        const blocks = [];
        const lines = text.split("\n");
        let isAnimated = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Horizontal Rule
            if (/^---\s*$/.test(line)) {
                blocks.push({ type: "hr" });
                continue;
            }

            // Embeds (e.g., YouTube)
            let match = line.match(/^@\[(youtube)\]\((.*?)\)/);
            if (match) {
                blocks.push({ type: "embed", service: match[1], id: match[2] });
                continue;
            }

            // Images
            match = line.match(/^!\[(.*?)\]\((.*?)\)/);
            if (match) {
                blocks.push({ type: "image", alt: match[1], url: match[2] });
                continue;
            }

            // Checkboxes
            match = line.match(/^\[([ x])\]\s+(.*)/);
            if (match) {
                const parsed = this.parseInlineFormatting(match[2]);
                if (parsed.isAnimated) isAnimated = true;
                blocks.push({ type: "checkbox", checked: match[1] === "x", ...parsed });
                continue;
            }

            // Lists (ordered and unordered)
            match = line.match(/^(\s*)(-|[0-9]+\.)\s+(.*)/);
            if (match) {
                const level = Math.floor(match[1].length / 2);
                const ordered = /^[0-9]/.test(match[2]);
                const lastBlock = blocks[blocks.length - 1];
                const parsed = this.parseInlineFormatting(match[3]);
                if (parsed.isAnimated) isAnimated = true;

                if (lastBlock && lastBlock.type === "list" && lastBlock.ordered === ordered) {
                    lastBlock.items.push({ level, ...parsed });
                } else {
                    blocks.push({ type: "list", ordered, items: [{ level, ...parsed }] });
                }
                continue;
            }

            // Tables
            if (line.includes("|")) {
                const lastBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;
                if (lines[i + 1] && lines[i + 1].includes("|") && /\|-*:/.test(lines[i + 1])) {
                    const headers = line.split("|").map((h) => {
                        const parsed = this.parseInlineFormatting(h.trim());
                        if (parsed.isAnimated) isAnimated = true;
                        return parsed;
                    });
                    blocks.push({ type: "table", headers, rows: [] });
                    i++; // Skip the separator line
                    continue;
                } else if (lastBlock && lastBlock.type === "table") {
                    const row = line.split("|").map((c) => {
                        const parsed = this.parseInlineFormatting(c.trim());
                        if (parsed.isAnimated) isAnimated = true;
                        return parsed;
                    });
                    lastBlock.rows.push(row);
                    continue;
                }
            }

            // Paragraphs
            if (line.trim() !== "") {
                const parsed = this.parseInlineFormatting(line);
                if (parsed.isAnimated) isAnimated = true;
                blocks.push({ type: "paragraph", ...parsed });
            } else {
                // Represents an empty line (creates a space between paragraphs).
                blocks.push({ type: "paragraph", tokens: [{ text: " ", style: {} }] });
            }
        }

        // After parsing all blocks, trigger preloading of any async assets.
        const preloadPromises = blocks.map(block => {
            if (block.tokens) {
                return this.preloadData(block.tokens);
            } else if (block.items) {
                const itemPromises = block.items.map(item => this.preloadData(item.tokens));
                return Promise.all(itemPromises);
            } else if (block.headers && block.rows) {
                const headerPromises = block.headers.map(h => this.preloadData(h.tokens));
                const rowPromises = block.rows.flat().map(c => this.preloadData(c.tokens));
                return Promise.all([...headerPromises, ...rowPromises]);
            }
            return Promise.resolve();
        });

        Promise.all(preloadPromises).then(() => {
            // A re-render could be triggered here if the rendering framework requires it.
        });

        // Propagate animation flags to the block level.
        blocks.forEach(block => {
            if (block.type === 'paragraph' || block.type === 'checkbox') {
                block.isAnimated = block.isAnimated;
            } else if (block.type === 'list') {
                block.isAnimated = block.items.some(item => item.isAnimated);
            } else if (block.type === 'table') {
                const headerAnimated = block.headers.some(h => h.isAnimated);
                const rowsAnimated = block.rows.some(r => r.some(c => c.isAnimated));
                block.isAnimated = headerAnimated || rowsAnimated;
            }
        });

        return blocks;
    }

    /**
     * Main entry point for drawing rich text onto a canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} text - The rich text string to render.
     * @param {number} x - The starting X coordinate.
     * @param {number} y - The starting Y Coordinate.
     * @param {number} width - The maximum width for the text content.
     * @param {number} height - The maximum height for the text content.
     * @param {object} [options={}] - Rendering options.
     */
    draw(ctx, text, x, y, width, height, options = {}) {
        const {
            font = this._getDefaultFont(),
            fontSize,
            color = this.app.cssVars['--ds-text'] || '#EAEAEA',
            hAlign = 'left',
            vAlign = 'top',
            lineSpacingFactor = 1.2
        } = options;

        this.renderedEffects.clear(); // Clear effects for this draw call

        let finalFont = font;
        if (fontSize) {
            finalFont = font.replace(/\d+px/, `${fontSize}px`);
        }

        const parsed = this.parseBlockContent(text);
        // First pass: measure the total height to calculate vertical alignment.
        const totalHeight = this.renderBlocks(ctx, parsed, x, y, width, height, finalFont, color, lineSpacingFactor, true);

        let startY = y;
        if (vAlign === 'middle') {
            startY = y + (height - totalHeight) / 2;
        } else if (vAlign === 'bottom') {
            startY = y + height - totalHeight;
        }

        // Second pass: actually draw the content at the calculated position.
        this.renderBlocks(ctx, parsed, x, startY, width, height, finalFont, color, lineSpacingFactor, false, hAlign);

        // Debug logging: Report the number and names of rendered effects.
        if (this.renderedEffects.size > 0) {
            console.log('Rendered effects:', Array.from(this.renderedEffects).join(', '));
        }
    }

    /**
     * Gets the default font, considering i18n font configuration if available.
     * @private
     * @returns {string} CSS font string
     */
    _getDefaultFont() {
        // Try to get font from i18n configuration
        if (this.app.i18n?.current?._meta?.font) {
            const fontConfig = this.app.i18n.current._meta.font;
            const fontFamily = `"${fontConfig.primary}", ${fontConfig.fallback}`;
            return `16px ${fontFamily}`;
        }
        
        // Check if Chinese language is being used
        const userLanguage = this.app.language || localStorage.getItem("userLanguage") || "en-US";
        if (userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant' || userLanguage === 'x-debug-zh-Hans-CN') {
            // Use Chinese font if available
            if (this.app.chineseFontLoaded) {
                return '16px "DFPHeiW5-GB", "Microsoft YaHei", "SimHei", sans-serif';
            }
        }
        
        // Comprehensive fallback stack for maximum character support
        const fallbackStack = [
            '"Rodin"',
            '"FOT-RodinNTLG Pro DB"',
            'Arial',
            '"Segoe UI"',
            '"Helvetica Neue"',
            'Helvetica',
            '"Liberation Sans"',
            '"Nimbus Sans L"',
            'sans-serif'
        ].join(', ');
        
        return `16px ${fallbackStack}`;
    }

    _getFontFamily() {
        // First, try to get font from i18n current configuration
        if (this.app.i18n?.current?._meta?.font) {
            const fontConfig = this.app.i18n.current._meta.font;
            return `"${fontConfig.primary}", ${fontConfig.fallback}`;
        }
        
        // Fallback to app.translations (legacy support)
        if (this.app.translations?._meta?.font) {
            const fontConfig = this.app.translations._meta.font;
            return `"${fontConfig.primary}", ${fontConfig.fallback}`;
        }
        
        // Check if Chinese language is being used
        const userLanguage = this.app.language || localStorage.getItem("userLanguage") || "en-US";
        if (userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant' || userLanguage === 'x-debug-zh-Hans-CN') {
            // Use Chinese font if available
            if (this.app.chineseFontLoaded) {
                return '"DFPHeiW5-GB", "Microsoft YaHei", "SimHei", sans-serif';
            } else {
                // Fallback to system Chinese fonts
                return '"Microsoft YaHei", "SimHei", "Heiti SC", "PingFang SC", sans-serif';
            }
        }

        return '"FOT-RodinNTLG Pro DB", Rodin, Arial, "Segoe UI", "Helvetica Neue", Helvetica, "Liberation Sans", "Nimbus Sans L", sans-serif';
    }

    _getFontScale() {
        // First, try to get scale from i18n current configuration
        if (this.app.i18n?.current?._meta?.font?.scale) {
            return this.app.i18n.current._meta.font.scale;
        }
        
        // Fallback to app.translations (legacy support)
        if (this.app.translations?._meta?.font?.scale) {
            return this.app.translations._meta.font.scale;
        }
        
        // Fallback for Chinese if scale not in meta (legacy support)
        const userLanguage = this.app.language || localStorage.getItem("userLanguage") || "en-US";
        if (userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant' || userLanguage === 'x-debug-zh-Hans-CN') {
            return 1.15;
        }
        return 1.0;
    }

    /**
     * Renders an array of block objects.
     * @param {boolean} measureOnly - If true, rendering is skipped, and only height is calculated.
     * @returns {number} The total rendered height of the blocks.
     */
    renderBlocks(ctx, blocks, x, y, width, height, baseFont, baseColor, lineSpacingFactor, measureOnly, hAlign = 'left') {
        let currentY = y;
        let totalHeight = 0;
        const baseFontSize = parseInt(baseFont);
        const lineHeight = baseFontSize * lineSpacingFactor;

        for (const block of blocks) {
            let blockX = x;
            // Adjust starting X for horizontal alignment.
            if (hAlign === 'center') {
                const measuredWidth = this.renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, baseColor, width, lineSpacingFactor, true).width;
                blockX = x + (width - measuredWidth) / 2;
            } else if (hAlign === 'right') {
                const measuredWidth = this.renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, baseColor, width, lineSpacingFactor, true).width;
                blockX = x + width - measuredWidth;
            }

            if (block.type === 'paragraph') {
                const result = this.renderInlineFormattedText(ctx, block.tokens, blockX, currentY, baseFont, baseColor, width, lineSpacingFactor, measureOnly);
                currentY += result.height;
                totalHeight += result.height;
            } else {
                // Handle other block types (hr, list, etc.)
                currentY += lineHeight;
                totalHeight += lineHeight;
            }
        }
        return totalHeight;
    }

    /**
     * Renders a line of inline-formatted text tokens, handling word wrapping.
     * @param {boolean} measureOnly - If true, rendering is skipped, and dimensions are calculated.
     * @returns {{height: number, links: Array, isAnimated: boolean, currentX: number, currentY: number, width: number}} The rendering results.
     */
    renderInlineFormattedText(ctx, tokens, x, y, baseFont, baseColor, maxWidth, lineSpacingFactor, measureOnly = false, lineStartX = null) {
        ctx.save();
        let currentX = x;
        let currentY = y;
        const baseFontSize = parseInt(baseFont);
        
        // Use configured font family that includes Chinese support
        const fontFamily = this._getFontFamily();

        const metrics = this.measurer.measureText("M", baseFont);
        const baseLineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const lineHeight = baseLineHeight * lineSpacingFactor;

        let totalHeight = tokens.length > 0 && tokens.some((t) => t.text || t.style.image || t.style.youtube) ? lineHeight : 0;
        const links = [];
        let isAnimated = false;
        let measuredWidth = 0;

        ctx.textBaseline = "top";
        const startX = lineStartX !== null ? lineStartX : x;

        const applyStyle = (style) => {
            let fontStyle = "";
            let fontSize = baseFontSize;
            let yOffset = 0;

            if (style.script) {
                fontSize = Math.floor(baseFontSize * 0.8);
                yOffset = style.script === "super" ? -fontSize * 0.4 : (baseFontSize - fontSize) * 0.7;
            }

            ctx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
            ctx.fillStyle = style.link ? this.app.cssVars["--link-color"] : (style.color || baseColor);
            return yOffset;
        };

        for (const token of tokens) {
            if (token.type === 'container') {
                // Recursively render children of container tokens.
                const containerChildren = token.children.map(child => ({
                    ...child,
                    style: { ...token.style, ...child.style }
                }));

                const containerMeasureResult = this.renderInlineFormattedText(ctx, containerChildren, currentX, currentY, baseFont, baseColor, maxWidth, lineSpacingFactor, true, startX);

                if (token.style.link) {
                    links.push({ x: currentX, y: currentY, width: containerMeasureResult.width, height: containerMeasureResult.height, url: token.style.link });
                }

                if (!measureOnly) {
                    this.renderInlineFormattedText(ctx, containerChildren, currentX, currentY, baseFont, baseColor, maxWidth, lineSpacingFactor, false, startX);
                }

                currentX = containerMeasureResult.currentX;
                currentY = containerMeasureResult.currentY;
                totalHeight = Math.max(totalHeight, containerMeasureResult.height);
                if (containerMeasureResult.isAnimated) isAnimated = true;
                continue;
            }

            // Handle full-line media like images or YouTube embeds.
            if (token.style.image || token.style.youtube) {
                if (currentX > x) {
                    currentX = x;
                    currentY += lineHeight;
                    totalHeight += lineHeight;
                }
                if (!measureOnly) {
                    const effectName = token.style.image ? 'image' : 'youtube';
                    this.renderedEffects.add(effectName);
                    const effect = this.effects[effectName];
                    const result = effect.apply(ctx, currentX, currentY, token, maxWidth, lineHeight, totalHeight, links);
                    currentY = result.y;
                    totalHeight = result.height;
                }
                continue;
            }

            // Handle inline icons.
            if (token.style.icon) {
                const effect = this.effects.icon;
                if (effect) {
                    const iconWidth = effect.measure(token, baseFontSize);
                    if (currentX > startX && currentX + iconWidth > startX + maxWidth) {
                        currentX = startX;
                        currentY += lineHeight;
                        totalHeight += lineHeight;
                    }
                    if (!measureOnly) {
                        this.renderedEffects.add('icon');
                        effect.apply(ctx, null, currentX, currentY, token, baseFontSize, lineHeight, links);
                      }
                    currentX += iconWidth;
                }
                continue;
            }

            if (typeof token.text === 'undefined') continue;

            // Check if text contains Chinese characters for word splitting
            const userLanguage = this.app.language || localStorage.getItem("userLanguage") || "en-US";
            const isChinese = userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant';
            
            // Split text appropriately based on language
            const words = isChinese 
                ? token.text.split('') // Split by characters for Chinese
                : token.text.split(/(\s+|(?<=[.,;!?]))/g).filter(w => w);

            for (const word of words) {
                if (word === "") continue;

                const yOffset = applyStyle(token.style);
                const wordWidth = ctx.measureText(word).width;

                // Wrap to the next line if the word exceeds the max width.
                if (currentX > startX && currentX + wordWidth > startX + maxWidth && word.trim() !== "") {
                    measuredWidth = Math.max(measuredWidth, currentX - startX);
                    currentX = startX;
                    currentY += lineHeight;
                    totalHeight += lineHeight;
                }

                if (!measureOnly) {
                    const textY = currentY + yOffset;

                    const hasAnimatedEffect = Object.keys(token.style).some(styleKey => {
                        const effect = this.effects[styleKey];
                        return effect && effect.isAnimated;
                    });

                    if (hasAnimatedEffect) {
                        // For animated effects, we assume the effect's `apply` method will handle rendering the text.
                        // We still need to call _renderStyledWord to set up the context correctly (font, etc.)
                        // but we can make it invisible.
                        ctx.save();
                        ctx.globalAlpha = 0;
                        this._renderStyledWord(ctx, word, currentX, textY, token, baseFontSize, baseColor);
                        ctx.restore();
                    } else {
                        this._renderStyledWord(ctx, word, currentX, textY, token, baseFontSize, baseColor);
                    }

                    // Overlay any additional, non-formatting effects.
                    for (const styleKey in token.style) {
                        const effect = this.effects[styleKey];
                        if (effect && !['bold', 'italic', 'subscript', 'superscript', 'color', 'highlight', 'underline', 'strikethrough', 'style', 'link'].includes(styleKey)) {
                            ctx.save();
                            this.renderedEffects.add(styleKey); // Log effect
                            effect.apply(ctx, word, currentX, textY, token, baseFontSize, lineHeight, links);
                            ctx.restore();
                        }
                    }
                }
                currentX += wordWidth;
            }
        }

        measuredWidth = Math.max(measuredWidth, currentX - startX);
        ctx.restore();
        return { height: totalHeight, links, isAnimated, currentX, currentY, width: measuredWidth };
    }

    /**
     * Renders a single word with all its associated basic styles (color, bold, italic, etc.).
     * @private
     */
    _renderStyledWord(ctx, text, x, y, token, baseFontSize, baseColor) {
        const originalFont = ctx.font;
        const originalFill = ctx.fillStyle;

        const fontParts = originalFont.match(/^(italic\s)?(bold\s)?([\d.]+)(px|pt|em|%|vw|vh)\s(.+)$/i) || [];
        let fontStyle = token.style.italic ? 'italic ' : (fontParts[1] || '');
        let fontWeight = (token.style.bold === 'native' || token.style.bold === 'auto') ? 'bold ' : (fontParts[2] || '');
        let fontSize = fontParts[3] ? parseFloat(fontParts[3]) : baseFontSize;
        const fontUnit = fontParts[4] || 'px';

        // Apply dynamic font scaling from config
        const scale = this._getFontScale();
        if (scale !== 1.0) {
            fontSize = Math.round(fontSize * scale);
        }

        // Use configured font family (with Chinese support)
        const fontFamily = this._getFontFamily();

        let newFontSize = fontSize;
        let yOffset = 0;

        if (token.style.subscript) {
            newFontSize *= 0.8;
            yOffset = newFontSize * 0.4;
            this.renderedEffects.add('subscript');
        } else if (token.style.superscript) {
            newFontSize *= 0.8;
            yOffset = -newFontSize * 0.4;
            this.renderedEffects.add('superscript');
        }

        if (token.style.italic) this.renderedEffects.add('italic');
        if (token.style.bold) this.renderedEffects.add(`bold (${token.style.bold})`);


        ctx.font = `${fontStyle}${fontWeight}${newFontSize}${fontUnit} ${fontFamily}`.trim();
        
        // Force canvas to reload font by setting it twice (workaround for font loading issues)
        const finalFont = ctx.font;
        ctx.font = 'italic 1px sans-serif';  // Dummy to force re-parse
        ctx.font = finalFont;
        
        ctx.fillStyle = token.style.color || (token.style.link ? (this.app.cssVars['--link-color'] || '#007bff') : (baseColor || originalFill));
        if(token.style.color) this.renderedEffects.add('color');
        if(token.style.link) this.renderedEffects.add('link');

        if (token.style.highlight) {
            const textWidth = ctx.measureText(text).width;
            const highlightY = y - 2;
            const highlightHeight = newFontSize + 4;
            ctx.save();
            ctx.fillStyle = this._getHighlightColor(token.style.highlight);
            ctx.fillRect(x, highlightY, textWidth, highlightHeight);
            ctx.restore();
            this.renderedEffects.add('highlight');
        }

        const usePseudoBold = token.style.bold === 'pseudo' || (token.style.bold === 'auto' && !this._isFontBoldable(fontFamily));
        if (usePseudoBold) {
            ctx.save();
            ctx.fillStyle = token.style.color || baseColor || originalFill;
            // Enhanced pseudo-bold: multiple offsets for stronger bold effect
            // Original subtle bold (0.3px offset)
            ctx.fillText(text, x, y + yOffset);
            // Stronger bold with multiple offsets
            ctx.fillText(text, x + 0.5, y + yOffset);
            ctx.fillText(text, x + 1.0, y + yOffset);
            ctx.fillText(text, x, y + yOffset + 0.3);
            ctx.restore();
        } else {
            ctx.fillText(text, x, y + yOffset);
        }

        if (token.style.underline) {
            const textWidth = ctx.measureText(text).width;
            const lineY = y + newFontSize;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, lineY);
            ctx.lineTo(x + textWidth, lineY);
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            this.renderedEffects.add('underline');
        }

        if (token.style.strikethrough) {
            const textWidth = ctx.measureText(text).width;
            const lineY = y + newFontSize / 2;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, lineY);
            ctx.lineTo(x + textWidth, lineY);
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            this.renderedEffects.add('strikethrough');
        }
        ctx.font = originalFont;
        ctx.fillStyle = originalFill;
    }

    /**
     * Checks if a font family has a native bold weight available in the DOM.
     * @private
     * @param {string} fontFamily - The font family to check.
     * @returns {boolean} True if a native bold weight is likely available.
     */
    _isFontBoldable(fontFamily) {
        // This is a simplified check. A more robust solution might involve the Font Loading API.
        const boldCheck = document.createElement('span');
        boldCheck.style.fontFamily = fontFamily;
        boldCheck.style.fontWeight = 'normal';
        boldCheck.textContent = 'test';
        document.body.appendChild(boldCheck);
        const normalWidth = boldCheck.offsetWidth;
        boldCheck.style.fontWeight = 'bold';
        const boldWidth = boldCheck.offsetWidth;
        document.body.removeChild(boldCheck);
        return boldWidth > normalWidth;
    }

    /**
     * Resolves a highlight color name to a drawable color value, checking CSS variables first.
     * @private
     * @param {string} colorName - The name of the color (e.g., "yellow").
     * @returns {string} A CSS color string.
     */
    _getHighlightColor(colorName) {
        const cssVarName = `--highlight-${colorName.toLowerCase()}`;
        if (this.app.cssVars[cssVarName]) {
            return this.app.cssVars[cssVarName];
        }
        const predefined = {
            yellow: 'rgba(255, 255, 0, 0.5)',
            green: 'rgba(0, 255, 0, 0.5)',
            blue: 'rgba(0, 0, 255, 0.5)',
            red: 'rgba(255, 0, 0, 0.5)',
            pink: 'rgba(255, 192, 203, 0.5)',
            purple: 'rgba(128, 0, 128, 0.5)',
            orange: 'rgba(255, 165, 0, 0.5)',
        };
        return predefined[colorName.toLowerCase()] || this.app.cssVars['--highlight-color'] || predefined.yellow;
    }

    /**
     * Asynchronously loads an image and caches it.
     * @param {string} src - The source URL of the image.
     * @returns {Promise<HTMLImageElement|null>} A promise that resolves with the loaded image or null if loading fails.
     */
    async loadImage(src) {
        if (!src) return null;
        const effect = this.effects.icon;
        if (effect && typeof effect.loadImage === 'function') {
            return effect.loadImage(src);
        }
        return null;
    }
}
