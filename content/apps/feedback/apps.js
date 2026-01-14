export const app = {
  "id": "feedback",
  "icon": "assets/img/.jpg",
  "banner": "banner.png",
  "bannerModule": "/content/apps/feedback/banner.js",
  "bannerJingle": "jingle.mp3",
  "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
  "unopenedJingle": "/content/common/banners/unopened/TestJingle.mp3",
  "fileLocation": "/content/apps/feedback/feedback.html",
  "onClick": "window.open('https://forms.gle/5adoCUSrjt33D1kQ9', '_blank')",
  "permissions": {
    "level": 0,
    "launchable": true,
    "unwrappable": true,
    "unlockRequirements": {}
  },
  "resolution": {
    "width": 400,
    "height": 480,
    "scale": "fit"
  },
  "locales": {
    "en-US": {
      "label": "Feedback",
      "description": "Send feedback or report an issue"
    },
    "es-ES": {
      "label": "Comentarios",
      "description": "EnvÃ­a tus comentarios o informa de un problema"
    },
    "de-DE": {
      "label": "Feedback",
      "description": "Senden Sie Feedback oder melden Sie ein Problem"
    }
  },
  "manualArticle": {
    "permissionLevel": 0,
    "slug": "feedback-manual",
    "publisher": "Ult & Co.",
    "author": "Web Team",
    "date": "2024-02-25T12:00:00Z",
    "image": "https://placehold.co/400x240/0078d4/ffffff?text=Feedback",
    "locales": {
      "en-US": {
        "title": "Feedback - Manual",
        "content": "Use this app to submit feedback or report issues.\n\n{style:bold|About:}\nThis app opens an external feedback form.\n\n{style:bold|Features:}\nâ€¢ Submit feedback\nâ€¢ Report bugs\nâ€¢ Help improve the platform"
      },
      "es-ES": {
        "title": "Comentarios - Manual",
        "content": "Usa esta aplicaciÃ³n para enviar comentarios o informar de problemas."
      },
      "de-DE": {
        "title": "Feedback - Handbuch",
        "content": "Verwenden Sie diese App, um Feedback zu senden oder Probleme zu melden."
      }
    }
  }
}