# mobile

Mobile testing with Appium from Claude Code or Codex.
The host inspects screenshots and UI hierarchy to control the app.

## Agents

| Agent | Description |
|-------|-------------|
| `mobile:test` | Single app E2E testing |
| `mobile:parity` | Compare iOS vs Android, or old vs new versions side-by-side |
| `mobile:test-runner` | Run existing Maestro flow files |

Claude Code exposes `/mobile:test`, `/mobile:parity`, `/mobile:dev`, and `/mobile:test-runner`.
In Codex, select those skills from the `mobile` plugin.
See the [marketplace setup](../../README.md#install).

## Setup

Install the dependencies in `lib/package.json` before the first driver invocation.
The [driver reference](references/driver.md) gives the commands.
Appium starts when a test needs it. Devices and the target app must be available.
Maestro workflows also require Maestro and a file watcher for the development loop.

## Terminal Command Generation

Use `shell-cmd` to print a development-loop command:

```bash
bash plugins/mobile/lib/runner.sh shell-cmd ios com.example.app "./source folder" "./flows/login test.yaml"
```

Run this example from the repository root.
The runner preserves paths containing spaces.
This operation does not create a log directory or start the loop.
The `dev` skill skips dependency checks when the user requests only a terminal command.
It works even when `MAESTRO_DEV_LOGS` points to an unusable directory.
The generated `dev` command still requires a writable log directory when executed.

## How It Works

1. **Start session** - Connects to simulator or device
2. **Capture state** - Screenshot + UI hierarchy XML
3. **Inspect screenshot** - Check the displayed state
4. **Read hierarchy** - Find element selectors
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
Use one controller per device. Migration comparisons use two explicit device identifiers and separate sessions.
Two iOS sessions also require different WebDriverAgent ports. See the [driver reference](references/driver.md).
