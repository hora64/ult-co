export class CanvasInteractionHandler {
    constructor(canvas, app) {
        if (!canvas || !app) {
            throw new Error("CanvasInteractionHandler requires a canvas element and an app instance.");
        }
        this.canvas = canvas;
        this.app = app; // For accessing interactive elements array (e.g., hyperlinks)

        this._mouseMoveListener = this.handleMouseMove.bind(this);
        this._clickListener = this.handleClick.bind(this);
        this._mouseLeaveListener = this.handleMouseLeave.bind(this);

        this.attachEventListeners();
    }

    attachEventListeners() {
        this.canvas.addEventListener('mousemove', this._mouseMoveListener);
        this.canvas.addEventListener('click', this._clickListener);
        this.canvas.addEventListener('mouseleave', this._mouseLeaveListener);
    }

    detachEventListeners() {
        this.canvas.removeEventListener('mousemove', this._mouseMoveListener);
        this.canvas.removeEventListener('click', this._clickListener);
        this.canvas.removeEventListener('mouseleave', this._mouseLeaveListener);
    }

    _getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        return { x: canvasX, y: canvasY };
    }

    handleMouseMove(e) {
        const { x, y } = this._getCanvasCoordinates(e);
        const hoveredLink = this.app.hyperlinks.find(link =>
            x >= link.x && x <= link.x + link.width &&
            y >= link.y && y <= link.y + link.height
        );

        this.canvas.style.cursor = hoveredLink ? 'pointer' : 'auto';
    }

    handleClick(e) {
        const { x, y } = this._getCanvasCoordinates(e);
        const clickedLink = this.app.hyperlinks.find(link =>
            x >= link.x && x <= link.x + link.width &&
            y >= link.y && y <= link.y + link.height
        );

        if (clickedLink) {
            let url = clickedLink.url;
            if (url.startsWith("youtube:")) {
                url = `https://www.youtube.com/watch?v=${url.substring(8)}`;
            }
            window.open(url, "_blank", "noopener,noreferrer");
        }
    }

    handleMouseLeave() {
        this.canvas.style.cursor = 'auto';
    }
}
