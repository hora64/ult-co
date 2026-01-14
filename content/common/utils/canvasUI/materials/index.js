export * from './effectIndex.js';
export * from './Material.js';
export * from './RichText.js';

/**
 * Retrieves a material class by its name.
 * @param {string} name - The name of the material.
 * @returns {Material|null} The material class or null if not found.
 */
export function getMaterial(name) {
    if (typeof name !== 'string') {
        return null;
    }
    const materialName = name.toLowerCase() + 'effect';
    for (const key in exports) {
        // Ensure we are only checking actual material/effect classes
        if (typeof exports[key] === 'function' && exports[key].prototype instanceof exports.Material) {
            if (key.toLowerCase() === materialName) {
                return exports[key];
            }
        }
    }
    return null;
}
