console.log('[Ult & Co. 2004 App] Module loading...');

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
      },
      "es-ES": {
        "label": "Ult & Co. 2004",
        "description": "Visita el sitio web de Ult & Co. de 2004"
      },
      "fr-FR": {
        "label": "Ult & Co. 2004",
        "description": "Visitez le site web Ult & Co. de 2004"
      },
      "de-DE": {
        "label": "Ult & Co. 2004",
        "description": "Besuchen Sie die Ult & Co. Website von 2004"
      },
      "ja-JP": {
        "label": "Ult & Co. 2004",
        "description": "2004年のUlt & Co.ウェブサイトを訪問"
      },
      "ko-KR": {
        "label": "Ult & Co. 2004",
        "description": "2004년 Ult & Co. 웹사이트 방문"
      },
      "pt-BR": {
        "label": "Ult & Co. 2004",
        "description": "Visite o site da Ult & Co. de 2004"
      },
      "zh-Hans-CN": {
        "label": "",
        "description": ""
      },
      "zh-Hant": {
        "label": "",
        "description": ""
      },
      "x-pirate": {
        "label": "Ult & Co. 2004 Treasure Map",
        "description": "Visit the 2004 treasure map, arr!"
      },
      "x-uwu": {
        "label": "Uwt & Co. 2004 OwO",
        "description": "Visit the 2004 Uwt & Co. website, uwu~"
      },
      "x-valley": {
        "label": "Ult & Co. 2004, Like",
        "description": "Visit the, like, 2004 Ult & Co. website"
      },
      "x-debug-en-US": {
        "label": "[DEBUG] Ult & Co. 2004",
        "description": "[DEBUG] Visit the 2004 Ult & Co. website"
      },
      "x-debug-zh-Hans-CN": {
        "label": "",
        "description": ""
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "ultco2004-about",
      "publisher": "Ult & Co.",
      "author": "Ult & Co. Team",
      "date": "2024-01-01T12:00:00Z",
      "image": "https://placehold.co/400x240/007bff/ffffff?text=Ult+%26+Co.+2004",
      "locales": {
        "en-US": {
          "title": "About Ult & Co. 2004",
          "content": "Step back in time and experience the early days of Ult & Co. with our faithful recreation of the 2004 website!\n\n{style:bold|What's Inside:}\n• Original 2004 website design\n• Classic web aesthetics\n• Historical content and media\n• Interactive demos and clips\n\n{style:bold|Credits:}\n• {style:bold|FNC} - Demo creation and clip recording\n• Ult & Co. Team - Website recreation and preservation\n\n{style:bold|Experience:}\nThis app provides a fullscreen experience of the original Ult & Co. 2004 website. Navigate through the site to discover the early history of Ult & Co. and experience the web design trends of the mid-2000s.\n\n{style:bold|Note:}\nThis is a historical recreation intended to preserve and showcase the evolution of Ult & Co. over the years. Some features may not function exactly as they did in 2004 due to modern browser limitations."
        },
        "es-ES": {
          "title": "Acerca de Ult & Co. 2004",
          "content": "¡Retrocede en el tiempo y experimenta los primeros días de Ult & Co. con nuestra fiel recreación del sitio web de 2004!"
        },
        "fr-FR": {
          "title": "À propos de Ult & Co. 2004",
          "content": "Remontez le temps et découvrez les débuts d'Ult & Co. avec notre fidèle recréation du site web de 2004 !"
        },
        "de-DE": {
          "title": "Über Ult & Co. 2004",
          "content": "Reisen Sie zurück in die Zeit und erleben Sie die frühen Tage von Ult & Co. mit unserer originalgetreuen Nachbildung der Website von 2004!"
        },
        "ja-JP": {
          "title": "Ult & Co. 2004について",
          "content": "2004年のウェブサイトの忠実な再現で、Ult & Co.の初期の日々を体験してください！"
        },
        "ko-KR": {
          "title": "Ult & Co. 2004 소개",
          "content": "2004년 웹사이트의 충실한 재현으로 Ult & Co.의 초기 시절을 경험해보세요!"
        },
        "pt-BR": {
          "title": "Sobre Ult & Co. 2004",
          "content": "Volte no tempo e experimente os primeiros dias da Ult & Co. com nossa fiel recriação do site de 2004!"
        },
        "zh-Hans-CN": {
          "title": "",
          "content": ""
        },
        "zh-Hant": {
          "title": "",
          "content": ""
        },
        "x-pirate": {
          "title": "About th' Ult & Co. 2004 Treasure Map",
          "content": "Set sail back in time and experience the early days of Ult & Co. with our faithful recreation of the 2004 treasure map, arrr!\n\n{style:bold|What's Inside:}\n• Original 2004 treasure map design\n• Classic web aesthetics from the seven seas\n• Historical booty and media\n• Interactive demos and clips, matey!\n\n{style:bold|Credits:}\n• {style:bold|FNC} - Demo creation and clip recording\n• Ult & Co. Crew - Website recreation and preservation\n\n{style:bold|Experience:}\nThis app provides a fullscreen experience of the original Ult & Co. 2004 website. Navigate through the site to discover the early history of Ult & Co., arrr!"
        },
        "x-uwu": {
          "title": "About Uwt & Co. 2004 OwO",
          "content": "Step back in time and expewience the eawly days of Uwt & Co. with ouw faithful wecweation of the 2004 website, uwu~\n\n{style:bold|What's Inside:}\n• Owiginaw 2004 website design OwO\n• Cwassic web aesthetics uwu\n• Histowical content and media >//<\n• Intewactive demos and cwips!\n\n{style:bold|Credits:}\n• {style:bold|FNC} - Demo cweation and cwip wecowding uwu~\n• Uwt & Co. Team - Website wecweation and pwesewvation OwO\n\n{style:bold|Expewience:}\nThis app pwovides a fuwwscreen expewience of the owiginaw Uwt & Co. 2004 website, uwu~"
        },
        "x-valley": {
          "title": "About Ult & Co. 2004, Like",
          "content": "Step back in time and, like, experience the early days of Ult & Co. with our, like, totally faithful recreation of the 2004 website!\n\n{style:bold|What's Inside:}\n• Original 2004 website design, like\n• Classic web aesthetics\n• Historical content and media\n• Interactive demos and clips, totally\n\n{style:bold|Credits:}\n• {style:bold|FNC} - Demo creation and clip recording, like\n• Ult & Co. Team - Website recreation and preservation\n\n{style:bold|Experience:}\nThis app provides a, like, fullscreen experience of the original Ult & Co. 2004 website."
        },
        "x-debug-en-US": {
          "title": "[DEBUG] About Ult & Co. 2004",
          "content": "[DEBUG] Step back in time and experience the early days of Ult & Co. with our faithful recreation of the 2004 website!\n\n{style:bold|Credits:}\n• {style:bold|FNC} - Demo creation and clip recording"
        },
        "x-debug-zh-Hans-CN": {
          "title": "",
          "content": ""
        }
      }
    }
  }

console.log('[Ult & Co. 2004 App] Module loaded successfully');
console.log('[Ult & Co. 2004 App] Configuration:', app);
