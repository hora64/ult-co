import { Material } from './Material.js';
import * as Materials from './index.js';

export class RichText extends Material {
    constructor(options = {}) {
        super(options);
        this.text = options.text || '';
        this.materials = this.discoverMaterials();
        this.parsedSegments = this.parseText(this.text);
    }

    discoverMaterials() {
        return Object.values(Materials)
            .filter(M => typeof M === 'function' && M.prototype instanceof Material && M !== Material && M !== RichText)
            .map(M => new M());
    }

    getMaterial(name) {
        return this.materials.find(m => m.name === name) || null;
    }

    parseText(text) {
        let segments = [{ text: text, style: {} }];

        this.materials.forEach(material => {
            if (!material.regex) return;

            let newSegments = [];
            segments.forEach(segment => {
                // If this segment has already been processed by a material, skip it.
                if (segment.style.effect) {
                    newSegments.push(segment);
                    return;
                }

                let lastIndex = 0;
                let match;
                material.regex.lastIndex = 0; // Reset regex state for global regexes

                while ((match = material.regex.exec(segment.text)) !== null) {
                    // Add the text before the match
                    if (match.index > lastIndex) {
                        newSegments.push({ text: segment.text.substring(lastIndex, match.index), style: segment.style });
                    }
                    
                    // Parse the matched effect and add it as a new segment
                    const parsed = material.parse(match);
                    newSegments.push({ text: parsed.text, style: { ...segment.style, ...parsed.style } });
                    
                    lastIndex = material.regex.lastIndex;
                }

                // Add the remaining text after the last match
                if (lastIndex < segment.text.length) {
                    newSegments.push({ text: segment.text.substring(lastIndex), style: segment.style });
                }
            });
            segments = newSegments;
        });

        return segments;
    }

    draw(ctx, x, y) {
        let currentX = x;
        this.parsedSegments.forEach(segment => {
            const materialName = segment.style.effect;
            const material = materialName ? this.getMaterial(materialName) : null;
            
            if (material) {
                const materialInstance = new (material.constructor)(segment.style);
                const textMetrics = ctx.measureText(segment.text);
                materialInstance.apply(ctx, currentX, y, textMetrics.width, parseInt(ctx.font), segment.text, segment);
            } else {
                this.applyStyle(ctx, segment.style);
                ctx.fillText(segment.text, currentX, y);
            }
            
            currentX += ctx.measureText(segment.text).width;
        });
    }

    applyStyle(ctx, style) {
        ctx.fillStyle = style.color || this.options.color || 'white';
        // ... other style applications
    }

    update(deltaTime) {
        this.parsedSegments.forEach(segment => {
            const material = segment.style.effect ? this.getMaterial(segment.style.effect) : null;
            if (material) {
                const materialInstance = new (material.constructor)(segment.style);
                if (materialInstance.isAnimated && typeof materialInstance.update === 'function') {
                    materialInstance.update(deltaTime);
                }
            }
        });
    }
}
