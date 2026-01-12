/**
 * Version Checker UI Component
 * Provides a UI for displaying version information and manually clearing cache
 */

import { versionChecker } from './versionChecker.js';

export class VersionCheckerUI {
    constructor(options = {}) {
        this.container = options.container || null;
        this.position = options.position || 'bottom-right'; // bottom-right, bottom-left, top-right, top-left
        this.showOnVersionChange = options.showOnVersionChange !== false;
        this.autoHideDelay = options.autoHideDelay || 5000; // ms
        this.element = null;
    }

    /**
     * Creates the UI element
     */
    createElement() {
        if (this.element) return this.element;

        const positionStyles = {
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;'
        };

        const div = document.createElement('div');
        div.id = 'version-checker-ui';
        div.style.cssText = `
            position: fixed;
            ${positionStyles[this.position] || positionStyles['bottom-right']}
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 13px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            min-width: 250px;
            max-width: 350px;
            display: none;
            backdrop-filter: blur(10px);
        `;

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 14px;">Version Checker</strong>
                <button id="version-close-btn" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
            <div id="version-info" style="margin-bottom: 12px; line-height: 1.6;">
                <div><strong>Current:</strong> <span id="current-version">Loading...</span></div>
                <div><strong>Stored:</strong> <span id="stored-version">Loading...</span></div>
                <div id="version-status" style="margin-top: 8px; padding: 6px; border-radius: 4px; font-size: 12px;"></div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="clear-cache-btn" style="
                    flex: 1;
                    background: #d32f2f;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: background 0.2s;
                ">Clear Cache</button>
                <button id="refresh-version-btn" style="
                    flex: 1;
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: background 0.2s;
                ">Refresh</button>
            </div>
        `;

        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            #clear-cache-btn:hover { background: #b71c1c !important; }
            #refresh-version-btn:hover { background: #1565c0 !important; }
            #clear-cache-btn:active, #refresh-version-btn:active { transform: scale(0.98); }
        `;
        document.head.appendChild(style);

        // Attach event listeners
        div.querySelector('#version-close-btn').addEventListener('click', () => this.hide());
        div.querySelector('#clear-cache-btn').addEventListener('click', () => this.clearCache());
        div.querySelector('#refresh-version-btn').addEventListener('click', () => this.refreshVersion());

        this.element = div;
        return div;
    }

    /**
     * Updates the version information in the UI
     */
    async updateVersionInfo() {
        const info = await versionChecker.getVersionInfo();
        
        if (!this.element) return;

        const currentVersionEl = this.element.querySelector('#current-version');
        const storedVersionEl = this.element.querySelector('#stored-version');
        const statusEl = this.element.querySelector('#version-status');

        currentVersionEl.textContent = info.currentVersion || 'Unknown';
        storedVersionEl.textContent = info.storedVersion || 'None';

        // Update status
        if (info.isFirstRun) {
            statusEl.textContent = '✓ First run - Version tracked';
            statusEl.style.background = '#2196f3';
        } else if (info.match) {
            statusEl.textContent = '✓ Up to date';
            statusEl.style.background = '#4caf50';
        } else {
            statusEl.textContent = '⚠ Version mismatch detected';
            statusEl.style.background = '#ff9800';
        }
    }

    /**
     * Shows the UI
     */
    async show() {
        if (!this.element) {
            const container = this.container || document.body;
            container.appendChild(this.createElement());
        }

        await this.updateVersionInfo();
        this.element.style.display = 'block';
    }

    /**
     * Hides the UI
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * Toggles the UI visibility
     */
    async toggle() {
        if (this.element && this.element.style.display === 'block') {
            this.hide();
        } else {
            await this.show();
        }
    }

    /**
     * Clears cache and shows confirmation
     */
    async clearCache() {
        const clearBtn = this.element.querySelector('#clear-cache-btn');
        const originalText = clearBtn.textContent;
        
        clearBtn.textContent = 'Clearing...';
        clearBtn.disabled = true;

        try {
            await versionChecker.forceUpdate();
            
            // Show success feedback
            const statusEl = this.element.querySelector('#version-status');
            statusEl.textContent = '✓ Cache cleared! Reloading...';
            statusEl.style.background = '#4caf50';

            // Reload page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error clearing cache:', error);
            clearBtn.textContent = 'Error!';
            setTimeout(() => {
                clearBtn.textContent = originalText;
                clearBtn.disabled = false;
            }, 2000);
        }
    }

    /**
     * Refreshes version information
     */
    async refreshVersion() {
        const refreshBtn = this.element.querySelector('#refresh-version-btn');
        const originalText = refreshBtn.textContent;
        
        refreshBtn.textContent = 'Loading...';
        refreshBtn.disabled = true;

        try {
            await this.updateVersionInfo();
        } finally {
            setTimeout(() => {
                refreshBtn.textContent = originalText;
                refreshBtn.disabled = false;
            }, 500);
        }
    }

    /**
     * Shows a notification when version changes
     */
    async showVersionChangeNotification(oldVersion, newVersion) {
        await this.show();
        
        const statusEl = this.element.querySelector('#version-status');
        statusEl.textContent = `🎉 Updated: ${oldVersion} → ${newVersion}`;
        statusEl.style.background = '#9c27b0';

        // Auto-hide after delay
        if (this.autoHideDelay > 0) {
            setTimeout(() => this.hide(), this.autoHideDelay);
        }
    }

    /**
     * Destroys the UI element
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }
}

/**
 * Creates a keyboard shortcut to toggle the version checker UI
 * Default: Ctrl+Shift+V
 */
export function setupVersionCheckerShortcut(ui, key = 'KeyV', modifiers = { ctrl: true, shift: true }) {
    document.addEventListener('keydown', (event) => {
        const ctrlMatch = !modifiers.ctrl || (event.ctrlKey || event.metaKey);
        const shiftMatch = !modifiers.shift || event.shiftKey;
        const altMatch = !modifiers.alt || event.altKey;

        if (event.code === key && ctrlMatch && shiftMatch && altMatch) {
            event.preventDefault();
            ui.toggle();
        }
    });
}

/**
 * Initializes version checker UI with automatic version change detection
 */
export async function initializeVersionCheckerUI(options = {}) {
    const ui = new VersionCheckerUI(options);
    
    // Set up keyboard shortcut
    if (options.enableShortcut !== false) {
        setupVersionCheckerShortcut(ui, options.shortcutKey, options.shortcutModifiers);
    }

    // Check version and show notification if changed
    const result = await versionChecker.checkVersion();
    
    if (result.hasChanged && ui.showOnVersionChange) {
        await ui.showVersionChangeNotification(result.storedVersion, result.currentVersion);
    }

    // Expose to window for debugging
    if (options.exposeGlobal !== false) {
        window.versionCheckerUI = ui;
    }

    return ui;
}

export default VersionCheckerUI;
