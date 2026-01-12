import { UIComponent } from "../UIComponent.js";

export class RadioButton extends UIComponent {
    constructor(options) {
        super(options);
        this.name = options.name; // Group name
        this.value = options.value;
        this.label = options.label || '';
        this.checked = options.checked || false;
        this.size = options.size || 20;
        this.color = options.color || this.app.cssVars['--ds-accent'] || '#0d6efd';
        this.textColor = options.textColor || this.app.cssVars['--ds-text'] || '#eaeaea';
        this.font = options.font || '14px Arial';

        this.createElement();
        this.attachEventListeners();
    }

    createElement() {
        super.createElement('div');
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.cursor = 'pointer';
        this.element.style.marginBottom = '10px';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');

        this.labelElement = document.createElement('span');
        this.labelElement.textContent = this.label;
        this.labelElement.style.marginLeft = '10px';
        this.labelElement.style.color = this.textColor;
        this.labelElement.style.font = this.font;

        this.element.appendChild(this.canvas);
        this.element.appendChild(this.labelElement);

        this.draw();
    }

    attachEventListeners() {
        this.element.addEventListener('click', () => this.toggle());
    }

    toggle() {
        if (!this.checked) {
            this.setChecked(true);
        }
    }

    setChecked(checked) {
        const changed = this.checked !== checked;
        this.checked = checked;
        this.draw();
        if (changed) {
            this.emit('change', { name: this.name, value: this.value, checked: this.checked });
        }
    }

    draw() {
        const ctx = this.ctx;
        const center = this.size / 2;
        const radius = (this.size / 2) - 2;

        ctx.clearRect(0, 0, this.size, this.size);

        // Outer circle
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner circle (if checked)
        if (this.checked) {
            ctx.beginPath();
            ctx.arc(center, center, radius * 0.6, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

export class RadioGroup extends UIComponent {
    constructor(options) {
        super(options);
        this.name = options.name;
        this.options = options.options || []; // { value: 'val', label: 'Label' }
        this.selectedValue = options.initialValue;
        this.radioButtons = [];

        this.createElement();
        this.createRadioButtons();
    }

    createElement() {
        super.createElement('div');
        this.element.className = 'radio-group';
    }

    createRadioButtons() {
        this.options.forEach(option => {
            const radioButton = new RadioButton({
                app: this.app,
                name: this.name,
                value: option.value,
                label: option.label,
                checked: this.selectedValue === option.value
            });

            radioButton.on('change', (detail) => {
                if (detail.checked) {
                    this.selectedValue = detail.value;
                    this.radioButtons.forEach(rb => {
                        if (rb.value !== detail.value) {
                            rb.setChecked(false);
                        }
                    });
                    this.emit('change', { name: this.name, value: this.selectedValue });
                }
            });

            this.radioButtons.push(radioButton);
            this.element.appendChild(radioButton.element);
        });
    }

    getValue() {
        return this.selectedValue;
    }
}
