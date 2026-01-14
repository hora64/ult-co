export class StyleManager {
    injectStyles() {
        const styleId = '3ds-ui-styles';
        if (document.getElementById(styleId)) return;

        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.innerHTML = `
            :root {
                /* Core Design System Variables */
                --ds-bg: #222222;
                --ds-bg-modal: #2C2C2C;
                --ds-bg-grad: linear-gradient(180deg, #2C2C2C 0%, #1C1C1C 100%);
                --ds-text: #EAEAEA;
                --ds-text-subtle: #999999;
                --ds-accent-primary: #0d6efd;
                --ds-accent-primary-dark: #0b5ed7;
                --ds-accent-danger: #dc3545;
                --ds-accent-red: #D9534F;
                --ds-accent-blue: #5BC0DE;
                --ds-button-bg: rgba(255, 255, 255, 0.1);
                --ds-button-hover-bg: rgba(255, 255, 255, 0.2);
                --ds-button-disabled-bg: rgba(255, 255, 255, 0.1);
                
                /* Background Colors */
                --hs-top-canvas-bg: #1a1a1a;
                --hs-bottom-canvas-bg: #1a1a1a;
                --hs-bg: #1a1a1a;
                
                /* Body Background Canvas */
                --hs-body-canvas-bg: #222222;
                
                /* Text Colors */
                --hs-text: #ffffff;
                
                /* Button Colors */
                --hs-button-bg: rgba(255, 255, 255, 0.1);
                --hs-button-hover-bg: rgba(255, 255, 255, 0.2);
                --hs-button-pressed-bg: rgba(255, 255, 255, 0.3);
                --hs-button-disabled-bg: rgba(128, 128, 128, 0.3);
                
                /* Action Button Color Overrides (per-app) */
                --hs-action-button-bg: var(--hs-button-bg);
                --hs-action-button-hover-bg: var(--hs-button-hover-bg);
                --hs-action-button-pressed-bg: var(--hs-button-pressed-bg);
                --hs-action-button-disabled-bg: var(--hs-button-disabled-bg);
                --hs-action-button-text-color: white;
                
                /* Resize Button Colors */
                --hs-resize-button-bg: rgba(255, 255, 255, 0.1);
                --hs-resize-button-hover-bg: rgba(255, 255, 255, 0.2);
                --hs-resize-button-pressed-bg: rgba(255, 255, 255, 0.3);
                --hs-resize-button-disabled-bg: rgba(100, 100, 100, 0.1);
                --hs-resize-button-border: rgba(255, 255, 255, 0.3);
                
                /* Scrollbar Colors */
                --hs-scrollbar-track: rgba(0, 0, 0, 0.1);
                --hs-scrollbar-thumb: rgba(100, 150, 255, 0.6);
                --hs-scrollbar-thumb-hover: rgba(100, 150, 255, 0.8);
                --hs-scrollbar-thumb-border: rgba(100, 150, 255, 0.8);
                --hs-scrollbar-base-color: rgba(255, 100, 100, 0.5);
                
                /* Sprite/Asset Paths */
                --hs-selection-glow-sprite: url('/content/common/themes/blackTheme/Select_128px.png');
                --hs-app-bg-sprite: url('/content/common/themes/blackTheme/AppBackground.png');
                --hs-app-base-sprite: url('/content/common/assets/BlankApp_64px.png');
                --hs-resize-increase-sprite: url('/content/common/assets/resizeUpFlat_32px.png');
                --hs-resize-decrease-sprite: url('/content/common/assets/resizeDownFlat_32px.png');
                --hs-mail-icon-sprite: url('/content/common/themes/blackTheme/Mail_64px.png');
                --hs-settings-icon-sprite: url('/content/common/themes/blackTheme/Settings_64px.png');
                --hs-gift-box-sprite: url('/content/common/assets/giftbox_48px.png');
                --hs-blank-app-sprite: url('/content/common/assets/BlankApp_64px.png');
                
                /* Unopened App Defaults */
                --hs-unopened-jingle: '/content/apps/homeScreen_3DS/assets/banners/unopened/SE_CTR_HOME_BANNER_PRESENT.wav';
                --hs-unopened-banner-module: '/content/apps/homeScreen_3DS/assets/banners/unopened/unopened.js';
                --hs-unopened-icon: '/content/common/assets/giftbox_48px.png';
                
                /* Sound Effect Paths */
                --hs-sound-click: '/content/common/sfx/select6.ogg';
                --hs-sound-select: '/content/common/sfx/select5.ogg';
                --hs-sound-launch: '/content/common/sfx/select3.ogg';
                --hs-sound-size-up: '/content/common/sfx/select2.ogg';
                --hs-sound-size-down: '/content/common/sfx/select.ogg';
                --hs-sound-grab: '/content/common/sfx/select.ogg';
                --hs-sound-open-box: '/content/common/sfx/open.ogg';
                
                /* Background Music Path */
                --hs-background-music: ''; /* Set to empty string to disable, or path to .ogg/.mp3 file */
                --hs-background-music-volume: 0.3;
                --hs-background-music-loop: true;
                
                /* Empty Tile Colors */
                --empty-tile-color: rgba(255, 255, 255, 0.08);
                --empty-tile-border: rgba(255, 255, 255, 0.15);
                --empty-tile-hover-color: rgba(255, 255, 255, 0.12);
                --empty-tile-selected-color: rgba(100, 150, 255, 0.15);
                
                /* Empty Tile Sprite */
                --empty-tile-sprite: url('/content/apps/homeScreen_3DS/assets/img/emptytile_128px.png');
                --empty-tile-use-sprite: true; /* Set to true to use sprite instead of drawn tile */
                
                /* Selector Configuration */
                --selector-z-position: behind; /* 'behind' or 'infront' */
                --selector-z-index-behind: 0;
                --selector-z-index-infront: 10;
                
                /* Action Bar Colors */
                --action-bar-bg: transparent;
                --action-bar-border: transparent;
                --action-bar-gradient-enabled: false;
                --action-bar-gradient-start: rgba(0, 0, 0, 0.2);
                --action-bar-gradient-end: rgba(0, 0, 0, 0.1);
                
                /* Unread Indicator */
                --hs-unread-bg: #cc3333;
                --hs-unread-text: #ffffff;
            }

            body {
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                color: #000;
                position: relative;
                overflow: hidden;
            }

            /* Background canvas for body - now in top screen */
            #body-background-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 400px;
                height: 240px;
                z-index: -1;
                image-rendering: crisp-edges;
                pointer-events: none;
            }

            .ds-container {
                width: 400px;
                height: 480px;
                background: rgba(0,0,0,0);
                user-select: none;
                -webkit-user-select: none;
                overflow: hidden;
                image-rendering: crisp-edges;
                box-sizing: border-box;
            }
            
            /* Empty tile specific styles */
            .empty-tile-container {
                position: relative;
                transition: transform 0.2s ease, opacity 0.2s ease;
                z-index: 1; /* Below selector */
            }
            
            .empty-tile-selectable {
                cursor: pointer;
            }
            
            .empty-tile {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.15s ease;
            }
            
            .empty-tile-canvas {
                transition: filter 0.2s ease;
                image-rendering: crisp-edges;
            }
            
            .empty-tile-container:hover .empty-tile-canvas {
                filter: brightness(1.3);
            }
            
            .empty-tile-container:active .empty-tile {
                transform: scale(0.95);
            }
            
            .empty-tile.selected {
                animation: pulse-glow 2s ease-in-out infinite;
            }
            
            @keyframes pulse-glow {
                0%, 100% {
                    filter: brightness(1);
                }
                50% {
                    filter: brightness(1.2);
                }
            }
            
            .empty-tile .selection-glow {
                transition: opacity 0.3s ease;
                z-index: 2; /* Above empty tile but below app icons */
            }
            
            /* App icon containers */
            .app-icon-container {
                position: relative;
                z-index: 2; /* Above empty tiles */
            }
            
            /* Selection glow for apps */
            .app-icon .selection-glow {
                transition: opacity 0.3s ease;
            }

            .top-screen {
                width: 400px;
                height: 240px;
                position: relative;
                overflow: hidden;
            }

            .top-screen canvas {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: contain;
                image-rendering: crisp-edges;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            #top-canvas {
                width: 400px !important;
                height: 240px !important;
                z-index: 0;
            }
            
            /* Status bar at top */
            .status-bar-canvas {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 10;
                width: 400px;
                height: 30px;
            }
            
            /* Top bar apps container */
            .top-bar-apps {
                position: absolute;
                top: 35px;
                right: 10px;
                z-index: 10;
                display: flex;
                gap: 8px;
                flex-direction: row;
            }
            
            /* Banner canvases should be above the background canvas */
            .top-screen > canvas:not(#top-canvas):not(.status-bar-canvas) {
                z-index: 1;
            }

            .bottom-screen {
                width: 100%;
                max-width: 320px;
                aspect-ratio: 320 / 240;
                max-height: 240px;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                margin: 0 auto;
                overflow: hidden;
                position: relative;
                z-index: 11;
            }

            .bottom-screen > canvas,
            #bottom-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 320px !important;
                height: 240px !important;
                z-index: 0;
            }

            #bottomScreenGrid {
                flex-grow: 1;
                width: 100%;
                box-sizing: border-box;
                overflow: hidden;
                position: relative;
                height: 160px;
                padding: 28px 10px 28px 10px;
            }
            
            /* Slim scroll indicator positioned above the grid */
            .slim-scroll-indicator {
                position: absolute;
                width: 320px;
                z-index: 20;
                pointer-events: none;
            }
            
            .slim-scroll-track {
                width: 100%;
                height: 100%;
                position: relative;
            }
            
            .slim-scroll-thumb {
                height: 100%;
                position: absolute;
                border-radius: 1px;
            }

            #bottom-screen-wrapper {
                width: 320px;
                height: 240px;
                display: flex;
                flex-direction: column;
                position: relative;
                z-index: 10;
            }
            
            /* Unified controls bar containing both top bar apps and size controls */
            .bottom-screen-controls-bar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 28px;
                width: 320px;
                z-index: 15;
                display: flex;
                justify-content: space-between;
                align-items: center;
                pointer-events: none;
            }
            
            /* Left section for home menu button */
            .controls-bar-left {
                display: flex;
                align-items: center;
                pointer-events: none;
            }
            
            .controls-bar-left > * {
                pointer-events: auto;
            }
            
            /* Center section for top bar app icons */
            .controls-bar-center {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 4px;
                display: flex;
                gap: 8px;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }
            
            .controls-bar-center > * {
                pointer-events: auto;
            }
            
            /* Right section for size controls */
            .controls-bar-right {
                display: flex;
                align-items: center;
                pointer-events: none;
            }
            
            .controls-bar-right > * {
                pointer-events: auto;
            }
            
            /* Legacy support - bottom-screen-top-bar */
            .bottom-screen-top-bar {
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 15;
                display: flex;
                gap: 8px;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }
            
            /* Make individual top bar buttons clickable */
            .bottom-screen-top-bar > * {
                pointer-events: auto;
            }

            /* Legacy support - appgrid-size-controls */
            .appgrid-size-controls {
                position: absolute;
                top: 0px;
                right: 0px;
                z-index: 15;
                pointer-events: none;
            }
            
            /* Make individual size control buttons clickable */
            .appgrid-size-controls > * {
                pointer-events: auto;
            }
            
            /* Unread indicator badge */
            .unread-indicator,
            .unread-indicator-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: var(--hs-unread-bg);
                color: var(--hs-unread-text);
                font-size: 10px;
                font-weight: bold;
                min-width: 16px;
                height: 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
                z-index: 20;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                opacity: 0.9;
            }

            #manualContainer {
                position: absolute;
                top: 0;
                left: 0;
                width: 320px;
                height: 240px;
                overflow: hidden;
                z-index: 100;
                pointer-events: none;
            }

            .article-view-wrapper {
                width: 320px;
                height: 240px;
                display: flex;
                flex-direction: column;
            }

            .article-header-content {
                padding: 10px 0;
                flex-shrink: 0;
                width: 320px;
                height: 90px;
                box-sizing: border-box;
                position: relative;
            }

            .article-title-wrapper {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 0 10px;
            }

            .article-title-h1 {
                display: block;
                flex-grow: 1;
                line-height: 0;
                width: 256px;
                height: 48px;
                image-rendering: pixelated;
            }

            .article-meta-canvas {
                display: block;
                margin: 0 10px;
                width: 290px;
                height: 20px;
                image-rendering: pixelated;
            }

            .article-body-wrapper {
                flex-grow: 1;
                display: flex;
                position: relative;
                overflow: hidden;
                width: 280px;
                margin: 0 auto;
            }

            .scrollable-canvas-wrapper {
                flex-grow: 1;
                overflow-y: auto;
                scrollbar-width: none;
                height: 110px;
                position: relative;
            }

            .scrollable-canvas-wrapper::-webkit-scrollbar {
                display: none;
            }

            .article-content-canvas {
                display: block;
                height: auto;
                width: 280px;
                margin: 0 auto;
                image-rendering: pixelated;
                cursor: pointer;
            }

            .article-html-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10;
            }

            .article-footer {
                flex-shrink: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 40px;
            }
            
            /* Unwrap animation canvas */
            .unwrap-animation-canvas {
                pointer-events: none;
            }

            /* Button container for action buttons */
            #buttonContainer {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 320px;
                z-index: 16;
                pointer-events: none;
            }
            
            /* Make individual action buttons clickable */
            #buttonContainer > * {
                pointer-events: auto;
            }

            /* Modal container styling */
            .modal-container {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s, visibility 0.2s;
                z-index: 1000;
                backdrop-filter: blur(4px);
            }
            
            /* Modal container active state */
            .modal-container.active {
                opacity: 1;
                visibility: visible;
            }

            @media (max-width: 420px) {
                .ds-container {
                    border-width: 10px;
                }
            }
            
            button {
                all: unset;
            }
            
            /* Modal dialog container */
            .modal-dialog-container {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #FFFFFF !important;
            }
            
            /* Modal dialog canvas wrapper */
            .modal-dialog-wrapper {
                display: block;
                image-rendering: crisp-edges;
            }
            
            /* Modal buttons container */
            .modal-buttons {
                display: flex;
                gap: 10px;
                width: 100%;
                position: absolute;
                bottom: 0px;
                left: 50%;
                transform: translateX(-50%);
                justify-content: center;
                align-items: center;
                padding: 0 10px;
                box-sizing: border-box;
            }
            
            /* Dropdown modal specific styles */
            .dropdown-dialog {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                background: var(--ds-bg-modal);
                border-radius: 8px;
                padding: 10px;
                color: #FFFFFF !important;
            }
            
            .modal-header-canvas {
                display: block;
                margin-bottom: 10px;
            }
            
            .options-list-wrapper {
                position: relative;
                max-height: 200px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .options-list {
                max-height: 200px;
                overflow-y: auto;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 10px;
            }
            
            .modal-top-fade,
            .modal-bottom-fade {
                position: absolute;
                left: 0;
                right: 0;
                height: 20px;
                pointer-events: none;
                z-index: 1;
            }
            
            .modal-top-fade {
                top: 0;
                background: linear-gradient(to bottom, var(--ds-bg-modal), transparent);
            }
            
            .modal-bottom-fade {
                bottom: 0;
                background: linear-gradient(to top, var(--ds-bg-modal), transparent);
            }
            
            .dropdown-buttons {
                position: relative;
                bottom: auto;
                left: auto;
                transform: none;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}
