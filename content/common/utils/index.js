// Common UI Components and Utilities - Consolidated Export Index

export * from './canvasUI/index.js';
export * from './windows/index.js';
export * from './canvasUI/layouts/index.js';
export * from './audio/index.js';

export { LocalStorage } from "./LocalStorage.js";
export { DateTimeFormatter } from "./DateTimeFormatter.js";
export { LoadingCircle } from "./canvasUI/components/LoadingCircle.js";
export { SlimScrollIndicator } from "./canvasUI/components/SlimScrollIndicator.js";

export { ActionHandler } from "./ActionHandler.js";
export { AppLayoutHelper } from "./AppLayoutHelper.js";

export { 
    getPermissionLevel, 
    canViewApp, 
    canLaunchApp,
    authenticateAdmin,
    logoutAdmin,
    enableDebug,
    disableDebug
} from "./permissions.js";

export * from "./threejs/index.js";

// Asset Management
// NOTE: AssetCache files should exist in content/common/utils/
// If you get 404 errors, see ASSETCACHE_SETUP_GUIDE.md
export { assetCache, AssetCache } from "./AssetCache.js";
export { ModelLoader, createModelLoader, initModelLoader, getModelLoader } from "./ModelLoader.js";
export { 
    AssetPreloader, 
    preloadAssets,
    loadImage,
    loadTexture,
    loadAudio,
    loadImages,
    loadTextures,
    loadAudioFiles
} from "./AssetPreloader.js";
