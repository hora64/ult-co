import { Material } from "../Material.js";

const colorDefinitions = {
    red: {
        default: { from: '#A52A2A', to: '#8B0000' },
        pressed: { from: '#8B0000', to: '#6B0000' },
        hover: { from: '#A52A2A', to: '#8B0000' }
    },
    green: {
        default: { from: '#2E8B57', to: '#006400' },
        pressed: { from: '#006400', to: '#004D00' },
        hover: { from: '#2E8B57', to: '#006400' }
    },
    blue: {
        default: { from: '#4169E1', to: '#0000CD' },
        pressed: { from: '#0000CD', to: '#00008B' },
        hover: { from: '#4169E1', to: '#0000CD' }
    },
    yellow: {
        default: { from: '#F0E68C', to: '#BDB76B' },
        pressed: { from: '#BDB76B', to: '#808000' },
        hover: { from: '#F0E68C', to: '#BDB76B' }
    },
    pink: {
        default: { from: '#DB7093', to: '#C71585' },
        pressed: { from: '#C71585', to: '#8B008B' },
        hover: { from: '#DB7093', to: '#C71585' }
    },
    purple: {
        default: { from: '#9932CC', to: '#8A2BE2' },
        pressed: { from: '#8A2BE2', to: '#4B0082' },
        hover: { from: '#9932CC', to: '#8A2BE2' }
    },
    default: {
        default: { from: '#555555', to: '#333333' },
        pressed: { from: '#333333', to: '#111111' },
        hover: { from: '#555555', to: '#333333' }
    }
};

export class StaticColorEffect extends Material {
    constructor(options = {}) {
        super(options);
        this.isAnimated = false;
        this.colorType = this.options.colorType || 'default';
        this.useGradient = this.options.useGradient || false;
    }

    apply(ctx, x, y, width, height, text) {
        const baseFontSize = parseInt(ctx.font);
        
        ctx.save();

        if (this.useGradient) {
            const gradientDef = this.getGradientDefinition(this.colorType);
            const gradient = ctx.createLinearGradient(x, y, x, y + baseFontSize);
            gradient.addColorStop(0, gradientDef.colors[0]);
            gradient.addColorStop(1, gradientDef.colors[1]);
            ctx.fillStyle = gradient;
        } else {
            const colorDef = this.getSolidDefinition(this.colorType);
            ctx.fillStyle = colorDef.color;
        }
        
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    getSolidDefinition(type = 'default', state = 'default') {
        const colorSet = colorDefinitions[type] || colorDefinitions.default;
        const stateColors = colorSet[state] || colorSet.default;

        return {
            color: stateColors.from
        };
    }

    getGradientDefinition(type = 'default', state = 'default') {
        const colorSet = colorDefinitions[type] || colorDefinitions.default;
        const stateColors = colorSet[state] || colorSet.default;

        return {
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            colors: [stateColors.from, stateColors.to],
            stops: [0, 1]
        };
    }
}
