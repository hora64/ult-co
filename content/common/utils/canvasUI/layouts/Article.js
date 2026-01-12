import { UIComponent, TextCanvasMeasurer, Scrollbar, CanvasButton, CanvasInteractionHandler, WhitePaper, LightPaper, EnvelopePaper, StandardPaper } from '/content/common/utils/index.js';


export class Article extends UIComponent {
    constructor({
        appInstance,
        article,
        onShare,
        onClose,
        articleSchema
    }) {
        super();
        this.app = appInstance;
        this.article = this.transformArticle(article, articleSchema);
        this.onShare = onShare;
        this.onClose = onClose;
        this.element = this.createElement("div", "article-view-wrapper");
        this.lineSpacingFactor = 1.5;
        this.needsContinuousUpdate = false;

        this._measureBlockHeight = this._measureBlockHeight.bind(this);
        this.drawArticleContent = this.drawArticleContent.bind(this);
        this._drawHeaderBackground = this._drawHeaderBackground.bind(this);
        this._drawBodyBackground = this._drawBodyBackground.bind(this);
        this._drawFarBackground = this._drawFarBackground.bind(this);

        this.render();
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
                // If a mapping is not provided for a key, assume it's at the root of the original article.
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
            this.drawArticleContent(this.article.content, true);
        }
    }

    renderArticleView(article) {
        console.log('[Article] renderArticleView called with article:', article);
        
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

        if (!article) {
            console.error('[Article] No article data provided to renderArticleView');
            return;
        }

        console.log('[Article] Creating header with title:', article.title);
        
        const header = this.createElement("div", "article-header-content");

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

        const titleWrapper = this.createElement("div", "article-title-wrapper");
        const articleTitleCanvas = this.createElement("canvas", "article-title-h1");
        articleTitleCanvas.width = this.app.articleTitleTextWidth;
        articleTitleCanvas.height = 48;
        const articleTitleCtx = articleTitleCanvas.getContext("2d");
        articleTitleCtx.imageSmoothingEnabled = false;

        let titleFont = 'bold 20px "Rodin", sans-serif';
        const maxTitleWidth = articleTitleCanvas.width;
        const initialMaxTitleHeight = 48;
        let finalFont = titleFont;
        const measurer = new TextCanvasMeasurer();
        let measuredTitleHeight = measurer.estimateWrappedTextHeight(article.title, finalFont, maxTitleWidth, this.app.articleTitleLineSpacingFactor);

        if (measuredTitleHeight > initialMaxTitleHeight) {
            finalFont = 'bold 16px "Rodin", sans-serif';
            measuredTitleHeight = measurer.estimateWrappedTextHeight(article.title, finalFont, maxTitleWidth, this.app.articleTitleLineSpacingFactor);
            if (measuredTitleHeight > initialMaxTitleHeight) {
                finalFont = 'bold 14px "Rodin", sans-serif';
                measuredTitleHeight = measurer.estimateWrappedTextHeight(article.title, finalFont, maxTitleWidth, this.app.articleTitleLineSpacingFactor);
            }
        }

        // Update canvas height to fit measured content
        articleTitleCanvas.height = Math.max(measuredTitleHeight, 24);
        articleTitleCanvas.style.height = `${articleTitleCanvas.height}px`;
        articleTitleCtx.clearRect(0, 0, articleTitleCanvas.width, articleTitleCanvas.height);
        let textY = (articleTitleCanvas.height - measuredTitleHeight) / 2;
        this.app._drawTextOnCanvas(articleTitleCtx, article.title, 0, textY, finalFont, "black", "left", "top", maxTitleWidth, this.app.articleTitleLineSpacingFactor);

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
        });

        const articleMetaCanvas = this.createElement("canvas", "article-meta-canvas");
        articleMetaCanvas.width = 290;
        articleMetaCanvas.height = 20;
        const articleMetaCtx = articleMetaCanvas.getContext("2d");
        articleMetaCtx.imageSmoothingEnabled = false;

        const articleDateTime = this.app.userTimeZone ? luxon.DateTime.fromISO(article.date).setZone(this.app.userTimeZone) : luxon.DateTime.fromISO(article.date);
        const formattedDate = articleDateTime.toFormat("MM/dd/yy");
        const formattedTime = articleDateTime.toLocaleString(luxon.DateTime.TIME_SIMPLE);
        const timeZoneAbbr = articleDateTime.toFormat("ZZZZ");

        let metaTextParts = [];
        if (article.author && article.author.trim() !== "") {
            metaTextParts.push(this.app.t("byAuthor", { author: article.author }));
        }
        if (article.publisher && article.publisher.trim() !== "") {
            metaTextParts.push(article.publisher);
        }
        metaTextParts.push(`${formattedDate} ${formattedTime} ${timeZoneAbbr}`);
        const combinedMetaText = metaTextParts.join(" · ");

        // Clear and draw the meta canvas
        articleMetaCtx.clearRect(0, 0, articleMetaCanvas.width, articleMetaCanvas.height);
        this.app._drawTextOnCanvas(articleMetaCtx, combinedMetaText, 0, articleMetaCanvas.height / 2, '12px "Rodin", sans-serif', this.app.cssVars["--ds-text-subtle"], "left", "middle");

        titleWrapper.appendChild(articleTitleCanvas);
        if (this.onShare) {
            titleWrapper.appendChild(this.shareButton.element);
        }
        header.appendChild(titleWrapper);
        header.appendChild(articleMetaCanvas);

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

        const articleFooter = this.createElement("div", "article-footer");
        const defaultButtons = [{ text: this.app.t("close"), onClick: () => this.onClose(false), backgroundColor: "#F0EAD6" }];
        const buttonsToShow = article.footerButtons || defaultButtons;
        const buttonWidth = 320 / buttonsToShow.length;

        buttonsToShow.forEach((btnInfo, index) => {
            let borderRadius = 0;
            if (buttonsToShow.length === 1) borderRadius = [12, 12, 0, 0];
            else if (index === 0) borderRadius = [12, 0, 0, 0];
            else if (index === buttonsToShow.length - 1) borderRadius = [0, 12, 0, 0];

            const clickHandler = typeof btnInfo.onClick === 'string'
                ? new Function('component', `return () => { ${btnInfo.onClick.replace('this.onCloseArticle', 'component.onClose').replace('this', 'component')} };`)(this)
                : btnInfo.onClick;

            const button = new CanvasButton({
                text: btnInfo.text,
                width: buttonWidth,
                height: 40,
                textColor: "black",
                font: 'bold 16px "Rodin", sans-serif',
                onClick: clickHandler,
                backgroundColor: btnInfo.backgroundColor || "#F0EAD6",
                pressedBackgroundColor: "#e4d9b5",
                borderRadius: borderRadius,
                borderColor: 'rgba(0,0,0,0.2)',
                borderWidth: 1,
            });
            articleFooter.appendChild(button.element);
        });

        this.element.appendChild(header);
        this.element.appendChild(bodyWrapper);
        this.element.appendChild(articleFooter);

        this.drawArticleContent(article.content);
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
        console.log('[Article] Content text preview:', text?.substring(0, 100));
        
        if (!isUpdate) {
            this.app.hyperlinks = [];
            this.app.checkboxes = [];

            const contentBlocks = this.app.richTextRenderer.parseBlockContent(text || "");
            console.log('[Article] Parsed', contentBlocks.length, 'content blocks:', contentBlocks);
            
            this.needsContinuousUpdate = contentBlocks.some(block => block.isAnimated);
            await this.app.imageManager.loadImagesFromBlocks(contentBlocks);

            const ctx = this.articleContentCanvas.getContext("2d");
            const containerRect = this.scrollableCanvasWrapper.getBoundingClientRect();
            console.log('[Article] Container rect:', containerRect);
            
            const horizontalPadding = 10;
            const verticalPadding = 10;
            const drawAreaWidth = this.app.articleContentTextWidth - horizontalPadding * 2;

            let totalMeasuredHeight = verticalPadding;
            for (const block of contentBlocks) {
                totalMeasuredHeight += this._measureBlockHeight(ctx, block, drawAreaWidth) + (this.app.cssVars.blockSpacing || 10);
            }
            totalMeasuredHeight += verticalPadding;

            console.log('[Article] Total measured height:', totalMeasuredHeight);
            
            this.articleContentCanvas.width = containerRect.width;
            this.articleContentCanvas.height = Math.max(this.scrollableCanvasWrapper.clientHeight, totalMeasuredHeight);
            this.articleContentCanvas.style.height = `${this.articleContentCanvas.height}px`;
            
            console.log('[Article] Canvas dimensions:', this.articleContentCanvas.width, 'x', this.articleContentCanvas.height);
        }

        const ctx = this.articleContentCanvas.getContext("2d");
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
            const blockHeight = this._drawFormattedBlock(ctx, this.htmlOverlay, block, horizontalPadding, currentY, drawAreaWidth);
            currentY += blockHeight + (this.app.cssVars.blockSpacing || 10);
        }

        if (!isUpdate) {
            this.articleScrollbar.update();
        }
    }

    _drawFormattedBlock(ctx, htmlOverlay, block, x, y, maxWidth) {
        const baseFont = '14px "Rodin", sans-serif';
        const baseColor = this.app.cssVars["--ds-text"] || "#000000";
        const lineSpacingFactor = this.lineSpacingFactor;

        if (!this.app.richTextRenderer) {
            console.error('RichTextRenderer not initialized');
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
                this.app._drawTextOnCanvas(ctx, "Loading Image...", x + maxWidth / 2, y + 25, '12px "Rodin", sans-serif', "rgba(0,0,0,0.4)", "center", "middle");
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
                    row.forEach((cell, i) => {
                        const { height, links, isAnimated } = this.app.richTextRenderer.renderInlineFormattedText(ctx, cell.tokens, 0, 0, baseFont, baseColor, colWidth - 10, lineSpacingFactor, false);
                        if (isAnimated) this.needsContinuousUpdate = true;
                        if (this.app.hyperlinks && links) this.app.hyperlinks.push(...links);
                        maxRowHeight = Math.max(maxRowHeight, height + 10);
                    });
                    currentY += maxRowHeight;
                    ctx.beginPath();
                    ctx.moveTo(x, currentY);
                    ctx.lineTo(x + maxWidth, currentY);
                    ctx.stroke();
                });

                for (let i = 1; i < block.headers.length; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x + i * colWidth, y);
                    ctx.lineTo(x + i * colWidth, currentY);
                    ctx.stroke();
                }
                return currentY - y;
            }
        }
        return 0;
    }

    _measureBlockHeight(ctx, block, maxWidth) {
        const baseFont = '14px "Rodin", sans-serif';
        const lineSpacingFactor = this.lineSpacingFactor;

        if (!this.app.richTextRenderer) {
            console.error('RichTextRenderer not initialized');
            return 0;
        }

        switch (block.type) {
            case "paragraph":
                if (block.tokens.length === 1 && block.tokens[0].text === " ") return 14 * lineSpacingFactor;
                return this.app.richTextRenderer.renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, "black", maxWidth, lineSpacingFactor, true).height;
            case "hr":
                return 10;
            case "checkbox":
                const textHeight = this.app.richTextRenderer.renderInlineFormattedText(ctx, block.tokens, 0, 0, baseFont, "black", maxWidth - 22, lineSpacingFactor, true).height;
                return Math.max(20, textHeight);
            case "image":
                const img = this.app.imageManager.getImage(block.url);
                if (img && img.complete) return (maxWidth / img.width) * img.height;
                return 50;
            case "embed":
                return (maxWidth * 9) / 16;
            case "list":
                let totalListHeight = 0;
                block.items.forEach((item) => {
                    const itemX = (item.level + 1) * 20 + 15;
                    const itemMaxWidth = maxWidth - itemX;
                    totalListHeight += this.app.richTextRenderer.renderInlineFormattedText(ctx, item.tokens, 0, 0, baseFont, "black", itemMaxWidth, lineSpacingFactor, true).height;
                });
                return totalListHeight;
            case "table":
                let totalTableHeight = 30;
                const colWidth = maxWidth / block.headers.length;
                block.rows.forEach((row) => {
                    let maxRowHeight = 30;
                    row.forEach((cell) => {
                        const { height } = this.app.richTextRenderer.renderInlineFormattedText(ctx, cell.tokens, 0, 0, baseFont, "black", colWidth - 10, lineSpacingFactor, true);
                        maxRowHeight = Math.max(maxRowHeight, height + 10);
                    });
                    totalTableHeight += maxRowHeight;
                });
                return totalTableHeight;
        }
        return 0;
    }

    _getCanvasCoordinates(e) {
        const canvas = this.articleContentCanvas;
        let x = e.pageX;
        let y = e.pageY;
        let offsetElement = canvas;
        let totalOffsetLeft = 0;
        let totalOffsetTop = 0;
        while (offsetElement) {
            totalOffsetLeft += offsetElement.offsetLeft - offsetElement.scrollLeft;
            totalOffsetTop += offsetElement.offsetTop - offsetElement.scrollTop;
            offsetElement = offsetElement.offsetParent;
        }
        x = x - totalOffsetLeft;
        y = y - totalOffsetTop;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: x * scaleX, y: y * scaleY };
    }
}
