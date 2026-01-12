import { SkyMaterial } from '/content/common/utils/threejs/materials/SkyMaterial.js';

export function createSkyMaterial(timeSystem, skyRadius, options = {}) {
  return new SkyMaterial({
    topColor: options.topColor || timeSystem.currentSkyColors.top,
    middleColor: options.middleColor || timeSystem.currentSkyColors.middle,
    bottomColor: options.bottomColor || timeSystem.currentSkyColors.bottom,
    tintColor: options.tintColor || undefined,
    tintIntensity: options.tintIntensity || 0.0,
    sunPosition: timeSystem.sunPosition,
    moonPosition: timeSystem.moonPosition,
    sunHaloIntensity: options.sunHaloIntensity !== undefined ? options.sunHaloIntensity : 0.0,
    moonHaloIntensity: options.moonHaloIntensity !== undefined ? options.moonHaloIntensity : 0.0
  });
}