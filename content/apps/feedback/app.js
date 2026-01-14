console.log('[Feedback App] Module loading...');

import { loadTranslation, getSupportedLanguages } from './i18n/index.js';

export const app = {
  "id": "feedback",
  "icon": "/content/apps/feedback/feedback_48px.png",
  "actualIcon": "/content/apps/feedback/feedback_48px.png",
  "unopened": true,
  "bannerModule": "/content/apps/feedback/banner.js",
  "bannerJingle": "jingle.mp3",
  "unopenedBannerModule": "/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js",
  "unopenedJingle": "/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav",
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
  "i18n": {
    "loadTranslation": loadTranslation,
    "getSupportedLanguages": getSupportedLanguages
  },
  "locales": {
    "en-US": {
      "label": "Feedback",
      "description": "Send feedback or report an issue"
    },
    "es-ES": {
      "label": "Comentarios",
      "description": "Envía tus comentarios o informa de un problema"
    },
    "fr-FR": {
      "label": "Commentaires",
      "description": "Envoyer des commentaires ou signaler un problème"
    },
    "de-DE": {
      "label": "Feedback",
      "description": "Senden Sie Feedback oder melden Sie ein Problem"
    },
    "ja-JP": {
      "label": "フィードバック",
      "description": "フィードバックを送信するか、問題を報告する"
    },
    "ko-KR": {
      "label": "피드백",
      "description": "피드백을 보내거나 문제를 신고하세요"
    },
    "pt-BR": {
      "label": "Comentários",
      "description": "Envie comentários或 reporte um problema"
    },
    "zh-Hans-CN": {
      "label": "反馈",
      "description": "发送反馈或报告问题"
    },
    "zh-Hant": {
      "label": "回饋",
      "description": "發送回饋或報告問題"
    },
    "x-pirate": {
      "label": "Feedback",
      "description": "Send yer thoughts or report a problem, matey"
    },
    "x-uwu": {
      "label": "Feedbwack OwO",
      "description": "Send feedbwack or wepowt an issue UwU"
    },
    "x-valley": {
      "label": "Feedback",
      "description": "Send, like, feedback or report an issue, you know?"
    },
    "x-debug-en-US": {
      "label": "[DEBUG] Feedback",
      "description": "[DEBUG] Send feedback or report an issue"
    },
    "x-debug-zh-Hans-CN": {
      "label": "[调试] 反馈",
      "description": "[调试] 发送反馈或报告问题"
    }
  },
  "manualArticle": {
    "permissionLevel": 0,
    "slug": "feedback-manual",
    "publisher": "Ult & Co.",
    "author": "Web Team",
    "date": "2024-02-25T12:00:00Z",
    "image": "https://placehold.co/400x240/0078d4/ffffff?text=Feedback",
    // Locales will be loaded from i18n folder dynamically
    "locales": {}
  }
};

console.log('[Feedback App] Module loaded successfully');
console.log('[Feedback App] Configuration:', app);
console.log('[Feedback App] Supported languages:', getSupportedLanguages());
