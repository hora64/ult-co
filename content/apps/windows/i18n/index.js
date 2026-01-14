/**
 * i18n module for Windows app
 * Dynamically loads translation files based on language code
 */

/**
 * Dynamically load a language translation module
 * @param {string} languageCode - The language code (e.g., 'en-US', 'es-ES')
 * @returns {Promise<Object>} The translation object for the specified language
 */
export async function loadTranslation(languageCode) {
    try {
        switch (languageCode) {
            case 'en-US':
                return (await import('./en-US.js')).enUS;
            case 'es-ES':
                return (await import('./es-ES.js')).esES;
            case 'fr-FR':
                return (await import('./fr-FR.js')).frFR;
            case 'de-DE':
                return (await import('./de-DE.js')).deDE;
            case 'ja-JP':
                return (await import('./ja-JP.js')).jaJP;
            case 'ko-KR':
                return (await import('./ko-KR.js')).koKR;
            case 'pt-BR':
                return (await import('./pt-BR.js')).ptBR;
            case 'zh-Hans-CN':
                return (await import('./zh-Hans-CN.js')).zhHansCN;
            case 'zh-Hant':
                return (await import('./zh-Hant.js')).zhHant;
            case 'x-pirate':
                return (await import('./x-pirate.js')).xPirate;
            case 'x-uwu':
                return (await import('./x-uwu.js')).xUwu;
            case 'x-valley':
                return (await import('./x-valley.js')).xValley;
            case 'x-debug-en-US':
                return (await import('./x-debug-en-US.js')).xDebugEnUS;
            case 'x-debug-zh-Hans-CN':
                return (await import('./x-debug-zh-Hans-CN.js')).xDebugZhHansCN;
            default:
                console.warn(`[Windows i18n] Language ${languageCode} not found, falling back to en-US`);
                return (await import('./en-US.js')).enUS;
        }
    } catch (error) {
        console.error(`[Windows i18n] Failed to load translation for ${languageCode}:`, error);
        return (await import('./en-US.js')).enUS;
    }
}

/**
 * Get list of all supported language codes
 * @returns {string[]} Array of supported language codes
 */
export function getSupportedLanguages() {
    return [
        'en-US',
        'es-ES',
        'fr-FR',
        'de-DE',
        'ja-JP',
        'ko-KR',
        'pt-BR',
        'zh-Hans-CN',
        'zh-Hant',
        'x-pirate',
        'x-uwu',
        'x-valley',
        'x-debug-en-US',
        'x-debug-zh-Hans-CN'
    ];
}
