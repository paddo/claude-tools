---
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Task
description: Compare legacy and migrated sites during framework migration
---

# Parity Check

You are orchestrating a side-by-side comparison of a legacy site and its migrated version.

## First Run Setup

Before doing anything else, find the plugin directory and check if dependencies are installed:

```bash
# Find parity plugin lib directory (works regardless of install location)
PARITY_LIB=$(dirname "$(find ~/.claude/plugins -name "browser.ts" -path "*/parity/*" 2>/dev/null | head -1)")

# Check if node_modules exists, install if not
ls "$PARITY_LIB/node_modules" 2>/dev/null || (cd "$PARITY_LIB" && npm install && npx playwright install chromium)
```

Run this check first. If deps need installing, inform the user it's a one-time setup. Store `PARITY_LIB` for subsequent commands.

## Input

The user will provide:
- **Legacy URL**: The original site (source of truth)
- **Migrated URL**: The converted site (being validated)

## Workflow

1. **Initialize browsers** - Run the Playwright controller to start dual browser sessions
2. **Capture initial state** - Get screenshots and DOM snapshots of both sites
3. **Navigate loop**:
   - Spawn a **navigator subagent** with current page state to decide next action
   - Execute the action on both browsers
   - Spawn a **comparator subagent** to analyze differences
   - Log any discrepancies
   - Repeat until navigator indicates completion

## Browser Control

Use the Playwright controller script:

```bash
# Use PARITY_LIB from setup step

# Start session (returns session ID)
npx --prefix "$PARITY_LIB" tsx "$PARITY_LIB/browser.ts" start <legacy-url> <migrated-url>

# Capture current state (screenshots + DOM to temp files)
npx --prefix "$PARITY_LIB" tsx "$PARITY_LIB/browser.ts" capture <session-id>

# Execute action on both browsers
npx --prefix "$PARITY_LIB" tsx "$PARITY_LIB/browser.ts" action <session-id> '<action-json>'

# End session
npx --prefix "$PARITY_LIB" tsx "$PARITY_LIB/browser.ts" stop <session-id>
```

## Subagent Spawning

**Navigator subagent** - decides what to do next:
```
Use Task tool with prompt containing:
- Current page screenshots (read the captured image files)
- DOM structure summary
- Actions taken so far
- Ask: "What action should we take next? Respond with action JSON or 'DONE'."
```

**Comparator subagent** - analyzes differences:
```
Use Task tool with prompt containing:
- Legacy screenshot and DOM
- Migrated screenshot and DOM
- Ask: "Compare these two page states. Report any visual, structural, or behavioral differences."
```

## Action JSON Format

```json
{
  "type": "click" | "fill" | "navigate" | "scroll" | "wait",
  "selector": "CSS selector (for click/fill)",
  "value": "text value (for fill)",
  "url": "path (for navigate)",
  "direction": "up|down (for scroll)",
  "ms": 1000 (for wait)
}
```

## Discrepancy Tracking

Maintain a list of found issues:
- Visual differences (layout, styling, missing elements)
- Behavioral differences (interactions not working)
- Content differences (text, images)
- Console errors present in migrated but not legacy

## Output

After completion, summarize:
1. Pages/flows tested
2. Discrepancies found (with screenshots)
3. Overall migration health assessment

---

USER REQUEST: $*
