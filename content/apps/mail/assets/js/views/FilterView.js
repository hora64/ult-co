import { UIComponent, TextCanvasMeasurer, Scrollbar, CanvasButton, RoughPaper, LightPaper } from '/content/common/utils/index.js';

export class FilterView extends UIComponent {
    constructor({ appInstance, onFilterChange }) {
        super();
        this.app = appInstance;
        this.onFilterChange = onFilterChange;
        this.element = this.createElement("div", "filter-view view");

        this._initDOM();
    }

    _initDOM() {
        // Filter menu canvas
        this.filterMenuView = this.createElement("canvas", "filter-menu-canvas");
        this.filterMenuView.width = 320;
        this.filterMenuView.height = 240;
        this.filterMenuCtx = this.filterMenuView.getContext("2d");
        this.filterMenuCtx.imageSmoothingEnabled = false;
        this.element.appendChild(this.filterMenuView);
    }

    async render(data) {
        const { tags, activeFilters, tagSearchQuery } = data;

        // If the filter menu content hasn't been created yet, build it.
        if (!this._filterContentDiv) {
            this._buildFilterMenu(tags, activeFilters);
        }

        // Update the active state of existing buttons
        this._updateFilterMenu(activeFilters);

        // Redraw the static parts of the filter menu (background, header)
        const ctx = this.filterMenuCtx;
        this.filterMenuView.width = this.filterMenuView.clientWidth;
        this.filterMenuView.height = this.filterMenuView.clientHeight;
        ctx.clearRect(0, 0, this.filterMenuView.width, this.filterMenuView.height);

        const roughPaperPattern = ctx.createPattern(new RoughPaper().canvasBackgroundGenerator(320, 240), "repeat");
        if (roughPaperPattern) {
            ctx.save();
            ctx.fillStyle = roughPaperPattern;
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(0, 0, this.filterMenuView.width, this.filterMenuView.height, 8);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        const headerHeight = 32;
        const headerY = 0;
        const lightPaperPattern = ctx.createPattern(new LightPaper().canvasBackgroundGenerator(320, 240), "repeat");
        if (lightPaperPattern) {
            ctx.save();
            ctx.fillStyle = lightPaperPattern;
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(0, headerY, this.filterMenuView.width, headerHeight, [0, 0, 6, 6]);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        this.app._drawTextOnCanvas(
            ctx,
            this.app.t("sortAndFilter"),
            this.filterMenuView.width / 2,
            headerY + headerHeight / 2,
            'bold 16px "Rodin", sans-serif',
            "black",
            "center",
            "middle"
        );

        this.filterScrollbar.update();
    }

    _buildFilterMenu(tags, activeFilters) {
        const headerHeight = 32;
        // Create a div for scrollable content on top of the canvas
        this._filterContentDiv = this.createElement("div", "filter-menu-content-overlay");
        this._filterContentDiv.style.position = "absolute";
        this._filterContentDiv.style.top = `${headerHeight + 5}px`;
        this._filterContentDiv.style.left = "50%";
        this._filterContentDiv.style.transform = "translateX(-50%)";
        this._filterContentDiv.style.width = "280px";
        this._filterContentDiv.style.height = "163px";
        this._filterContentDiv.style.overflowY = "auto";
        this._filterContentDiv.style.padding = "0";
        this._filterContentDiv.style.boxSizing = "border-box";
        this._filterContentDiv.style.scrollbarWidth = "none";
        this._filterContentDiv.style.msOverflowStyle = "none";
        this._filterContentDiv.innerHTML = `<style>.filter-menu-content-overlay::-webkit-scrollbar { display: none; }</style>`;
        this.element.appendChild(this._filterContentDiv);

        this.filterScrollbar = new Scrollbar(this._filterContentDiv, this.app, {
            colors: {
                trackColor: 'rgba(0,0,0,0.1)',
                thumbColor: '#DDDDDD',
                thumbHoverColor: '#606060'
            }
        });
        this.filterScrollbar.element.style.position = "absolute";
        this.filterScrollbar.element.style.right = "0";
        this.filterScrollbar.element.style.top = `${headerHeight + 5}px`;
        this.filterScrollbar.element.style.bottom = `${40 + 5}px`;
        this.filterScrollbar.element.style.width = "14px";
        this.element.appendChild(this.filterScrollbar.element);

        // --- Footer Buttons ---
        const filterFooter = this.createElement("div", "list-footer");
        
        // Use larger font size for Chinese text (14px instead of 12px)
        const buttonFontSize = 14;
        
        this.resetFilterButton = new CanvasButton({
            text: this.app.t("footer.resetFilter"),
            width: 160,
            height: 40,
            font: `${buttonFontSize}px "Rodin", sans-serif`,
            onClick: () => {
                this.app.sounds.filterApply.play();
                this.onFilterChange({ sort: "date-desc", readStatus: "all", tag: "All" }, false);
            },
            backgroundColor: "#E0DACE",
            pressedBackgroundColor: "#CAC4B9",
            borderRadius: [12, 0, 0, 0],
            appInstance: this.app, // Pass app instance for Chinese font support
        });
        this.applyFilterButton = new CanvasButton({
            text: this.app.t("footer.applyFilter"),
            width: 160,
            height: 40,
            font: `${buttonFontSize}px "Rodin", sans-serif`,
            onClick: () => {
                this.app.sounds.filterApply.play();
                this.onFilterChange({}, true);
            },
            backgroundColor: this.app.cssVars["--ds-accent-blue"],
            pressedBackgroundColor: "#0C63E4",
            borderRadius: [0, 12, 0, 0],
            appInstance: this.app, // Pass app instance for Chinese font support
        });
        filterFooter.appendChild(this.resetFilterButton.element);
        filterFooter.appendChild(this.applyFilterButton.element);
        this.element.appendChild(filterFooter);

        // --- Content ---
        const menuContent = this._filterContentDiv;
        this.sortButtons = {};
        this.readStatusButtons = {};
        this.tagButtons = {};

        // Use larger font size for Chinese text (14px instead of 12px)
        const optionFontSize = 14;

        // Sort By
        menuContent.appendChild(this._createHeadingCanvas(this.app.t("sortBy")));

        const sortOptions = [
            { key: "date-desc", label: this.app.t("newestFirst") },
            { key: "date-asc", label: this.app.t("oldestFirst") },
            { key: "author-asc", label: this.app.t("authorAZ") },
        ];
        const sortGroup = this.createElement("div", "filter-group");
        sortOptions.forEach(opt => {
            const btn = new CanvasButton({
                text: opt.label,
                width: 76,
                height: 32,
                font: `${optionFontSize}px "Rodin", sans-serif`,
                textColor: "black",
                onClick: () => this.onFilterChange({ sort: opt.key }, false),
                backgroundColor: "#FDF5E6",
                selectedBackgroundColor: this.app.cssVars["--ds-accent-blue"],
                pressedBackgroundColor: this.app.cssVars["--ds-accent-blue"],
                borderRadius: 6,
                borderColor: 'rgba(0,0,0,0.2)',
                borderWidth: 1,
                appInstance: this.app, // Pass app instance for Chinese font support
            });
            this.sortButtons[opt.key] = btn;
            sortGroup.appendChild(btn.element);
        });
        menuContent.appendChild(sortGroup);

        // Read Status
        menuContent.appendChild(this._createHeadingCanvas(this.app.t("readStatus")));

        const readStatusOptions = [
            { key: "all", label: this.app.t("all") },
            { key: "read", label: this.app.t("read") },
            { key: "unopened", label: this.app.t("unopened") },
        ];
        const readStatusGroup = this.createElement("div", "filter-group");
        readStatusOptions.forEach(opt => {
            const btn = new CanvasButton({
                text: opt.label,
                width: 76,
                height: 32,
                font: `${optionFontSize}px "Rodin", sans-serif`,
                textColor: "black",
                onClick: () => this.onFilterChange({ readStatus: opt.key }, false),
                backgroundColor: "#FDF5E6",
                selectedBackgroundColor: this.app.cssVars["--ds-accent-blue"],
                pressedBackgroundColor: this.app.cssVars["--ds-accent-blue"],
                borderRadius: 6,
                borderColor: 'rgba(0,0,0,0.2)',
                borderWidth: 1,
                appInstance: this.app, // Pass app instance for Chinese font support
            });
            this.readStatusButtons[opt.key] = btn;
            readStatusGroup.appendChild(btn.element);
        });
        menuContent.appendChild(readStatusGroup);

        // Filter by Tag
        menuContent.appendChild(this._createHeadingCanvas(this.app.t("filterByTag")));

        const tagGroup = this.createElement("div", "filter-group-tags");
        tags.forEach(tag => {
            const btn = new CanvasButton({
                text: tag,
                width: Math.max(76, new TextCanvasMeasurer().measureText(tag, `${optionFontSize}px "Rodin", sans-serif`).width + 12),
                height: 32,
                font: `${optionFontSize}px "Rodin", sans-serif`,
                textColor: "black",
                onClick: () => {
                    const newTag = activeFilters.tag === tag ? "All" : tag;
                    this.onFilterChange({ tag: newTag }, false);
                },
                backgroundColor: "#FDF5E6",
                selectedBackgroundColor: this.app.cssVars["--ds-accent-blue"],
                pressedBackgroundColor: this.app.cssVars["--ds-accent-blue"],
                borderRadius: 6,
                borderColor: 'rgba(0,0,0,0.2)',
                borderWidth: 1,
                appInstance: this.app, // Pass app instance for Chinese font support
            });
            this.tagButtons[tag] = btn;
            tagGroup.appendChild(btn.element);
        });
        menuContent.appendChild(tagGroup);
    }

    _updateFilterMenu(activeFilters) {
        if (!this._filterContentDiv) return;

        for (const key in this.sortButtons) {
            this.sortButtons[key].isActive = (key === activeFilters.sort);
        }
        for (const key in this.readStatusButtons) {
            this.readStatusButtons[key].isActive = (key === activeFilters.readStatus);
        }
        for (const key in this.tagButtons) {
            this.tagButtons[key].isActive = (key === activeFilters.tag);
        }
    }

    _createHeadingCanvas(text) {
        const canvas = this.createElement("canvas", "filter-subheading-canvas");
        canvas.width = 280;
        canvas.height = 24;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        this.app._drawTextOnCanvas(
            ctx,
            text,
            canvas.width / 2,
            canvas.height / 2,
            'bold 14px "Rodin", sans-serif',
            "black",
            "center",
            "middle"
        );
        return canvas;
    }

    update(time) {
        // The filter view is mostly static, but this is here for consistency
        // and in case of future animations.
    }
}
