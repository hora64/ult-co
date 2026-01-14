console.log('[Settings App] Module loading...');

import { loadTranslation, getSupportedLanguages } from './i18n/index.js';

export const app = {
    "id": "settings",
    "version": "1.1.0", // Incremented for cache invalidation
    "icon": "/content/apps/settings/banner/settings_48px.png",
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/common/banners/unopened/TestJingle.mp3",
    "fileLocation": "/content/apps/settings/settings.html",
    
    // Asset preloading configuration
    "assets": {
      "models": [
        "/content/apps/settings/assets/models/gear.glb"
      ],
      "icons": [
        "/content/apps/settings/banner/settings_48px.png"
      ],
      "useCache": true,
      "preloadOnInit": true, // Preload assets when app initializes
      "preloadPriority": "high" // high, medium, low
    },
    
    "onClick": "(app, appGrid, languageData) => { if (window.parent !== window) { const message = { type: 'launchApp', appId: app.id, label: app.label, location: app.fileLocation, languageData: languageData, permissions: app.permissions, resolution: app.resolution }; window.parent.postMessage(message, '*'); } }",
    "route": {
      "regex": "^\\/settings$",
      "enabled": true
    },
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": false,  // Top bar app - never wrapped
      "unlockRequirements": {}
    },
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "i18n": {
      "loadTranslation": loadTranslation,
      "getSupportedLanguages": getSupportedLanguages
    },
    "locales": {
      "en-US": {
        "label": "Settings",
        "description": "Configure system preferences"
      },
      "es-ES": {
        "label": "Ajustes",
        "description": "Configurar las preferencias del sistema"
      },
      "fr-FR": {
        "label": "Paramètres",
        "description": "Configurer les préférences du système"
      },
      "de-DE": {
        "label": "Einstellungen",
        "description": "Systemeinstellungen konfigurieren"
      },
      "ja-JP": {
        "label": "設定",
        "description": "システム設定を構成する"
      },
      "ko-KR": {
        "label": "설정",
        "description": "시스템 기본 설정 구성"
      },
      "pt-BR": {
        "label": "Configurações",
        "description": "Configurar preferências do sistema"
      },
      "zh-Hans-CN": {
        "label": "设置",
        "description": "配置系统偏好设置"
      },
      "zh-Hant": {
        "label": "設定",
        "description": "配置系統偏好設定"
      },
      "x-pirate": {
        "label": "Ship's Wheel",
        "description": "Adjust the ship's settings, arrr!"
      },
      "x-uwu": {
        "label": "Settings uwu",
        "description": "Configuwe system pwefewences, uwu~"
      },
      "x-valley": {
        "label": "Settings, like",
        "description": "Like, configure system stuff, whatever"
      },
      "x-debug-en-US": {
        "label": "[DEBUG] Settings",
        "description": "[DEBUG] Configure system preferences"
      },
      "x-debug-zh-Hans-CN": {
        "label": "[调试] 设置",
        "description": "[调试] 配置系统偏好设置"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "settings-manual",
      "publisher": "Ult & Co.",
      "author": "System Team",
      "date": "2024-01-01T12:00:00Z",
      "image": "https://placehold.co/400x240/6c757d/ffffff?text=Settings",
      // Locales will be loaded from i18n folder dynamically
      "locales": {}
    }
  };

console.log('[Settings App] Module loaded successfully');
console.log('[Settings App] Configuration:', app);
console.log('[Settings App] Supported languages:', getSupportedLanguages());
