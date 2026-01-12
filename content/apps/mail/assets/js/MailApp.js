import { mailData } from "../mailbox/MailData.js";
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
import { translations as mailTranslations } from "../../i18n.js";

let appInstance = null;
let initialSlugFromMessage = null;

window.addEventListener("message", (event) => {
    console.log("[Mail App] Global listener received message:", event.data);
    if (event.data && event.data.type === "deep-link" && event.data.slug) {
        console.log(`[Mail App] Deep link slug received: "${event.data.slug}"`);
        if (appInstance && appInstance.allAnnouncements.length > 0) {
            console.log(`[Mail App] App is ready, processing deep link immediately`);
            appInstance.handleDeepLink(event.data.slug);
        } else {
            console.log(`[Mail App] App not ready yet, storing slug for later: "${event.data.slug}"`);
            initialSlugFromMessage = event.data.slug;
        }
    }
});

export class AnnouncementsApp extends UIComponent {
    constructor(rootId) {
        super();
        this.root = document.getElementById(rootId);
        this.appId = "announcements-app";
        this.appLabel = "Mail";
        this.allAnnouncements = [];
        this.filteredAnnouncements = [];
        this.selectedArticle = null;
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
        const userLang = localStorage.getItem("userLanguage") || "en-US";
        this.translations = mailTranslations[userLang] || mailTranslations['en-US'];
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
            const words = text.split(" ");
            let line = "";
            let currentY = y;
            let totalHeightUsed = 0;

            for (let n = 0; n < words.length; n++) {
                let testLine = line + (n > 0 ? " " : "") + words[n];
                let metrics = ctx.measureText(testLine);
                let testWidth = metrics.width;

                if (testWidth > maxWidth && line.length > 0) {
                    ctx.fillText(line, x, currentY);
                    totalHeightUsed += actualLineHeight * lineSpacingFactorToUse;
                    currentY += actualLineHeight * lineSpacingFactorToUse;
                    line = words[n];
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
        let announcementsData = [];
        const userLanguageKey = localStorage.getItem("userLanguage") || "en-US";

        announcementsData = mailData[userLanguageKey] || mailData['en-US'];

        if (!announcementsData) {
            console.error(`Could not find mail data for ${userLanguageKey} or fallback en-US.`);
            this._showAppError("errorLoadingMail");
            return;
        }

        // Load articles from app.js if available
        let appArticles = [];
        try {
            const appModule = await import('/content/apps/mail/app.js');
            if (appModule.app && appModule.app.articles) {
                appArticles = appModule.app.articles;
            }
        } catch (e) {
            console.warn('Could not load articles from app.js:', e);
        }

        // Merge mailData and appArticles
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
                    this.sprites[pathOrKey].src = pathOrKey;
                })
            );
        });
        await Promise.all(allImagePromises);
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
.article-image, .home-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.4s ease-in-out; image-rendering: pixelated; z-index: 2; }
.bottom-screen { width: 320px; height: 240px; background: var(--ds-bg); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; padding-top: 8px; box-sizing: border-box; }
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
.article-view { }
.article-header-content { padding: 10px 0;  flex-shrink: 0; width: 320px; height: 90px; box-sizing: border-box; position: relative; }
.scrollable-canvas-wrapper { flex-grow: 1; overflow-y: auto; scrollbar-width: none; height: 110px; position: relative; }
.scrollable-canvas-wrapper::-webkit-scrollbar { display: none; }
.article-content-canvas { display: block; height: auto; width: 280px; margin: 0 auto; image-rendering: pixelated; cursor: pointer; }
.article-html-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
.article-html-overlay > iframe { pointer-events: auto; border-radius: 6px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
.article-title-wrapper { display: flex; justify-content: space-between; align-items: flex-start; padding: 0 10px; }
.article-title-h1 { display: block; flex-grow: 1; line-height: 0; width: 256px; image-rendering: pixelated; }
.article-title-h1 canvas { width: 100%; height: 100%; image-rendering: pixelated; }
.article-meta-canvas { display: block; margin: 0 10px; width: 290px; height: 20px; image-rendering: pixelated; }
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
        appInstance = this;
        this.injectStyles();
        this.loadTranslations();
        await document.fonts.load('1px "Rodin"', " ");
        await document.fonts.ready;
        await this.audioManager.initialize('/content/apps/mail/assets/audio-config.json');
        this.sounds = this.audioManager.sounds;

        const now = luxon.DateTime.local();
        this.timeSystem.dayTime = now.hour * 60 + now.minute;
        this.timeSystem.globalTime = this.timeSystem.dayTime;

        this.topScreen = new TopScreen(this);
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

        this.root.appendChild(this.topScreen.element);
        this.root.appendChild(this.bottomScreen.element);

        this.bottomScreenOverlay = this.createElement("div", "bottom-screen-overlay");
        this.root.appendChild(this.bottomScreenOverlay);

        this.loadTotalUnopenedCount();
        this.loadUserTimeZone();
        this.topScreen.showHomeScreen(this.lastKnownUnopenedCount);
        await this.loadData();
        this.attachEventListeners();
        this.updateUI();

        if (initialSlugFromMessage) {
            console.log(`[Mail App] Processing stored slug: ${initialSlugFromMessage}`);
            await this.handleDeepLink(initialSlugFromMessage);
            initialSlugFromMessage = null;
        }

        if (this.audioManager.audioSettings.backgroundAudio && this.sounds.music) {
            this.sounds.music.play();
            this.sounds.music.fade(0, this.audioManager._getVolume('music', this.sounds.music._volume), 3000);
        }
        this.audioManager.playSound("appLaunch");

        if (window.parent !== window) {
            window.parent.postMessage({ type: "app-ready" }, "*");
        }

        this.animate();
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
        this.bottomScreen.setView("article", { article: updatedArticle });
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
            this.selectedArticle = null;
            this.updateUI(true);
        }
    }

    async handleDeepLink(slug) {
        console.log(`[Mail App] handleDeepLink called with slug: "${slug}"`);
        console.log(`[Mail App] Total announcements loaded: ${this.allAnnouncements.length}`);
        console.log(`[Mail App] Available slugs:`, this.allAnnouncements.map(a => a.slug));
        
        const article = this.allAnnouncements.find((a) => a.slug === slug);
        if (article) {
            console.log(`[Mail App] Article found:`, article);
            await this.handleAnnouncementSelect(article, true);
        } else {
            console.warn(`[Mail App] Deep link article with slug "${slug}" not found.`);
            console.warn(`[Mail App] Did you mean one of these?`, this.allAnnouncements.map(a => a.slug).slice(0, 5));
        }
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
