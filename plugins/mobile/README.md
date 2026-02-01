# mobile

AI-driven mobile testing with Appium. Claude can see screenshots, read UI hierarchy, and interact with apps.

## Agents

| Agent | Description |
|-------|-------------|
| `mobile:test` | Single app E2E testing - Claude drives the app interactively |
| `mobile:parity` | Compare iOS vs Android, or old vs new versions side-by-side |

## Setup

Dependencies auto-install on first run. No manual setup required.

## How It Works

1. **Start session** - Connects to simulator or device
2. **Capture state** - Screenshot + UI hierarchy XML
3. **Claude views screenshot** - Sees what's on screen
4. **Claude reads hierarchy** - Finds element selectors
5. **Execute action** - Tap, fill, swipe, etc.
6. **Repeat** - AI-driven exploration

## Actions

```json
{
  "type": "tap | fill | swipe | scroll | back | launch | longPress | wait",
  "selector": "~accessibilityId or //xpath",
  "value": "text for fill",
  "direction": "up | down | left | right",
  "ms": 1000
}
```

## Selectors

Prefer accessibility IDs (prefix with `~`):
- iOS: `~loginButton` → `accessibilityIdentifier`
- Android: `~loginButton` → `content-desc`
- SwiftUI: `.accessibilityIdentifier("loginButton")`
- Compose: `Modifier.testTag("loginButton")`

Fallback to XPath:
- iOS: `//XCUIElementTypeButton[@name="Login"]`
- Android: `//android.widget.Button[@text="Login"]`

## Requirements

- **iOS**: Xcode CLI tools, Simulator or physical device
- **Android**: ADB, Emulator or physical device
- **Node.js**: For Appium server

## Session Files

Sessions persist in `/tmp/mobile-sessions/` for reconnection across CLI calls.
