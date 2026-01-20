---
allowed-tools:
  - Bash
  - Read
  - Task
  - AskUserQuestion
description: Mobile dev loop with file watching, hot reload, and Maestro testing
---

# Maestro Dev - Mobile Development Loop

Start a dev loop that watches source files, triggers rebuilds, runs Maestro tests, and streams JSON logs.

## Setup

Find the runner script:
```bash
RUNNER=$(find ~/.claude/plugins -name "runner.sh" -path "*/maestro-dev/*" 2>/dev/null | head -1)
```

Install dependencies (first run):
```bash
$RUNNER install
```

## Starting Dev Loop

Before starting, check if already running:
```bash
$RUNNER running
```

If not running and user wants to start the dev loop, use AskUserQuestion:
- **Option 1: "Run in background"** - Claude runs it, user can `tail -f` logs
- **Option 2: "Give me the command"** - Claude outputs command for user's terminal

For Option 1 (background):
```bash
$RUNNER dev <platform> <app-id> <src-dir> <flow-file> [build-cmd] &
```

For Option 2 (user terminal):
```bash
$RUNNER shell-cmd <platform> <app-id> <src-dir> <flow-file> [build-cmd]
```

If already running, just report status and offer to read logs.

## Usage

### Full Dev Loop (file watching + rebuild + test)

```bash
$RUNNER dev <platform> <app-id> <src-dir> <flow-file> [build-cmd] [extensions]
```

- `platform`: ios or android
- `app-id`: Bundle ID (iOS) or package name (Android)
- `src-dir`: Directory to watch for changes
- `flow-file`: Maestro flow YAML to run on changes
- `build-cmd`: Optional build command (e.g., "xcodebuild ..." or "./gradlew assembleDebug")
- `extensions`: File extensions to watch (default: swift,kt,java,cs,xaml,dart)

### Maestro Continuous Mode (simpler, test files only)

```bash
$RUNNER continuous ./flows
```

Watches Maestro YAML files and re-runs on save. No rebuild.

### Run Single Test

```bash
$RUNNER test ./flows/login.yaml
```

## Reading Logs

Logs are JSON formatted for easy parsing:

```bash
# Device logs
$RUNNER logs 50 device

# All logs
$RUNNER logs 100 all

# Or read directly
cat /tmp/maestro-dev/device.log | jq 'select(.level == "error")'
```

## Log Files

All logs in `/tmp/maestro-dev/`:
- `device.log` - Device/simulator logs (JSON)
- `runner.log` - Dev loop events (JSON)
- `build.log` - Build output
- `test-result.json` - Last test result

---

USER REQUEST: $*
