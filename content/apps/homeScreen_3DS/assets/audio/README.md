# HomeScreen 3DS Audio Assets

This directory contains audio assets for the 3DS-style home screen.

## Background Music

### homescreen_bgm.ogg
- **Purpose**: Background music that loops while on the home screen
- **Format**: OGG Vorbis (recommended for web compatibility)
- **Duration**: 30-120 seconds (will loop)
- **Volume**: Controlled via `--hs-background-music-volume` CSS variable (default: 0.3)
- **Configuration**: Set path in `--hs-background-music` CSS variable

**Placeholder**: Currently using a silent placeholder. Replace with actual music file.

## Sound Effects

Sound effects are defined in CSS variables and can be customized per theme:

- `--hs-sound-click`: Click/tap sound
- `--hs-sound-select`: Selection change sound
- `--hs-sound-launch`: App launch sound
- `--hs-sound-size-up`: Icon size increase sound
- `--hs-sound-size-down`: Icon size decrease sound
- `--hs-sound-grab`: Drag/grab sound
- `--hs-sound-open-box`: Gift box unwrap sound

## File Formats

Supported audio formats (in order of preference):
1. **OGG Vorbis** (.ogg) - Best web compatibility, good compression
2. **MP3** (.mp3) - Universal support, larger file size
3. **WAV** (.wav) - Uncompressed, highest quality, large file size

## Adding Custom Audio

1. Place your audio files in this directory
2. Update the CSS variables in `content/apps/homeScreen_3DS/assets/js/styles.js`
3. Or override in your custom theme's CSS

Example:
```css
:root {
    --hs-background-music: '/content/apps/homeScreen_3DS/assets/audio/my_custom_music.ogg';
    --hs-background-music-volume: 0.5;
    --hs-sound-click: '/content/apps/homeScreen_3DS/assets/audio/sfx/click.ogg';
}
```

## Music Controls

Background music can be controlled via the HomeScreenApp instance:

```javascript
// Access the app instance
const homeScreen = window.homeScreenApp;

// Play music
homeScreen.playBackgroundMusic();

// Stop music
homeScreen.stopBackgroundMusic();

// Toggle music on/off
homeScreen.toggleBackgroundMusic();

// Set volume (0.0 to 1.0)
homeScreen.setBackgroundMusicVolume(0.5);
```

## Notes

- Background music auto-plays 1 second after app initialization (if not muted)
- User preferences (muted state, volume) are saved to localStorage
- Music will loop indefinitely if `--hs-background-music-loop` is set to `true`
- All audio respects the browser's autoplay policies
