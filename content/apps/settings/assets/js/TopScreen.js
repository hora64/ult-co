import { UIComponent } from "/content/common/utils/index.js";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FFLShaderMaterial } from "/content/common/utils/threejs/materials/FFLShaderMaterial.js";
import { ModelLoader } from "/content/common/utils/ModelLoader.js";

export class TopScreen extends UIComponent {
    constructor(appInstance) {
        super();
        this.app = appInstance;
        this.element = this.createElement('div', 'top-screen');
        
        // Time offset in milliseconds
        this.timeOffset = 0;
        
        // Canvas for the background grid
        this.backgroundCanvas = this.createCanvas(400, 240, 'background-canvas');
        this.backgroundCanvas.style.position = 'absolute';
        this.backgroundCanvas.style.top = '0';
        this.backgroundCanvas.style.left = '0';
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
        this.element.appendChild(this.backgroundCanvas);

        // Three.js renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 400 / 240, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.createCanvas(400, 240), alpha: true, antialias: true });
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.element.appendChild(this.renderer.domElement);

        // Canvas for UI elements
        this.uiCanvas = this.createCanvas(400, 240, 'ui-canvas');
        this.uiCanvas.style.position = 'absolute';
        this.uiCanvas.style.top = '0';
        this.uiCanvas.style.left = '0';
        this.uiCanvas.style.pointerEvents = 'none';
        this.uiCtx = this.uiCanvas.getContext('2d');
        this.element.appendChild(this.uiCanvas);

        this.camera.position.z = 2.5;

        // Initialize ModelLoader with caching
        this.modelLoader = new ModelLoader({
            THREE: THREE,
            GLTFLoader: GLTFLoader,
            appId: 'settings',
            appVersion: '1.1.0'
        });

        this.gear = null;
        this._loadGear();

        this.animationFrameId = null;
        window.addEventListener('resize', () => this.onResize());
        
        // Load saved time offset
        this._loadTimeOffset();
    }

    _loadTimeOffset() {
        const storedTime = localStorage.getItem('customTime');
        if (storedTime) {
            const customTime = new Date(storedTime);
            const systemTime = new Date();
            this.timeOffset = customTime.getTime() - systemTime.getTime();
        }
    }

    registerTimeOffset(offset) {
        this.timeOffset = offset;
        console.log('[TopScreen] Time offset registered:', offset, 'ms');
    }

    async _loadGear() {
        try {
            console.log('[SettingsTopScreen] 🔄 Loading gear model with caching...');
            const gltf = await this.modelLoader.load('assets/models/gear.glb', {
                useCache: true,
                onProgress: (xhr) => {
                    if (xhr.lengthComputable) {
                        const percent = (xhr.loaded / xhr.total) * 100;
                        console.log(`[SettingsTopScreen] Gear loading: ${percent.toFixed(0)}%`);
                    }
                }
            });
            
            this.gear = gltf.scene;
            
            const material = new FFLShaderMaterial({
                color: new THREE.Color(0x007bff),
                modulateMode: 0, // FFL_MODULATE_MODE_COLOR
                lightEnable: true,
                transparent: false, // Disable transparency to prevent backface rendering
                side: THREE.FrontSide, // Backface culling enabled
                depthWrite: true, // Enable depth writing for proper occlusion
                depthTest: true // Enable depth testing
            });
            material.modulateType = 4; // Metal
            
            this.gear.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            this.gear.scale.set(.5, .5, .5);
            this.gear.position.set(0, -0.1, 0);
            this.scene.add(this.gear);
            console.log('[SettingsTopScreen] ✅ Gear model loaded with caching');
        } catch (error) {
            console.error('[SettingsTopScreen] Failed to load gear model:', error);
        }
    }

    show() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.onResize();
        this.draw();
    }

    draw() {
        this.animationFrameId = requestAnimationFrame(() => this.draw());
        
        const time = Date.now();
        
        this.drawBackground(time);
        
        if (this.gear) {
            this.gear.rotation.x = time * 0.0001;
            this.gear.rotation.y = time * 0.0002;
        }
        
        this.renderer.render(this.scene, this.camera);

        this.drawTopBar();
    }

    onResize() {
        const rect = this.element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(rect.width, rect.height);
        
        this.backgroundCanvas.width = rect.width;
        this.backgroundCanvas.height = rect.height;
        
        this.uiCanvas.width = rect.width;
        this.uiCanvas.height = rect.height;

        this.drawTopBar();
    }

    drawBackground(time) {
        const ctx = this.backgroundCtx;
        const width = this.backgroundCanvas.width;
        const height = this.backgroundCanvas.height;
        ctx.clearRect(0, 0, width, height);
        this.drawGrid(ctx, width, height, time);
    }

    drawTopBar() {
        const ctx = this.uiCtx;
        const width = this.uiCanvas.width;
        const height = this.uiCanvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw background overlay for the top bar
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, width, 30);
        
        // Draw app label
        this.app._drawTextOnCanvas(ctx, this.app.translations.appLabel, 15, 15, 
            '14px "Rodin", sans-serif', 'white', 'left', 'middle');
        
        // Get current time with offset
        let displayTime;
        if (this.timeOffset !== 0) {
            const adjustedTime = Date.now() + this.timeOffset;
            displayTime = this.app.dateTimeFormatter.userTimeZone 
                ? luxon.DateTime.fromMillis(adjustedTime).setZone(this.app.dateTimeFormatter.userTimeZone)
                : luxon.DateTime.fromMillis(adjustedTime);
        } else {
            displayTime = this.app.dateTimeFormatter.userTimeZone 
                ? luxon.DateTime.local().setZone(this.app.dateTimeFormatter.userTimeZone)
                : luxon.DateTime.local();
        }
        
        const dateTimeAndZone = displayTime.toFormat('MMM d, hh:mm a ZZZZ');
        this.app._drawTextOnCanvas(ctx, dateTimeAndZone, width - 15, 15, 
            '14px "Rodin", sans-serif', 'white', 'right', 'middle');
    }

    drawGrid(ctx, width, height, time) {
        const gridSize = 30;
        const scrollSpeed = 200;
        const offsetX = (time / scrollSpeed) % gridSize;
        const offsetY = (time / scrollSpeed) % gridSize;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let x = -offsetX; x < width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = -offsetY; y < height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.renderer.dispose();
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        this.element.removeChild(this.renderer.domElement);
    }
}

class Particle {
    constructor(x, y, size, speed, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.angle = Math.random() * 360;
    }

    update() {
        this.y -= this.speed;
        if (this.y < -this.size) {
            this.y = window.innerHeight + this.size;
            this.x = Math.random() * window.innerWidth;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(-this.size / 2, -this.size / 2, this.size, this.size, this.size * 0.2);
        ctx.fill();
        ctx.restore();
    }
}