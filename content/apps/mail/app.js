console.log('[Mail App] Module loading...');

import { loadTranslation, getSupportedLanguages } from './i18n/index.js';

export const app = {
  "id": "mail",
  "version": "1.1.0", // Incremented for cache invalidation
  "fileLocation": "/content/apps/mail/mail.html",
  "icon": "/content/common/assets/icons/message_64px.png",
  "actualIcon": "/content/common/assets/icons/message_64px.png",
  
  // Custom icon options
  "wrapIcon": null, // Use default gift box
  "backgroundIcon": null, // Use default base
  
  // Asset preloading configuration
  "assets": {
    "models": [
      "/content/apps/mail/assets/models/mailBox_Flat.glb",
      "/content/apps/mail/assets/models/platform.glb",
      "/content/apps/mail/assets/models/Cloud-1.glb"
    ],
    "icons": [
      "/content/common/assets/icons/message_64px.png"
    ],
    "textures": [
      "https://threejs.org/examples/textures/lensflare/lensflare0.png",
      "https://threejs.org/examples/textures/lensflare/lensflare3.png"
    ],
    "useCache": true,
    "preloadOnInit": true, // Preload assets when app initializes
    "preloadPriority": "high" // high, medium, low
  },
  
  "onClick": "(app) => { if (window.parent !== window) { window.parent.postMessage({ type: 'launchApp', appId: app.id, label: app.label, location: app.fileLocation, permissions: app.permissions, resolution: app.resolution }, '*'); } }",
  "route": {
    "regex": "^\\/mail(?:\\/([a-zA-Z0-9_-]+))?(?:\\/(en-US|es-ES|fr-FR|de-DE|zh-Hans-CN|zh-Hant|ja-JP|ko-KR|pt-BR|pi-RR|ma-RS|dr-AC|uw-UU|le-ET|va-LY))?$",
    "enabled": true
  },
  "permissions": {
    "level": 0,
    "launchable": true,
    "unwrappable": false,  // Top bar app - never wrapped
    "unlockRequirements": {}
  },
  
  // State configuration
  "state": {
    // Controls whether app can be in "unopened" state
    // Set to false for top bar apps (always opened)
    "canBeUnopened": false,
    
    // For top bar apps, force always opened
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
  // Legacy locale support - will be loaded from i18n folder dynamically
  "locales": {
    "en-US": {
      "label": "Mail",
      "description": "Send and receive messages"
    },
    "es-ES": {
      "label": "Correo",
      "description": "Enviar y recibir mensajes"
    },
    "fr-FR": {
      "label": "Courrier",
      "description": "Envoyer et recevoir des messages"
    },
    "de-DE": {
      "label": "Mail",
      "description": "Nachrichten senden und empfangen"
    },
    "ja-JP": {
      "label": "メール",
      "description": "メッセージの送受信"
    },
    "ko-KR": {
      "label": "메일",
      "description": "메시지 보내기 및 받기"
    },
    "pt-BR": {
      "label": "Correio",
      "description": "Enviar e receber mensagens"
    },
    "zh-Hans-CN": {
      "label": "邮件",
      "description": "发送和接收消息"
    },
    "zh-Hant": {
      "label": "郵件",
      "description": "發送和接收消息"
    },
    "x-pirate": {
      "label": "Messages",
      "description": "Send messages across the seven seas"
    },
    "x-uwu": {
      "label": "Maiw OwO",
      "description": "Send and weceive messages, uwu~"
    },
    "x-valley": {
      "label": "Mail, Like",
      "description": "Send and receive messages, you know?"
    },
    "x-debug-en-US": {
      "label": "[DEBUG] Mail",
      "description": "[DEBUG] Send and receive messages"
    },
    "x-debug-zh-Hans-CN": {
      "label": "[调试] 邮件",
      "description": "[调试] 发送和接收消息"
    }
  },
  "articles": [],
  "manualArticle": {
    "permissionLevel": 0,
    "slug": "mail-manual",
    "publisher": "Ult & Co.",
    "author": "Communications Team",
    "date": "2024-01-15T12:00:00Z",
    "image": "https://placehold.co/400x240/007bff/ffffff?text=Mail",
    "iconPath": "/content/common/assets/icons/message_64px.png",
    "tags": ["Communication", "Mail", "Messaging"],
    "visible": true,
    "debugArticle": false,
    // Locales will be loaded from i18n folder dynamically
    "locales": {}
  }
};

console.log('[Mail App] Module loaded successfully');
console.log('[Mail App] Configuration:', app);
console.log('[Mail App] Supported languages:', getSupportedLanguages());
