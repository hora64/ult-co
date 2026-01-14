export class Material {
    constructor(app, options = {}) {
        if (this.constructor === Material) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.app = app;
        this.options = options;
        this.name = '';
        this.regex = null;
        this.isAnimated = false;    
    }

    /**
     * Retrieves the type name of the material.
     * @returns {string} The name of the material.
     */
    getMaterialType() {
        return this.name;
    }

    /**
     * Retrieves a material class by its name.
     * This method is intended to be implemented by a manager class that has knowledge of all materials.
     * @param {string} name - The name of the material to retrieve.
     * @returns {typeof Material|null} The material class constructor or null if not found.
     */
    getMaterial(name) {
        throw new Error("Method 'getMaterial()' must be implemented.");
    }

    parse(match) {
        throw new Error("Method 'parse()' must be implemented.");
    }

    apply(ctx, x, y, width, height, text) {
        throw new Error("Method 'apply()' must be implemented.");
    }

    update(deltaTime) {
        throw new Error("Method 'update()' must be implemented.");
    }

    /**
     * Gets the appropriate font for rendering, respecting language-specific font requirements.
     * This ensures Chinese text uses DFPHeiW5-GB font and other languages use their configured fonts.
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @returns {string} The font string to use for rendering
     */
    _getContextFont(ctx) {
        if (!ctx || !ctx.font) {
            return ctx.font || '16px sans-serif';
        }

        let font = ctx.font;
        
        // Check if we should use Chinese font
        if (this.app && this.app.chineseFontLoaded) {
            const userLanguage = this.app.language || localStorage.getItem("userLanguage") || "en-US";
            if (userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant' || userLanguage === 'x-debug-zh-Hans-CN') {
                // Replace Rodin and other fonts with Chinese font
                font = font
                    .replace(/(['"]?)FOT-RodinNTLG Pro DB\1/g, '"DFPHeiW5-GB"')
                    .replace(/\bFOT-RodinNTLG Pro DB\b/g, 'DFPHeiW5-GB')
                    .replace(/(['"]?)Rodin\1/g, '"DFPHeiW5-GB"')
                    .replace(/\bRodin\b/g, 'DFPHeiW5-GB');
            }
        }
        
        return font;
    }

    /**
     * Sets the font on the context, respecting language-specific requirements.
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {string} font - The font string to set (will be adjusted for Chinese if needed)
     */
    _setContextFont(ctx, font) {
        if (!ctx) return;
        
        let adjustedFont = font;
        
        // Check if we should use Chinese font
        if (this.app && this.app.chineseFontLoaded) {
            const userLanguage = this.app.language || localStorage.getItem("userLanguage") || "en-US";
            if (userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant' || userLanguage === 'x-debug-zh-Hans-CN') {
                // Replace Rodin and other fonts with Chinese font
                adjustedFont = font
                    .replace(/(['"]?)FOT-RodinNTLG Pro DB\1/g, '"DFPHeiW5-GB"')
                    .replace(/\bFOT-RodinNTLG Pro DB\b/g, 'DFPHeiW5-GB')
                    .replace(/(['"]?)Rodin\1/g, '"DFPHeiW5-GB"')
                    .replace(/\bRodin\b/g, 'DFPHeiW5-GB');
            }
        }
        
        ctx.font = adjustedFont;
    }

    hexToRgb(hex) {
        if (!hex) return { r: 255, g: 255, b: 255 };
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255 };
        }
        const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        }
        // Fallback for named colors or other formats by using canvas
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = hex;
        const color = tempCtx.fillStyle; // This will be in #rrggbb format
        if (/^#/.test(color)) {
             return this.hexToRgb(color);
        }
        return { r: 255, g: 255, b: 255 }; // Default fallback
    }
}
