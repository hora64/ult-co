export const app = {
    "id": "adventure",
    "fileLocation": "/content/apps/adventure/index.html",
    "icon": "assets/img/Globe_48px.png",
    "actualIcon": "assets/img/Globe_48px.png",
    
    // Custom icon options
    "wrapIcon": null, // Use default gift box
    "backgroundIcon": null, // Use default base
    
    // Unopened banner configuration
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    
    "onClick": (app, appGrid, languageData) => {
        console.log('[Adventure] App clicked - showing unavailable modal');
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || app.label || 'Adventure',
                message: languageData?.messages?.appNotAvailable || 'This app is not yet available.',
                onConfirm: () => {
                    console.log('[Adventure] Modal closed');
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
      "features": ["game", "adventure", "interactive"]
    },
    
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Adventure",
        "description": "Embark on an exciting adventure game"
      },
      "es-ES": {
        "label": "Aventura",
        "description": "Embárcate en un emocionante juego de aventuras"
      },
      "de-DE": {
        "label": "Abenteuer",
        "description": "Begib dich auf ein aufregendes Abenteuerspiel"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "adventure-manual",
      "publisher": "Ult & Co.",
      "author": "Game Team",
      "date": "2024-02-05T12:00:00Z",
      "image": "https://placehold.co/400x240/4caf50/ffffff?text=Adventure",
      "locales": {
        "en-US": {
          "title": "Adventure Game - Player's Guide",
          "content": "Embark on an exciting adventure! Explore mysterious lands, solve puzzles, and uncover secrets.\n\n{style:bold|How to Play:}\n• Use arrow keys or WASD to move your character\n• Press SPACE to interact with objects and NPCs\n• Check your inventory with 'I' key\n• Open the map with 'M'\n• Pause the game with ESC\n• Save your progress frequently with 'S'\n\n{style:bold|Game Objectives:}\n• Explore the world and discover hidden areas\n• Complete quests and missions\n• Collect items and power-ups\n• Solve environmental puzzles\n• Defeat enemies and bosses\n\n{style:bold|Tips for Success:}\n• Talk to every NPC for valuable information and quests\n• Explore thoroughly - secrets are hidden everywhere\n• Save your game regularly to avoid losing progress\n• Experiment with different item combinations\n• Check your map frequently to avoid getting lost\n• Rest at save points to restore health\n\n{style:bold|Controls Quick Reference:}\nMovement: Arrow Keys / WASD\nInteract: SPACE\nInventory: I\nMap: M\nPause: ESC\nSave: S\n\nGood luck on your adventure!"
        },
        "es-ES": {
          "title": "Juego de Aventura - Guía del Jugador",
          "content": "¡Embárcate en una emocionante aventura! Explora tierras misteriosas, resuelve acertijos y descubre secretos."
        }
      }
    }
  }
