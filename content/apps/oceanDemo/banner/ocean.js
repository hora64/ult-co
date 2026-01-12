import { BaseBanner } from '/content/common/utils/banners/BaseBanner.js';
import { ModelLoader } from '/content/common/utils/ModelLoader.js';

/**
 * OceanBanner - Animated ocean scene banner with day/night cycle
 * Uses ModelLoader for automatic caching of 3D models in IndexedDB
 * @extends BaseBanner
 */
export default class OceanBanner extends BaseBanner {
    constructor(container, appData) {
        super(container, appData);
        
        // Scene objects
        this.mainLight = null;
        this.ambientLight = null;
        this.moonLight = null;
        this.hemiLight = null;
        this.skyMesh = null;
        this.waterMesh = null;
        this.cloudPivot = null;
        this.clock = null;
        this.lastTime = 0;
        
        // Materials
        this.skyMaterial = null;
        this.waterMaterial = null;
        
        // Time system
        this.timeSystem = null;
        
        // Three.js reference
        this.THREE = null;
        
        // ModelLoader for caching
        this.modelLoader = null;
        
        // Asset paths - use absolute paths from content root
        this.assetPaths = {
            roundFloorModel: '/content/apps/oceanDemo/banner/models/roundFloor.glb',
            cloudModel: '/content/apps/oceanDemo/banner/models/Cloud-1.glb',
            waterTexture1: '/content/apps/oceanDemo/banner/textures/water1.png',
            waterTexture2: '/content/apps/oceanDemo/banner/textures/water2.png'
        };
        
        this.skyRadius = 3.0;
    }
    
    /**
     * Initializes the ocean banner
     * @returns {Promise<void>}
     */
    async init() {
        try {
            console.log('[OceanBanner] Initializing ocean banner with model caching');
            
            // Load jingle if available
            const jinglePath = this.appData.unopened 
                ? (this.appData.unopenedJingle || this.appData.jingle)
                : this.appData.jingle;
            
            if (jinglePath) {
                this.loadJingle(jinglePath);
            }
            
            // Import Three.js and shaders
            const { THREE, canvas } = await this.createThreeCanvas();
            this.THREE = THREE.default || THREE; // Handle different import formats
            
            // Initialize ModelLoader for caching
            const { GLTFLoader } = await import('GLTFLoader');
            this.modelLoader = new ModelLoader({
                THREE: this.THREE,
                GLTFLoader: GLTFLoader,
                appId: 'oceanDemo',
                appVersion: '1.0.0'
            });
            
            // Import shader modules
            const { createSkyMaterial } = await import('./shaders/skyMaterial.js');
            const { createWaterMaterial } = await import('./shaders/waterMaterial.js');
            const { createCloudMaterial } = await import('./shaders/cloudMaterial.js');
            
            // Create scene with custom camera position
            this.createThreeScene(canvas, this.THREE, {
                cameraPosition: { x: 0, y: 1, z: 4.5 },
                clearAlpha: 0
            });
            
            // Create BannerRoot for scaling
            this.createBannerRoot(this.THREE);
            
            // Override camera look direction
            this.camera.lookAt(0, 1, -4.5);
            
            // Initialize time system
            this.initializeTimeSystem();
            
            // Setup lighting - add to BannerRoot
            this.mainLight = new this.THREE.DirectionalLight(0xffffff, 1.5);
            this.mainLight.position.copy(this.timeSystem.sunPosition);
            this.bannerRoot.add(this.mainLight);
            
            this.ambientLight = new this.THREE.AmbientLight(0x404040, 0.5);
            this.bannerRoot.add(this.ambientLight);
            
            this.moonLight = new this.THREE.DirectionalLight(0xbbddff, 0);
            this.moonLight.position.copy(this.timeSystem.moonPosition);
            this.bannerRoot.add(this.moonLight);
            
            this.hemiLight = new this.THREE.HemisphereLight(0xffffff, 0x444422, 0.2);
            this.bannerRoot.add(this.hemiLight);
            
            // Create sky - add to BannerRoot
            this.skyMaterial = createSkyMaterial(this.timeSystem, this.skyRadius);
            this.skyMesh = new this.THREE.Mesh(
                new this.THREE.SphereGeometry(this.skyRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
                this.skyMaterial
            );
            this.bannerRoot.add(this.skyMesh);
            
            // Create water with caching - will be added to BannerRoot in createWater
            await this.createWater(createWaterMaterial);
            
            // Create clouds with caching - will be added to BannerRoot in createClouds
            await this.createClouds(createCloudMaterial);
            
            // Get cache statistics
            const cacheStats = await this.modelLoader.getCacheStats();
            console.log('[OceanBanner] Cache stats:', cacheStats);
            
            // Create clock
            this.clock = new this.THREE.Clock();
            
            // Initial update
            this.updateDayNightCycle();
            
            // Start animation
            this.startAnimationLoop();
            
            this.isInitialized = true;
            console.log('[OceanBanner] Ocean banner initialized successfully with model caching');
            
        } catch (error) {
            console.error('[OceanBanner] Failed to initialize ocean banner:', error);
            throw error;
        }
    }
    
    /**
     * Initialize time system
     * @private
     */
    initializeTimeSystem() {
        const THREE = this.THREE;
        
        this.timeSystem = {
            globalTime: 0,
            dayTime: 720,
            timeSpeed: 60,
            sunPosition: new THREE.Vector3(0, 5, 10),
            moonPosition: new THREE.Vector3(0, 5, -10),
            skyColors: {
                midnight: { top: new THREE.Color(0.02,0.02,0.08), middle: new THREE.Color(0.01,0.01,0.05), bottom: new THREE.Color(0.005,0.005,0.02) },
                sunriseStart: { top: new THREE.Color(0.1,0.05,0.1), middle: new THREE.Color(0.05,0.02,0.08), bottom: new THREE.Color(0.02,0.01,0.05) },
                sunrisePeak: { top: new THREE.Color(1.0,0.5,0.3), middle: new THREE.Color(0.8,0.3,0.2), bottom: new THREE.Color(0.3,0.1,0.1) },
                morning: { top: new THREE.Color(0.7,0.9,1.2), middle: new THREE.Color(0.4,0.7,1.0), bottom: new THREE.Color(0.1,0.3,0.8) },
                midday: { top: new THREE.Color(0.9,1.0,1.3), middle: new THREE.Color(0.5,0.8,1.1), bottom: new THREE.Color(0.2,0.4,0.9) },
                sunsetStart: { top: new THREE.Color(1.0,0.6,0.3), middle: new THREE.Color(0.9,0.4,0.2), bottom: new THREE.Color(0.4,0.2,0.1) },
                sunsetPeak: { top: new THREE.Color(0.8,0.3,0.1), middle: new THREE.Color(0.6,0.2,0.1), bottom: new THREE.Color(0.2,0.05,0.05) },
                evening: { top: new THREE.Color(0.2,0.1,0.3), middle: new THREE.Color(0.1,0.05,0.2), bottom: new THREE.Color(0.05,0.02,0.1) }
            },
            currentSkyColors: { top: new THREE.Color(), middle: new THREE.Color(), bottom: new THREE.Color() },
            timePhases: [
                { name: "Night", start: 21, end: 5, from: "evening", to: "midnight", sun: t=>0, moon: t=>THREE.MathUtils.smoothstep(0.5-t*0.5,0,1), ambient: t=>0.2*(1-t*0.5) },
                { name: "Dawn", start: 5, end: 7, from: "midnight", to: "sunriseStart", sun: t=>THREE.MathUtils.smoothstep(t*0.2,0,1), moon: t=>0.8*(1-THREE.MathUtils.smoothstep(t,0.7,1)), ambient: t=>0.1+THREE.MathUtils.smoothstep(t*0.3,0,1)*0.3 },
                { name: "Morning", start: 7, end: 10, from: "sunriseStart", to: "morning", sun: t=>THREE.MathUtils.smoothstep(t*1.2,0.3,1), moon: t=>0.2*(1-THREE.MathUtils.smoothstep(t,0.8,1)), ambient: t=>0.3+THREE.MathUtils.smoothstep(t*0.8,0,1)*0.3 },
                { name: "Late Morning", start: 10, end: 12, from: "morning", to: "midday", sun: t=>1.0+t*0.5, moon: t=>0, ambient: t=>0.5+t*0.1 },
                { name: "Midday", start: 12, end: 14, from: "midday", to: "midday", sun: t=>1.5-t*0.3, moon: t=>0, ambient: t=>0.6-t*0.1 },
                { name: "Afternoon", start: 14, end: 17, from: "midday", to: "sunsetStart", sun: t=>1.2-t*0.6, moon: t=>0, ambient: t=>0.4-t*0.1 },
                { name: "Evening", start: 17, end: 19, from: "sunsetStart", to: "sunsetPeak", sun: t=>0.6-t*0.6, moon: t=>t*0.8, ambient: t=>0.3+t*0.1 },
                { name: "Dusk", start: 19, end: 21, from: "sunsetPeak", to: "evening", sun: t=>0, moon: t=>0.8-t*0.3, ambient: t=>0.4-t*0.2 }
            ]
        };
    }
    
    /**
     * Create water mesh with model caching
     * @private
     */
    async createWater(createWaterMaterial) {
        // FIXED: Add await for async texture loading
        this.waterMaterial = await createWaterMaterial({
            textureOne: this.assetPaths.waterTexture1,
            textureTwo: this.assetPaths.waterTexture2
        });
        
        try {
            // Load water floor model with caching
            console.log('[OceanBanner] Loading water floor model with cache...');
            const gltf = await this.modelLoader.load(this.assetPaths.roundFloorModel, {
                useCache: true,
                forceRefresh: false
            });
            
            this.waterMesh = gltf.scene;
            this.waterMesh.traverse(child => {
                if (child.isMesh) child.material = this.waterMaterial;
            });
            this.waterMesh.position.y = 0;
            
            // Scale to desired radius
            const box = new this.THREE.Box3().setFromObject(this.waterMesh);
            const size = new this.THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.z) * 0.5;
            const desiredRadius = 3;
            const scaleFactor = maxDim > 0 ? desiredRadius / maxDim : 1;
            this.waterMesh.scale.setScalar(scaleFactor);
            
            // Add to BannerRoot instead of scene
            this.bannerRoot.add(this.waterMesh);
            console.log('[OceanBanner] Water floor model loaded from cache');
        } catch (error) {
            console.error('[OceanBanner] Error loading water model, using fallback:', error);
            const circleGeom = new this.THREE.CircleGeometry(3, 64);
            circleGeom.rotateX(-Math.PI / 2);
            this.waterMesh = new this.THREE.Mesh(circleGeom, this.waterMaterial);
            this.bannerRoot.add(this.waterMesh);
        }
    }
    
    /**
     * Create cloud meshes with model caching
     * @private
     */
    async createClouds(createCloudMaterial) {
        const numClouds = 12;
        const allowedHeights = [1.5, 2.0, 2.5];
        const minDistanceFromCenter = 1.2;
        const maxDistanceRatio = 0.85;
        
        this.cloudPivot = new this.THREE.Object3D();
        // Add cloudPivot to BannerRoot instead of scene
        this.bannerRoot.add(this.cloudPivot);
        
        try {
            // Load cloud model with caching
            console.log('[OceanBanner] Loading cloud model with cache...');
            const gltf = await this.modelLoader.load(this.assetPaths.cloudModel, {
                useCache: true,
                forceRefresh: false
            });
            
            const cloudMeshTemplate = gltf.scene;
            
            for (let i = 0; i < numClouds; i++) {
                // Clone the cached model (much faster than loading again)
                const instance = this.modelLoader.clone(gltf);
                instance.traverse(child => {
                    if (child.isMesh) {
                        child.material = createCloudMaterial();
                    }
                });
                
                const baseHeight = allowedHeights[Math.floor(Math.random() * allowedHeights.length)] + Math.random() * 0.2 - 0.1;
                const maxPossibleDistanceAtHeight = Math.sqrt(this.skyRadius * this.skyRadius - baseHeight * baseHeight);
                const maxAllowedDistance = maxPossibleDistanceAtHeight * maxDistanceRatio - 0.3;
                const distance = this.THREE.MathUtils.lerp(minDistanceFromCenter, Math.max(minDistanceFromCenter, maxAllowedDistance), Math.pow(Math.random(), 2));
                
                const minScale = 0.2, maxScale = 0.4;
                const distanceFactor = (maxAllowedDistance - minDistanceFromCenter > 0) ? (distance - minDistanceFromCenter) / (maxAllowedDistance - minDistanceFromCenter) : 0;
                const scale = this.THREE.MathUtils.lerp(minScale, maxScale, this.THREE.MathUtils.clamp(distanceFactor,0,1));
                
                const angle = Math.random() * Math.PI * 2;
                instance.position.set(Math.cos(angle) * distance, baseHeight, Math.sin(angle) * distance);
                instance.scale.setScalar(scale);
                instance.rotation.y = Math.random() * Math.PI * 2;
                instance.userData = { offset: Math.random() * Math.PI * 2, baseHeight: baseHeight, baseDistance: distance, currentAngle: angle };
                
                this.cloudPivot.add(instance);
            }
            
            console.log(`[OceanBanner] Created ${numClouds} clouds from cached model`);
        } catch (error) {
            console.error('[OceanBanner] Error loading cloud model:', error);
        }
    }
    
    /**
     * Update day/night cycle
     * @private
     */
    updateDayNightCycle() {
        if (!this.timeSystem || this.isDisposed || !this.THREE) return;
        
        const THREE = this.THREE;
        const minutes = this.timeSystem.dayTime;
        const hours = minutes / 60;
        
        let sunIntensity = 0, moonIntensity = 0, ambientIntensity = 0.1;
        let currentLightColor = new THREE.Color(0xffffff);
        let targetSkyColors = this.timeSystem.skyColors.midnight;
        
        // Find current time phase
        for (const phase of this.timeSystem.timePhases) {
            let t = -1;
            if (phase.start < phase.end) {
                if (hours >= phase.start && hours < phase.end) {
                    t = (hours - phase.start) / (phase.end - phase.start);
                }
            } else {
                if (hours >= phase.start || hours < phase.end) {
                    if (hours >= phase.start) {
                        t = (hours - phase.start) / (24 - phase.start + phase.end);
                    } else {
                        t = (24 - phase.start + hours) / (24 - phase.start + phase.end);
                    }
                }
            }
            
            if (t !== -1) {
                t = THREE.MathUtils.clamp(t, 0, 1);
                targetSkyColors = {
                    top: new THREE.Color().lerpColors(this.timeSystem.skyColors[phase.from].top, this.timeSystem.skyColors[phase.to].top, t),
                    middle: new THREE.Color().lerpColors(this.timeSystem.skyColors[phase.from].middle, this.timeSystem.skyColors[phase.to].middle, t),
                    bottom: new THREE.Color().lerpColors(this.timeSystem.skyColors[phase.from].bottom, this.timeSystem.skyColors[phase.to].bottom, t)
                };
                sunIntensity = phase.sun(t);
                moonIntensity = phase.moon(t);
                ambientIntensity = phase.ambient(t);
                break;
            }
        }
        
        this.timeSystem.currentSkyColors = targetSkyColors;
        
        // Update sky material
        if (this.skyMaterial && this.skyMaterial.uniforms) {
            this.skyMaterial.uniforms.topColor.value.copy(targetSkyColors.top);
            this.skyMaterial.uniforms.middleColor.value.copy(targetSkyColors.middle);
            this.skyMaterial.uniforms.bottomColor.value.copy(targetSkyColors.bottom);
        }
        
        // Update lights
        this.mainLight.intensity = sunIntensity;
        this.mainLight.color.copy(currentLightColor);
        
        const sunAngle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;
        const sunOrbitRadius = this.skyRadius * 0.8;
        this.timeSystem.sunPosition.set(0, Math.sin(sunAngle) * sunOrbitRadius + sunOrbitRadius*0.1, Math.cos(sunAngle) * sunOrbitRadius);
        this.mainLight.position.copy(this.timeSystem.sunPosition);
        
        this.moonLight.intensity = moonIntensity;
        const moonAngle = sunAngle + Math.PI;
        this.timeSystem.moonPosition.set(0, Math.sin(moonAngle) * sunOrbitRadius * 0.9 + sunOrbitRadius*0.1, Math.cos(moonAngle) * sunOrbitRadius * 0.9);
        this.moonLight.position.copy(this.timeSystem.moonPosition);
        
        this.ambientLight.intensity = ambientIntensity;
        this.hemiLight.intensity = ambientIntensity * 0.5;
        
        // Update water material
        if (this.waterMaterial && this.waterMaterial.uniforms) {
            this.waterMaterial.uniforms.sunDirection.value.copy(this.mainLight.position).normalize();
            this.waterMaterial.uniforms.moonDirection.value.copy(this.moonLight.position).normalize();
            this.waterMaterial.uniforms.lightIntensity.value = sunIntensity;
            this.waterMaterial.uniforms.lightColor.value.copy(this.mainLight.color);
            this.waterMaterial.uniforms.ambientIntensity.value = ambientIntensity;
        }
        
        // Update cloud materials
        if (this.cloudPivot) {
            this.cloudPivot.children.forEach(cloud => {
                if (cloud.isObject3D) {
                    cloud.traverse(child => {
                        if (child.isMesh && child.material && child.material.uniforms) {
                            child.material.uniforms.lightIntensity.value = sunIntensity + moonIntensity * 0.5 + ambientIntensity * 0.3;
                            child.material.uniforms.lightColor.value.copy(currentLightColor);
                        }
                    });
                }
            });
        }
    }
    
    /**
     * Animation loop
     * @override
     */
    animate() {
        if (!this.clock || this.isDisposed || !this.THREE) return;
        
        const timeSeconds = this.clock.getElapsedTime();
        const deltaTimeSeconds = timeSeconds - this.lastTime;
        
        if (deltaTimeSeconds > 0 && deltaTimeSeconds < 1) {
            // Update time
            const deltaMinutes = deltaTimeSeconds * this.timeSystem.timeSpeed;
            this.timeSystem.globalTime += deltaMinutes;
            this.timeSystem.dayTime = this.timeSystem.globalTime % 1440;
            if (this.timeSystem.dayTime < 0) this.timeSystem.dayTime += 1440;
            
            // Update day/night cycle
            this.updateDayNightCycle();
            
            // Update water time
            if (this.waterMaterial && this.waterMaterial.uniforms) {
                this.waterMaterial.uniforms.time.value = timeSeconds;
            }
            
            // Rotate and animate clouds
            if (this.cloudPivot) {
                this.cloudPivot.rotation.y += 0.0001 * deltaTimeSeconds * 60;
                
                this.cloudPivot.children.forEach(cloud => {
                    if (cloud.userData && cloud.userData.baseDistance !== undefined) {
                        const individualSpeedFactor = 0.0002 + (cloud.userData.offset - Math.PI) * 0.00005;
                        cloud.userData.currentAngle += individualSpeedFactor * deltaTimeSeconds * 60;
                        
                        const heightOffset = Math.sin(timeSeconds * 0.2 + cloud.userData.offset) * 0.05;
                        const distanceOffset = Math.sin(timeSeconds * 0.15 + cloud.userData.offset) * 0.03;
                        
                        cloud.position.set(
                            Math.cos(cloud.userData.currentAngle) * (cloud.userData.baseDistance + distanceOffset),
                            cloud.userData.baseHeight + heightOffset,
                            Math.sin(cloud.userData.currentAngle) * (cloud.userData.baseDistance + distanceOffset)
                        );
                        cloud.rotation.y += 0.0005 * deltaTimeSeconds * 60;
                    }
                });
            }
        }
        
        this.lastTime = timeSeconds;
    }
    
    /**
     * Cleanup ocean banner resources
     * @override
     */
    cleanup() {
        console.log('[OceanBanner] Cleaning up ocean banner resources');
        
        // Dispose models using ModelLoader
        if (this.modelLoader) {
            if (this.waterMesh) {
                this.modelLoader.dispose(this.waterMesh);
            }
            
            // Dispose all cloud instances
            if (this.cloudPivot) {
                this.cloudPivot.children.forEach(cloud => {
                    this.modelLoader.dispose(cloud);
                });
            }
            
            // Clear memory cache (IndexedDB cache persists)
            this.modelLoader.clearMemoryCache(this.assetPaths.roundFloorModel);
            this.modelLoader.clearMemoryCache(this.assetPaths.cloudModel);
        }
        
        // Dispose materials
        if (this.skyMaterial) {
            this.skyMaterial.dispose();
            this.skyMaterial = null;
        }
        
        if (this.waterMaterial) {
            this.waterMaterial.dispose();
            this.waterMaterial = null;
        }
        
        // Clear references
        this.mainLight = null;
        this.ambientLight = null;
        this.moonLight = null;
        this.hemiLight = null;
        this.skyMesh = null;
        this.waterMesh = null;
        this.cloudPivot = null;
        this.clock = null;
        this.timeSystem = null;
        this.THREE = null;
        this.modelLoader = null;
        
        // Call parent cleanup
        super.cleanup();
    }
}

// Export function for backward compatibility with function-based banner loading
export async function createBannerScene(canvasElement, assetPaths) {
    // Create a container for the banner if canvasElement is a canvas
    let container;
    if (canvasElement.tagName === 'CANVAS') {
        container = canvasElement.parentElement || document.createElement('div');
    } else {
        container = canvasElement;
    }
    
    const appData = { id: 'ocean-demo' };
    const banner = new OceanBanner(container, appData);
    await banner.init();
    
    return {
        scene: banner.scene,
        camera: banner.camera,
        renderer: banner.renderer,
        timeSystem: banner.timeSystem,
        updateDayNightCycle: () => banner.updateDayNightCycle(),
        dispose: () => banner.cleanup(),
        banner
    };
}
