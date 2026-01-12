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
    "locales": {
      "en-US": {
        "label": "Settings",
        "description": "Customize website settings"
      },
      "es-ES": {
        "label": "Ajustes",
        "description": "Personaliza la configuración del sitio web"
      },
      "fr-FR": {
        "label": "Paramètres",
        "description": "Personnalisez les paramètres du site web"
      },
      "de-DE": {
        "label": "Einstellungen",
        "description": "Passen Sie die Website-Einstellungen an"
      },
      "ja-JP": {
        "label": "設定",
        "description": "ウェブサイトの設定をカスタマイズします"
      },
      "ko-KR": {
        "label": "설정",
        "description": "웹사이트 설정을 사용자 정의합니다"
      },
      "pt-BR": {
        "label": "Configurações",
        "description": "Personalize as configurações do site"
      },
      "pi-RR": {
        "label": "Ship's Wheel",
        "description": "Customize yer ship's settings, savvy"
      },
      "ma-RS": {
        "label": "Vel'config",
        "description": "Customize Zeph'site vel'settings"
      },
      "dr-AC": {
        "label": "Config",
        "description": "Access and modify core system parameters"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "settings-manual",
      "publisher": "Ult & Co.",
      "author": "System Team",
      "date": "2024-01-01T12:00:00Z",
      "image": "https://placehold.co/400x240/6c757d/ffffff?text=Settings",
      "locales": {
        "en-US": {
          "title": "System Settings - User Guide",
          "content": "Customize your DS experience with the Settings app!\n\n{style:bold|Available Settings:}\n• Audio volume and sound effects\n• Language and localization\n• Theme and appearance\n• Debug mode and developer options\n• App grid layout preferences\n\n{style:bold|How to Use:}\nNavigate through the different setting categories using the menu. Changes are saved automatically when you adjust settings.\n\n{style:bold|Developer Mode:}\nEnable debug mode to access additional apps and features designed for testing and development.\n\n{style:bold|Note:}\nSome features might be disabled as they are still in development and will be available in future updates."
        },
        "es-ES": {
          "title": "Configuración del Sistema - Guía del Usuario",
          "content": "¡Personaliza tu experiencia DS con la aplicación de Configuración!\n\n{style:bold|Configuraciones Disponibles:}\n• Volumen de audio y efectos de sonido\n• Idioma y localización\n• Tema y apariencia\n• Modo de depuración y opciones de desarrollador\n• Preferencias de diseño de cuadrícula de aplicaciones\n\n{style:bold|Cómo Usar:}\nNavega a través de las diferentes categorías de configuración usando el menú. Los cambios se guardan automáticamente cuando ajustas la configuración.\n\n{style:bold|Modo Desarrollador:}\nHabilita el modo de depuración para acceder a aplicaciones y funciones adicionales diseñadas para pruebas y desarrollo.\n\n{style:bold|Nota:}\nEs posible que algunas funciones estén desactivadas, ya que aún están en desarrollo y estarán disponibles en actualizaciones futuras."
        },
        "de-DE": {
          "title": "Systemeinstellungen - Benutzerhandbuch",
          "content": "Passen Sie Ihr DS-Erlebnis mit der Einstellungen-App an!\n\n{style:bold|Verfügbare Einstellungen:}\n• Lautstärke und Soundeffekte\n• Sprache und Lokalisierung\n• Design und Aussehen\n• Debug-Modus und Entwickleroptionen\n• App-Gitterlayout-Präferenzen\n\n{style:bold|So verwenden Sie es:}\nNavigieren Sie mit dem Menü durch die verschiedenen Einstellungskategorien. Änderungen werden automatisch gespeichert, wenn Sie die Einstellungen anpassen.\n\n{style:bold|Entwicklermodus:}\nAktivieren Sie den Debug-Modus, um auf zusätzliche Apps und Funktionen zuzugreifen, die für Test- und Entwicklungszwecke entwickelt wurden.\n\n{style:bold|Hinweis:}\nEinige Funktionen sind möglicherweise deaktiviert, da sie sich noch in der Entwicklungsphase befinden und in zukünftigen Updates verfügbar sein werden."
        }
      }
    }
  }
