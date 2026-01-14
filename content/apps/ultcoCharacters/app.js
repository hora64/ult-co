export const app = {
    "id": "ultcoCharacters",
    "fileLocation": "/content/apps/ultcoCharacters/index.html",
    "icon": "assets/img/Users_48px.png",
    
    // Unopened banner configuration
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    
    "onClick": (app, appGrid, languageData) => {
        console.log('[UltcoCharacters] App clicked - showing unavailable modal');
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || app.label || 'Ult & Co. World',
                message: languageData?.messages?.appNotAvailable || 'This app is not yet available.',
                onConfirm: () => {
                    console.log('[UltcoCharacters] Modal closed');
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
      "features": ["characters", "lore", "world"]
    },
    
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Ult & Co. World",
        "description": "Explore characters and world lore"
      },
      "es-ES": {
        "label": "Mundo de Ult & Co.",
        "description": "Explora personajes y tradiciones del mundo"
      },
      "fr-FR": {
        "label": "Monde d'Ult & Co.",
        "description": "Explorez les personnages et l'univers"
      },
      "de-DE": {
        "label": "Ult & Co. Welt",
        "description": "Erkunden Sie Charaktere und Weltgeschichte"
      },
      "ja-JP": {
        "label": "Ult & Co.の世界",
        "description": "キャラクターと世界の伝承を探索"
      },
      "ko-KR": {
        "label": "Ult & Co. 월드",
        "description": "캐릭터와 세계관 탐험"
      },
      "pt-BR": {
        "label": "Mundo Ult & Co.",
        "description": "Explore personagens e tradições do mundo"
      },
      "pi-RR": {
        "label": "Ult & Co. Seas",
        "description": "Explore the crew and seas, matey!"
      },
      "ma-RS": {
        "label": "Ult & Co. Vel'world",
        "description": "Explore characters and world lore"
      },
      "dr-AC": {
        "label": "Ult & Co. Database",
        "description": "Access unit and world database"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "ultcocharacters-manual",
      "publisher": "Ult & Co.",
      "author": "Lore Team",
      "date": "2024-02-20T12:00:00Z",
      "image": "https://placehold.co/400x240/673ab7/ffffff?text=Characters",
      "locales": {
        "en-US": {
          "title": "Ult & Co. World - Lore Encyclopedia",
          "content": "Discover the rich world and diverse characters of Ult & Co.!\n\n{style:bold|Character Profiles:}\n• Detailed biographies for each character\n• Personality traits and quirks\n• Character relationships and interactions\n• Voice actors and creators\n• Character evolution over time\n\n{style:bold|World Lore:}\n• The history of the Ult & Co. universe\n• Major events and story arcs\n• World locations and environments\n• Factions and organizations\n• Cultural elements and traditions\n\n{style:bold|How to Navigate:}\n• Browse by character name\n• Filter by character type or faction\n• Search for specific lore topics\n• View relationship diagrams\n• Read chronological timelines\n\n{style:bold|Special Features:}\n• Interactive character relationship maps\n• Character voice samples\n• Concept art galleries\n• Behind-the-scenes development notes\n• Fan art submissions section\n\n{style:bold|Frequently Updated:}\nNew characters and lore are added regularly as the Ult & Co. universe expands. Check back often for updates!\n\nDive into the lore and become an expert on the Ult & Co. world!"
        },
        "es-ES": {
          "title": "Mundo de Ult & Co. - Enciclopedia de Tradiciones",
          "content": "¡Descubre el rico mundo y los diversos personajes de Ult & Co.!\n\n{style:bold|Perfiles de Personajes:}\n• Biografías detalladas de cada personaje\n• Rasgos y peculiaridades de la personalidad\n• Relaciones e interacciones entre personajes\n• Actores de voz y creadores\n• Evolución del personaje a lo largo del tiempo\n\n{style:bold|Tradiciones del Mundo:}\n• La historia del universo de Ult & Co.\n• Principales eventos y arcos de la historia\n• Ubicaciones y entornos del mundo\n• Facciones y organizaciones\n• Elementos culturales y tradiciones\n\n{style:bold|Cómo Navegar:}\n• Navegar por nombre de personaje\n• Filtrar por tipo de personaje o facción\n• Buscar temas de tradición específicos\n• Ver diagramas de relaciones\n• Leer líneas de tiempo cronológicas\n\n{style:bold|Características Especiales:}\n• Mapas de relaciones entre personajes interactivos\n• Muestras de voz de personajes\n• Galerías de arte conceptual\n• Notas de desarrollo detrás de escena\n• Sección de envíos de fan art\n\n{style:bold|Actualizaciones Frecuentes:}\nSe añaden regularmente nuevos personajes y tradiciones a medida que se expande el universo de Ult & Co. ¡Vuelve a consultar a menudo para ver las actualizaciones!"
        }
      }
    }
  }
