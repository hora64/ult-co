/**
 * Manages data operations and state for the asset library.
 *
 * --- Asset Schema ---
 * Each asset is expected to have the following structure:
 * - `id`: A unique identifier for the asset.
 * - `name`: The name of the asset.
 * - `description`: A description of the asset.
 * - `source`: Contains URLs for the asset.
 *   - `thumbnailUrl`: URL for the asset's thumbnail image.
 *   - `downloadUrl`: URL for downloading the asset.
 *   - `previewUrl`: URL for a preview of the asset.
 * - `tags`: An array of strings for filtering and searching.
 * - `type`: The file type of the asset (e.g., 'video', 'image', 'zip').
 * - `bundledItems`: (Optional) For 'zip' type assets, an array of objects representing the files contained within the zip archive. Each object has a 'name' property.
 * - `fileDetails`: Information about the file.
 *   - `sizeBytes`: The size of the file in bytes.
 *   - `mimeType`: The MIME type of the file.
 *
 * --- Features ---
 * DataManager provides the following features:
 * - `initialize()`: Fetches and normalizes data from the given URL.
 * - `getState()`: Returns the current state, including paginated and filtered items.
 * - `setState(newState)`: Sets the state with new values and applies filters/sort.
 * - `updateState(partialState)`: Updates part of the state and triggers a re-render.
 * - `saveState()`: Saves the current state to localStorage.
 * - `loadState()`: Loads the state from localStorage.
 * - `applyFiltersAndSort()`: Filters and sorts the data based on the current state.
 * - `sortItems()`: Sorts the filtered items array.
 * - `paginate(items, page, perPage)`: Paginates the given items array.
 * - `render()`: Calls the renderCallback with the current state.
 * - `setSearchTerm(term)`: Sets the search term and resets the page to 1.
 * - `setSort(sort)`: Sets the sort order.
 * - `setPage(page)`: Sets the current page.
 * - `setItemsPerPage(perPage)`: Sets the number of items per page.
 * - `setView(view)`: Sets the current view (e.g., grid or list).
 * - `setSliders(sliders)`: Sets the slider values for filtering.
 * - `addFilter(value, type)`: Adds a filter for favorites, tags, or type.
 * - `removeFilter(value, type)`: Removes a filter by value and type.
 * - `clearAllFilters()`: Clears all filters, search term, and slider values.
 * - `toggleFavorite(itemId)`: Toggles the favorite status of an item.
 * - `toggleSelection(item, isShiftKey = false)`: Toggles selection of an item, supporting multi-select with Shift key.
 * - `handleShiftSelect(endItem)`: Selects a range of items between the last and current item based on Shift selection.
 * - `selectAll(select, onlyFiltered = false)`: Selects or deselects all items, with an option to limit to filtered items.
 * - `unselectAll()`: Deselects all currently selected items.
 * - `getUniqueId(item)`: Returns the unique ID for an item.
 * - `getItemById(id)`: Retrieves a single asset by its ID.
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
class DataManager {
    constructor(jsonUrl, renderCallback, options = {}) {
        this.jsonUrl = jsonUrl;
        this.renderCallback = renderCallback;
        this.options = {
            uniqueIdProperty: options.uniqueIdProperty || 'id',
            searchableProperties: options.searchableProperties || ['name'],
            ...options
        };
        this.state = {
            allItems: [],
            filteredItems: [],
            paginatedItems: [],
            selectedItems: [],
            favorites: new Set(),
            filters: [],
            searchTerm: '',
            sort: 'name-asc',
            currentPage: 1,
            itemsPerPage: 25,
            view: 'grid',
            sliders: {},
        };
        this.lastSelectedItem = null;
        this.history = [];
        this.historyIndex = -1;
        this.customSortFunction = null;
    }

    async initialize() {
        try {
            console.log('DataManager: Fetching data from', this.jsonUrl);
            const response = await fetch(this.jsonUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawData = await response.json();
            this.state.allItems = this._normalizeData(rawData);
            console.log('DataManager: Data fetched and normalized successfully.', this.state.allItems);
            this.loadState();
            this.applyFiltersAndSort();
            this._addHistory(); // Initial state
        } catch (error) {
            console.error('Error initializing DataManager:', error);
        }
    }

    _normalizeData(data) {
        // Default implementation returns data as is. Subclasses can override this.
        return data;
    }

    // --- State Management ---
    getState() {
        const { allItems, itemsPerPage, currentPage, filteredItems } = this.state;
        const paginatedItems = this.paginate(filteredItems, currentPage, itemsPerPage);
        const totalItemCount = allItems.length;
        const filteredItemCount = filteredItems.length;

        return {
            ...this.state,
            paginatedItems,
            totalItemCount,
            filteredItemCount,
        };
    }

    setState(newState, fromHistory = false) {
        Object.assign(this.state, newState);
        this.applyFiltersAndSort();
        this.saveState();
        if (!fromHistory) {
            this._addHistory();
        }
    }

    updateState(partialState) {
        console.log('DataManager: Updating state with', partialState);
        this.setState({ ...this.state, ...partialState });
    }

    _addHistory() {
        // When new state is added, remove any "future" states from undo
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        // Deep clone state to prevent mutation issues
        this.history.push(JSON.parse(JSON.stringify(this.state)));
        this.historyIndex++;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousState = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.setState(previousState, true); // true to prevent re-adding to history
            console.log('DataManager: Undo successful.');
        } else {
            console.log('DataManager: No more actions to undo.');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextState = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.setState(nextState, true); // true to prevent re-adding to history
            console.log('DataManager: Redo successful.');
        } else {
            console.log('DataManager: No more actions to redo.');
        }
    }

    saveState() {
        const stateToSave = {
            favorites: Array.from(this.state.favorites),
            sort: this.state.sort,
            itemsPerPage: this.state.itemsPerPage,
            view: this.state.view,
            sliders: this.state.sliders,
        };
        localStorage.setItem('dataManagerState', JSON.stringify(stateToSave));
    }

    loadState() {
        const savedState = localStorage.getItem('dataManagerState');
        if (savedState) {
            console.log('DataManager: Loading state from localStorage.');
            const parsed = JSON.parse(savedState);
            this.state.favorites = new Set(parsed.favorites || []);
            this.state.sort = parsed.sort || 'name-asc';
            this.state.itemsPerPage = parsed.itemsPerPage || 25;
            this.state.view = parsed.view || 'grid';
            this.state.sliders = parsed.sliders || {};
        }
    }

    exportState() {
        const stateToExport = {
            filters: this.state.filters,
            searchTerm: this.state.searchTerm,
            sort: this.state.sort,
            currentPage: this.state.currentPage,
            itemsPerPage: this.state.itemsPerPage,
            view: this.state.view,
            sliders: this.state.sliders,
            favorites: Array.from(this.state.favorites),
            selectedItems: this.state.selectedItems.map(item => this.getUniqueId(item)) // Save only IDs
        };
        return JSON.stringify(stateToExport, null, 2);
    }

    importState(jsonState) {
        try {
            const importedState = JSON.parse(jsonState);
            const selectedItems = (importedState.selectedItems || []).map(id => this.getItemById(id)).filter(Boolean);
            const favorites = new Set(importedState.favorites || []);

            this.updateState({
                ...importedState,
                selectedItems,
                favorites
            });
            console.log('DataManager: State imported successfully.');
        } catch (error) {
            console.error('DataManager: Failed to import state.', error);
        }
    }


    // --- Data Processing ---
    applyFiltersAndSort() {
        console.log('DataManager: Applying filters and sort.');
        let items = [...this.state.allItems];
        console.log(`DataManager: Starting with ${items.length} items.`);

        // Search
        if (this.state.searchTerm) {
            const term = this.state.searchTerm.toLowerCase();
            items = items.filter(item =>
                this.options.searchableProperties.some(prop =>
                    item[prop]?.toLowerCase().includes(term)
                )
            );
        }

        // Filters
        this.state.filters.forEach(filter => {
            items = items.filter(item => {
                if (filter.type === 'favorite') {
                    return this.state.favorites.has(this.getUniqueId(item));
                }
                if (filter.type === 'tag') {
                    return item.tags?.includes(filter.value);
                }
                if (filter.type === 'type') {
                    return item.type === filter.value;
                }
                return true;
            });
        });
        
        // Sliders
        Object.entries(this.state.sliders).forEach(([key, value]) => {
            if (value > 0 && this.options.sliderProperties && this.options.sliderProperties[key]) {
                const propPath = this.options.sliderProperties[key];
                items = items.filter(item => {
                    const itemValue = propPath.split('.').reduce((o, i) => o?.[i], item);
                    return itemValue >= value;
                });
            }
        });

        this.state.filteredItems = items;
        console.log(`DataManager: ${items.length} items remaining after filters.`);
        this.sortItems();
        this.render();
    }

    sortItems() {
        if (this.customSortFunction) {
            this.state.filteredItems.sort(this.customSortFunction);
            return;
        }

        const [key, direction] = this.state.sort.split('-');
        const asc = direction === 'asc' ? 1 : -1;

        this.state.filteredItems.sort((a, b) => {
            let valA, valB;
            switch (key) {
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'size':
                    valA = a.fileDetails?.sizeBytes;
                    valB = b.fileDetails?.sizeBytes;
                    break;
                case 'type':
                    valA = a.type;
                    valB = b.type;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return -1 * asc;
            if (valA > valB) return 1 * asc;
            return 0;
        });
    }

    paginate(items, page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return items.slice(start, end);
    }

    render() {
        if (this.renderCallback) {
            console.log('DataManager: Rendering UI with new state.');
            this.renderCallback(this.getState());
        }
    }

    // --- Public API Methods ---
    setSearchTerm(term) {
        console.log('DataManager: Setting search term to', term);
        this.updateState({ searchTerm: term, currentPage: 1 }); 
    }
    setSort(sort) {
        console.log('DataManager: Setting sort to', sort);
        this.customSortFunction = null; // Reset custom sort
        this.updateState({ sort });
    }
    setCustomSort(compareFunction) {
        console.log('DataManager: Setting custom sort function.');
        this.customSortFunction = compareFunction;
        this.updateState({ sort: 'custom' }); // Indicate custom sort is active
    }
    setPage(page) {
        console.log('DataManager: Setting page to', page);
        this.updateState({ currentPage: page }); 
    }
    setItemsPerPage(perPage) { 
        console.log('DataManager: Setting items per page to', perPage);
        this.updateState({ itemsPerPage: parseInt(perPage, 10), currentPage: 1 }); 
    }
    setView(view) { 
        console.log('DataManager: Setting view to', view);
        this.updateState({ view }); 
    }
    setSliders(sliders) { 
        console.log('DataManager: Setting sliders to', sliders);
        this.updateState({ sliders, currentPage: 1 }); 
    }

    addFilter(value, type) {
        console.log('DataManager: Adding filter', { value, type });
        const existing = this.state.filters.find(f => f.value === value && f.type === type);
        if (!existing) {
            this.updateState({ filters: [...this.state.filters, { value, type }], currentPage: 1 });
        }
    }

    removeFilter(value, type) {
        console.log('DataManager: Removing filter', { value, type });
        this.updateState({
            filters: this.state.filters.filter(f => f.value !== value || f.type !== type),
            currentPage: 1
        });
    }

    clearAllFilters() {
        console.log('DataManager: Clearing all filters.');
        this.updateState({ filters: [], searchTerm: '', sliders: {}, currentPage: 1 });
    }

    toggleFavorite(itemId) {
        console.log('DataManager: Toggling favorite for item', itemId);
        this.state.favorites.has(itemId) ? this.state.favorites.delete(itemId) : this.state.favorites.add(itemId);
        this.applyFiltersAndSort();
        this.saveState();
    }

    toggleSelection(item, isShiftKey = false) {
        console.log('DataManager: Toggling selection for item', item.id, 'Shift key:', isShiftKey);
        const itemId = this.getUniqueId(item);
        const index = this.state.selectedItems.findIndex(i => this.getUniqueId(i) === itemId);

        if (index > -1) {
            this.state.selectedItems.splice(index, 1);
        } else {
            this.state.selectedItems.push(item);
        }

        if (isShiftKey && this.lastSelectedItem) {
            this.handleShiftSelect(item);
        }

        this.lastSelectedItem = item;
        this.render();
    }

    handleShiftSelect(endItem) {
        const { filteredItems } = this.state;
        const startId = this.getUniqueId(this.lastSelectedItem);
        const endId = this.getUniqueId(endItem);

        const startIndex = filteredItems.findIndex(i => this.getUniqueId(i) === startId);
        const endIndex = filteredItems.findIndex(i => this.getUniqueId(i) === endId);

        if (startIndex === -1 || endIndex === -1) return;

        const [start, end] = [startIndex, endIndex].sort((a, b) => a - b);
        const itemsToSelect = filteredItems.slice(start, end + 1);

        itemsToSelect.forEach(item => {
            const itemId = this.getUniqueId(item);
            if (!this.state.selectedItems.some(i => this.getUniqueId(i) === itemId)) {
                this.state.selectedItems.push(item);
            }
        });
    }

    selectAll(select, onlyFiltered = false) {
        console.log(`DataManager: Selecting all. Select: ${select}, Filtered only: ${onlyFiltered}`);
        const sourceItems = onlyFiltered ? this.state.filteredItems : this.state.allItems;
        if (select) {
            const currentSelectionIds = new Set(this.state.selectedItems.map(i => this.getUniqueId(i)));
            sourceItems.forEach(item => {
                if (!currentSelectionIds.has(this.getUniqueId(item))) {
                    this.state.selectedItems.push(item);
                }
            });
        } else {
            this.unselectAll();
        }
        this.render();
    }

    unselectAll() {
        console.log('DataManager: Unselecting all items.');
        this.state.selectedItems = [];
        this.render();
    }

    // --- Utility ---
    getUniqueId(item) {
        return item[this.options.uniqueIdProperty];
    }

    getItemById(id) {
        return this.state.allItems.find(item => this.getUniqueId(item) === id);
    }

    // --- New Features ---

    getStatistics() {
        const stats = {
            totalCount: this.state.allItems.length,
            countByType: {},
            totalSizeMB: 0,
        };

        this.state.allItems.forEach(item => {
            stats.countByType[item.type] = (stats.countByType[item.type] || 0) + 1;
            stats.totalSizeMB += (item.fileDetails?.sizeBytes || 0) / (1024 * 1024);
        });

        stats.totalSizeMB = parseFloat(stats.totalSizeMB.toFixed(2));
        return stats;
    }

    getTagsUsage() {
        const tagsUsage = new Map();
        this.state.allItems.forEach(item => {
            item.tags?.forEach(tag => {
                tagsUsage.set(tag, (tagsUsage.get(tag) || 0) + 1);
            });
        });
        return tagsUsage;
    }

    getRecentlyAdded(limit = 5) {
        // Assumes items have a 'dateAdded' property in ISO 8601 format
        return [...this.state.allItems]
            .filter(item => item.dateAdded)
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, limit);
    }

    getRandomAssets(count = 1) {
        const shuffled = [...this.state.allItems].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    batchAddTags(assetIds, tags) {
        if (!Array.isArray(assetIds) || !Array.isArray(tags)) return;
        this.state.allItems.forEach(item => {
            if (assetIds.includes(this.getUniqueId(item))) {
                item.tags = [...new Set([...(item.tags || []), ...tags])];
            }
        });
        this.applyFiltersAndSort();
    }

    batchRemoveTags(assetIds, tags) {
        if (!Array.isArray(assetIds) || !Array.isArray(tags)) return;
        const tagsToRemove = new Set(tags);
        this.state.allItems.forEach(item => {
            if (assetIds.includes(this.getUniqueId(item))) {
                item.tags = (item.tags || []).filter(tag => !tagsToRemove.has(tag));
            }
        });
        this.applyFiltersAndSort();
    }

    getRelatedAssets(assetId, count = 5) {
        const sourceAsset = this.getItemById(assetId);
        if (!sourceAsset || !sourceAsset.tags?.length) return [];

        const sourceTags = new Set(sourceAsset.tags);
        return this.state.allItems
            .filter(item => this.getUniqueId(item) !== assetId)
            .map(item => {
                const commonTags = (item.tags || []).filter(tag => sourceTags.has(tag));
                return { item, commonality: commonTags.length };
            })
            .filter(x => x.commonality > 0)
            .sort((a, b) => b.commonality - a.commonality)
            .slice(0, count)
            .map(x => x.item);
    }

    clearCache() {
        // This is a placeholder. In a real-world scenario, this might clear
        // localStorage or other caching mechanisms. For now, it re-initializes.
        console.log('DataManager: Clearing cache and re-initializing.');
        localStorage.removeItem('dataManagerState');
        this.initialize();
    }
}

export default DataManager;
