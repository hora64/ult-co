# Additional Features Guide - HomeScreen 3DS

This guide covers the additional features implemented for HomeScreen 3DS.

## 1. onOpen Lambda Function

### Overview
Apps can now define an `onOpen` callback function that is called when the app is about to launch, before the `onClick` handler executes.

### Difference from onSelect
- **onSelect**: Called when app is selected (highlighted) in the grid
- **onOpen**: Called when app is launched/opened (right before onClick)

### Basic Usage

```javascript
// In app.js
export const app = {
  "id": "myApp",
  "icon": "/content/apps/myApp/icon.png",
  
  // Called when app is selected (highlighted)
  "onSelect": (app, appGrid) => {
    console.log(`App ${app.id} was selected`);
  },
  
  // Called when app is about to launch (before onClick)
  "onOpen": (app, appGrid) => {
    console.log(`App ${app.id} is opening...`);
    
    // Example: Pre-launch validation
    if (!app.isReady) {
      console.warn('App not ready to launch');
      return;
    }
    
    // Example: Track launch events
    analytics.track('app_opened', {
      app_id: app.id,
      timestamp: new Date().toISOString()
    });
  },
  
  // Called when app launches
  "onClick": (app, appGrid, languageData) => {
    window.location.href = app.url;
  }
};
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `app` | Object | The full app data object |
| `appGrid` | AppGrid | Reference to the AppGrid instance |

### Use Cases

#### 1. Pre-Launch Validation
```javascript
"onOpen": (app, appGrid) => {
  // Check if user has permission to launch
  if (!user.hasPermission(app.id)) {
    alert('You do not have permission to open this app');
    throw new Error('Permission denied');
  }
}
```

#### 2. Analytics & Tracking
```javascript
"onOpen": (app, appGrid) => {
  // Track detailed launch metrics
  const homeScreen = window.homeScreenApp;
  analytics.track('app_opened', {
    app_id: app.id,
    app_name: app.localizedLabel,
    timestamp: new Date().toISOString(),
    timezone: homeScreen.getUserTimeZone(),
    user_agent: navigator.userAgent
  });
}
```

#### 3. Loading States
```javascript
"onOpen": (app, appGrid) => {
  // Show loading indicator
  document.getElementById('loadingSpinner').style.display = 'block';
  
  // Log launch time
  console.log(`Launching ${app.localizedLabel} at ${new Date().toLocaleString()}`);
}
```

#### 4. State Management
```javascript
"onOpen": (app, appGrid) => {
  // Update global state
  store.dispatch({
    type: 'APP_OPENING',
    payload: { appId: app.id }
  });
  
  // Trigger side effects
  document.dispatchEvent(new CustomEvent('appOpening', { 
    detail: app 
  }));
}
```

#### 5. Conditional Launch Logic
```javascript
"onOpen": (app, appGrid) => {
  const homeScreen = window.homeScreenApp;
  
  // Different behavior based on time of day
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    console.log('Night mode launch');
    app.nightMode = true;
  }
}
```

### Error Handling

Errors in `onOpen` are caught and logged without breaking the app:

```javascript
"onOpen": (app, appGrid) => {
  try {
    // Risky operation
    validateAppState(app);
  } catch (error) {
    console.error('onOpen validation failed:', error);
    // App will still launch unless you throw
  }
}
```

---

## 2. Coordinate Spawns Configuration

### Overview
Define specific spawn positions for apps in the grid using the `coordinateSpawns` configuration.

### Configuration

Edit `content/apps/homeScreen_3DS/config/config.js`:

```javascript
export const gridConfig = {
    totalTileSpaces: 240,
    baseRows: 6,
    
    // App coordinate spawns - define specific positions for apps
    coordinateSpawns: {
        "info": { row: 0, col: 0 },      // Info app at top-left
        "mail": { row: 1, col: 0 },      // Mail app below info
        "settings": { row: 2, col: 0 },  // Settings below mail
        "myApp": { row: 0, col: 5 },     // Custom app at specific position
    }
};
```

### Coordinate System

- **row**: Vertical position (0 = top, 5 = bottom in base grid)
- **col**: Horizontal position (0 = left, increases to right)
- **Base Grid**: Always 6 rows × N columns (visual changes with size)

### Examples

#### Fixed Layout for System Apps
```javascript
coordinateSpawns: {
    // System apps in first column
    "info": { row: 0, col: 0 },
    "mail": { row: 1, col: 0 },
    "settings": { row: 2, col: 0 },
    
    // User apps start from second column
    "gameApp": { row: 0, col: 1 },
    "musicApp": { row: 1, col: 1 },
}
```

#### Grouped by Category
```javascript
coordinateSpawns: {
    // Communication apps (column 0)
    "mail": { row: 0, col: 0 },
    "chat": { row: 1, col: 0 },
    
    // Entertainment apps (column 1)
    "music": { row: 0, col: 1 },
    "video": { row: 1, col: 1 },
    
    // Productivity apps (column 2)
    "notes": { row: 0, col: 2 },
    "calendar": { row: 1, col: 2 },
}
```

#### Special Positions
```javascript
coordinateSpawns: {
    // Important apps at top
    "emergency": { row: 0, col: 0 },
    
    // Frequently used in center
    "launcher": { row: 2, col: 3 },
    
    // Settings at bottom
    "settings": { row: 5, col: 0 },
}
```

### Behavior

- Apps without spawn coordinates fill in remaining spaces
- Coordinates are in **base grid** (6 rows) regardless of visual size
- Invalid coordinates are ignored (app placed in next available space)
- Duplicate coordinates: last app wins

### Notes

- This feature is currently **configured but not fully implemented** in the grid layout logic
- Will be fully functional in a future update
- Use for planning your app layout

---

## 3. Body Background Canvas Position

### Overview
The body background canvas is now positioned in the top screen container with z-index -1, making it appear behind all top screen content.

### Implementation Details

**Canvas Properties:**
- **Size**: 400×240px (same as top screen)
- **Position**: Absolute, inside top screen container
- **Z-Index**: -1 (behind all top screen elements)
- **Location**: `this.topScreenElement`

**Previous vs Current:**
```javascript
// BEFORE: Body was added to document.body
document.body.insertBefore(canvas, document.body.firstChild);

// NOW: Canvas is in top screen with z-index -1
this.topScreenElement.insertBefore(canvas, this.topScreenElement.firstChild);
canvas.style.zIndex = '-1';
```

### Advantages

1. **Layering**: Properly behind top screen content
2. **Containment**: Scoped to top screen container
3. **Consistency**: Same positioning as other top screen canvases
4. **Control**: Easier to manage with other top screen elements

### CSS Styling

```css
#body-background-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 400px;
    height: 240px;
    z-index: -1;
    image-rendering: crisp-edges;
    pointer-events: none;
}
```

### Usage

The canvas is automatically created and managed by `HomeScreenApp`:

```javascript
// Automatic - no action needed
this.bodyBackgroundCanvas = document.createElement('canvas');
this.bodyBackgroundCanvas.id = 'body-background-canvas';
// ... positioned in top screen with z-index -1
```

### Customization

Change background color via CSS variable:
```css
:root {
    --hs-body-canvas-bg: #222222; /* Dark gray */
}
```

Or programmatically:
```javascript
this.backgroundManager = new BackgroundManager(
    this.topCanvas, 
    this.bottomCanvas, 
    { 
        bodyCanvas: this.bodyBackgroundCanvas,
        bodyColor: '#1a1a1a' // Custom color
    }
);
```

---

## 4. Timezone Support

### Overview
Full timezone support with user timezone detection, storage, formatting, and utility methods.

### Basic Usage

#### Get User Timezone
```javascript
const homeScreen = window.homeScreenApp;
const timezone = homeScreen.getUserTimeZone();
// Returns: "America/New_York", "Europe/London", etc.
```

#### Set Timezone
```javascript
homeScreen.setUserTimeZone('America/Los_Angeles');
// Validates and stores in localStorage
```

#### Format Dates
```javascript
const date = new Date();
const formatted = homeScreen.formatDate(date);
// Returns: "December 21, 2024, 03:45 PM"

// Custom format
const customFormat = homeScreen.formatDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});
// Returns: "Saturday, Dec 21, 2024, 03:45:30 PM"
```

#### Get Current Time
```javascript
const now = homeScreen.getCurrentTime();
// Returns: Date object
```

### API Reference

#### `getUserTimeZone()`
Returns the user's current timezone.

```javascript
getUserTimeZone(): string
```

**Returns:** IANA timezone identifier (e.g., 'America/New_York')

**Sources (in order):**
1. `this.settings.timeZone`
2. `localStorage.getItem('userTimeZone')`
3. `Intl.DateTimeFormat().resolvedOptions().timeZone`
4. `'UTC'` (fallback)

#### `setUserTimeZone(timeZone)`
Sets the user's timezone with validation.

```javascript
setUserTimeZone(timeZone: string): void
```

**Parameters:**
- `timeZone`: IANA timezone identifier

**Example:**
```javascript
homeScreen.setUserTimeZone('Asia/Tokyo');
homeScreen.setUserTimeZone('Europe/Paris');
homeScreen.setUserTimeZone('America/New_York');
```

**Validation:**
- Throws error for invalid timezone
- Stores in localStorage
- Updates `this.settings.timeZone`

#### `formatDate(date, options)`
Formats a date according to user's timezone and locale.

```javascript
formatDate(date: Date|string|number, options?: Object): string
```

**Parameters:**
- `date`: Date to format (Date object, ISO string, or timestamp)
- `options`: Intl.DateTimeFormat options (optional)

**Default Options:**
```javascript
{
    timeZone: userTimeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
}
```

**Examples:**
```javascript
// Default format
formatDate(new Date());
// "December 21, 2024, 03:45 PM"

// Short date
formatDate(new Date(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});
// "Dec 21, 2024"

// Time only
formatDate(new Date(), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});
// "03:45:30 PM"

// Full datetime with weekday
formatDate(new Date(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});
// "Saturday, December 21, 2024, 03:45:30 PM"
```

#### `getCurrentTime()`
Gets the current time.

```javascript
getCurrentTime(): Date
```

**Returns:** Current Date object

### Use Cases

#### 1. Display Current Time with Timezone
```javascript
"onSelect": (app, appGrid) => {
    const homeScreen = window.homeScreenApp;
    const time = homeScreen.formatDate(new Date(), {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const tz = homeScreen.getUserTimeZone();
    console.log(`Current time: ${time} (${tz})`);
}
```

#### 2. Log Events with Timezone
```javascript
"onOpen": (app, appGrid) => {
    const homeScreen = window.homeScreenApp;
    const timestamp = homeScreen.formatDate(new Date());
    
    analytics.track('app_opened', {
        app_id: app.id,
        timestamp: timestamp,
        timezone: homeScreen.getUserTimeZone()
    });
}
```

#### 3. Time-Based Behavior
```javascript
"onSelect": (app, appGrid) => {
    const homeScreen = window.homeScreenApp;
    const hour = homeScreen.getCurrentTime().getHours();
    
    if (hour >= 22 || hour < 6) {
        app.theme = 'night';
        console.log('Night mode enabled');
    } else {
        app.theme = 'day';
    }
}
```

#### 4. Timezone Settings UI
```javascript
// In settings app
const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
];

timezones.forEach(tz => {
    const button = createButton(tz);
    button.onclick = () => {
        homeScreen.setUserTimeZone(tz);
        alert(`Timezone set to ${tz}`);
    };
});
```

#### 5. Scheduled Events
```javascript
"onSelect": (app, appGrid) => {
    const homeScreen = window.homeScreenApp;
    const now = homeScreen.getCurrentTime();
    
    // Check if event should be shown
    const eventDate = new Date('2024-12-25T00:00:00');
    if (now < eventDate) {
        const daysLeft = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        console.log(`${daysLeft} days until event`);
    }
}
```

### Storage

Timezone is persisted in localStorage:

```javascript
// Stored key
localStorage.getItem('userTimeZone');

// Set by
homeScreen.setUserTimeZone(tz);

// Auto-loaded on startup
```

### Settings Integration

The timezone is stored in `this.settings`:

```javascript
this.settings = {
    language: 'en-US',
    timeZone: 'America/New_York'
};
```

This allows other components to access it:
```javascript
const tz = this.settings.timeZone;
```

### Validation

Invalid timezones are caught:

```javascript
try {
    homeScreen.setUserTimeZone('Invalid/Timezone');
} catch (error) {
    console.error('Invalid timezone:', error);
}
```

Valid IANA timezones:
- `America/New_York`
- `Europe/London`
- `Asia/Tokyo`
- `UTC`
- etc.

Full list: [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## Complete Example App

```javascript
export const app = {
  "id": "advancedApp",
  "icon": "/content/apps/advancedApp/icon.png",
  
  // Selection callback
  "onSelect": (app, appGrid) => {
    const homeScreen = window.homeScreenApp;
    const time = homeScreen.formatDate(new Date(), {
      hour: '2-digit',
      minute: '2-digit'
    });
    console.log(`Selected at ${time}`);
  },
  
  // Pre-launch callback
  "onOpen": (app, appGrid) => {
    const homeScreen = window.homeScreenApp;
    
    // Log with timezone
    const launchTime = homeScreen.formatDate(new Date());
    const tz = homeScreen.getUserTimeZone();
    
    analytics.track('app_opened', {
      app_id: app.id,
      timestamp: launchTime,
      timezone: tz
    });
    
    // Pre-launch validation
    if (!app.isReady) {
      throw new Error('App not ready');
    }
  },
  
  // Launch callback
  "onClick": (app, appGrid, languageData) => {
    const homeScreen = window.homeScreenApp;
    const currentTime = homeScreen.formatDate(new Date());
    
    alert(`Launching ${app.localizedLabel}\nTime: ${currentTime}`);
    window.location.href = app.url;
  }
};
```

---

## Testing Checklist

### onOpen Callback
- [ ] Add `onOpen` to test app
- [ ] Launch app via double-click
- [ ] Verify callback is called before onClick
- [ ] Check console for logs
- [ ] Test error handling

### Coordinate Spawns
- [ ] Add spawn coordinates to config
- [ ] Reload homescreen
- [ ] Verify apps appear at specified positions
- [ ] Test with different grid sizes
- [ ] Test invalid coordinates

### Body Background Position
- [ ] Inspect element `#body-background-canvas`
- [ ] Verify it's inside `#topScreen`
- [ ] Check z-index is -1
- [ ] Verify it's behind all top screen content
- [ ] Test with different background colors

### Timezone Support
- [ ] Call `getUserTimeZone()` and verify output
- [ ] Set timezone with `setUserTimeZone()`
- [ ] Refresh page and verify timezone persists
- [ ] Format dates with `formatDate()`
- [ ] Test with different timezones
- [ ] Test error handling with invalid timezone

---

## Troubleshooting

### onOpen Not Called
1. Verify function syntax is correct
2. Check browser console for errors
3. Ensure app is being launched (not just selected)
4. Test with simple console.log first

### Coordinate Spawns Not Working
1. Check config.js syntax
2. Verify coordinateSpawns object format
3. Ensure app IDs match exactly
4. Note: Full implementation pending in grid logic

### Body Canvas Not Visible
1. Check if canvas exists in top screen
2. Verify z-index is -1
3. Check CSS styling
4. Ensure background color is set

### Timezone Issues
1. Check browser console for timezone errors
2. Verify timezone string is valid IANA identifier
3. Clear localStorage and try again
4. Check if Intl.DateTimeFormat is supported

---

## Status

✅ **onOpen Lambda** - Implemented and tested  
⚠️ **Coordinate Spawns** - Configured, full implementation pending  
✅ **Body Canvas Position** - Implemented (top screen, z-index -1)  
✅ **Timezone Support** - Fully implemented with utilities  

---

## See Also

- `NEW_FEATURES_GUIDE.md` - Original features guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `config.js` - Configuration file

---

**Last Updated:** 2024  
**Version:** 2.0.0
