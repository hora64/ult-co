export async function createBannerScene(canvasElement) {
    // Import Three.js and required addons
    const THREE = await import('three');
    const { GLTFLoader } = await import('GLTFLoader');

    // Scene setup with transparent background
    const scene = new THREE.Scene();
    
    // Camera setup (no controls)
    const camera = new THREE.PerspectiveCamera(
        75,
        canvasElement.clientWidth / canvasElement.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
    
    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasElement,
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load the present model
    let present;
    try {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('banners/unopened/models/present_small.glb');
        present = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(present);
        const center = box.getCenter(new THREE.Vector3());
        present.position.sub(center);
        
        // Scale to reasonable size
        const size = box.getSize(new THREE.Vector3()).length();
        const targetSize = 2;
        present.scale.multiplyScalar(targetSize / size);
        
        scene.add(present);
    } catch (error) {
        console.error('Error loading present model:', error);
        // Fallback cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            roughness: 0.4,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8
        });
        present = new THREE.Mesh(geometry, material);
        scene.add(present);
    }

    // Animation loop with rotation and bobbing
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        if (present) {
            present.rotation.y = elapsed * 0.5; // Slow Y-axis rotation
            present.position.y = Math.sin(elapsed * 2) * 0.1; // Vertical bobbing
        }

        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function onWindowResize() {
        camera.aspect = canvasElement.clientWidth / canvasElement.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
    }
    window.addEventListener('resize', onWindowResize);

    // Cleanup function
    function dispose() {
        window.removeEventListener('resize', onWindowResize);
        renderer.dispose();
        
        if (present) {
            present.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            scene.remove(present);
        }
    }

    return {
        scene,
        camera,
        renderer,
        present,
        dispose
    };
}
