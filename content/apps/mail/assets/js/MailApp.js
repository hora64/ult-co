import { loadArticles } from "../../articles/i18n/index.js";
import { TopScreen } from "./TopScreen.js";
import { BottomScreen } from "./BottomScreen.js";
import * as THREE from "three";
import {
  UIComponent,
  AudioManager,
  RoughPaper,
  LightPaper,
  WhitePaper,
  StandardPaper,
  EnvelopePaper,
  SkyMaterial,
  RichTextRenderer,
  ImageManager
} from "/content/common/utils/index.js";
import { getPermissionLevel } from "/content/common/utils/permissions.js";
import { loadTranslation, getSupportedLanguages } from "../../i18n/index.js";
import { applyLanguageFont } from "../../i18n/fonts.js";

let appInstance = null;
let initialSlugFromMessage = null;
let initialLanguageFromMessage = null;

window.addEventListener("message", (event) => {
  console.log("[Mail App] Global listener received message:", event.data);
  if (event.data && event.data.type === "deep-link") {
    if (event.data.slug) {
      console.log(`[Mail App] Deep link slug received: "${event.data.slug}"`);
      initialSlugFromMessage = event.data.slug;
    }
    if (event.data.language) {
      console.log(`[Mail App] Deep link language received: "${event.data.language}"`);
      initialLanguageFromMessage = event.data.language;
    }

    if (appInstance && appInstance.allAnnouncements.length > 0) {
      console.log(`[Mail App] App is ready, processing deep link immediately`);
      appInstance.handleDeepLink(initialSlugFromMessage, initialLanguageFromMessage);
    } else {
      console.log(`[Mail App] App not ready yet, storing for later`);
    }
  }
});

export class AnnouncementsApp extends UIComponent {
  constructor(rootId) {
    super();
    console.log('[Mail App] ?? Constructor called with rootId:', rootId);

    this.root = document.getElementById(rootId);

    if (!this.root) {
      const errorMsg = `Root element with id "${rootId}" not found!`;
      console.error(`[Mail App] ? ${errorMsg}`);
      throw new Error(errorMsg);
    }

    console.log('[Mail App] ? Root element found');

    this.appId = "announcements-app";
    this.appLabel = "Mail";
    this.allAnnouncements = [];
    this.filteredAnnouncements = [];
    this.selectedArticle = null;
    this.articleNavigationStack = []; // NEW: Track article navigation hierarchy
    this.searchQuery = "";
    this.tagSearchQuery = "";
    this.hyperlinks = [];
    this.checkboxes = [];
    this.sprites = {};
    this.imageManager = new ImageManager();
    this.allTags = [];
    this.activeFilters = {
      sort: "date-desc",
      tag: "All",
      readStatus: "all",
    };
    this.userTimeZone = null;
    this.language = localStorage.getItem("userLanguage") || "en-US";
    this.translations = {};
    this.audioManager = new AudioManager(this);
    this.sounds = this.audioManager.sounds;
    this.chineseFontLoaded = false; // Track Chinese font loading status
    this.cssVars = {
      "--ds-bg": getComputedStyle(document.documentElement).getPropertyValue("--ds-bg"),
      "--ds-bg-grad": getComputedStyle(document.documentElement).getPropertyValue("--ds-bg-grad"),
      "--ds-bg-grad-start-color": "#FFD580",
      "--ds-bg-grad-end-color": "#DDAA55",
      "--ds-text": "#000000",
      "--ds-text-subtle": "#333333",
      "--ds-accent-blue": "#0d6efd",
      "--ds-accent-blue-dark": "#0b5ed7",
      "--ds-accent-red": "#dc3545",
      "--ds-interactive-bg": "rgba(0,0,0,0.08)",
      "--ds-interactive-hover": "rgba(0,0,0,0.15)",
      "--ds-list-bg": "#DDAA55",
      blockSpacing: 10,
      articleContentHorizontalPadding: 0,
      articleContentVerticalPadding: 15,
    };
    this.firstShareDone = false;
    this.articleContentTextWidth = 256;
    this.lineSpacingFactor = 1.5;
    this.articleTitleLineSpacingFactor = 1.2;
    this.articleTitleTextWidth = 256;
    this.lastKnownUnopenedCount = 0;

    this.timeSystem = {
      globalTime: 0,
      dayTime: 0,
      manualTime: true,
      timeSpeed: 0,
      sunPosition: new THREE.Vector3(0, 5, 10),
      moonPosition: new THREE.Vector3(0, 5, -10),
      settings: {
        enableVisualEffects: true,
      },
      weatherEffects: {
        rain: { active: false, intensity: 0, particles: null },
        bloodMoon: { active: false, intensity: 0 },
      },
      skyColors: {
        midnight: { top: new THREE.Color(0.02, 0.02, 0.08), middle: new THREE.Color(0.01, 0.01, 0.05), bottom: new THREE.Color(0.005, 0.005, 0.02) },
        sunriseStart: { top: new THREE.Color(0.1, 0.05, 0.1), middle: new THREE.Color(0.05, 0.02, 0.08), bottom: new THREE.Color(0.02, 0.01, 0.05) },
        sunrisePeak: { top: new THREE.Color(1.0, 0.5, 0.3), middle: new THREE.Color(0.8, 0.3, 0.2), bottom: new THREE.Color(0.3, 0.1, 0.1) },
        morning: { top: new THREE.Color(0.7, 0.9, 1.2), middle: new THREE.Color(0.4, 0.7, 1.0), bottom: new THREE.Color(0.1, 0.3, 0.8) },
        midday: { top: new THREE.Color(0.9, 1.0, 1.3), middle: new THREE.Color(0.5, 0.8, 1.1), bottom: new THREE.Color(0.2, 0.4, 0.9) },
        sunsetStart: { top: new THREE.Color(1.0, 0.6, 0.3), middle: new THREE.Color(0.9, 0.4, 0.2), bottom: new THREE.Color(0.4, 0.2, 0.1) },
        sunsetPeak: { top: new THREE.Color(0.8, 0.3, 0.1), middle: new THREE.Color(0.6, 0.2, 0.1), bottom: new THREE.Color(0.2, 0.05, 0.05) },
        evening: { top: new THREE.Color(0.2, 0.1, 0.3), middle: new THREE.Color(0.1, 0.05, 0.2), bottom: new THREE.Color(0.05, 0.02, 0.1) },
      },
      currentSkyColors: { top: new THREE.Color(), middle: new THREE.Color(), bottom: new THREE.Color() },
      timePhases: [
        { name: "Night", start: 21, end: 5, from: "evening", to: "midnight", sun: (t) => 0, moon: (t) => THREE.MathUtils.smoothstep(0.5 - t * 0.5, 0, 1), ambient: (t) => 0.2 * (1 - t * 0.5), hsl: (t) => [0.55 + t * 0.05, 0.3 * (1 - t * 0.3), 0.5 * (1 - t * 0.6)] },
        { name: "Dawn", start: 5, end: 7, from: "midnight", to: "sunriseStart", sun: (t) => THREE.MathUtils.smoothstep(t * 0.2, 0, 1), moon: (t) => 0.8 * (1 - THREE.MathUtils.smoothstep(t, 0.7, 1)), ambient: (t) => 0.1 + THREE.MathUtils.smoothstep(t * 0.3, 0, 1) * 0.3, hsl: (t) => [0.6 - t * 0.1, 0.3 + t * 0.2, 0.5 + t * 0.3] },
        { name: "Morning", start: 7, end: 10, from: "sunriseStart", to: "morning", sun: (t) => THREE.MathUtils.smoothstep(t * 1.2, 0.3, 1), moon: (t) => 0.2 * (1 - THREE.MathUtils.smoothstep(t, 0.8, 1)), ambient: (t) => 0.3 + THREE.MathUtils.smoothstep(t * 0.8, 0, 1) * 0.3, hsl: (t) => [0.1 + t * 0.07, 0.7 - t * 0.2, 0.7 + t * 0.2] },
        { name: "Late Morning", start: 10, end: 12, from: "morning", to: "midday", sun: (t) => 1.0 + t * 0.5, moon: (t) => 0, ambient: (t) => 0.5 + t * 0.1, hsl: (t) => [0.15 + t * 0.03, 0.55 - t * 0.15, 0.85 + t * 0.05] },
        { name: "Midday", start: 12, end: 14, from: "midday", to: "midday", sun: (t) => 1.5 - t * 0.3, moon: (t) => 0, ambient: (t) => 0.6 - t * 0.1, hsl: (t) => [0.18, 0.4, 0.9] },
        { name: "Afternoon", start: 14, end: 17, from: "midday", to: "sunsetStart", sun: (t) => 1.2 - t * 0.6, moon: (t) => 0, ambient: (t) => 0.4 - t * 0.1, hsl: (t) => [0.15 + t * 0.05, 0.5 + t * 0.1, 0.9 - t * 0.2] },
        { name: "Evening", start: 17, end: 19, from: "sunsetStart", to: "sunsetPeak", sun: (t) => 0.6 - t * 0.6, moon: (t) => t * 0.8, ambient: (t) => 0.3 + t * 0.1, hsl: (t) => [0.2 + t * 0.05, 0.6 + t * 0.2, 0.7 - t * 0.3] },
        { name: "Dusk", start: 19, end: 21, from: "sunsetPeak", to: "evening", sun: (t) => 0, moon: (t) => 0.8 - t * 0.3, ambient: (t) => 0.4 - t * 0.2, hsl: (t) => [0.6 - t * 0.1, 0.5 - t * 0.2, 0.4 + t * 0.1] },
      ],
      updateTime: function (deltaMinutes) { },
    };
    this.richTextRenderer = new RichTextRenderer(this);
    this.clock = new THREE.Clock();

    console.log('[Mail App] ? Constructor completed successfully');
  }

  t(key, replacements = {}) {
    const keys = key.split(".");
    let value = this.translations;
    for (const k of keys) {
      value = value ? value[k] : undefined;
    }
    let str = value || key;
    for (const placeholder in replacements) {
      str = str.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return str;
  }

  async loadTranslations() {
    try {
      console.log('[Mail App] Loading translations...');
      const userLang = localStorage.getItem("userLanguage") || "en-US";
      this.language = userLang;

      // Lazy load only the needed translation
      this.translations = await loadTranslation(userLang);

      // Apply language-specific font to the app
      if (this.root) {
        applyLanguageFont(this.root, userLang, this.translations);
      }

      console.log(`[Mail App] Translations loaded for ${userLang}`);
    } catch (error) {
      console.error('[Mail App] Failed to load translations:', error);
      // Fallback to English
      this.translations = await loadTranslation('en-US');
      this.language = 'en-US';
    }
  }

  /**
   * Helper method to verify font is loaded and available
   * @param {string} fontFamily - Font family name to check
   * @returns {boolean} True if font is loaded
   */
  _isFontLoaded(fontFamily) {
    try {
      return document.fonts.check(`16px ${fontFamily}`);
    } catch (error) {
      console.warn(`[Mail App] Error checking font ${fontFamily}:`, error);
      return false;
    }
  }

  _drawTextOnCanvas(
    ctx,
    text,
    x,
    y,
    font,
    color,
    textAlign = "left",
    textBaseline = "alphabetic",
    maxWidth = Infinity,
    lineSpacingFactorToUse = this.lineSpacingFactor
  ) {
    if (!ctx) {
      console.error("Canvas rendering context is null. Cannot draw text.");
      return 0;
    }

    ctx.save();

    // Use Chinese font if loaded and language is Chinese
    const userLanguage = this.language || localStorage.getItem("userLanguage") || "en-US";
    if ((userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant') && this.chineseFontLoaded) {
      // Replace font family while preserving size and style
      // Handles formats like: "16px Rodin", "bold 16px Rodin", "16px 'Rodin'", etc.
      font = font
        .replace(/(['"]?)Rodin\1/g, '"DFPHeiW5-GB"')
        .replace(/\bRodin\b/g, 'DFPHeiW5-GB');

      console.log(`[Mail App] Using Chinese font for canvas text: ${font}`);
    }

    ctx.font = font;
    ctx.fillStyle = color !== undefined && color !== null ? color : "black";
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.font = font;
    const tempMetrics = tempCtx.measureText("M");
    const actualLineHeight = (tempMetrics.actualBoundingBoxAscent || 0) + (tempMetrics.actualBoundingBoxDescent || 0);

    if (maxWidth === Infinity) {
      ctx.fillText(text, x, y);
      ctx.restore();
      return actualLineHeight * lineSpacingFactorToUse;
    } else {
      // For Chinese text, split by characters instead of spaces
      const isChinese = userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant';
      const units = isChinese ? text.split('') : text.split(" ");
      let line = "";
      let currentY = y;
      let totalHeightUsed = 0;

      for (let n = 0; n < units.length; n++) {
        const unit = units[n];
        const separator = (isChinese || line === '') ? '' : ' ';
        let testLine = line + separator + unit;
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth && line.length > 0) {
          ctx.fillText(line, x, currentY);
          totalHeightUsed += actualLineHeight * lineSpacingFactorToUse;
          currentY += actualLineHeight * lineSpacingFactorToUse;
          line = unit;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      totalHeightUsed += actualLineHeight * lineSpacingFactorToUse;
      ctx.restore();
      return totalHeightUsed;
    }
  }

  _showAppError(messageKey) {
    this.audioManager.playSound("errorBeep");
    const message = this.t(messageKey);
    console.error("App Error:", message);
  }

  async loadData() {
    try {
      console.log('[Mail App] ?? Loading mail data...');
      let announcementsData = [];
      const userLanguageKey = localStorage.getItem("userLanguage") || "en-US";

      // Load articles from i18n system
      announcementsData = await loadArticles(userLanguageKey);

      if (!announcementsData || announcementsData.length === 0) {
        console.warn(`[Mail App] ?? No mail data found for ${userLanguageKey}, using empty array`);
        this.allAnnouncements = [];
        return;
      }

      // Load articles from app.js if available (for backward compatibility)
      let appArticles = [];
      try {
        const appModule = await import('/content/apps/mail/app.js');
        if (appModule.app && appModule.app.articles) {
          appArticles = appModule.app.articles;
        }
      } catch (e) {
        console.warn('[Mail App] Could not load articles from app.js:', e);
      }

      // Merge i18n articles and appArticles
      const allArticles = [...announcementsData];

      // Add articles from app.js, extracting locale-specific content
      appArticles.forEach(article => {
        const localeData = article.locales[userLanguageKey] || article.locales['en-US'];
        if (localeData) {
          allArticles.push({
            slug: article.slug,
            title: localeData.title,
            content: localeData.content,
            author: article.author,
            publisher: article.publisher,
            date: article.date,
            image: article.image || 'https://placehold.co/400x240/DDAA55/333333?text=Article',
            iconPath: article.iconPath,
            tags: article.tags || [],
            permissionLevel: article.permissionLevel || 0,
            visible: true
          });
        }
      });

      this.allAnnouncements = allArticles.map((a) => ({
        ...a,
        read: false,
        visible: a.visible !== undefined ? a.visible : true,
        permissionLevel: a.permissionLevel || 0
      }));

      this.loadReadStatus();

      const allTags = new Set();
      this.allAnnouncements.forEach((a) => {
        if (a.tags) {
          a.tags.forEach((t) => allTags.add(t));
        }
      });
      this.allTags = [...allTags].sort();

      const allImagePromises = [];
      const uniqueIconPathsToLoad = new Set();

      this.allAnnouncements.forEach((ann) => {
        if (ann.iconPath) {
          uniqueIconPathsToLoad.add(ann.iconPath);
        }
      });

      uniqueIconPathsToLoad.forEach((pathOrKey) => {
        this.sprites[pathOrKey] = new Image();
        allImagePromises.push(
          new Promise((resolve) => {
            this.sprites[pathOrKey].onload = resolve;
            this.sprites[pathOrKey].onerror = () => {
              console.warn(`[Mail App] Failed to load icon: ${pathOrKey}`);
              resolve(); // Resolve anyway to not block
            };
            this.sprites[pathOrKey].src = pathOrKey;
          })
        );
      });
      await Promise.all(allImagePromises);

      // Preload article images in TopScreen for smooth transitions
      if (this.topScreen && typeof this.topScreen.preloadArticleImages === 'function') {
        this.topScreen.preloadArticleImages(this.allAnnouncements);
      }

      console.log(`[Mail App] ? Loaded ${this.allAnnouncements.length} announcements`);
    } catch (error) {
      console.error('[Mail App] ? Critical error loading data:', error);
      this.allAnnouncements = [];
      throw error; // Re-throw to be caught by start()
    }
  }

  loadReadStatus() {
    try {
      const readStatusMap = JSON.parse(localStorage.getItem("mailApp_readStatusMap") || "{}");
      this.allAnnouncements.forEach((ann) => {
        ann.read = readStatusMap[ann.slug] === true;
      });
    } catch (e) {
      console.error("Failed to load read status from localStorage:", e);
      localStorage.removeItem("mailApp_readStatusMap");
    }
  }

  saveReadStatus() {
    try {
      const readStatusMap = {};
      this.allAnnouncements.forEach((ann) => {
        if (ann.read) {
          readStatusMap[ann.slug] = true;
        }
      });
      localStorage.setItem("mailApp_readStatusMap", JSON.stringify(readStatusMap));
    } catch (e) {
      console.error("Failed to save read status to localStorage:", e);
    }
  }

  saveTotalUnopenedCount() {
    try {
      const unopenedCount = this.allAnnouncements.filter((a) => !a.read && a.visible).length;
      localStorage.setItem("mailApp_unopenedCount", unopenedCount.toString());
    } catch (e) {
      console.error("Failed to save total unopened count to localStorage:", e);
    }
  }

  loadTotalUnopenedCount() {
    try {
      const storedCount = localStorage.getItem("mailApp_unopenedCount");
      this.lastKnownUnopenedCount = storedCount ? parseInt(storedCount, 10) : 0;
    } catch (e) {
      console.error("Failed to load total unopened count from localStorage:", e);
      this.lastKnownUnopenedCount = 0;
    }
  }

  loadUserTimeZone() {
    try {
      this.userTimeZone = localStorage.getItem("userTimeZone");
    } catch (e) {
      console.error("Failed to load user time zone from localStorage:", e);
      this.userTimeZone = null;
    }
  }

  injectStyles() {
    const roughPaperBackgroundDataUrl = new RoughPaper().canvasBackgroundGenerator(320, 240).toDataURL();
    const lightPaperBackgroundDataUrl = new LightPaper().canvasBackgroundGenerator(320, 240).toDataURL();
    const headerPaperBackgroundDataUrl = new LightPaper({ cornerRadius: 8 }).canvasBackgroundGenerator(280, 48).toDataURL();
    const whitePaperBackgroundDataUrl = new WhitePaper().canvasBackgroundGenerator(320, 240).toDataURL();
    const paperBackgroundDataUrl = new StandardPaper().canvasBackgroundGenerator(320, 240).toDataURL();
    const envelopePaperBackgroundDataUrl = new EnvelopePaper().canvasBackgroundGenerator(320, 240).toDataURL();

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `:root { --ds-bg: #f0ead6; --ds-bg-grad: linear-gradient(180deg, #FFD580 0%, #DDAA55 100%); --ds-text: #000000; --ds-text-subtle: #333333; --ds-accent-blue: #0d6efd; --ds-bg-modal: #f8f1e0; --ds-accent-red: #dc3545; --ds-interactive-bg: rgba(0, 0, 0, 0.08); --ds-interactive-hover: rgba(0, 0, 0, 0.15); --ds-list-bg: #DDAA55; }
@font-face { font-family: "Rodin"; src: url("/content/common/fonts/FOT-RodinNTLG Pro DB.otf") format("opentype"); }
body { background: #111; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: "Rodin", sans-serif; overflow: hidden; image-rendering: pixelated; -webkit-font-smoothing: none; }
.ds-container { width: 400px; height: 480px; background: black; user-select: none; overflow: hidden; display: flex; flex-direction: column; align-items: center; position: relative; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
.top-screen { width: 400px; height: 240px; background: transparent; flex-shrink: 0; position: relative; overflow: hidden; }
.threejs-canvas { z-index: 1; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.article-image, .home-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease-in-out; image-rendering: pixelated; z-index: 2; will-change: opacity; }
.bottom-screen { width: 320px; height: 240px; background: var(--ds-bg); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
.bottom-screen-overlay { position: absolute; top: 240px; left: 50%; transform: translateX(-50%); width: 320px; height: 240px; pointer-events: none; z-index: 10; transition: background-color 0.5s ease-in-out; }
.view { width: 100%; height: 100%; display: flex; flex-direction: column; position: absolute; top: 0; left: 0; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(15px); pointer-events: none; }
.view.active { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
.list-view { align-items: center; }
.list-header { display: flex; gap: 8px; flex-shrink: 0; align-items: center; width: 280px; margin-bottom: 8px; margin-top: 8px;  background-repeat: no-repeat; background-size: cover; padding: 0 10px; height: 48px; box-sizing: border-box; position: relative; }
.canvas-input-wrapper { flex-grow: 1; height: 36px; overflow: hidden; }
.canvas-input-wrapper:focus { outline: none; }
.canvas-input-wrapper canvas { width: 100%; height: 100%; image-rendering: pixelated; }
.list-body-wrapper { flex-grow: 1; display: flex; position: relative; overflow: hidden; width: 280px; }
.list-body-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
.list-fade { position: absolute; left: 0; right: 0; width: 320px; height: 4px; z-index: 1; pointer-events: none; background: none; }
.list-fade-top { top: 52px; background: none; }
.list-fade-bottom { bottom: 40px; background: none; }
.article-body-wrapper { flex-grow: 1; display: flex; position: relative; overflow: hidden; width: 280px; margin: 0 auto; position: relative; }
.list-container { flex-grow: 1; overflow-y: auto; scrollbar-width: none; padding: 0; align-items: flex-start; display: flex; flex-direction: column; gap: 6px; height: 136px; width: 100%; padding-top: 10px; padding-bottom: 10px; box-sizing: border-box; }
.list-container::-webkit-scrollbar { display: none; }
.list-footer, .article-footer, .filter-footer { flex-shrink: 0; display: flex; justify-content: center; align-items: center; position: absolute; bottom: 0; left: 0; right: 0; height: 40px; }
.list-item-canvas { cursor: pointer; position: relative; width: 256px; height: 32px; image-rendering: pixelated; }
.unopened-sparkle-overlay { position: absolute; z-index: 50; pointer-events: none; transition: all 0.1s ease-out; }
.no-results-canvas { display: block; width: 280px; height: 100px; margin: 40px auto 0 auto; image-rendering: pixelated; }
.article-view { position: relative; }
.article-header-content { padding: 10px 0; flex-shrink: 0; width: 320px; min-height: 90px; height: auto; max-height: 150px; box-sizing: border-box; position: relative; overflow: visible; }
.scrollable-canvas-wrapper { flex-grow: 1; overflow-y: auto; scrollbar-width: none; height: 110px; position: relative; }
.scrollable-canvas-wrapper::-webkit-scrollbar { display: none; }
.article-content-canvas { display: block; height: auto; width: 280px; margin: 0 auto; image-rendering: pixelated; cursor: pointer; }
.article-html-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
.article-html-overlay > iframe { pointer-events: auto; border-radius: 6px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
.article-title-h1 { display: block; flex-grow: 1; line-height: 0; width: 256px; image-rendering: pixelated; flex-shrink: 0; }
.article-title-h1 canvas { width: 100%; height: 80px; image-rendering: pixelated; }
.article-meta-canvas { display: block; margin: 0 10px; width: 290px; height: 20px; image-rendering: pixelated; }
.author-profile { display: flex; align-items: center; padding: 8px 10px; margin: 5px 10px; background-color: rgba(0,0,0,0.03); border-radius: 6px; gap: 10px; cursor: pointer; transition: background-color 0.2s; }
.author-profile:hover { background-color: rgba(0,0,0,0.06); }
.author-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
.author-info { flex: 1; min-width: 0; overflow: hidden; }
.author-name-role { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.author-name { font-size: 13px; font-weight: bold; color: #000; }
.author-role { font-size: 12px; color: #666; }
.author-bio { font-size: 11px; color: #888; display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.article-controls-wrapper { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 5px 10px; margin: 0 10px; flex-wrap: wrap; }
.page-indicator-canvas { display: block; image-rendering: pixelated; }
.nav-button canvas { cursor: pointer; }
.nav-button:disabled canvas { cursor: not-allowed; opacity: 0.5; }
.favorite-button canvas { cursor: pointer; }
.author-profile-modal, .publisher-info-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: #FDF5E6; border-radius: 12px; padding: 20px; max-width: 280px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3); text-align: center; }
.filter-view { width: 100%; height: 100%; display: flex; flex-direction: column; position: absolute; top: 0; left: 0; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(15px); pointer-events: none; background: transparent; }
.filter-view.active { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
.filter-menu-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; image-rendering: pixelated; pointer-events: none; }
.filter-menu-content-overlay { position: absolute; top: 37px; left: 50%; transform: translateX(-50%); width: 280px; height: 163px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; z-index: 1; display: flex; flex-direction: column; gap: 8px; padding-bottom: 10px; box-sizing: border-box; pointer-events: auto; }
.filter-menu-content-overlay::-webkit-scrollbar { display: none; }
.filter-header { flex-shrink: 0; display: flex; justify-content: center; width: 320px; height: 32px; box-sizing: border-box; background: none; border-radius: 0; box-shadow: none; pointer-events: none; }
.filter-body-wrapper { margin: 0 auto; width: 280px; height: 168px; display: flex; flex-direction: row; overflow: hidden; flex-grow: 1; position: relative; }
.filter-heading-canvas, .filter-subheading-canvas { display: block; margin: 0 auto 10px auto; height: 32px; image-rendering: pixelated; }
.filter-subheading-canvas { height: 24px; margin-top: 15px; margin-left: auto; margin-right: auto; }
.filter-menu-content { padding: 0; height: 168px; flex-grow: 1; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
.filter-menu-content::-webkit-scrollbar { display: none; }
.filter-menu-fade-top { top: 32px; background: none; }
.filter-menu-fade-bottom { bottom: 40px; background: none; }
.filter-group, .filter-group-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; padding: 0 10px; }
.sparkle-overlay { z-index: 100; }
.close-button, .exit-button, .close-filter-button { height: 40px; padding-block: 0px; padding-inline: 0px; border-width: 0px; background-color: transparent; }
.share-button { all: unset; }
.filter-option { all: unset; }
.filter-option-tag { all: unset; }
.canvas-button { all: unset; display: block; cursor: pointer; padding: 0; border: none; margin: 0; outline: none; height: 36px; }
.canvas-button canvas { width: 100%; height: 100%; transition: none; image-rendering: pixelated; }
.canvas-button:disabled { cursor: not-allowed; }
.custom-scrollbar { flex-shrink: 0; position: absolute; right: 0; padding: 0 4px; cursor: grab; z-index: 2; }
.modal-container { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: opacity 0.2s, visibility 0.2s; z-index: 1000; }
.modal-container.active { opacity: 1; visibility: visible; }
.dropdown-dialog { position: relative; width: 280px; max-height: 220px; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; background: transparent; border: none; border-radius: 0; box-shadow: none; }
.modal-header-canvas { margin-bottom: 5px; }
.options-list-wrapper { flex: 1; display: flex; overflow: hidden; position: relative; }
.options-list { flex-grow: 1; overflow-y: auto; scrollbar-width: none; display: flex; flex-wrap: wrap; justify-content: center, gap: 5px; padding: 10px 0; }
.options-list::-webkit-scrollbar { display: none; }
.modal-dialog-wrapper { position: relative; border-radius: 8px; overflow: hidden; }
.modal-buttons { display: flex; justify-content: space-around; width: 100%; position: absolute; bottom: 10px; }
.dropdown-dialog.modal-buttons.dropdown-buttons { position: static; margin-top: 15px; }
.modal-top-fade, .modal-bottom-fade { position: absolute; left: 0; width: calc(100% - 16px); height: 15px; z-index: 2; pointer-events: none; background: linear-gradient(180deg, rgba(224, 208, 176, 0.9) 0%, transparent 100%); }
.modal-bottom-fade { bottom: 0; background: linear-gradient(0deg, rgba(224, 208, 176, 0.9) 0%, transparent 100%); }`;
    document.head.appendChild(styleSheet);
  }

  async start() {
    try {
      console.log('[Mail App] ?? Starting initialization...');
      appInstance = this;

      console.log('[Mail App] 1?? Loading translations...');
      await this.loadTranslations();

      console.log('[Mail App] 2?? Loading fonts...');
      await document.fonts.load('1px "Rodin"', " ");
      await document.fonts.ready;

      // Preload Chinese font if user language is Chinese
      const userLanguage = localStorage.getItem("userLanguage") || "en-US";
      if (userLanguage === 'zh-Hans-CN' || userLanguage === 'zh-Hant') {
        try {
          console.log('[Mail App] Preloading Chinese font DFPHeiW5-GB...');
          const chineseFont = new FontFace('DFPHeiW5-GB', 'url("/content/common/fonts/DFPHeiW5-GB.ttf")');
          await chineseFont.load();
          document.fonts.add(chineseFont);

          // Verify font is actually loaded
          const fontLoaded = this._isFontLoaded('DFPHeiW5-GB');
          if (fontLoaded) {
            console.log('[Mail App] Chinese font DFPHeiW5-GB loaded and verified successfully');
            this.chineseFontLoaded = true;
          } else {
            console.warn('[Mail App] Chinese font loaded but verification failed');
            this.chineseFontLoaded = false;
          }
        } catch (error) {
          console.warn('[Mail App] Failed to preload Chinese font, will use fallbacks:', error);
          this.chineseFontLoaded = false;
        }
      }

      console.log('[Mail App] 3?? Injecting styles...');
      this.injectStyles();

      console.log('[Mail App] 4?? Initializing audio...');
      try {
        await this.audioManager.initialize('/content/apps/mail/assets/audio-config.json');
        this.sounds = this.audioManager.sounds;
        console.log('[Mail App] ? Audio initialized');
      } catch (audioError) {
        console.warn('[Mail App] ?? Audio initialization failed, continuing without audio:', audioError);
        // Create dummy sound objects to prevent crashes
        this.sounds = {
          appLaunch: { play: () => { }, pause: () => { }, stop: () => { } },
          music: { play: () => { }, fade: () => { }, pause: () => { }, playing: () => false, stop: () => { } },
          click: { play: () => { } },
          swoosh: { play: () => { } },
          filterApply: { play: () => { } },
          shareConfirm: { play: () => { } },
          unopenedOpen: { play: () => { } },
          appExit: { play: () => { } },
          errorBeep: { play: () => { } }
        };
      }

      console.log('[Mail App] 5?? Setting up time system...');
      const now = luxon.DateTime.local();
      this.timeSystem.dayTime = now.hour * 60 + now.minute;
      this.timeSystem.globalTime = this.timeSystem.dayTime;

      console.log('[Mail App] 6?? Creating TopScreen...');
      try {
        this.topScreen = new TopScreen(this);
        console.log('[Mail App] ? TopScreen created');
      } catch (topScreenError) {
        console.error('[Mail App] ? TopScreen creation failed:', topScreenError);
        throw topScreenError;
      }

      console.log('[Mail App] 7?? Creating BottomScreen...');
      try {
        this.bottomScreen = new BottomScreen({
          onArticleSelect: (ann) => this.handleAnnouncementSelect(ann),
          onShare: () => this.handleShare(),
          onCloseArticle: (isExit) => this.handleCloseArticle(isExit),
          onSearch: (query) => this.handleSearch(query),
          onFilterChange: (filters, applyAndClose = false) => this.handleFilterChange(filters, applyAndClose),
          onShowFilter: () => this.bottomScreen.setView("filter", {
            tags: this.allTags,
            activeFilters: this.activeFilters,
            onFilterChange: (f, applyAndClose) => this.handleFilterChange(f, applyAndClose),
            tagSearchQuery: this.tagSearchQuery,
          }),
          sounds: this.sounds,
          sprites: this.sprites,
          appInstance: this,
        });
        console.log('[Mail App] ? BottomScreen created');
      } catch (bottomScreenError) {
        console.error('[Mail App] ? BottomScreen creation failed:', bottomScreenError);
        throw bottomScreenError;
      }

      console.log('[Mail App] 8?? Appending elements to DOM...');
      this.root.appendChild(this.topScreen.element);
      this.root.appendChild(this.bottomScreen.element);

      this.bottomScreenOverlay = this.createElement("div", "bottom-screen-overlay");
      this.root.appendChild(this.bottomScreenOverlay);

      console.log('[Mail App] 9?? Loading user data and preferences...');
      this.loadTotalUnopenedCount();
      this.loadUserTimeZone();
      this.topScreen.showHomeScreen(this.lastKnownUnopenedCount);

      console.log('[Mail App] ?? Loading mail data...');
      await this.loadData();

      console.log('[Mail App] 1??1?? Attaching event listeners...');
      this.attachEventListeners();

      console.log('[Mail App] 1??2?? Updating UI...');
      this.updateUI();

      console.log('[Mail App] 1??3?? Processing deep links...');
      if (initialSlugFromMessage || initialLanguageFromMessage) {
        console.log(`[Mail App] Processing stored deep link: ${initialSlugFromMessage}, language: ${initialLanguageFromMessage}`);
        await this.handleDeepLink(initialSlugFromMessage, initialLanguageFromMessage);
        initialSlugFromMessage = null;
        initialLanguageFromMessage = null;
      }

      console.log('[Mail App] 1??4?? Starting audio...');
      if (this.audioManager.audioSettings.backgroundAudio && this.sounds.music && this.sounds.music.play) {
        this.sounds.music.play();
        if (this.sounds.music.fade) {
          this.sounds.music.fade(0, this.audioManager._getVolume('music', this.sounds.music._volume), 3000);
        }
      }
      this.audioManager.playSound("appLaunch");

      console.log('[Mail App] 1??5?? Notifying parent window...');
      if (window.parent !== window) {
        window.parent.postMessage({ type: "app-ready" }, "*");
      }

      console.log('[Mail App] 1??6?? Starting animation loop...');
      this.animate();

      console.log('[Mail App] ? Initialization complete!');
    } catch (error) {
      console.error('[Mail App] ? CRITICAL ERROR during initialization:', error);
      console.error('[Mail App] Error stack:', error.stack);

      // Display error in UI
      if (this.root) {
        this.root.innerHTML = `
                    <div style="padding: 20px; color: white; background: #dc3545; font-family: monospace;">
                        <h2>Mail App Failed to Load</h2>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><strong>Type:</strong> ${error.name}</p>
                        <p style="font-size: 12px; margin-top: 20px;">Check browser console for details (F12)</p>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; cursor: pointer;">
                            Reload App
                        </button>
                    </div>
                `;
      }

      // Notify parent of failure
      if (window.parent !== window) {
        window.parent.postMessage({
          type: "app-error",
          appId: "mail",
          error: error.message
        }, "*");
      }
    }
  }

  _createSkyMaterial(timeSystem, skyRadius, options = {}) {
    return new SkyMaterial({
      topColor: options.topColor || timeSystem.currentSkyColors.top,
      middleColor: options.middleColor || timeSystem.currentSkyColors.middle,
      bottomColor: options.bottomColor || timeSystem.currentSkyColors.bottom,
      tintColor: options.tintColor || new THREE.Color(0xffffff),
      tintIntensity: options.tintIntensity || 0.0,
    });
  }

  attachEventListeners() {
    document.addEventListener("visibilitychange", () => {
      if (this.audioManager.audioSettings.music && this.sounds.music) {
        if (document.hidden && !this.audioManager.audioSettings.backgroundAudio) {
          this.sounds.music.pause();
        } else if (!document.hidden && this.audioManager.audioSettings.backgroundAudio) {
          if (!this.sounds.music.playing()) {
            this.sounds.music.play();
          }
        }
      }
    });

    // Listen for article page image changes
    document.addEventListener("article-page-image-change", (event) => {
      const { imageUrl, pageIndex, articleSlug } = event.detail;
      console.log(`[MailApp] Article page image change: ${articleSlug} page ${pageIndex}, image: ${imageUrl}`);

      if (imageUrl && this.topScreen) {
        // Update the top screen image with smooth transition
        this.topScreen.showArticleImage(imageUrl);
      }
    });

    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "debug-time-speed" && typeof event.data.speed === "number") {
        this.timeSystem.manualTime = event.data.speed === 0;
        this.timeSystem.timeSpeed = event.data.speed;
        console.log(`[Mail App] Debug: Time speed set to ${event.data.speed}x, manualTime: ${this.timeSystem.manualTime}`);
      }

      // Listen for time change events from settings app
      if (event.data && event.data.type === "timeChanged" && event.data.time) {
        console.log(`[Mail App] Time changed event received:`, event.data.time);
        const customTime = new Date(event.data.time);
        const systemTime = new Date();
        const offset = customTime.getTime() - systemTime.getTime();

        // Update TopScreen with new offset
        if (this.topScreen && typeof this.topScreen.registerTimeOffset === 'function') {
          this.topScreen.registerTimeOffset(offset);
        }
      }
    });
  }

  applyFiltersAndSort() {
    let result = [...this.allAnnouncements];
    const currentLevel = getPermissionLevel();

    // Filter based on permission level
    result = result.filter(a => {
      if (a.visible === false) return false;

      // Check if user has permission to view this article
      const articleLevel = a.permissionLevel || 0;
      return currentLevel >= articleLevel;
    });

    if (this.searchQuery) {
      const lowerQuery = this.searchQuery.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(lowerQuery) || a.author.toLowerCase().includes(lowerQuery));
    }

    if (this.activeFilters.tag && this.activeFilters.tag !== "All") {
      result = result.filter((a) => a.tags.includes(this.activeFilters.tag));
      result = result.filter((a) => a.tags && a.tags.includes(this.activeFilters.tag));
    }

    if (this.activeFilters.readStatus === "read") {
      result = result.filter((a) => a.read);
    } else if (this.activeFilters.readStatus === "unopened") {
      result = result.filter((a) => !a.read);
    }

    switch (this.activeFilters.sort) {
      case "date-asc":
        result.sort((a, b) => luxon.DateTime.fromISO(a.date).toMillis() - luxon.DateTime.fromISO(b.date).toMillis());
        break;
      case "author-asc":
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      default:
        result.sort((a, b) => luxon.DateTime.fromISO(b.date).toMillis() - luxon.DateTime.fromISO(a.date).toMillis());
        break;
    }
    this.filteredAnnouncements = result;
  }

  handleSearch(query = "") {
    this.searchQuery = query;
    this.applyFiltersAndSort();
    this.bottomScreen.setView("list", {
      announcements: this.filteredAnnouncements,
      searchQuery: this.searchQuery,
    });
  }

  handleFilterChange(newFilters, applyAndClose = false) {
    this.audioManager.playSound("click");
    if (newFilters.tag && this.activeFilters.tag === newFilters.tag) {
      this.activeFilters.tag = "All";
    } else {
      this.activeFilters = { ...this.activeFilters, ...newFilters };
    }

    if (applyAndClose) {
      this.audioManager.playSound("filterApply");
      this.applyFiltersAndSort();
      this.updateUI(true);
    } else {
      this.bottomScreen.setView("filter", {
        tags: this.allTags,
        activeFilters: this.activeFilters,
        onFilterChange: (f, applyAndCloseFlag) => this.handleFilterChange(f, applyAndCloseFlag),
        tagSearchQuery: this.tagSearchQuery,
      });
    }
  }

  updateUI(resetView = true) {
    const unopenedCount = this.allAnnouncements.filter((a) => !a.read && a.visible).length - 1;
    this.applyFiltersAndSort();
    this.saveTotalUnopenedCount();

    if (this.allAnnouncements.length > 0) {
      if (resetView) {
        this.selectedArticle = null;
        this.topScreen.showHomeScreen(unopenedCount);
        this.bottomScreen.setView("list", {
          announcements: this.filteredAnnouncements,
          searchQuery: this.searchQuery,
        });
      } else {
        if (this.bottomScreen.viewMode === "list") {
          this.bottomScreen.setView("list", {
            announcements: this.filteredAnnouncements,
            searchQuery: this.searchQuery,
          });
        } else if (this.bottomScreen.viewMode === "filter") {
          this.bottomScreen.setView("filter", {
            tags: this.allTags,
            activeFilters: this.activeFilters,
            onFilterChange: (f, applyAndCloseFlag) => this.handleFilterChange(f, applyAndCloseFlag),
            tagSearchQuery: this.tagSearchQuery,
          });
        }
      }
    } else {
      this.topScreen.articleImageElement.style.opacity = "0";
      this.topScreen.homeCanvas.style.opacity = "0";
      this.topScreen.mailScene.setOpacity(0);
      this.bottomScreen.listView.classList.remove("active");
      this.bottomScreen.articleView.classList.remove("active");
      this.bottomScreen.filterViewWrapper.classList.remove("active");
    }
  }

  async handleAnnouncementSelect(announcement, fromDeepLink = false) {
    this.audioManager.playSound("appLaunch");
    const wasUnopened = !announcement.read;
    this.selectedArticle = announcement;

    const articleInMasterList = this.allAnnouncements.find((a) => a.slug === announcement.slug);
    if (articleInMasterList) {
      articleInMasterList.read = true;
      this.saveReadStatus();
    }

    if (wasUnopened && !fromDeepLink) {
      this.audioManager.playSound("unopenedOpen");
    }

    this.topScreen.showArticleImage(announcement.image);
    const updatedArticle = { ...announcement, content: announcement.content || "No content available." };
    this.selectedArticle = updatedArticle;
    
    // NEW: Pass parent article info if this is a sub-article (credits)
    const hasParent = this.articleNavigationStack.length > 0;
    this.bottomScreen.setView("article", { 
      article: updatedArticle,
      parentArticleSlug: hasParent ? this.articleNavigationStack[this.articleNavigationStack.length - 1].slug : null
    });
  }

  handleShare() {
    if (!this.selectedArticle) return;

    const shareableLink = `${window.location.origin}/mail/${this.selectedArticle.slug}`;
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        this.audioManager.playSound("shareConfirm");
        this._showAppError("linkCopied");
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });

    if (!this.firstShareDone) {
      this.firstShareDone = true;
      setTimeout(() => {
        if (this.bottomScreen.articleView) {
          this.bottomScreen.articleView.drawSparkleEffect();
        }
      }, 100);
    }
  }

  handleCloseArticle(isExit = false) {
    if (isExit) {
      this.audioManager.playSound("appExit");
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'launchApp', appId: 'homeScreen', label: 'Home Screen', location: 'content/apps/homeScreen_3DS/homeScreen_3DS.html' }, '*');
      } else {
        console.warn('Not running in an iframe, cannot post message to parent.');
      }
    } else {
      this.audioManager.playSound("swoosh");
      
      // NEW: Check if there's a parent article in the navigation stack
      if (this.articleNavigationStack.length > 0) {
        // Pop the current article and navigate back to parent
        const parentArticle = this.articleNavigationStack.pop();
        console.log(`[Mail App] Navigating back to parent article: ${parentArticle.slug}`);
        this.handleAnnouncementSelect(parentArticle, true);
      } else {
        // No parent, return to list view
        this.selectedArticle = null;
        this.updateUI(true);
      }
    }
  }

  async handleDeepLink(slug, language = null) {
    console.log(`[Mail App] handleDeepLink called with slug: "${slug}", language: "${language}"`);
    console.log(`[Mail App] Total announcements loaded: ${this.allAnnouncements.length}`);
    console.log(`[Mail App] Available slugs:`, this.allAnnouncements.map(a => a.slug));

    // If language is specified, switch to that language first
    if (language && getSupportedLanguages().includes(language)) {
      console.log(`[Mail App] Switching to language: ${language}`);
      localStorage.setItem("userLanguage", language);
      this.language = language;

      // Reload translations for the new language
      this.translations = await loadTranslation(language);

      // Apply language font with translation object
      if (this.root) {
        applyLanguageFont(this.root, language, this.translations);
      }

      // Reload data to get articles in the new language
      await this.loadData();
      this.updateUI(false);
    }

    const article = this.allAnnouncements.find((a) => a.slug === slug);
    if (article) {
      console.log(`[Mail App] Article found:`, article);
      await this.handleAnnouncementSelect(article, true);
    } else {
      console.warn(`[Mail App] Deep link article with slug "${slug}" not found.`);
      console.warn(`[Mail App] Did you mean one of these?`, this.allAnnouncements.map(a => a.slug).slice(0, 5));
    }
  }

  // NEW: Get article by slug
  getArticleBySlug(slug) {
    return this.allAnnouncements.find(a => a.slug === slug);
  }

  // NEW: Open article by slug (for credits navigation)
  async openArticle(slug, pageIndex = 0) {
    const article = this.getArticleBySlug(slug);
    if (article) {
      console.log(`[Mail App] Opening article: ${slug}`);
      
      // NEW: Push current article to navigation stack (if we have one selected)
      if (this.selectedArticle) {
        console.log(`[Mail App] Pushing parent article to stack: ${this.selectedArticle.slug}`);
        this.articleNavigationStack.push(this.selectedArticle);
      }
      
      await this.handleAnnouncementSelect(article, false);
      
      // If pageIndex is specified and article has pages, navigate to that page
      if (pageIndex > 0 && article.pages && article.pages.length > pageIndex) {
        // The article component will handle page navigation
        // We could emit an event or directly access the article component if needed
        setTimeout(() => {
          const articleComponent = this.bottomScreen?.articleView?.currentArticleComponent;
          if (articleComponent && typeof articleComponent._goToPageDirect === 'function') {
            articleComponent._goToPageDirect(pageIndex);
          }
        }, 100);
      }
      return true;
    }
    return false;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    const time = elapsed * 1000;

    this.timeSystem.globalTime = time;

    if (this.bottomScreen) {
      this.bottomScreen.update(time);
    }
  }
}
