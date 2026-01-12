export const app = {
    "id": "oldWebsite",
    "icon": "assets/img/button_48px.jpg",
    "actualIcon": "assets/img/button_48px.jpg",
    
    // Custom icon options
    "wrapIcon": null, // Use default gift box
    "backgroundIcon": null, // Use default base
    
    "banner": "banner.png",
    "bannerModule": "/content/apps/oldWebsite/banner.js",
    "bannerJingle": "jingle.mp3",
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/common/banners/unopened/TestJingle.mp3",
    "fileLocation": "/content/apps/oldWebsite/oldWebsite.html",
    "onClick": "(app) => { if (window.parent !== window) { window.parent.postMessage({ type: 'launchApp', appId: app.id, label: app.label, location: app.fileLocation, permissions: app.permissions }, '*'); } }",
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": true,
      "unlockRequirements": {}
    },
    "resolution": {
        "width": 400,
        "height": 480,
        "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Link Test",
        "description": "Test external link launching"
      },
      "es-ES": {
        "label": "Prueba de Enlace",
        "description": "Prueba el lanzamiento de enlaces externos"
      },
      "de-DE": {
        "label": "Link-Test",
        "description": "Testen Sie das Starten externer Links"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "link-test-manual",
      "publisher": "Ult & Co.",
      "author": "Web Team",
      "date": "2024-02-25T12:00:00Z",
      "image": "https://placehold.co/400x240/0078d4/ffffff?text=Link+Test",
      "locales": {
        "en-US": {
          "title": "Link Test - Manual",
          "content": "Test external link launching functionality.\n\n{style:bold|About:}\nThis app is used to test external link launching.\n\n{style:bold|Features:}\n• Test link opening\n• Verify external navigation\n• Debug link issues\n\nUse this to test link functionality!"
        },
        "es-ES": {
          "title": "Prueba de Enlace - Manual",
          "content": "Prueba la funcionalidad de lanzamiento de enlaces externos."
        },
        "de-DE": {
          "title": "Link-Test - Handbuch",
          "content": "Testen Sie die Funktionalität zum Starten externer Links."
        }
      }
    }
  }
