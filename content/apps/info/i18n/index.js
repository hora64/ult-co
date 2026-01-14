// Lazy loading translation modules for Info app

/**
 * Dynamically load a language translation module
 * @param {string} languageCode - Language code (e.g., 'en-US')
 * @returns {Promise<Object>} Translation object for the language
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
                console.warn(`Language ${languageCode} not found, falling back to en-US`);
                return (await import('./en-US.js')).enUS;
        }
    } catch (error) {
        console.error(`Failed to load translation for ${languageCode}:`, error);
        return (await import('./en-US.js')).enUS;
    }
}

/**
 * Get list of supported languages
 * @returns {Array<string>} Array of language codes
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

/**
 * Legacy export for backward compatibility
 */
import { enUS } from './en-US.js';
import { esES } from './es-ES.js';
import { frFR } from './fr-FR.js';
import { deDE } from './de-DE.js';
import { jaJP } from './ja-JP.js';
import { koKR } from './ko-KR.js';
import { ptBR } from './pt-BR.js';
import { zhHansCN } from './zh-Hans-CN.js';
import { zhHant } from './zh-Hant.js';
import { xPirate } from './x-pirate.js';
import { xUwu } from './x-uwu.js';
import { xValley } from './x-valley.js';
import { xDebugEnUS } from './x-debug-en-US.js';
import { xDebugZhHansCN } from './x-debug-zh-Hans-CN.js';

export const translations = {
    'en-US': enUS,
    'es-ES': esES,
    'fr-FR': frFR,
    'de-DE': deDE,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'pt-BR': ptBR,
    'zh-Hans-CN': zhHansCN,
    'zh-Hant': zhHant,
    'x-pirate': xPirate,
    'x-uwu': xUwu,
    'x-valley': xValley,
    'x-debug-en-US': xDebugEnUS,
    'x-debug-zh-Hans-CN': xDebugZhHansCN
};
