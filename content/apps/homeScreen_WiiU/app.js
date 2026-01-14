export const app = {
  "id": "homeScreen_WiiU",
  "backgroundIcon": "/content/apps/homeScreen_WiiU/banner/wiiU_64px.png",
  "actualIcon": "/content/apps/homeScreen_WiiU/banner/wiiU_64px.png",
  "wrapIcon": null,
  "jingle": "/content/apps/homeScreen_WiiU/banner/WiiUMenu.mp3",
  "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
  "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
  
  "selectorOverride": {
    "enabled": true,
    "src": "/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png"
  },
  
  "fileLocation": "/content/apps/homeScreen_WiiU/homeScreen_WiiU.html",
  "onClick": (app, appGrid, languageData) => {
    if (window.modalManager) {
      window.modalManager.showInfoModal({
        title: app.localizedLabel || app.label || 'Contest Info',
        message: languageData?.messages?.appNotAvailable || 'This app is not yet available.',
        onConfirm: () => {}
      });
    } else {
      alert((app.localizedLabel || app.label) + '\n\nThis app is not yet available.');
    }
  },
  "permissions": {
    "level": 0,
    "launchable": false,
    "unwrappable": true
  },
  "resolution": {
    "width": 1920,
    "height": 1080,
    "scale": "fit"
  },
  "locales": {
    "en-US": {
      "label": "Wii U Home Menu",
      "description": "Wii U Theme"
    },
    "es-ES": {
      "label": "Menú Principal Wii U",
      "description": "Tema de Wii U"
    },
    "fr-FR": {
      "label": "Menu Accueil Wii U",
      "description": "Thème Wii U"
    },
    "de-DE": {
      "label": "Wii U Startmenü",
      "description": "Wii U-Thema"
    },
    "ja-JP": {
      "label": "Wii U ホームメニュー",
      "description": "Wii U テーマ"
    },
    "ko-KR": {
      "label": "Wii U 홈 메뉴",
      "description": "Wii U 테마"
    },
    "pt-BR": {
      "label": "Menu Inicial Wii U",
      "description": "Tema Wii U"
    },
    "zh-Hans-CN": {
      "label": "Wii U 主菜单",
      "description": "Wii U 主题"
    },
    "zh-Hant": {
      "label": "Wii U 主選單",
      "description": "Wii U 主題"
    },
    "x-pirate": {
      "label": "Wii U Ship's Quarters",
      "description": "Wii U theme, arr!"
    },
    "x-uwu": {
      "label": "Wii U Home Menyu OwO",
      "description": "Wii U theme, uwu~"
    },
    "x-valley": {
      "label": "Wii U Home Menu, Like",
      "description": "Wii U theme, you know?"

    },
    "x-debug-en-US": {
      "label": "[DEBUG] Wii U Home Menu",
      "description": "[DEBUG] Wii U Theme"
    },
    "x-debug-zh-Hans-CN": {
      "label": "[调试] Wii U 主菜单",
      "description": "[调试] Wii U 主题"
    }
  },
  "manualArticle": {
    "permissionLevel": 0,
    "slug": "wiiu-homemenu-welcome",
    "publisher": "Ult & Co.",
    "author": "Ult & Co. Team",
    "date": "2024-01-01T12:00:00Z",
    "image": "https://placehold.co/400x240/007bff/ffffff?text=Wii+U+Home+Menu",
    "locales": {
      "en-US": {
        "title": "Welcome to the Wii U Home Menu!",
        "content": "Welcome to your Wii U Home Menu! Here you can launch all your applications and access settings easily.\n\n{style:bold|Getting Started:}\n• Browse apps on the home menu grid\n• Click or tap apps to launch them\n• Use arrow keys to navigate\n• Press HOME to return to the menu\n• Adjust icon size with +/- buttons\n\n{style:bold|Available Apps:}\n• Mail - Check your messages\n• eShop - Browse for new games and apps\n• Settings - Customize your experience\n• Music - Listen to original tracks\n• Game Info - View game details\n• Ult & Co. World - Explore lore and characters\n• And more!\n\n{style:bold|Tips:}\n• Enable debug mode in Settings to see experimental apps\n• Create your own layout by dragging apps\n• Check the manual (? button) for detailed app guides\n• Customize themes in Settings\n\n{style:bold|Updates:}\nWe're always working on new apps and features, so check back often for updates. Enjoy your Wii U experience!"
      },
      "es-ES": {
        "title": "¡Bienvenido al Menú Principal de Wii U!",
        "content": "¡Bienvenido a tu Menú Principal de Wii U! Aquí puedes iniciar todas tus aplicaciones y acceder a la configuración fácilmente."
      },
      "de-DE": {
        "title": "Willkommen im Wii U Startmenü!",
        "content": "Willkommen im Wii U Startmenü! Hier kannst du alle Anwendungen starten und Einstellungen einfach aufrufen."
      }
    }
  }
};
