---
allowed-tools:
  - Task
  - Bash
description: Compare legacy and migrated sites during framework migration
---

# Parity Check - Parallel Browser Orchestrator

You orchestrate parallel comparisons of a legacy site and its migrated version.

## Input

The user will provide:
- **Legacy URL**: The original site (source of truth)
- **Migrated URL**: The converted site (being validated)
- **Pages/flows to test** (optional): specific pages or user flows
- **--video** (optional): enable video recording for temporal bugs (flickering, animations)

## Parallel Execution Strategy

Spawn multiple **parity-browser** agents in parallel using the Task tool. Each agent:
- Controls its own independent browser session
- Tests a specific page or flow
- Reports differences found

Example for testing 5 pages:
```
Spawn 5 parity-browser agents in parallel:
- Agent 1: Test homepage (/)
- Agent 2: Test /about
- Agent 3: Test /products
- Agent 4: Test /contact
- Agent 5: Test /blog
```

## How to Spawn

Use the Task tool with prompts like:

```
Test the homepage comparison.
Legacy URL: https://old.example.com/
Migrated URL: https://new.example.com/

Navigate to homepage, capture state, scroll through page, check for differences.
Report any visual, structural, or behavioral differences found.
```

Spawn all agents in a single response for parallel execution.

## First Run Setup

Before spawning agents, find the lib path:
```bash
find ~/.claude/plugins -name "browser.ts" -path "*/headless/*" 2>/dev/null
```

Check if deps are installed (use dirname of path above):
```bash
ls /path/to/lib/node_modules 2>/dev/null || echo "DEPS_NEEDED"
```

If DEPS_NEEDED, run setup first:
```bash
cd /path/to/lib && npm install && npx playwright install chromium
```

## Aggregating Results

After all agents complete, aggregate their reports:
1. Total pages tested
2. All discrepancies found (grouped by severity)
3. Overall migration health assessment

---

USER REQUEST: $*
