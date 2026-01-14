export const app = {
    "id": "contestellations",
    "icon": "assets/img/Camera_48px.png",
    "actualIcon": "assets/img/Camera_48px.png",
    
    // Custom icon options (null = use CSS variable defaults)
    "wrapIcon": null, // Uses --hs-unopened-icon from CSS
    "backgroundIcon": null, // Uses --hs-default-background-icon from CSS
    
    // Unopened banner configuration (null = use CSS variable defaults)
    "unopenedBannerModule": null, // Uses --hs-unopened-banner-module from CSS
    "unopenedJingle": null, // Uses --hs-unopened-jingle from CSS
    
    "fileLocation": "/content/apps/contestellations/contestellations.html",
    "onClick": (app, appGrid, languageData) => {
        console.log('[Contestellations] App clicked - showing unavailable modal');
        console.log('[Contestellations] app.unopened:', app.unopened);
        if (window.modalManager) {
            window.modalManager.showInfoModal({
                title: app.localizedLabel || app.label || 'Contest Info',
                message: languageData?.messages?.appNotAvailable || 'This app is not yet available.',
                onConfirm: () => {
                    console.log('[Contestellations] Modal closed');
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
      "features": ["contests", "competitions", "events"]
    },
    "resolution": {
      "width": 400,
      "height": 480,
      "scale": "fit"
    },
    "locales": {
      "en-US": {
        "label": "Contest Info",
        "description": "Browse competitions hosted by Ult & Co."
      },
      "es-ES": {
        "label": "Info del Concurso",
        "description": "Explora los concursos organizados por Ult & Co."
      },
      "fr-FR": {
        "label": "Infos Concours",
        "description": "Parcourez les concours organisés par Ult & Co."
      },
      "de-DE": {
        "label": "Wettbewerbsinfos",
        "description": "Durchsuchen Sie Wettbewerbe von Ult & Co."
      },
      "ja-JP": {
        "label": "コンテスト情報",
        "description": "Ult & Co.主催のコンテスト情報"
      },
      "ko-KR": {
        "label": "콘테스트 정보",
        "description": "Ult & Co.가 주최하는 대회 정보"
      },
      "pt-BR": {
        "label": "Informações do Concurso",
        "description": "Navegue pelas competições da Ult & Co."
