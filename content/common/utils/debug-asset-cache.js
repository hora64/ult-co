/**
 * AssetCache Debug Utility
 * Inspects IndexedDB to verify assets are stored as Blobs
 */

import { assetCache } from './index.js';

/**
 * Inspect what type of data is stored for each cached asset
 */
export async function inspectCachedAssets() {
    console.log('=== AssetCache Inspector ===\n');
    
    try {
        // Initialize cache
        await assetCache.ensureReady();
        
        if (!assetCache.isAvailable) {
            console.error('❌ AssetCache not available');
            return;
        }
        
        console.log('✅ AssetCache initialized\n');
        
        // Get all stats
        const stats = await assetCache.getStats();
        console.log('📊 Overall Stats:');
        console.log(`   Total assets: ${stats.total}`);
        console.log(`   Images: ${stats.images}`);
        console.log(`   Audio: ${stats.audio}`);
        console.log(`   Models: ${stats.models}`);
        console.log(`   Other: ${stats.other}`);
        console.log(`   Apps: ${stats.apps.length}\n`);
        
        // Inspect each table
        const tables = ['images', 'audio', 'models', 'other'];
        
        for (const tableName of tables) {
            const items = await assetCache.db[tableName].toArray();
            
            if (items.length === 0) {
                console.log(`📁 ${tableName}: (empty)`);
                continue;
            }
            
            console.log(`\n📁 ${tableName} (${items.length} items):`);
            console.log('─'.repeat(80));
            
            for (const item of items) {
                const dataType = item.data?.constructor?.name || 'unknown';
                const isBlob = item.data instanceof Blob;
                const size = item.data?.size || 0;
                const type = item.data?.type || 'unknown';
                
                console.log(`\n   URL: ${item.url}`);
                console.log(`   App: ${item.appId} v${item.appVersion}`);
                console.log(`   Data Type: ${dataType} ${isBlob ? '✅ (Blob)' : '❌ (NOT A BLOB!)'}`);
                console.log(`   Size: ${formatBytes(size)}`);
                console.log(`   MIME Type: ${type || item.contentType || 'unknown'}`);
                console.log(`   Cached: ${new Date(item.timestamp).toLocaleString()}`);
                
                // Verify it's actually a Blob
                if (!isBlob) {
                    console.warn(`   ⚠️ WARNING: Data is not a Blob!`);
                    console.warn(`   Actual value:`, item.data);
                }
            }
            
            console.log('\n' + '─'.repeat(80));
        }
        
        // Summary
        const allItems = await Promise.all(
            tables.map(table => assetCache.db[table].toArray())
        );
        const flatItems = allItems.flat();
        const blobCount = flatItems.filter(item => item.data instanceof Blob).length;
        const nonBlobCount = flatItems.length - blobCount;
        
        console.log('\n=== Summary ===');
        console.log(`Total Assets: ${flatItems.length}`);
        console.log(`Stored as Blobs: ${blobCount} ✅`);
        console.log(`NOT Blobs: ${nonBlobCount} ${nonBlobCount > 0 ? '⚠️' : '✅'}`);
        
        if (nonBlobCount > 0) {
            console.warn('\n⚠️ WARNING: Some assets are not stored as Blobs!');
            console.warn('This may indicate a caching bug.');
        } else {
            console.log('\n✅ All assets correctly stored as Blobs!');
        }
        
        return {
            total: flatItems.length,
            blobCount,
            nonBlobCount,
            items: flatItems
        };
        
    } catch (error) {
        console.error('❌ Inspection failed:', error);
        console.error(error.stack);
        return null;
    }
}

/**
 * Test caching a file and verify it's stored as a Blob
 */
export async function testBlobStorage() {
    console.log('\n=== Blob Storage Test ===\n');
    
    try {
        await assetCache.ensureReady();
        
        // Create test blob
        const testData = 'Hello, this is test data!';
        const testBlob = new Blob([testData], { type: 'text/plain' });
        const testUrl = '/test/blob-storage-test.txt';
        
        console.log('1. Creating test blob...');
        console.log(`   Size: ${testBlob.size} bytes`);
        console.log(`   Type: ${testBlob.type}`);
        console.log(`   Instance: ${testBlob instanceof Blob ? 'Blob ✅' : 'NOT Blob ❌'}\n`);
        
        // Cache it
        console.log('2. Caching blob...');
        await assetCache.set(testUrl, testBlob, {
            appId: 'debug-test',
            appVersion: '1.0.0'
        });
        console.log('   ✅ Cached\n');
        
        // Retrieve it
        console.log('3. Retrieving from cache...');
        const cached = await assetCache.get(testUrl);
        
        if (!cached) {
            console.error('   ❌ Failed to retrieve!');
            return false;
        }
        
        console.log('   ✅ Retrieved\n');
        
        // Verify it's a blob
        console.log('4. Verifying stored data...');
        console.log(`   Data exists: ${!!cached.data}`);
        console.log(`   Type: ${cached.data?.constructor?.name}`);
        console.log(`   Is Blob: ${cached.data instanceof Blob ? '✅' : '❌'}`);
        console.log(`   Size: ${cached.data?.size} bytes`);
        console.log(`   MIME: ${cached.data?.type}\n`);
        
        // Read the blob
        if (cached.data instanceof Blob) {
            const text = await cached.data.text();
            console.log('5. Reading blob contents...');
            console.log(`   Content: "${text}"`);
            console.log(`   Match: ${text === testData ? '✅' : '❌'}\n`);
        }
        
        // Cleanup
        await assetCache.delete(testUrl);
        console.log('6. Cleanup complete\n');
        
        const success = cached.data instanceof Blob;
        console.log(`=== Test Result: ${success ? '✅ PASS' : '❌ FAIL'} ===`);
        
        return success;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get detailed info about a specific cached asset
 */
export async function inspectAsset(url) {
    console.log(`\n=== Inspecting: ${url} ===\n`);
    
    try {
        await assetCache.ensureReady();
        
        const cached = await assetCache.get(url);
        
        if (!cached) {
            console.log('❌ Asset not found in cache');
            return null;
        }
        
        console.log('✅ Asset found\n');
        
        console.log('📋 Metadata:');
        console.log(`   URL: ${cached.url}`);
        console.log(`   App: ${cached.appId} v${cached.appVersion}`);
        console.log(`   Cached: ${new Date(cached.timestamp).toLocaleString()}`);
        console.log(`   Content-Type: ${cached.contentType}\n`);
        
        console.log('💾 Data:');
        console.log(`   Type: ${cached.data?.constructor?.name}`);
        console.log(`   Is Blob: ${cached.data instanceof Blob ? '✅' : '❌'}`);
        console.log(`   Size: ${formatBytes(cached.data?.size || 0)}`);
        console.log(`   MIME: ${cached.data?.type || 'unknown'}\n`);
        
        if (cached.data instanceof Blob) {
            console.log('✅ Data correctly stored as Blob');
            
            // Try to read it
            try {
                const arrayBuffer = await cached.data.arrayBuffer();
                console.log(`   ArrayBuffer size: ${formatBytes(arrayBuffer.byteLength)}`);
                
                // Show first few bytes
                const uint8 = new Uint8Array(arrayBuffer.slice(0, 16));
                const hex = Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join(' ');
                console.log(`   First bytes: ${hex}...`);
            } catch (error) {
                console.warn('   ⚠️ Could not read blob:', error.message);
            }
        } else {
            console.error('❌ Data is NOT a Blob!');
            console.error('   Actual value:', cached.data);
        }
        
        return cached;
        
    } catch (error) {
        console.error('❌ Inspection failed:', error);
        return null;
    }
}

/**
 * Run all debug tests
 */
export async function runAllTests() {
    console.clear();
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   AssetCache Debug & Test Suite      ║');
    console.log('╚═══════════════════════════════════════╝\n');
    
    // Test 1: Blob storage
    const storageTest = await testBlobStorage();
    
    // Test 2: Inspect all cached assets
    const inspection = await inspectCachedAssets();
    
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║        Final Results                  ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log(`Blob Storage Test: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Total Cached Assets: ${inspection?.total || 0}`);
    console.log(`Stored as Blobs: ${inspection?.blobCount || 0}`);
    console.log(`Issues Found: ${inspection?.nonBlobCount || 0}\n`);
    
    if (storageTest && inspection?.nonBlobCount === 0) {
        console.log('✅ All tests passed! AssetCache is working correctly.');
    } else {
        console.warn('⚠️ Issues detected. Check logs above for details.');
    }
    
    return {
        storageTest,
        inspection
    };
}

// Auto-run if loaded as a script
if (typeof window !== 'undefined') {
    window.assetCacheDebug = {
        inspectCachedAssets,
        testBlobStorage,
        inspectAsset,
        runAllTests
    };
    
    console.log('\n💡 AssetCache Debug Utility Loaded!');
    console.log('Available commands:');
    console.log('  - assetCacheDebug.runAllTests()        - Run all tests');
    console.log('  - assetCacheDebug.inspectCachedAssets() - Inspect all cached assets');
    console.log('  - assetCacheDebug.testBlobStorage()     - Test blob storage');
    console.log('  - assetCacheDebug.inspectAsset(url)     - Inspect specific asset\n');
}
