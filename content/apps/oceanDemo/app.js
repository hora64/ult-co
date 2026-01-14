export const app = {
    "id": "oceanDemo",
    "appId": "oceanDemo",
    "appVersion": "1.0.0",
    "fileLocation": "/content/apps/oceanDemo/index.html",
    "icon": "assets/img/Globe_48px.png",
    "actualIcon": "assets/img/Globe_48px.png",
    
    // Custom icon options
    "wrapIcon": null, // Use default gift box
    "backgroundIcon": null, // Use default base
    
    "bannerModule": "/content/apps/oceanDemo/banner/ocean.js",
    
    // Unopened banner configuration
    "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
    "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
    
    "onClick": (app, appGrid, languageData) => {
        console.log('[OceanDemo] App clicked - showing debug message');
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || app.label || 'Ocean Demo',
                message: languageData?.messages?.demoApp || 'This is a demo app for testing.',
                onConfirm: () => {
                    console.log('[OceanDemo] Modal closed');
                }
            });
        } else {
            alert((app.localizedLabel || app.label) + '\n\nThis is a demo app for testing homescreen functionality.');
        }
    },
    "permissions": {
      "level": 0,
      "launchable": true,
      "unwrappable": true,
      "requiresAuth": false,
      "requiresFeatures": [],
      "unlockRequirements": {},
      "features": ["demo", "3d", "graphics"]
    },
    
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Ocean Demo",
        "description": "3D ocean simulation demo"
      },
      "es-ES": {
        "label": "Demo del Océano",
        "description": "Demo de simulación de océano 3D"
      },
      "fr-FR": {
        "label": "Démo Océan",
        "description": "Démo de simulation d'océan 3D"
      },
      "de-DE": {
        "label": "Ozean-Demo",
        "description": "3D-Ozean-Simulationsdemo"
      },
      "ja-JP": {
        "label": "海洋デモ",
        "description": "3D海洋シミュレーションデモ"
      },
      "ko-KR": {
        "label": "바다 데모",
        "description": "3D 바다 시뮬레이션 데모"
      },
      "pt-BR": {
        "label": "Demonstração do Oceano",
        "description": "Demo de simulação de oceano 3D"
      },
      "pi-RR": {
        "label": "Ocean Demo",
        "description": "3D ocean simulation, perfect for sailors!"
      },
      "ma-RS": {
        "label": "Vor'ocean Demo",
        "description": "3D ocean Keph'simulation"
      },
      "dr-AC": {
        "label": "Ocean Simulation",
        "description": "3D ocean environment simulation"
      }
    },
    "manualArticle": {
      "permissionLevel": 0,
      "slug": "oceandemo-manual",
      "publisher": "Ult & Co.",
      "author": "Graphics Team",
      "date": "2024-02-10T12:00:00Z",
      "image": "https://placehold.co/400x240/00bcd4/ffffff?text=Ocean",
      "locales": {
        "en-US": {
          "title": "Ocean Demo - Technical Guide",
          "content": "Experience a beautiful 3D ocean simulation with realistic water effects powered by Three.js.\n\n{style:bold|Features:}\n• Real-time 3D rendering with WebGL\n• Dynamic wave simulation using shaders\n• Interactive camera controls\n• Physically-based rendering\n• Reflections and refractions\n• Foam and spray effects\n\n{style:bold|Controls:}\n• Mouse: Rotate camera view\n• Scroll: Zoom in and out\n• Click and drag: Pan the view\n• Reset button: Return to default view\n\n{style:bold|Technical Details:}\nThis demo showcases advanced graphics techniques including:\n• Vertex displacement for wave animation\n• Normal mapping for surface detail\n• Fresnel effects for realistic reflections\n• Procedural noise for natural movement\n\n{style:bold|Performance Tips:}\n• Close other applications for smoother performance\n• Lower your screen resolution if experiencing lag\n• The demo works best on modern browsers with WebGL 2.0 support\n\nRelax and enjoy the peaceful ocean scene!"
        },
        "es-ES": {
          "title": "Demo del Océano - Guía Técnica",
          "content": "Experimenta una hermosa simulación de océano 3D con efectos de agua realistas."
        }
      }
    }
  }
