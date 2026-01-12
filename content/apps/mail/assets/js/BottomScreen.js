import { UIComponent } from '/content/common/utils/index.js';
import { ListView } from './views/ListView.js';
import { ArticleView } from './views/ArticleView.js';
import { FilterView } from './views/FilterView.js';

export class BottomScreen extends UIComponent {
    constructor({
        onArticleSelect,
        onShare,
        onCloseArticle,
        onSearch,
        onShowFilter,
        onFilterChange,
        sounds,
        sprites,
        appInstance,
    }) {
        super();
        this.app = appInstance;
        this.element = this.createElement("div", "bottom-screen");
        this.root = this.app.root;

        // Load filter icon
        if (!this.app.sprites.filter) {
            this.app.sprites.filter = new Image();
            this.app.sprites.filter.src = '/content/common/assets/icons/filter_64px.png';
        }

        // Instantiate views
        this.listView = new ListView({
            appInstance: this.app,
            onArticleSelect: onArticleSelect,
            onSearch: onSearch,
            onShowFilter: onShowFilter,
            onClose: onCloseArticle,
        });

        this.articleView = new ArticleView({
            appInstance: this.app,
            onShare: onShare,
            onClose: onCloseArticle,
        });

        this.filterView = new FilterView({
            appInstance: this.app,
            onFilterChange: onFilterChange,
        });

        this.element.appendChild(this.listView.element);
        this.element.appendChild(this.articleView.element);
        this.element.appendChild(this.filterView.element);

        this.activeView = null;
    }

    update(time) {
        if (this.activeView && this.activeView.update) {
            this.activeView.update(time);
        }
    }

    setView(mode, data = {}) {
        // Store the current view mode
        this.viewMode = mode;
        
        this.listView.element.classList.toggle("active", mode === "list");
        this.articleView.element.classList.toggle("active", mode === "article");
        this.filterView.element.classList.toggle("active", mode === "filter");

        switch (mode) {
            case "list":
                this.activeView = this.listView;
                this.listView.render(data);
                break;
            case "article":
                this.activeView = this.articleView;
                this.articleView.render(data.article);
                break;
            case "filter":
                this.activeView = this.filterView;
                this.filterView.render(data);
                break;
        }
    }

    triggerUnopenedMailAnimation(article) {
        if (this.listView) {
            this.listView.triggerUnopenedMailAnimation(article);
        }
    }
}

