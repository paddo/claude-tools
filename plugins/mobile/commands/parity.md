---
allowed-tools:
  - Task
  - Bash
  - Read
description: Compare iOS vs Android or old vs new app versions
---

# Mobile Parity - Cross-Platform and Migration Testing

You orchestrate parity tests comparing mobile apps side-by-side using Appium.

## Modes

- **Cross-platform**: Compare iOS vs Android (same app, different platforms)
- **Migration**: Compare old vs new version (same platform)

## Input

The user will provide:
- **Mode**: cross-platform or migration
- **App identifiers**: For both sides being compared
- **Flows to test**: Features to verify for parity

## Execution Strategy

**IMPORTANT:** Only ONE agent per simulator/device. Do NOT spawn parallel agents - they will fight over the same Appium session.

- **Single device available:** Use `mobile:test` agent for solo audit (no comparison)
- **Two devices available:** Use `mobile:parity` agent with both device UDIDs specified
- **Multiple flows:** Execute sequentially within a single agent, NOT parallel agents

Use the Task tool with subagent_type `mobile:parity` and prompts like:

### Cross-Platform Example
```
Test login flow parity between iOS and Android.
iOS Bundle ID: com.example.app
Android Package: com.example.app

Flow:
1. Launch app
2. Enter email "test@example.com"
3. Enter password "password123"
4. Tap login

Compare: Both should show home screen with same content
```

### Migration Example
```
Test checkout flow parity between old and new versions.
Platform: iOS
Old App: com.example.app-old
New App: com.example.app

Flow:
1. Add item to cart
2. Proceed to checkout
3. Enter payment details

Compare: New version should behave identically to old
```

## First Run Setup

Before spawning agents, verify the driver exists:
```bash
find ~/.claude/plugins -name "driver.ts" -path "*/mobile/*" 2>/dev/null
```

Dependencies auto-install on first run.

## Aggregating Results

After all agents complete, aggregate:
1. Total flows compared
2. Bugs found (blocking issues)
3. Platform differences (acceptable)
4. Items needing review
5. Overall parity health assessment

---

USER REQUEST: $*
