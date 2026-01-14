import * as THREE from 'three';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";
import { Tween } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/libs/tween.module.min.js";
import { Lensflare, LensflareElement } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/objects/Lensflare.js';
import { FFLShaderMaterial } from '/content/common/utils/threejs/materials/FFLShaderMaterial.js';
import { SkyMaterial } from '/content/common/utils/threejs/materials/SkyMaterial.js';
import { createCloudMaterial } from '/content/common/utils/threejs/materials/CloudMaterial.js';
import { createBlobShadow } from '/content/common/utils/threejs/effects/BlobShadow.js';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';
import { AssetPreloader } from '/content/common/utils/AssetPreloader.js';

export class MailScene {
    constructor(appInstance) {
        this.app = appInstance;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 400 / 240, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(400, 240);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.domElement.className = "threejs-canvas";

        // Initialize ModelLoader with caching
        this.modelLoader = new ModelLoader({
            THREE: THREE,
            GLTFLoader: GLTFLoader,
            appId: 'mail',
            appVersion: '1.1.0'
        });

        // Initialize AssetPreloader for textures
        this.assetPreloader = new AssetPreloader({
            appId: 'mail',
            appVersion: '1.1.0',
            THREE: THREE
        });

        // Initialize timeSystem if not already present (for standalone testing)
        if (!this.app.timeSystem) {
            this.app.timeSystem = this._createDefaultTimeSystem();
        }

        // Light setup, simplified to remove duplicate `scene.add` calls
        this.mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.moonLight = new THREE.DirectionalLight(0xbbddff, 0);
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444422, 0.2);

        // Lensflare setup
        this.setupLensflare();

        this.mailbox = null;
        this.mailboxShadow = null;
        this.mailboxMaterial = null;
        this.platformMaterial = null;
        this.mixer = null;
        this.platform = null;

        this.cloudPivot = new THREE.Object3D();

        this.loadSkybox();
        this._loadMailbox();
        this._loadPlatform();
        this._loadClouds();

        this.lastTime = performance.now();
        this.animateThreeJS(performance.now());
    }

    /**
     * Creates a default time system for standalone testing
     * This is used when MailScene is instantiated without AnnouncementsApp
     */
    _createDefaultTimeSystem() {
        return {
            dayTime: 720,
            globalTime: 720,
            timeSpeed: 1,
            manualTime: false,
            sunPosition: new THREE.Vector3(),
            moonPosition: new THREE.Vector3(),
            skyColors: {
                midnight: { top: new THREE.Color(0x000010), middle: new THREE.Color(0x000040), bottom: new THREE.Color(0x000020) },
                dawn: { top: new THREE.Color(0x0a1631), middle: new THREE.Color(0x192a5b), bottom: new THREE.Color(0x36488a) },
                sunrise: { top: new THREE.Color(0x6e789a), middle: new THREE.Color(0xae8b54), bottom: new THREE.Color(0xf66a33) },
                morning: { top: new THREE.Color(0x73a8f0), middle: new THREE.Color(0x75b7f1), bottom: new THREE.Color(0xadd4f6) },
                noon: { top: new THREE.Color(0x6189b8), middle: new THREE.Color(0x6390b8), bottom: new THREE.Color(0xa1c4e7) },
                afternoon: { top: new THREE.Color(0x4268a8), middle: new THREE.Color(0x4472b5), bottom: new THREE.Color(0x89b6e8) },
                sunset: { top: new THREE.Color(0x8593b4), middle: new THREE.Color(0x9d4e2d), bottom: new THREE.Color(0xcd340e) },
                dusk: { top: new THREE.Color(0x422c54), middle: new THREE.Color(0x563868), bottom: new THREE.Color(0x845e95) }
            },
            timePhases: [
                { from: 'dusk', to: 'midnight', start: 21, end: 24 + 5, sun: (t) => 0, moon: (t) => 0.5 + t, ambient: (t) => 0.2 - 0.1 * t, hsl: (t) => [0.6, 0.3, 0.5] },
                { from: 'midnight', to: 'dawn', start: 0, end: 5, sun: (t) => 0, moon: (t) => 1 - t, ambient: (t) => 0.1 - 0.05 * t, hsl: (t) => [0.6, 0.3, 0.5] },
                { from: 'dawn', to: 'sunrise', start: 5, end: 6, sun: (t) => t * 0.7, moon: (t) => 0, ambient: (t) => 0.05 + 0.5 * t, hsl: (t) => [0.08, 0.8, 0.7 - 0.2 * t] },
                { from: 'sunrise', to: 'morning', start: 6, end: 8, sun: (t) => 0.7 + t * 0.8, moon: (t) => 0, ambient: (t) => 0.55 + 0.35 * t, hsl: (t) => [0.08, 0.8, 0.5] },
                { from: 'morning', to: 'noon', start: 8, end: 12, sun: (t) => 1.5, moon: (t) => 0, ambient: (t) => 0.9, hsl: (t) => [0.6, 0.3, 0.5] },
                { from: 'noon', to: 'afternoon', start: 12, end: 16, sun: (t) => 1.5, moon: (t) => 0, ambient: (t) => 0.9, hsl: (t) => [0.6, 0.3, 0.5] },
                { from: 'afternoon', to: 'sunset', start: 16, end: 19, sun: (t) => 1.5 - t * 0.8, moon: (t) => 0, ambient: (t) => 0.9 - t * 0.6, hsl: (t) => [0.08, 0.8, 0.7 - 0.2 * t] },
                { from: 'sunset', to: 'dusk', start: 19, end: 21, sun: (t) => 0.7 - 0.7 * t, moon: (t) => 0, ambient: (t) => 0.3 - 0.1 * t, hsl: (t) => [0.08, 0.8, 0.5 - 0.2 * t] }
            ],
            currentSkyColors: { top: new THREE.Color(), middle: new THREE.Color(), bottom: new THREE.Color() }
        };
    }

    async setupLensflare() {
        const lensflare = new Lensflare();
        
        try {
            // Preload lensflare textures with caching
            console.log('[MailScene] 🔄 Preloading lensflare textures with caching...');
            const textureUrls = [
                'https://threejs.org/examples/textures/lensflare/lensflare0.png',
                'https://threejs.org/examples/textures/lensflare/lensflare3.png'
            ];
            
            const textures = await this.assetPreloader.loadTextures(textureUrls, {
                returnThreeTexture: true,
                onProgress: (current, total, url) => {
                    console.log(`[MailScene] Loading lensflare texture ${current}/${total}: ${url}`);
                }
            });

            const textureFlare0 = textures.get(textureUrls[0]);
            const textureFlare3 = textures.get(textureUrls[1]);
            
            if (textureFlare0 && textureFlare3) {
                lensflare.addElement(new LensflareElement(textureFlare0, 700, 0));
                lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
                lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
                lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
                lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
                
                this.mainLight.add(lensflare);
                this.mainLight.userData.lensflare = lensflare;
                console.log('[MailScene] ✅ Lensflare textures loaded with caching');
            }
        } catch (error) {
            console.warn('[MailScene] Failed to load lensflare textures, using fallback:', error);
            // Fallback to non-cached loading
            const textureLoader = new THREE.TextureLoader();
            const textureFlare0 = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
            const textureFlare3 = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare3.png');
            lensflare.addElement(new LensflareElement(textureFlare0, 700, 0));
            lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
            lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
            lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
            lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
            this.mainLight.add(lensflare);
            this.mainLight.userData.lensflare = lensflare;
        }
    }

    loadSkybox() {
        const skyRadius = 10.0;
        this.skyMaterialInstance = this._createSkyMaterial(this.app.timeSystem, skyRadius);
        const skyMesh = new THREE.Mesh(
            new THREE.SphereGeometry(skyRadius, 32, 32), // Full sphere
            this.skyMaterialInstance
        );
        this.scene.add(skyMesh);
        this.scene.add(this.mainLight);
        this.scene.add(this.ambientLight);
        this.scene.add(this.moonLight);
        this.scene.add(this.hemiLight);

        const grassPlane = this._createGrassGroundPlane();
        this.scene.add(grassPlane);

        this.camera.position.set(0, 1, 1);
        this.camera.lookAt(0, this.camera.position.y, 0);
    }

    setOpacity(opacity) {
        this.renderer.domElement.style.opacity = opacity;
    }

    _createGrassGroundPlane() {
        const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                topLightColor: { value: new THREE.Color() },
                ambientLightColor: { value: new THREE.Color() },
                ambientIntensity: { value: 0.0 },
                pixelDensity: { value: 2048.0 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 topLightColor;
                uniform vec3 ambientLightColor;
                uniform float ambientIntensity;
                uniform float pixelDensity;
                varying vec2 vUv;
                float random (vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }
                float noise(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }
                void main() {
                    vec2 pixelatedUv = floor(vUv * pixelDensity) / pixelDensity;
                    float n = noise(pixelatedUv * 5.0);
                    vec3 lightGrassColor = vec3(140.0/255.0, 190.0/255.0, 100.0/255.0);
                    vec3 midGrassColor = vec3(100.0/255.0, 150.0/255.0, 70.0/255.0);
                    vec3 darkGrassColor = vec3(70.0/255.0, 110.0/255.0, 50.0/255.0);
                    vec3 dirtColor = vec3(201.0/255.0, 161.0/255.0, 115.0/255.0);
                    vec3 finalColor;
                    float pathCenter = 0.5;
                    float pathWidth = 0.05;
                    float pathFeather = 0.025;
                    float distFromPathCenter = abs(vUv.y - pathCenter);
                    float pathInfluence = smoothstep(pathWidth + pathFeather, pathWidth, distFromPathCenter);
                    if (n > 0.6) {
                        finalColor = mix(midGrassColor, lightGrassColor, smoothstep(0.6, 1.0, n));
                    } else if (n > 0.3) {
                        finalColor = mix(darkGrassColor, midGrassColor, smoothstep(0.3, 0.6, n));
                    } else {
                        finalColor = mix(dirtColor, darkGrassColor, smoothstep(0.0, 0.3, n));
                    }
                    finalColor = mix(finalColor, dirtColor, pathInfluence);
                    vec3 lightInfluence = ambientLightColor * ambientIntensity * 1.5 + topLightColor * 0.8;
                    finalColor = finalColor * lightInfluence;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            transparent: true,
        });
        this.grassMaterial = material;
        return new THREE.Mesh(geometry, material);
    }

    async _loadMailbox() {
        try {
            console.log('[MailScene] 🔄 Loading mailbox model with caching...');
            const gltf = await this.modelLoader.load('assets/models/mailBox_Flat.glb', {
                useCache: true,
                onProgress: (xhr) => {
                    if (xhr.lengthComputable) {
                        const percent = (xhr.loaded / xhr.total) * 100;
                        console.log(`[MailScene] Mailbox loading: ${percent.toFixed(0)}%`);
                    }
                }
            });
            
            this.mailbox = gltf.scene;
            const gltfTextures = await gltf.parser.getDependencies('texture');
            this.mailbox.traverse((child) => {
                if (child.isMesh && child.material) {
                    const oldMaterial = child.material;
                    let texture = oldMaterial.map || (gltfTextures.length > 0 ? gltfTextures[0] : null);
                    this.mailboxMaterial = new FFLShaderMaterial({
                        map: texture || null,
                        modulateMode: texture ? 1 : 0,
                        color: oldMaterial.color,
                        transparent: true,
                        side: THREE.FrontSide // Enable backface culling (only render front faces)
                    });
                    child.material = this.mailboxMaterial;
                }
            });
            this.mailbox.position.set(0, 0, -1.25);
            this.mailbox.scale.set(0.3, 0.3, 0.3);
            this.mailbox.rotation.y = -1.01 * Math.PI / 2;
            this.mailbox.rotation.x = -Math.PI / 120;

            this.scene.add(this.mailbox);
            this.mailboxShadow = createBlobShadow(this.mailbox, this.scene, {
                color: 0x000000,
                opacity: 0.4,
                shadowRadius: 1.0,
                falloff: 0.7,
                shadowPlaneSize: 1.0
            });
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.mailbox);
                const clip = gltf.animations[0];
                const action = this.mixer.clipAction(clip);
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                action.timeScale = 0.2; // New line to slow down the animation

                // Play the animation 1 second after the app loads
                setTimeout(() => action.play(), 1000);
            }
            console.log('[MailScene] ✅ Mailbox model loaded with caching');
        } catch (error) {
            console.error('[MailScene] An error occurred loading the mailbox model:', error);
        }
    }

    async _loadPlatform() {
        try {
            console.log('[MailScene] 🔄 Loading platform model with caching...');
            const gltf = await this.modelLoader.load('assets/models/platform.glb', {
                useCache: true,
                onProgress: (xhr) => {
                    if (xhr.lengthComputable) {
                        const percent = (xhr.loaded / xhr.total) > 1 ? 100 : (xhr.loaded / xhr.total) * 100;
                        console.log(`[MailScene] Platform loading: ${percent.toFixed(0)}%`);
                    }
                }
            });
            
            this.platform = gltf.scene;
            const gltfTextures = await gltf.parser.getDependencies('texture');
            this.platform.traverse((child) => {
                if (child.isMesh && child.material) {
                    const oldMaterial = child.material;
                    let texture = oldMaterial.map || (gltfTextures.length > 0 ? gltfTextures[0] : null);
                    this.platformMaterial = new FFLShaderMaterial({
                        map: texture,
                        modulateMode: texture ? 1 : 0,
                        color: oldMaterial.color,
                        transparent: true,
                        side: THREE.FrontSide // Enable backface culling (only render front faces)
                    });
                    child.material = this.platformMaterial;
                }
            });
            this.platform.position.set(0, 0.01, -1.25);
            this.platform.scale.set(0.3, 0.5, 0.3);
            this.platform.rotation.x = Math.PI;
            this.scene.add(this.platform);
            console.log('[MailScene] ✅ Platform model loaded with caching');
        } catch (error) {
            console.error('[MailScene] An error occurred loading the platform model:', error);
        }
    }

    async _loadClouds() {
        try {
            console.log('[MailScene] 🔄 Loading cloud model with caching...');
            const gltf = await this.modelLoader.load('assets/models/Cloud-1.glb', {
                useCache: true,
                onProgress: (xhr) => {
                    if (xhr.lengthComputable) {
                        const percent = (xhr.loaded / xhr.total) * 100;
                        console.log(`[MailScene] Cloud loading: ${percent.toFixed(0)}%`);
                    }
                }
            });
            
            const cloudMeshTemplate = gltf.scene;
            const numClouds = 12;
            // Updated cloud heights to make them spawn higher
            const allowedHeights = [3.0, 3.5, 4.0];
            const minDistanceFromCenter = 1.2;
            const maxDistanceRatio = 0.85;
            const skyRadius = 10.0;

            this.scene.add(this.cloudPivot);

            for (let i = 0; i < numClouds; i++) {
                const instance = cloudMeshTemplate.clone(true);
                instance.traverse(child => {
                    if (child.isMesh) {
                        const cloudMat = createCloudMaterial();
                        // Enable backface culling for clouds
                        cloudMat.side = THREE.FrontSide;
                        child.material = cloudMat;
                    }
                });

                const baseHeight = allowedHeights[Math.floor(Math.random() * allowedHeights.length)] + Math.random() * 0.2 - 0.1;
                const maxPossibleDistanceAtHeight = Math.sqrt(skyRadius * skyRadius - baseHeight * baseHeight);
                const maxAllowedDistance = maxPossibleDistanceAtHeight * maxDistanceRatio - 0.3;
                const distance = THREE.MathUtils.lerp(minDistanceFromCenter, Math.max(minDistanceFromCenter, maxAllowedDistance), Math.pow(Math.random(), 2));

                const minScale = 0.2, maxScale = 0.4;
                const distanceFactor = (maxAllowedDistance - minDistanceFromCenter > 0) ? (distance - minDistanceFromCenter) / (maxAllowedDistance - minDistanceFromCenter) : 0;
                const scale = THREE.MathUtils.lerp(minScale, maxScale, THREE.MathUtils.clamp(distanceFactor, 0, 1));

                const angle = Math.random() * Math.PI * 2;
                instance.position.set(Math.cos(angle) * distance, baseHeight, Math.sin(angle) * distance);
                instance.scale.setScalar(scale);
                instance.rotation.y = Math.random() * Math.PI * 2;
                instance.userData = { offset: Math.random() * Math.PI * 2, baseHeight: baseHeight, baseDistance: distance, currentAngle: angle };
                this.cloudPivot.add(instance);
            }
            console.log('[MailScene] ✅ Cloud models loaded with caching');
        } catch (error) {
            console.error('[MailScene] Error loading cloud GLTF model:', error);
        }
    }

    animateThreeJS(currentTime = performance.now()) {
        requestAnimationFrame(this.animateThreeJS.bind(this));
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        if (this.mailboxMaterial) {
            this.mailboxMaterial.time = currentTime / 1000;
        }
        if (this.mailboxShadow) {
            this.mailboxShadow.update();
        }
        this.cloudPivot.rotation.y += 0.0001 * deltaTime;
        this.cloudPivot.children.forEach(cloud => {
            if (cloud.userData && cloud.userData.baseDistance !== undefined) {
                const individualSpeedFactor = 0.0002 + (cloud.userData.offset - Math.PI) * 0.00005;
                cloud.userData.currentAngle += individualSpeedFactor * deltaTime * 60;
                const heightOffset = Math.sin(currentTime * 0.0002 + cloud.userData.offset) * 0.05;
                const distanceOffset = Math.sin(currentTime * 0.00015 + cloud.userData.offset) * 0.03;
                cloud.position.set(
                    Math.cos(cloud.userData.currentAngle) * (cloud.userData.baseDistance + distanceOffset),
                    cloud.userData.baseHeight + heightOffset,
                    Math.sin(cloud.userData.currentAngle) * (cloud.userData.baseDistance + distanceOffset)
                );
                cloud.rotation.y += 0.0005 * deltaTime * 60;
            }
        });

        let now = luxon.DateTime.local();
        if (localStorage.getItem('userTimeZone')) {
            now = now.setZone(localStorage.getItem('userTimeZone'));
        }

        // Check for custom time override from localStorage
        const customTimeStr = localStorage.getItem('customTime');
        
        if (customTimeStr) {
            try {
                // Parse ISO 8601 datetime string (e.g., "2025-11-30T17:18:52.243Z")
                const customDateTime = luxon.DateTime.fromISO(customTimeStr);
                
                if (customDateTime.isValid) {
                    // Apply user timezone if available
                    const userTimeZone = localStorage.getItem('userTimeZone');
                    const adjustedTime = userTimeZone ? customDateTime.setZone(userTimeZone) : customDateTime;
                    
                    // Convert to minutes (0-1440)
                    const minutes = adjustedTime.hour * 60 + adjustedTime.minute;
                    this.app.timeSystem.dayTime = minutes;
                    this.app.timeSystem.globalTime = minutes;
                    this.app.timeSystem.manualTime = true;
                } else {
                    // Fallback to current time if parsing fails
                    this.app.timeSystem.dayTime = now.hour * 60 + now.minute;
                    this.app.timeSystem.globalTime = this.app.timeSystem.dayTime;
                }
            } catch (error) {
                console.warn('[MailScene] Failed to parse customTime:', error);
                // Fallback to current time
                this.app.timeSystem.dayTime = now.hour * 60 + now.minute;
                this.app.timeSystem.globalTime = this.app.timeSystem.dayTime;
            }
        } else if (!this.app.timeSystem.manualTime && this.app.timeSystem.timeSpeed !== 0) {
            const minutesDelta = deltaTime * this.app.timeSystem.timeSpeed * 60;
            this.app.timeSystem.globalTime = (this.app.timeSystem.globalTime + minutesDelta) % 1440;
            if (this.app.timeSystem.globalTime < 0)
                this.app.timeSystem.globalTime += 1440;
            this.app.timeSystem.dayTime = this.app.timeSystem.globalTime;
        } else {
            this.app.timeSystem.dayTime = now.hour * 60 + now.minute;
            this.app.timeSystem.globalTime = this.app.timeSystem.dayTime;
        }

        const minutes = this.app.timeSystem.dayTime;
        const hours = minutes / 60;
        let sunIntensity = 0, moonIntensity = 0, ambientIntensity = 0.1;
        let currentLightColor = new THREE.Color(0xffffff);
        let targetSkyColors = this.app.timeSystem.skyColors.midnight;

        for (const phase of this.app.timeSystem.timePhases) {
            let t = -1;
            if (phase.start < phase.end) {
                if (hours >= phase.start && hours < phase.end) {
                    t = (hours - phase.start) / (phase.end - phase.start);
                }
            } else {
                if (hours >= phase.start) {
                    t = (hours - phase.start) / (24 - phase.start + phase.end);
                } else if (hours < phase.end) {
                    t = (24 - phase.start + hours) / (24 - phase.start + phase.end);
                }
            }

            if (t !== -1) {
                t = THREE.MathUtils.clamp(t, 0, 1);
                targetSkyColors = {
                    top: new THREE.Color().lerpColors(this.app.timeSystem.skyColors[phase.from].top, this.app.timeSystem.skyColors[phase.to].top, t),
                    middle: new THREE.Color().lerpColors(this.app.timeSystem.skyColors[phase.from].middle, this.app.timeSystem.skyColors[phase.to].middle, t),
                    bottom: new THREE.Color().lerpColors(this.app.timeSystem.skyColors[phase.from].bottom, this.app.timeSystem.skyColors[phase.to].bottom, t),
                };
                sunIntensity = phase.sun(t);
                moonIntensity = phase.moon(t);
                ambientIntensity = phase.ambient(t);
                currentLightColor.setHSL(...phase.hsl(t));
                break;
            }
        }
        this.app.timeSystem.currentSkyColors.top.copy(targetSkyColors.top);
        this.app.timeSystem.currentSkyColors.middle.copy(targetSkyColors.middle);
        this.app.timeSystem.currentSkyColors.bottom.copy(targetSkyColors.bottom);

        this.moonLight.color.setHSL(0.6, 0.3, 0.5);

        if (this.skyMaterialInstance && this.skyMaterialInstance.uniforms) {
            this.skyMaterialInstance.uniforms.topColor.value.copy(this.app.timeSystem.currentSkyColors.top);
            this.skyMaterialInstance.uniforms.middleColor.value.copy(this.app.timeSystem.currentSkyColors.middle);
            this.skyMaterialInstance.uniforms.bottomColor.value.copy(this.app.timeSystem.currentSkyColors.bottom);
            // Update sun and moon positions for halos (with defensive checks)
            if (this.skyMaterialInstance.uniforms.sunPosition) {
                this.skyMaterialInstance.uniforms.sunPosition.value.copy(this.app.timeSystem.sunPosition);
            }
            if (this.skyMaterialInstance.uniforms.moonPosition) {
                this.skyMaterialInstance.uniforms.moonPosition.value.copy(this.app.timeSystem.moonPosition);
            }
        }

        this.mainLight.intensity = sunIntensity;
        this.mainLight.color.copy(currentLightColor);
        const sunAngle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;
        const sunOrbitRadius = 2.5;
        this.app.timeSystem.sunPosition.set(
            Math.cos(sunAngle) * sunOrbitRadius,
            Math.sin(sunAngle) * sunOrbitRadius + 1.0,
            0
        );
        this.mainLight.position.copy(this.app.timeSystem.sunPosition);
        this.mainLight.lookAt(0, 0, 0);

        // Update lens flare visibility and opacity based on time
        if (this.mainLight.userData.lensflare) {
            const isAfternoon = hours >= 12 && hours < 17;
            this.mainLight.userData.lensflare.visible = isAfternoon;
        }

        this.moonLight.intensity = moonIntensity;
        const moonAngle = sunAngle + Math.PI;
        this.app.timeSystem.moonPosition.set(
            Math.cos(moonAngle) * sunOrbitRadius,
            Math.sin(moonAngle) * sunOrbitRadius + 1.0,
            0
        );
        this.moonLight.position.copy(this.app.timeSystem.moonPosition);
        this.moonLight.lookAt(0, 0, 0);

        this.ambientLight.intensity = ambientIntensity;
        // FIX: Update ambient light color to match the time of day
        this.ambientLight.color.copy(this.app.timeSystem.currentSkyColors.middle);
        this.hemiLight.intensity = ambientIntensity * 0.5;

        // Update mailbox and platform materials with new light values
        if (this.mailboxMaterial && this.mailboxMaterial.uniforms) {
            const minMailboxAmbientIntensity = 0.8;
            const minMailboxDiffuseIntensity = 0.2;
            this.mailboxMaterial.uniforms.u_light_ambient.value.copy(this.ambientLight.color);
            this.mailboxMaterial.uniforms.u_light_diffuse.value.copy(this.mainLight.color);
            this.mailboxMaterial.uniforms.u_ambientIntensity.value = Math.max(ambientIntensity, minMailboxAmbientIntensity);
            this.mailboxMaterial.uniforms.u_diffuseIntensity.value = Math.max(sunIntensity, minMailboxDiffuseIntensity);
        }

        if (this.platformMaterial && this.platformMaterial.uniforms) {
            const minPlatformAmbientIntensity = 0.5;
            const minPlatformDiffuseIntensity = 0.1;
            this.platformMaterial.uniforms.u_light_ambient.value.copy(this.ambientLight.color);
            this.platformMaterial.uniforms.u_light_diffuse.value.copy(this.mainLight.color);
            this.platformMaterial.uniforms.u_ambientIntensity.value = Math.max(ambientIntensity, minPlatformAmbientIntensity);
            this.platformMaterial.uniforms.u_diffuseIntensity.value = Math.max(sunIntensity, minPlatformDiffuseIntensity);
        }

        if (this.grassMaterial && this.grassMaterial.uniforms) {
            this.grassMaterial.uniforms.topLightColor.value.copy(this.mainLight.color);
            this.grassMaterial.uniforms.ambientLightColor.value.copy(this.ambientLight.color);
            this.grassMaterial.uniforms.ambientIntensity.value = this.ambientLight.intensity;
        }

        // Update cloud materials based on day/night cycle
        this.cloudPivot.children.forEach(cloud => {
            if (cloud.isMesh && cloud.material && cloud.material.uniforms) {
                // The new cloud material handles this logic internally, no need for the isNight uniform
                cloud.material.uniforms.lightIntensity.value = Math.max(sunIntensity, 0.1);
                cloud.material.uniforms.lightColor.value.copy(this.mainLight.color);
                // The following lines were added to fix the cloud tinting issue.
                cloud.material.uniforms.tintColor.value.copy(this.ambientLight.color);
                cloud.material.uniforms.tintIntensity.value = ambientIntensity * 1.5;
            }
        });

        const bottomScreenOverlay = document.getElementById("bottom-screen-overlay");
        if (bottomScreenOverlay) {
            let overlayOpacity = 0;
            let overlayColor = new THREE.Color(0, 0, 0);
            if (hours > 20 || hours < 6) {
                overlayOpacity = THREE.MathUtils.lerp(0.4, 0.0, ambientIntensity);
                overlayColor.setRGB(0, 0, 0);
            } else if (hours >= 17 || hours < 8) {
                overlayOpacity = THREE.MathUtils.lerp(0.1, 0.0, Math.min(ambientIntensity * 2, 1.0));
                overlayColor.setRGB(0.5, 0.2, 0);
            } else {
                overlayOpacity = THREE.MathUtils.lerp(0.05, 0.0, ambientIntensity * 2);
                overlayColor.setRGB(0.0, 0.0, 0.0);
            }
            bottomScreenOverlay.style.backgroundColor = `rgba(${Math.floor(overlayColor.r * 255)}, ${Math.floor(overlayColor.g * 255)}, ${Math.floor(overlayColor.b * 255)}, ${overlayOpacity})`;
        }

        this.renderer.render(this.scene, this.camera);
    }

    _createSkyMaterial(timeSystem, radius) {
        return new SkyMaterial({
            topColor: timeSystem.skyColors.morning.top,
            middleColor: timeSystem.skyColors.morning.middle,
            bottomColor: timeSystem.skyColors.morning.bottom,
            sunPosition: timeSystem.sunPosition,
            moonPosition: timeSystem.moonPosition,
            sunHaloIntensity: 0.3,
            moonHaloIntensity: 0.3
        });
    }

    handleResize(width, height) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
