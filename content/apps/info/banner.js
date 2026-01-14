import { BaseBanner } from '/content/common/banners/BaseBanner.js';

export class InfoBanner extends BaseBanner {
    constructor(canvasElement, options = {}) {
        super(canvasElement, options);
    }

    async transitionIn() {
        const ctx = this.canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0c29');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw info icon (simple 'i' in circle)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 40;
        
        // Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#5BC0DE';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 'i' letter
        ctx.fillStyle = '#5BC0DE';
        ctx.font = 'bold 48px "Rodin", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('i', centerX, centerY + 5);
        
        // App name
        ctx.font = 'bold 16px "Rodin", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('System Info', centerX, this.canvas.height - 30);
        
        return super.transitionIn();
    }

    async transitionOut() {
        return super.transitionOut();
    }
}

export async function loadBanner(canvasElement, options = {}) {
    const banner = new InfoBanner(canvasElement, options);
    await banner.transitionIn();
    return banner;
}
