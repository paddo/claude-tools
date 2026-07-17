---
allowed-tools:
  - Task
description: Launch Kimi K3 for a second-opinion code review
---

Delegate this to the **kimi** agent to handle independently.

The kimi agent will:
- Collect the diff or files under review
- Run Kimi K3 over them via the Kimi Code CLI
- Verify the findings against the actual code before reporting
- Return confirmed findings ranked by severity

Provide context for the agent:
- Project: current working directory name and brief description
- Scope: what to review (working diff, a branch, a PR, or named files) - default to the working diff against the default branch
- Recent work: what the user is currently working on (from git status or conversation)

USER REQUEST: $*
