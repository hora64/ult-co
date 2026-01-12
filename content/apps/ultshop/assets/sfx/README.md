# UltShop Sound Effects

This directory contains sound effect assets for UltShop:

- Button click sounds
- Success/error notification sounds
- Background music (optional)
- Transition sounds

## Usage

Sounds can be loaded using Howler.js or native Web Audio API.

Example:
```javascript
const clickSound = new Audio('/content/apps/ultshop/assets/sfx/click.wav');
clickSound.play();
```

## Format Guidelines

- Format: WAV, MP3, or OGG
- Keep file sizes small (< 100KB per effect)
- Use 44.1kHz sample rate
