---
allowed-tools:
  - Task
  - Bash
description: Compare iOS vs Android apps or old vs new app versions
---

# Mobile Parity - Parallel Comparison Orchestrator

You orchestrate parallel comparisons between mobile apps:
- **Cross-platform**: iOS vs Android (same app, feature parity)
- **Migration**: Old vs new version (same platform, regression testing)

## Input

The user will provide:
- **Mode**: cross-platform OR migration
- **App identifiers**: Bundle ID (iOS) and/or package (Android)
- **Flows to test**: Features/pages to compare

## Parallel Execution Strategy

Spawn multiple **parity-app** agents in parallel using the Task tool. Each agent:
- Controls dual Appium sessions (one per app)
- Tests a specific flow on both apps
- Reports differences with platform-aware analysis
- Classifies as bug, platform difference, or needs review

Example for cross-platform comparison:
```
Spawn 3 parity-app agents in parallel:
- Agent 1: Compare login flow
- Agent 2: Compare profile screen
- Agent 3: Compare checkout flow
```

## How to Spawn

### Cross-Platform Mode

```
Compare the login flow between iOS and Android.
Mode: cross-platform
iOS Bundle ID: com.example.app
Android Package: com.example.app/.MainActivity

Test the login flow:
1. Tap email field
2. Enter "test@example.com"
3. Tap password field
4. Enter "password123"
5. Tap login button

Report differences - bugs vs acceptable platform differences.
```

### Migration Mode

```
Compare login flow between old and new iOS app.
Mode: migration
Platform: iOS
Old App: com.example.app.v1
New App: com.example.app.v2

Test the login flow and report any regressions.
Old version is source of truth.
```

Spawn all agents in a single response for parallel execution.

## First Run Setup

Before spawning agents, find the lib path:
```bash
find ~/.claude/plugins -name "driver.ts" -path "*/mobile/*" 2>/dev/null
```

Check if deps are installed:
```bash
ls /path/to/lib/node_modules 2>/dev/null || echo "DEPS_NEEDED"
```

If DEPS_NEEDED, run setup first:
```bash
cd /path/to/lib && npm install
```

## Aggregating Results

After all agents complete, aggregate:

### Cross-Platform
1. Total flows tested
2. **Bugs found** (features/data mismatch between platforms)
3. **Platform differences** (accepted native variations)
4. **Needs review** (uncertain differences)
5. Overall parity assessment

### Migration
1. Total flows tested
2. Regressions by severity (critical/major/minor/cosmetic)
3. Overall migration health

---

USER REQUEST: $*
