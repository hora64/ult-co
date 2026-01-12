export class AppGridEvents {
    constructor(appGrid) {
        this.appGrid = appGrid;
        this.container = appGrid.container;

        this.handleResize = this.handleResize.bind(this);
        this.updateScrollPositionFromEvent = this.updateScrollPositionFromEvent.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDragOver = this._handleDragOver.bind(this);
        this._handleDragEnter = this._handleDragEnter.bind(this);
        this._handleDragLeave = this._handleDragLeave.bind(this);
        this._handleDrop = this._handleDrop.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
        this._handleDrag = this._handleDrag.bind(this);

        this.resizeObserver = new ResizeObserver(this.handleResize);

        // Drag state
        this.draggedElement = null;
        this.draggedGhost = null;
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    setupEventListeners() {
        this.resizeObserver.observe(this.container);
        if (this.container.parentElement) {
            this.resizeObserver.observe(this.container.parentElement);
        }
        this.container.addEventListener('scroll', this.updateScrollPositionFromEvent, { passive: true });
        this.container.addEventListener('keydown', this._handleKeyDown);
        this.container.addEventListener('dragstart', this._handleDragStart);
        this.container.addEventListener('drag', this._handleDrag);
        this.container.addEventListener('dragover', this._handleDragOver);
        this.container.addEventListener('dragenter', this._handleDragEnter);
        this.container.addEventListener('dragleave', this._handleDragLeave);
        this.container.addEventListener('drop', this._handleDrop);
        this.container.addEventListener('dragend', this._handleDragEnd);
    }

    cleanupEventListeners() {
        this.resizeObserver?.disconnect();
        this.container?.removeEventListener('scroll', this.updateScrollPositionFromEvent);
        this.container?.removeEventListener('keydown', this._handleKeyDown);
        this.container?.removeEventListener('dragstart', this._handleDragStart);
        this.container?.removeEventListener('drag', this._handleDrag);
        this.container?.removeEventListener('dragover', this._handleDragOver);
        this.container?.removeEventListener('dragenter', this._handleDragEnter);
        this.container?.removeEventListener('dragleave', this._handleDragLeave);
        this.container?.removeEventListener('drop', this._handleDrop);
        this.container?.removeEventListener('dragend', this._handleDragEnd);

        // Clean up ghost if it exists
        if (this.draggedGhost && this.draggedGhost.parentNode) {
            this.draggedGhost.parentNode.removeChild(this.draggedGhost);
            this.draggedGhost = null;
        }
    }

    handleResize() {
        this.appGrid.updateContainerRect();
        this.appGrid.updateResponsiveLayout();
    }

    updateScrollPositionFromEvent() {
        this.appGrid.updateScrollPositionFromEvent();
    }

    _handleKeyDown(event) {
        this.appGrid._handleKeyDown(event);
    }

    _handleDragStart(e) {
        const target = e.target.closest('.app-icon-container');
        if (target) {
            this.draggedElement = target;
            this.isDragging = true;
            this.appGrid.playSound('grab');

            // Add class to grid to show empty tiles
            this.container.classList.add('dragging-active');

            const appIcon = target.querySelector('.app-icon');
            const rect = appIcon.getBoundingClientRect();

            // Store the offset from cursor to element's top-left corner
            // This ensures the element stays in the same position relative to cursor
            this.dragOffsetX = rect.left;
            this.dragOffsetY = rect.top;

            // Calculate where the cursor is relative to the element center
            const cursorRelativeX = e.clientX - (rect.left + rect.width / 2);
            const cursorRelativeY = e.clientY - (rect.top + rect.height / 2);

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', appIcon.dataset.appId);

            // Create an invisible 1x1 drag image to hide default ghost
            const emptyImg = document.createElement('canvas');
            emptyImg.width = 1;
            emptyImg.height = 1;
            e.dataTransfer.setDragImage(emptyImg, 0, 0);

            // Create custom ghost that follows cursor - no scale, just glow
            this.draggedGhost = appIcon.cloneNode(true);
            this.draggedGhost.classList.add('drag-ghost');
            this.draggedGhost.style.position = 'fixed';
            // Center the ghost on the cursor initially
            this.draggedGhost.style.left = `${e.clientX - rect.width / 2}px`;
            this.draggedGhost.style.top = `${e.clientY - rect.height / 2}px`;
            this.draggedGhost.style.width = `${rect.width}px`;
            this.draggedGhost.style.height = `${rect.height}px`;
            this.draggedGhost.style.pointerEvents = 'none';
            this.draggedGhost.style.zIndex = '10000';
            this.draggedGhost.style.opacity = '0.9';
            this.draggedGhost.style.transform = 'translateZ(0)';
            this.draggedGhost.style.transition = 'none';

            // Store the dimensions for later use
            this.draggedGhost.halfWidth = rect.width / 2;
            this.draggedGhost.halfHeight = rect.height / 2;

            // Remove selection glow from ghost
            const ghostGlow = this.draggedGhost.querySelector('.selection-glow');
            if (ghostGlow) {
                ghostGlow.style.display = 'none';
            }
            
            // Show hover glow on ghost for visual feedback
            const ghostHoverGlow = this.draggedGhost.querySelector('.hover-glow');
            if (ghostHoverGlow) {
                ghostHoverGlow.style.opacity = '1';
            }

            document.body.appendChild(this.draggedGhost);

            // Hide selection glow on the original element
            const originalGlow = target.querySelector('.selection-glow');
            if (originalGlow) {
                originalGlow.style.opacity = '0';
            }

            // Use requestAnimationFrame for smoother class addition
            requestAnimationFrame(() => {
                target.classList.add('dragging');
            });
        }
    }

    _handleDrag(e) {
        if (this.draggedGhost && (e.clientX !== 0 || e.clientY !== 0)) {
            // Update ghost position to follow cursor, keeping it centered
            requestAnimationFrame(() => {
                if (this.draggedGhost) {
                    this.draggedGhost.style.left = `${e.clientX - this.draggedGhost.halfWidth}px`;
                    this.draggedGhost.style.top = `${e.clientY - this.draggedGhost.halfHeight}px`;
                }
            });
        }
    }

    _handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Check for both app containers and empty tiles
        const target = e.target.closest('.app-icon-container, .empty-tile-container');
        if (target && !target.classList.contains('dragging')) {
            // Remove drag-over from all other elements
            this.container.querySelectorAll('.drag-over').forEach(el => {
                if (el !== target) el.classList.remove('drag-over');
            });
            target.classList.add('drag-over');
        }
    }

    _handleDragEnter(e) {
        const target = e.target.closest('.app-icon-container, .empty-tile-container');
        if (target && !target.classList.contains('dragging')) {
            target.classList.add('drag-over');
        }
    }

    _handleDragLeave(e) {
        const target = e.target.closest('.app-icon-container, .empty-tile-container');
        if (target && !target.classList.contains('dragging')) {
            // Only remove if we're actually leaving the element
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !target.contains(relatedTarget)) {
                target.classList.remove('drag-over');
            }
        }
    }

    _handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const dropTarget = e.target.closest('.app-icon-container, .empty-tile-container');
        const draggedEl = this.container.querySelector(`.app-icon[data-app-id="${draggedId}"]`)?.closest('.app-icon-container');

        if (!draggedEl) return;

        // Get all containers (both apps and empty tiles)
        const allContainers = Array.from(this.container.querySelectorAll('.app-icon-container, .empty-tile-container'));
        const draggedIndex = allContainers.indexOf(draggedEl);
        let dropIndex = dropTarget ? allContainers.indexOf(dropTarget) : allContainers.length - 1;

        // Don't do anything if dropping on itself or invalid position
        if (!dropTarget || draggedIndex === dropIndex) {
            if (dropTarget) dropTarget.classList.remove('drag-over');
            draggedEl.classList.remove('dragging');

            // Restore selection glow if this is the selected app
            if (draggedId === this.appGrid.selectedAppId) {
                const glow = draggedEl.querySelector('.selection-glow');
                if (glow) {
                    glow.style.opacity = '1';
                }
            }

            this.container.classList.remove('dragging-active');
            this._cleanupDragGhost();
            this.isDragging = false;
            this.draggedElement = null;
            return;
        }

        const oldPositions = new Map();

        // Capture old positions for FLIP animation - only for app icons, not empty tiles
        const allAppIcons = Array.from(this.container.querySelectorAll('.app-icon-container'));
        allAppIcons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            oldPositions.set(icon, {
                left: rect.left,
                top: rect.top
            });
        });

        // Remove drag-over class
        dropTarget.classList.remove('drag-over');
        draggedEl.classList.remove('dragging');

        // Calculate 2D grid positions using proper column-major order
        const numRows = this.appGrid.gridRows || parseInt(this.container.style.getPropertyValue('--grid-rows')) || 1;
        const numColumns = this.appGrid.gridColumns || Math.ceil(60 / numRows);

        // Convert linear index to 2D grid position (column-major order)
        // In column-major: index = (col * rows) + row
        // Therefore: col = floor(index / rows), row = index % rows
        const draggedRow = draggedIndex % numRows;
        const draggedCol = Math.floor(draggedIndex / numRows);
        const dropRow = dropIndex % numRows;
        const dropCol = Math.floor(dropIndex / numRows);

        // Handle drop on empty tile or app
        const isEmptyTile = dropTarget.classList.contains('empty-tile-container');

        if (isEmptyTile) {
            // Move app to empty tile position
            this.appGrid.moveAppTo2D(draggedId, dropRow, dropCol);

            // Create a new empty tile to replace the dragged app's position
            const newEmptyTile = this.appGrid.rendering.createEmptyTile();
            
            // FIX: Use replaceChild instead of insertBefore + remove to prevent duplication
            const parent = draggedEl.parentNode;
            parent.replaceChild(newEmptyTile, draggedEl);
            
            // Move the dragged app to replace the drop target
            dropTarget.parentNode.replaceChild(draggedEl, dropTarget);
        } else {
            // SWAP with another app using 2D grid
            const dropId = dropTarget.querySelector('.app-icon').dataset.appId;

            // Swap in 2D grid
            this.appGrid.swapApps2D(draggedId, dropId);

            // Swap DOM positions of the two apps
            const draggedNext = draggedEl.nextSibling;
            const dropNext = dropTarget.nextSibling;

            if (draggedNext === dropTarget) {
                // Adjacent: dragged is before drop
                dropTarget.parentNode.insertBefore(dropTarget, draggedEl);
            } else if (dropNext === draggedEl) {
                // Adjacent: drop is before dragged
                draggedEl.parentNode.insertBefore(draggedEl, dropTarget);
            } else {
                // Not adjacent
                const parent = dropTarget.parentNode;
                parent.insertBefore(draggedEl, dropNext);
                parent.insertBefore(dropTarget, draggedNext);
            }
        }

        // Restore selection glow if this is the selected app
        if (draggedId === this.appGrid.selectedAppId) {
            const glow = draggedEl.querySelector('.selection-glow');
            if (glow) {
                glow.style.opacity = '1';
            }
        }

        if (typeof anime === 'function') {
            // Get app icons after reorder for animation
            const newAppIcons = Array.from(this.container.querySelectorAll('.app-icon-container'));
            const elementsToAnimate = [];

            newAppIcons.forEach(icon => {
                const oldPos = oldPositions.get(icon);
                if (oldPos) {
                    const newPos = icon.getBoundingClientRect();
                    const deltaX = oldPos.left - newPos.left;
                    const deltaY = oldPos.top - newPos.top;

                    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
                        elementsToAnimate.push(icon);
                        icon.classList.add('animating');
                        icon.style.transform = `translate(${deltaX}px, ${deltaY}px) translateZ(0)`;
                        icon.style.zIndex = '1000';
                    }
                }
            });

            // Force reflow
            void this.container.offsetHeight;

            // FLIP: Play - animate to final position with smooth easing
            anime({
                targets: elementsToAnimate,
                translateX: 0,
                translateY: 0,
                duration: 350,
                easing: 'easeOutCubic',
                complete: () => {
                    elementsToAnimate.forEach(el => {
                        el.style.transform = '';
                        el.style.zIndex = '';
                        el.classList.remove('animating');
                    });

                    // Update scrollbar after animation
                    if (this.appGrid.scrollbar) {
                        this.appGrid.scrollbar.update();
                    }
                }
            });
        } else {
            // Fallback without animation
            if (this.appGrid.scrollbar) {
                this.appGrid.scrollbar.update();
            }
        }

        this.container.classList.remove('dragging-active');
        this._cleanupDragGhost();
        this.isDragging = false;
        this.draggedElement = null;
    }

    _handleDragEnd(e) {
        const dragged = this.container.querySelector('.dragging');
        if (dragged) {
            dragged.classList.remove('dragging');

            // Restore selection glow if this is the selected app
            const appIcon = dragged.querySelector('.app-icon');
            if (appIcon && appIcon.dataset.appId === this.appGrid.selectedAppId) {
                const glow = dragged.querySelector('.selection-glow');
                if (glow) {
                    glow.style.opacity = '1';
                }
            }
        }

        // Clean up all drag-over states
        this.container.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Remove dragging-active class
        this.container.classList.remove('dragging-active');

        this._cleanupDragGhost();
        this.isDragging = false;
        this.draggedElement = null;
    }

    _cleanupDragGhost() {
        if (this.draggedGhost && this.draggedGhost.parentNode) {
            // Fade out the ghost without scaling
            if (typeof anime === 'function') {
                anime({
                    targets: this.draggedGhost,
                    opacity: 0,
                    duration: 200,
                    easing: 'easeOutQuad',
                    complete: () => {
                        if (this.draggedGhost && this.draggedGhost.parentNode) {
                            this.draggedGhost.parentNode.removeChild(this.draggedGhost);
                            this.draggedGhost = null;
                        }
                    }
                });
            } else {
                this.draggedGhost.parentNode.removeChild(this.draggedGhost);
                this.draggedGhost = null;
            }
        }
    }
}
