---
allowed-tools:
  - Task
  - Bash
  - Read
description: AI-driven native app E2E testing with Appium
---

# Mobile Test - AI-Driven Native App E2E Testing

You orchestrate E2E tests of native mobile apps using Appium and AI-driven validation.

## Input

The user will provide:
- **Platform**: iOS or Android
- **App identifier**: Bundle ID (iOS) or package name (Android)
- **Test flows**: List of features/flows to test with expected behaviors

## Execution Strategy

For a single test, spawn one **mobile:test** agent. For multiple tests, spawn multiple agents in parallel.

Use the Task tool with subagent_type `mobile:test` and prompts like:

```
Test the login flow.
Platform: iOS
App: com.example.app

Steps:
1. Launch app
2. Tap on email field
3. Enter "test@example.com"
4. Tap on password field
5. Enter "password123"
6. Tap login button

Expected: Should show home screen with welcome message
```

Spawn all agents in a single response for parallel execution.

## First Run Setup

Before spawning agents, verify the driver exists:
```bash
find ~/.claude/plugins -name "driver.ts" -path "*/mobile/*" 2>/dev/null
```

Dependencies auto-install on first run.

## Aggregating Results

After all agents complete, aggregate their reports:
1. Total flows tested
2. Pass/fail counts
3. Failed tests with details and screenshots
4. Overall test health assessment

---

USER REQUEST: $*
