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
    "locales": {
      "en-US": {
        "label": "Ult & Co. Old Website",
        "description": "Visit the original Ult & Co. website"
      },
      "es-ES": {
        "label": "Sitio Web Antiguo de Ult & Co.",
        "description": "Visita el sitio web original de Ult & Co."
      },
      "de-DE": {
        "label": "Alte Ult & Co. Webseite",
        "description": "Besuchen Sie die ursprüngliche Ult & Co. Webseite"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "old-website-manual",
      "publisher": "Ult & Co.",
      "author": "Web Team",
      "date": "2024-02-25T12:00:00Z",
      "image": "https://placehold.co/400x240/0078d4/ffffff?text=Old+Website",
      "locales": {
        "en-US": {
          "title": "Ult & Co. Old Website - Archive",
          "content": "Welcome to the original Ult & Co. website, preserved for historical purposes!\n\n{style:bold|About This Archive:}\nThis is the original Ult & Co. website from our early days. While the site has been replaced with this new DS-inspired interface, we've kept the old site accessible for nostalgia and reference.\n\n{style:bold|Features:}\n• Original website design\n• Legacy content and pages\n• Classic navigation\n• Full browsing experience\n• Windows 7-style interface\n• Interactive window management\n\n{style:bold|How to Use:}\n• Drag windows by their title bars\n• Resize windows from any edge or corner\n• Minimize, maximize, or close windows\n• Multiple windows can be open at once\n• Windows stack with proper z-index management\n\n{style:bold|Note:}\nThis is a recreation of the classic Windows-style interface. Some features may be limited or adapted for web browser compatibility.\n\nExplore our history and see how far we've come!"
        },
        "es-ES": {
          "title": "Sitio Web Antiguo de Ult & Co. - Archivo",
          "content": "¡Bienvenido al sitio web original de Ult & Co., preservado con fines históricos!\n\nEste es el sitio web original de Ult & Co. de nuestros primeros días."
        },
        "de-DE": {
          "title": "Alte Ult & Co. Webseite - Archiv",
          "content": "Willkommen auf der ursprünglichen Ult & Co. Webseite, die zu historischen Zwecken erhalten geblieben ist!"
        }
      }
    }
  }
