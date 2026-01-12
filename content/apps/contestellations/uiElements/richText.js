// Import ALL effect drawing functions from the single effects.js file
import * as EffectDrawers from './effects.js';

/**
 * Handles all canvas drawing operations and text rendering.
 * Decouples drawing logic from UI components.
 */
export class DrawingService {
    constructor(imageManager, cssVars, lineSpacingFactor, contestTitleLineSpacingFactor) {
        this.imageManager = imageManager;
        this.cssVars = cssVars;
        this.lineSpacingFactor = lineSpacingFactor;
        this.contestTitleLineSpacingFactor = contestTitleLineSpacingFactor;
        this.textMeasurer = new TextCanvasMeasurer();
        // Initialize a default constellation color, expecting it to be updated by the caller
        this.constellationColor = '#FFFF00'; // Default to yellow
    }

    /**
     * Sets the constellation color. This method should be called externally
     * after fetching announcement data to update the color.
     * @param {string} color - The new color string (e.g., '#RRGGBB', 'red', 'rgba(...)').
     */
    setConstellationColor(color) {
        if (typeof color === 'string' && color.trim() !== '') {
            this.constellationColor = color;
        } else {
            console.warn(`Attempted to set invalid constellation color: ${color}. Keeping previous color.`);
        }
    }

    /**
     * Helper to convert various CSS color formats (hex, named, rgb, hsl) to RGB components.
     * This is robustly handled by leveraging a temporary canvas context.
     * @param {string} colorString - The color string to convert.
     * @returns {{r: number, g: number, b: number}} An object with r, g, b components.
     */
    _hexToRgb = (colorString) => {
        if (typeof colorString !== 'string') {
            console.warn(`Invalid color format or non-string input passed to _hexToRgb: ${colorString}. Returning default white.`);
            return { r: 255, g: 255, b: 255 }; // Default to white RGB components
        }

        // Try parsing as hex first for performance and directness
        if (colorString.startsWith('#')) {
            let hex = colorString;
            // Handle shorthand hex (e.g., #F00)
            if (hex.length === 4) {
                hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
            }
            if (hex.length === 7) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                // Validate that parsing resulted in numbers
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                    return { r, g, b };
                }
            }
        }

        // For non-hex or invalid hex, leverage a temporary canvas context to parse any valid CSS color string
        // This method is robust for named colors, rgb(), rgba(), hsl() etc.
        try {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.fillStyle = colorString; // Assign the color string
            // Drawing a tiny rectangle ensures the color is internally processed by the canvas,
            // allowing us to read its rgba values.
            tempCtx.fillRect(0, 0, 1, 1);
            const pixelData = tempCtx.getImageData(0, 0, 1, 1).data;
            if (pixelData && pixelData.length >= 3) {
                return { r: pixelData[0], g: pixelData[1], b: pixelData[2] };
            }
        } catch (e) {
            // If parsing fails for a valid CSS string (e.g., security restrictions on cross-origin pixel reading,
            // though should not happen for simple color strings)
            console.warn(`Failed to parse color string "${colorString}" using temporary canvas. Error: ${e.message}`);
        }

        // Fallback to white if all parsing methods fail
        return { r: 255, g: 255, b: 255 };
    };

    /**
     * Easing function for smooth animations.
     * @param {number} t - Current time (normalized, typically 0 to 1).
     * @returns {number} Eased value.
     */
    _easeInOut = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    /**
     * Low-level text drawing function. Used for general text not requiring complex inline formatting.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} text - The text to draw.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {string} font - The font string (e.g., '14px Arial').
     * @param {string} color - The fill color.
     * @param {string} [textAlign='left'] - Text alignment.
     * @param {string} [textBaseline='alphabetic'] - Text baseline.
     * @param {number} [maxWidth=Infinity] - Maximum width for text before wrapping (or truncating if options.truncate is true).
     * @param {number} [lineSpacingFactorToUse=this.lineSpacingFactor] - Line spacing multiplier.
     * @param {object} [options={}] - Additional options (e.g., {truncate: true}, {noDefaultShadow: true}).
     * @returns {number} The total height of the drawn text.
     */
    _drawTextOnCanvas = (ctx, text, x, y, font, color, textAlign = 'left', textBaseline = 'alphabetic', maxWidth = Infinity, lineSpacingFactorToUse = this.lineSpacingFactor, options = {}) => {
        // Ensure text is always a string to prevent 'split' or 'measureText' errors on undefined/null.
        const safeText = String(text);

        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;

        // Apply a subtle default shadow if no specific style shadow is set
        if (!options.noDefaultShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'; /* Increased opacity */
            ctx.shadowBlur = 3; /* Slightly more blur */
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
        }

        let textToDraw = safeText;
        if (options.truncate && maxWidth !== Infinity) {
            let width = ctx.measureText(textToDraw).width;
            while (width > maxWidth && textToDraw.length > 0) {
                textToDraw = textToDraw.slice(0, -1);
                width = ctx.measureText(textToDraw + '...').width;
            }
            if (textToDraw.length < safeText.length) { // Compare with original safeText length
                textToDraw += '...';
            }
        }

        const tempMetrics = this.textMeasurer.measureText('M', font);
        const actualLineHeight = (tempMetrics.actualBoundingBoxAscent || 0) + (tempMetrics.actualBoundingBoxDescent || 0);

        let totalHeight = 0;
        let currentY = y;
        if (maxWidth === Infinity || options.truncate) {
            ctx.fillText(textToDraw, x, currentY);
            totalHeight = actualLineHeight * lineSpacingFactorToUse;
        } else {
            const words = textToDraw.split(' ');
            let line = '';
            let firstLine = true;

            for (let n = 0; n < words.length; n++) {
                let testLine = line + (n > 0 ? ' ' : '') + words[n];
                let metrics = ctx.measureText(testLine);
                let testWidth = metrics.width;

                if (testWidth > maxWidth && line.length > 0) {
                    ctx.fillText(line, x, currentY);
                    if (firstLine) totalHeight += actualLineHeight * lineSpacingFactorToUse;
                    currentY += actualLineHeight * lineSpacingFactorToUse;
                    firstLine = false;
                    line = words[n];
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, currentY);
            if (firstLine) totalHeight += actualLineHeight * lineSpacingFactorToUse;
            else totalHeight += actualLineHeight * lineSpacingFactorToUse; // Ensure height for the last line
        }

        ctx.restore();
        return totalHeight; // Return calculated height
    }

    /**
     * Parses raw markdown into structured blocks.
     * Supports paragraphs, horizontal rules, checkboxes, images, YouTube embeds, lists, and tables.
     * @param {string} markdownText - The raw markdown string.
     * @returns {Array<object>} An array of structured block objects.
     */
    _parseMarkdownBlocks = (markdownText) => {
        // Ensure markdownText is a string before splitting
        const lines = String(markdownText).split('\n');
        const blocks = [];
        let currentList = null; // To group consecutive list items
        let currentTable = null; // To group table rows

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Checkbox: `- [x] Task` or `- [ ] Task`
            const checkboxMatch = trimmedLine.match(/^- \[(x| )\] (.*)/);
            if (checkboxMatch) {
                if (currentList) currentList = null; // End any active list
                if (currentTable) currentTable = null; // End any active table
                blocks.push({
                    type: 'checkbox',
                    checked: checkboxMatch[1] === 'x',
                    tokens: this._tokenizeInlineText(checkboxMatch[2] || '') // Ensure empty string if no text
                });
                continue;
            }

            // Horizontal Rule: `---`, `***`, `___`
            if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
                if (currentList) currentList = null;
                if (currentTable) currentTable = null;
                blocks.push({
                    type: 'hr'
                });
                continue;
            }

            // Image: `![alt](url){width:W,height:H}` (Block-level image)
            // Regex captures alt, url, and an optional dimensions group (e.g., {width:100,height:50})
            const imageMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)(\{(width:\d+(?:,\d+)?|height:\d+(?:,\d+)?)(?:,(width:\d+(?:,\d+)?|height:\d+(?:,\d+)?))*\})?$/);
            if (imageMatch) {
                if (currentList) currentList = null;
                if (currentTable) currentTable = null;
                const dimensions = {};
                if (imageMatch[3]) { // If dimensions group exists
                    const dimPairs = imageMatch[3].slice(1, -1).split(','); // Remove {} and split by comma
                    dimPairs.forEach(pair => {
                        const [key, value] = pair.split(':');
                        dimensions[key.trim()] = parseInt(value.trim());
                    });
                }
                blocks.push({
                    type: 'image',
                    url: imageMatch[2],
                    alt: imageMatch[1],
                    width: dimensions.width,
                    height: dimensions.height
                });
                continue;
            }

            // YouTube Embed: `@youtube[](id){width:W,height:H}` (Block-level embed)
            // Regex captures id and optional dimensions
            const youtubeMatch = trimmedLine.match(/^@\[youtube\]\((.*?)\)(\{(width:\d+(?:,\d+)?|height:\d+(?:,\d+)?)(?:,(width:\d+(?:,\d+)?|height:\d+(?:,\d+)?))*\})?$/);
            if (youtubeMatch) {
                if (currentList) currentList = null;
                if (currentTable) currentTable = null;
                const dimensions = {};
                if (youtubeMatch[2]) { // If dimensions group exists
                    const dimPairs = youtubeMatch[2].slice(1, -1).split(',');
                    dimPairs.forEach(pair => {
                        const [key, value] = pair.split(':');
                        dimensions[key.trim()] = parseInt(value.trim());
                    });
                }
                blocks.push({
                    type: 'embed',
                    service: 'youtube',
                    id: youtubeMatch[1],
                    width: dimensions.width,
                    height: dimensions.height
                });
                continue;
            }

            // Table Header / Row: `| Header | ...` or `| Cell | ...`
            const tableMatch = trimmedLine.match(/^\|(.+)\|$/);
            if (tableMatch) {
                const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
                const isSeparator = nextLine.match(/^\|:?-+:?(\|:?-+:?)*\|$/);

                if (!currentTable) {
                    if (isSeparator) {
                        currentTable = {
                            type: 'table',
                            headers: tableMatch[1].split('|').map(h => this._tokenizeInlineText(h.trim())),
                            rows: []
                        };
                        blocks.push(currentTable);
                        i++; // Skip the separator line
                    } else {
                        // Treat as paragraph if not a new table header
                        if (trimmedLine.length > 0) {
                            if (currentList) currentList = null;
                            blocks.push({
                                type: 'paragraph',
                                tokens: this._tokenizeInlineText(trimmedLine)
                            });
                        }
                    }
                } else {
                    currentTable.rows.push(tableMatch[1].split('|').map(c => this._tokenizeInlineText(c.trim())));
                }
                continue;
            } else if (currentTable) {
                currentTable = null; // End table if non-table line encountered
            }

            // List Item (unordered or ordered)
            const unorderedListMatch = trimmedLine.match(/^(-|\*)\s+(.*)/);
            const orderedListMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);

            if (unorderedListMatch || orderedListMatch) {
                if (currentTable) currentTable = null; // End any active table

                const itemText = unorderedListMatch ? unorderedListMatch[2] : orderedListMatch[2];
                const isOrdered = !!orderedListMatch;

                if (!currentList || currentList.ordered !== isOrdered) {
                    // Start new list or switch list type
                    currentList = {
                        type: 'list',
                        ordered: isOrdered,
                        items: []
                    };
                    blocks.push(currentList);
                }
                currentList.items.push({
                    level: 0, // Simplified: not supporting nested lists for now
                    tokens: this._tokenizeInlineText(itemText || '') // Ensure empty string if no text
                });
                continue;
            } else if (currentList) {
                currentList = null; // End list if non-list line encountered
            }

            // Paragraph (if non-empty line and not caught by other block types)
            if (trimmedLine.length > 0) {
                if (currentList) currentList = null;
                if (currentTable) currentTable = null;
                blocks.push({
                    type: 'paragraph',
                    tokens: this._tokenizeInlineText(trimmedLine)
                });
            } else {
                // Empty line for spacing
                if (blocks.length > 0 && blocks[blocks.length - 1].type === 'paragraph' && blocks[blocks.length - 1].tokens.length > 0) {
                    blocks.push({
                        type: 'paragraph',
                        tokens: []
                    }); // Add an empty paragraph for visual line break
                }
            }
        }
        return blocks;
    }

    /**
     * Escapes markdown-like special characters with temporary placeholders.
     * This prevents the regex from misinterpreting literal characters as syntax.
     * @param {string} text - The input text.
     * @returns {string} The text with special characters escaped.
     */
    _escapeSpecialChars = (text) => {
        // Define characters that could be misinterpreted as markdown syntax
        const specialChars = ['*', '_', '~', '^', '[', ']', '(', ')', '{', '}', '!', '@', '$', '\\'];
        let escapedText = text;
        specialChars.forEach((char, index) => {
            // Replace `\` + char with a unique placeholder
            const escapedPattern = new RegExp(`\\\\${char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g');
            escapedText = escapedText.replace(escapedPattern, `__ESCAPED_CHAR_${index}__`);
        });
        return escapedText;
    }

    /**
     * Unescapes temporary placeholders back to their original special characters.
     * @param {string} text - The input text with placeholders.
     * @returns {string} The text with special characters restored.
     */
    _unescapeSpecialChars = (text) => {
        const specialChars = ['*', '_', '~', '^', '[', ']', '(', ')', '{', '}', '!', '@', '$', '\\'];
        let unescapedText = text;
        specialChars.forEach((char, index) => {
            const placeholder = `__ESCAPED_CHAR_${index}__`;
            unescapedText = unescapedText.split(placeholder).join(char);
        });
        return unescapedText;
    }

    /**
     * Tokenizes inline text, identifying various formatting styles and custom effects.
     * @param {string} text - The raw text string to tokenize.
     * @returns {Array<object>} An array of token objects, each with text and style properties.
     */
    _tokenizeInlineText = (text) => {
        const safeText = String(text);
        const tokens = [];

        // Step 1: Escape special characters before applying markdown regex
        const preprocessedText = this._escapeSpecialChars(safeText);

        // Combined regex for all inline elements. Order matters for matching greedily.
        // The regex now operates on the preprocessedText.
        const regex = /(?<image>!\[[^\]]*?\]\([^)]+?\)(\{(?:width|height):\d+(?:,\d+)?|height:\d+(?:,\d+)?\})?)|(?<link>\[[^\]]*?\]\([^)]+?\))|(?<youtube>@\[youtube\]\(([^)]+?)\)(\{(?:width|height):\d+(?:,\d+)?|height:\d+(?:,\d+)?})?)|(?<prize>\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<bold>\*\*([^*]+?)\*\*)|(?<italic>\*([^*]+?)\*)|(?<underline>__([^_]+?)__)|(?<strike>~~([^~]+?)~~)|(?<sup>\^([^^]+?)\^)|(?<sub>~([^~]+?)~)|(?<customEffect>\{[a-zA-Z0-9_]+:[^}]+?\})/g;


        let lastIndex = 0;
        let match;
        while ((match = regex.exec(preprocessedText)) !== null) {
            if (match.index > lastIndex) {
                // Push plain text before the match, then unescape it
                this._splitAndAddPlainTextTokens(this._unescapeSpecialChars(preprocessedText.substring(lastIndex, match.index)), tokens);
            }

            const groups = match.groups;
            let token = {
                text: '',
                style: {}
            };

            // Process different markdown token types
            if (groups.bold) {
                token.text = this._unescapeSpecialChars(groups.bold.slice(2, -2));
                token.style.bold = true;
            } else if (groups.italic) {
                token.text = this._unescapeSpecialChars(groups.italic.slice(1, -1));
                token.style.italic = true;
            } else if (groups.underline) {
                token.text = this._unescapeSpecialChars(groups.underline.slice(2, -2));
                token.style.underline = true;
            } else if (groups.strike) {
                token.text = this._unescapeSpecialChars(groups.strike.slice(2, -2));
                token.style.strikethrough = true;
            } else if (groups.sup) {
                token.text = this._unescapeSpecialChars(groups.sup.slice(1, -1));
                token.style.script = 'super';
            } else if (groups.sub) {
                token.text = this._unescapeSpecialChars(groups.sub.slice(1, -1));
                token.style.script = 'sub';
            } else if (groups.prize) {
                token.text = this._unescapeSpecialChars(groups.prize);
                token.style.prize = true;
            } else if (groups.image) {
                const imgMatch = groups.image.match(/!\[(.*?)\]\((.*?)\)(\{(?:width|height):\d+(?:,\d+)?\})?/);
                const [, alt, url, dimsStr] = imgMatch;
                token.text = ''; // Inline images don't have text content
                token.style.image = url;
                token.style.alt = this._unescapeSpecialChars(alt); // Unescape alt text
                token.isInlineMedia = true;
                if (dimsStr) {
                    const dimPairs = dimsStr.slice(1, -1).split(',');
                    dimPairs.forEach(pair => {
                        const [key, value] = pair.split(':');
                        token.style[key.trim()] = parseInt(value.trim());
                    });
                }
            } else if (groups.youtube) {
                const ytMatch = groups.youtube.match(/@\[youtube\]\((.*?)\)(\{(?:width|height):\d+(?:,\d+)?\})?/);
                const [, videoId, dimsStr] = ytMatch;
                token.text = '';
                token.style.youtube = videoId;
                token.isInlineMedia = true;
                if (dimsStr) {
                    const dimPairs = dimsStr.slice(1, -1).split(',');
                    dimPairs.forEach(pair => {
                        const [key, value] = pair.split(':');
                        token.style[key.trim()] = parseInt(value.trim());
                    });
                }
            } else if (groups.link) {
                const [, textContent, url] = groups.link.match(/\[(.*?)\]\((.*?)\)/);
                token.text = this._unescapeSpecialChars(textContent); // Unescape link text
                token.style.link = true;
                token.style.url = url;
            }
            // Generic custom effects: {effectName:params|text} or {effectName:text}
            else if (groups.customEffect) {
                const effectContent = groups.customEffect.slice(1, -1);
                const [effectName, rawParamsAndText] = effectContent.split(':', 2);

                let params = null;
                let textPart = rawParamsAndText;

                if (rawParamsAndText && rawParamsAndText.includes('|')) {
                    const parts = rawParamsAndText.split('|');
                    params = parts[0];
                    textPart = parts.slice(1).join('|');
                } else if (rawParamsAndText && rawParamsAndText.startsWith('{') && rawParamsAndText.endsWith('}')) {
                    try {
                        params = JSON.parse(rawParamsAndText);
                        textPart = "";
                    } catch (e) {
                        textPart = rawParamsAndText;
                    }
                } else {
                    textPart = rawParamsAndText;
                }

                // Recursively tokenize and unescape the textPart
                token.children = this._tokenizeInlineText(this._unescapeSpecialChars(textPart || ''));
                token.style[effectName] = params !== null ? params : true;
                token.isCustomEffect = true;
                token.text = '';
            }

            tokens.push(token);
            lastIndex = regex.lastIndex;
        }

        // Add any remaining plain text after the last match, then unescape it
        if (lastIndex < preprocessedText.length) {
            this._splitAndAddPlainTextTokens(this._unescapeSpecialChars(preprocessedText.substring(lastIndex)), tokens);
        }
        return tokens;
    }

    /**
     * Helper function to split plain text by newlines and add them as separate tokens.
     * @param {string} text - The plain text string.
     * @param {Array<object>} tokens - The array of tokens to append to.
     */
    _splitAndAddPlainTextTokens = (text, tokens) => {
        // Ensure text is a string before splitting
        const lines = String(text).split('\n');
        lines.forEach((line, index) => {
            if (line.length > 0) {
                tokens.push({
                    text: line,
                    style: {}
                });
            }
            if (index < lines.length - 1) { // Add a newline token if it's not the very last line
                tokens.push({
                    type: 'newline',
                    text: '\n',
                    style: {}
                });
            }
        });
    }

    /**
     * Renders text with inline formatting and special effects on the canvas.
     * This function now handles recursive rendering of nested tokens for custom effects.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {Array<object>} tokens - An array of token objects to render.
     * @param {number} x - The starting x-coordinate.
     * @param {number} y - The starting y-coordinate.
     * @param {string} baseFont - The base font string (e.g., '14px "Rodin", sans-serif').
     * @param {string} baseColor - The base text color.
     * @param {number} maxWidth - The maximum width for text wrapping.
     * @param {number} lineSpacingFactor - Line spacing multiplier.
     * @param {boolean} [measureOnly=false] - If true, only calculates dimensions without drawing.
     * @param {Array<object>} [hyperlinks=[]] - Array to collect hyperlink bounding boxes.
     * @param {number} [currentTime=0] - Current animation time in milliseconds.
     * @param {object} [inheritedStyle={}] - Styles inherited from a parent custom effect.
     * @returns {object} An object containing the calculated width, height, and collected links.
     */
    _renderInlineFormattedText = (ctx, tokens, x, y, baseFont, baseColor, maxWidth, lineSpacingFactor, measureOnly = false, hyperlinks = [], currentTime = 0, inheritedStyle = {}) => {
        ctx.save();
        let currentX = x;
        let currentY = y;
        const baseFontSize = parseInt(baseFont);
        const fontFamily = baseFont.substring(baseFont.indexOf('px') + 3).trim();
        const fontMetrics = this.textMeasurer.measureText("M", baseFont);
        const baseLineHeight = (fontMetrics.actualBoundingBoxAscent || baseFontSize) + (fontMetrics.actualBoundingBoxDescent || 2);
        const lineHeight = baseLineHeight * lineSpacingFactor;

        let maxLineWidth = 0; // Tracks the widest line encountered relative to startX
        let maxYReached = y; // Tracks the lowest Y coordinate reached by any text or element

        ctx.textBaseline = 'top';

        // Helper to compute font and fill style based on token style
        const getComputedStyleAndOffset = (styleToCompute) => {
            let fontStyle = '';
            if (styleToCompute.italic) fontStyle += 'italic ';
            if (styleToCompute.bold) fontStyle += 'bold ';
            let fontSize = baseFontSize;
            let yOffset = 0;
            if (styleToCompute.script) {
                fontSize = Math.floor(baseFontSize * 0.8);
                yOffset = styleToCompute.script === 'super' ? -fontSize * 0.4 : (baseFontSize - fontSize) * 0.7;
            }
            const currentFont = `${fontStyle}${fontSize}px ${fontFamily}`;
            const currentFillStyle = styleToCompute.color || (styleToCompute.link ? this.cssVars['--ds-accent-cyan'] : baseColor);
            return { yOffset, fontSize, font: currentFont, fillStyle: currentFillStyle };
        };

        const allEffectKeys = Object.keys(EffectDrawers);
        // Effects that should render the entire segment at once, not character by character
        const segmentEffects = new Set(['typingEffect', 'marqueeEffect', 'typewriterEffect']);


        for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
            const token = tokens[tokenIndex];
            const currentTokenStyle = { ...inheritedStyle, ...token.style };

            if (token.type === 'newline') {
                maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                currentX = x;
                currentY += lineHeight;
                maxYReached = Math.max(maxYReached, currentY);
                continue;
            }

            // Handle Inline Media (Image or YouTube embed)
            if (token.isInlineMedia) {
                const mediaUrl = currentTokenStyle.image || (currentTokenStyle.youtube ? `https://img.youtube.com/vi/${currentTokenStyle.youtube}/0.jpg` : null);
                const img = this.imageManager.getImage(mediaUrl);

                let drawWidth = currentTokenStyle.width || 0;
                let drawHeight = currentTokenStyle.height || 0;

                if (img && img.complete) {
                    const aspectRatio = img.height / img.width;
                    if (drawWidth === 0 && drawHeight === 0) {
                        drawWidth = Math.min(img.width, maxWidth - (currentX - x));
                        drawHeight = drawWidth * aspectRatio;
                    } else if (drawWidth === 0) {
                        drawWidth = drawHeight / aspectRatio;
                    } else if (drawHeight === 0) {
                        drawHeight = drawWidth * aspectRatio;
                    }
                } else {
                    drawWidth = currentTokenStyle.width || (baseFontSize * 2);
                    drawHeight = currentTokenStyle.height || (drawWidth * 0.75);
                }

                if (currentX + drawWidth > x + maxWidth && currentX !== x) {
                    maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                    currentX = x;
                    currentY += lineHeight;
                    maxYReached = Math.max(maxYReached, currentY);
                }

                if (drawWidth > maxWidth) {
                    drawWidth = maxWidth;
                    drawHeight = drawWidth * (img ? img.height / img.width : 0.75);
                }

                if (!measureOnly) {
                    if (img && img.complete) {
                        ctx.drawImage(img, currentX, currentY, drawWidth, drawHeight);
                        if (currentTokenStyle.youtube) {
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
                            hyperlinks.push({ rect: { x: currentX, y: currentY, width: drawWidth, height: drawHeight }, url: `youtube:${currentTokenStyle.youtube}`, type: 'youtube-embed' });
                        } else if (currentTokenStyle.image) {
                            hyperlinks.push({ rect: { x: currentX, y: currentY, width: drawWidth, height: drawHeight }, url: currentTokenStyle.image, type: 'image' });
                        }
                    } else {
                        ctx.fillStyle = 'rgba(255,255,255,0.1)';
                        ctx.fillRect(currentX, currentY, drawWidth, drawHeight);
                        this._drawTextOnCanvas(ctx, 'Loading...', currentX + drawWidth / 2, currentY + drawHeight / 2, '10px "Rodin", sans-serif', 'rgba(255,255,255,0.5)', 'center', 'middle', Infinity, 1, { noDefaultShadow: true });
                    }
                }
                currentX += drawWidth;
                maxYReached = Math.max(maxYReached, currentY + drawHeight);
                maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                continue;
            }

            // Handle Custom Effect Container Tokens (recursive call)
            if (token.isCustomEffect && Array.isArray(token.children) && token.children.length > 0) {
                const effectKey = Object.keys(token.style).find(key => {
                    const nonEffectKeys = ['bold', 'italic', 'underline', 'strikethrough', 'script', 'prize', 'link', 'url', 'image', 'youtube', 'alt', 'width', 'height', 'color', 'noDefaultShadow'];
                    return !nonEffectKeys.includes(key);
                });

                const inheritedEffectStyle = { ...currentTokenStyle };
                if (effectKey) {
                    inheritedEffectStyle[effectKey] = token.style[effectKey];
                    if (typeof token.style[effectKey] === 'string' && (token.style[effectKey].startsWith('#') || token.style[effectKey].startsWith('rgb') || token.style[effectKey].startsWith('hsl'))) {
                        inheritedEffectStyle.color = token.style[effectKey];
                    }
                }

                const { width: childrenWidth, height: childrenHeight } = this._renderInlineFormattedText(
                    ctx,
                    token.children,
                    currentX,
                    currentY,
                    baseFont,
                    baseColor,
                    maxWidth - (currentX - x),
                    lineSpacingFactor,
                    measureOnly,
                    hyperlinks,
                    currentTime,
                    inheritedEffectStyle
                );

                currentX += childrenWidth;
                maxYReached = Math.max(maxYReached, currentY + childrenHeight);
                maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                continue;
            }

            const safeTextToDraw = String(token.text);
            const { yOffset, font: computedFont, fillStyle: computedFillStyle } = getComputedStyleAndOffset(currentTokenStyle);

            ctx.font = computedFont;
            ctx.fillStyle = computedFillStyle;

            // Determine if this token itself has a custom effect (e.g., {sparkle:text})
            const activeCustomEffectKey = allEffectKeys.find(key => currentTokenStyle[key] && !['bold', 'italic', 'underline', 'strikethrough', 'script', 'prize', 'link', 'url', 'image', 'youtube', 'alt', 'width', 'height', 'color', 'noDefaultShadow'].includes(key));

            // Special handling for effects that need the entire text segment at once
            if (activeCustomEffectKey && segmentEffects.has(activeCustomEffectKey)) {
                const effectDrawerFunction = EffectDrawers[`draw${activeCustomEffectKey.charAt(0).toUpperCase() + activeCustomEffectKey.slice(1)}Effect`];
                if (effectDrawerFunction) {
                    // Measure the full segment width for these effects
                    const segmentMeasuredWidth = ctx.measureText(safeTextToDraw).width;
                    // Check for line wrap for the entire segment
                    if (currentX + segmentMeasuredWidth > x + maxWidth && currentX !== x) {
                        maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                        currentX = x;
                        currentY += lineHeight;
                        maxYReached = Math.max(maxYReached, currentY);
                    }

                    if (!measureOnly) {
                        // Pass the entire text segment and its measured width
                        effectDrawerFunction(ctx, safeTextToDraw, currentX, currentY + yOffset, computedFont, currentTokenStyle, currentTime, baseFontSize, segmentMeasuredWidth, lineHeight, this._hexToRgb);
                    }
                    currentX += segmentMeasuredWidth; // Advance X by the full segment width
                    maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                    maxYReached = Math.max(maxYReached, currentY + lineHeight);
                    continue; // Move to the next token, as this segment is fully handled
                }
            }


            // Fallback for plain text, standard styles, or character-by-character custom effects
            if (!currentTokenStyle.noDefaultShadow && !activeCustomEffectKey) { // Apply default shadow only if no custom effect for this char
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            // Iterate through each character for precise wrapping and drawing
            for (let i = 0; i < safeTextToDraw.length; i++) {
                const char = safeTextToDraw[i];
                const charWidth = ctx.measureText(char).width;

                // Word wrapping logic:
                // If the current character is a space, and the next *word* cannot fit on the current line,
                // then start a new line. This prevents splitting words.
                if (char === ' ' && i + 1 < safeTextToDraw.length) {
                    let nextWord = '';
                    let k = i + 1;
                    while (k < safeTextToDraw.length && safeTextToDraw[k] !== ' ') {
                        nextWord += safeTextToDraw[k];
                        k++;
                    }
                    const nextWordWidth = ctx.measureText(nextWord).width;
                    if (currentX + charWidth + nextWordWidth > x + maxWidth && (currentX - x) > 0) {
                        // Only force a wrap if there's content already on this line
                        maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                        currentX = x; // Reset X to the absolute left
                        currentY += lineHeight;
                        maxYReached = Math.max(maxYReached, currentY);
                    }
                } else if (currentX + charWidth > x + maxWidth && (currentX - x) > 0) {
                    // If a non-space character (or a very long word part) exceeds the line, force a wrap
                    maxLineWidth = Math.max(maxLineWidth, (currentX - x));
                    currentX = x; // Reset X to the absolute left
                    currentY += lineHeight;
                    maxYReached = Math.max(maxYReached, currentY);
                }


                if (!measureOnly) {
                    if (activeCustomEffectKey) {
                        const effectDrawerFunction = EffectDrawers[`draw${activeCustomEffectKey.charAt(0).toUpperCase() + activeCustomEffectKey.slice(1)}Effect`];
                        if (effectDrawerFunction) {
                            // Pass single character and its intended position to effect drawer
                            effectDrawerFunction(ctx, char, currentX, currentY + yOffset, computedFont, currentTokenStyle, currentTime, baseFontSize, charWidth, lineHeight, this._hexToRgb);
                        } else {
                            // Fallback if effect function not found
                            ctx.fillText(char, currentX, currentY + yOffset);
                        }
                    } else {
                        // Regular text drawing
                        ctx.fillText(char, currentX, currentY + yOffset);

                        // Underlines/strikethroughs for regular text (per character)
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.fillStyle = currentTokenStyle.color || (currentTokenStyle.link ? this.cssVars['--ds-accent-cyan'] : baseColor);

                        const textY = currentY + yOffset;
                        if (currentTokenStyle.underline || currentTokenStyle.strikethrough || currentTokenStyle.link) {
                            if (currentTokenStyle.underline || currentTokenStyle.link) {
                                ctx.fillRect(currentX, textY + baseFontSize * 1.1, charWidth, 1);
                            }
                            if (currentTokenStyle.strikethrough) {
                                ctx.fillRect(currentX, textY + baseFontSize * 0.6, charWidth, 1);
                            }
                            if (currentTokenStyle.link) {
                                // For simplicity and avoiding massive hyperlink arrays, this might need refinement
                                // to coalesce character rects into word/token rects. For now, it will be character based.
                                hyperlinks.push({ rect: { x: currentX, y: currentY, width: charWidth, height: lineHeight }, url: currentTokenStyle.url, type: 'link' });
                            }
                        }
                    }
                }
                currentX += charWidth; // Always advance X by the character's width
                maxLineWidth = Math.max(maxLineWidth, (currentX - x)); // Update max line width
                maxYReached = Math.max(maxYReached, currentY + lineHeight); // Update max Y reached
            }
        }

        // Final check for height if no content was drawn but tokens existed (e.g., empty string after processing)
        if (tokens.length > 0 && maxYReached === y && maxLineWidth > 0) {
            maxYReached = y + lineHeight;
        }

        ctx.restore();
        return {
            width: maxLineWidth,
            height: maxYReached - y,
            links: hyperlinks
        };
    }


    /**
     * Helper function to draw a star shape.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} cx - Center x-coordinate.
     * @param {number} cy - Center y-coordinate.
     * @param {number} spikes - Number of points on the star.
     * @param {number} outerRadius - Outer radius of the star.
     * @param {number} innerRadius - Inner radius of the star.
     */
    _drawStarPolygon = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.closePath();
    }

    /**
     * Draws an unread sparkle animation.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} x - X-coordinate of the sparkle center.
     * @param {number} y - Y-coordinate of the sparkle center.
     * @param {number} time - Current animation time.
     * @param {string} color - Color of the sparkle.
     * @param {object} [options={}] - Options like size, z-index, fov.
     */
    _drawUnreadSparkle = (ctx, x, y, time, color = this.constellationColor, options = {}) => {
        const {
            size = 1.0,
            z = 0,
            fov = 200
        } = options;
        ctx.save();

        // Enhanced: Faster rotation and more prominent pulse for better visibility
        const rotation = (time / 2000) % (Math.PI * 2);
        const baseScale = 0.7 + Math.sin(time / 500) * 0.3;
        const finalScale = baseScale * size;

        const fovScale = fov / (fov + z);

        ctx.translate(x, y);
        ctx.scale(finalScale * fovScale, finalScale * fovScale);
        ctx.rotate(rotation);

        ctx.shadowColor = color;
        ctx.shadowBlur = 5 * size;

        ctx.fillStyle = color;
        const outerRadius = 5;
        const innerRadius = outerRadius / 2.5;
        this._drawStarPolygon(ctx, 0, 0, 5, outerRadius, innerRadius);
        ctx.fill();

        // Add small dots/flares for the "sparkle" effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6 + (time / 800);
            const flareSize = 0.8 + Math.random() * 0.7;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * (outerRadius + 3), Math.sin(angle) * (outerRadius + 3), flareSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draws an unopened sparkle animation based on a 4-pointed star,
     * intended for "unread" indicators or similar.
     * This function is now a general utility for a specific star animation,
     * not directly tied to the inline text `sparkle` effect.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} x - X-coordinate of the star center.
     * @param {number} y - Y-coordinate of the star center.
     * @param {number} time - Current animation time.
     * @param {string} [color=this.constellationColor] - Color of the star. Defaults to constellationColor.
     */
    _drawUnopenedStar = (ctx, x, y, time, color = this.constellationColor) => {
        ctx.save();
        ctx.translate(x, y);

        const sparkleSize = 12;
        const outerRadius = sparkleSize * 0.5;
        const innerRadius = sparkleSize * 0.15;

        const pulsatingScale = 1 + Math.sin(time * 0.005) * 0.05;
        ctx.scale(pulsatingScale, pulsatingScale);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
        const parsedColor = this._hexToRgb(color);
        const lightColor = `rgba(${parsedColor.r + 50}, ${parsedColor.g + 50}, ${parsedColor.b + 50}, 0.9)`;
        const midColor = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, 1)`;
        const darkColor = `rgba(${parsedColor.r - 50}, ${parsedColor.g - 50}, ${parsedColor.b - 50}, 0.8)`;

        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.3, midColor);
        gradient.addColorStop(0.7, midColor);
        gradient.addColorStop(1, darkColor);
        ctx.fillStyle = gradient;

        ctx.shadowColor = color;
        ctx.shadowBlur = sparkleSize * 0.8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        ctx.lineTo(innerRadius, -innerRadius);
        ctx.lineTo(outerRadius, 0);
        ctx.lineTo(innerRadius, innerRadius);
        ctx.lineTo(0, outerRadius);
        ctx.lineTo(-innerRadius, innerRadius);
        ctx.lineTo(-outerRadius, 0);
        ctx.lineTo(-innerRadius, -innerRadius);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.restore();
    }


    /**
     * Draws a constellation star shape.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} x - X-coordinate of the star center.
     * @param {number} y - Y-coordinate of the star center.
     * @param {number} scale - Scale factor for the star.
     * @param {string} shape - Shape of the star ('triangle', 'square', 'star', 'cross').
     * @param {string} [color=this.constellationColor] - Color of the star. Defaults to constellationColor.
     * @param {number} time - Current animation time.
     */
    _drawConstellationStar = (ctx, x, y, scale, shape, color = this.constellationColor, time) => {
        ctx.save();
        ctx.translate(x, y);
        const pulse = 0.9 + Math.sin(time / 300 + x) * 0.1;
        ctx.scale(scale * pulse, scale * pulse);
        ctx.rotate(time / 2000);

        ctx.shadowColor = color;
        ctx.shadowBlur = 6 * scale;
        ctx.fillStyle = color;

        ctx.beginPath();
        switch (shape) {
            case 'triangle':
                ctx.moveTo(0, -6);
                ctx.lineTo(6, 6);
                ctx.lineTo(-6, 6);
                ctx.closePath();
                break;
            case 'square':
                ctx.rect(-5, -5, 10, 10);
                break;
            case 'star':
                this._drawStarPolygon(ctx, 0, 0, 5, 6, 3);
                break;
            case 'cross':
            default:
                ctx.roundRect(-6, -2, 12, 4, 2);
                ctx.roundRect(-2, -6, 4, 12, 2);
                break;
        }
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws a community rating (stars).
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} rating - The current rating (e.g., 3.5).
     * @param {number} x - X-coordinate to start drawing.
     * @param {number} y - Y-coordinate to start drawing.
     * @param {number} starSize - Font size for the stars.
     * @param {number} maxStars - Maximum number of stars to display.
     */
    _drawCommunityRating = (ctx, rating, x, y, starSize, maxStars) => {
        ctx.save();
        ctx.font = `bold ${starSize}px "Rodin", sans-serif`;
        ctx.textBaseline = 'middle';
        for (let i = 0; i < maxStars; i++) {
            const starX = x + i * (starSize + 2);
            ctx.fillStyle = i < rating ? this.cssVars['--ds-accent-yellow'] : 'rgba(255, 255, 255, 0.3)';
            ctx.fillText('â˜…', starX, y);
        }
        ctx.restore();
    }

    /**
     * Measures the height of a single parsed block.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {object} block - The block object (paragraph, hr, checkbox, etc.).
     * @param {number} maxWidth - Maximum width for block content.
     * @param {number} currentTime - Current animation time in milliseconds.
     * @returns {number} The calculated height of the block.
     */
    _measureBlockHeight = (ctx, block, maxWidth, currentTime = 0) => {
        const baseFont = '14px "Rodin", sans-serif';
        const baseColor = this.cssVars['--ds-text'];
        const lineSpacingFactor = this.lineSpacingFactor;

        switch (block.type) {
            case 'paragraph':
                {
                    if (block.tokens.length === 0) return 14 * lineSpacingFactor;
                    return this._renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, baseColor, maxWidth, lineSpacingFactor, true, [], currentTime).height;
                }
            case 'hr':
                return 10;
            case 'checkbox':
                {
                    const textHeight = this._renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, baseColor, maxWidth - 22, lineSpacingFactor, true, [], currentTime).height;
                    return Math.max(20, textHeight);
                }
            case 'image':
                {
                    const img = this.imageManager.getImage(block.url);
                    let imgWidth = block.width || 0;
                    let imgHeight = block.height || 0;

                    if (img && img.complete) {
                        const aspectRatio = img.height / img.width;
                        if (imgWidth === 0 && imgHeight === 0) {
                            imgWidth = maxWidth;
                            imgHeight = maxWidth * aspectRatio;
                        } else if (imgWidth === 0) {
                            imgWidth = imgHeight / aspectRatio;
                        } else if (imgHeight === 0) {
                            imgHeight = imgWidth * aspectRatio;
                        }
                        if (imgWidth > maxWidth) {
                            imgWidth = maxWidth;
                            imgHeight = imgWidth * aspectRatio;
                        }
                        return imgHeight;
                    }
                    return imgHeight || (imgWidth * 0.75) || 50; // Default placeholder height
                }
            case 'embed':
                {
                    let embedWidth = block.width || 0;
                    let embedHeight = block.height || 0;

                    if (embedWidth === 0 && embedHeight === 0) {
                        embedWidth = maxWidth;
                        embedHeight = maxWidth * 9 / 16;
                    } else if (embedWidth === 0) {
                        embedWidth = embedHeight * 16 / 9;
                    } else if (embedHeight === 0) {
                        embedHeight = embedWidth * 9 / 16;
                    }
                    if (embedWidth > maxWidth) {
                        embedWidth = maxWidth;
                        embedHeight = embedWidth * 9 / 16;
                    }
                    return embedHeight;
                }
            case 'list':
                {
                    let totalListHeight = 0;
                    block.items.forEach(item => {
                        const itemXOffset = (item.level * 20) + (item.ordered ? 20 : 15);
                        const itemMaxWidth = maxWidth - itemXOffset;
                        totalListHeight += this._renderInlineFormattedText(ctx, item.tokens, 0, 0, baseFont, baseColor, itemMaxWidth, lineSpacingFactor, true, [], currentTime).height;
                    });
                    return totalListHeight;
                }
            case 'table':
                {
                    let totalTableHeight = 0;
                    const columnContent = Array(block.headers.length).fill(null).map(() => []);

                    block.headers.forEach((headerTokens, colIndex) => {
                        columnContent[colIndex].push(headerTokens);
                    });
                    block.rows.forEach(row => {
                        row.forEach((cellTokens, colIndex) => {
                            if (columnContent[colIndex]) {
                                columnContent[colIndex].push(cellTokens);
                            }
                        });
                    });

                    const numCols = block.headers.length;
                    const borderWidth = 1;
                    const cellContentHorizontalPadding = 5;

                    const measuredColContentWidths = columnContent.map(colItems => {
                        let maxContentWidthInColumn = 0;
                        const tempMeasuringCtx = this.textMeasurer._ctx;

                        colItems.forEach(tokens => {
                            const { width: measuredTokenWidth } = this._renderInlineFormattedText(tempMeasuringCtx, tokens, 0, 0, baseFont, baseColor, Infinity, lineSpacingFactor, true, [], currentTime);
                            maxContentWidthInColumn = Math.max(maxContentWidthInColumn, measuredTokenWidth);
                        });
                        return maxContentWidthInColumn;
                    });

                    let totalMeasuredContentWidthSum = measuredColContentWidths.reduce((sum, w) => sum + w, 0);

                    const totalHorizontalOverhead = (numCols + 1) * borderWidth + numCols * (2 * cellContentHorizontalPadding);
                    const availableContentSpaceForSum = maxWidth - totalHorizontalOverhead;

                    let finalColContentWidths = [];
                    if (totalMeasuredContentWidthSum < availableContentSpaceForSum) {
                        const remainingSpace = availableContentSpaceForSum - totalMeasuredContentWidthSum;
                        const extraPerColumn = remainingSpace / numCols;
                        finalColContentWidths = measuredColContentWidths.map(w => w + extraPerColumn);
                    } else {
                        const scaleFactor = availableContentSpaceForSum / totalMeasuredContentWidthSum;
                        finalColContentWidths = measuredColContentWidths.map(w => w * scaleFactor);
                    }

                    let currentColDrawingWidths = finalColContentWidths.map(w => w + (2 * cellContentHorizontalPadding));

                    let maxHeaderHeight = 0;
                    // The `currentXOffset` was undefined, initialize it for internal loop only
                    let currentXOffsetInternal = 0;
                    const headerHeights = []; // Initialize headerHeights here
                    for (let i = 0; i < block.headers.length; i++) {
                        const headerContentWidth = currentColDrawingWidths[i] - (2 * cellContentHorizontalPadding);
                        const { height } = this._renderInlineFormattedText(ctx, block.headers[i], currentXOffsetInternal + cellContentHorizontalPadding, 0, `bold ${baseFont}`, baseColor, headerContentWidth, lineSpacingFactor, true, [], currentTime);
                        headerHeights.push(height);
                        maxHeaderHeight = Math.max(maxHeaderHeight, height);
                        currentXOffsetInternal += currentColDrawingWidths[i] + borderWidth; // Advance offset for next column
                    }
                    totalTableHeight += maxHeaderHeight + (2 * cellContentHorizontalPadding) + borderWidth;

                    // Measure content rows height
                    block.rows.forEach(row => {
                        let maxRowHeight = 0;
                        const rowCellHeights = []; // Store actual measured heights for vertical centering
                        // First pass to measure max height for the current row
                        let tempXForRowMeasure = 0; // Corrected: use a fresh variable for inner loop
                        for (let i = 0; i < row.length; i++) {
                            const cellContentWidth = currentColDrawingWidths[i] - (2 * cellContentHorizontalPadding);
                            const { height } = this._renderInlineFormattedText(ctx, row[i], tempXForRowMeasure + cellContentHorizontalPadding, 0, baseFont, baseColor, cellContentWidth, lineSpacingFactor, true, [], currentTime);
                            rowCellHeights.push(height);
                            maxRowHeight = Math.max(maxRowHeight, height);
                            tempXForRowMeasure += currentColDrawingWidths[i] + borderWidth;
                        }
                        totalTableHeight += maxRowHeight + (2 * cellContentHorizontalPadding) + borderWidth; // Add cell padding and border
                    });

                    return totalTableHeight;
                }
        }
        return 0;
    }

    /**
     * Draws a single formatted block on the canvas, handling various block types.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {HTMLElement} htmlOverlay - The HTML element to overlay HTML content (like iframes).
     * @param {object} block - The block object to draw.
     * @param {number} x - X-coordinate to start drawing the block.
     * @param {number} y - Y-coordinate to start drawing the block.
     * @param {number} maxWidth - Maximum width for the block content.
     * @param {Array<object>} hyperlinks - Array to collect hyperlink bounding boxes.
     * @param {Array<object>} checkboxes - Array to collect checkbox bounding boxes for interactivity.
     * @param {number} [currentTime=0] - Current animation time in milliseconds.
     * @returns {number} The height of the drawn block.
     */
    _drawFormattedBlock = (ctx, htmlOverlay, block, x, y, maxWidth, hyperlinks, checkboxes, currentTime = 0) => {
        const baseFont = '14px "Rodin", sans-serif';
        const baseColor = this.cssVars['--ds-text'];
        const lineSpacingFactor = this.lineSpacingFactor;

        switch (block.type) {
            case 'paragraph':
                {
                    if (block.tokens.length === 0) return 14 * lineSpacingFactor;
                    const {
                        height
                    } = this._renderInlineFormattedText(ctx, block.tokens, x, y, baseFont, baseColor, maxWidth, lineSpacingFactor, false, hyperlinks, currentTime);
                    return height;
                }
            case 'hr':
                {
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(x, y + 4, maxWidth, 1);
                    return 10;
                }
            case 'checkbox':
                {
                    const boxSize = 14;
                    const boxY = y + (20 - boxSize) / 2; // Vertically center box within a nominal 20px line height
                    ctx.strokeStyle = baseColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, boxY, boxSize, boxSize);

                    checkboxes.push({
                        rect: { x: x, y: boxY, width: boxSize, height: boxSize },
                        checked: block.checked,
                        type: 'checkbox'
                    });

                    if (block.checked) {
                        ctx.fillStyle = baseColor;
                        ctx.beginPath();
                        ctx.moveTo(x + 3, boxY + 7);
                        ctx.lineTo(x + 6, boxY + 10);
                        ctx.lineTo(x + 11, boxY + 4);
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                    const {
                        height
                    } = this._renderInlineFormattedText(ctx, block.tokens, x + boxSize + 8, y, baseFont, baseColor, maxWidth - (boxSize + 8), lineSpacingFactor, false, hyperlinks, currentTime);
                    return Math.max(20, height); // Ensure a minimum height for the checkbox line
                }
            case 'image':
                {
                    const img = this.imageManager.getImage(block.url);
                    let imgWidth = block.width || maxWidth;
                    let imgHeight = block.height || 0;

                    if (img && img.complete) {
                        const aspectRatio = img.height / img.width;
                        if (imgHeight === 0) {
                            imgHeight = imgWidth * aspectRatio;
                        } else if (imgWidth === 0) {
                            imgWidth = imgHeight / aspectRatio;
                        }
                        if (imgWidth > maxWidth) {
                            imgWidth = maxWidth;
                            imgHeight = imgWidth * aspectRatio;
                        }

                        ctx.drawImage(img, x, y, imgWidth, imgHeight);
                        hyperlinks.push({
                            rect: { x: x, y: y, width: imgWidth, height: imgHeight },
                            url: block.url,
                            type: 'image'
                        });
                        return imgHeight;
                    }
                    // Draw loading placeholder for image
                    imgHeight = imgHeight || (imgWidth * 0.75) || 50;
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(x, y, imgWidth, imgHeight);
                    this._drawTextOnCanvas(ctx, 'Loading Image...', x + imgWidth / 2, y + imgHeight / 2, '12px "Rodin", sans-serif', 'rgba(255,255,255,0.5)', 'center', 'middle', Infinity, 1, { noDefaultShadow: true });
                    return imgHeight;
                }
            case 'embed':
                {
                    let embedWidth = block.width || maxWidth;
                    let embedHeight = block.height || 0;

                    if (embedHeight === 0) {
                        embedHeight = embedWidth * 9 / 16; // Standard 16:9 aspect ratio for YouTube
                    } else if (embedWidth === 0) {
                        embedWidth = embedHeight * 16 / 9;
                    }
                    if (embedWidth > maxWidth) {
                        embedWidth = maxWidth;
                        embedHeight = embedWidth * 9 / 16;
                    }

                    const iframe = document.createElement('iframe');
                    iframe.className = 'embedded-media';
                    iframe.style.position = 'absolute';
                    iframe.style.left = `${x}px`;
                    iframe.style.top = `${y}px`;
                    iframe.style.width = `${embedWidth}px`;
                    iframe.style.height = `${embedHeight}px`;
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allowfullscreen', 'true');
                    if (block.service === 'youtube') {
                        iframe.src = `https://www.youtube.com/embed/${block.id}`;
                    }
                    htmlOverlay.appendChild(iframe);
                    hyperlinks.push({
                        rect: { x: x, y: y, width: embedWidth, height: embedHeight },
                        url: iframe.src,
                        type: 'youtube-embed'
                    });
                    return embedHeight;
                }
            case 'list':
                {
                    let currentItemY = y;
                    block.items.forEach((item, index) => {
                        const itemX = x + (item.level * 20); // Indentation for list level
                        const markerOffset = item.ordered ? 20 : 15; // Space for number/bullet
                        const textStartX = itemX + markerOffset;
                        const itemMaxWidth = maxWidth - textStartX; // Remaining width for list item text

                        if (item.ordered) {
                            this._drawTextOnCanvas(ctx, `${index + 1}.`, itemX, currentItemY, baseFont, baseColor, 'left', 'top', Infinity, 1, { noDefaultShadow: true });
                        } else {
                            ctx.beginPath();
                            ctx.arc(itemX + 4, currentItemY + 7, 3, 0, Math.PI * 2); // Bullet point
                            ctx.fillStyle = baseColor;
                            ctx.fill();
                        }
                        const {
                            height
                        } = this._renderInlineFormattedText(ctx, item.tokens, textStartX, currentItemY, baseFont, baseColor, itemMaxWidth, lineSpacingFactor, false, hyperlinks, currentTime);
                        currentItemY += height; // Advance Y by the height of the list item
                    });
                    return currentItemY - y; // Total height consumed by the list
                }
            case 'table':
                {
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 1;

                    // Recalculate column widths (could be passed down from measure, but for robustness, recalculating)
                    const columnContent = Array(block.headers.length).fill(null).map(() => []);
                    block.headers.forEach((headerTokens, colIndex) => { columnContent[colIndex].push(headerTokens); });
                    block.rows.forEach(row => { row.forEach((cellTokens, colIndex) => { if (columnContent[colIndex]) { columnContent[colIndex].push(cellTokens); } }); });

                    const numCols = block.headers.length;
                    const borderWidth = 1;
                    const cellContentHorizontalPadding = 5;

                    const measuredColContentWidths = columnContent.map(colItems => {
                        let maxContentWidthInColumn = 0;
                        const tempMeasuringCtx = this.textMeasurer._ctx;
                        colItems.forEach(tokens => {
                            const { width: measuredTokenWidth } = this._renderInlineFormattedText(tempMeasuringCtx, tokens, 0, 0, baseFont, baseColor, Infinity, lineSpacingFactor, true, [], currentTime);
                            maxContentWidthInColumn = Math.max(maxContentWidthInColumn, measuredTokenWidth);
                        });
                        return maxContentWidthInColumn;
                    });

                    let totalMeasuredContentWidthSum = measuredColContentWidths.reduce((sum, w) => sum + w, 0);
                    const totalHorizontalOverhead = (numCols + 1) * borderWidth + numCols * (2 * cellContentHorizontalPadding);
                    const availableContentSpaceForSum = maxWidth - totalHorizontalOverhead;
                    let finalColContentWidths = [];
                    if (totalMeasuredContentWidthSum < availableContentSpaceForSum) {
                        const remainingSpace = availableContentSpaceForSum - totalMeasuredContentWidthSum;
                        const extraPerColumn = remainingSpace / numCols;
                        finalColContentWidths = measuredColContentWidths.map(w => w + extraPerColumn);
                    } else {
                        const scaleFactor = availableContentSpaceForSum / totalMeasuredContentWidthSum;
                        finalColContentWidths = measuredColContentWidths.map(w => w * scaleFactor);
                    }
                    // Ensure the sum of column widths (including internal padding) matches maxWidth accurately
                    let currentColDrawingWidths = finalColContentWidths.map(w => w + (2 * cellContentHorizontalPadding));
                    let currentTotalDrawingWidthSum = currentColDrawingWidths.reduce((sum, w) => sum + w, 0) + (numCols + 1) * borderWidth;
                    if (Math.abs(currentTotalDrawingWidthSum - maxWidth) > 0.01) {
                        const adjustmentRatio = maxWidth / currentTotalDrawingWidthSum;
                        currentColDrawingWidths = currentColDrawingWidths.map(w => w * adjustmentRatio);
                    }


                    let currentTableY = y;
                    let currentTableX = x;

                    // Measure header height accurately for drawing
                    let maxHeaderHeight = 0;
                    const headerHeights = [];
                    let tempXForHeaderMeasure = 0;
                    for (let i = 0; i < block.headers.length; i++) {
                        const headerContentWidth = currentColDrawingWidths[i] - (2 * cellContentHorizontalPadding);
                        const { height } = this._renderInlineFormattedText(ctx, block.headers[i], tempXForHeaderMeasure + cellContentHorizontalPadding, 0, `bold ${baseFont}`, baseColor, headerContentWidth, lineSpacingFactor, true, [], currentTime);
                        headerHeights.push(height);
                        maxHeaderHeight = Math.max(maxHeaderHeight, height);
                        tempXForHeaderMeasure += currentColDrawingWidths[i] + borderWidth; // Advance offset for next column
                    }

                    // Draw header row background and content
                    ctx.save();
                    ctx.fillStyle = 'rgba(255,255,255,0.1)'; // Header background color
                    ctx.fillRect(currentTableX, currentTableY, maxWidth, maxHeaderHeight + (2 * cellContentHorizontalPadding));
                    ctx.restore();

                    let currentColumnXOffset = currentTableX + borderWidth; // Start after left table border
                    for (let i = 0; i < block.headers.length; i++) {
                        const headerContentWidth = currentColDrawingWidths[i] - (2 * cellContentHorizontalPadding);
                        // Vertically center header text within its determined row height
                        const textYOffset = currentTableY + cellContentHorizontalPadding + (maxHeaderHeight - headerHeights[i]) / 2;
                        this._renderInlineFormattedText(ctx, block.headers[i], currentColumnXOffset + cellContentHorizontalPadding, textYOffset, `bold ${baseFont}`, baseColor, headerContentWidth, lineSpacingFactor, false, hyperlinks, currentTime);
                        currentColumnXOffset += currentColDrawingWidths[i] + borderWidth;
                    }
                    currentTableY += maxHeaderHeight + (2 * cellContentHorizontalPadding) + borderWidth; // Advance Y after header row and its bottom border


                    // Draw data rows
                    block.rows.forEach(row => {
                        let maxRowHeight = 0;
                        const rowCellHeights = []; // Store actual measured heights for vertical centering
                        // First pass to measure max height for the current row
                        let tempXForRowMeasure = 0;
                        for (let i = 0; i < row.length; i++) {
                            const cellContentWidth = currentColDrawingWidths[i] - (2 * cellContentHorizontalPadding);
                            const { height } = this._renderInlineFormattedText(ctx, row[i], tempXForRowMeasure + cellContentHorizontalPadding, 0, baseFont, baseColor, cellContentWidth, lineSpacingFactor, true, [], currentTime);
                            rowCellHeights.push(height);
                            maxRowHeight = Math.max(maxRowHeight, height);
                            tempXForRowMeasure += currentColDrawingWidths[i] + borderWidth;
                        }

                        // Draw cells in the current row
                        currentColumnXOffset = currentTableX + borderWidth; // Reset X for drawing cells in this row
                        for (let i = 0; i < row.length; i++) {
                            const cellContentWidth = currentColDrawingWidths[i] - (2 * cellContentHorizontalPadding);
                            // Vertically center cell text within its determined row height
                            const textYOffset = currentTableY + cellContentHorizontalPadding + (maxRowHeight - rowCellHeights[i]) / 2;
                            this._renderInlineFormattedText(ctx, row[i], currentColumnXOffset + cellContentHorizontalPadding, textYOffset, baseFont, baseColor, cellContentWidth, lineSpacingFactor, false, hyperlinks, currentTime);
                            currentColumnXOffset += currentColDrawingWidths[i] + borderWidth;
                        }
                        currentTableY += maxRowHeight + (2 * cellContentHorizontalPadding) + borderWidth; // Advance Y after data row and its bottom border
                    });

                    // Draw vertical grid lines (horizontal lines are implicitly handled by Y advancement + `_drawFormattedBlock`'s Y loop)
                    let currentVerticalLineX = x;
                    for (let i = 0; i <= numCols; i++) {
                        ctx.beginPath();
                        ctx.moveTo(currentVerticalLineX + borderWidth / 2, y); // Start from top of table
                        ctx.lineTo(currentVerticalLineX + borderWidth / 2, currentTableY - borderWidth); // End at bottom of table
                        ctx.stroke();
                        if (i < numCols) { // Advance for next column, but not after the last column
                            currentVerticalLineX += currentColDrawingWidths[i] + borderWidth;
                        }
                    }
                    return currentTableY - y; // Total height consumed by the table
                }
        }
        return 0;
    }

    /**
     * Renders an array of structured blocks onto the canvas.
     * This function calculates the total height, sets canvas dimensions, and then draws each block.
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     * @param {number} maxWidth - The maximum width for the content.
     * @param {number} [padding=0] - Padding around the content.
     * @param {HTMLElement} htmlOverlay - The HTML element to append any HTML content (like iframes).
     * @param {Array<object>} hyperlinks - Array to collect hyperlink bounding boxes for interactivity.
     * @param {Array<object>} checkboxes - Array to collect checkbox bounding boxes for interactivity.
     * @param {number} [currentTime=0] - Current animation time in milliseconds.
     */
    _renderBlocksToCanvas = (canvas, blocks, maxWidth, padding = 0, htmlOverlay, hyperlinks, checkboxes, currentTime = 0) => {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Clear existing HTML overlays
        while (htmlOverlay.firstChild) {
            htmlOverlay.removeChild(htmlOverlay.firstChild);
        }

        let totalHeight = 0;
        // First pass: measure total height needed for all blocks
        blocks.forEach(block => {
            totalHeight += this._measureBlockHeight(ctx, block, maxWidth, currentTime) + this.cssVars.blockSpacing;
        });

        // Set canvas dimensions
        canvas.width = maxWidth + (padding * 2);
        canvas.height = totalHeight;

        let currentY = 0;
        // Second pass: draw all blocks
        blocks.forEach(block => {
            const blockHeight = this._drawFormattedBlock(ctx, htmlOverlay, block, padding, currentY, maxWidth, hyperlinks, checkboxes, currentTime);
            currentY += blockHeight + (this.cssVars.blockSpacing || 10);
        });
    }
}
/**
 * Helper class to measure text width on a temporary canvas context.
 * Implemented as a singleton to reuse the canvas/context efficiently.
 */
export class TextCanvasMeasurer {
    constructor() {
        if (!TextCanvasMeasurer.instance) {
            this._canvas = document.createElement('canvas');
            this._ctx = this._canvas.getContext('2d');
            this._ctx.imageSmoothingEnabled = false;
            TextCanvasMeasurer.instance = this;
        }
        return TextCanvasMeasurer.instance;
    }

    /**
     * Measures the width and other metrics of a given text string with a specific font.
     * @param {string} text - The text to measure.
     * @param {string} font - The font string (e.g., '14px Arial').
     * @returns {TextMetrics} A TextMetrics object.
     */
    measureText(text, font) {
        this._ctx.font = font;
        return this._ctx.measureText(String(text));
    }

    /**
     * Estimates the total height of wrapped text within a given maximum width.
     * @param {string} text - The text to measure.
     * @param {string} font - The font string.
     * @param {number} maxWidth - The maximum width before text wraps.
     * @param {number} [lineSpacingFactor=1.0] - Multiplier for line spacing.
     * @returns {number} The estimated total height.
     */
    estimateWrappedTextHeight(text, font, maxWidth, lineSpacingFactor = 1.0) {
        // Ensure text is a string before proceeding
        const safeText = String(text);

        this._ctx.font = font;
        const tempMetrics = this._ctx.measureText('M');
        const actualBoundingBoxAscent = tempMetrics.actualBoundingBoxAscent || 0;
        const actualBoundingBoxDescent = tempMetrics.actualBoundingBoxDescent || 0;
        const actualLineHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

        if (maxWidth === Infinity) {
            return actualLineHeight * lineSpacingFactor;
        }
        const words = safeText.split(' ');
        let line = '';
        let totalHeight = 0;
        for (let n = 0; n < words.length; n++) {
            let testLine = line + (n > 0 ? ' ' : '') + words[n];
            let metrics = this._ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && line.length > 0) {
                totalHeight += actualLineHeight * lineSpacingFactor;
                line = words[n];
            } else {
                line = testLine;
            }
        }
        totalHeight += actualLineHeight * lineSpacingFactor;
        return totalHeight;
    }
}

/**
 * Manages image loading and caching.
 */
export class ImageManager {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Loads an image from a URL and caches it.
     * @param {string} url - The URL of the image to load.
     * @returns {Promise<HTMLImageElement|null>} A promise that resolves with the image element or null if failed.
     */
    loadImage(url) {
        if (this.cache.has(url)) {
            return Promise.resolve(this.cache.get(url));
        }
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                this.cache.set(url, img);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                this.cache.set(url, null); // Cache null on error
                resolve(null); // Resolve with null instead of rejecting
            };
            img.src = url;
        });
    }

    /**
     * Retrieves a cached image.
     * @param {string} url - The URL of the image.
     * @returns {HTMLImageElement|null} The cached image element or null if not found.
     */
    getImage(url) {
        return this.cache.get(url) || null;
    }

    /**
     * Preloads images referenced within parsed markdown blocks.
     * @param {Array<object>} blocks - An array of parsed markdown block objects.
     * @returns {Promise<void>} A promise that resolves when all images are attempted to be loaded.
     */
    async loadImagesFromBlocks(blocks) {
        const mediaUrls = new Set();
        blocks.forEach(block => {
            if (block.type === 'image') {
                mediaUrls.add(block.url);
            } else if (block.type === 'embed' && block.service === 'youtube') {
                mediaUrls.add(`https://img.youtube.com/vi/${block.id}/0.jpg`);
            } else if (block.type === 'paragraph' || block.type === 'list' || block.type === 'checkbox' || block.type === 'table') {
                let textContentTokens = [];
                if (block.type === 'list' && Array.isArray(block.items)) {
                    textContentTokens = block.items.flatMap(item => item.tokens);
                } else if (Array.isArray(block.tokens)) {
                    textContentTokens = block.tokens;
                } else if (block.type === 'table') {
                    textContentTokens = [...block.headers.flat(), ...block.rows.flat().flat()];
                }

                if (Array.isArray(textContentTokens)) {
                    const findMediaInTokens = (tokensArray) => {
                        tokensArray.forEach(token => {
                            if (token.style) {
                                if (token.style.image) {
                                    mediaUrls.add(token.style.image);
                                } else if (token.style.youtube) {
                                    mediaUrls.add(`https://img.youtube.com/vi/${token.style.youtube}/0.jpg`);
                                }
                            }
                            if (token.isCustomEffect && Array.isArray(token.children)) {
                                findMediaInTokens(token.children);
                            }
                        });
                    };
                    findMediaInTokens(textContentTokens);
                }
            }
        });
        const promises = Array.from(mediaUrls).map(url => this.loadImage(url));
        await Promise.all(promises);
    }
}
