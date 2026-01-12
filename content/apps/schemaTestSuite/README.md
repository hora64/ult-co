# Schema Test Suite

Comprehensive testing suite for all app.js schema configurations.

## Purpose

This test suite demonstrates every possible app configuration option with proper null handling for unused properties.

## Test Apps

### 1. Minimal App (`schema_test_minimal`)
Tests the absolute minimum required configuration:
- Only `id`, `locales`, `icon`, and `onClick`
- All optional properties explicitly set to `null`
- Use case: Simplest possible app

### 2. Static Icon (`schema_test_static`)
Single-layer static icon:
- One icon, no layers
- No animation
- `baseIcon: false`
- Use case: Standard apps

### 3. Base Icon (`schema_test_baseicon`)
Two-layer icon rendering:
- `baseIcon: true`
- `backgroundIcon` + `icon` overlay
- Use case: Apps with background/foreground layers

### 4. Animated Icon (`schema_test_animated`)
Sprite sheet animation:
- `animated: true`
- `animationFrames: 4`
- `animationSpeed: 150`
- Use case: Animated app icons

### 5. Wrapped App (`schema_test_wrapped`)
Gift box wrapper:
- `unopened: true`
- Gift box icon shown initially
- Can be unwrapped
- Use case: Downloadable content, presents

### 6. Custom Selector (`schema_test_selector`)
Per-app selector override:
- `selectorOverride` enabled
- Blue selector glow
- Use case: Themed apps

### 7. Custom Buttons (`schema_test_buttons`)
Action button color override:
- `actionButtonColors` configured
- Purple button theme
- Use case: Branded apps

### 8. onSelect Test (`schema_test_onselect`)
Selection callback:
- `onSelect` lambda function
- Logs when app is selected
- Use case: Analytics, state management

### 9. onOpen Test (`schema_test_onopen`)
Launch callback:
- `onOpen` lambda function
- Logs when app is launching
- Use case: Pre-launch validation, tracking

### 10. All Features (`schema_test_all`)
Kitchen sink configuration:
- All features enabled simultaneously
- Tests feature compatibility
- Use case: Comprehensive testing

## Schema Properties Reference

### Required
- `id`: Unique identifier
- `enabled`: Enable/disable flag
- `locales`: Localization strings
- `icon`: Icon image path
- `permissions`: Access control
- `onClick`: Launch handler

### Icon Configuration
- `icon`: Main icon path (required)
- `actualIcon`: Actual icon (when wrapped)
- `baseIcon`: Enable two-layer rendering
- `backgroundIcon`: Background layer
- `baseImage`: Base layer (alias)
- `wrapIcon`: Gift box icon
- `unopenedIcon`: Wrapped state icon

### Banner Configuration
- `banner`: Banner image path
- `bannerAnimated`: Enable banner animation
- `bannerModule`: Custom banner module
- `bannerJingle`: Banner sound
- `jingle`: App jingle (alias)

### Unwrap Configuration
- `unopened`: Start in wrapped state
- `unopenedBannerModule`: Wrapped banner module
- `unopenedJingle`: Wrapped state sound

### Feature Overrides
- `selectorOverride`: Custom selector glow
  - `enabled`: Enable override
  - `src`: Selector image path
- `actionButtonColors`: Button color theme
  - `backgroundColor`
  - `hoverBackgroundColor`
  - `pressedBackgroundColor`
  - `disabledBackgroundColor`
  - `textColor`

### Callbacks
- `onSelect`: Selection callback
  - Called when app is selected
  - Parameters: `(app, appGrid)`
- `onOpen`: Launch callback
  - Called before app launches
  - Parameters: `(app, appGrid)`

### Animation
- `animated`: Enable animation
- `animationFrames`: Frame count
- `animationSpeed`: Ms per frame

### Permissions
- `level`: Permission level
- `launchable`: Can be launched
- `unwrappable`: Can be unwrapped

## Null Handling

All optional properties should be explicitly set to `null` when unused:

```javascript
{
  // Used properties
  "icon": "/path/to/icon.png",
  "unopened": false,
  
  // Unused properties (explicit null)
  "actualIcon": null,
  "baseIcon": null,
  "backgroundIcon": null,
  "baseImage": null,
  "wrapIcon": null,
  "unopenedIcon": null,
  "banner": null,
  "bannerAnimated": null,
  "bannerModule": null,
  "bannerJingle": null,
  "jingle": null,
  "unopenedBannerModule": null,
  "unopenedJingle": null,
  "selectorOverride": null,
  "actionButtonColors": null,
  "onSelect": null,
  "onOpen": null,
  "animated": null,
  "animationFrames": null,
  "animationSpeed": null
}
```

## Testing

To test the schema:

1. **Load the Suite**
   - Schema Test Suite app appears in grid
   - Click to see test list

2. **Individual Tests**
   - Each test app demonstrates specific features
   - Check console for callback logs
   - Inspect behavior

3. **Verify Null Handling**
   - Ensure null properties don't cause errors
   - Check fallback values work
   - Validate optional features

## Schema Validation

The test suite validates:

✅ **Required Fields**: All apps have required properties  
✅ **Optional Fields**: Null values handled correctly  
✅ **Type Safety**: Correct data types for each field  
✅ **Feature Compatibility**: Multiple features work together  
✅ **Callbacks**: Lambda functions execute properly  
✅ **Rendering**: Icons render correctly for all configs  
✅ **Animation**: Animation system works  
✅ **Unwrapping**: Gift box system functions  
✅ **Overrides**: Custom selectors and buttons apply  
✅ **Fallbacks**: Default values used when properties are null  

## Files

- `app.js` - Main export and index app
- `schemaTests.js` - All test app configurations
- `README.md` - This documentation

## Usage

```javascript
// Import all tests
import * as tests from '/content/apps/schemaTestSuite/schemaTests.js';

// Or import individually
import { minimalApp, baseIconApp } from '/content/apps/schemaTestSuite/schemaTests.js';

// Use in app config loader
const testApps = [
    tests.minimalApp,
    tests.staticIconApp,
    // ...
];
```

## See Also

- `content/apps/homeScreen_3DS/docs/ICON_SCHEMA_V2.md` - Full schema documentation
- `content/apps/homeScreen_3DS/docs/ICON_EXAMPLES.js` - Additional examples
- `content/apps/featureTestApp/app.js` - Feature demonstration

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Complete
