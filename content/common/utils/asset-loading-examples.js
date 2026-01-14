/**
 * Asset Loading Examples
 * Demonstrates loading images, textures, and audio with caching
 */

import { 
    loadImage, 
    loadTexture, 
    loadAudio,
    loadImages,
    loadTextures,
    loadAudioFiles,
    AssetPreloader 
} from '/content/common/utils/index.js';

// =============================================================================
// EXAMPLE 1: Load Single Image
// =============================================================================

export async function example1_loadSingleImage() {
    console.log('\n=== Example 1: Load Single Image ===\n');
    
    const img = await loadImage('/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png', {
        appId: 'examples',
        appVersion: '1.0.0'
    });
    
    console.log('Image loaded:', img.width, 'x', img.height);
    
    // Use the image
    document.body.appendChild(img);
    
    return img;
}

// =============================================================================
// EXAMPLE 2: Load Multiple Images with Progress
// =============================================================================

export async function example2_loadMultipleImages() {
    console.log('\n=== Example 2: Load Multiple Images ===\n');
    
    const imageUrls = [
        '/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png',
        '/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlankApp_64px.png',
        '/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png'
    ];
    
    const images = await loadImages(imageUrls, {
        appId: 'examples',
        appVersion: '1.0.0',
        onProgress: (current, total, url) => {
            console.log(`Loading: ${current}/${total} - ${url.split('/').pop()}`);
        }
    });
    
    console.log(`Loaded ${images.size} images`);
    
    return images;
}

// =============================================================================
// EXAMPLE 3: Load Texture as Blob
// =============================================================================

export async function example3_loadTexture() {
    console.log('\n=== Example 3: Load Texture as Blob ===\n');
    
    const textureBlob = await loadTexture('/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png', {
        appId: 'examples',
        appVersion: '1.0.0'
    });
    
    console.log('Texture blob size:', textureBlob.size, 'bytes');
    console.log('Texture blob type:', textureBlob.type);
    
    return textureBlob;
}

// =============================================================================
// EXAMPLE 4: Load Texture as THREE.Texture
// =============================================================================

export async function example4_loadThreeTexture() {
    console.log('\n=== Example 4: Load THREE.js Texture ===\n');
    
    try {
        // Import THREE.js
        const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
        
        const texture = await loadTexture('/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png', {
            appId: 'examples',
            appVersion: '1.0.0',
            returnThreeTexture: true,
            THREE: THREE
        });
        
        console.log('THREE.Texture loaded:', texture);
        console.log('Image size:', texture.image.width, 'x', texture.image.height);
        
        return texture;
    } catch (error) {
        console.warn('THREE.js not available:', error.message);
        return null;
    }
}

// =============================================================================
// EXAMPLE 5: Load Audio (ArrayBuffer)
// =============================================================================

export async function example5_loadAudio() {
    console.log('\n=== Example 5: Load Audio as ArrayBuffer ===\n');
    
    try {
        // Using placeholder audio URL (replace with actual audio file)
        const audioUrl = '/content/apps/homeScreen_3DS/assets/audio/homescreen_bgm.ogg';
        
        const audioBuffer = await loadAudio(audioUrl, {
            appId: 'examples',
            appVersion: '1.0.0'
        });
        
        console.log('Audio loaded:', audioBuffer.byteLength, 'bytes');
        
        return audioBuffer;
    } catch (error) {
        console.warn('Audio file not available:', error.message);
        return null;
    }
}

// =============================================================================
// EXAMPLE 6: Load Audio with Decoding
// =============================================================================

export async function example6_loadDecodedAudio() {
    console.log('\n=== Example 6: Load Decoded Audio ===\n');
    
    try {
        const audioUrl = '/content/apps/homeScreen_3DS/assets/audio/homescreen_bgm.ogg';
        
        const audioBuffer = await loadAudio(audioUrl, {
            appId: 'examples',
            appVersion: '1.0.0',
            decodeAudio: true  // Returns AudioBuffer
        });
        
        console.log('Decoded audio buffer:', audioBuffer);
        console.log('Duration:', audioBuffer.duration, 'seconds');
        console.log('Sample rate:', audioBuffer.sampleRate, 'Hz');
        console.log('Channels:', audioBuffer.numberOfChannels);
        
        return audioBuffer;
    } catch (error) {
        console.warn('Audio file not available:', error.message);
        return null;
    }
}

// =============================================================================
// EXAMPLE 7: Complete Asset Loader
// =============================================================================

export async function example7_completeAssetLoader() {
    console.log('\n=== Example 7: Complete Asset Loader ===\n');
    
    const preloader = new AssetPreloader({
        appId: 'completeExample',
        appVersion: '1.0.0',
        maxConcurrent: 3
    });
    
    // Define assets
    const assets = {
        images: [
            '/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlueThemeIcon.png',
            '/content/apps/homeScreen_3DS/assets/themes/blueTheme/BlankApp_64px.png'
        ],
        // audio: [
        //     '/content/apps/homeScreen_3DS/assets/audio/click.ogg'
        // ]
    };
    
    // Load all assets
    console.log('Loading images...');
    const images = await preloader.loadImages(assets.images, {
        onProgress: (current, total, url) => {
            console.log(`  ${current}/${total} - ${url.split('/').pop()}`);
        }
    });
    
    console.log('\nAssets loaded:');
    console.log('  Images:', images.size);
    
    // Get stats
    const stats = preloader.getStats();
    console.log('\nPreloader stats:');
    console.log('  Loaded:', stats.loaded);
    console.log('  Failed:', stats.failed);
    
    return { images };
}

// =============================================================================
// EXAMPLE 8: Cache Performance Test
// =============================================================================

export async function example8_cachePerformanceTest() {
    console.log('\n=== Example 8: Cache Performance Test ===\n');
    
    const imageUrl = '/content/apps/homeScreen_3DS/assets/themes/blueTheme/Select_128px.png';
    
    // First load (from network)
    console.log('First load (network):');
    console.time('network-load');
    const img1 = await loadImage(imageUrl, {
        appId: 'perfTest',
        appVersion: '1.0.0'
    });
    console.timeEnd('network-load');
    
    // Second load (from cache)
    console.log('\nSecond load (cache):');
    console.time('cache-load');
    const img2 = await loadImage(imageUrl, {
        appId: 'perfTest',
        appVersion: '1.0.0'
    });
    console.timeEnd('cache-load');
    
    console.log('\n💡 Cache load should be 10-50x faster!');
    
    return { img1, img2 };
}

// =============================================================================
// RUN ALL EXAMPLES
// =============================================================================

export async function runAllExamples() {
    console.clear();
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         Asset Loading Examples - Running All             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    try {
        await example1_loadSingleImage();
        await example2_loadMultipleImages();
        await example3_loadTexture();
        await example4_loadThreeTexture();
        await example5_loadAudio();
        await example6_loadDecodedAudio();
        await example7_completeAssetLoader();
        await example8_cachePerformanceTest();
        
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║              All Examples Completed!                      ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('\n❌ Example failed:', error);
    }
}

// Auto-expose to window
if (typeof window !== 'undefined') {
    window.assetLoadingExamples = {
        example1_loadSingleImage,
        example2_loadMultipleImages,
        example3_loadTexture,
        example4_loadThreeTexture,
        example5_loadAudio,
        example6_loadDecodedAudio,
        example7_completeAssetLoader,
        example8_cachePerformanceTest,
        runAllExamples
    };
    
    console.log('\n💡 Asset Loading Examples Loaded!');
    console.log('Available examples:');
    console.log('  - assetLoadingExamples.runAllExamples()');
    console.log('  - assetLoadingExamples.example1_loadSingleImage()');
    console.log('  - assetLoadingExamples.example2_loadMultipleImages()');
    console.log('  - assetLoadingExamples.example3_loadTexture()');
    console.log('  - assetLoadingExamples.example4_loadThreeTexture()');
    console.log('  - assetLoadingExamples.example5_loadAudio()');
    console.log('  - assetLoadingExamples.example6_loadDecodedAudio()');
    console.log('  - assetLoadingExamples.example7_completeAssetLoader()');
    console.log('  - assetLoadingExamples.example8_cachePerformanceTest()');
    console.log('');
}
