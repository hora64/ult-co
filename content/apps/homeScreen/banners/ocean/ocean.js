// banners/ocean.js
// This file creates a Three.js ocean scene.
// It's designed to be loaded as a banner for an application.

// Static imports are removed from here. They will be dynamically imported within createOceanScene.

export async function createOceanScene(canvasElement, assetPaths = {}) {
    if (!canvasElement) {
        console.error("Canvas element is required for createOceanScene.");
        return null;
    }

    // --- Dynamic Imports ---
    // Three.js core and add-ons from CDN
    const THREE = await import('three'); // Using bare specifier from importmap
    const { GLTFLoader } = await import('GLTFLoader');

    // Local shader modules (assuming they are in a './shaders/' directory relative to this script or the HTML)
    // The paths here assume the HTML file importing this script is in a location where './shaders/' is a valid relative path.
    // If this script itself is in a different directory, adjust paths accordingly or ensure the server resolves them.
    // These will be placeholder imports if the actual files are not available.
    let createSkyMaterial, createWaterMaterial, createCloudMaterial;
    try {
        const skyModule = await import('./shaders/skyMaterial.js');
        createSkyMaterial = skyModule.createSkyMaterial;
    } catch (e) {
        console.warn("Could not load skyMaterial.js. Sky will not render correctly.", e);
        createSkyMaterial = () => new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
    }
    try {
        const waterModule = await import('./shaders/waterMaterial.js');
        createWaterMaterial = waterModule.createWaterMaterial;
    } catch (e) {
        console.warn("Could not load waterMaterial.js. Water will not render correctly.", e);
        createWaterMaterial = () => new THREE.MeshBasicMaterial({ color: 0x0077BE, transparent: true, opacity: 0.8 });
    }
    try {
        const cloudModule = await import('./shaders/cloudMaterial.js');
        createCloudMaterial = cloudModule.createCloudMaterial;
    } catch (e) {
        console.warn("Could not load cloudMaterial.js. Clouds will not render correctly.", e);
        createCloudMaterial = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    }


    const defaults = {
        roundFloorModel: 'banners/ocean/models/roundFloor.glb', // Ensure this path is correct relative to your HTML/server setup
        cloudModel: 'banners/ocean/models/Cloud-1.glb'      // Ensure this path is correct
    };
    const paths = { ...defaults, ...assetPaths };

    // --- Scene Variables ---
    let scene, camera, renderer, controls;
    let mainLight, ambientLight, moonLight, hemiLight;
    let skyMaterialInstance, waterMatInstance; // Instances of materials
    let cloudPivot;
    let timeSystem;
    const skyRadius = 3.0;
    let lastTime = 0;
    const debugHelpers = [];
    const rainCount = 5000;
    const positions = [];
    let animationFrameId; // For cancelling animation loop

    // Intervals for cleanup
    let bloodMoonFadeInInterval, bloodMoonFadeOutInterval;
    let rainFadeInInterval, rainFadeOutInterval;


    // Scene Setup
    const width = canvasElement.clientWidth || 400; // Use canvasElement dimensions
    const height = canvasElement.clientHeight || 240;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 1000);
camera.position.set(0, 1, 4.5); 
camera.lookAt(0, 1, -4.5); // 1. Camera tries to look at (0,3,5) FROM ITS CURRENT POSITION (which is 0,0,0 by default)

    renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        antialias: true,
        alpha: true // Important for transparency if canvas is overlaid
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // For sharper rendering
    renderer.setClearColor(0xffffff, 0);
    /*
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI * 0.49;
*/
    // Lighting Setup
    mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene.add(mainLight);
    ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    moonLight = new THREE.DirectionalLight(0xbbddff, 0);
    scene.add(moonLight);
    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444422, 0.2);
    scene.add(hemiLight);

    // Time System Configuration
    timeSystem = {
        globalTime: 0,
        dayTime: 720,
        manualTime: false,
        timeSpeed: 60,
        sunPosition: new THREE.Vector3(0, 5, 10),
        moonPosition: new THREE.Vector3(0, 5, -10),
        settings: {
            enableVisualEffects: true
        },
        weatherEffects: {
            rain: { active: false, intensity: 0, particles: null },
            bloodMoon: { active: false, intensity: 0 }
        },
        skyColors: { // Ensure THREE.Color instances
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
            { name: "Night", start: 21, end: 5, from: "evening", to: "midnight", sun: t=>0, moon: t=>THREE.MathUtils.smoothstep(0.5-t*0.5,0,1), ambient: t=>0.2*(1-t*0.5), hsl: t=>[0.55+t*0.05,0.3*(1-t*0.3),0.5*(1-t*0.6)] },
            { name: "Dawn", start: 5, end: 7, from: "midnight", to: "sunriseStart", sun: t=>THREE.MathUtils.smoothstep(t*0.2,0,1), moon: t=>0.8*(1-THREE.MathUtils.smoothstep(t,0.7,1)), ambient: t=>0.1+THREE.MathUtils.smoothstep(t*0.3,0,1)*0.3, hsl: t=>[0.6-t*0.1,0.3+t*0.2,0.5+t*0.3] },
            { name: "Morning", start: 7, end: 10, from: "sunriseStart", to: "morning", sun: t=>THREE.MathUtils.smoothstep(t*1.2,0.3,1), moon: t=>0.2*(1-THREE.MathUtils.smoothstep(t,0.8,1)), ambient: t=>0.3+THREE.MathUtils.smoothstep(t*0.8,0,1)*0.3, hsl: t=>[0.1+t*0.07,0.7-t*0.2,0.7+t*0.2] },
            { name: "Late Morning", start: 10, end: 12, from: "morning", to: "midday", sun: t=>1.0+t*0.5, moon: t=>0, ambient: t=>0.5+t*0.1, hsl: t=>[0.15+t*0.03,0.55-t*0.15,0.85+t*0.05] },
            { name: "Midday", start: 12, end: 14, from: "midday", to: "midday", sun: t=>1.5-t*0.3, moon: t=>0, ambient: t=>0.6-t*0.1, hsl: t=>[0.18,0.4,0.9] },
            { name: "Afternoon", start: 14, end: 17, from: "midday", to: "sunsetStart", sun: t=>1.2-t*0.6, moon: t=>0, ambient: t=>0.4-t*0.1, hsl: t=>[0.15+t*0.05,0.5+t*0.1,0.9-t*0.2] },
            { name: "Evening", start: 17, end: 19, from: "sunsetStart", to: "sunsetPeak", sun: t=>0.6-t*0.6, moon: t=>t*0.8, ambient: t=>0.3+t*0.1, hsl: t=>[0.2+t*0.05,0.6+t*0.2,0.7-t*0.3] },
            { name: "Dusk", start: 19, end: 21, from: "sunsetPeak", to: "evening", sun: t=>0, moon: t=>0.8-t*0.3, ambient: t=>0.4-t*0.2, hsl: t=>[0.6-t*0.1,0.5-t*0.2,0.4+t*0.1] }
        ],
        updateTime: function(deltaMinutes) {
            this.globalTime += deltaMinutes;
            this.dayTime = this.globalTime % 1440;
            if (this.dayTime < 0) this.dayTime += 1440;

            // These DOM interactions should ideally be handled outside this core logic,
            // or via callbacks, if this scene is to be more reusable.
            const globalTimeDisplayEl = document.getElementById('globalTimeDisplay');
            if (globalTimeDisplayEl) globalTimeDisplayEl.textContent = Math.floor(this.globalTime);

            const timeSliderEl = document.getElementById('timeSlider');
            if (timeSliderEl && this.manualTime === false) timeSliderEl.value = this.dayTime;

            if (Math.floor(this.globalTime / 1440) % 7 === 6 && this.dayTime >= 0 && this.dayTime < 30) {
                if (!this.weatherEffects.bloodMoon.active && this.settings.enableVisualEffects) {
                    this.weatherEffects.bloodMoon.active = true;
                    this.weatherEffects.bloodMoon.intensity = 0;
                    clearInterval(bloodMoonFadeInInterval); // Clear previous interval
                    bloodMoonFadeInInterval = setInterval(() => {
                        this.weatherEffects.bloodMoon.intensity += 0.05;
                        if (this.weatherEffects.bloodMoon.intensity >= 1) {
                            this.weatherEffects.bloodMoon.intensity = 1;
                            clearInterval(bloodMoonFadeInInterval);
                        }
                    }, 50);
                    const eventNotificationEl = document.getElementById('eventNotification');
                    if (eventNotificationEl && timeSystem.settings.enableVisualEffects) {
                        const iconEl = eventNotificationEl.querySelector('.event-icon');
                        const textEl = eventNotificationEl.querySelector('.event-text');
                        if (iconEl) iconEl.textContent = "🌕";
                        if (textEl) textEl.textContent = "A Blood Moon Rises!";
                        const bloodMoonColor = new THREE.Color(0.8,0.1,0.1);
                        eventNotificationEl.style.color = `rgb(${Math.floor(bloodMoonColor.r*255)}, ${Math.floor(bloodMoonColor.g*255)}, ${Math.floor(bloodMoonColor.b*255)})`;
                        eventNotificationEl.classList.add('show');
                        setTimeout(() => { eventNotificationEl.classList.remove('show'); }, 3000);
                    }
                }
            } else {
                if (this.weatherEffects.bloodMoon.active) {
                    clearInterval(bloodMoonFadeOutInterval); // Clear previous interval
                     bloodMoonFadeOutInterval = setInterval(() => {
                        this.weatherEffects.bloodMoon.intensity -= 0.05;
                        if (this.weatherEffects.bloodMoon.intensity <= 0) {
                            this.weatherEffects.bloodMoon.intensity = 0;
                            this.weatherEffects.bloodMoon.active = false;
                            clearInterval(bloodMoonFadeOutInterval);
                        }
                    }, 50);
                }
            }
        }
    };
    mainLight.position.copy(timeSystem.sunPosition);
    moonLight.position.copy(timeSystem.moonPosition);

    // Sky Setup
    skyMaterialInstance = createSkyMaterial(timeSystem, skyRadius);
    const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(skyRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), skyMaterialInstance);
    scene.add(skyMesh);


    // Water Setup
    waterMatInstance = createWaterMaterial();
    const gltfLoader = new GLTFLoader();
    let waterMesh;
    try {
        const gltf = await gltfLoader.loadAsync(paths.roundFloorModel);
        waterMesh = gltf.scene;
        waterMesh.traverse(child => { if (child.isMesh) child.material = waterMatInstance; });
        waterMesh.position.y = 0;
        const box = new THREE.Box3().setFromObject(waterMesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.z) * 0.5;
        const desiredRadius = 3;
        const scaleFactor = maxDim > 0 ? desiredRadius / maxDim : 1;
        waterMesh.scale.setScalar(scaleFactor);
        scene.add(waterMesh);
    } catch (error) {
        console.error('Error loading water GLTF model, using fallback circle:', error);
        const circleGeom = new THREE.CircleGeometry(3, 64);
        circleGeom.rotateX(-Math.PI / 2);
        waterMesh = new THREE.Mesh(circleGeom, waterMatInstance);
        scene.add(waterMesh);
    }


    // Clouds Setup
    const numClouds = 12;
    const allowedHeights = [1.5, 2.0, 2.5];
    const minDistanceFromCenter = 1.2;
    const maxDistanceRatio = 0.85;
    cloudPivot = new THREE.Object3D();
    scene.add(cloudPivot);

    try {
        const gltf = await gltfLoader.loadAsync(paths.cloudModel);
        const cloudMeshTemplate = gltf.scene;
        for (let i = 0; i < numClouds; i++) {
            const instance = cloudMeshTemplate.clone(true);
            instance.traverse(child => {
                if (child.isMesh) {
                    child.material = createCloudMaterial();
                }
            });

            const baseHeight = allowedHeights[Math.floor(Math.random() * allowedHeights.length)] + Math.random() * 0.2 - 0.1;
            const maxPossibleDistanceAtHeight = Math.sqrt(skyRadius * skyRadius - baseHeight * baseHeight);
            const maxAllowedDistance = maxPossibleDistanceAtHeight * maxDistanceRatio - 0.3;
            const distance = THREE.MathUtils.lerp(minDistanceFromCenter, Math.max(minDistanceFromCenter, maxAllowedDistance), Math.pow(Math.random(), 2));

            const minScale = 0.2, maxScale = 0.4;
            const distanceFactor = (maxAllowedDistance - minDistanceFromCenter > 0) ? (distance - minDistanceFromCenter) / (maxAllowedDistance - minDistanceFromCenter) : 0;
            const scale = THREE.MathUtils.lerp(minScale, maxScale, THREE.MathUtils.clamp(distanceFactor,0,1));

            const angle = Math.random() * Math.PI * 2;
            instance.position.set(Math.cos(angle) * distance, baseHeight, Math.sin(angle) * distance);
            instance.scale.setScalar(scale);
            instance.rotation.y = Math.random() * Math.PI * 2;
            instance.userData = { offset: Math.random() * Math.PI * 2, baseHeight: baseHeight, baseDistance: distance, currentAngle: angle };
            cloudPivot.add(instance);
        }
    } catch (error) {
        console.error('Error loading cloud GLTF model:', error);
    }


    // Debug Sun Path (Optional)
    const sunPathPoints = [];
    for (let i = 0; i <= 24; i++) {
        const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const R = skyRadius * 0.8;
        sunPathPoints.push(new THREE.Vector3(0, Math.sin(angle) * R + R*0.1 , Math.cos(angle) * R));
    }
    const sunPathGeometry = new THREE.BufferGeometry().setFromPoints(sunPathPoints);
    const debugSunPath = new THREE.Line(sunPathGeometry, new THREE.LineBasicMaterial({ color: 0xffff00 }));
    debugSunPath.name = "debugSunPath";
    debugSunPath.visible = false;
    scene.add(debugSunPath);
    debugHelpers.push(debugSunPath);

    // --- UI Element References (External to this scene, but used for updates) ---
    // These should ideally be passed in or handled via callbacks for better encapsulation
    const timeSliderEl = document.getElementById('timeSlider');
    const clockDisplayEl = document.getElementById('clockDisplay');
    const timeDisplayEl = document.getElementById('timeDisplay');
    const customSpeedInputEl = document.getElementById('customSpeed');
    const speedButtonElements = document.querySelectorAll('.speed-btn');
    const settingsPanelEl = document.getElementById('settingsPanel');
    const settingsToggleEl = document.getElementById('settingsToggle');
    const enableVisualEffectsCheckboxEl = document.getElementById('enableVisualEffects');
    const toggleRainCheckboxEl = document.getElementById('toggleRain');
    const toggleBloodMoonCheckboxEl = document.getElementById('toggleBloodMoon');
    const resetGlobalTimeBtnEl = document.getElementById('resetGlobalTime');
    const debugToggleEl = document.getElementById('debugToggle');
    const globalTimeDisplayEl = document.getElementById('globalTimeDisplay');

    // --- Event Listener Functions (to be added and removed in init/dispose) ---
    const onSpeedButtonClick = (event) => {
        speedButtonElements.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        const speed = parseInt(event.currentTarget.dataset.speed);
        timeSystem.timeSpeed = speed;
        timeSystem.manualTime = speed === 0;
        if(customSpeedInputEl) customSpeedInputEl.value = speed;
    };
    const onCustomSpeedChange = () => {
        const speed = parseInt(customSpeedInputEl.value);
        if (!isNaN(speed)) {
            timeSystem.timeSpeed = speed;
            speedButtonElements.forEach(btn => btn.classList.remove('active'));
            const matchingPreset = Array.from(speedButtonElements).find(b => parseInt(b.dataset.speed) === speed);
            if(matchingPreset) matchingPreset.classList.add('active');
            timeSystem.manualTime = speed === 0;
        }
    };
    const onTimeSliderInput = (e) => {
        timeSystem.manualTime = true;
        speedButtonElements.forEach(btn => btn.classList.remove('active'));
        const pauseButton = Array.from(speedButtonElements).find(b => parseInt(b.dataset.speed) === 0);
        if(pauseButton) pauseButton.classList.add('active');
        if(customSpeedInputEl) customSpeedInputEl.value = 0;
        timeSystem.timeSpeed = 0;
        timeSystem.dayTime = parseInt(e.target.value);
        timeSystem.globalTime = Math.floor(timeSystem.globalTime / 1440) * 1440 + timeSystem.dayTime;
        updateDayNightCycle();
    };
    const onDebugToggleClick = () => {
        debugHelpers.forEach(helper => helper.visible = !helper.visible);
    };
    const onSettingsToggleClick = () => {
        if (settingsPanelEl) settingsPanelEl.style.display = settingsPanelEl.style.display === 'block' ? 'none' : 'block';
    };
    const onEnableVisualEffectsChange = (e) => { timeSystem.settings.enableVisualEffects = e.target.checked; };
    const onToggleRainChange = (e) => {
        timeSystem.weatherEffects.rain.active = e.target.checked;
        if (e.target.checked) {
            if (!timeSystem.weatherEffects.rain.particles) createRainParticles();
            if (timeSystem.weatherEffects.rain.particles && !scene.children.includes(timeSystem.weatherEffects.rain.particles)) {
                 scene.add(timeSystem.weatherEffects.rain.particles);
            }
            let currentIntensity = timeSystem.weatherEffects.rain.intensity;
            clearInterval(rainFadeInInterval); // Clear previous interval
            rainFadeInInterval = setInterval(() => {
                currentIntensity += 0.05;
                timeSystem.weatherEffects.rain.intensity = Math.min(currentIntensity, 1.0);
                if (timeSystem.weatherEffects.rain.intensity >= 1.0) clearInterval(rainFadeInInterval);
            }, 50);
        } else {
            let currentIntensity = timeSystem.weatherEffects.rain.intensity;
            clearInterval(rainFadeOutInterval); // Clear previous interval
            rainFadeOutInterval = setInterval(() => {
                currentIntensity -= 0.05;
                timeSystem.weatherEffects.rain.intensity = Math.max(currentIntensity, 0.0);
                if (timeSystem.weatherEffects.rain.intensity <= 0.0) {
                    clearInterval(rainFadeOutInterval);
                    if (timeSystem.weatherEffects.rain.particles) scene.remove(timeSystem.weatherEffects.rain.particles);
                }
            }, 50);
        }
    };
    const onToggleBloodMoonChange = (e) => {
        if (e.target.checked) {
            timeSystem.globalTime = (Math.floor(timeSystem.globalTime / 1440) + 6) * 1440;
            timeSystem.updateTime(0.1);
        } else {
            timeSystem.weatherEffects.bloodMoon.active = false;
            timeSystem.weatherEffects.bloodMoon.intensity = 0;
        }
        updateDayNightCycle();
    };
    const onResetGlobalTimeClick = () => {
        timeSystem.globalTime = 720;
        timeSystem.dayTime = 720;
        if (timeSliderEl) timeSliderEl.value = timeSystem.dayTime;
        if (globalTimeDisplayEl) globalTimeDisplayEl.textContent = Math.floor(timeSystem.globalTime);
        timeSystem.weatherEffects.rain.active = false;
        timeSystem.weatherEffects.rain.intensity = 0;
        if(toggleRainCheckboxEl) toggleRainCheckboxEl.checked = false;
        if (timeSystem.weatherEffects.rain.particles) scene.remove(timeSystem.weatherEffects.rain.particles);

        timeSystem.weatherEffects.bloodMoon.active = false;
        timeSystem.weatherEffects.bloodMoon.intensity = 0;
        if(toggleBloodMoonCheckboxEl) toggleBloodMoonCheckboxEl.checked = false;
        updateDayNightCycle();
    };

    function setupExternalEventListeners() {
        if (speedButtonElements.length) speedButtonElements.forEach(button => button.addEventListener('click', onSpeedButtonClick));
        if (customSpeedInputEl) customSpeedInputEl.addEventListener('change', onCustomSpeedChange);
        if (timeSliderEl) timeSliderEl.addEventListener('input', onTimeSliderInput);
        if (debugToggleEl) debugToggleEl.addEventListener('click', onDebugToggleClick);
        if (settingsToggleEl && settingsPanelEl) settingsToggleEl.addEventListener('click', onSettingsToggleClick);
        if (enableVisualEffectsCheckboxEl) enableVisualEffectsCheckboxEl.addEventListener('change', onEnableVisualEffectsChange);
        if (toggleRainCheckboxEl) toggleRainCheckboxEl.addEventListener('change', onToggleRainChange);
        if (toggleBloodMoonCheckboxEl) toggleBloodMoonCheckboxEl.addEventListener('change', onToggleBloodMoonChange);
        if (resetGlobalTimeBtnEl) resetGlobalTimeBtnEl.addEventListener('click', onResetGlobalTimeClick);
    }

    function removeExternalEventListeners() {
        if (speedButtonElements.length) speedButtonElements.forEach(button => button.removeEventListener('click', onSpeedButtonClick));
        if (customSpeedInputEl) customSpeedInputEl.removeEventListener('change', onCustomSpeedChange);
        if (timeSliderEl) timeSliderEl.removeEventListener('input', onTimeSliderInput);
        if (debugToggleEl) debugToggleEl.removeEventListener('click', onDebugToggleClick);
        if (settingsToggleEl && settingsPanelEl) settingsToggleEl.removeEventListener('click', onSettingsToggleClick);
        if (enableVisualEffectsCheckboxEl) enableVisualEffectsCheckboxEl.removeEventListener('change', onEnableVisualEffectsChange);
        if (toggleRainCheckboxEl) toggleRainCheckboxEl.removeEventListener('change', onToggleRainChange);
        if (toggleBloodMoonCheckboxEl) toggleBloodMoonCheckboxEl.removeEventListener('change', onToggleBloodMoonChange);
        if (resetGlobalTimeBtnEl) resetGlobalTimeBtnEl.removeEventListener('click', onResetGlobalTimeClick);
    }


    // --- Utility Functions ---
    function formatTime(minutes) {
        const totalMinutes = Math.floor(minutes);
        const hours = Math.floor(totalMinutes / 60) % 24;
        const mins = totalMinutes % 60;
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        const ampm = hours < 12 || hours === 24 ? 'AM' : 'PM';
        return `${hour12}:${mins.toString().padStart(2, '0')} ${ampm}`;
    }

    function getTimeDescription(minutes) {
        const hours = minutes / 60;
        for (const phase of timeSystem.timePhases) {
            if (phase.start < phase.end) { if (hours >= phase.start && hours < phase.end) return phase.name; }
            else { if (hours >= phase.start || hours < phase.end) return phase.name; }
        }
        return "Unknown";
    }

    function createRainParticles() {
        if (timeSystem.weatherEffects.rain.particles) {
            scene.remove(timeSystem.weatherEffects.rain.particles);
            timeSystem.weatherEffects.rain.particles.geometry.dispose();
            timeSystem.weatherEffects.rain.particles.material.dispose();
        }

        const rainGeometry = new THREE.BufferGeometry();
        positions.length = 0;
        for (let i = 0; i < rainCount; i++) {
            positions.push(
                Math.random() * 10 - 5,
                Math.random() * 10,
                Math.random() * 10 - 5
            );
        }
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.02,
            transparent: true,
            opacity: 0.7
        });
        timeSystem.weatherEffects.rain.particles = new THREE.Points(rainGeometry, rainMaterial);
    }

    // --- Main Update Function ---
    function updateDayNightCycle() {
        const minutes = timeSystem.dayTime;
        const hours = minutes / 60;

        if (clockDisplayEl) clockDisplayEl.textContent = formatTime(minutes);
        if (timeDisplayEl) timeDisplayEl.textContent = getTimeDescription(minutes);

        let sunIntensity = 0, moonIntensity = 0, ambientIntensity = 0.1;
        let currentLightColor = new THREE.Color(0xffffff);
        let targetSkyColors = timeSystem.skyColors.midnight;

        for (const phase of timeSystem.timePhases) {
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
                    top: new THREE.Color().lerpColors(timeSystem.skyColors[phase.from].top, timeSystem.skyColors[phase.to].top, t),
                    middle: new THREE.Color().lerpColors(timeSystem.skyColors[phase.from].middle, timeSystem.skyColors[phase.to].middle, t),
                    bottom: new THREE.Color().lerpColors(timeSystem.skyColors[phase.from].bottom, timeSystem.skyColors[phase.to].bottom, t)
                };
                sunIntensity = phase.sun(t);
                moonIntensity = phase.moon(t);
                ambientIntensity = phase.ambient(t);
                currentLightColor.setHSL(...phase.hsl(t));
                break;
            }
        }

        timeSystem.currentSkyColors = targetSkyColors;

        if (timeSystem.weatherEffects.bloodMoon.active && timeSystem.weatherEffects.bloodMoon.intensity > 0) {
            const bloodMoonEffect = timeSystem.weatherEffects.bloodMoon.intensity;
            const bloodRed = new THREE.Color(0.7, 0.05, 0.05);
            timeSystem.currentSkyColors.top.lerp(bloodRed, bloodMoonEffect * 0.8);
            timeSystem.currentSkyColors.middle.lerp(bloodRed, bloodMoonEffect * 0.6);
            timeSystem.currentSkyColors.bottom.lerp(new THREE.Color(0.3,0.0,0.0), bloodMoonEffect*0.7);

            currentLightColor.lerp(new THREE.Color(1.0, 0.2, 0.2), bloodMoonEffect * 0.6);
            moonLight.color.setRGB(1.0, 0.3, 0.3);
            moonIntensity = Math.max(moonIntensity, 0.6 * bloodMoonEffect);
            sunIntensity *= (1.0 - bloodMoonEffect * 0.7);
            ambientIntensity = Math.max(0.05, ambientIntensity * (1.0 - bloodMoonEffect * 0.5));
        } else {
             moonLight.color.setHSL(0.6, 0.3, 0.5);
        }

        if (skyMaterialInstance && skyMaterialInstance.uniforms) {
            skyMaterialInstance.uniforms.topColor.value.copy(timeSystem.currentSkyColors.top);
            skyMaterialInstance.uniforms.middleColor.value.copy(timeSystem.currentSkyColors.middle);
            skyMaterialInstance.uniforms.bottomColor.value.copy(timeSystem.currentSkyColors.bottom);
        }

        mainLight.intensity = sunIntensity;
        mainLight.color.copy(currentLightColor);
        const sunAngle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;
        const sunOrbitRadius = skyRadius * 0.8;
        timeSystem.sunPosition.set(0, Math.sin(sunAngle) * sunOrbitRadius + sunOrbitRadius*0.1, Math.cos(sunAngle) * sunOrbitRadius);
        mainLight.position.copy(timeSystem.sunPosition);
        if(debugSunPath) debugSunPath.rotation.x = sunAngle + Math.PI/2;


        moonLight.intensity = moonIntensity;
        const moonAngle = sunAngle + Math.PI;
        timeSystem.moonPosition.set(0, Math.sin(moonAngle) * sunOrbitRadius * 0.9 + sunOrbitRadius*0.1, Math.cos(moonAngle) * sunOrbitRadius * 0.9);
        moonLight.position.copy(timeSystem.moonPosition);

        ambientLight.intensity = ambientIntensity;
        hemiLight.intensity = ambientIntensity * 0.5;

        if (waterMatInstance && waterMatInstance.uniforms) {
            waterMatInstance.uniforms.sunDirection.value.copy(mainLight.position).normalize();
            waterMatInstance.uniforms.moonDirection.value.copy(moonLight.position).normalize();
            waterMatInstance.uniforms.lightIntensity.value = sunIntensity;
            waterMatInstance.uniforms.lightColor.value.copy(mainLight.color);
            waterMatInstance.uniforms.ambientIntensity.value = ambientIntensity;
            waterMatInstance.uniforms.rainIntensity.value = timeSystem.weatherEffects.rain.intensity;
             if (timeSystem.weatherEffects.bloodMoon.active && timeSystem.weatherEffects.bloodMoon.intensity > 0) {
                waterMatInstance.uniforms.lightColor.value.lerp(new THREE.Color(1.0, 0.3, 0.3), timeSystem.weatherEffects.bloodMoon.intensity * 0.5);
            }
        }

        cloudPivot.children.forEach(cloud => {
            if (cloud.isObject3D) {
                cloud.traverse(child => {
                    if (child.isMesh && child.material && child.material.uniforms) {
                        child.material.uniforms.lightIntensity.value = sunIntensity + moonIntensity * 0.5 + ambientIntensity * 0.3;
                        child.material.uniforms.lightColor.value.copy(currentLightColor);
                        child.material.uniforms.rainIntensity.value = timeSystem.weatherEffects.rain.intensity;
                        if (timeSystem.weatherEffects.bloodMoon.active && timeSystem.weatherEffects.bloodMoon.intensity > 0) {
                             child.material.uniforms.lightColor.value.lerp(new THREE.Color(1.0, 0.3, 0.3), timeSystem.weatherEffects.bloodMoon.intensity * 0.4);
                        }
                    }
                });
            }
        });
    }

    // --- Animation Loop ---
    function animate(t) {
        animationFrameId = requestAnimationFrame(animate); // Store the frame ID
        const timeSeconds = t * 0.001;
        const deltaTimeSeconds = timeSeconds - lastTime;

        if (!timeSystem.manualTime && timeSystem.timeSpeed > 0 && deltaTimeSeconds > 0 && deltaTimeSeconds < 1) {
            const deltaMinutes = deltaTimeSeconds * timeSystem.timeSpeed;
            timeSystem.updateTime(deltaMinutes);
        }

        updateDayNightCycle();

        if (waterMatInstance && waterMatInstance.uniforms) waterMatInstance.uniforms.time.value = timeSeconds;

        cloudPivot.rotation.y += 0.0001 * deltaTimeSeconds * 60;
        cloudPivot.children.forEach(cloud => {
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

        if (timeSystem.weatherEffects.rain.active && timeSystem.weatherEffects.rain.particles) {
            const positionsAttribute = timeSystem.weatherEffects.rain.particles.geometry.attributes.position;
            for (let i = 0; i < positionsAttribute.count; i++) {
                positionsAttribute.setY(i, positionsAttribute.getY(i) - 0.1 * deltaTimeSeconds * 60);
                if (positionsAttribute.getY(i) < -1) {
                    positionsAttribute.setY(i, 10 + Math.random()*2);
                    positionsAttribute.setX(i, Math.random() * 10 - 5);
                    positionsAttribute.setZ(i, Math.random() * 10 - 5);
                }
            }
            positionsAttribute.needsUpdate = true;
        }

        //controls.update();
        renderer.render(scene, camera);
        lastTime = timeSeconds;
    }

    // --- Dispose Function ---
function dispose() {
    console.log("Disposing ocean scene with 0.3s scale animation...");
    cancelAnimationFrame(animationFrameId);

    const scaleDownDuration = 1.0; // 300ms
    const startTime = performance.now() / 1000; // Current time in seconds

    const animateScaleDown = () => {
        const currentTime = performance.now() / 1000;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scaleDownDuration, 1); // Clamp between 0 and 1
        const scale = 1 - progress; // Goes from 1 → 0

        // Apply scale to all objects
        scene.traverse(object => {
            if (object.isMesh || object.isPoints || object.isLine) {
                object.scale.setScalar(scale);
            }
        });

        renderer.render(scene, camera);

        if (progress < 1) {
            // Continue animation
            requestAnimationFrame(animateScaleDown);
        } else {
            // Animation complete, proceed with disposal
            performDisposal();
        }
    };

    // Start the animation
    animateScaleDown();

    // The actual cleanup logic
    const performDisposal = () => {
        removeExternalEventListeners();
        clearInterval(bloodMoonFadeInInterval);
        clearInterval(bloodMoonFadeOutInterval);
        clearInterval(rainFadeInInterval);
        clearInterval(rainFadeOutInterval);

        // Dispose geometries & materials
        scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        if (skyMaterialInstance) skyMaterialInstance.dispose();
        if (waterMatInstance) waterMatInstance.dispose();

        if (timeSystem.weatherEffects.rain.particles) {
            timeSystem.weatherEffects.rain.particles.geometry?.dispose();
            timeSystem.weatherEffects.rain.particles.material?.dispose();
        }

        renderer.dispose();
        if (renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
        }

        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        scene = null;
        camera = null;
        renderer = null;
        controls = null;

        console.log("Ocean scene disposed after scale-down.");
    };
}

    // --- Initializations ---
    if (timeSliderEl) timeSliderEl.value = timeSystem.dayTime;
    if (globalTimeDisplayEl) globalTimeDisplayEl.textContent = Math.floor(timeSystem.globalTime);
    if (customSpeedInputEl) customSpeedInputEl.value = timeSystem.timeSpeed;
    const initialSpeedBtn = Array.from(speedButtonElements).find(b => parseInt(b.dataset.speed) === timeSystem.timeSpeed);
    if(initialSpeedBtn) initialSpeedBtn.classList.add('active');

    setupExternalEventListeners();
    updateDayNightCycle();
    animate(0);

    // Return API for external control and disposal
    return {
        scene,
        camera,
        renderer,
        controls,
        timeSystem,
        updateDayNightCycle, // Expose if external updates are needed
        dispose // Crucial for cleanup
    };
}
