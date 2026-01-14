/**
 * Simple permission utilities
 * 
 * Permission Levels:
 * 0 - Public (no restrictions)
 * 1 - Debug (requires localStorage Debug='true')
 * 2 - Admin (requires localhost + Admin password hash match)
 */

// SHA-256 hash of the admin password
const ADMIN_PASSWORD_HASH = 'fb5ba50b7880c1c972baa079dc990f8ea73b1d528beedd4cf46cfdd0214117a7';

/**
 * Get current user's permission level
 * @returns {number} Permission level (0-2)
 */
export function getPermissionLevel() {
    // Check for admin level (2)
    if (isLocalhost() && isAdminAuthenticated()) {
        return 2;
    }
    
    // Check for debug level (1)
    if (localStorage.getItem('Debug') === 'true') {
        return 1;
    }
    
    // Default to public level (0)
    return 0;
}

/**
 * Check if running on localhost
 * @returns {boolean}
 */
function isLocalhost() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '[::1]' ||
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.match(/^172\.(1[6-9]|2\d|3[01])\./);
}

/**
 * Check if admin is authenticated via password hash
 * @returns {boolean}
 */
function isAdminAuthenticated() {
    const storedHash = localStorage.getItem('Admin');
    return storedHash === ADMIN_PASSWORD_HASH;
}

/**
 * Authenticate admin with password
 * @param {string} password - Plain text password to check
 * @returns {Promise<boolean>} True if authentication successful
 */
export async function authenticateAdmin(password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        if (hashHex === ADMIN_PASSWORD_HASH) {
            localStorage.setItem('Admin', hashHex);
            console.log('Admin authenticated successfully');
            return true;
        } else {
            console.warn('Invalid admin password');
            return false;
        }
    } catch (error) {
        console.error('Error authenticating admin:', error);
        return false;
    }
}

/**
 * Logout admin
 */
export function logoutAdmin() {
    localStorage.removeItem('Admin');
    console.log('Admin logged out');
}

/**
 * Enable debug mode
 */
export function enableDebug() {
    localStorage.setItem('Debug', 'true');
    console.log('Debug mode enabled');
}

/**
 * Disable debug mode
 */
export function disableDebug() {
    localStorage.removeItem('Debug');
    console.log('Debug mode disabled');
}

/**
 * Check if app should be visible based on permission level
 * @param {Object} app - App object with permissions
 * @returns {boolean} True if app should be visible
 */
export function canViewApp(app) {
    const level = app.permissions?.level ?? 0;
    
    // Level 3 (disabled) - never visible
    if (level === 3) {
        return false;
    }
    
    const currentLevel = getPermissionLevel();
    return currentLevel >= level;
}

/**
 * Check if app can be launched
 * @param {Object} app - App object with permissions
 * @returns {boolean} True if app can be launched
 */
export function canLaunchApp(app) {
    if (!canViewApp(app)) {
        return false;
    }
    
    return app.permissions?.launchable !== false;
}

// Expose utilities to window for console access
if (typeof window !== 'undefined') {
    window.getPermissionLevel = getPermissionLevel;
    window.enableDebug = enableDebug;
    window.disableDebug = disableDebug;
    window.authenticateAdmin = authenticateAdmin;
    window.logoutAdmin = logoutAdmin;
}
