# Audio System Implementation Summary

## Overview
This document describes the new audio system implementation for homeScreen_3DS, including background music support and sound effect placeholders.

## Background Music System

### Configuration (CSS Variables)

```css
:root {
    /* Background Music Configuration */
    --hs-background-music: ''; /* Path to audio file (.ogg/.mp3) or empty to disable */
    --hs-background-music-volume: 0.3; /* Volume level (0.0 to 1.0) */
    --hs-background-music-loop: true; /* Whether to loop the music */
}
```

### API Methods

**HomeScreenApp** now includes the following music control methods:

```javascript
// Initialize music (called automatically during app startup)
initBackgroundMusic()

// Play background music
playBackgroundMusic()

// Stop background music
stopBackgroundMusic()

// Toggle music on/off (returns playing state)
toggleBackgroundMusic()

// Set volume (0.0 to 1.0)
setBackgroundMusicVolume(volume)
```

### Usage Example

```javascript
// Access the global instance
const homeScreen = window.homeScreenApp;

// Play music
homeScreen.playBackgroundMusic();

// Adjust volume
homeScreen.setBackgroundMusicVolume(0.5);

// Toggle mute
const isPlaying = homeScreen.toggleBackgroundMusic();
console.log('Music playing:', isPlaying);
```

### Features

1. **Auto-Play**: Music starts 1 second after app initialization (if not muted)
2. **Persistent Preferences**: Mute state and volume saved to localStorage
3. **Graceful Fallback**: Handles missing audio files without errors
4. **Browser Compliance**: Respects autoplay policies
5. **Theme Support**: Can be configured per-theme via CSS variables

### File Structure

```
content/apps/homeScreen_3DS/assets/audio/
├── README.md                          # Audio system documentation
├── homescreen_bgm.placeholder.txt     # Placeholder for music file
└── [homescreen_bgm.ogg]               # Actual music file (add your own)
```

## Sound Effects

### Available Sound Effect Slots

All sound effects are configurable via CSS variables:

```css
:root {
    /* Sound Effect Paths */
    --hs-sound-click: '/content/common/sfx/select6.ogg';
    --hs-sound-select: '/content/common/sfx/select5.ogg';
    --hs-sound-launch: '/content/common/sfx/select3.ogg';
    --hs-sound-size-up: '/content/common/sfx/select2.ogg';
    --hs-sound-size-down: '/content/common/sfx/select.ogg';
    --hs-sound-grab: '/content/common/sfx/select.ogg';
    --hs-sound-open-box: '/content/common/sfx/open.ogg';
}
```

### Sound Effect Usage

Sound effects are triggered automatically by the UI:

- **click**: When tapping/clicking an app icon
- **select**: When changing selection (keyboard navigation)
- **launch**: When opening an app
- **sizeup**: When increasing icon size
- **sizedown**: When decreasing icon size
- **grab**: When starting to drag an icon
- **openbox**: When unwrapping a gift box

## Adding Custom Audio

### Step 1: Prepare Audio Files

**Recommended Format**: OGG Vorbis (.ogg)
- Best web compatibility
- Good compression
- Supported by all modern browsers

**Alternative Format**: MP3 (.mp3)
- Universal support
- Slightly larger file size

**Specifications**:
- Sample Rate: 44100 Hz
- Bitrate: 128-192 kbps (music), 64-128 kbps (sound effects)
- Channels: Stereo (music), Mono (sound effects)

### Step 2: Add Files to Project

**Background Music**:
```
content/apps/homeScreen_3DS/assets/audio/homescreen_bgm.ogg
```

**Sound Effects**:
```
content/common/sfx/
├── select6.ogg    (click)
├── select5.ogg    (select)
├── select3.ogg    (launch)
├── select2.ogg    (size up)
├── select.ogg     (size down / grab)
└── open.ogg       (open box)
```

### Step 3: Update CSS Variables

**In styles.js** or **your custom theme**:

```javascript
--hs-background-music: '/content/apps/homeScreen_3DS/assets/audio/homescreen_bgm.ogg';
--hs-sound-click: '/content/common/sfx/click.ogg';
--hs-sound-select: '/content/common/sfx/select.ogg';
// ... etc
```

## Theme Integration

Themes can override audio settings by providing custom CSS variables:

```javascript
// In your theme definition
export const customTheme = {
    cssVars: {
        '--hs-background-music': '/themes/myTheme/music.ogg',
        '--hs-background-music-volume': '0.4',
        '--hs-sound-click': '/themes/myTheme/sfx/click.ogg',
        // ... other overrides
    }
};
```

## Browser Autoplay Policies

Modern browsers restrict autoplay with sound. The music system handles this:

1. **User Interaction**: Music only plays after user has interacted with the page
2. **Delayed Start**: 1-second delay allows for interaction
3. **Graceful Fallback**: If autoplay is blocked, music won't start (no errors)

**Workaround**: If music doesn't auto-play, add a "Start Music" button:

```javascript
document.getElementById('startMusicBtn').addEventListener('click', () => {
    window.homeScreenApp.playBackgroundMusic();
});
```

## localStorage Keys

The audio system uses these localStorage keys:

- `homeScreen_musicMuted`: Boolean string ('true' or 'false')
- `homeScreen_musicVolume`: Float string (e.g., '0.3')

## Performance Considerations

1. **Async Loading**: Audio files load asynchronously, don't block UI
2. **Lazy Initialization**: Music initialized after fonts and core UI
3. **Memory Management**: Only one music track loaded at a time
4. **CPU Usage**: Minimal (handled by Web Audio API)

## Dependencies

- **Howler.js**: Required for audio playback
  - Loaded from CDN or local copy
  - Handles cross-browser audio compatibility
  - Provides audio sprite support (future enhancement)

## Accessibility

**Future Enhancement**: Add audio accessibility options:
- Toggle all sounds on/off
- Individual sound effect control
- Visual indicators for audio events
- Closed captions for audio cues

## Testing

To test the audio system:

1. **With Music**:
   ```javascript
   // Set a music file
   document.documentElement.style.setProperty('--hs-background-music', '/path/to/music.ogg');
   window.homeScreenApp.initBackgroundMusic();
   window.homeScreenApp.playBackgroundMusic();
   ```

2. **Volume Control**:
   ```javascript
   window.homeScreenApp.setBackgroundMusicVolume(0.5);
   ```

3. **Toggle Mute**:
   ```javascript
   window.homeScreenApp.toggleBackgroundMusic();
   ```

## Troubleshooting

**Music doesn't play**:
1. Check browser console for errors
2. Verify audio file exists at specified path
3. Check browser autoplay policy
4. Ensure Howler.js is loaded
5. Try manual play: `window.homeScreenApp.playBackgroundMusic()`

**Sound effects don't play**:
1. Verify sound files exist
2. Check CSS variable paths
3. Ensure AppGridSound is initialized
4. Check Howler.js global volume

**Performance issues**:
1. Reduce music bitrate (try 128 kbps)
2. Use OGG instead of MP3
3. Compress sound effects
4. Check browser audio API support

## Future Enhancements

1. **Audio Sprites**: Combine sound effects into single file
2. **Playlist System**: Support multiple music tracks
3. **Crossfade**: Smooth transitions between tracks
4. **Visualizer**: Add audio visualization to banner
5. **Per-App Audio**: Apps can override background music
6. **Sound Themes**: Bundle sound effects with themes
7. **Adaptive Volume**: Auto-adjust based on time of day

## License Considerations

**Important**: Ensure all audio files are properly licensed:
- Use royalty-free music
- Credit original creators
- Respect attribution requirements
- Consider Creative Commons licenses

**Recommended Sources**:
- Freesound.org (sound effects)
- Incompetech.com (music)
- OpenGameArt.org (game audio)
- YouTube Audio Library (royalty-free)

---

**Implementation Complete**: ✅
**Build Status**: ✅ Successful
**Backward Compatible**: ✅ Yes
