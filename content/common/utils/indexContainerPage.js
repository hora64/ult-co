// --- Global State for App Resolution ---
import { versionChecker } from './versionChecker.js';

let currentResolution = {
    width: 400,
    height: 480,
    scale: 'fit'
};

// --- Configuration Manager ---
/**
 * Loads app configuration from the appropriate home screen
 * Supports multiple home screens (3DS, WiiU, etc.) each with their own config
 */
class ConfigManager {
    constructor() {
        this.configs = new Map();
        this.defaultHomeScreen = 'homeScreen_3DS';
    }

    /**
     * Loads configuration from a specific home screen app
     * @param {string} homeScreenId - The home screen app ID (e.g., 'homeScreen_3DS', 'homeScreen_WiiU')
     * @returns {Promise<Object>} The configuration object
     */
    async loadConfig(homeScreenId = this.defaultHomeScreen) {
        // Check if already loaded
        if (this.configs.has(homeScreenId)) {
            return this.configs.get(homeScreenId);
        }

        try {
            // Try to load the config from the home screen's config directory
            const configPath = `/content/apps/${homeScreenId}/config/config.js`;
            console.log(`Loading config from: ${configPath}`);
            
            const module = await import(configPath);
            
            const config = {
                appsConfig: module.appsConfig,
                appFolders: module.appFolders || (module.getEnabledAppFolders ? module.getEnabledAppFolders() : []),
                getEnabledAppFolders: module.getEnabledAppFolders,
                themeDefaults: module.themeDefaults,
                gridConfig: module.gridConfig,
                homeScreenId
            };

            this.configs.set(homeScreenId, config);
            console.log(`✅ Loaded config for ${homeScreenId}:`, {
                totalApps: config.appsConfig?.apps?.length || 0,
                enabledApps: config.appFolders?.length || 0
            });

            return config;
        } catch (error) {
            console.error(`Failed to load config for ${homeScreenId}:`, error);
            
            // Fallback: try to load from default home screen if not already trying
            if (homeScreenId !== this.defaultHomeScreen) {
                console.warn(`Falling back to default home screen config: ${this.defaultHomeScreen}`);
                return this.loadConfig(this.defaultHomeScreen);
            }
            
            throw error;
        }
    }

    /**
     * Loads configurations from all available home screens
     * @returns {Promise<Array>} Array of loaded configs
     */
    async loadAllConfigs() {
        const homeScreenIds = ['homeScreen_3DS', 'homeScreen_WiiU'];
        const configs = [];

        for (const homeScreenId of homeScreenIds) {
            try {
                const config = await this.loadConfig(homeScreenId);
                configs.push(config);
            } catch (error) {
                console.warn(`Could not load config for ${homeScreenId}, skipping`);
            }
        }

        return configs;
    }

    /**
     * Gets app folders from all loaded configs (merged list)
     * @returns {Array<string>} Combined array of app folder names
     */
    getAllAppFolders() {
        const allFolders = new Set();
        
        for (const config of this.configs.values()) {
            // Priority 1: Use appsConfig if available (to get ALL apps, even hidden/disabled ones)
            if (config.appsConfig && Array.isArray(config.appsConfig.apps)) {
                config.appsConfig.apps.forEach(app => {
                    if (app.folder) {
                        allFolders.add(app.folder);
                    }
                });
            }
            // Priority 2: Fallback to appFolders (legacy support)
            else if (config.appFolders) {
                config.appFolders.forEach(folder => allFolders.add(folder));
            }
        }

        return Array.from(allFolders);
    }

    /**
     * Gets a specific config by home screen ID
     * @param {string} homeScreenId - The home screen app ID
     * @returns {Object|null} The config object or null if not found
     */
    getConfig(homeScreenId) {
        return this.configs.get(homeScreenId) || null;
    }
}

const configManager = new ConfigManager();

// --- Create DOM Structure ---
function createContainerStructure() {
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #000;
            font-family: 'Inter', sans-serif;
        }

        .scaled-iframe-container {
            position: relative;

            transform-origin: top left;
            overflow: hidden;
        }

        .scaled-iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
            vertical-align: top;
        }

        #fadeOverlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease-in-out;
            z-index: 10;
        }

        #fadeOverlay.visible {
            opacity: 1;
            pointer-events: auto;
        }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.className = 'scaled-iframe-container';
    container.id = 'screenContent';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'appFrame';
    iframe.src = '';

    // Create fade overlay
    const overlay = document.createElement('div');
    overlay.id = 'fadeOverlay';

    // Assemble structure
    container.appendChild(iframe);
    container.appendChild(overlay);
    document.body.appendChild(container);
}

// --- Resize & Zoom Logic ---
// This function ensures the iframe content scales proportionally to the window size.
function updateZoomScale() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const screenContent = document.getElementById('screenContent');

    if (!screenContent) return;

    const width = currentResolution.width;
    const height = currentResolution.height;
    const scaleMode = currentResolution.scale;

    let scale, finalWidth, finalHeight;

    switch (scaleMode) {
        case 'fit':
            // Scale proportionally to fit within viewport
            const scaleX = vw / width;
            const scaleY = vh / height;
            scale = Math.min(scaleX, scaleY);
            finalWidth = width;
            finalHeight = height;
            break;

        case 'fill':
            // Scale to fill viewport (may crop)
            const fillScaleX = vw / width;
            const fillScaleY = vh / height;
            scale = Math.max(fillScaleX, fillScaleY);
            finalWidth = width;
            finalHeight = height;
            break;

        case 'native':
            // No scaling, display at original size
            scale = 1;
            finalWidth = width;
            finalHeight = height;
            break;

        case 'fullscreen':
            // Fill 100% of viewport width and height, no scaling or transforms
            scale = 1;
            finalWidth = vw;
            finalHeight = vh;
            
            // For fullscreen mode, override all positioning and transforms
            screenContent.style.width = '100%';
            screenContent.style.height = '100%';
            screenContent.style.transform = 'none';
            screenContent.style.left = '0';
            screenContent.style.top = '0';
            screenContent.style.position = 'fixed';
            
            console.log(`Resolution: FULLSCREEN mode - ${vw}x${vh}`);
            return; // Exit early to avoid applying default styles

        default:
            // Fallback to fit
            scale = Math.min(vw / width, vh / height);
            finalWidth = width;
            finalHeight = height;
    }

    // Update container size
    screenContent.style.width = `${finalWidth}px`;
    screenContent.style.height = `${finalHeight}px`;
    screenContent.style.transform = `scale(${scale})`;

    // Center the container
    const scaledWidth = finalWidth * scale;
    const scaledHeight = finalHeight * scale;
    screenContent.style.left = `calc(50% - ${scaledWidth / 2}px)`;
    screenContent.style.top = `calc(50% - ${scaledHeight / 2}px)`;
    screenContent.style.position = 'absolute';

    console.log(`Resolution: ${width}x${height}, Scale mode: ${scaleMode}, Scale factor: ${scale.toFixed(2)}, Final size: ${finalWidth}x${finalHeight}`);
}

/**
 * Updates the resolution and re-scales the container
 * @param {Object} resolution - Resolution object from app.js
 */
function setResolution(resolution) {
    if (resolution && resolution.width && resolution.height) {
        currentResolution = {
            width: resolution.width,
            height: resolution.height,
            scale: resolution.scale || 'fit'
        };

        updateZoomScale();
        console.log('Resolution updated:', currentResolution);
    }
}

/**
 * Loads route configuration from app.js modules dynamically
 * Uses merged app folders from all loaded home screen configs
 */
async function loadRoutesFromApps() {
    const routes = [];
    
    // Get all app folders from all loaded configs
    const appFolders = configManager.getAllAppFolders();
    
    if (appFolders.length === 0) {
        console.warn('No app folders found in loaded configs');
        return routes;
    }

    console.log(`Loading routes from ${appFolders.length} apps...`);

    for (const folder of appFolders) {
        try {
            const module = await import(`/content/apps/${folder}/app.js`);
            const app = module.app;

            if (app && app.route && app.route.enabled && app.route.regex) {
                routes.push({
                    regex: app.route.regex,
                    appPath: app.fileLocation,
                    appId: app.id,
                    resolution: app.resolution
                });
                console.log(`Loaded route for ${app.id}: ${app.route.regex}`);
            }
        } catch (error) {
            // Silently skip apps without modules or routes
        }
    }

    return routes;
}

/**
 * Loads miscellaneous routes from routeConfig.json
 */
async function loadMiscRoutes() {
    try {
        const response = await fetch('/routeConfig.json');
        const config = await response.json();
        return config.routes || [];
    } catch (error) {
        console.warn('Failed to load routeConfig.json:', error);
        return [];
    }
}

/**
 * Handles the initial loading of the iframe based on the URL path.
 * Checks if the URL contains a deep link to an app.
 */
async function handleInitialIframeLoad() {
    // Redirect from /index.html to / for cleaner URLs
    if (window.location.pathname.endsWith('/index.html')) {
        const newPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        window.history.replaceState({}, document.title, newPath);
    }

    const appFrame = document.getElementById('appFrame');
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    // Load routes from both app modules and routeConfig
    let allRoutes = [];
    try {
        const appRoutes = await loadRoutesFromApps();
        const miscRoutes = await loadMiscRoutes();
        allRoutes = [...appRoutes, ...miscRoutes];
        console.log(`Loaded ${allRoutes.length} routes total (${appRoutes.length} from apps, ${miscRoutes.length} misc)`);
    } catch (error) {
        console.error('Failed to load routes:', error);
        // Fallback to default home screen if the config fails to load
        appFrame.src = '/content/apps/homeScreen_3DS/homeScreen_3DS.html';
        return;
    }

    let appLoaded = false;

    // Iterate through the route configurations to find a match
    for (const route of allRoutes) {
        const regex = new RegExp(route.regex);
        const fullPath = pathname + hash;
        const match = fullPath.match(regex) || pathname.match(regex);

        if (match) {
            console.log(`[indexContainerPage] Route matched!`);
            console.log(`[indexContainerPage] Regex: ${route.regex}`);
            console.log(`[indexContainerPage] Full match:`, match);
            console.log(`[indexContainerPage] Captured groups:`, match.slice(1));
            
            appFrame.src = route.appPath;

            console.log(`Route matched: ${route.regex}. Loading app: ${route.appPath}`);
            
            // Set resolution if provided in route
            if (route.resolution) {
                setResolution(route.resolution);
                console.log(`Setting resolution from app config:`, route.resolution);
            }

            // Handle deep linking for apps with captured route parameters
            if (match.length > 1) {
                // For Windows app, we have two possible capture groups:
                // match[1] = slug from /windows#slug format
                // match[2] = slug from /#slug format
                // Use whichever one is defined
                const capturedParam = match[1] || match[2];
                
                if (capturedParam) {
                    console.log(`[indexContainerPage] Deep link parameter captured: "${capturedParam}"`);
                    
                    appFrame.onload = () => {
                        console.log(`[indexContainerPage] App iframe loaded, sending deep-link message`);
                        console.log(`[indexContainerPage] Sending slug: "${capturedParam}"`);
                        setTimeout(() => {
                            appFrame.contentWindow.postMessage({
                                type: 'deep-link',
                                slug: capturedParam
                            }, '*');
                            console.log(`[indexContainerPage] Deep-link message sent!`);
                        }, 500); // Small delay to ensure app is ready
                        appFrame.onload = null;
                    };
                }
            } else if (route.appPath.includes('windows.html') && hash) {
                // Windows app with hash parameter (legacy support)
                const hashParam = hash.substring(1);
                console.log(`[indexContainerPage] Windows app with hash: "${hashParam}"`);
                appFrame.onload = () => {
                    console.log('Windows iframe loaded, sending deep-link with hash:', hashParam);
                    setTimeout(() => {
                        appFrame.contentWindow.postMessage({
                            type: 'deep-link',
                            slug: hashParam
                        }, '*');
                    }, 500);
                    appFrame.onload = null;
                };
            } else {
                console.log(`[indexContainerPage] No deep link parameter captured (match length: ${match.length})`);
            }
            
            appLoaded = true;
            break; // Exit loop after the first match
        }
    }

    if (!appLoaded) {
        // If no route matches, load home screen regardless of path
        appFrame.src = '/content/apps/homeScreen_3DS/homeScreen_3DS.html';
        console.log('No route matched. Loading home screen.');
    }

    // Set up the onload listener for the iframe if not already set
    if (!appFrame.onload) {
        appFrame.onload = () => {
            console.log('Iframe loaded:', appFrame.src);
            appFrame.onload = null;
        };
    }
}

// --- Screenshot Function ---
// /**
//  * Takes a screenshot of the iframe's content and saves it as a PNG file.
//  */
function takeScreenshot() {
    const appFrame = document.getElementById('appFrame');
    const iframeDoc = appFrame.contentWindow.document;
    const node = iframeDoc.body;

    console.log('Taking screenshot with html-to-image...');

    htmlToImage.toPng(node, {
        width: appFrame.width,
        height: appFrame.height,
        // Ensures that external images are embedded
        fetchRequestInit: {
            mode: 'cors',
            credentials: 'omit'
        }
    })
        .then(function (dataUrl) {
            // Create a link to download the image
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'iframe-screenshot.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('Screenshot saved.');
        })
        .catch(function (error) {
            console.error('Error taking screenshot:', error);
        });
}

// --- Message Listener with Visual and Audio Fade Logic ---
// THIS IS THE CORE FEATURE FOR LOADING APPS BASED ON IFRAME MESSAGES.
function setupMessageListener() {
    window.addEventListener('message', (event) => {
        // For security, you should check the origin in a production environment
        // if (event.origin !== 'https://your-trusted-domain.com') return;

        const messageData = event.data;

        // Check for the message with type 'launchApp', as sent by your JSON's onClick function.
        if (messageData && messageData.type === 'launchApp') {

            // Send a message *back* to the current iframe to request an audio fade-out
            if (event.source) {
                event.source.postMessage({ type: 'requestAudioFade' }, event.origin);
            }

            const newLocation = messageData.location; // Get the new app location from the message
            const permissions = messageData.permissions; // Get permissions data
            const resolution = messageData.resolution; // Get resolution data
            const appFrame = document.getElementById('appFrame');
            const overlay = document.getElementById('fadeOverlay');

            console.log('Launch app message received:', {
                appId: messageData.appId,
                location: newLocation,
                permissions: permissions,
                resolution: resolution
            });

            // Check if app is launchable
            if (permissions && permissions.launchable === false) {
                console.warn('App cannot be launched:', messageData.appId);
                return;
            }

            // Check if app is disabled (level 3)
            if (permissions && permissions.level === 3) {
                console.warn('App is disabled:', messageData.appId);
                return;
            }

            // Prevent stacking fades or reloading the same page
            if (overlay.classList.contains('visible') || appFrame.src.endsWith(newLocation)) {
                return;
            }

            // 1. Start the visual fade-to-black
            overlay.classList.add('visible');

            // 2. Wait for the fade animation to complete
            overlay.addEventListener('transitionend', function handleTransition() {
                // 3. Once the screen is black, update resolution if provided
                if (resolution) {
                    setResolution(resolution);
                }

                // 4. Change the iframe content to the new location
                console.log(`Screen faded. Changing source to: ${newLocation}`);
                appFrame.src = newLocation;

                // 5. Wait for the new iframe page to fully load
                appFrame.onload = () => {
                    // 6. Fade the screen back in to reveal the new content
                    console.log('New content loaded. Fading in.');
                    overlay.classList.remove('visible');
                    // Clean up the onload handler
                    appFrame.onload = null;
                };

                // Clean up this listener so it only runs once per action
                overlay.removeEventListener('transitionend', handleTransition);
            });
        }

        // Listen for a message to take a screenshot
        if (messageData && messageData.type === 'takeScreenshot') {
            takeScreenshot();
        }
    });
}

// --- Auto-Language Detection ---
function initializeLanguage() {
    // Check local storage directly since this is the container
    const storedLang = localStorage.getItem('userLanguage');

    if (!storedLang || storedLang === 'null') {
        console.log('[Language] No preference found. Autodetecting...');

        const languageMap = [
            { value: 'en-US', display: 'English' },
            { value: 'es-ES', display: 'Español' },
            { value: 'fr-FR', display: 'Français' },
            { value: 'de-DE', display: 'Deutsch' },
            { value: 'ja-JP', display: '日本語' },
            { value: 'ko-KR', display: '한국어' },
            { value: 'pt-BR', display: 'Português' },
            { value: 'x-pirate', display: 'Pirate' },
            { value: 'x-martian', display: 'Martian' },
            { value: 'x-droid', display: 'Clanker' },
            { value: 'x-uwu', display: 'UwU Speak' },
            { value: 'x-leet', display: '1337 Sp34k' },
            { value: 'x-valley', display: 'Valley Girl' }
        ];

        // Get browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Find match
        let selectedLang = languageMap.find(lang => lang.value === browserLang);
        
        // Fuzzy match (e.g. fr-CA -> fr-FR)
        if (!selectedLang) {
            const baseLang = browserLang.split('-')[0];
            selectedLang = languageMap.find(lang => lang.value.startsWith(baseLang));
        }

        // Set default if not found
        const finalLang = selectedLang ? selectedLang.value : 'en-US';
        
        // Save to localStorage
        localStorage.setItem('userLanguage', finalLang);
        console.log(`[Language] Auto-detected and set to: ${finalLang}`);
    } else {
        console.log(`[Language] Preference found: ${storedLang}`);
    }
}

// --- Initialization ---
async function init() {
    // Create DOM structure
    createContainerStructure();

    // Load configurations from all home screens
    try {
        console.log('[IndexContainer] Loading home screen configurations...');
        await configManager.loadAllConfigs();
        console.log(`[IndexContainer] ✅ Loaded ${configManager.configs.size} home screen config(s)`);
    } catch (error) {
        console.error('[IndexContainer] Failed to load home screen configs:', error);
        console.warn('[IndexContainer] Continuing with limited functionality');
    }

    // Check version and clear cache if needed (before loading any apps)
    try {
        console.log('[App] Checking for version updates...');
        const versionResult = await versionChecker.checkVersion();
        
        if (versionResult.skipped) {
            console.warn('[App] Version check skipped due to error. Continuing with app initialization.');
        } else if (versionResult.hasChanged) {
            const changeType = versionResult.isUpgrade ? 'upgraded' : 'downgraded';
            console.log(`[App] Version ${changeType}! Cache and incompatible data cleared.`);
            console.log(`[App] Previous version: ${versionResult.storedVersionID}`);
            console.log(`[App] Current version: ${versionResult.currentVersionID}`);
            if (versionResult.clearedKeys && versionResult.clearedKeys.length > 0) {
                console.log(`[App] Cleared ${versionResult.clearedKeys.length} localStorage keys:`, versionResult.clearedKeys);
            }
            if (versionResult.versionsProcessed && versionResult.versionsProcessed.length > 0) {
                console.log(`[App] Processed ${versionResult.versionsProcessed.length} version(s):`, versionResult.versionsProcessed);
            }
        } else if (versionResult.isFirstRun) {
            console.log('[App] First run detected. Version tracker initialized.');
        } else {
            console.log('[App] Version check complete. No updates needed.');
        }
    } catch (error) {
        console.error('[App] Error during version check:', error);
        console.log('[App] Continuing with app initialization despite version check error.');
        // Continue initialization even if version check fails
    }

    // Initialize Language (Added here)
    initializeLanguage();

    // Initial call and on window resize
    updateZoomScale();
    window.addEventListener('resize', updateZoomScale);

    // Set up message listener
    setupMessageListener();

    // Handle initial iframe load - check if DOM is already ready
    if (document.readyState === 'loading') {
        // DOM not ready yet, wait for it
        document.addEventListener('DOMContentLoaded', handleInitialIframeLoad);
    } else {
        // DOM already ready, call immediately
        await handleInitialIframeLoad();
    }

    // Expose functions to global scope for console access and debugging
    window.takeScreenshot = takeScreenshot;
    window.setResolution = setResolution;
    window.versionChecker = versionChecker; // Expose for debugging
    window.configManager = configManager; // Expose for debugging
}

// Initialize when script loads
init();
