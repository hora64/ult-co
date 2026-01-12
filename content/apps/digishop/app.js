// DigiShop has been merged into UltShop
// This file is kept for backwards compatibility
// Users clicking on DigiShop will be redirected to UltShop

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
        "description": "Mit UltShop zusammengeführt. Klicken Sie, um UltShop zu öffnen."
      },
      "ja-JP": {
        "label": "DigiShop (→ UltShop)",
        "description": "UltShopに統合されました。クリックしてUltShopを開きます。"
      },
      "ko-KR": {
        "label": "DigiShop (→ UltShop)",
        "description": "UltShop에 병합되었습니다. UltShop을 열려면 클릭하세요."
      },
      "pt-BR": {
        "label": "DigiShop (→ UltShop)",
        "description": "Mesclado com UltShop. Clique para abrir o UltShop."
      },
      "pi-RR": {
        "label": "DigiShop (→ UltShop)",
        "description": "Merged into UltShop, arr! Click to open the treasure cove!"
      },
      "ma-RS": {
        "label": "DigiShop (→ UltShop)",
        "description": "Merged into Keph'UltShop. Click to open."
      },
      "dr-AC": {
        "label": "DigiShop (→ UltShop)",
        "description": "Consolidated into UltShop requisition. Click to access."
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "digishop-redirect",
      "publisher": "Ult & Co.",
      "author": "UltShop Team",
      "date": "2024-01-20T12:00:00Z",
      "image": "https://placehold.co/400x240/ff9800/ffffff?text=DigiShop",
      "locales": {
        "en-US": {
          "title": "DigiShop → UltShop",
          "content": "DigiShop has been merged into UltShop!\n\nAll DigiShop functionality is now available in the upgraded UltShop app. Click on DigiShop to be automatically redirected to UltShop.\n\n**Why the merge?**\n• Unified shopping experience\n• Better performance\n• More features\n• Consistent UI\n\nAll your purchases and account data remain intact!"
        },
        "es-ES": {
          "title": "DigiShop → UltShop",
          "content": "¡DigiShop se ha fusionado con UltShop!\n\nToda la funcionalidad de DigiShop ahora está disponible en la aplicación mejorada UltShop. Haz clic en DigiShop para ser redirigido automáticamente a UltShop.\n\n**¿Por qué la fusión?**\n• Experiencia de compra unificada\n• Mejor rendimiento\n• Más funciones\n• UI consistente\n\n¡Todas tus compras y datos de cuenta permanecen intactos!"
        }
      }
    }
}
