import { UIComponent } from '/content/common/utils/index.js';
import { MailScene } from './topScreen3D.js';

export class TopScreen extends UIComponent {
  constructor(appInstance) {
    super();
    this.app = appInstance;
    this.element = this.createElement("div", "top-screen");
    this.mailScene = new MailScene(this.app);
    this.element.appendChild(this.mailScene.renderer.domElement);
    this.articleImageElement = this.createElement("img", "article-image");
    this.element.appendChild(this.articleImageElement);
    this.homeCanvas = this.createElement("canvas", "home-canvas");
    this.homeCtx = this.homeCanvas.getContext("2d");
    this.homeCtx.imageSmoothingEnabled = false;
    this.element.appendChild(this.homeCanvas);
    this.clockInterval = null;
    this.lastUnopenedCount = 0;
    this.timeOffset = 0;
    
    // Load time offset from localStorage
    this._loadTimeOffset();
    
    window.addEventListener("resize", () => this.handleResize());
  }

  /**
   * Load time offset from localStorage customTime
   */
  _loadTimeOffset() {
    const storedTime = localStorage.getItem('customTime');
    if (storedTime) {
      try {
        const customTime = new Date(storedTime);
        const systemTime = new Date();
        this.timeOffset = customTime.getTime() - systemTime.getTime();
        console.log('[Mail TopScreen] Loaded time offset:', this.timeOffset, 'ms');
      } catch (error) {
        console.warn('[Mail TopScreen] Failed to parse customTime:', error);
      }
    }
  }

  /**
   * Register a new time offset (called when time changes in Settings)
   */
  registerTimeOffset(offset) {
    this.timeOffset = offset;
    console.log('[Mail TopScreen] Time offset registered:', offset, 'ms');
    // Redraw immediately with new time
    if (this.homeCanvas.style.opacity === "1") {
      this.drawHomeInfo(this.lastUnopenedCount, performance.now());
    }
  }

  isThreeJSInitialized() {
    return this.mailScene.isThreeJSInitialized();
  }

  showArticleImage(imageUrl) {
    this.articleImageElement.src = imageUrl;
    this.articleImageElement.style.opacity = "1";
    this.homeCanvas.style.opacity = "0";
    this.mailScene.setOpacity(0.3);
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  showHomeScreen(unopenedCount) {
    this.lastUnopenedCount = unopenedCount;
    this.articleImageElement.style.opacity = "0";
    this.homeCanvas.style.opacity = "1";
    this.mailScene.setOpacity(1);
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.drawHomeInfo(unopenedCount, performance.now());
    this.clockInterval = setInterval(() => this.drawHomeInfo(unopenedCount, performance.now()), 1000);
  }

  drawHomeInfo(unopenedCount, time) {
    const rect = this.homeCanvas.getBoundingClientRect();
    this.homeCanvas.width = rect.width;
    this.homeCanvas.height = rect.height;
    const ctx = this.homeCtx;
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, width, 30);
    
    // Apply time offset if set
    let displayTime;
    if (this.timeOffset !== 0) {
      // Use custom time with offset
      const adjustedTime = Date.now() + this.timeOffset;
      displayTime = this.app.userTimeZone 
        ? luxon.DateTime.fromMillis(adjustedTime).setZone(this.app.userTimeZone)
        : luxon.DateTime.fromMillis(adjustedTime);
    } else {
      // Use system time
      displayTime = this.app.userTimeZone 
        ? luxon.DateTime.local().setZone(this.app.userTimeZone)
        : luxon.DateTime.local();
    }
    
    const dateTimeAndZone = displayTime.toFormat("MMM d, hh:mm a ZZZZ");
    this.app._drawTextOnCanvas(ctx, dateTimeAndZone, width - 15, 15, '14px "Rodin", sans-serif', "white", "right", "middle");
    const unopenedTextSmall = `${unopenedCount} ${this.app.t("unopened")}`;
    this.app._drawTextOnCanvas(ctx, unopenedTextSmall, 15, 15, '14px "Rodin", sans-serif', "white", "left", "middle");
  }

  handleResize() {
    const parentRect = this.element.getBoundingClientRect();
    this.mailScene.handleResize(parentRect.width, parentRect.height);
    if (this.homeCanvas.style.opacity === "1") {
      this.drawHomeInfo(this.lastUnopenedCount, performance.now());
    }
  }
}
