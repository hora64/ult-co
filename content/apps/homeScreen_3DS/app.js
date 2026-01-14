export const app = {
    "id": "homeScreen_3DS",
    "baseIcon": true,
    "icon": "/content/apps/homeScreen_3DS/assets/themes/blackTheme/HomeScreen_128px.png",
    "actualIcon": "/content/apps/homeScreen_3DS/assets/themes/blackTheme/HomeScreen_128px.png",
    
    // Custom icon options
    "wrapIcon": null, // Use default gift box (for baseIcon apps, this is ignored when unopened)
    "backgroundIcon": null, // Not used for baseIcon apps
    
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    "fileLocation": "/content/apps/homeScreen_3DS/homeScreen_3DS.html",
    "onClick": "(app) => { if (window.parent !== window) { window.parent.postMessage({ type: 'launchApp', appId: app.id, label: app.label, location: app.fileLocation, permissions: app.permissions, resolution: app.resolution }, '*'); } }",
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": false
    },
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Home",
        "description": "Main application launcher screen"
      },
      "es-ES": {
        "label": "Inicio",
        "description": "Pantalla principal del lanzador de aplicaciones"
      },
      "fr-FR": {
        "label": "Accueil",
        "description": "Écran principal du lanceur d'applications"
      },
      "de-DE": {
        "label": "Start",
        "description": "Hauptbildschirm des Anwendungsstarters"
      },
      "ja-JP": {
        "label": "ホーム",
        "description": "アプリケーションランチャーのメイン画面"
      },
      "ko-KR": {
        "label": "홈",
        "description": "애플리케이션 실행기의 메인 화면"
      },
      "pt-BR": {
        "label": "Início",
        "description": "Tela principal do inicializador de aplicativos"
      },
      "zh-Hans-CN": {
        "label": "主页",
        "description": "主应用程序启动器屏幕"
      },
      "zh-Hant": {
        "label": "主頁",
        "description": "主應用程式啟動器螢幕"
      },
      "x-pirate": {
        "label": "Port",
        "description": "Main deck of the ship, arrr!"
      },
      "x-uwu": {
        "label": "Home OwO",
        "description": "Main appwication waunchew scween, uwu~"
      },
      "x-valley": {
        "label": "Home, Like",
        "description": "Main, like, application launcher screen"
      },
      "x-debug-en-US": {
        "label": "[DEBUG] Home",
        "description": "[DEBUG] Main application launcher screen"
      },
      "x-debug-zh-Hans-CN": {
        "label": "[调试] 主页",
        "description": "[调试] 主应用程序启动器屏幕"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "homescreen-welcome",
      "publisher": "Ult & Co.",
      "author": "Ult & Co. Team",
      "date": "2024-01-01T12:00:00Z",
      "image": "https://placehold.co/400x240/007bff/ffffff?text=Welcome",
      "locales": {
        "en-US": {
          "title": "Welcome to the DS!",
          "content": "Welcome to your new DS-inspired website! We've packed it with cool apps to get you started.\n\n{style:bold|Getting Started:}\n• Browse apps on the home screen grid\n• Click or tap apps to launch them\n• Use arrow keys to navigate\n• Press ESC to return to home screen\n• Adjust icon size with +/- buttons\n\n{style:bold|Available Apps:}\n• Mail - Check your messages\n• DigiShop - Browse for new apps\n• Settings - Customize your experience\n• Music - Listen to original tracks\n• Contest Info - Join competitions\n• Ult & Co. World - Explore lore and characters\n• And more!\n\n{style:bold|Tips:}\n• Enable debug mode in Settings to see experimental apps\n• Create your own layout by dragging apps\n• Check the manual (? button) for detailed app guides\n• Customize themes in Settings\n\n{style:bold|Updates:}\nWe're always working on new apps and features, so check back often for updates. Enjoy your DS experience!"
        },
        "es-ES": {
          "title": "¡Bienvenido al DS!",
          "content": "¡Bienvenido a tu nuevo sitio web inspirado en DS! Lo hemos llenado con aplicaciones geniales para comenzar."
        },
        "de-DE": {
          "title": "Willkommen beim DS!",
          "content": "Willkommen bei deiner neuen DS-inspirierten Website! Wir haben sie mit coolen Apps vollgepackt."
        }
      }
    }
  }
