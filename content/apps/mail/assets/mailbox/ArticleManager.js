import { mailData } from "./MailData.js";

/**
 * Manages loading, filtering, and state of articles.
 */
export class ArticleManager {
    constructor(app) {
        this.app = app;
        this.allAnnouncements = [];
        this.filteredAnnouncements = [];
        this.selectedArticle = null;
        this.allTags = [];
        this.lastKnownUnopenedCount = 0;
    }

    t(key, replacements = {}) {
        return this.app.t(key, replacements);
    }

    async loadData() {
        let announcementsData = [];
        const userLanguageKey = localStorage.getItem("userLanguage") || "en-US";
        
        announcementsData = mailData[userLanguageKey] || mailData['en-US'];

        if (!announcementsData) {
            console.error(`Could not find mail data for ${userLanguageKey} or fallback en-US.`);
            this.app._showAppError("errorLoadingMail");
            return;
        }

        this.allAnnouncements = announcementsData.map((a) => ({
            ...a,
            read: false,
            visible: a.visible !== undefined ? a.visible : true,
            debugArticle: a.debugArticle === true,
        }));
        this.loadReadStatus();

        const allTags = new Set();
        this.allAnnouncements.forEach((a) => {
            if (a.tags) a.tags.forEach((t) => allTags.add(t));
        });
        this.allTags = [...allTags].sort();
    }

    loadReadStatus() {
        try {
            const readStatusMap = JSON.parse(
                localStorage.getItem("mailApp_readStatusMap") || "{}"
            );
            this.allAnnouncements.forEach((ann) => {
                ann.read = readStatusMap[ann.slug] === true;
            });
        } catch (e) {
            console.error(
                "Failed to load read status from localStorage:",
                e
            );
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
            localStorage.setItem(
                "mailApp_readStatusMap",
                JSON.stringify(readStatusMap)
            );
        } catch (e) {
            console.error(
                "Failed to save read status to localStorage:",
                e
            );
        }
    }

    saveTotalUnopenedCount() {
        try {
            const unopenedCount = this.getUnopenedCount();
            localStorage.setItem(
                "mailApp_unopenedCount",
                unopenedCount.toString()
            );
        } catch (e) {
            console.error(
                "Failed to save total unopened count to localStorage:",
                e
            );
        }
    }

    loadTotalUnopenedCount() {
        try {
            const storedCount = localStorage.getItem(
                "mailApp_unopenedCount"
            );
            this.lastKnownUnopenedCount = storedCount ?
                parseInt(storedCount, 10) :
                0;
        } catch (e) {
            console.error(
                "Failed to load total unopened count from localStorage:",
                e
            );
            this.lastKnownUnopenedCount = 0;
        }
    }

    applyFiltersAndSort(searchQuery, activeFilters) {
        let result = [...this.allAnnouncements];
        const isDebug = localStorage.getItem('Debug') === 'true';

        result = result.filter(a => {
            if (a.visible === false) {
                return false;
            }
            if (a.debugArticle === true) {
                return isDebug;
            }
            return true;
        });

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (a) =>
                    a.title.toLowerCase().includes(lowerQuery) ||
                    a.author.toLowerCase().includes(lowerQuery)
            );
        }

        if (activeFilters.tag && activeFilters.tag !== "All") {
            result = result.filter((a) =>
                a.tags.includes(activeFilters.tag)
            );
        }

        if (activeFilters.readStatus === "read") {
            result = result.filter((a) => a.read);
        } else if (activeFilters.readStatus === "unopened") {
            result = result.filter((a) => !a.read);
        }

        switch (activeFilters.sort) {
            case "date-asc":
                result.sort(
                    (a, b) =>
                        window.luxon.DateTime.fromISO(a.date).toMillis() -
                        window.luxon.DateTime.fromISO(b.date).toMillis()
                );
                break;
            case "author-asc":
                result.sort((a, b) => a.author.localeCompare(b.author));
                break;
            default: // date-desc
                result.sort(
                    (a, b) =>
                        window.luxon.DateTime.fromISO(b.date).toMillis() -
                        window.luxon.DateTime.fromISO(a.date).toMillis()
                );
                break;
        }
        this.filteredAnnouncements = result;
    }

    getUnopenedCount() {
        return this.allAnnouncements.filter(a => !a.read && a.visible).length;
    }

    getArticleBySlug(slug) {
        return this.allAnnouncements.find(a => a.slug === slug);
    }

    markAsRead(slug) {
        const article = this.getArticleBySlug(slug);
        if (article) {
            const wasUnread = !article.read;
            article.read = true;
            this.saveReadStatus();
            return wasUnread;
        }
        return false;
    }
}
