import DataManager from './DataManager.js';

/**
 * AssetManager extends DataManager to manage and manipulate a collection of assets,
 * providing features like search, filtering, sorting, and downloading.
 *
 * Asset Schema:
 * Each asset is expected to have the following structure:
 * - `id`: A unique identifier for the asset.
 * - `name`: The name of the asset.
 * - `description`: A brief description of the asset.
 * - `type`: The file type of the asset (e.g., 'video', 'image', 'zip').
 * - `tags`: An array of strings for filtering and searching.
 * - `source`: Contains URLs for the asset.
 *   - `thumbnailUrl`: URL for the asset's thumbnail image.
 *   - `downloadUrl`: URL for downloading the asset.
 *   - `previewUrl`: URL for a preview of the asset.
 * - `bundledItems`: (Optional) For 'zip' type assets, an array of objects representing the files contained within the zip archive. Each object has a 'name' property.
 * - `fileDetails`: Information about the file.
 *   - `sizeBytes`: The size of the file in bytes.
 *   - `mimeType`: The MIME type of the file.
 * - `mediaProperties`: Properties related to the media content.
 *   - `dimensions`: The spatial dimensions of the media (e.g., width and height).
 *   - `durationSeconds`: The length of the media in seconds.
 *   - `frameRate`: The frame rate of the media.
 * - `usageRights`: Information about the usage rights of the asset.
 *   - `license`: The license type of the asset.
 *
 * Features:
 * - `getAssetById(id)`: Retrieves a single asset by its ID.
 * - `getAssetCapabilities()`: Analyzes all assets to determine available types and properties (e.g., if any assets are videos).
 * - `findDuplicates()`: Finds assets that are potential duplicates based on name and size.
 * - `getStatistics()`: Returns statistics about the asset library, such as counts by type.
 * - `getTagsUsage()`: Returns a map of all tags and their usage counts.
 * - `getRecentlyAdded(limit)`: Returns the most recently added assets, up to the specified limit.
 * - `getRandomAssets(count)`: Returns a specified number of random assets.
 * - `exportState()`: Exports the current state of the manager (filters, sorting, etc.) as a JSON string.
 * - `importState(jsonState)`: Imports a previously exported state, restoring the session.
 * - `undo()`: Reverts the last state-changing action.
 * - `redo()`: Re-applies the last undone action.
 * - `batchAddTags(assetIds, tags)`: Adds a set of tags to multiple assets at once.
 *- `batchRemoveTags(assetIds, tags)`: Removes a set of tags from multiple assets at once.
 * - `getRelatedAssets(assetId, count)`: Finds assets with similar tags to a given asset.
 * - `setCustomSort(compareFunction)`: Allows for applying a custom sorting function.
 * - `clearCache()`: Clears any cached data to force a reload.
 *
 * @param {string} jsonUrl - The URL to the JSON file containing the asset data.
 * @param {function} renderCallback - The function to call to re-render the UI when the state changes.
 */
class AssetManager extends DataManager {
    constructor(jsonUrl, renderCallback) {
        console.log('AssetManager: Initializing.');
        super(jsonUrl, renderCallback, {
            uniqueIdProperty: 'id',
            searchableProperties: ['name', 'description'],
            sliderProperties: {
                videoLength: 'mediaProperties.durationSeconds',
                width: 'mediaProperties.dimensions.width',
                height: 'mediaProperties.dimensions.height',
                fps: 'mediaProperties.frameRate',
                size: 'fileDetails.sizeBytes' // Note: This will be in bytes, conversion needed in UI
            }
        });
    }

    _normalizeData(data) {
        if (!Array.isArray(data)) {
            console.error("AssetManager: Expected an array of assets, but received:", data);
            return [];
        }

        return data.map((item, index) => {
            // Basic structure check
            if (!item.metadata || !item.googleDrive) {
                console.warn("AssetManager: Skipping invalid item structure at index", index, item);
                return null;
            }

            const normalized = {
                id: item.metadata.uniqueID || `gen_id_${index}`,
                name: item.metadata.name || 'Untitled',
                description: item.metadata.description || '',
                type: item.metadata.fileType || 'unknown',
                tags: item.categoryTags || [],
                dateAdded: item.metadata.dateAdded || new Date().toISOString(), // Assuming dateAdded might exist
                source: {
                    downloadUrl: item.googleDrive.downloadLink,
                    previewUrl: item.googleDrive.previewLink,
                    thumbnailUrl: item.googleDrive.thumbnailLink,
                },
                fileDetails: {
                    sizeBytes: item.metadata.size,
                    mimeType: `video/${item.metadata.fileType}`, // Assuming video
                },
                mediaProperties: {
                    dimensions: {
                        width: item.metadata.width,
                        height: item.metadata.height,
                    },
                    durationSeconds: item.metadata.videoLength,
                    frameRate: item.metadata.fps,
                },
                usageRights: {
                    license: item.metadata.license || 'N/A',
                }
            };

            if (normalized.type === 'zip' && item.metadata.bundledItems) {
                normalized.bundledItems = item.metadata.bundledItems;
            }
            
            return normalized;
        }).filter(item => item !== null); // Filter out any null items from invalid structures
    }

    // --- Asset Specific Methods ---

    getAssetCapabilities() {
        console.log('AssetManager: Getting asset capabilities.');
        // Simple check if any item has video-specific properties
        const hasVideo = this.state.allItems.some(asset => asset.mediaProperties?.durationSeconds > 0);
        return { hasVideo };
    }

    getTagFrequencies() {
        console.log('AssetManager: Calculating tag frequencies.');
        const frequencies = {};
        this.state.filteredItems.forEach(asset => {
            asset.tags?.forEach(tag => {
                frequencies[tag] = (frequencies[tag] || 0) + 1;
            });
        });
        return frequencies;
    }

    findDuplicates() {
        console.log('AssetManager: Finding duplicates.');
        const duplicates = new Map();
        this.state.allItems.forEach(asset => {
            const key = `${asset.name}|${asset.fileDetails.sizeBytes}`;
            if (!duplicates.has(key)) {
                duplicates.set(key, []);
            }
            duplicates.get(key).push(asset);
        });

        return Array.from(duplicates.values()).filter(group => group.length > 1);
    }

    // --- Overrides for item structure ---

    toggleDownload(item, isShiftKey = false) {
        console.log('AssetManager: Toggling download for item', item.uniqueID);
        // The generic DataManager uses 'toggleSelection'. We adapt the name here for clarity in the asset context.
        // The item passed from the UI needs to be converted to the full asset object if it's just a summary.
        const fullAsset = this.getItemById(item.uniqueID) || item; 
        super.toggleSelection(fullAsset, isShiftKey);
    }

    unselectAllDownloads() {
        console.log('AssetManager: Unselecting all downloads.');
        super.unselectAll();
    }
    
    selectAllFiltered(select) {
        console.log('AssetManager: Selecting all filtered items.');
        super.selectAll(select, true);
    }
}

export default AssetManager;
