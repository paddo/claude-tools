---
allowed-tools:
  - Task
description: Launch Grok for a second-opinion code review
---

Delegate this to the **grok** agent to handle independently.

Spawn it unnamed. With agent teams enabled, a name makes this a teammate rather
than a subagent, and on that path the agent definition is appended to a stock
teammate prompt instead of becoming the system prompt, while frontmatter hooks
are not applied at all. A named spawn then skips the CLI and returns its own
analysis, which is the one result this agent must never produce.

Give it a report path in its prompt: a file in your scratchpad directory if you
have one, otherwise `mktemp`. Tell it to write the report there. A named agent's
final message never reaches you, so if it finishes having sent nothing, read that
file rather than re-running the analysis.

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
