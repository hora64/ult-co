import * as THREE from "three";

export class SkyboxManager {
    constructor() {
        this.globalTime = 0;
        this.dayTime = 0;
        this.manualTime = true;
        this.timeSpeed = 0;
        this.sunPosition = new THREE.Vector3(0, 5, 10);
        this.moonPosition = new THREE.Vector3(0, 5, -10);
        this.settings = { enableVisualEffects: true };
        this.weatherEffects = {
            rain: { active: false, intensity: 0, particles: null },
            bloodMoon: { active: false, intensity: 0 },
        };
        this.skyColors = {
            midnight: { top: new THREE.Color(0.02, 0.02, 0.08), middle: new THREE.Color(0.01, 0.01, 0.05), bottom: new THREE.Color(0.005, 0.005, 0.02) },
            sunriseStart: { top: new THREE.Color(0.1, 0.05, 0.1), middle: new THREE.Color(0.05, 0.02, 0.08), bottom: new THREE.Color(0.02, 0.01, 0.05) },
            sunrisePeak: { top: new THREE.Color(1.0, 0.5, 0.3), middle: new THREE.Color(0.8, 0.3, 0.2), bottom: new THREE.Color(0.3, 0.1, 0.1) },
            morning: { top: new THREE.Color(0.7, 0.9, 1.2), middle: new THREE.Color(0.4, 0.7, 1.0), bottom: new THREE.Color(0.1, 0.3, 0.8) },
            midday: { top: new THREE.Color(0.9, 1.0, 1.3), middle: new THREE.Color(0.5, 0.8, 1.1), bottom: new THREE.Color(0.2, 0.4, 0.9) },
            sunsetStart: { top: new THREE.Color(1.0, 0.6, 0.3), middle: new THREE.Color(0.9, 0.4, 0.2), bottom: new THREE.Color(0.4, 0.2, 0.1) },
            sunsetPeak: { top: new THREE.Color(0.8, 0.3, 0.1), middle: new THREE.Color(0.6, 0.2, 0.1), bottom: new THREE.Color(0.2, 0.05, 0.05) },
            evening: { top: new THREE.Color(0.2, 0.1, 0.3), middle: new THREE.Color(0.1, 0.05, 0.2), bottom: new THREE.Color(0.05, 0.02, 0.1) },
        };
        this.currentSkyColors = {
            top: new THREE.Color(),
            middle: new THREE.Color(),
            bottom: new THREE.Color(),
        };
        this.timePhases = [
            { name: "Night", start: 21, end: 5, from: "evening", to: "midnight", sun: (t) => 0, moon: (t) => THREE.MathUtils.smoothstep(0.5 - t * 0.5, 0, 1), ambient: (t) => 0.2 * (1 - t * 0.5), hsl: (t) => [0.55 + t * 0.05, 0.3 * (1 - t * 0.3), 0.5 * (1 - t * 0.6)] },
            { name: "Dawn", start: 5, end: 7, from: "midnight", to: "sunriseStart", sun: (t) => THREE.MathUtils.smoothstep(t * 0.2, 0, 1), moon: (t) => 0.8 * (1 - THREE.MathUtils.smoothstep(t, 0.7, 1)), ambient: (t) => 0.1 + THREE.MathUtils.smoothstep(t * 0.3, 0, 1) * 0.3, hsl: (t) => [0.6 - t * 0.1, 0.3 + t * 0.2, 0.5 + t * 0.3] },
            { name: "Morning", start: 7, end: 10, from: "sunriseStart", to: "morning", sun: (t) => THREE.MathUtils.smoothstep(t * 1.2, 0.3, 1), moon: (t) => 0.2 * (1 - THREE.MathUtils.smoothstep(t, 0.8, 1)), ambient: (t) => 0.3 + THREE.MathUtils.smoothstep(t * 0.8, 0, 1) * 0.3, hsl: (t) => [0.1 + t * 0.07, 0.7 - t * 0.2, 0.7 + t * 0.2] },
            { name: "Late Morning", start: 10, end: 12, from: "morning", to: "midday", sun: (t) => 1.0 + t * 0.5, moon: (t) => 0, ambient: (t) => 0.5 + t * 0.1, hsl: (t) => [0.15 + t * 0.03, 0.55 - t * 0.15, 0.85 + t * 0.05] },
            { name: "Midday", start: 12, end: 14, from: "midday", to: "midday", sun: (t) => 1.5 - t * 0.3, moon: (t) => 0, ambient: (t) => 0.6 - t * 0.1, hsl: (t) => [0.18, 0.4, 0.9] },
            { name: "Afternoon", start: 14, end: 17, from: "midday", to: "sunsetStart", sun: (t) => 1.2 - t * 0.6, moon: (t) => 0, ambient: (t) => 0.4 - t * 0.1, hsl: (t) => [0.15 + t * 0.05, 0.5 + t * 0.1, 0.9 - t * 0.2] },
            { name: "Evening", start: 17, end: 19, from: "sunsetStart", to: "sunsetPeak", sun: (t) => 0.6 - t * 0.6, moon: (t) => t * 0.8, ambient: (t) => 0.3 + t * 0.1, hsl: (t) => [0.2 + t * 0.05, 0.6 + t * 0.2, 0.7 - t * 0.3] },
            { name: "Dusk", start: 19, end: 21, from: "sunsetPeak", to: "evening", sun: (t) => 0, moon: (t) => 0.8 - t * 0.3, ambient: (t) => 0.4 - t * 0.2, hsl: (t) => [0.6 - t * 0.1, 0.5 - t * 0.2, 0.4 + t * 0.1] },
        ];
    }

    initialize() {
        const now = luxon.DateTime.local();
        this.dayTime = now.hour * 60 + now.minute;
        this.globalTime = this.dayTime;
    }

    update(delta) {
        // This logic can be expanded to update time based on speed, etc.
        this.globalTime += delta * 1000;
    }
}
