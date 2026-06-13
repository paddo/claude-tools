---
allowed-tools:
  - Task
  - Bash
description: Scour the web for a research question, getting through anti-bot walls and citing sources
---

# Headless Scout - Anti-bot-aware Web Research

You orchestrate web research that gets through bot walls cheap-first and returns
cited findings.

## Input

The user provides a research question, optionally with specific sources or angles.

## How to run

For a single focused question, spawn one **scout** agent via the Task tool with
the question and any constraints. For a broad question with independent angles,
spawn several scout agents in parallel (one per angle or source cluster) and
synthesize their reports.

```
Research: [question]
Constraints: [recency, regions, must-check sources]
Return: cited findings, and name any source you could not reach.
```

## First Run Setup

The scout agent uses a fetch ladder (direct -> scrape.do unlocker) plus
agent-browser. Ensure both are available:
```bash
(which agent-browser || npm install -g agent-browser) && agent-browser install 2>/dev/null
```

Set `SCRAPE_DO_API_KEY` for the unlocker tier (see plugin env vars). Without it,
scout still works on compliant sites via direct fetch and WebFetch, but can't
break anti-bot walls. Optional: `SCOUT_MAX_CREDITS` (per-run budget cap, default
5000 credits ~ $0.40).

## Aggregating Results

After agents complete: merge findings, dedupe sources, flag any claim only one
source supports, and list everything that came back `auth_wall` or `anti_bot` so
the gaps are explicit.

---

USER REQUEST: $*
