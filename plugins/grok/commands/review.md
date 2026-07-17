---
allowed-tools:
  - Task
description: Launch Grok for a second-opinion code review
---

Delegate this to the **grok** agent to handle independently.

The grok agent will:
- Collect the diff or files under review
- Run Grok over them via the Grok CLI in read-only plan mode
- Verify the findings against the actual code before reporting
- Return confirmed findings ranked by severity

Provide context for the agent:
- Project: current working directory name and brief description
- Scope: what to review (working diff, a branch, a PR, or named files) - default to the working diff against the default branch
- Recent work: what the user is currently working on (from git status or conversation)

USER REQUEST: $*
