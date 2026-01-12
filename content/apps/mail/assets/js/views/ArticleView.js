import { Article, UIComponent } from '/content/common/utils/index.js';

export class ArticleView extends UIComponent {
    constructor({ appInstance, onShare, onClose }) {
        super();
        this.app = appInstance;
        this.onShare = onShare;
        this.onClose = onClose;
        this.element = this.createElement('div', 'article-view view');
        this.articleComponent = null;
    }

    render(article) {
        this.element.innerHTML = ''; // Clear previous article
        this.articleComponent = new Article({
            appInstance: this.app,
            article: article,
            onShare: this.onShare,
            onClose: this.onClose,
        });
        this.element.appendChild(this.articleComponent.element);
    }

    update(time) {
        if (this.articleComponent) {
            this.articleComponent.update(time);
        }
    }
}
