import { Article, UIComponent } from '/content/common/utils/index.js';

export class ArticleView extends UIComponent {
    constructor({ appInstance, onShare, onClose }) {
        super();
        console.log('[ArticleView] Constructor called');
        
        try {
            this.app = appInstance;
            this.onShare = onShare;
            this.onClose = onClose;
            this.element = this.createElement('div', 'article-view view');
            this.articleComponent = null;
            
            console.log('[ArticleView] Constructor completed successfully');
        } catch (error) {
            console.error('[ArticleView] Constructor failed:', error);
            throw error;
        }
    }

    render(article, options = {}) {
        console.log('[ArticleView] render called with article:', article?.title || 'undefined');
        
        try {
            // Validate article data
            if (!article) {
                console.error('[ArticleView] No article data provided to render');
                this._showError('No article data available');
                return;
            }

            // Validate required article properties
            if (!article.title) {
                console.warn('[ArticleView] Article missing title, using fallback');
                article.title = 'Untitled';
            }

            if (article.content === null || article.content === undefined) {
                console.warn('[ArticleView] Article missing content, using placeholder');
                article.content = 'No content available.';
            }

            if (!article.date) {
                console.warn('[ArticleView] Article missing date, using current date');
                article.date = new Date().toISOString();
            }

            // Validate app instance and dependencies
            if (!this.app) {
                console.error('[ArticleView] App instance not available');
                this._showError('Application not initialized');
                return;
            }

            if (!this.app.richTextRenderer) {
                console.error('[ArticleView] RichTextRenderer not initialized on app instance');
                this._showError('Text renderer not available');
                return;
            }

            // Clear previous article
            this.element.innerHTML = '';
            
            console.log('[ArticleView] Creating Article component');
            
            // Create article component with error handling
            this.articleComponent = new Article({
                appInstance: this.app,
                article: article,
                onShare: this.onShare,
                onClose: this.onClose,
                parentArticleSlug: options.parentArticleSlug || null, // NEW: Pass parent article slug
            });
            
            // NEW: Store reference for parent app to access
            this.currentArticleComponent = this.articleComponent;
            
            this.element.appendChild(this.articleComponent.element);
            
            console.log('[ArticleView] Article rendered successfully');
        } catch (error) {
            console.error('[ArticleView] Failed to render article:', error);
            console.error('[ArticleView] Error stack:', error.stack);
            this._showError(`Failed to load article: ${error.message}`);
        }
    }

    update(time) {
        try {
            if (this.articleComponent && typeof this.articleComponent.update === 'function') {
                this.articleComponent.update(time);
            }
        } catch (error) {
            console.error('[ArticleView] Error in update:', error);
            // Don't throw to prevent animation loop crash
        }
    }

    _showError(message) {
        console.log('[ArticleView] Showing error message:', message);
        
        try {
            this.element.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 20px;
                    text-align: center;
                    font-family: 'Rodin', sans-serif;
                ">
                    <div style="
                        font-size: 48px;
                        margin-bottom: 20px;
                        opacity: 0.5;
                    ">⚠️</div>
                    <h3 style="
                        color: #dc3545;
                        margin: 0 0 10px 0;
                        font-size: 18px;
                    ">Failed to Load Article</h3>
                    <p style="
                        color: #666;
                        margin: 0;
                        font-size: 14px;
                    ">${message}</p>
                    <p style="
                        color: #999;
                        margin: 20px 0 0 0;
                        font-size: 12px;
                    ">Check browser console (F12) for details</p>
                </div>
            `;
        } catch (displayError) {
            console.error('[ArticleView] Failed to display error message:', displayError);
        }
    }
}
