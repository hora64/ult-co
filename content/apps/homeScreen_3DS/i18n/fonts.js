/**
 * Font configuration helper for HomeScreen_3DS app
 * Only Chinese languages use special fonts, all others use Rodin
 */

/**
 * Get font configuration from translation object
 * @param {Object} translationObj - Translation object that may contain _meta.font
 * @returns {Object|null} Font configuration or null
 */
function getFontConfig(translationObj) {
    return translationObj?._meta?.font || null;
}

/**
 * Get font family string for a language
 * @param {string} languageCode - Language code
 * @param {Object} translationObj - Optional translation object with _meta.font
 * @returns {string} CSS font-family string
 */
export function getFontFamily(languageCode, translationObj = null) {
    const config = translationObj ? getFontConfig(translationObj) : null;
    if (config) {
        return `${config.primary}, ${config.fallback}`;
    }
    // All other languages use Rodin
    return 'Rodin, Arial, sans-serif';
}

/**
 * Get font weight for a language
 * @param {string} languageCode - Language code
 * @param {Object} translationObj - Optional translation object with _meta.font
 * @returns {string} CSS font-weight value
 */
export function getFontWeight(languageCode, translationObj = null) {
    const config = translationObj ? getFontConfig(translationObj) : null;
    return config ? config.weight : 'normal';
}

/**
 * Apply font configuration to an element
 * @param {HTMLElement} element - Element to apply font to
 * @param {string} languageCode - Language code
 * @param {Object} translationObj - Optional translation object with _meta.font
 */
export function applyLanguageFont(element, languageCode, translationObj = null) {
    if (!element) return;
    
    const fontFamily = getFontFamily(languageCode, translationObj);
    const fontWeight = getFontWeight(languageCode, translationObj);
    
    element.style.fontFamily = fontFamily;
    element.style.fontWeight = fontWeight;
}
