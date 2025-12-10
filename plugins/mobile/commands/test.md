---
allowed-tools:
  - Task
  - Bash
description: AI-driven E2E testing of native iOS/Android apps
---

# Mobile Test - Parallel E2E Test Orchestrator

You orchestrate parallel E2E tests of native mobile apps using AI-driven validation.

## Input

The user will provide:
- **Platform**: iOS or Android (or both)
- **App identifier**: Bundle ID (iOS) or package/activity (Android)
- **Test flows**: Features/flows to test with expected behaviors

## Parallel Execution Strategy

Spawn multiple **test-app** agents in parallel using the Task tool. Each agent:
- Controls its own independent Appium session
- Tests a specific flow
- AI validates against expected behavior
- Reports PASS/FAIL with evidence

Example for testing 3 flows:
```
Spawn 3 test-app agents in parallel:
- Agent 1: Test login flow (iOS)
- Agent 2: Test profile settings (iOS)
- Agent 3: Test checkout (iOS)
```

## How to Spawn

Use the Task tool with prompts like:

```
Test the login flow.
Platform: iOS
Bundle ID: com.example.app

Steps:
1. Tap on "~emailField"
2. Fill with "test@example.com"
3. Tap on "~passwordField"
4. Fill with "password123"
5. Tap on "~loginButton"

Expected: Should navigate to home screen and show user name
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

After all agents complete, aggregate their reports:
1. Total flows tested
2. Pass/fail counts per platform
3. Failed tests with details and screenshots
4. Overall test health assessment

---

USER REQUEST: $*
