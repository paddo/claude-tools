# mobile

Mobile testing with Maestro: file watching, dev loop, parity testing, JSON logs.

## Quick Start

```bash
# Install deps
/mobile:dev install

# Run single test
/mobile:dev test ./flows/smoke.yaml

# Continuous mode (watches flow files)
/mobile:dev continuous ./flows

# Full dev loop (watch source → rebuild → test)
/mobile:dev dev ios com.example.app ./src ./flows/smoke.yaml "xcodebuild -scheme App"

# Parity test (two devices)
/mobile:dev parity ./flows/smoke.yaml <device1-udid> <device2-udid> primary secondary
```

## Commands

| Command | Description |
|---------|-------------|
| `install` | Install Maestro + fswatch |
| `test <flow>` | Run single test |
| `continuous <dir>` | Watch flow files, re-run on change |
| `dev <plat> <app> <src> <flow> [cmd]` | Full dev loop with file watching |
| `parity <flow> <dev1> <dev2> [l1] [l2]` | Run flow on two devices, compare |
| `devices` | List available iOS/Android devices |
| `logs [n] [type]` | Show recent logs |
| `running` | Check if dev loop is running |
| `stop-dev` | Stop the dev loop |

## Features

- **File watching**: fswatch (macOS) / inotifywait (Linux)
- **Auto-rebuild**: Triggers build command on source changes
- **Maestro testing**: Fast, reliable, built-in waits
- **Parity testing**: Compare iOS vs Android, or old vs new versions
- **JSON logs**: Device logs streamed for Claude Code visibility
- **Physical devices**: Works with real devices, not just simulators

## Log Files

All in `/tmp/maestro-dev/`:

| File | Content |
|------|---------|
| `device.log` | Device/simulator logs (JSON) |
| `runner.log` | Dev loop events (JSON) |
| `build.log` | Build command output |
| `test-result.log` | Last test result |

## Maestro Flow Example

```yaml
# flows/login.yaml
appId: com.example.app
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Welcome"
- takeScreenshot: /tmp/maestro-dev/login-success.png
```

## Requirements

- **iOS**: Xcode CLI tools, Simulator or device
- **Android**: ADB, Emulator or device
- **macOS**: Homebrew (for fswatch)
- **Linux**: apt/yum (for inotify-tools)

Dependencies auto-install on first run.
