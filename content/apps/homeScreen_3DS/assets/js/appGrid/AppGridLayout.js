import { gridConfig } from '../../../config/config.js';

/**
 * AppGridLayout - Handles 2D grid layout management and transformations
 * Manages the base 6-row layout and visual layout transformations
 */
export class AppGridLayout {
    constructor(appGrid) {
        this.appGrid = appGrid;
        
        // Base grid layout structure - ALWAYS stored as 6 rows
        this.baseGridLayout2D = null; // Base 6-row 2D array of app IDs
        this.baseRows = 6; // Base row count for storage
        this.baseColumns = 0; // Will be calculated based on apps

        // Visual grid layout - transformed from base based on current size
        this.gridLayout2D = null; // Visual 2D array (transformed)
        this.gridRows = 0; // Visual rows (from size config)
        this.gridColumns = 0; // Visual columns (calculated)
    }

    /**
     * Transforms base 6-row coordinates to visual coordinates based on current size
     * @param {number} baseRow - Row in base 6-row grid (0-5)
     * @param {number} baseCol - Column in base grid
     * @returns {{row: number, col: number}|null} Visual coordinates or null if invalid
     */
    transformBaseToVisual(baseRow, baseCol) {
        if (!this.baseGridLayout2D || !this.gridLayout2D) {
            console.warn('[AppGridLayout] Grid layouts not initialized for transformation');
            return null;
        }

        if (baseRow < 0 || baseRow >= this.baseRows || baseCol < 0 || baseCol >= this.baseColumns) {
            console.error(`[AppGridLayout] Base position out of bounds: (${baseRow}, ${baseCol}), base grid is ${this.baseRows}x${this.baseColumns}`);
            return null;
        }

        const sizeConfig = this.appGrid.getCurrentSizeConfig();
        const visualRows = sizeConfig.rows || 3;

        // Calculate linear index in base grid (column-major order)
        const linearIndex = (baseCol * this.baseRows) + baseRow;

        // Convert to visual grid coordinates (column-major order)
        const visualRow = linearIndex % visualRows;
        const visualCol = Math.floor(linearIndex / visualRows);

        // Validate visual coordinates
        if (visualRow >= this.gridRows || visualCol >= this.gridColumns) {
            console.error(`[AppGridLayout] Transformed visual position out of bounds: (${visualRow}, ${visualCol}), visual grid is ${this.gridRows}x${this.gridColumns}`);
            return null;
        }

        return { row: visualRow, col: visualCol };
    }

    /**
     * Transforms visual coordinates to base 6-row coordinates
     * @param {number} visualRow - Row in visual grid
     * @param {number} visualCol - Column in visual grid
     * @returns {{row: number, col: number}|null} Base coordinates or null if invalid
     */
    transformVisualToBase(visualRow, visualCol) {
        if (!this.baseGridLayout2D || !this.gridLayout2D) {
            console.warn('[AppGridLayout] Grid layouts not initialized for transformation');
            return null;
        }

        if (visualRow < 0 || visualRow >= this.gridRows || visualCol < 0 || visualCol >= this.gridColumns) {
            console.error(`[AppGridLayout] Visual position out of bounds: (${visualRow}, ${visualCol}), visual grid is ${this.gridRows}x${this.gridColumns}`);
            return null;
        }

        // Calculate linear index in visual grid (column-major order)
        const linearIndex = (visualCol * this.gridRows) + visualRow;

        // Convert to base grid coordinates (column-major order)
        const baseRow = linearIndex % this.baseRows;
        const baseCol = Math.floor(linearIndex / this.baseRows);

        // Validate base coordinates
        if (baseRow >= this.baseRows || baseCol >= this.baseColumns) {
            console.error(`[AppGridLayout] Transformed base position out of bounds: (${baseRow}, ${baseCol}), base grid is ${this.baseRows}x${this.baseColumns}`);
            return null;
        }

        return { row: baseRow, col: baseCol };
    }

    /**
     * Rebuilds visual grid layout from base layout based on current size
     */
    rebuildVisualGrid() {
        if (!this.baseGridLayout2D) {
            console.warn('[AppGridLayout] No base grid layout to rebuild from');
            return;
        }

        const sizeConfig = this.appGrid.getCurrentSizeConfig();
        const visualRows = sizeConfig.rows || 3;

        console.log(`[AppGridLayout] Rebuilding visual grid for ${visualRows} rows from base ${this.baseRows} rows`);

        // Calculate total positions
        const totalPositions = this.baseRows * this.baseColumns;
        const visualColumns = Math.ceil(totalPositions / visualRows);

        // Initialize visual grid
        this.gridRows = visualRows;
        this.gridColumns = visualColumns;
        this.gridLayout2D = Array(visualRows).fill(null).map(() => Array(visualColumns).fill(null));

        // Transform all apps from base to visual
        for (let baseCol = 0; baseCol < this.baseColumns; baseCol++) {
            for (let baseRow = 0; baseRow < this.baseRows; baseRow++) {
                const appId = this.baseGridLayout2D[baseRow][baseCol];
                if (appId) {
                    const visualPos = this.transformBaseToVisual(baseRow, baseCol);
                    if (visualPos) {
                        this.gridLayout2D[visualPos.row][visualPos.col] = appId;
                    }
                }
            }
        }

        console.log(`[AppGridLayout] Visual grid rebuilt as ${visualRows}x${visualColumns}`);
    }

    /**
     * Loads the 2D grid layout from localStorage
     */
    loadGridLayout2D() {
        const storedLayout = this.appGrid.stateManager.loadGridLayout2D();

        console.log('[AppGridLayout] Loading grid layout from localStorage:', storedLayout);

        if (storedLayout && Array.isArray(storedLayout) && storedLayout.length > 0) {
            // Load stored base layout (should be 6 rows)
            this.baseGridLayout2D = storedLayout;
            this.baseRows = storedLayout.length;
            this.baseColumns = storedLayout[0] ? storedLayout[0].length : 0;

            console.log(`[AppGridLayout] Loaded ${this.baseRows}x${this.baseColumns} base grid from storage (user layout preserved)`);

            // Ensure base grid is 6 rows (migrate old layouts if needed)
            if (this.baseRows !== 6) {
                console.log(`[AppGridLayout] Migrating layout from ${this.baseRows} rows to 6 rows`);
                this.migrateToBase6Rows();
            }

            // Find which apps are in the layout and which are new
            const layoutAppIds = new Set();
            this.baseGridLayout2D.forEach(row => row.forEach(id => id && layoutAppIds.add(id)));

            const newApps = this.appGrid.appData.filter(app => !layoutAppIds.has(app.id));

            if (newApps.length > 0) {
                console.log(`[AppGridLayout] Found ${newApps.length} new apps not in saved layout, integrating them...`);
                this.integrateNewAppsIntoBase(newApps);
            }

            // Rebuild visual grid from base
            this.rebuildVisualGrid();

            // Reorder appData based on visual layout
            this.updateAppDataFromLayout2D();
        } else {
            console.log('[AppGridLayout] No stored layout found, creating default one with coordinate spawns');
            this.initializeDefaultGridLayout2D();
        }
    }

    /**
     * Migrates an existing layout to base 6-row format
     */
    migrateToBase6Rows() {
        if (!this.baseGridLayout2D) return;

        // Collect all apps in linear order (column-major)
        const allApps = [];
        for (let col = 0; col < this.baseColumns; col++) {
            for (let row = 0; row < this.baseRows; row++) {
                const appId = this.baseGridLayout2D[row][col];
                if (appId) {
                    allApps.push(appId);
                }
            }
        }

        // Calculate new dimensions with 6 rows
        const totalApps = allApps.length;
        const newColumns = Math.ceil(totalApps / 6);

        // Create new 6-row base layout
        this.baseRows = 6;
        this.baseColumns = newColumns;
        this.baseGridLayout2D = Array(6).fill(null).map(() => Array(newColumns).fill(null));

        // Fill in column-major order
        let appIndex = 0;
        for (let col = 0; col < newColumns && appIndex < allApps.length; col++) {
            for (let row = 0; row < 6 && appIndex < allApps.length; row++) {
                this.baseGridLayout2D[row][col] = allApps[appIndex];
                appIndex++;
            }
        }

        console.log(`[AppGridLayout] Successfully migrated to 6-row base layout (${this.baseRows}x${this.baseColumns})`);
        this.saveGridLayout2D();
    }

    /**
     * Integrates new apps into the base grid layout
     * @param {Array<Object>} newApps - Apps to integrate
     */
    integrateNewAppsIntoBase(newApps) {
        console.log(`[AppGridLayout] Integrating ${newApps.length} new apps into base layout`);

        // First, try to fill empty spaces in existing base grid
        const emptySpaces = [];
        for (let col = 0; col < this.baseColumns; col++) {
            for (let row = 0; row < this.baseRows; row++) {
                if (!this.baseGridLayout2D[row][col]) {
                    emptySpaces.push({ row, col });
                }
            }
        }

        console.log(`[AppGridLayout] Found ${emptySpaces.length} empty spaces in base layout`);

        let appsToPlace = [...newApps];

        // Fill empty spaces first
        emptySpaces.forEach((space, index) => {
            if (index < appsToPlace.length) {
                this.baseGridLayout2D[space.row][space.col] = appsToPlace[index].id;
                console.log(`[AppGridLayout] Placed new app "${appsToPlace[index].id}" at base (${space.row}, ${space.col})`);
            }
        });

        // Remove apps we've placed
        appsToPlace = appsToPlace.slice(emptySpaces.length);

        // If there are still apps to place, expand base grid with new columns
        if (appsToPlace.length > 0) {
            console.log(`[AppGridLayout] Adding ${appsToPlace.length} apps to new columns in base grid`);

            let appIndex = 0;
            while (appIndex < appsToPlace.length) {
                // Add a new column (fill from top to bottom in base 6-row grid)
                for (let row = 0; row < this.baseRows && appIndex < appsToPlace.length; row++) {
                    if (!this.baseGridLayout2D[row]) {
                        this.baseGridLayout2D[row] = [];
                    }
                    this.baseGridLayout2D[row].push(appsToPlace[appIndex].id);
                    console.log(`[AppGridLayout] Added new app "${appsToPlace[appIndex].id}" at new base column`);
                    appIndex++;
                }
                this.baseColumns++;
            }

            // Fill remaining rows with null to maintain rectangular grid
            for (let row = 0; row < this.baseRows; row++) {
                while (this.baseGridLayout2D[row].length < this.baseColumns) {
                    this.baseGridLayout2D[row].push(null);
                }
            }
        }

        // Save the updated base layout
        console.log(`[AppGridLayout] Successfully integrated ${newApps.length} new apps into base layout`);
        this.saveGridLayout2D();
    }

    /**
     * Initializes a default 2D grid layout based on current size configuration
     */
    initializeDefaultGridLayout2D() {
        const totalSpaces = gridConfig.totalTileSpaces;
        const baseColumns = Math.ceil(totalSpaces / gridConfig.baseRows);

        this.baseRows = gridConfig.baseRows;
        this.baseColumns = baseColumns;

        console.log(`[AppGridLayout] Initializing default ${gridConfig.baseRows}x${baseColumns} base grid layout`);

        // Create empty base 2D array (6 rows)
        this.baseGridLayout2D = Array(gridConfig.baseRows).fill(null).map(() => Array(baseColumns).fill(null));

        // Fill with app IDs in column-major order (top to bottom, left to right)
        let appIndex = 0;
        for (let col = 0; col < baseColumns && appIndex < this.appGrid.appData.length; col++) {
            for (let row = 0; row < gridConfig.baseRows && appIndex < this.appGrid.appData.length; row++) {
                this.baseGridLayout2D[row][col] = this.appGrid.appData[appIndex].id;
                appIndex++;
            }
        }

        console.log(`[AppGridLayout] Filled base grid with ${appIndex} apps`);
        this.saveGridLayout2D();

        // Build visual grid from base
        this.rebuildVisualGrid();
    }

    /**
     * Saves the current base 2D grid layout to localStorage
     */
    saveGridLayout2D() {
        if (this.baseGridLayout2D) {
            console.log('[AppGridLayout] Saving base grid layout:', this.baseGridLayout2D);
            this.appGrid.stateManager.saveGridLayout2D(this.baseGridLayout2D);
        }
    }

    /**
     * Gets the app ID at a specific visual row and column
     */
    getAppIdAt(row, col) {
        if (this.gridLayout2D &&
            row >= 0 && row < this.gridRows &&
            col >= 0 && col < this.gridColumns) {
            return this.gridLayout2D[row][col];
        }
        return null;
    }

    /**
     * Sets the app ID at a specific visual row and column
     */
    setAppIdAt(row, col, appId) {
        if (this.gridLayout2D &&
            row >= 0 && row < this.gridRows &&
            col >= 0 && col < this.gridColumns) {

            // Update visual grid
            this.gridLayout2D[row][col] = appId;

            // Transform to base coordinates and update base grid
            const basePos = this.transformVisualToBase(row, col);
            if (basePos && this.baseGridLayout2D) {
                this.baseGridLayout2D[basePos.row][basePos.col] = appId;
                this.saveGridLayout2D();
            }
        }
    }

    /**
     * Finds the position of an app in the visual 2D grid
     */
    findAppPosition2D(appId) {
        if (!this.gridLayout2D) return null;

        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridColumns; col++) {
                if (this.gridLayout2D[row][col] === appId) {
                    return {
                        row,
                        col,
                        totalRows: this.gridRows,
                        totalCols: this.gridColumns
                    };
                }
            }
        }
        return null;
    }

    /**
     * Gets the app at a specific 2D position
     */
    getAppAt2DPosition(row, col) {
        const appId = this.getAppIdAt(row, col);
        if (!appId) return null;

        return this.appGrid.appData.find(app => app.id === appId) || null;
    }

    /**
     * Gets the number of apps in a specific row
     */
    getAppsInRow(row) {
        if (!this.gridLayout2D || row < 0 || row >= this.gridRows) return 0;

        let count = 0;
        for (let col = 0; col < this.gridColumns; col++) {
            if (this.gridLayout2D[row][col]) {
                count++;
            }
        }
        return count;
    }

    /**
     * Swaps two apps in the 2D grid
     */
    swapApps2D(appId1, appId2) {
        const pos1 = this.findAppPosition2D(appId1);
        const pos2 = this.findAppPosition2D(appId2);

        if (pos1 && pos2) {
            // Swap in visual array
            this.gridLayout2D[pos1.row][pos1.col] = appId2;
            this.gridLayout2D[pos2.row][pos2.col] = appId1;

            // Transform to base coordinates and swap in base array
            const basePos1 = this.transformVisualToBase(pos1.row, pos1.col);
            const basePos2 = this.transformVisualToBase(pos2.row, pos2.col);

            if (basePos1 && basePos2 && this.baseGridLayout2D) {
                this.baseGridLayout2D[basePos1.row][basePos1.col] = appId2;
                this.baseGridLayout2D[basePos2.row][basePos2.col] = appId1;
            }

            // Update appData order based on new layout
            this.updateAppDataFromLayout2D();
            this.saveGridLayout2D();
            console.log(`[AppGridLayout] Swapped ${appId1} and ${appId2}`);
        }
    }

    /**
     * Moves an app to a specific position in the 2D grid
     */
    moveAppTo2D(appId, targetRow, targetCol) {
        const currentPos = this.findAppPosition2D(appId);
        if (!currentPos) return;

        const targetAppId = this.getAppIdAt(targetRow, targetCol);

        if (targetAppId) {
            // Swap if target position has an app
            this.swapApps2D(appId, targetAppId);
        } else {
            // Move to empty space in visual grid
            this.gridLayout2D[currentPos.row][currentPos.col] = null;
            this.gridLayout2D[targetRow][targetCol] = appId;

            // Transform to base coordinates and update base grid
            const currentBasePos = this.transformVisualToBase(currentPos.row, currentPos.col);
            const targetBasePos = this.transformVisualToBase(targetRow, targetCol);

            if (currentBasePos && targetBasePos && this.baseGridLayout2D) {
                this.baseGridLayout2D[currentBasePos.row][currentBasePos.col] = null;
                this.baseGridLayout2D[targetBasePos.row][targetBasePos.col] = appId;
            }

            this.updateAppDataFromLayout2D();
            this.saveGridLayout2D();
            console.log(`[AppGridLayout] Moved ${appId} to empty space at visual (${targetRow}, ${targetCol})`);
        }
    }

    /**
     * Updates appData array order based on the 2D layout
     */
    updateAppDataFromLayout2D() {
        if (!this.gridLayout2D) return;

        const appMap = new Map(this.appGrid.appData.map(app => [app.id, app]));
        const orderedApps = [];

        // Read in column-major order
        for (let col = 0; col < this.gridColumns; col++) {
            for (let row = 0; row < this.gridRows; row++) {
                const appId = this.gridLayout2D[row][col];
                if (appId && appMap.has(appId)) {
                    orderedApps.push(appMap.get(appId));
                }
            }
        }

        // Add any apps not in the layout
        const layoutAppIds = new Set();
        this.gridLayout2D.forEach(row => row.forEach(id => id && layoutAppIds.add(id)));
        const remainingApps = this.appGrid.appData.filter(app => !layoutAppIds.has(app.id));

        this.appGrid.appData = [...orderedApps, ...remainingApps];
    }

    /**
     * Resets the app order to default
     */
    resetAppOrder() {
        this.appGrid.stateManager.resetAppOrder();
        this.gridLayout2D = null;
        this.initializeDefaultGridLayout2D();
    }
}
