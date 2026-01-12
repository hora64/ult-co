export class ImageManager {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    getImage(url) {
        if (!url) return null;
        
        // Return cached image if available
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        // Return null if already loading
        if (this.loadingPromises.has(url)) {
            return null;
        }

        // Start loading the image
        const img = new Image();
        const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
                this.cache.set(url, img);
                this.loadingPromises.delete(url);
                resolve(img);
            };
            img.onerror = () => {
                this.loadingPromises.delete(url);
                reject(new Error(`Failed to load image: ${url}`));
            };
        });

        this.loadingPromises.set(url, loadPromise);
        img.src = url;
        return null;
    }

    preloadImage(url) {
        if (!url || this.cache.has(url) || this.loadingPromises.has(url)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(url, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
            img.src = url;
        });
    }

    async loadImagesFromBlocks(blocks) {
        const imagePromises = [];
        const processedUrls = new Set();

        // Helper function to add image load promise
        const addImagePromise = (url) => {
            if (!url || processedUrls.has(url)) return;
            processedUrls.add(url);

            const img = this.getImage(url);
            if (img) {
                if (!img.complete) {
                    imagePromises.push(
                        new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve; // Also resolve on error to prevent hanging
                        })
                    );
                }
            } else {
                // Image is loading, get the promise
                if (this.loadingPromises.has(url)) {
                    imagePromises.push(this.loadingPromises.get(url));
                }
            }
        };

        // Process all blocks to find images
        for (const block of blocks) {
            if (block.type === 'image') {
                addImagePromise(block.url);
            } else if (block.type === 'embed' && block.service === 'youtube') {
                addImagePromise(`https://img.youtube.com/vi/${block.id}/0.jpg`);
            } else if (block.tokens) {
                // Process inline images in tokens
                for (const token of block.tokens) {
                    if (token.style && token.style.image) {
                        addImagePromise(token.style.image);
                    }
                }
            }
            
            // Handle list items if present
            if (block.items) {
                for (const item of block.items) {
                    if (item.tokens) {
                        for (const token of item.tokens) {
                            if (token.style && token.style.image) {
                                addImagePromise(token.style.image);
                            }
                        }
                    }
                }
            }

            // Handle table cells if present
            if (block.type === 'table') {
                // Process headers
                if (block.headers) {
                    for (const header of block.headers) {
                        if (Array.isArray(header)) {
                            for (const token of header) {
                                if (token.style && token.style.image) {
                                    addImagePromise(token.style.image);
                                }
                            }
                        }
                    }
                }

                // Process rows
                if (block.rows) {
                    for (const row of block.rows) {
                        for (const cell of row) {
                            if (Array.isArray(cell)) {
                                for (const token of cell) {
                                    if (token.style && token.style.image) {
                                        addImagePromise(token.style.image);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Wait for all images to load
        if (imagePromises.length > 0) {
            await Promise.all(imagePromises);
        }
    }

    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
}