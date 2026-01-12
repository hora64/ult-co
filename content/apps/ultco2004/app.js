export const app = {
    "id": "ultco2004",
    "icon": "/content/apps/ultco2004/assets/images/icon.png",
    "jingle": "/content/apps/windows/banners/longhornStartup.mp3",
    "fileLocation": "/content/apps/ultco2004/ultco2004.html",
    "onClick": "(app) => { if (window.parent !== window) { window.parent.postMessage({ type: 'launchApp', appId: app.id, label: app.label, location: app.fileLocation, permissions: app.permissions, resolution: app.resolution }, '*'); } }",
    "route": {
      "regex": "^(?:\\/ultco2004)$",
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
        "label": "Ult & Co. 2004",
        "description": "Visit the 2004 Ult & Co. website"
      }
    }
  }
