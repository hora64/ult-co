function darkenColor(hex, amount) {
    if (!hex) return 'rgb(0,0,0)';
    const num = parseInt(hex.replace('#', ''), 16);
    let r = Math.floor((num >> 16) * (1 - amount));
    let g = Math.floor(((num >> 8) & 0x00FF) * (1 - amount));
    let b = Math.floor((num & 0x0000FF) * (1 - amount));
    r = Math.max(0, r);
    g = Math.max(0, g);
    b = Math.max(0, b);
    return `rgb(${r},${g},${b})`;
}

function lightenColor(hex, amount) {
    if (!hex) return 'rgb(255,255,255)';
    const num = parseInt(hex.replace('#', ''), 16);
    let r = Math.floor((num >> 16) * (1 + amount));
    let g = Math.floor(((num >> 8) & 0x00FF) * (1 + amount));
    let b = Math.floor((num & 0x0000FF) * (1 + amount));
    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);
    return `rgb(${r},${g},${b})`;
}

function adjustBrightness(hex, percent) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
    const newG = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
    const newB = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function toGrayscale(hex) {
    if (!hex.startsWith('#') || hex.length !== 7) {
        return hex; // Return original if not a valid hex color
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const grayHex = l.toString(16).padStart(2, '0');
    return `#${grayHex}${grayHex}${grayHex}`;
}

export class Color {
    constructor(hex) {
        this.hex = hex;
        if (!this.hex.startsWith('#')) {
            this.hex = `#${this.hex}`;
        }
        this._updateRgbFromHex();
    }

    _updateRgbFromHex() {
        const hex = this.hex.replace('#', '');
        const num = parseInt(hex, 16);
        this.r = (num >> 16) & 255;
        this.g = (num >> 8) & 255;
        this.b = num & 255;
    }

    _updateHexFromRgb() {
        const toHex = (c) => `0${c.toString(16)}`.slice(-2);
        this.hex = `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }

    static fromHex(hex) {
        return new Color(hex);
    }

    lighten(amount) {
        this.r = Math.min(255, Math.max(0, Math.round(this.r * (1 + amount))));
        this.g = Math.min(255, Math.max(0, Math.round(this.g * (1 + amount))));
        this.b = Math.min(255, Math.max(0, Math.round(this.b * (1 + amount))));
        this._updateHexFromRgb();
        return this;
    }

    toRgba(alpha = 1) {
        return `rgba(${this.r},${this.g},${this.b},${alpha})`;
    }

    toHex() {
        return this.hex;
    }
}

export { darkenColor, lightenColor, adjustBrightness, toGrayscale };
