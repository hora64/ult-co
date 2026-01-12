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
    "regex": "^\\/mail(?:\\/([a-zA-Z0-9_-]+))?$",
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
  
  "articles": [
    {
      "permissionLevel": 2,
      "slug": "admin-configuration",
      "publisher": "Ult & Co.",
      "author": "Admin Team",
      "date": "2024-01-25T12:00:00Z",
      "locales": {
        "en-US": {
          "title": "Mail System Administration",
          "content": "This article covers administrative configuration and management of the mail system.\n\n{style:bold|Admin Features:}\n• Server configuration\n• User management\n• Security settings\n• System monitoring\n• Backup and restore\n\n{style:bold|Warning:}\nThese features should only be accessed by system administrators."
        }
      }
    }
  ],
  "resolution": {
    "width": 400,
    "height": 480,
    "scale": "fit"
  },
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
    "pi-RR": {
      "label": "Messages",
      "description": "Send messages across the seven seas"
    },
    "ma-RS": {
      "label": "Zeph'mor",
      "description": "Keph'messaging system"
    },
    "dr-AC": {
      "label": "Mainframe",
      "description": "Central messaging protocol"
    }
  },
  "manualArticle": {
    "permissionLevel": 0,
    "slug": "mail-manual",
    "publisher": "Ult & Co.",
    "author": "Communications Team",
    "locales": {
      "en-US": {
        "title": "Mail App - User Guide",
        "content": "Welcome to the Mail app – your central hub for all communications!\n\n{style:bold|Getting Started}\nThe Mail app lets you send and receive messages, check your inbox, and compose new emails with ease.\n\n{style:bold|Key Features:}\n• View your inbox with all received messages\n• Compose new messages with rich formatting\n• Reply to and forward messages\n• Organize messages with labels\n• Search through your message history\n\n{style:bold|Tips:}\nUse the search bar to quickly find specific messages. You can also organize your inbox using custom labels for better message management.\n\nFor additional help, contact support through the settings menu."
      },
      "es-ES": {
        "title": "Correo - Guía del Usuario",
        "content": "¡Bienvenido a la aplicación de Correo – tu centro principal para todas las comunicaciones!\n\n{style:bold|Primeros Pasos}\nLa aplicación de Correo te permite enviar y recibir mensajes, revisar tu bandeja de entrada y redactar nuevos correos con facilidad.\n\n{style:bold|Características Principales:}\n• Ver tu bandeja de entrada con todos los mensajes recibidos\n• Redactar nuevos mensajes con formato enriquecido\n• Responder y reenviar mensajes\n• Organizar mensajes con etiquetas\n• Buscar en tu historial de mensajes"
      },
      "de-DE": {
        "title": "Mail - Benutzerhandbuch",
        "content": "Willkommen bei der Mail-App – Ihre zentrale Anlaufstelle für alle Kommunikationen!\n\n{style:bold|Erste Schritte}\nDie Mail-App ermöglicht es Ihnen, Nachrichten zu senden und zu empfangen, Ihren Posteingang zu überprüfen und neue E-Mails mit Leichtigkeit zu verfassen."
      }
    },
    "image": "https://placehold.co/400x240/007bff/ffffff?text=Mail",
    "date": "2024-01-15T12:00:00Z",
    "iconPath": "/content/common/assets/icons/message_64px.png",
    "tags": ["Communication", "Mail", "Messaging"],
    "visible": true,
    "debugArticle": false
  }
}
