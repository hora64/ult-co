import { UIComponent } from "/content/common/utils/UIComponent.js";

export class SearchInput extends UIComponent {
    constructor(options) {
        super();
        this.placeholder = options.placeholder || 'Search...';
        this.onSearch = options.onSearch;
        this.sounds = options.sounds;
        this.cssVars = options.cssVars;
        this.appInstance = options.appInstance;

        this.element = this.createElement('div', 'search-input-wrapper');
        this.canvas = this.createCanvas(236, 32);
        this.ctx = this.canvas.getContext('2d');
        this.input = this.createElement('input', 'search-input');
        this.input.type = 'text';
        this.input.placeholder = this.placeholder;

        this.element.appendChild(this.canvas);
        this.element.appendChild(this.input);

        this.input.addEventListener('input', () => {
            this.draw();
            if (this.onSearch) {
                this.onSearch(this.input.value);
            }
        });

        this.input.addEventListener('focus', () => {
            this.sounds?.inputFocus?.play();
            this.draw(true);
        });

        this.input.addEventListener('blur', () => {
            this.sounds?.inputBlur?.play();
            this.draw(false);
        });

        this.draw();
    }

    draw(isFocused = false) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, width, height, 6);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = isFocused ? this.cssVars['--ds-accent-blue'] : 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(1, 1, width - 2, height - 2, 5);
        this.ctx.stroke();

        // Search Icon
        this.ctx.fillStyle = this.cssVars['--ds-text-subtle'];
        this.ctx.font = '16px "Font Awesome 6 Free"';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('\uf002', 10, height / 2); // Font Awesome search icon
    }

    get value() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
        this.draw();
    }
}
