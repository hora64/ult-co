import { Material } from "../Material.js";

const gemstoneColors = {
    diamond: {
        light: '#6BE8F7', // Minecraft blue light
        base: '#41C7F0',  // Minecraft blue base
        medium: '#2B96E8', // Minecraft blue medium
        dark: '#1F69C9'   // Minecraft blue dark
    },
    ruby: {
        light: '#FF3333',
        base: '#FF1744',
        medium: '#D50000',
        dark: '#8E0000'
    },
    sapphire: {
        light: '#3366E8',
        base: '#2962FF',
        medium: '#0D47A1',
        dark: '#002171'
    },
    emerald: {
        light: '#4CAF50',
        base: '#00E676',
        medium: '#00C853',
        dark: '#00692C'
    },
    amethyst: {
        light: '#C67FFF',
        base: '#BA68C8',
        medium: '#9C27B0',
        dark: '#6A008A'
    },
    topaz: {
        light: '#FFC040',
        base: '#FFC107',
        medium: '#FF8F00',
        dark: '#C56000'
    },
    onyx: {
        light: '#A9A9A9',
        base: '#696969',
        medium: '#404040',
        dark: '#000000'
    },
    jade: {
        light: '#8FBC8F',
        base: '#3CB371',
        medium: '#2E8B57',
        dark: '#006400'
    },
    citrine: {
        light: '#FFD700',
        base: '#FFC107',
        medium: '#FFA000',
        dark: '#FF6F00'
    },
    garnet: {
        light: '#C04040',
        base: '#A03030',
        medium: '#8B0000',
        dark: '#600000'
    },
    aquamarine: {
        light: '#B0E0E6',
        base: '#7FFFD4',
        medium: '#40E0D0',
        dark: '#008B8B'
    },
    peridot: {
        light: '#E6E200',
        base: '#D4CD00',
        medium: '#A79E00',
        dark: '#7F7700'
    },
    opal: {
        light: '#FFFFFF',
        base: '#E0E7FF',
        medium: '#C0D0FF',
        dark: '#A0B8FF'
    },
    tourmaline: {
        light: '#FF80AB',
        base: '#FF4081',
        medium: '#F50057',
        dark: '#C51162'
    },
    pearl: {
        light: '#FDF5E6',
        base: '#F5DEB3',
        medium: '#DEB887',
        dark: '#CD853F'
    }
};

export class StaticGemstoneEffect extends Material {
    constructor(app, options = {}) {
        super(app, options);
        this.name = "staticgemstone";
        this.regex = /\{staticgemstone:([^|]+?)\|([^}]+?)\}/g;
        this.isAnimated = false;
    }

    parse(match) {
        const gemType = match[1] || 'diamond';
        const text = match[2];
        return {
            text,
            style: {
                [this.name]: gemType,
            },
        };
    }

    apply(ctx, text, x, y, token, baseFontSize) {
        const gemType = token.style[this.name] || 'diamond';
        const colors = gemstoneColors[gemType] || gemstoneColors.diamond;
        
        ctx.save();

        // Get and apply the correct font (with Chinese support if needed)
        const originalFont = this._getContextFont(ctx);
        this._setContextFont(ctx, originalFont);

        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        // --- Add Outline (before the fill) ---
        ctx.strokeStyle = colors.medium;
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);

        // --- Main Faceted Gradient ---
        const gradient = ctx.createLinearGradient(x, y, x + textWidth, y + baseFontSize);
        gradient.addColorStop(0, colors.light);
        gradient.addColorStop(0.4, colors.base);
        gradient.addColorStop(0.5, colors.medium);
        gradient.addColorStop(1, colors.dark);

        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);

        // --- Curved Shine (Radial Gradient) ---
        const shineGradient = ctx.createRadialGradient(
            x + textWidth * 0.5,
            y + baseFontSize * 0.5,
            0,
            x + textWidth * 0.5,
            y + baseFontSize * 0.5,
            textWidth * 0.75
        );
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = shineGradient;
        ctx.fillText(text, x, y);

        ctx.restore();
        return true;
    }
}
