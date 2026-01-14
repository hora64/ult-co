import { loadTranslation, getSupportedLanguages } from './i18n/index.js';

export const app = {
    "id": "windows",
    "icon": "/content/apps/windows/banners/button_48px.jpg",
    "jingle": "/content/apps/windows/banners/longhornStartup.mp3",
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    "fileLocation": "/content/apps/windows/windows.html",
    "onClick": "(app) => { if (window.parent !== window) { window.parent.postMessage({ type: 'launchApp', appId: app.id, label: app.label, location: app.fileLocation, permissions: app.permissions, resolution: app.resolution }, '*'); } }",
    "route": {
      "regex": "^(?:\\/windows(?:#([a-zA-Z0-9_-]+))?|\\/#([a-zA-Z0-9_-]+))$",
      "enabled": true
    },
    "resolution": {
        "width": 1920,
        "height": 1080,
        "scale": "fullscreen"
    },
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": true,
      "unlockRequirements": {}
    },
    "i18n": {
      "loadTranslation": loadTranslation,
      "getSupportedLanguages": getSupportedLanguages
    },
    "locales": {
      "en-US": {
        "label": "Ult & Co. Old Website",
        "description": "Visit the original Ult & Co. website"
      },
      "es-ES": {
        "label": "Sitio Web Antiguo de Ult & Co.",
        "description": "Visita el sitio web original de Ult & Co."
      },
      "fr-FR": {
        "label": "Ancien Site Web Ult & Co.",
        "description": "Visitez le site web original d'Ult & Co."
      },
      "de-DE": {
        "label": "Ult & Co. Alte Website",
        "description": "Besuchen Sie die ursprüngliche Ult & Co. Website"
      },
      "ja-JP": {
        "label": "Ult & Co. 旧ウェブサイト",
        "description": "元のUlt & Co.ウェブサイトを訪問"
      },
      "ko-KR": {
        "label": "Ult & Co. 이전 웹사이트",
        "description": "원래 Ult & Co. 웹사이트 방문"
      },
      "pt-BR": {
        "label": "Site Antigo da Ult & Co.",
        "description": "Visite o site original da Ult & Co."
      },
      "zh-Hans-CN": {
        "label": "Ult & Co. 旧网站",
        "description": "访问原始的Ult & Co.网站"
      },
      "zh-Hant": {
        "label": "Ult & Co. 舊網站",
        "description": "訪問原始的Ult & Co.網站"
      },
      "x-pirate": {
        "label": "Ult & Co. Ye Olde Ship's Port",
        "description": "Visit the original Ult & Co. treasure map"
      },
      "x-uwu": {
        "label": "Uwt & Co. Owd Website OwO",
        "description": "Visit the owiginaw Uwt & Co. website, uwu~"
      },
      "x-valley": {
        "label": "Ult & Co. Old Website, Like",
        "description": "Visit the, like, original Ult & Co. website"
      },
      "x-debug-en-US": {
        "label": "[DEBUG] Ult & Co. Old Website",
        "description": "[DEBUG] Visit the original Ult & Co. website"
      },
      "x-debug-zh-Hans-CN": {
        "label": "[调试] Ult & Co. 旧网站",
        "description": "[调试] 访问原始的Ult & Co.网站"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "old-website-manual",
      "publisher": "Ult & Co.",
      "author": "Web Team",
      "date": "2024-02-25T12:00:00Z",
      "image": "https://placehold.co/400x240/0078d4/ffffff?text=Old+Website",
      "locales": {}
    }
  }
