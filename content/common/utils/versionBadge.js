/**
 * Version Badge Component
 * A simple, reusable version display badge that can be added to any page
 */

import { versionChecker } from './versionChecker.js';

export class VersionBadge {
    constructor(options = {}) {
        this.position = options.position || 'bottom-right';
        this.style = options.style || 'default'; // 'default', 'minimal', 'badge', 'corner'
        this.showUpdateIndicator = options.showUpdateIndicator !== false;
        this.onClick = options.onClick || null;
        this.element = null;
    }

    /**
     * Creates and returns the badge element
     */
    async create() {
        const info = await versionChecker.getVersionInfo();
        const version = info.currentVersion || 'Unknown';
        const needsUpdate = !info.match && !info.isFirstRun;

        const badge = document.createElement('div');
        badge.className = 'version-badge';
        
        // Apply styles based on badge style type
        switch (this.style) {
            case 'minimal':
                badge.style.cssText = this.getMinimalStyles();
                badge.innerHTML = `v${version}`;
                break;
            
            case 'badge':
                badge.style.cssText = this.getBadgeStyles();
                badge.innerHTML = `
                    <span style="opacity: 0.7;">v</span>${version}
                    ${needsUpdate ? '<span style="margin-left: 4px;">🔴</span>' : ''}
                `;
                break;
            
            case 'corner':
                badge.style.cssText = this.getCornerStyles();
                badge.innerHTML = `
                    <div style="transform: rotate(-45deg); text-align: center; margin-top: 12px;">
                        v${version}
                    </div>
                `;
                break;
            
            default: // 'default'
                badge.style.cssText = this.getDefaultStyles();
                badge.innerHTML = `
                    <div style="font-size: 10px; opacity: 0.6; margin-bottom: 2px;">VERSION</div>
                    <div style="font-weight: 600;">${version}</div>
                    ${needsUpdate ? '<div style="font-size: 9px; color: #ff6b6b; margin-top: 2px;">UPDATE AVAILABLE</div>' : ''}
                `;
        }

        // Apply position
        this.applyPosition(badge);

        // Add click handler
        if (this.onClick) {
            badge.style.cursor = 'pointer';
            badge.addEventListener('click', () => this.onClick(info));
        }

        // Add hover effect
        badge.addEventListener('mouseenter', () => {
            badge.style.transform = 'scale(1.05)';
        });
        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'scale(1)';
        });

        this.element = badge;
        return badge;
    }

    /**
     * Inserts the badge into the DOM
     */
    async render(container = document.body) {
        if (!this.element) {
            await this.create();
        }
        container.appendChild(this.element);
        return this.element;
    }

    /**
     * Updates the badge content
     */
    async update() {
        if (!this.element) return;
        const parent = this.element.parentNode;
        this.element.remove();
        this.element = null;
        await this.render(parent);
    }

    /**
     * Removes the badge from DOM
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }

    // Style definitions
    getDefaultStyles() {
        return `
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11px;
            text-align: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
            transition: transform 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        `;
    }

    getMinimalStyles() {
        return `
            position: fixed;
            color: rgba(255, 255, 255, 0.5);
            padding: 4px 8px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 10px;
            z-index: 9999;
            transition: transform 0.2s ease;
            pointer-events: auto;
        `;
    }

    getBadgeStyles() {
        return `
            position: fixed;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11px;
            font-weight: 600;
            z-index: 9999;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        `;
    }

    getCornerStyles() {
        return `
            position: fixed;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            transition: transform 0.2s ease;
        `;
    }

    applyPosition(element) {
        const positions = {
            'top-left': { top: '10px', left: '10px' },
            'top-right': { top: '10px', right: '10px' },
            'bottom-left': { bottom: '10px', left: '10px' },
            'bottom-right': { bottom: '10px', right: '10px' },
            'top-center': { top: '10px', left: '50%', transform: 'translateX(-50%)' },
            'bottom-center': { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }
        };

        if (this.style === 'corner') {
            // Special positioning for corner style
            const cornerPositions = {
                'top-left': { top: '0', left: '0' },
                'top-right': { top: '0', right: '0' },
                'bottom-left': { bottom: '0', left: '0' },
                'bottom-right': { bottom: '0', right: '0' }
            };
            Object.assign(element.style, cornerPositions[this.position] || cornerPositions['top-right']);
        } else {
            Object.assign(element.style, positions[this.position] || positions['bottom-right']);
        }
    }
}

/**
 * Quick utility functions
 */

/**
 * Adds a simple version badge to the page
 */
export async function addVersionBadge(options = {}) {
    const badge = new VersionBadge(options);
    await badge.render();
    return badge;
}

/**
 * Adds a version badge with click to show version checker UI
 */
export async function addVersionBadgeWithUI(options = {}) {
    const { initializeVersionCheckerUI } = await import('./versionCheckerUI.js');
    
    let ui = null;
    
    const badge = new VersionBadge({
        ...options,
        onClick: async () => {
            if (!ui) {
                ui = await initializeVersionCheckerUI({
                    position: options.position || 'bottom-right'
                });
            }
            await ui.toggle();
        }
    });
    
    await badge.render();
    return badge;
}

/**
 * Pre-configured badge styles
 */
export const BadgePresets = {
    // Subtle corner badge
    subtle: {
        style: 'minimal',
        position: 'bottom-right'
    },
    
    // Prominent badge with gradient
    prominent: {
        style: 'badge',
        position: 'bottom-right',
        showUpdateIndicator: true
    },
    
    // Classic info box
    classic: {
        style: 'default',
        position: 'bottom-left',
        showUpdateIndicator: true
    },
    
    // Corner ribbon
    ribbon: {
        style: 'corner',
        position: 'top-right'
    }
};

// Example usage in HTML:
/*
<script type="module">
    import { addVersionBadge, BadgePresets } from './versionBadge.js';
    
    // Simple badge
    addVersionBadge(BadgePresets.subtle);
    
    // Badge with click handler
    addVersionBadge({
        style: 'badge',
        position: 'bottom-right',
        onClick: (info) => {
            alert(`Version: ${info.currentVersion}`);
        }
    });
    
    // Badge that opens version checker UI
    import { addVersionBadgeWithUI } from './versionBadge.js';
    addVersionBadgeWithUI(BadgePresets.prominent);
</script>
*/

export default VersionBadge;
