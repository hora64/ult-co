/**
 * Font configuration helper for Mail Articles
 * Manages font settings for different languages
 */

/**
 * Get font configuration for a specific language
 * @param {string} languageCode - Language code
 * @returns {Object} Font configuration object
 */
export function getFontConfig(languageCode) {
    // All languages use Rodin font
    return {
        primary: 'Rodin',
        fallback: 'Arial, sans-serif',
        weight: 'normal'
    };
}

/**
 * Apply font configuration to an element for articles
 * @param {HTMLElement} element - Element to apply font to
 * @param {string} languageCode - Language code
 */
export function applyArticleFont(element, languageCode) {
    if (!element) return;
    
    const fontConfig = getFontConfig(languageCode);
    element.style.fontFamily = `${fontConfig.primary}, ${fontConfig.fallback}`;
    element.style.fontWeight = fontConfig.weight;
}
