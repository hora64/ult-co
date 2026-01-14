import { UIComponent, TextCanvasMeasurer, Scrollbar, CanvasButton, CanvasInteractionHandler, WhitePaper, LightPaper, EnvelopePaper, StandardPaper } from '/content/common/utils/index.js';


export class Article extends UIComponent {
  constructor({
    appInstance,
    article,
    onShare,
    onClose,
    articleSchema,
    onConfirmRead, // NEW: Optional callback when confirm button is clicked
    parentArticleSlug // NEW: Parent article slug for hierarchical navigation
  }) {
    super();

    console.log('[Article] Constructor called with article:', article?.title || 'undefined');

    try {
      // Validate required parameters
      if (!appInstance) {
        throw new Error('appInstance is required');
      }

      if (!article) {
        throw new Error('article data is required');
      }

      // Validate critical app dependencies
      if (!appInstance.richTextRenderer) {
        throw new Error('RichTextRenderer not initialized on app instance');
      }

      if (!appInstance.imageManager) {
        throw new Error('ImageManager not initialized on app instance');
      }

      this.app = appInstance;
      this.article = this.transformArticle(article, articleSchema);
      this.onShare = onShare;
      this.onClose = onClose;
      this.onConfirmRead = onConfirmRead; // NEW: Store confirm callback
      this.parentArticleSlug = parentArticleSlug; // NEW: Store parent article slug
      this.element = this.createElement("div", "article-view-wrapper");
      this.lineSpacingFactor = 1.5;
      this.needsContinuousUpdate = false;

      // Multi-page support
      this.currentPage = 0;
      this.pages = this.article.pages || null;

      // NEW: Track previous image URL to avoid unnecessary transitions
      this.previousImageUrl = null;

      // Marquee configuration - SLOWER SPEED
      this.marqueeSpeed = 0.2; // Reduced speed: 0.2 pixels per frame (slower scrolling for better readability)

      // Bind methods
      this._measureBlockHeight = this._measureBlockHeight.bind(this);
      this.drawArticleContent = this.drawArticleContent.bind(this);
      this._drawHeaderBackground = this._drawHeaderBackground.bind(this);
      this._drawBodyBackground = this._drawBodyBackground.bind(this);
      this._drawFarBackground = this._drawFarBackground.bind(this);
      this._updateTopScreenImage = this._updateTopScreenImage.bind(this);
      this._handleConfirmRead = this._handleConfirmRead.bind(this); // NEW: Bind confirm handler

      console.log('[Article] Calling render()');
      this.render();

      console.log('[Article] Constructor completed successfully');
    } catch (error) {
      console.error('[Article] Constructor failed:', error);
      console.error('[Article] Error stack:', error.stack);

      // Create error display
      if (this.element) {
        this.element.innerHTML = `
                    <div style="padding: 20px; color: #dc3545; text-align: center; font-family: 'Rodin', sans-serif;">
                        <h3 style="margin: 0 0 10px 0;">Failed to load article</h3>
                        <p style="margin: 0; font-size: 14px;">${error.message}</p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Check console (F12) for details</p>
                    </div>
                `;
      }

      throw error; // Re-throw to notify parent
    }
  }

  // NEW: Static method to navigate to article by slug
  static navigateToArticle(appInstance, slug, pageIndex = 0) {
    if (!appInstance.getArticleBySlug) {
      console.error('[Article] App instance missing getArticleBySlug method');
      return false;
    }

    const article = appInstance.getArticleBySlug(slug);
    if (!article) {
      console.error('[Article] Article not found:', slug);
      return false;
    }

    // Open article
    if (appInstance.openArticle) {
      appInstance.openArticle(slug, pageIndex);
      return true;
    }

    console.error('[Article] App instance missing openArticle method');
    return false;
  }

  // NEW: Helper to check if we're on the last page and confirm is enabled
  _isLastPageWithConfirm() {
    if (!this.pages || this.pages.length === 0) return false;

    // Find the last visible page
    let lastVisibleIndex = -1;
    for (let i = this.pages.length - 1; i >= 0; i--) {
      if (!this.pages[i].hidden) {
        lastVisibleIndex = i;
        break;
      }
    }

    if (lastVisibleIndex === -1) return false;

    // Check if we're on last visible page and it has confirm option
    const lastPage = this.pages[lastVisibleIndex];
    return this.currentPage === lastVisibleIndex && lastPage.requireConfirm === true;
  }

  // NEW: Handler for confirm button
  _handleConfirmRead() {
    console.log('[Article] Confirm button clicked');

    // Execute confirm callback if provided
    if (this.onConfirmRead && typeof this.onConfirmRead === 'function') {
      this.onConfirmRead(this.article);
    }

    // Also execute page-specific command if defined
    if (this.pages && this.pages[this.currentPage]) {
      const currentPage = this.pages[this.currentPage];
      if (currentPage.onConfirm && typeof currentPage.onConfirm === 'function') {
        currentPage.onConfirm(this.article);
      } else if (typeof currentPage.onConfirm === 'string') {
        // Execute as code string (for serialized data)
        try {
          const fn = new Function('article', 'app', currentPage.onConfirm);
          fn(this.article, this.app);
        } catch (e) {
          console.error('[Article] Error executing onConfirm command:', e);
        }
      }
    }

    // Close article after confirm (optional behavior)
    if (this.onClose) {
      this.onClose(true); // true indicates confirmed read
    }
  }

  // NEW: Create SVG checkmark icon
  _createCheckmarkSvg() {
    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // NEW: Create SVG info icon
  _createInfoSvg() {
    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#666666" stroke-width="2"/>
        <path d="M12 16V12M12 8H12.01" stroke="#666666" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // Helper method to wrap text within a given width
  _wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Show publisher info/credits modal
  _showPublisherInfo(creditsData, title = "Credits") {
    // Create modal overlay
    const modal = this.createElement("div", "publisher-info-modal");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    // Create modal canvas for content
    const modalCanvas = this.createElement("canvas");
    modalCanvas.width = 280;
    modalCanvas.height = 400;
    modalCanvas.style.borderRadius = "12px";
    modalCanvas.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
    modal.appendChild(modalCanvas);

    const ctx = modalCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // Draw paper background
    const generator = new StandardPaper();
    const paperCanvas = generator.canvasBackgroundGenerator(modalCanvas.width, modalCanvas.height);
    if (paperCanvas) {
      ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
      ctx.fillRect(0, 0, modalCanvas.width, modalCanvas.height);
    } else {
      ctx.fillStyle = "#FDF5E6";
      ctx.fillRect(0, 0, modalCanvas.width, modalCanvas.height);
    }

    // Draw border
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, modalCanvas.width, modalCanvas.height);

    // Get font family
    const fontFamily = this.app.richTextRenderer ? this.app.richTextRenderer._getFontFamily() : '"Rodin", Arial, sans-serif';

    // Draw title
    ctx.fillStyle = "#000000";
    ctx.font = `bold 18px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(title, modalCanvas.width / 2, 20);

    // Draw credits
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    let currentY = 60;
    const lineHeight = 24;
    const maxWidth = modalCanvas.width - 40;

    // Handle both string and array formats
    const credits = Array.isArray(creditsData) ? creditsData : [creditsData];

    credits.forEach(credit => {
      const lines = this._wrapText(ctx, credit, maxWidth);
      lines.forEach(line => {
        if (currentY < modalCanvas.height - 80) {
          ctx.fillText(line, 20, currentY);
          currentY += lineHeight;
        }
      });
      currentY += 5; // Extra space between credits
    });

    // Add close button
    const closeButton = new CanvasButton({
      text: this.app.t("close") || "Close",
      width: 100,
      height: 36,
      textColor: "black",
      font: `bold 14px ${fontFamily}`,
      onClick: () => {
        modal.remove();
      },
      backgroundColor: "#F0EAD6",
      hoverBackgroundColor: "#e8dfc5",
      pressedBackgroundColor: "#d4c9ad",
      borderRadius: 6,
      borderColor: 'rgba(0,0,0,0.2)',
      borderWidth: 1,
      appInstance: this.app,
    });

    closeButton.element.style.position = "absolute";
    closeButton.element.style.bottom = "20px";
    closeButton.element.style.left = "50%";
    closeButton.element.style.transform = "translateX(-50%)";
    modal.appendChild(closeButton.element);

    // Add to DOM
    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  transformArticle(originalArticle, schema) {
    if (!schema) {
      return originalArticle;
    }

    const transformedArticle = {};
    const getValueByPath = (obj, path) => {
      if (typeof path !== 'string') return undefined;
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    const targetSchema = {
      title: 'title',
      content: 'content',
      date: 'date',
      author: 'author',
      publisher: 'publisher',
      footerButtons: 'footerButtons'
    };

    for (const key in targetSchema) {
      const sourcePath = schema[key];
      if (sourcePath) {
        transformedArticle[key] = getValueByPath(originalArticle, sourcePath);
      } else {
        transformedArticle[key] = originalArticle[key];
      }
    }

    // Copy any other properties from the original article that are not in the target schema
    for (const key in originalArticle) {
      if (!Object.values(schema).some(path => path.startsWith(key.split('.')[0]))) {
        if (!transformedArticle.hasOwnProperty(key)) {
          transformedArticle[key] = originalArticle[key];
        }
      }
    }

    return transformedArticle;
  }

  render() {
    console.log('[Article] Starting render with article data:', this.article);
    console.log('[Article] Article title:', this.article?.title);
    console.log('[Article] Article content:', this.article?.content);
    console.log('[Article] Article date:', this.article?.date);
    console.log('[Article] Article author:', this.article?.author);

    this.element.innerHTML = ''; // Clear previous content
    this.htmlOverlay = this.createElement("div", "article-html-overlay");
    this.scrollableCanvasWrapper = this.createElement("div", "scrollable-canvas-wrapper");
    this.scrollableCanvasWrapper.appendChild(this.htmlOverlay);

    this.renderArticleView(this.article);
    this._drawFarBackground();
  }

  update(time) {
    if (this.needsContinuousUpdate) {
      this.drawArticleContent(this._getCurrentPageContent(), true);
    }

    // Update page indicator
    if (this.pages && this.pages.length > 1) {
      this._drawPageIndicator();
    }
  }

  _getCurrentPageContent() {
    if (this.pages && this.pages.length > 0) {
      return this.pages[this.currentPage]?.content || this.article.content;
    }
    return this.article.content;
  }

  _getCurrentPageImage() {
    // Get image for current page
    // Priority: page.image > article.image > null
    if (this.pages && this.pages.length > 0) {
      const currentPageData = this.pages[this.currentPage];
      if (currentPageData && currentPageData.image) {
        return currentPageData.image;
      }
    }
    // Fallback to article-level image
    return this.article.image || null;
  }

  _updateTopScreenImage() {
    // Update the top screen image when page changes
    const imageUrl = this._getCurrentPageImage();

    // NEW: Check if image is the same as previous - skip transition if so
    if (imageUrl === this.previousImageUrl) {
      console.log('[Article] Same image as previous page, skipping transition');
      return;
    }

    // Update previous image tracker
    this.previousImageUrl = imageUrl;

    // Find or create the top screen image element
    // The top screen is typically outside the article component in the app structure
    // We'll dispatch a custom event that the parent app can listen to
    const event = new CustomEvent('article-page-image-change', {
      detail: {
        imageUrl: imageUrl,
        pageIndex: this.currentPage,
        articleSlug: this.article.slug
      },
      bubbles: true
    });

    this.element.dispatchEvent(event);
  }

  _goToPage(pageIndex, options = {}) {
    if (!this.pages || this.pages.length === 0) return;

    if (pageIndex < 0 || pageIndex >= this.pages.length) return;

    // Check if page is hidden (accessible only via thumbnails)
    const targetPage = this.pages[pageIndex];
    if (targetPage && targetPage.hidden) {
      console.log('[Article] Cannot navigate to hidden page via arrows:', pageIndex);
      return;
    }

    // Stop label marquee before changing page
    this._stopLabelMarquee();

    this.currentPage = pageIndex;
    this.drawArticleContent(this._getCurrentPageContent());
    this._updatePageControls();

    // Update top screen image
    this._updateTopScreenImage();

    // Scroll to top
    if (!options.skipScroll) {
      this.scrollableCanvasWrapper.scrollTop = 0;
    }
  }

  _goToPageDirect(pageIndex) {
    // Direct navigation - can access hidden pages
    if (!this.pages || this.pages.length === 0) return;

    if (pageIndex < 0 || pageIndex >= this.pages.length) return;

    // Stop label marquee before changing page
    this._stopLabelMarquee();

    this.currentPage = pageIndex;
    this.drawArticleContent(this._getCurrentPageContent());
    this._updatePageControls();

    // Update top screen image
    this._updateTopScreenImage();

    // Scroll to top
    this.scrollableCanvasWrapper.scrollTop = 0;
  }

  _getNextVisiblePage(fromIndex, direction) {
    // Find next non-hidden page in specified direction
    // direction: 1 for next, -1 for previous
    let nextIndex = fromIndex + direction;

    while (nextIndex >= 0 && nextIndex < this.pages.length) {
      if (!this.pages[nextIndex].hidden) {
        return nextIndex;
      }
      nextIndex += direction;
    }

    return -1; // No visible page found
  }

  _updatePageControls() {
    // Update page indicator
    this._drawPageIndicator();

    // Update button states - skip hidden pages
    if (this.prevPageButton) {
      const prevVisible = this._getNextVisiblePage(this.currentPage, -1);
      this.prevPageButton.setEnabled(prevVisible !== -1);
    }

    // NEW: Handle next button or confirm button - REPLACE not overlay (NO ANIMATION)
    if (this.nextPageButton && this.confirmButton) {
      const nextVisible = this._getNextVisiblePage(this.currentPage, 1);
      const isLastWithConfirm = this._isLastPageWithConfirm();

      if (isLastWithConfirm) {
        // Hide next button, show confirm button (no animation)
        this.nextPageButton.element.style.display = 'none';
        this.confirmButton.element.style.display = 'block';
      } else {
        // Show next button normally, hide confirm
        this.nextPageButton.element.style.display = 'block';
        this.nextPageButton.setEnabled(nextVisible !== -1);
        this.confirmButton.element.style.display = 'none';
      }
    }
  }

  _drawPageIndicator() {
    if (!this.pageIndicatorCanvas || !this.pages || this.pages.length <= 1) {
      return;
    }

    const ctx = this.pageIndicatorCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);
    ctx.imageSmoothingEnabled = false;

    // Cache the background pattern if not already cached
    if (!this._pageIndicatorBgPattern) {
      const generator = new StandardPaper();
      const paperCanvas = generator.canvasBackgroundGenerator(this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);
      if (paperCanvas) {
        this._pageIndicatorBgPattern = ctx.createPattern(paperCanvas, "repeat");
      }
    }

    // Draw cached background
    if (this._pageIndicatorBgPattern) {
      ctx.fillStyle = this._pageIndicatorBgPattern;
      ctx.fillRect(0, 0, this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);
    } else {
      ctx.fillStyle = "#F0EAD6";
      ctx.fillRect(0, 0, this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);
    }

    // Draw border to match buttons
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, this.pageIndicatorCanvas.width - 1, this.pageIndicatorCanvas.height - 1);

    const fontFamily = this.app.richTextRenderer._getFontFamily();
    const currentPageData = this.pages[this.currentPage];

    // Determine text to display
    let labelText = '';
    let pageNumberText = '';

    // Count only visible pages for numbering
    const visiblePages = this.pages.filter(p => !p.hidden);
    const visibleIndex = visiblePages.indexOf(currentPageData) + 1;

    if (currentPageData && currentPageData.label) {
      // Custom label mode
      labelText = currentPageData.label;
      pageNumberText = currentPageData.hidden
        ? '\u{1F512}' // Lock icon for hidden pages
        : `${visibleIndex}/${visiblePages.length}`;
    } else {
      // Number-only mode
      pageNumberText = currentPageData.hidden
        ? '\u{1F512}'
        : `${visibleIndex}/${visiblePages.length}`;
    }

    // Use smaller font size (12px instead of 16px)
    const fontSize = 12;
    const font = `bold ${fontSize}px ${fontFamily}`;
    ctx.font = font;
    const maxWidth = this.pageIndicatorCanvas.width - 10; // 5px padding each side

    if (labelText) {
      // Two-line mode: Label on top, page number on bottom
      const labelWidth = ctx.measureText(labelText).width;

      // Calculate vertical positioning with better centering
      const totalHeight = this.pageIndicatorCanvas.height;
      const lineHeight = fontSize;
      const spacing = 4; // Gap between lines
      const totalTextHeight = lineHeight * 2 + spacing;
      const topMargin = (totalHeight - totalTextHeight) / 2;

      const labelY = topMargin + lineHeight / 2;
      const pageNumY = topMargin + lineHeight + spacing + lineHeight / 2;

      // Draw label with marquee if too long
      if (labelWidth > maxWidth) {
        // Enable marquee for label
        if (!this._labelMarqueeOffset) this._labelMarqueeOffset = 0;
        if (!this._labelMarqueeAnimationId) {
          this._startLabelMarquee(labelText, maxWidth, font, labelY, pageNumberText, pageNumY);
        }
      } else {
        // Stop marquee if running
        this._stopLabelMarquee();

        // Center label text
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, this.pageIndicatorCanvas.width / 2, labelY);
      }

      // Draw page number (centered, no marquee needed as it's always short)
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pageNumberText, this.pageIndicatorCanvas.width / 2, pageNumY);
    } else {
      // Single-line mode: just page number, vertically centered
      this._stopLabelMarquee();

      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pageNumberText, this.pageIndicatorCanvas.width / 2, this.pageIndicatorCanvas.height / 2);
    }
  }

  _startLabelMarquee(text, maxWidth, font, labelY, pageNumberText, pageNumY) {
    const ctx = this.pageIndicatorCanvas.getContext('2d');
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    const gap = 30; // Larger gap for better separation

    if (!this._labelMarqueeOffset) this._labelMarqueeOffset = 0;

    const animateMarquee = () => {
      this._labelMarqueeOffset -= this.marqueeSpeed; // Use configurable speed (now slower)

      if (this._labelMarqueeOffset <= -(textWidth + gap)) {
        this._labelMarqueeOffset = 0;
      }

      // Clear entire canvas
      ctx.clearRect(0, 0, this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);

      // Redraw static background from cache
      if (this._pageIndicatorBgPattern) {
        ctx.fillStyle = this._pageIndicatorBgPattern;
        ctx.fillRect(0, 0, this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);
      } else {
        ctx.fillStyle = "#F0EAD6";
        ctx.fillRect(0, 0, this.pageIndicatorCanvas.width, this.pageIndicatorCanvas.height);
      }

      // Redraw border
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, this.pageIndicatorCanvas.width - 1, this.pageIndicatorCanvas.height - 1);

      // Draw page number (static)
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = font;
      ctx.fillText(pageNumberText, this.pageIndicatorCanvas.width / 2, pageNumY);

      // Set up clipping for marquee text
      ctx.save();
      ctx.beginPath();
      ctx.rect(5, labelY - 8, this.pageIndicatorCanvas.width - 10, 16);
      ctx.clip();

      // Draw scrolling label text
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, this._labelMarqueeOffset + 5, labelY);
      ctx.fillText(text, this._labelMarqueeOffset + textWidth + gap + 5, labelY);

      ctx.restore();

      this._labelMarqueeAnimationId = requestAnimationFrame(animateMarquee);
    };

    this._labelMarqueeAnimationId = requestAnimationFrame(animateMarquee);
  }

  _stopLabelMarquee() {
    if (this._labelMarqueeAnimationId) {
      cancelAnimationFrame(this._labelMarqueeAnimationId);
      this._labelMarqueeAnimationId = null;
    }
    this._labelMarqueeOffset = 0;
  }

  _updateThumbnailSelection() {
    // Thumbnail feature removed - each page shows its own image in top screen
  }

  _createPageThumbnails() {
    // Thumbnail navigation removed - pages now display their individual images in top screen
    return null;
  }

  _createThumbnail(page, index) {
    // Thumbnail feature removed - no longer needed
    return null;
  }

  renderArticleView(article = this.article) {
    console.log('[Article] renderArticleView called with article:', article);

    try {
      // Validate article data
      if (!article) {
        throw new Error('No article data provided to renderArticleView');
      }

      // Validate and provide fallbacks for required properties
      if (!article.title) {
        console.warn('[Article] Article missing "title" property, using fallback');
        article.title = 'Untitled';
      }

      if (article.content === null || article.content === undefined) {
        console.warn('[Article] Article missing "content" property, using placeholder');
        article.content = 'No content available.';
      }

      if (!article.date) {
        console.warn('[Article] Article missing "date" property, using current date');
        article.date = new Date().toISOString();
      }

      this.currentArticle = article;
      this.htmlOverlay.innerHTML = "";
      this.element.innerHTML = "";

      if (this.articleContentCanvas && this.articleContentCanvas.parentNode) {
        this.articleContentCanvas.parentNode.removeChild(this.articleContentCanvas);
      }

      this.articleContentCanvas = this.createElement("canvas", "article-content-canvas");
      this.articleContentCanvas.style.cursor = 'auto';
      this.scrollableCanvasWrapper.insertBefore(this.articleContentCanvas, this.htmlOverlay);

      this.interactionHandler = new CanvasInteractionHandler(this.articleContentCanvas, this.app);

      this.articleScrollbar = new Scrollbar(this.scrollableCanvasWrapper, this.app, {
        trackColor: 'rgba(0,0,0,0.1)',
        thumbColor: '#DDDDDD',
        thumbHoverColor: '#606060'
      });

      console.log('[Article] Creating header with title:', article.title);

      const header = this.createElement("div", "article-header-content");
      header.style.height = "90px";
      header.style.minHeight = "90px";
      header.style.position = "relative";
      header.style.width = "100%";
      header.style.display = "flex";
      header.style.flexDirection = "column";
      header.style.justifyContent = "space-between";
      header.style.padding = "10px";
      header.style.boxSizing = "border-box";

      this.headerBackgroundCanvas = this.createElement("canvas", "header-background-canvas");
      this.headerBackgroundCanvas.style.position = "absolute";
      this.headerBackgroundCanvas.style.top = "0";
      this.headerBackgroundCanvas.style.left = "0";
      this.headerBackgroundCanvas.style.width = "100%";
      this.headerBackgroundCanvas.style.height = "100%";
      this.headerBackgroundCanvas.style.zIndex = "-1";
      header.appendChild(this.headerBackgroundCanvas);

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.resizeObserver = new ResizeObserver(this._drawHeaderBackground);
      this.resizeObserver.observe(this.headerBackgroundCanvas);

      // Create canvas-based title with marquee support for long titles
      const articleTitleCanvas = this.createElement("canvas", "article-title-h1");
      articleTitleCanvas.width = 256; // Fixed width for title canvas
      articleTitleCanvas.height = 80; // Fixed height per requirements
      const articleTitleCtx = articleTitleCanvas.getContext("2d");

      if (!articleTitleCtx) {
        throw new Error('Failed to get canvas 2D context for title');
      }

      articleTitleCtx.imageSmoothingEnabled = false;

      // Get font family from rich text renderer (includes Chinese font support)
      const fontFamily = this.app.richTextRenderer ? this.app.richTextRenderer._getFontFamily() : '"Rodin", Arial, sans-serif';

      // Measure title
      let titleFont = `bold 20px ${fontFamily}`;
      const maxTitleWidth = 256; // Canvas width
      const measurer = new TextCanvasMeasurer();

      let finalFont = titleFont;
      let measuredTitleHeight = measurer.estimateWrappedTextHeight(article.title, finalFont, maxTitleWidth, this.app.articleTitleLineSpacingFactor);

      // Auto-resize logic
      const maxAllowedTitleHeight = 80;

      if (measuredTitleHeight > maxAllowedTitleHeight) {
        finalFont = `bold 16px ${fontFamily}`;
        measuredTitleHeight = measurer.estimateWrappedTextHeight(article.title, finalFont, maxTitleWidth, this.app.articleTitleLineSpacingFactor);

        if (measuredTitleHeight > maxAllowedTitleHeight) {
          finalFont = `bold 14px ${fontFamily}`;
          measuredTitleHeight = measurer.estimateWrappedTextHeight(article.title, finalFont, maxTitleWidth, this.app.articleTitleLineSpacingFactor);
        }
      }

      articleTitleCanvas.style.height = `${articleTitleCanvas.height}px`;
      articleTitleCanvas.style.width = "256px"; // Fixed width

      // Draw title directly on canvas with Chinese font support
      // Use app's _drawTextOnCanvas method which automatically handles Chinese font
      articleTitleCtx.font = finalFont;
      articleTitleCtx.fillStyle = "#000000";

      // Allow pointer events on the canvas itself if needed
      articleTitleCanvas.style.cursor = "default";

      // Calculate vertical centering
      const startY = (articleTitleCanvas.height - measuredTitleHeight) / 2;

      // Draw text with wrapping - use app's method which handles Chinese font automatically
      if (this.app._drawTextOnCanvas) {
        this.app._drawTextOnCanvas(
          articleTitleCtx,
          article.title,
          0,
          startY,
          finalFont,
          "#000000",
          "left",
          "top",
          256,
          this.app.articleTitleLineSpacingFactor
        );
      } else {
        // Fallback: draw without wrapping
        articleTitleCtx.fillText(article.title, 0, startY);
      }

      // Create vertical stack of action buttons (share, info)
      const actionButtonsStack = this.createElement("div");
      actionButtonsStack.className = "action-buttons-stack";
      actionButtonsStack.style.display = "flex";
      actionButtonsStack.style.flexDirection = "column";
      actionButtonsStack.style.gap = "4px";
      actionButtonsStack.style.alignItems = "center";

      // Share button (top of stack)
      const shareIcon = new Image();
      shareIcon.src = '/content/common/assets/icons/share_64px.png';

      this.shareButton = new CanvasButton({
        sprite: shareIcon,
        width: 24,
        height: 24,
        onClick: () => this.onShare(),
        className: "share-button",
        backgroundColor: "rgba(0,0,0,0)",
        activeBackgroundColor: "rgba(0,0,0,0)",
        pulseColor: this.app.cssVars["--ds-accent-blue"],
        borderRadius: 6,
        appInstance: this.app,
      });

      if (this.onShare) {
        actionButtonsStack.appendChild(this.shareButton.element);
      }

      // Credits/Info button - using SVG icon
      const infoIcon = new Image();
      infoIcon.src = this._createInfoSvg();

      this.creditsButton = new CanvasButton({
        sprite: infoIcon,
        width: 24,
        height: 24,
        onClick: () => {
          // Navigate to credits article if available
          if (article.creditsArticleSlug) {
            console.log('[Article] Opening credits article:', article.creditsArticleSlug);
            Article.navigateToArticle(this.app, article.creditsArticleSlug);
          } else {
            console.warn('[Article] No credits article slug provided');
          }
        },
        className: "credits-button",
        backgroundColor: "rgba(0,0,0,0)",
        activeBackgroundColor: "rgba(0,0,0,0)",
        borderRadius: 6,
        appInstance: this.app,
      });

      // Only show credits button if article has a credits article slug
      if (article.creditsArticleSlug) {
        actionButtonsStack.appendChild(this.creditsButton.element);
      }

      // Create horizontal container for title and action buttons
      const titleActionContainer = this.createElement("div");
      titleActionContainer.style.position = "relative";
      titleActionContainer.style.width = "100%";
      titleActionContainer.style.display = "flex";
      titleActionContainer.style.alignItems = "flex-start";
      titleActionContainer.style.justifyContent = "space-between";
      titleActionContainer.style.pointerEvents = "none";

      // Enable pointer events for children
      if (articleTitleCanvas) articleTitleCanvas.style.pointerEvents = "auto";
      actionButtonsStack.style.pointerEvents = "auto";

      titleActionContainer.appendChild(articleTitleCanvas);
      titleActionContainer.appendChild(actionButtonsStack);
      header.appendChild(titleActionContainer);

      // Prepare metadata string
      const articleDateTime = this.app.userTimeZone ? luxon.DateTime.fromISO(article.date).setZone(this.app.userTimeZone) : luxon.DateTime.fromISO(article.date);
      const formattedDate = articleDateTime.toFormat("MM/dd/yy");
      const formattedTime = articleDateTime.toLocaleString(luxon.DateTime.TIME_SIMPLE);
      const timeZoneAbbr = articleDateTime.toFormat("ZZZZ");

      // Bottom section container
      const bottomSection = this.createElement("div");
      bottomSection.style.position = "relative";
      bottomSection.style.width = "100%";
      bottomSection.style.display = "flex";
      bottomSection.style.justifyContent = "space-between";
      bottomSection.style.alignItems = "flex-end";
      bottomSection.style.pointerEvents = "auto";

      header.appendChild(bottomSection);

      // Thumbnails removed - pages now display individual images in top screen

      const bodyWrapper = this.createElement("div", "article-body-wrapper");

      this.bodyBackgroundCanvas = this.createElement("canvas", "body-background-canvas");
      this.bodyBackgroundCanvas.style.position = "absolute";
      this.bodyBackgroundCanvas.style.top = "0";
      this.bodyBackgroundCanvas.style.left = "0";
      this.bodyBackgroundCanvas.style.width = "100%";
      this.bodyBackgroundCanvas.style.height = "100%";
      this.bodyBackgroundCanvas.style.zIndex = "-1";
      bodyWrapper.appendChild(this.bodyBackgroundCanvas);

      if (this.bodyResizeObserver) {
        this.bodyResizeObserver.disconnect();
      }
      this.bodyResizeObserver = new ResizeObserver(this._drawBodyBackground);
      this.bodyResizeObserver.observe(bodyWrapper);

      bodyWrapper.appendChild(this.scrollableCanvasWrapper);
      bodyWrapper.appendChild(this.articleScrollbar.element);

      // Clean up any old references if rerendering
      this.prevPageButton = null;
      this.nextPageButton = null;
      this.confirmButton = null; // NEW: Reset confirm button

      const articleFooter = this.createElement("div", "article-footer");
      articleFooter.style.display = "flex";
      articleFooter.style.padding = "0";
      articleFooter.style.margin = "0";
      articleFooter.style.width = "100%";
      articleFooter.style.height = "40px";
      articleFooter.style.alignItems = "center";
      articleFooter.style.gap = "0";
      articleFooter.style.boxSizing = "border-box";
      articleFooter.style.overflow = "hidden";
      articleFooter.style.borderRadius = "0"; // No rounding on footer container

      // Standardize button height
      const footerButtonHeight = 40;
      const defaultButtons = [{ text: this.app.t("close"), onClick: () => this.onClose(false), backgroundColor: "#F0EAD6" }];
      const footerButtonsConfig = article.footerButtons || defaultButtons;

      // Handle Footer Layout
      if (this.pages && this.pages.length > 1) {

        // 1. Close/Center Button (Widest)
        const mainButtonConfig = footerButtonsConfig[0];
        
        // NEW: Change button text to "Back" if this is a sub-article
        const buttonText = this.parentArticleSlug 
          ? (this.app.t("back") || "Back") 
          : mainButtonConfig.text;
        
        const clickHandler = typeof mainButtonConfig.onClick === 'string'
          ? new Function('component', `return () => { ${mainButtonConfig.onClick.replace('this.onCloseArticle', 'component.onClose').replace('this', 'component')} };`)(this)
          : mainButtonConfig.onClick;

        const mainBtn = new CanvasButton({
          text: buttonText, // Use dynamic text (Back or Close)
          width: 140,
          height: footerButtonHeight,
          textColor: "black",
          font: `bold 16px ${fontFamily}`,
          onClick: clickHandler,
          backgroundColor: mainButtonConfig.backgroundColor || "#F0EAD6",
          hoverBackgroundColor: "#e8dfc5",
          pressedBackgroundColor: "#d4c9ad",
          borderRadius: [8, 0, 0, 0], // Round top-left corner only
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 1,
          appInstance: this.app,
        });
        articleFooter.appendChild(mainBtn.element);

        // 2. Page Label (Page Indicator)
        this.pageIndicatorCanvas = this.createElement("canvas", "page-indicator-canvas");
        this.pageIndicatorCanvas.width = 100;
        this.pageIndicatorCanvas.height = footerButtonHeight;
        this.pageIndicatorCanvas.style.display = "block";
        this.pageIndicatorCanvas.style.margin = "0";
        this.pageIndicatorCanvas.style.padding = "0";
        this.pageIndicatorCanvas.style.borderTop = "1px solid rgba(0,0,0,0.2)";
        articleFooter.appendChild(this.pageIndicatorCanvas);

        // Initial Draw
        this._drawPageIndicator();

        // 3. Left Arrow (Prev) - with proper disabled state
        const prevVisible = this._getNextVisiblePage(this.currentPage, -1);
        const prevBtn = new CanvasButton({
          text: "\u25C0", // Left-pointing triangle
          onClick: () => {
            const prevPage = this._getNextVisiblePage(this.currentPage, -1);
            if (prevPage !== -1) this._goToPage(prevPage);
          },
          width: 40,
          height: footerButtonHeight,
          textColor: "black",
          font: `bold 20px ${fontFamily}`,
          backgroundColor: "#F0EAD6",
          hoverBackgroundColor: "#e8dfc5",
          pressedBackgroundColor: "#d4c9ad",
          disabledBackgroundColor: "#d0d0d0",
          borderRadius: 0, // No rounding
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 1,
          isDisabled: prevVisible === -1,
          appInstance: this.app,
        });
        this.prevPageButton = prevBtn;
        articleFooter.appendChild(prevBtn.element);

        // 4. Create container for next/confirm buttons (same space)
        const rightButtonContainer = this.createElement("div");
        rightButtonContainer.style.position = "relative";
        rightButtonContainer.style.width = "40px";
        rightButtonContainer.style.height = `${footerButtonHeight}px`;
        articleFooter.appendChild(rightButtonContainer);

        // 5. Right Arrow (Next) - will be hidden when confirm shows
        const nextVisible = this._getNextVisiblePage(this.currentPage, 1);
        const nextBtn = new CanvasButton({
          text: "\u25B6", // Right-pointing triangle
          onClick: () => {
            const nextPage = this._getNextVisiblePage(this.currentPage, 1);
            if (nextPage !== -1) this._goToPage(nextPage);
          },
          width: 40,
          height: footerButtonHeight,
          textColor: "black",
          font: `bold 20px ${fontFamily}`,
          backgroundColor: "#F0EAD6",
          hoverBackgroundColor: "#e8dfc5",
          pressedBackgroundColor: "#d4c9ad",
          disabledBackgroundColor: "#d0d0d0",
          borderRadius: [0, 8, 0, 0], // Round top-right corner only
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 1,
          isDisabled: nextVisible === -1,
          appInstance: this.app,
        });
        nextBtn.element.style.position = 'absolute';
        nextBtn.element.style.top = '0';
        nextBtn.element.style.left = '0';
        this.nextPageButton = nextBtn;
        rightButtonContainer.appendChild(nextBtn.element);

        // 6. NEW: Create confirm button with SVG checkmark (replaces next button, not overlay)
        const checkmarkIcon = new Image();
        checkmarkIcon.src = this._createCheckmarkSvg();

        const confirmBtn = new CanvasButton({
          sprite: checkmarkIcon,
          onClick: this._handleConfirmRead,
          width: 40,
          height: footerButtonHeight,
          backgroundColor: "#28a745", // Green for confirm
          hoverBackgroundColor: "#218838",
          pressedBackgroundColor: "#1e7e34",
          borderRadius: [0, 8, 0, 0], // Round top-right corner only
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 1,
          appInstance: this.app,
        });
        confirmBtn.element.style.display = 'none'; // Hide by default
        confirmBtn.element.style.position = 'absolute';
        confirmBtn.element.style.top = '0';
        confirmBtn.element.style.left = '0';
        this.confirmButton = confirmBtn;
        rightButtonContainer.appendChild(confirmBtn.element);

      } else {
        // Not multi-page, center logic
        articleFooter.style.justifyContent = "center";

        footerButtonsConfig.forEach((btnInfo, index) => {
          // NEW: Override button text if this is a sub-article
          let buttonText = btnInfo.text;
          if (index === 0 && this.parentArticleSlug) {
            buttonText = this.app.t("back") || "Back";
          }
          
          const clickHandler = typeof btnInfo.onClick === 'string'
            ? new Function('component', `return () => { ${btnInfo.onClick.replace('this.onCloseArticle', 'component.onClose').replace('this', 'component')} };`)(this)
            : btnInfo.onClick;

          const width = footerButtonsConfig.length === 1 ? 320 : (btnInfo.width || 100);

          // FIXED: Determine border radius based on position - TOP corners
          let radius = 0;
          if (footerButtonsConfig.length === 1) {
            radius = [8, 8, 0, 0]; // Round both top corners
          } else if (index === 0) {
            radius = [8, 0, 0, 0]; // Round top-left
          } else if (index === footerButtonsConfig.length - 1) {
            radius = [0, 8, 0, 0]; // Round top-right
          }

          const btn = new CanvasButton({
            text: buttonText, // Use dynamic text
            width: width,
            height: footerButtonHeight,
            textColor: "black",
            font: `bold 16px ${fontFamily}`,
            onClick: clickHandler,
            backgroundColor: btnInfo.backgroundColor || "#F0EAD6",
            hoverBackgroundColor: "#e8dfc5",
            pressedBackgroundColor: "#d4c9ad",
            borderRadius: radius,
            borderColor: 'rgba(0,0,0,0.2)',
            borderWidth: 1,
            appInstance: this.app,
          });

          articleFooter.appendChild(btn.element);
        });
      }

      this.element.appendChild(header);
      this.element.appendChild(bodyWrapper);

      // Append controls (navigation) before footer
      if (this.controlsWrapper) {
        this.element.appendChild(this.controlsWrapper);
      }

      this.element.appendChild(articleFooter);

      console.log('[Article] Header and footer created, calling drawArticleContent');
      this.drawArticleContent(this._getCurrentPageContent());

      // Trigger initial top screen image update
      setTimeout(() => this._updateTopScreenImage(), 100);
    } catch (error) {
      console.error('[Article] Error in renderArticleView:', error);
      console.error('[Article] Error stack:', error.stack);
      throw error; // Re-throw to be caught by constructor
    }
  }

  async _drawFarBackground() {
    const farBackgroundCanvas = this.createElement("canvas", "far-background-canvas");
    farBackgroundCanvas.width = 320;
    farBackgroundCanvas.height = 240;
    farBackgroundCanvas.style.position = "absolute";
    farBackgroundCanvas.style.top = "0";
    farBackgroundCanvas.style.left = "0";
    farBackgroundCanvas.style.zIndex = "-2";
    this.element.prepend(farBackgroundCanvas);

    const ctx = farBackgroundCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const generator = new StandardPaper();
    const paperCanvas = generator.canvasBackgroundGenerator(farBackgroundCanvas.width, farBackgroundCanvas.height);

    if (paperCanvas) {
      ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
      ctx.fillRect(0, 0, farBackgroundCanvas.width, farBackgroundCanvas.height);
    }
  }

  async _drawHeaderBackground() {
    const canvas = this.headerBackgroundCanvas;
    if (!canvas.clientWidth || !canvas.clientHeight) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.imageSmoothingEnabled = false;

    const generator = new LightPaper();
    const paperCanvas = generator.canvasBackgroundGenerator(canvas.width, canvas.height);

    if (paperCanvas) {
      ctx.save();
      ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(0, 0, canvas.width, canvas.height, [8, 8, 0, 0]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  async _drawBodyBackground() {
    const canvas = this.bodyBackgroundCanvas;
    if (!canvas.clientWidth || !canvas.clientHeight) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.imageSmoothingEnabled = false;

    const generator = new WhitePaper();
    const paperCanvas = generator.canvasBackgroundGenerator(canvas.width, canvas.height);

    if (paperCanvas) {
      ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  async drawArticleContent(text, isUpdate = false) {
    console.log('[Article] drawArticleContent called with text length:', text?.length, 'isUpdate:', isUpdate);

    try {
      // Validate input
      if (text === null || text === undefined) {
        console.warn('[Article] Text is null/undefined, using empty string');
        text = '';
      }

      console.log('[Article] Content text preview:', text?.substring(0, 100));

      if (!isUpdate) {
        this.app.hyperlinks = [];
        this.app.checkboxes = [];

        // Validate richTextRenderer
        if (!this.app.richTextRenderer) {
          throw new Error('RichTextRenderer not available');
        }

        const contentBlocks = this.app.richTextRenderer.parseBlockContent(text || "");
        console.log('[Article] Parsed', contentBlocks.length, 'content blocks');

        this.needsContinuousUpdate = contentBlocks.some(block => block.isAnimated);

        // Validate imageManager before loading images
        if (!this.app.imageManager) {
          console.warn('[Article] ImageManager not available, skipping image loading');
        } else {
          await this.app.imageManager.loadImagesFromBlocks(contentBlocks);
        }

        const ctx = this.articleContentCanvas.getContext("2d");

        if (!ctx) {
          throw new Error('Failed to get canvas 2D context for article content');
        }

        const containerRect = this.scrollableCanvasWrapper.getBoundingClientRect();
        console.log('[Article] Container rect:', containerRect);

        // Validate container dimensions
        if (containerRect.width === 0 || containerRect.height === 0) {
          console.warn('[Article] Container has zero dimensions, deferring render');
          // Retry after a short delay
          setTimeout(() => {
            console.log('[Article] Retrying drawArticleContent after delay');
            this.drawArticleContent(text, false);
          }, 100);
          return;
        }

        const horizontalPadding = 10;
        const verticalPadding = 10;
        const drawAreaWidth = this.app.articleContentTextWidth - horizontalPadding * 2;

        let totalMeasuredHeight = verticalPadding;
        for (const block of contentBlocks) {
          try {
            totalMeasuredHeight += this._measureBlockHeight(ctx, block, drawAreaWidth) + (this.app.cssVars.blockSpacing || 10);
          } catch (blockError) {
            console.error('[Article] Error measuring block:', blockError, block);
            totalMeasuredHeight += 20; // Fallback height
          }
        }
        totalMeasuredHeight += verticalPadding;

        console.log('[Article] Total measured height:', totalMeasuredHeight);

        this.articleContentCanvas.width = containerRect.width;
        this.articleContentCanvas.height = Math.max(this.scrollableCanvasWrapper.clientHeight, totalMeasuredHeight);
        this.articleContentCanvas.style.height = `${this.articleContentCanvas.height}px`;

        console.log('[Article] Canvas dimensions:', this.articleContentCanvas.width, 'x', this.articleContentCanvas.height);
      }

      const ctx = this.articleContentCanvas.getContext("2d");

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.clearRect(0, 0, this.articleContentCanvas.width, this.articleContentCanvas.height);

      const generator = new WhitePaper();
      const paperCanvas = generator.canvasBackgroundGenerator(320, 240);
      if (paperCanvas) {
        ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
        ctx.fillRect(0, 0, this.articleContentCanvas.width, this.articleContentCanvas.height);
      }

      const contentBlocks = this.app.richTextRenderer.parseBlockContent(text || "");
      const horizontalPadding = 10;
      const verticalPadding = 10;
      const drawAreaWidth = this.app.articleContentTextWidth - horizontalPadding * 2;
      let currentY = verticalPadding;
      ctx.textBaseline = "top";

      for (const block of contentBlocks) {
        try {
          const blockHeight = this._drawFormattedBlock(ctx, this.htmlOverlay, block, horizontalPadding, currentY, drawAreaWidth);
          currentY += blockHeight + (this.app.cssVars.blockSpacing || 10);
        } catch (blockError) {
          console.error('[Article] Error drawing block:', blockError, block);
          // Continue with next block instead of crashing
          currentY += 20; // Add minimal spacing
        }
      }

      if (!isUpdate) {
        this.articleScrollbar.update();
      }

      console.log('[Article] drawArticleContent completed successfully');
    } catch (error) {
      console.error('[Article] Critical error in drawArticleContent:', error);
      console.error('[Article] Error stack:', error.stack);

      // Try to show error on canvas
      try {
        const ctx = this.articleContentCanvas?.getContext("2d");
        if (ctx) {
          ctx.fillStyle = '#f8d7da';
          ctx.fillRect(0, 0, this.articleContentCanvas.width, this.articleContentCanvas.height);
          ctx.fillStyle = '#721c24';
          ctx.font = '14px Rodin, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Error loading article content', this.articleContentCanvas.width / 2, 50);
          ctx.fillText(error.message, this.articleContentCanvas.width / 2, 75);
        }
      } catch (displayError) {
        console.error('[Article] Failed to display error on canvas:', displayError);
      }

      throw error; // Re-throw for parent to handle
    }
  }

  _drawFormattedBlock(ctx, htmlOverlay, block, x, y, maxWidth) {
    try {
      // Get font family from rich text renderer (includes Chinese font support)
      const fontFamily = this.app.richTextRenderer._getFontFamily();
      const baseFont = `14px ${fontFamily}`;
      const baseColor = this.app.cssVars["--ds-text"] || "#000000";
      const lineSpacingFactor = this.lineSpacingFactor;

      if (!this.app.richTextRenderer) {
        console.error('[Article] RichTextRenderer not initialized');
        return 20; // Return minimal height
      }

      if (!block) {
        console.warn('[Article] Block is null/undefined');
        return 0;
      }

      switch (block.type) {
        case "paragraph": {
          if (block.tokens.length === 1 && block.tokens[0].text === " ") return 14 * lineSpacingFactor;
          const { height, links, isAnimated } = this.app.richTextRenderer.renderInlineFormattedText(ctx, block.tokens, x, y, baseFont, baseColor, maxWidth, lineSpacingFactor, false);
          if (isAnimated) this.needsContinuousUpdate = true;
          if (this.app.hyperlinks && links) this.app.hyperlinks.push(...links);
          return height;
        }
        case "hr": {
          ctx.fillStyle = "rgba(0,0,0,0.1)";
          ctx.fillRect(x, y + 4, maxWidth, 1);
          return 10;
        }
        case "checkbox": {
          const boxSize = 14;
          const boxY = y + (20 - boxSize) / 2;
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, boxY, boxSize, boxSize);

          if (this.app.checkboxes) this.app.checkboxes.push({ rect: { x, y: boxY, width: boxSize, height: boxSize }, checked: block.checked });

          if (block.checked) {
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.moveTo(x + 3, boxY + 7);
            ctx.lineTo(x + 6, boxY + 10);
            ctx.lineTo(x + 11, boxY + 4);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          const { height, links } = this.app.richTextRenderer.renderInlineFormattedText(ctx, block.tokens, x + boxSize + 8, y, baseFont, baseColor, maxWidth - (boxSize + 8), lineSpacingFactor, false);
          if (this.app.hyperlinks && links) this.app.hyperlinks.push(...links);
          return Math.max(20, height);
        }
        case "image": {
          const img = this.app.imageManager.getImage(block.url);
          if (img && img.complete) {
            const imgHeight = (maxWidth / img.width) * img.height;
            ctx.drawImage(img, x, y, maxWidth, imgHeight);
            return imgHeight;
          }
          ctx.fillStyle = "rgba(0,0,0,0.1)";
          ctx.fillRect(x, y, maxWidth, 50);
          this.app._drawTextOnCanvas(ctx, "Loading Image...", x + maxWidth / 2, y + 25, `12px ${fontFamily}`, "rgba(0,0,0,0.4)", "center", "middle");
          return 50;
        }
        case "embed": {
          const embedHeight = (maxWidth * 9) / 16;
          const iframe = this.createElement("iframe", "embedded-media");
          iframe.style.position = "absolute";
          iframe.style.left = `${x}px`;
          iframe.style.top = `${y}px`;
          iframe.style.width = `${maxWidth}px`;
          iframe.style.height = `${embedHeight}px`;
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute("allowfullscreen", "true");
          if (block.service === "youtube") {
            iframe.src = `https://www.youtube.com/embed/${block.id}`;
          }
          htmlOverlay.appendChild(iframe);
          return embedHeight;
        }
        case "list": {
          let currentY = y;
          block.items.forEach((item, index) => {
            const itemX = x + item.level * 20;
            const itemMaxWidth = maxWidth - item.level * 20 - 20;
            if (block.ordered) {
              this.app._drawTextOnCanvas(ctx, `${index + 1}.`, itemX, currentY, baseFont, baseColor, "left", "top");
            } else {
              ctx.beginPath();
              ctx.arc(itemX + 4, currentY + 7, 3, 0, Math.PI * 2);
              ctx.fillStyle = baseColor;
              ctx.fill();
            }
            const { height, links, isAnimated } = this.app.richTextRenderer.renderInlineFormattedText(ctx, item.tokens, itemX + 15, currentY, baseFont, baseColor, itemMaxWidth, lineSpacingFactor, false);
            if (isAnimated) this.needsContinuousUpdate = true;
            if (this.app.hyperlinks && links) this.app.hyperlinks.push(...links);
            currentY += height;
          });
          return currentY - y;
        }
        case "table": {
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1;
          const colWidth = maxWidth / block.headers.length;
          let currentY = y;
          block.headers.forEach((header, i) => {
            const { links, isAnimated } = this.app.richTextRenderer.renderInlineFormattedText(ctx, header.tokens, x + i * colWidth + 5, currentY + 5, `bold ${baseFont}`, baseColor, colWidth - 10, lineSpacingFactor, false);
            if (isAnimated) this.needsContinuousUpdate = true;
            if (this.app.hyperlinks && links) this.app.hyperlinks.push(...links);
          });
          currentY += 30;
          ctx.beginPath();
          ctx.moveTo(x, currentY);
          ctx.lineTo(x + maxWidth, currentY);
          ctx.stroke();

          block.rows.forEach((row) => {
            let maxRowHeight = 30;

            // First pass: Measure max height for this row
            row.forEach((cell) => {
              const { height } = this.app.richTextRenderer.renderInlineFormattedText(ctx, cell.tokens, 0, 0, baseFont, "#000", colWidth - 10, lineSpacingFactor, true);
              maxRowHeight = Math.max(maxRowHeight, height + 10);
            });

            // Second pass: Render cells
            row.forEach((cell, i) => {
              const { links, isAnimated } = this.app.richTextRenderer.renderInlineFormattedText(ctx, cell.tokens, x + i * colWidth + 5, currentY + 5, baseFont, baseColor, colWidth - 10, lineSpacingFactor, false);
              if (isAnimated) this.needsContinuousUpdate = true;
              if (this.app.hyperlinks && links) this.app.hyperlinks.push(...links);
            });

            currentY += maxRowHeight;
            ctx.beginPath();
            ctx.moveTo(x, currentY);
            ctx.lineTo(x + maxWidth, currentY);
            ctx.stroke();
          });
          return currentY - y;
        }
        default:
          return 0;
      }
    } catch (error) {
      console.error('[Article] Error in _drawFormattedBlock:', error);
      return 20;
    }
  }

  _measureBlockHeight(ctx, block, maxWidth) {
    if (!block) return 0;

    try {
      const fontFamily = this.app.richTextRenderer._getFontFamily();
      const baseFont = `14px ${fontFamily}`;
      const lineSpacingFactor = this.lineSpacingFactor;

      switch (block.type) {
        case "paragraph": {
          if (block.tokens.length === 1 && block.tokens[0].text === " ") return 14 * lineSpacingFactor;
          const { height } = this.app.richTextRenderer.renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, "#000", maxWidth, lineSpacingFactor, true);
          return height;
        }
        case "hr": return 10;
        case "checkbox": {
          const boxSize = 14;
          const { height } = this.app.richTextRenderer.renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, "#000", maxWidth - (boxSize + 8), lineSpacingFactor, true);
          return Math.max(20, height);
        }
        case "image": {
          // Logic to estimate height if image not loaded, or use logic from _drawFormattedBlock
          const img = this.app.imageManager.getImage(block.url);
          if (img && img.complete) {
            return (maxWidth / img.width) * img.height;
          }
          return 50;
        }
        case "embed": return (maxWidth * 9) / 16;
        case "list": {
          let totalHeight = 0;
          block.items.forEach((item) => {
            const itemMaxWidth = maxWidth - item.level * 20 - 20;
            const { height } = this.app.richTextRenderer.renderInlineFormattedText(ctx, item.tokens, 0, 0, baseFont, "#000", itemMaxWidth, lineSpacingFactor, true);
            totalHeight += height;
          });
          return totalHeight;
        }
        case "table": {
          let height = 30; // Headers
          block.rows.forEach(row => {
            let maxRowHeight = 30;
            const colWidth = maxWidth / block.headers.length;
            row.forEach(cell => {
              const { height } = this.app.richTextRenderer.renderInlineFormattedText(ctx, cell.tokens, 0, 0, baseFont, "#000", colWidth - 10, lineSpacingFactor, true);
              maxRowHeight = Math.max(maxRowHeight, height + 10);
            });
            height += maxRowHeight;
          });
          return height;
        }
        default: return 0;
      }
    } catch (e) {
      console.warn("[Article] Measure block height failed", e);
      return 20;
    }
  }
}
