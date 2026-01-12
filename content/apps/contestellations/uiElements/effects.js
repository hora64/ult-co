/**
 * Consolidated file for ALL text effects.
 * Each function draws a specific text effect onto the canvas.
 */

/**
 * Draws text with a 3D extrusion effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const draw3dEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent'; // Ensure no default shadows interfere
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, depthStr] = (typeof style['3d'] === 'string' ? style['3d'] : 'rgba(0,0,0,0.3),3').split(',');
    const extrusionColor = color || 'rgba(0,0,0,0.3)';
    const extrusionDepth = parseInt(depthStr) || 3;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        // Draw shadow layers for each character
        ctx.fillStyle = extrusionColor;
        for (let j = extrusionDepth; j > 0; j--) {
            ctx.fillText(char, x + currentXOffset + j, y + j);
        }
        // Draw the main character on top
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset; // Return total width consumed
};

/**
 * Draws text with a bubbling animation effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawBubblingEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const bubbleColor = typeof style.bubbling === 'string' ? style.bubbling : 'rgba(173, 216, 230, 0.7)';
    const parsedBubbleColor = hexToRgb(bubbleColor);

    // Draw multiple bubbles around the text
    for (let i = 0; i < 5; i++) {
        const bubbleX = x + (i * 30 + currentTime / 20) % tokenTextWidth;
        const bubbleY = y + tokenTextHeight - (currentTime / 50 + i * 40) % (tokenTextHeight * 2);
        const bubbleSize = 1 + Math.sin(bubbleY / 10 + currentTime / 100) * 0.5;

        const alpha = 1 - (bubbleY - y) / (tokenTextHeight * 2);
        ctx.fillStyle = `rgba(${parsedBubbleColor.r}, ${parsedBubbleColor.g}, ${parsedBubbleColor.b}, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();

        if (bubbleSize > 2.5 && Math.random() < 0.1) {
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize + 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${parsedBubbleColor.r}, ${parsedBubbleColor.g}, ${parsedBubbleColor.b}, ${Math.max(0, alpha)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    ctx.restore();
    return tokenTextWidth; // Consumes its measured width
};

/**
 * Draws text with a confetti animation effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawConfettiEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const colors = (typeof style.confetti === 'string' ? style.confetti : 'red,green,blue').split(',');

    for (let i = 0; i < 10; i++) {
        const cx = x + Math.random() * tokenTextWidth;
        const cy = y + Math.random() * tokenTextHeight;
        const size = 3 + Math.random() * 3;
        const rotation = Math.random() * Math.PI * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.fillStyle = color;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
    }
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with an echo effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawEchoEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, offsetXStr, offsetYStr, countStr] = (typeof style.echo === 'string' ? style.echo : 'rgba(255,255,255,0.3),2,2,3').split(',');
    const echoColor = color || 'rgba(255,255,255,0.3)';
    const echoOffsetX = parseFloat(offsetXStr) || 2;
    const echoOffsetY = parseFloat(offsetYStr) || 2;
    const echoCount = parseInt(countStr) || 3;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        for (let j = echoCount; j >= 0; j--) {
            const opacity = (j / echoCount) * 0.4;
            const currentEchoX = x + currentXOffset - (echoOffsetX * j);
            const currentEchoY = y - (echoOffsetY * j);
            const parsedEchoColor = hexToRgb(echoColor);
            ctx.fillStyle = `rgba(${parsedEchoColor.r}, ${parsedEchoColor.g}, ${parsedEchoColor.b}, ${opacity})`;
            ctx.fillText(char, currentEchoX, currentEchoY);
        }
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset; // Return total width consumed
};

/**
 * Draws text with an electric bolt effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawElectricEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const [color, strengthStr] = (typeof style.electric === 'string' ? style.electric : 'yellow,5').split(',');
    const electricColor = color || 'yellow';
    const strength = parseFloat(strengthStr) || 5;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = electricColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = electricColor;
    ctx.shadowBlur = strength * 2;

    ctx.beginPath();
    let pathX = x;
    for (let i = 0; i < text.length; i++) {
        const charWidth = ctx.measureText(text[i]).width;
        const midX = pathX + charWidth / 2;
        const offset = Math.sin(currentTime / 50 + i * 10) * strength;
        ctx.moveTo(midX, y);
        ctx.lineTo(midX + offset, y + tokenTextHeight / 2 + Math.random() * strength - strength / 2);
        ctx.lineTo(midX - offset, y + tokenTextHeight + Math.random() * strength - strength / 2);
        pathX += charWidth;
    }
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    return tokenTextWidth; // Consumes its measured width
};

/**
 * Draws text with a continuous expand/shrink animation.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawExpandShrinkEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const scale = 1 + Math.sin(currentTime / 500) * 0.1;
    ctx.translate(x + tokenTextWidth / 2, y + tokenTextHeight / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = style.color || 'white';
    ctx.fillText(text, -tokenTextWidth / 2, -tokenTextHeight / 2);
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a fire effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawFireEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [baseColor, sparkColor] = (typeof style.fire === 'string' ? style.fire : 'orange,gold').split(',');
    const fireBaseColor = baseColor || 'orange';
    const fireSparkColor = sparkColor || 'gold';

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const gradient = ctx.createLinearGradient(x + currentXOffset, y, x + currentXOffset, y + baseFontSize);
        gradient.addColorStop(0, `hsl(40, 100%, ${60 + Math.sin(currentTime / 50 + i * 10) * 10}%)`);
        gradient.addColorStop(0.5, `hsl(0, 100%, ${50 + Math.cos(currentTime / 70 + i * 10) * 10}%)`);
        gradient.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = gradient;
        ctx.fillText(char, x + currentXOffset, y);

        ctx.shadowColor = fireSparkColor;
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(char, x + currentXOffset, y); // Draw again for the glow
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a fire-like gradient.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawFireGradientEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const gradient = ctx.createLinearGradient(x + currentXOffset, y, x + currentXOffset, y + baseFontSize);
        gradient.addColorStop(0, `hsl(40, 100%, ${70 + Math.sin(currentTime / 40 + i * 10) * 15}%)`);
        gradient.addColorStop(0.5, `hsl(0, 100%, ${50 + Math.cos(currentTime / 60 + i * 10) * 10}%)`);
        gradient.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 10;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with fire sparks animation.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawFireSparksEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const sparkColor = typeof style.firesparks === 'string' ? style.firesparks : 'orange';
    const parsedSparkColor = hexToRgb(sparkColor);

    for (let i = 0; i < 15; i++) {
        const sparkX = x + Math.random() * tokenTextWidth;
        const sparkY = y + tokenTextHeight - (currentTime / 30 + i * 20) % (tokenTextHeight * 2) - Math.random() * 20;
        const sparkSize = 1 + Math.random() * 2;
        const sparkAlpha = 1 - (sparkY - y) / (tokenTextHeight * 2);

        ctx.fillStyle = `rgba(${parsedSparkColor.r}, ${parsedSparkColor.g}, ${parsedSparkColor.b}, ${Math.max(0, sparkAlpha)})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a flickering animation.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawFlickerEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        if (Math.random() > 0.3 + Math.sin(currentTime / 200 + i * 5) * 0.2) {
            ctx.fillStyle = style.color || 'white';
            ctx.fillText(char, x + currentXOffset, y);
        }
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a glowing effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawGlowEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';

    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = style.color || 'white';

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a highlight background.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawHighlightEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const color = typeof style.highlight === 'string' ? style.highlight : 'yellow';
    ctx.fillStyle = color || 'yellow';
    ctx.fillRect(x, y + tokenTextHeight * 0.1, tokenTextWidth, tokenTextHeight * 0.8);
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with an ice effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawIceEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [baseColor, outlineColor] = (typeof style.ice === 'string' ? style.ice : 'lightblue,white').split(',');
    const iceBaseColor = baseColor || 'lightblue';
    const iceOutlineColor = outlineColor || 'white';

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const gradient = ctx.createLinearGradient(x + currentXOffset, y, x + currentXOffset, y + baseFontSize);
        gradient.addColorStop(0, `hsl(190, 80%, ${80 + Math.sin(currentTime / 60 + i * 10) * 5}%)`);
        gradient.addColorStop(0.5, `hsl(210, 70%, ${60 + Math.cos(currentTime / 80 + i * 10) * 5}%)`);
        gradient.addColorStop(1, `hsl(240, 60%, ${40}%)`);
        ctx.fillStyle = gradient;
        ctx.fillText(char, x + currentXOffset, y);

        ctx.strokeStyle = iceOutlineColor;
        ctx.lineWidth = 0.5;
        ctx.strokeText(char, x + currentXOffset, y);

        ctx.shadowColor = 'rgba(173, 216, 230, 0.7)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with an ice crystal effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawIceCrystalEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const gradient = ctx.createLinearGradient(x + currentXOffset, y, x + currentXOffset, y + baseFontSize);
        gradient.addColorStop(0, `hsl(190, 80%, ${90 + Math.sin(currentTime / 70 + i * 10) * 5}%)`);
        gradient.addColorStop(0.5, `hsl(210, 70%, ${70 + Math.cos(currentTime / 90 + i * 10) * 5}%)`);
        gradient.addColorStop(1, `hsl(240, 60%, ${50}%)`);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        ctx.strokeText(char, x + currentXOffset, y);

        ctx.shadowColor = 'rgba(173, 216, 230, 0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with an ink bleed effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawInkBleedEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillStyle = style.color || 'white';
        ctx.save();
        ctx.globalAlpha = 0.3;
        for (let j = 0; j < 3; j++) {
            const bleedX = x + currentXOffset + (Math.random() - 0.5) * 2;
            const bleedY = y + (Math.random() - 0.5) * 2;
            ctx.fillText(char, bleedX, bleedY);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a metallic effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawMetallicEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const metallicOffset = Math.sin(currentTime / 200 + x) * 2;
    const metallicContrast = 0.5 + Math.sin(currentTime / 150) * 0.2;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillStyle = `hsl(0, 0%, ${70 + metallicContrast * 20}%)`;
        ctx.fillText(char, x + currentXOffset + metallicOffset, y);

        ctx.fillStyle = `hsl(0, 0%, ${40 - metallicContrast * 10}%)`;
        ctx.fillText(char, x + currentXOffset + 0.5 - metallicOffset, y + 0.5);

        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a mirrored reflection effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawMirrorEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const offsetY = parseFloat(typeof style.mirror === 'string' ? style.mirror : (baseFontSize * 1.5)) || baseFontSize * 1.5;
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);

        ctx.save();
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.3;
        ctx.fillText(char, x + currentXOffset, -(y + offsetY + baseFontSize));
        ctx.restore();
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a neon glow effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawNeonEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';

    const [color, blurStr] = (typeof style.neon === 'string' ? style.neon : 'cyan,15').split(',');
    ctx.shadowColor = color || 'cyan';
    ctx.shadowBlur = parseFloat(blurStr) || 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = color || 'cyan';

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a pulsating neon glow effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawNeonPulseEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, blurStr, speedStr] = (typeof style.neonpulse === 'string' ? style.neonpulse : 'magenta,15,300').split(',');
    const neonColor = color || 'magenta';
    const blur = parseFloat(blurStr) || 15;
    const speed = parseFloat(speedStr) || 300;

    const pulseStrength = 0.5 + Math.sin(currentTime / speed) * 0.5;

    ctx.shadowColor = neonColor;
    ctx.shadowBlur = blur * pulseStrength;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = neonColor;
    ctx.globalAlpha = 0.7 + pulseStrength * 0.3;
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with an outline and glow effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawOutlineGlowEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, widthStr, blurStr] = (typeof style.outlineglow === 'string' ? style.outlineglow : 'white,1,5').split(',');
    ctx.strokeStyle = color || 'white';
    ctx.lineWidth = parseFloat(widthStr) || 1;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    ctx.shadowColor = color || 'white';
    ctx.shadowBlur = parseFloat(blurStr) || 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.strokeText(char, x + currentXOffset, y);
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a prize-like gold color and subtle glow.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawPrizeEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    const prizeColor = style.color || '#FFD700';
    ctx.fillStyle = prizeColor;
    ctx.shadowColor = prizeColor;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a pulsating opacity effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawPulseEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const pulseColor = typeof style.pulse === 'string' ? style.pulse : 'white';
    const pulseStrength = 0.5 + Math.sin(currentTime / 300) * 0.5;
    const parsedColor = hexToRgb(pulseColor);
    ctx.fillStyle = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${pulseStrength})`;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a rain effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRainEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    for (let i = 0; i < 15; i++) {
        const dropX = x + (i * 20 + currentTime / 10) % tokenTextWidth;
        const dropY = y + (currentTime / 5 + i * 30) % (tokenTextHeight + 10) - 10;
        ctx.fillStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(dropX, dropY, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a rainbow effect that fades in and out.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRainbowFadeEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const hueStart = (currentTime / 100) % 360;
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const hue = (hueStart + (i * 15)) % 360;
        const alpha = 0.5 + Math.sin(currentTime / 200 + i * 0.5) * 0.5;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a retro scanlines effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRetroScanlinesEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    for (let i = 0; i < tokenTextHeight; i += 3) {
        ctx.fillRect(x, y + i, tokenTextWidth, 2);
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a smoke effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawSmokeEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillStyle = style.color || 'white';
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillText(char, x + currentXOffset, y);

        for (let j = 0; j < 3; j++) {
            const smokeAlpha = 0.1 + Math.sin(currentTime / 200 + j * 50 + i * 5) * 0.05;
            const smokeOffset = Math.sin(currentTime / 150 + j * 70 + i * 5) * 3;
            ctx.globalAlpha = smokeAlpha;
            ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
            ctx.fillText(char, x + currentXOffset + smokeOffset, y - j * 2);
        }
        ctx.restore(); // Restore globalAlpha from inner save
        currentXOffset += charWidth;
    }
    ctx.restore(); // Restore main context state
    return currentXOffset;
};

/**
 * Draws text with a sparkle effect (particles around the text).
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawSparkleEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    let sparkleColorValue = '#FFD700';
    if (typeof style.sparkle === 'object' && style.sparkle !== null && typeof style.sparkle.targetColor === 'string') {
        sparkleColorValue = style.sparkle.targetColor;
    } else if (typeof style.sparkle === 'string') {
        sparkleColorValue = style.sparkle;
    }

    const sparkleCount = 3;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkleX = x + Math.random() * tokenTextWidth;
        const sparkleY = y + Math.random() * tokenTextHeight;
        const size = 1 + Math.random() * 2;
        const alpha = Math.abs(Math.sin(currentTime / (200 + i * 50)));

        const parsedSparkleColor = hexToRgb(sparkleColorValue);
        ctx.fillStyle = `rgba(${parsedSparkleColor.r}, ${parsedSparkleColor.g}, ${parsedSparkleColor.b}, ${alpha})`;

        ctx.fillRect(sparkleX - size / 2, sparkleY - size / 2, size, size);

        ctx.shadowColor = sparkleColorValue;
        ctx.shadowBlur = size * 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a 3D shadow effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawTextShadow3dEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, depthStr] = (typeof style.textshadow3d === 'string' ? style.textshadow3d : 'rgba(0,0,0,0.5),5').split(',');
    const shadowColor = color || 'rgba(0,0,0,0.5)';
    const shadowDepth = parseInt(depthStr) || 5;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillStyle = shadowColor;
        for (let j = shadowDepth; j > 0; j--) {
            ctx.fillText(char, x + currentXOffset + j * 0.7, y + j * 0.7);
        }
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a typing animation and a blinking cursor.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawTypingCursorEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const typingSpeed = 100;
    const blinkSpeed = 500;
    const charsToShow = Math.min(text.length, Math.floor(currentTime / typingSpeed));
    const displayedText = text.substring(0, charsToShow);

    ctx.fillStyle = style.color || 'white';
    ctx.fillText(displayedText, x, y);

    if (charsToShow < text.length && Math.floor(currentTime / blinkSpeed) % 2 === 0) {
        const cursorX = x + ctx.measureText(displayedText).width;
        ctx.fillRect(cursorX, y, 2, tokenTextHeight);
    }
    ctx.restore();
    return tokenTextWidth; // Always return full width for layout stability
};

/**
 * Draws text with a typewriter effect (appearing character by character).
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawTypewriterEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const speed = parseFloat(typeof style.typewriter === 'string' ? style.typewriter : '100') || 100;
    const charsToShow = Math.min(text.length, Math.floor(currentTime / speed));
    const displayedText = text.substring(0, charsToShow);
    ctx.fillStyle = style.color || 'white';
    ctx.fillText(displayedText, x, y);
    ctx.restore();
    return tokenTextWidth; // Always return full width for layout stability
};

/**
 * Draws text with a vaporwave aesthetic (chromatic aberration and color shifts).
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawVaporwaveEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color1, color2] = (typeof style.vaporwave === 'string' ? style.vaporwave : '#FF00FF,#00FFFF').split(',');

    const offset = Math.sin(currentTime / 150) * 2;
    const hueShift = (currentTime / 100) % 360;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillStyle = `hsla(${hueShift}, 100%, 50%, 0.7)`;
        ctx.fillText(char, x + currentXOffset + offset, y);

        ctx.fillStyle = `hsla(${(hueShift + 180) % 360}, 100%, 50%, 0.7)`;
        ctx.fillText(char, x + currentXOffset - offset, y);

        const gradient = ctx.createLinearGradient(x + currentXOffset, 0, x + currentXOffset + charWidth, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a water-like ripple effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawWaterEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const waveStrength = 1.5;
    const waveSpeed = 0.01;
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const offsetY = Math.sin((charX * 0.1) + (currentTime * waveSpeed)) * waveStrength;
        ctx.fillStyle = style.color || 'blue';
        ctx.fillText(char, charX, y + offsetY);
        currentXOffset += charWidth;
    }
    ctx.shadowColor = 'rgba(0, 50, 100, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillText(text, x, y); // Redraw full text for consistent shadow
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with individual characters moving in a wave pattern.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawWaveTextEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [ampStr, freqStr, speedStr] = (typeof style.waveText === 'string' ? style.waveText : '5,0.05,100').split(',');
    const amplitude = parseFloat(ampStr) || 5;
    const frequency = parseFloat(freqStr) || 0.05;
    const speed = parseFloat(speedStr) || 100;
    let currentXOffset = 0;
    ctx.fillStyle = style.color || 'white';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const charY = y + Math.sin((charX * frequency) + (currentTime / speed)) * amplitude;
        ctx.fillText(char, charX, charY);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a raindrops effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRaindropsEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const [color, countStr] = (typeof style.raindrops === 'string' ? style.raindrops : 'lightblue,15').split(',');
    const dropColor = color || 'lightblue';
    const dropCount = parseInt(countStr) || 15;

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = dropColor;
    for (let i = 0; i < dropCount; i++) {
        const dropX = x + (i * (tokenTextWidth / dropCount) + currentTime / 15) % tokenTextWidth;
        const dropY = y + (currentTime / 8 + i * 20) % (tokenTextHeight + 10) - 10;
        ctx.beginPath();
        ctx.arc(dropX, dropY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a bubble pop effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawBubblePopEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const bubbleColor = typeof style.bubblepop === 'string' ? style.bubblepop : 'rgba(173, 216, 230, 0.7)';
    const parsedBubbleColor = hexToRgb(bubbleColor);

    for (let i = 0; i < 5; i++) {
        const bubbleX = x + (i * 30 + currentTime / 20) % tokenTextWidth;
        const bubbleY = y + tokenTextHeight - (currentTime / 50 + i * 40) % (tokenTextHeight * 2);
        const bubbleSize = 1 + Math.sin(bubbleY / 10 + currentTime / 100) * 0.5;

        const alpha = 1 - (bubbleY - y) / (tokenTextHeight * 2);
        ctx.fillStyle = `rgba(${parsedBubbleColor.r}, ${parsedBubbleColor.g}, ${parsedBubbleColor.b}, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();

        if (bubbleSize > 2.5 && Math.random() < 0.1) {
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize + 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${parsedBubbleColor.r}, ${parsedBubbleColor.g}, ${parsedBubbleColor.b}, ${Math.max(0, alpha)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a character-specific gradient effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token, containing effect properties.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the entire text segment being drawn.
 * @param {number} tokenTextHeight - The height of the entire text segment being drawn.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawCharGradientEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color1, color2] = (typeof style.chargradient === 'string' ? style.chargradient : 'cyan,magenta').split(',');
    let currentXOffset = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const charGradient = ctx.createLinearGradient(charX, 0, charX + charWidth, 0);
        charGradient.addColorStop(0, color1 || 'cyan');
        charGradient.addColorStop(1, color2 || 'magenta');
        ctx.fillStyle = charGradient;
        ctx.fillText(char, charX, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

// Core Effects (previously in DrawingService but now moved to this effects.js)

/**
 * Draws text with a solid color.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawColorEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = style.color || 'white';
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a horizontal linear gradient.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawGradientEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color1, color2] = (typeof style.gradient === 'string' ? style.gradient : 'red,blue').split(',');
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const gradient = ctx.createLinearGradient(x + currentXOffset, 0, x + currentXOffset + charWidth, 0);
        gradient.addColorStop(0, color1 || 'red');
        gradient.addColorStop(1, color2 || 'blue');
        ctx.fillStyle = gradient;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a vertical linear gradient.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawGradientVEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color1, color2] = (typeof style.gradientV === 'string' ? style.gradientV : 'cyan,purple').split(',');
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const gradient = ctx.createLinearGradient(0, y, 0, y + baseFontSize);
        gradient.addColorStop(0, color1 || 'cyan');
        gradient.addColorStop(1, color2 || 'purple');
        ctx.fillStyle = gradient;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a customizable rainbow effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRainbowV2Effect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [speedStr, saturationStr, lightnessStr] = (typeof style.rainbowV2 === 'string' ? style.rainbowV2 : '1,100,60').split(',');
    const speed = parseFloat(speedStr) || 1;
    const saturation = parseFloat(saturationStr) || 100;
    const lightness = parseFloat(lightnessStr) || 60;
    const hueStart = (currentTime / (50 / speed)) % 360;
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const hue = (hueStart + (i * 15)) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with characters cycling between two colors in a wave pattern.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawWavecolorsEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color1, color2, speedStr] = (typeof style.wavecolors === 'string' ? style.wavecolors : '#FFFFFF,#000000,200').split(',');
    const speed = parseFloat(speedStr) || 200;
    let currentXOffset = 0;
    const parsedColor1 = hexToRgb(color1);
    const parsedColor2 = hexToRgb(color2);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const progress = (Math.sin(currentTime / speed + i * 0.5) + 1) / 2;
        const r = Math.round(parsedColor1.r + (parsedColor2.r - parsedColor1.r) * progress);
        const g = Math.round(parsedColor1.g + (parsedColor2.g - parsedColor1.g) * progress);
        const b = Math.round(parsedColor1.b + (parsedColor2.b - parsedColor1.b) * progress);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a solid-colored outline.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawOutlineEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, widthStr] = (typeof style.outline === 'string' ? style.outline : 'white,1').split(',');
    ctx.strokeStyle = color || 'white';
    ctx.lineWidth = parseFloat(widthStr) || 1;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.strokeText(char, x + currentXOffset, y);
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a gradient to its outline.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawGradientStrokeEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color1, color2, widthStr] = (typeof style.gradientstroke === 'string' ? style.gradientstroke : 'red,blue,2').split(',');
    const strokeWidth = parseFloat(widthStr) || 2;
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const gradient = ctx.createLinearGradient(x + currentXOffset, 0, x + currentXOffset + charWidth, 0);
        gradient.addColorStop(0, color1 || 'red');
        gradient.addColorStop(1, color2 || 'blue');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(char, x + currentXOffset, y);
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a customizable shadow.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawShadowEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [color, offsetsStr] = (typeof style.shadow === 'string' ? style.shadow : 'rgba(0,0,0,0.8);2;2;5').split(',', 2);
    const [offsetX, offsetY, blur] = (offsetsStr || '2;2;5').split(';').map(parseFloat);

    ctx.shadowColor = color || 'rgba(0,0,0,0.8)';
    ctx.shadowOffsetX = offsetX || 2;
    ctx.shadowOffsetY = offsetY || 2;
    ctx.shadowBlur = blur || 5;
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text that blurs in and out cyclically.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawBlurinoutEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const cycleDuration = 3000;
    const progress = (currentTime % cycleDuration) / cycleDuration;
    let blurAmount;
    if (progress < 0.5) {
        blurAmount = progress * 2 * 5;
    } else {
        blurAmount = (1 - (progress - 0.5) * 2) * 5;
    }
    ctx.shadowColor = style.color || 'white';
    ctx.shadowBlur = blurAmount;
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with individual characters moving up and down in a wave.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawWavyEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const waveAmplitude = 2;
    const waveFrequency = 0.05;
    let currentXOffset = 0;
    ctx.fillStyle = style.color || 'white';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const charY = y + Math.sin(currentTime / 100 + charX * waveFrequency) * waveAmplitude;
        ctx.fillText(char, charX, charY);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with each character jiggling slightly.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawJiggleEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const jiggleAmplitude = 1.5;
    const jiggleFrequency = 0.1;
    let currentXOffset = 0;
    ctx.fillStyle = style.color || 'white';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const offsetX = Math.sin(currentTime / 50 + charX * jiggleFrequency) * jiggleAmplitude;
        const offsetY = Math.cos(currentTime / 60 + charX * jiggleFrequency) * jiggleAmplitude;
        ctx.fillText(char, charX + offsetX, y + offsetY);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text that scales in and out with a pulsating effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawScalepulseEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [factorStr, speedStr] = (typeof style.scalepulse === 'string' ? style.scalepulse : '0.1,200').split(',');
    const scaleFactor = parseFloat(factorStr) || 0.1;
    const pulseSpeed = parseFloat(speedStr) || 200;
    const scale = 1 + Math.sin(currentTime / pulseSpeed) * scaleFactor;
    ctx.translate(x + tokenTextWidth / 2, y + tokenTextHeight / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = style.color || 'white';
    ctx.fillText(text, -tokenTextWidth / 2, -tokenTextHeight / 2);
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a rotating effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRotateEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const angle = (currentTime / 1000) * (Math.PI / 180) * 10;
    ctx.translate(x + tokenTextWidth / 2, y + tokenTextHeight / 2);
    ctx.rotate(angle);
    ctx.fillStyle = style.color || 'white';
    ctx.fillText(text, -tokenTextWidth / 2, -tokenTextHeight / 2);
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a skewing effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawSkewEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const angle = parseFloat(typeof style.skew === 'string' ? style.skew : '10') * (Math.PI / 180) || 10 * (Math.PI / 180);
    ctx.translate(x, y);
    ctx.transform(1, 0, Math.tan(angle), 1, 0, 0);
    ctx.fillStyle = style.color || 'white';
    ctx.fillText(text, 0, 0);
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with each character spinning independently.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawCharspinEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    ctx.fillStyle = style.color || 'white';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const angle = (currentTime / 100 + i * 10) * (Math.PI / 180);
        ctx.save();
        ctx.translate(charX + charWidth / 2, y + tokenTextHeight / 2);
        ctx.rotate(angle);
        ctx.fillText(char, -charWidth / 2, -tokenTextHeight / 2);
        ctx.restore();
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a distorting effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawDistortEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [magnitudeStr, speedStr] = (typeof style.distort === 'string' ? style.distort : '3,100').split(',');
    const magnitude = parseFloat(magnitudeStr) || 3;
    const speed = parseFloat(speedStr) || 100;
    let currentXOffset = 0;
    ctx.fillStyle = style.color || 'white';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;
        const offsetX = Math.sin(currentTime / speed + i * 0.5) * magnitude;
        const offsetY = Math.cos(currentTime / speed * 1.2 + i * 0.7) * magnitude;
        ctx.fillText(char, charX + offsetX, y + offsetY);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text that fades in and out cyclically.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawFadeinoutEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const cycleDuration = 3000;
    const progress = (currentTime % cycleDuration) / cycleDuration;
    let alpha;
    if (progress < 0.5) {
        alpha = progress * 2;
    } else {
        alpha = (1 - (progress - 0.5) * 2);
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text that is revealed by a wiping animation.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawRevealEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const direction = (typeof style.reveal === 'string' ? style.reveal : 'left').toLowerCase();
    const duration = 1500;
    const progress = Math.min(1, currentTime / duration);
    ctx.save();
    ctx.beginPath();
    if (direction === 'left') {
        ctx.rect(x, y, tokenTextWidth * progress, tokenTextHeight);
    } else if (direction === 'right') {
        ctx.rect(x + tokenTextWidth * (1 - progress), y, tokenTextWidth * progress, tokenTextHeight);
    } else if (direction === 'up') {
        ctx.rect(x, y + tokenTextHeight * (1 - progress), tokenTextWidth, tokenTextHeight * progress);
    } else if (direction === 'down') {
        ctx.rect(x, y, tokenTextWidth, tokenTextHeight * progress);
    } else {
        ctx.rect(x, y, tokenTextWidth * progress, tokenTextHeight);
    }
    ctx.clip();
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text that appears/disappears with a pixelated dissolve effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawDissolveEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const progress = (currentTime / 3000) % 1;
    ctx.fillStyle = style.color || 'white';
    ctx.save();
    ctx.beginPath();
    // This effect is complex to implement per-character with clipping;
    // retaining original behavior for simplicity as it affects the whole segment
    for (let i = 0; i < tokenTextWidth; i += 2) {
        for (let j = 0; j < tokenTextHeight; j += 2) {
            const distance = Math.sqrt((i - tokenTextWidth * progress) ** 2 + (j - tokenTextHeight / 2) ** 2);
            if (distance > (tokenTextWidth * 0.3 * (1 - progress) + 5)) {
                ctx.rect(x + i, y + j, 2, 2);
            }
        }
    }
    ctx.clip();
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text character by character, simulating typing.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawTypingEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const charsToShow = Math.min(text.length, Math.floor(currentTime / 100));
    const displayedText = text.substring(0, charsToShow);
    ctx.fillStyle = style.color || 'white';
    ctx.fillText(displayedText, x, y);
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a shimmering light reflection.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawShimmerEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const shimmerOffset = (currentTime / 5) % (tokenTextWidth + 20) - 10;
    ctx.save();
    ctx.rect(x, y, tokenTextWidth, tokenTextHeight);
    ctx.clip();
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    const shimmerGradient = ctx.createLinearGradient(x + shimmerOffset - 20, 0, x + shimmerOffset, 0);
    shimmerGradient.addColorStop(0, 'rgba(255,255,255,0)');
    shimmerGradient.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    shimmerGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shimmerGradient;
    ctx.fillRect(x + shimmerOffset - 20, y, 40, tokenTextHeight);
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text that scrolls horizontally like a marquee.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawMarqueeEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const speed = parseFloat(typeof style.marquee === 'string' ? style.marquee : '50') || 50;
    const offset = (currentTime / 1000 * speed) % (tokenTextWidth + 20);
    ctx.save();
    ctx.rect(x, y, tokenTextWidth, tokenTextHeight);
    ctx.clip();
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x - offset + currentXOffset, y);
        if (offset > tokenTextWidth && (x - offset + currentXOffset + tokenTextWidth + 20) < (x + tokenTextWidth)) {
            ctx.fillText(char, x - offset + tokenTextWidth + 20 + currentXOffset, y);
        }
        currentXOffset += charWidth;
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text that is revealed or hidden by a linear wipe.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawWipeEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [direction, speedStr] = (typeof style.wipe === 'string' ? style.wipe : 'left,1000').split(',');
    const wipeSpeed = parseFloat(speedStr) || 1000;
    const progress = (currentTime % (wipeSpeed * 2)) / (wipeSpeed * 2);
    let clipX = x;
    let clipY = y;
    let clipWidth = tokenTextWidth;
    let clipHeight = tokenTextHeight;
    ctx.save();
    ctx.beginPath();
    if (direction === 'left') {
        clipWidth = tokenTextWidth * progress;
    } else if (direction === 'right') {
        clipX = x + tokenTextWidth * (1 - progress);
        clipWidth = tokenTextWidth * progress;
    } else if (direction === 'up') {
        clipY = y + tokenTextHeight * (1 - progress);
        clipHeight = tokenTextHeight * progress;
    } else if (direction === 'down') {
        clipHeight = tokenTextHeight * progress;
    } else {
        clipWidth = tokenTextWidth * progress;
    }
    ctx.rect(clipX, clipY, clipWidth, clipHeight);
    ctx.clip();
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a pixelated effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawPixelateEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const pixelSize = parseInt(typeof style.pixelate === 'string' ? style.pixelate : '5') || 5;
    ctx.fillStyle = style.color || 'white';
    if (tokenTextWidth <= 0 || tokenTextHeight <= 0) {
        let currentXOffset = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            ctx.fillText(char, x + currentXOffset, y);
            currentXOffset += charWidth;
        }
        return currentXOffset;
    } else {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tokenTextWidth;
        tempCanvas.height = tokenTextHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = font;
        tempCtx.textBaseline = 'top';
        tempCtx.fillStyle = 'black';
        tempCtx.fillText(text, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tokenTextWidth, tokenTextHeight);
        const data = imageData.data;
        for (let py = 0; py < tokenTextHeight; py += pixelSize) {
            for (let px = 0; px < tokenTextWidth; px += pixelSize) {
                const index = ((py * tokenTextWidth) + px) * 4;
                const a = data[index + 3];
                if (a > 0) {
                    ctx.fillStyle = style.color || 'white';
                    ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
                }
            }
        }
    }
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a noise overlay.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawNoiseEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const noiseOpacity = parseFloat(typeof style.noise === 'string' ? style.noise : '0.2') || 0.2;
    ctx.fillStyle = style.color || 'white';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let py = 0; py < tokenTextHeight; py++) {
        for (let px = 0; px < tokenTextWidth; px++) {
            if (Math.random() < 0.3) {
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a persistent, non-animating static noise overlay.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawStaticnoiseEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let py = 0; py < tokenTextHeight; py++) {
        for (let px = 0; px < tokenTextWidth; px++) {
            if (Math.random() < 0.3) {
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with subtle horizontal scanlines.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawScanlinesEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let i = 0; i < tokenTextHeight; i += 2) {
        ctx.fillRect(x, y + i, tokenTextWidth, 1);
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with its colors inverted.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawInverseEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, tokenTextWidth, tokenTextHeight);
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a chaotic, randomized distortion effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawGlitchEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        for (let j = 0; j < 3; j++) {
            const offsetX = (Math.random() - 0.5) * 5;
            const offsetY = (Math.random() - 0.5) * 5;
            const alpha = 0.5 + Math.random() * 0.5;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
            ctx.fillText(char, x + currentXOffset + offsetX, y + offsetY);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a raised or debossed appearance.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawEmbossEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [highlightColor, shadowColor, depthStr] = (typeof style.emboss === 'string' ? style.emboss : '#FFFFFF,#555555,2').split(',');
    const depth = parseInt(depthStr) || 2;
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.shadowColor = shadowColor || 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = depth;
        ctx.shadowOffsetY = depth;
        ctx.fillStyle = highlightColor || 'white';
        ctx.fillText(char, x + currentXOffset, y);

        ctx.shadowColor = highlightColor || 'rgba(255,255,255,0.7)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = -depth;
        ctx.shadowOffsetY = -depth;
        ctx.fillStyle = shadowColor || 'rgba(0,0,0,0.7)';
        ctx.fillText(char, x + currentXOffset, y);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a blurred, refractive glass-like quality.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawGlassEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [blurAmountStr, reflectOpacityStr] = (typeof style.glass === 'string' ? style.glass : '3,0.2').split(',');
    const blurAmount = parseFloat(blurAmountStr) || 3;
    const reflectOpacity = parseFloat(reflectOpacityStr) || 0.2;
    ctx.fillStyle = style.color || 'white';
    ctx.filter = `blur(${blurAmount}px)`;
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }
    ctx.filter = 'none';
    ctx.save();
    ctx.globalAlpha = reflectOpacity;
    const gradient = ctx.createLinearGradient(x, y, x, y + tokenTextHeight);
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, tokenTextWidth, tokenTextHeight);
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a liquid dripping effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawDrippingEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const [dripColor, dripSpeedStr] = (typeof style.dripping === 'string' ? style.dripping : 'red,50').split(',');
    const speed = parseFloat(dripSpeedStr) || 50;
    const chosenDripColor = dripColor || 'red';
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = x + currentXOffset;

        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, charX, y);

        const dripHeight = (Math.sin(currentTime / speed + i * 0.5) + 1) / 2 * (baseFontSize * 0.8);
        const dripOffset = (Math.random() - 0.5) * 2;
        ctx.fillStyle = chosenDripColor;
        ctx.fillRect(charX + charWidth / 2 + dripOffset, y + baseFontSize, 2, dripHeight);
        currentXOffset += charWidth;
    }
    ctx.restore();
    return currentXOffset;
};

/**
 * Draws text with a matrix rain effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawMatrixrainEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const rainColor = typeof style.matrixrain === 'string' ? style.matrixrain : '#00FF00';
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = rainColor;
    for (let i = 0; i < tokenTextWidth; i += 5) {
        const rainLen = Math.random() * tokenTextHeight;
        const rainStart = (currentTime / 10 + i * 5) % (tokenTextHeight + rainLen) - rainLen;
        ctx.fillRect(x + i, y + rainStart, 3, rainLen);
    }
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};

/**
 * Draws text with a reflection effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text to draw.
 * @param {number} x - The x-coordinate for the text.
 * @param {number} y - The y-coordinate for the text.
 * @param {string} font - The font string to use for drawing.
 * @param {object} style - The style object from the token.
 * @param {number} currentTime - Current animation time in milliseconds.
 * @param {number} baseFontSize - The base font size for the current text block.
 * @param {number} tokenTextWidth - The width of the text segment.
 * @param {number} tokenTextHeight - The height of the text segment.
 * @param {function} hexToRgb - Utility to convert hex to RGB.
 * @returns {number} The width consumed by the drawn text.
 */
export const drawReflectEffect = (ctx, text, x, y, font, style, currentTime, baseFontSize, tokenTextWidth, tokenTextHeight, hexToRgb) => {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const offsetY = parseFloat(typeof style.reflect === 'string' ? style.reflect : (baseFontSize * 1.5)) || baseFontSize * 1.5;
    
    let currentXOffset = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.fillStyle = style.color || 'white';
        ctx.fillText(char, x + currentXOffset, y);
        currentXOffset += charWidth;
    }

    ctx.save();
    ctx.translate(0, y * 2 + offsetY + tokenTextHeight);
    ctx.scale(1, -1);
    ctx.globalAlpha = 0.3;
    ctx.fillText(text, x, -(y + tokenTextHeight));
    ctx.restore();
    ctx.restore();
    return tokenTextWidth;
};
