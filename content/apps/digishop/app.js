// DigiShop has been merged into UltShop
// This file is kept for backwards compatibility
// Users clicking on DigiShop will be redirected to UltShop

console.log('[DigiShop App] Module loading...');

import { loadTranslation, getSupportedLanguages } from './i18n/index.js';

export const app = {
    "id": "digishop",
    "icon": "/content/apps/digishop/banner/store_48px.png",
    "actualIcon": "/content/apps/digishop/banner/store_48px.png",
    
    // Custom icon options
    "wrapIcon": null,
    "backgroundIcon": null,
    
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    
    "onClick": (app, appGrid, languageData) => {
        console.log('[DigiShop] Redirecting to UltShop (DigiShop merged)');
        
        // Find UltShop app and launch it instead
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: 'DigiShop → UltShop',
                message: 'DigiShop has been merged into UltShop! Opening UltShop...',
                onConfirm: () => {
                    // Try to find and launch UltShop
                    if (appGrid && appGrid.apps) {
                        const ultshop = appGrid.apps.find(a => a.id === 'ultshop');
                        if (ultshop && appGrid.launchApp) {
                            appGrid.launchApp(ultshop);
                        }
                    }
                }
            });
        } else {
            // Fallback: try to launch UltShop directly
            if (appGrid && appGrid.apps) {
                const ultshop = appGrid.apps.find(a => a.id === 'ultshop');
                if (ultshop && appGrid.launchApp) {
                    appGrid.launchApp(ultshop);
                }
            } else {
                alert('DigiShop has been merged into UltShop. Please launch UltShop instead.');
            }
        }
    },
    
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": true,
      "requiresAuth": false,
      "requiresFeatures": [],
      "unlockRequirements": {},
      "features": ["shop", "purchases", "deprecated"]
    },
    "resolution": {
      "width": 320,
      "height": 480,
      "scale": "fit"
    },
    "i18n": {
      "loadTranslation": loadTranslation,
      "getSupportedLanguages": getSupportedLanguages
    },
    // Legacy locale support - will be loaded from i18n folder dynamically
    "locales": {
      "en-US": {
        "label": "DigiShop (→ UltShop)",
        "description": "Merged into UltShop. Click to open UltShop."
      },
      "es-ES": {
        "label": "DigiShop (→ UltShop)",
        "description": "Fusionado con UltShop. Haz clic para abrir UltShop."
      },
      "fr-FR": {
        "label": "DigiShop (→ UltShop)",
        "description": "Fusionné avec UltShop. Cliquez pour ouvrir UltShop."
      },
      "de-DE": {
        "label": "DigiShop (→ UltShop)",
        "description": "Mit UltShop fusioniert. Klicken Sie, um UltShop zu öffnen."
      },
      "ja-JP": {
        "label": "DigiShop (→ UltShop)",
        "description": "UltShopに統合されました。クリックしてUltShopを開きます。"
      },
      "ko-KR": {
        "label": "DigiShop (→ UltShop)",
        "description": "UltShop에 통합되었습니다. 클릭하여 UltShop을 엽니다."
      },
      "pt-BR": {
        "label": "DigiShop (→ UltShop)",
        "description": "Fundido com UltShop. Clique para abrir UltShop."
      },
      "zh-Hans-CN": {
        "label": "DigiShop (→ UltShop)",
        "description": "已合并到UltShop。单击以打开UltShop。"
      },
      "zh-Hant": {
        "label": "DigiShop (→ UltShop)",
        "description": "已合併到UltShop。點擊以開啟UltShop。"
      },
      "x-pirate": {
        "label": "DigiShop (→ UltShop)",
        "description": "Merged into UltShop, arr! Click to open the treasure cove!"
      },
      "x-uwu": {
        "label": "DigiShop (→ UwtShop)",
        "description": "Merged into UwtShop, uwu~ Cwick to open!"
      },
      "x-valley": {
        "label": "DigiShop (→ UltShop)",
        "description": "Like, merged into UltShop. Click to open, you know?"
      },
      "x-debug-en-US": {
        "label": "[DEBUG] DigiShop (→ UltShop)",
        "description": "[DEBUG] Merged into UltShop. Click to open UltShop."
      },
      "x-debug-zh-Hans-CN": {
        "label": "[调试] DigiShop (→ UltShop)",
        "description": "[调试] 已合并到UltShop。单击以打开UltShop。"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "digishop-redirect",
      "publisher": "Ult & Co.",
      "author": "UltShop Team",
      "date": "2024-01-20T12:00:00Z",
      "image": "https://placehold.co/400x240/ff9800/ffffff?text=DigiShop",
      // Locales will be loaded from i18n folder dynamically
      "locales": {}
    }
};

console.log('[DigiShop App] Module loaded successfully');
console.log('[DigiShop App] Configuration:', app);
console.log('[DigiShop App] Supported languages:', getSupportedLanguages());
