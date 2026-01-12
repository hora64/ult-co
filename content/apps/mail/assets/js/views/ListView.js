import { UIComponent, Scrollbar, CanvasInput, CanvasButton, UnreadIndicator, LightPaper, StandardPaper } from '/content/common/utils/index.js';

export class ListView extends UIComponent {
    constructor({
        appInstance,
        onArticleSelect,
        onSearch,
        onShowFilter,
        onClose
    }) {
        super();
        this.app = appInstance;
        this.element = this.createElement("div", "list-view view");
        this.onArticleSelect = onArticleSelect;
        this.onSearch = onSearch;
        this.onShowFilter = onShowFilter;
        this.onClose = onClose;
        this.sounds = this.app.sounds;
        this.sprites = this.app.sprites;
        this.marqueeData = {};
        this.announcements = [];
        this.searchQuery = "";

        this._initDOM();
    }

    _initDOM() {
        this.backgroundCanvas = this.createElement("canvas", "view-background");
        this.backgroundCanvas.width = 320;
        this.backgroundCanvas.height = 240;
        this.backgroundCanvas.style.position = "absolute";
        this.backgroundCanvas.style.top = "0";
        this.backgroundCanvas.style.left = "0";
        this.backgroundCanvas.style.width = "100%";
        this.backgroundCanvas.style.height = "100%";
        this.backgroundCanvas.style.zIndex = "-2";
        this.element.appendChild(this.backgroundCanvas);

        const listHeader = this.createElement("div", "list-header");

        this.headerBackgroundCanvas = this.createElement("canvas", "header-background-canvas");
        this.headerBackgroundCanvas.style.position = "absolute";
        this.headerBackgroundCanvas.style.top = "0";
        this.headerBackgroundCanvas.style.left = "0";
        this.headerBackgroundCanvas.style.width = "100%";
        this.headerBackgroundCanvas.style.height = "100%";
        this.headerBackgroundCanvas.style.zIndex = "-1";
        listHeader.appendChild(this.headerBackgroundCanvas);

        this.canvasSearchInput = new CanvasInput({
            placeholder: this.app.t("searchPlaceholder"),
            value: this.searchQuery,
            onUpdate: (value) => this.onSearch(value),
            appInstance: this.app,
        });
        this.filterButton = new CanvasButton({
            sprite: this.sprites.filter,
            width: 36,
            height: 36,
            onClick: this.onShowFilter,
            backgroundColor: "rgba(0,0,0,0)",
            activeBackgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 6,
            shadowOffset: {
                x: 0,
                y: 2,
                blur: 4,
                color: "rgba(0,0,0,0.2)",
            },
            highlightEnabled: false,
        });
        listHeader.appendChild(this.canvasSearchInput.element);
        listHeader.appendChild(this.filterButton.element);

        const bodyWrapper = this.createElement("div", "list-body-wrapper");
        this.listBodyCanvas = this.createElement("canvas", "list-body-canvas");
        bodyWrapper.appendChild(this.listBodyCanvas);
        this.listContainer = this.createElement("div", "list-container");
        bodyWrapper.appendChild(this.listContainer);
        this.listScrollbar = new Scrollbar(
            this.listContainer,
            this.app,
            {
                trackColor: 'rgba(0,0,0,0.1)',
                thumbColor: '#DDDDDD',
                thumbHoverColor: '#606060'
            }
        );
        bodyWrapper.appendChild(this.listScrollbar.element);

        const listFooter = this.createElement("div", "list-footer");
        this.exitButton = new CanvasButton({
            text: this.app.t("footer.exit"),
            width: 320,
            height: 40,
            font: 'bold 16px "Rodin", sans-serif',
            textColor: "black",
            onClick: () => this.onClose(true),
            className: "exit-button",
            backgroundColor: "#F0EAD6",
            activeBackgroundColor: "#D8D3C1",
            borderRadius: [12, 12, 0, 0],
        });
        listFooter.appendChild(this.exitButton.element);

        this.element.appendChild(listHeader);
        this.element.appendChild(bodyWrapper);
        this.element.appendChild(listFooter);

        setTimeout(() => {
            this.canvasSearchInput.resize();
            this._drawListBodyBackground();
            this._drawViewBackground();
        }, 0);
    }

    render(data) {
        this.announcements = data.announcements || [];
        this.searchQuery = data.searchQuery || "";

        this._drawHeaderBackground();

        this.canvasSearchInput.setValue(this.searchQuery);
        this.listContainer.innerHTML = "";

        if (this.announcements.length === 0) {
            const noResultsCanvas = this.createElement("canvas", "no-results-canvas");
            noResultsCanvas.width = 280;
            noResultsCanvas.height = 100;
            this.listContainer.appendChild(noResultsCanvas);
            const noResultsCtx = noResultsCanvas.getContext("2d");
            noResultsCtx.imageSmoothingEnabled = false;
            this.app._drawTextOnCanvas(
                noResultsCtx,
                this.app.t("noResults"),
                noResultsCanvas.width / 2,
                noResultsCanvas.height / 2,
                '14px "Rodin", sans-serif',
                "black",
                "center",
                "middle"
            );
            this.listScrollbar.element.style.visibility = "hidden";
        } else {
            this.announcements.forEach((ann) => {
                const itemCanvas = this.createElement("canvas", "list-item-canvas");
                itemCanvas.width = 256;
                itemCanvas.height = 32;
                itemCanvas.dataset.slug = ann.slug;
                this.listContainer.appendChild(itemCanvas);
                itemCanvas.addEventListener("click", () => this.onArticleSelect(ann));
                itemCanvas.addEventListener("mouseenter", () => this.sounds.hover.play());
            });
            this.listScrollbar.element.style.visibility = "visible";
        }
        this.listScrollbar.update();
    }

    async _drawHeaderBackground() {
        const canvas = this.headerBackgroundCanvas;
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctx.imageSmoothingEnabled = false;

        const generator = new LightPaper();
        const paperCanvas = generator.canvasBackgroundGenerator(canvas.width, canvas.height);

        if (paperCanvas) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(0, 0, canvas.width, canvas.height, 6);
            ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
            ctx.fill();
            ctx.clip();

            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
            ctx.restore();
        }
    }

    async _drawViewBackground() {
        const canvas = this.backgroundCanvas;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const generator = new StandardPaper();
        const paperCanvas = await generator.canvasBackgroundGenerator(canvas.width, canvas.height);

        if (paperCanvas) {
            ctx.drawImage(paperCanvas, 0, 0, canvas.width, canvas.height);
        }
    }

    async _drawListBodyBackground() {
        const canvas = this.listBodyCanvas;
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctx.imageSmoothingEnabled = false;

        const generator = new LightPaper();
        const paperCanvas = generator.canvasBackgroundGenerator(canvas.width, canvas.height);

        if (paperCanvas) {
            ctx.save();
            ctx.fillStyle = ctx.createPattern(paperCanvas, "repeat");
            ctx.fill();
            ctx.restore();
        }
    }

    update(time) {
        this.drawListItems(time);
    }

    drawListItems(time = 0) {
        const items = this.listContainer.querySelectorAll(".list-item-canvas");
        if (!this.announcements || !items || items.length !== this.announcements.length) return;

        items.forEach((canvas, index) => {
            const ann = this.announcements[index];
            if (!ann) return;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            ctx.save();
            //ctx.shadowColor = "rgba(0,0,0,0.1)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, 6);
            ctx.fillStyle = "#FDF5E6";
            ctx.fill();
            ctx.clip();

            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

            ctx.restore();

            if (ann.iconPath && this.sprites[ann.iconPath]) {
                ctx.drawImage(this.sprites[ann.iconPath], 15, (h - 24) / 2, 24, 24);
            }

            const titleX = 50, titleW = w - 130, titleY = h / 2 + 1;
            ctx.save();
            ctx.beginPath();
            ctx.rect(titleX, 0, titleW, h);
            ctx.clip();

            if (!this.marqueeData[ann.slug]) {
                ctx.font = 'bold 14px "Rodin", sans-serif';
                const textWidth = ctx.measureText(ann.title).width;
                this.marqueeData[ann.slug] = {
                    x: 0,
                    textWidth,
                    shouldScroll: textWidth > titleW,
                    lastTime: time,
                };
            }

            const marquee = this.marqueeData[ann.slug];
            const deltaTime = time - marquee.lastTime;
            marquee.lastTime = time;

            let textRenderX = titleX;
            if (marquee.shouldScroll) {
                marquee.x -= (15 / 1000) * deltaTime;
                textRenderX = titleX + marquee.x;
                if (marquee.x < -(marquee.textWidth + 60)) marquee.x = 0;
            }

            this.app._drawTextOnCanvas(ctx, ann.title, textRenderX, titleY, 'bold 14px "Rodin", sans-serif', "black", "left", "middle");
            if (marquee.shouldScroll) {
                this.app._drawTextOnCanvas(ctx, ann.title, textRenderX + marquee.textWidth + 60, titleY, 'bold 14px "Rodin", sans-serif', "black", "left", "middle");
            }
            ctx.restore();

            const fadeWidth = 4;
            const itemBgColor = "#FDF5E6";
            const leftFade = ctx.createLinearGradient(titleX, 0, titleX + fadeWidth, 0);
            leftFade.addColorStop(0, itemBgColor);
            leftFade.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = leftFade;
            ctx.fillRect(titleX, 0, fadeWidth, h);

            const rightFade = ctx.createLinearGradient(titleX + titleW - fadeWidth, 0, titleX + titleW, 0);
            rightFade.addColorStop(0, "rgba(0,0,0,0)");
            rightFade.addColorStop(1, itemBgColor);
            ctx.fillStyle = rightFade;
            ctx.fillRect(titleX + titleW - fadeWidth, 0, fadeWidth, h);

            const annDateTime = luxon.DateTime.fromISO(ann.date);
            this.app._drawTextOnCanvas(ctx, annDateTime.toFormat("D"), w - 42, h / 2 - 6, '11px "Rodin", sans-serif', "#333", "center", "middle");
            this.app._drawTextOnCanvas(ctx, annDateTime.toFormat("hh:mm a"), w - 42, h / 2 + 8, '11px "Rodin", sans-serif', "#333", "center", "middle");

            if (!ann.read) {
                const indicatorOptions = ann.unreadIndicator || {};
                const unreadIndicator = new UnreadIndicator(indicatorOptions);
                const iconX = 15;
                const iconY = (h - 24) / 2;
                const sparkleOffsetX = 0;
                const sparkleOffsetY = 4;
                unreadIndicator.draw(ctx, iconX + sparkleOffsetX, iconY + sparkleOffsetY, time);
            }
        });
    }

    triggerUnopenedMailAnimation(article) {
        const listItemCanvas = Array.from(this.listContainer.children).find((canvas) => canvas.dataset.slug === article.slug);

        if (listItemCanvas) {
            const appRect = this.app.root.getBoundingClientRect();
            const itemRect = listItemCanvas.getBoundingClientRect();

            const dotCenterX = itemRect.left - appRect.left + 19;
            const dotCenterY = itemRect.top - appRect.top + 12;

            const explosionCanvas = this.createElement("canvas", "dot-explosion-overlay");
            explosionCanvas.width = appRect.width;
            explosionCanvas.height = appRect.height;
            explosionCanvas.style.position = 'absolute';
            explosionCanvas.style.left = '0';
            explosionCanvas.style.top = '0';
            explosionCanvas.style.pointerEvents = 'none';
            this.app.root.appendChild(explosionCanvas);

            const ctx = explosionCanvas.getContext('2d');
            const startTime = performance.now();
            const duration = 300;
            const startRadius = 4;
            const endRadius = 12;
            const color = '#007bff';

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                ctx.clearRect(0, 0, explosionCanvas.width, explosionCanvas.height);

                if (progress < 1) {
                    const currentRadius = startRadius + (endRadius - startRadius) * progress;
                    const opacity = 1 - progress;

                    const gradient = ctx.createRadialGradient(
                        dotCenterX, dotCenterY, 0,
                        dotCenterX, dotCenterY, currentRadius
                    );
                    gradient.addColorStop(0, `rgba(0, 123, 255, ${opacity * 0.7})`);
                    gradient.addColorStop(0.8, `rgba(0, 123, 255, ${opacity * 0.1})`);
                    gradient.addColorStop(1, `rgba(0, 123, 255, 0)`);

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(dotCenterX, dotCenterY, currentRadius, 0, Math.PI * 2);
                    ctx.fill();

                    requestAnimationFrame(animate);
                } else {
                    explosionCanvas.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }
}
