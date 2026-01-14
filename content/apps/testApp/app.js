export const app = {
    "id": "testApp",
    "icon": "/content/common/assets/giftbox_48px.png",
    
    // Unopened banner configuration
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/common/banners/unopened/TestJingle.mp3",
    
    "onClick": (app, appGrid, languageData) => {
        console.log('[TestApp] App clicked - showing debug message');
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || app.label || 'Test App',
                message: languageData?.messages?.debugApp || 'This is a debug app for testing.',
                onConfirm: () => {
                    console.log('[TestApp] Modal closed');
                }
            });
        } else {
            alert((app.localizedLabel || app.label) + '\n\nThis is a debug app for testing homescreen functionality.');
        }
    },
    "permissions": {
      "level": 1,
      "launchable": true,
      "unwrappable": true,
      "requiresAuth": false,
      "requiresFeatures": [],
      "unlockRequirements": {},
      "features": ["testing", "experimental"]
    },
    
    // State configuration - starts as unopened/wrapped
    "state": {
      "canBeUnopened": true,
      "alwaysOpened": false
    },
    
    "resolution": {
      "width": 640,
      "height": 480,
      "scale": "native"
    },
    "locales": {
      "en-US": {
        "label": "Test App",
        "description": "A test application for demonstration purposes."
      },
      "es-ES": {
        "label": "App de Prueba",
        "description": "Una aplicación de prueba para fines de demostración."
      },
      "fr-FR": {
        "label": "App de Test",
        "description": "Une application de test à des fins de démonstration."
      },
      "de-DE": {
        "label": "Test-App",
        "description": "Eine Testanwendung zu Demonstrationszwecken."
      },
      "ja-JP": {
        "label": "テストアプリ",
        "description": "デモンストレーション用のテストアプリケーションです."
      },
      "ko-KR": {
        "label": "테스트 앱",
        "description": "데모용 테스트 애플리케이션입니다."
      },
      "pt-BR": {
        "label": "Aplicativo de Teste",
        "description": "Um aplicativo de teste para fins de demonstração."
      },
      "pi-RR": {
        "label": "Test Ship",
        "description": "A test ship for demonstration purposes, arrr!"
      },
      "ma-RS": {
        "label": "Test Vel'app",
        "description": "A test application for demonstration purposes."
      },
      "dr-AC": {
        "label": "Diagnostic App",
        "description": "A diagnostic application for system evaluation."
      }
    },
    "manualArticle": {
      "permissionLevel": 1,
      "slug": "test-manual",
      "locales": {
        "en-US": {
          "title": "Test App - Debug Documentation",
          "content": "This is a test application for debugging and development purposes.\n\n{style:bold|Debug Features:}\n• Visual testing\n• Performance monitoring\n• State inspection\n\nOnly visible when debug mode is enabled."
        }
      }
    }
  }
