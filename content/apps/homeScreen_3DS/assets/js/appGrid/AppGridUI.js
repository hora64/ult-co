export class AppGridUI {
    constructor(container, assetUrls, sizeClasses) {
        this.container = container;
        this.bottomScreenContainer = container.parentElement;
        this.assetUrls = assetUrls;
        this.sizeClasses = sizeClasses;
        this.controlsContainer = null;

        this.injectStyles();
    }

    injectStyles() {
        const styleId = 'app-grid-styles';
        document.getElementById(styleId)?.remove();
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = this.getStyleContent().replace(/\s\s+/g, ' ').trim();
        document.head.appendChild(style);
    }

    getStyleContent() {
        return `
        :root {
            --button-bg: rgba(0, 0, 0, 0.5);
            --button-hover-bg: rgba(255, 255, 255, 0.2);
            --button-pressed-bg: rgba(255, 255, 255, 0.3);
            --button-disabled-bg: rgba(64, 64, 64, 0.3);
            --empty-tile-color: rgba(255, 255, 255, 0.08);
            --empty-tile-border: rgba(255, 255, 255, 0.15);
            --empty-tile-hover: rgba(255, 255, 255, 0.12);
            --size-btn-border-left: rgba(255, 255, 255, 0.3);
            --size-btn-border-right: rgba(0, 0, 0, 0.3);
            --size-btn-border-width: 2px;
        }
        
        body, .app-grid, .app-icon, canvas {
            image-rendering: pixelated !important;
            -webkit-font-smoothing: none !important;
            font-smooth: never !important;
        }
        .app-grid.grid-initializing .app-icon,
        .app-grid.grid-initializing .app-icon-container,
        .app-grid.grid-initializing .selection-glow {
            transition: none !important;
        }
        .app-grid {
            display: grid;
            gap: var(--grid-spacing, 12px);
            width: 100%;
            height: 100%;
            padding: var(--grid-padding-vertical, 0px) var(--edge-margin, 12px);
            margin: 0px;
            box-sizing: border-box;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            transition: all 0.3s ease-in-out;
            justify-items: start;
            align-items: center;
            align-content: center;
            justify-content: start;
            grid-auto-flow: column;
            grid-auto-columns: var(--container-size, 64px);
            grid-template-rows: repeat(var(--grid-rows, 2), var(--container-size, 64px));
            min-width: 0;
            min-height: 0;
            scroll-behavior: auto;
            outline: none;
            contain: layout style paint;
            will-change: scroll-position;
        }
        .app-grid > .app-icon:nth-child(2n + 1) {
            margin-left: var(--grid-spacing, 10px);
        }
        .app-grid::-webkit-scrollbar { display: none; }
        .app-grid::after {
            content: '';
            width: 1px;
            height: 1px;
            flex-shrink: 0;
        }
        .app-icon-container {
            position: relative;
            width: var(--container-size, 64px);
            height: var(--container-size, 64px);
            min-width: var(--container-size, 64px);
            min-height: var(--container-size, 64px);
            display: flex; 
            justify-content: center; 
            align-items: center;
            overflow: visible;
            box-sizing: border-box;
            contain: layout;
            will-change: transform;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            transform: translateZ(0);
        }
        /* Empty tile containers */
        .empty-tile-container {
            position: relative;
            width: var(--container-size, 64px);
            height: var(--container-size, 64px);
            min-width: var(--container-size, 64px);
            min-height: var(--container-size, 64px);
            display: flex; 
            justify-content: center; 
            align-items: center;
            overflow: visible;
            box-sizing: border-box;
            contain: layout;
            will-change: transform;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            transform: translateZ(0);
            opacity: 0.5;
            transition: opacity 0.2s ease-out;
            cursor: pointer;
        }
        .empty-tile {
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center;
            position: relative;
            box-sizing: border-box;
            user-select: none;
            transform: translateZ(0);
            transition: none;
        }
        .empty-tile-canvas {
            display: block;
            image-rendering: pixelated;
            transition: filter 0.2s ease-out;
        }
        /* Empty tile hover effect - using canvas glow only, no scale */
        .empty-tile-container:hover {
            opacity: 1;
        }
        .empty-tile-container:hover .hover-glow {
            opacity: 1;
        }
        .empty-tile-container:hover .empty-tile-canvas {
            filter: brightness(1.1);
        }
        /* Empty tile selection */
        .empty-tile-container.selected {
            opacity: 1;
        }
        .empty-tile-container.selected .empty-tile-canvas {
            filter: brightness(1.2);
        }
        /* Empty tile selection glow */
        .empty-tile-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) translateZ(0);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease-out;
            will-change: opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            z-index: -1;
        }
        .empty-tile-container.selected .empty-tile-glow {
            opacity: 1;
        }
        /* Highlight empty tiles when dragging */
        .app-grid.dragging-active .empty-tile-container {
            opacity: 0.8;
        }
        .empty-tile-container.drag-over {
            opacity: 1;
        }
        .empty-tile-container.drag-over .empty-tile-canvas {
            filter: brightness(1.5);
        }
        .app-icon {
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center;
            position: relative;
            width: var(--icon-size, 64px);
            height: var(--icon-size, 64px);
            box-sizing: border-box;
            transform: translateZ(0);
            user-select: none;
            border-radius: var(--icon-border-radius, 15%);
            will-change: transform;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            overflow: visible;
        }
        .app-grid:not(.is-resizing) .app-icon {
            transition: none;
        }
        .app-icon.selected {
            transform: translateZ(0);
        }
        /* Hover glow effect - canvas based, no scaling */
        .hover-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) translateZ(0);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease-out;
            will-change: opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            z-index: 0;
        }
        .app-icon-container:hover .hover-glow {
            opacity: 1;
        }
        .app-icon-container.dragging .hover-glow {
            opacity: 0 !important;
        }
        .selection-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) translateZ(0);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease-out;
            will-change: opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .app-icon.selected .selection-glow {
            opacity: 1;
        }
        .app-grid.is-resizing .app-icon-container,
        .app-grid.is-resizing .app-icon,
        .app-grid.is-resizing .selection-glow,
        .app-grid.is-resizing .empty-tile-container,
        .app-grid is-resizing .empty-tile {
            transition: none !important;
        }
        /* Dragging styles - make original element semi-transparent, no scale */
        .app-icon-container.dragging {
            opacity: 0.4;
            z-index: 1;
            transition: opacity 0.15s ease-out !important;
        }
        /* Hide selection glow when dragging */
        .app-icon-container.dragging .selection-glow {
            opacity: 0 !important;
            transition: opacity 0.1s ease-out !important;
        }
        /* Drag ghost that follows cursor - reduced scale for subtlety */
        .drag-ghost {
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            opacity: 0.9;
            transform: translateZ(0);
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
            will-change: transform, left, top;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        /* Drag over target indicator - no scale, just glow */
        .app-icon-container.drag-over {
            opacity: 0.6;
            transition: opacity 0.15s ease-out;
        }
        .app-icon-container.drag-over .hover-glow {
            opacity: 1;
        }
        /* Disable transitions during swap animation */
        .app-icon-container.animating {
            transition: none !important;
            pointer-events: none;
        }
        .app-icon-container.animating .app-icon {
            transition: none !important;
        }
        /* Controls for icon size */
        .appgrid-size-controls {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            width: 100%;
            height: 32px;
            box-sizing: border-box;
            position: relative;
            top: 0;
            left: 0;
            z-index: 12;
        }

        .appgrid-size-btn {
            width: 24px;
            height: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: transparent;
            border: none;
            border-left: var(--size-btn-border-width, 2px) solid var(--size-btn-border-left, rgba(255, 255, 255, 0.3));
            border-right: var(--size-btn-border-width, 2px) solid var(--size-btn-border-left, rgba(255, 255, 255, 0.3));
            padding: 0;
            transition: border-color 0.15s ease-out;
            position: relative;
        }
        .appgrid-size-btn::before {
            content: '';
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 1px;
            pointer-events: none;
            border-left: var(--size-btn-border-width, 2px) solid var(--size-btn-border-left, rgba(255, 255, 255, 0.3));
            border-right: var(--size-btn-border-width, 2px) solid var(--size-btn-border-left, rgba(255, 255, 255, 0.3));
            transition: border-color 0.15s ease-out;
        }
        .appgrid-size-btn:hover {
            border-left-color: var(--size-btn-border-left-hover, rgba(255, 255, 255, 0.5));
            border-right-color: var(--size-btn-border-left-hover, rgba(255, 255, 255, 0.5));
        }
        .appgrid-size-btn:hover::before {
            border-left-color: var(--size-btn-border-left-hover, rgba(255, 255, 255, 0.5));
            border-right-color: var(--size-btn-border-left-hover, rgba(255, 255, 255, 0.5));
        }
        .appgrid-size-btn:active {
            transform: scale(0.95);
            border-left-color: var(--size-btn-border-left-active, rgba(255, 255, 255, 0.7));
            border-right-color: var(--size-btn-border-left-active, rgba(255, 255, 255, 0.7));
        }
        .appgrid-size-btn:active::before {
            border-left-color: var(--size-btn-border-left-active, rgba(255, 255, 255, 0.7));
            border-right-color: var(--size-btn-border-left-active, rgba(255, 255, 255, 0.7));
        }
        
        .appgrid-size-btn:disabled,
        .appgrid-size-btn[disabled] {
            opacity: 0.4;
            cursor: not-allowed;
            border-left-color: var(--size-btn-border-left-disabled, rgba(100, 100, 100, 0.3));
            border-right-color: var(--size-btn-border-left-disabled, rgba(100, 100, 100, 0.3));
        }
        .appgrid-size-btn:disabled::before,
        .appgrid-size-btn[disabled]::before {
            border-left-color: var(--size-btn-border-left-disabled, rgba(100, 100, 100, 0.3));
            border-right-color: var(--size-btn-border-left-disabled, rgba(100, 100, 100, 0.3));
        }
        
        .appgrid-size-btn:disabled canvas,
        .appgrid-size-btn[disabled] canvas {
            filter: grayscale(1) brightness(0.7);
        }

        @media (max-width: 480px) {
            .app-grid {
                padding-top: calc(var(--edge-margin, 12px) * 0.5);
                padding-bottom: calc(var(--edge-margin, 12px) * 0.5 + 8px);
                gap: calc(var(--grid-spacing, 10px) * 0.8);
            }
        }
        `;
    }

    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    }

    updateResponsiveLayout(containerRect, sizeConfig, totalItems) {
        if (!this.container || !containerRect) return;

        const containerHeight = containerRect.height;

        const currentPaddingTop = parseFloat(getComputedStyle(this.container).paddingTop) || 0;
        const currentPaddingBottom = parseFloat(getComputedStyle(this.container).paddingBottom) || 0;
        const availableHeight = Math.max(0, containerHeight - currentPaddingTop - currentPaddingBottom);

        const itemContainerHeight = sizeConfig.containerSize;
        const itemSpacing = sizeConfig.spacing;

        // Use fixed rows from config
        let finalRows = sizeConfig.rows || 2;

        // Only limit to
        if (totalItems === 0) {
            finalRows = 1;
        } else if (totalItems > 0 && finalRows > totalItems) {
            finalRows = totalItems;
        }

        this.container.style.setProperty('--grid-rows', String(finalRows));
        this.container.style.setProperty('--icon-size', `${sizeConfig.iconSize}px`);
        this.container.style.setProperty('--container-size', `${sizeConfig.containerSize}px`);
        this.container.style.setProperty('--grid-spacing', `${sizeConfig.spacing}px`);
        this.container.style.setProperty('--edge-margin', `${sizeConfig.edgeMargin}px`);
        this.container.style.setProperty('--icon-border-radius', sizeConfig.radius);

        const totalContentHeight = (finalRows * itemContainerHeight) + Math.max(0, finalRows - 1) * itemSpacing;
        let paddingVertical = (availableHeight - totalContentHeight) / 2;
        paddingVertical = Math.max(sizeConfig.edgeMargin / 2, paddingVertical);

        this.container.style.setProperty('--grid-padding-vertical', `${paddingVertical}px`);
        this.container.style.setProperty('paddingLeft', `${sizeConfig.edgeMargin}px`);
        this.container.style.setProperty('paddingRight', `${sizeConfig.edgeMargin}px`);
    }

    async _renderImageOnCanvasSimple(targetCanvas, imageUrl, isTiled = false) {
        if (!targetCanvas || !imageUrl) return;
        const ctx = targetCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        try {
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.crossOrigin = "Anonymous";
                image.onload = () => resolve(image);
                image.onerror = (err) => reject(new Error(`Failed to load image: ${imageUrl}`));
                image.src = imageUrl;
            });

            const rect = targetCanvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                requestAnimationFrame(() => this._renderImageOnCanvasSimple(targetCanvas, imageUrl, isTiled));
                return;
            }

            const dpr = window.devicePixelRatio || 1;
            targetCanvas.width = rect.width * dpr;
            targetCanvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = false;

            ctx.clearRect(0, 0, rect.width, rect.height);

            if (isTiled) {
                const pattern = ctx.createPattern(img, 'repeat');
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, rect.width, rect.height);
            } else {
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
            }

        } catch (error) {
            console.error(`Failed to render image ${imageUrl}:`, error);
        }
    }

    destroy() {
        this.controlsContainer?.remove();
        if (this.container) {
            this.container.innerHTML = '';
            this.container.classList.remove('app-grid', ...this.sizeClasses);
            this.container.style.cssText = '';
        }
    }
}
