export const app = {
    "id": "musicApp",
    "fileLocation": "/content/apps/musicApp/index.html",
    "icon": "/content/apps/musicApp/banners/musicApp_48px.png",
    "actualIcon": "/content/apps/musicApp/banners/musicApp_48px.png",
    
    // Custom icon options
    "wrapIcon": null, // Use default gift box
    "backgroundIcon": null, // Use default base
    
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",


    
    "onClick": (app, appGrid, languageData) => {
        console.log('[MusicApp] App clicked - showing unavailable modal');
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || app.label || 'Music',
                message: languageData?.messages?.appNotAvailable || 'This app is not yet available.',
                onConfirm: () => {
                    console.log('[MusicApp] Modal closed');
                }
            });
        } else {
            alert((app.localizedLabel || app.label) + '\n\nThis app is not yet available.');
        }
    },
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": true,
      "requiresAuth": false,
      "requiresFeatures": [],
      "unlockRequirements": {},
      "features": ["music", "audio", "player"]
    },
    
    "state": {
      "canBeUnopened": true,
      "alwaysOpened": false
    },
    
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Music",
        "description": "Listen to original Ult & Co. music"
      },
      "es-ES": {
        "label": "Música",
        "description": "Escucha música original de Ult & Co."
      },
      "fr-FR": {
        "label": "Musique",
        "description": "Écoutez de la musique originale de Ult & Co."
      },
      "de-DE": {
        "label": "Musik",
        "description": "Hören Sie Originalmusik von Ult & Co."
      },
      "ja-JP": {
        "label": "音楽",
        "description": "Ult & Co.のオリジナル音楽を聴く"
      },
      "ko-KR": {
        "label": "음악",
        "description": "Ult & Co.의 오리지널 음악"
      },
      "pt-BR": {
        "label": "Música",
        "description": "Ouça músicas originais da Ult & Co."
      },
      "pi-RR": {
        "label": "Sea Shanties",
        "description": "Listen to original sea shanties, arrr!"
      },
      "ma-RS": {
        "label": "Zeph'music",
        "description": "Original Ult & Co. Zeph'music"
      },
      "dr-AC": {
        "label": "Audio Files",
        "description": "Original Ult & Co. audio transmissions"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "music-manual",
      "publisher": "Ult & Co.",
      "author": "Music Team",
      "date": "2024-01-25T12:00:00Z",
      "image": "https://placehold.co/400x240/e91e63/ffffff?text=Music",
      "locales": {
        "en-US": {
          "title": "Music App - User Guide",
          "content": "Welcome to the Music App! Enjoy original compositions and soundtracks created by the Ult & Co. team.\n\n{style:bold|Features:}\n• Original music tracks\n• Background soundscapes\n• Game soundtracks\n• Ambient music\n• Playlist creation\n• Audio controls (play, pause, skip)\n• Volume adjustment\n• Repeat and shuffle modes\n\n{style:bold|How to Use:}\nBrowse through the music library and select a track to begin playback. Use the player controls at the bottom to manage playback.\n\n{style:bold|Creating Playlists:}\nYou can create custom playlists by selecting multiple tracks and saving them under a custom name. Access your playlists from the main menu.\n\n{style:bold|Tips:}\n• Use headphones for the best audio experience\n• Adjust volume in the settings if tracks are too loud or quiet\n• Enable shuffle mode to discover new tracks\n• Create mood-based playlists for different activities\n\nSit back, relax, and enjoy the music!"
        },
        "es-ES": {
          "title": "Aplicación de Música - Guía del Usuario",
          "content": "¡Bienvenido a la Aplicación de Música! Disfruta de composiciones originales y bandas sonoras creadas por el equipo de Ult & Co."
        }
      }
    }
  }
