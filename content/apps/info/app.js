// Define the info app message
console.log('[INFO APP] app.js is being loaded');

import { loadTranslation, getSupportedLanguages } from './i18n/index.js';

export const app = {
    "id": "info",
    "icon": "/content/common/assets/icons/warning_64px.png",
    "actualIcon": "/content/common/assets/icons/warning_64px.png",

    // Custom icon options
    "wrapIcon": null, // Use default gift box
    "backgroundIcon": null, // Use default base


    "onClick": (app, appGrid, languageData) => {
        console.log('[InfoApp] App clicked - not available yet');
        const infoMessage = `${app.localizedLabel || app.label || 'This app'} is not available yet.

Please check back in a future update.`;
        
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || 'Info',
                message: infoMessage,
                onConfirm: () => {
                    console.log('[InfoApp] Modal closed');
                }
            });
        } else {
            alert((app.localizedLabel || app.label) + '\n\n' + infoMessage);
        }
    },
    
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": false,
      "requiresAuth": false,
      "requiresFeatures": [],
      "unlockRequirements": {}
    },
    
    "state": {
      "canBeUnopened": false,
      "alwaysOpened": true
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
        "label": "Info",
        "description": "System information and statistics"
      },
      "es-ES": {
        "label": "Info",
        "description": "Información y estadísticas del sistema"
      },
      "fr-FR": {
        "label": "Info",
        "description": "Informations et statistiques système"
      },
      "de-DE": {
        "label": "Info",
        "description": "Systeminformationen und Statistiken"
      },
      "ja-JP": {
        "label": "情報",
        "description": "システム情報と統計"
      },
      "ko-KR": {
        "label": "정보",
        "description": "시스템 정보 및 통계"
      },
      "pt-BR": {
        "label": "Info",
        "description": "Informações e estatísticas do sistema"
      },
      "zh-Hans-CN": {
        "label": "信息",
        "description": "系统信息和统计数据"
      },
      "zh-Hant": {
        "label": "資訊",
        "description": "系統資訊和統計數據"
      },
      "x-pirate": {
        "label": "Ship's Info",
        "description": "Vessel information an' statistics, arr!"
      },
      "x-uwu": {
        "label": "Infu OwO",
        "description": "System infuwmation and statistics >w<"
      },
      "x-valley": {
        "label": "Info, Like",
        "description": "System info and stats, you know?"
      },
      "x-debug-en-US": {
        "label": "[DEBUG] Info",
        "description": "[DEBUG] System information and statistics"
      },
      "x-debug-zh-Hans-CN": {
        "label": "[调试] 信息",
        "description": "[调试] 系统信息和统计数据"
      }
    }
};

console.log('[Info App] Module loaded successfully');
console.log('[Info App] Configuration:', app);
console.log('[Info App] Supported languages:', getSupportedLanguages());
