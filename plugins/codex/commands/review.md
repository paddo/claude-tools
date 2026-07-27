---
allowed-tools:
  - Task
description: Launch Codex for software architecture analysis and research
---

Delegate this to the **codex** agent to handle independently.

Give it a report path in its prompt: a file in your scratchpad directory if you
have one, otherwise `mktemp`. Tell it to write the report there. A named agent's
final message never reaches you, so if it finishes having sent nothing, read that
file rather than re-running the analysis.

The codex agent will:
- Analyze architecture questions with senior-level thinking
- Research design patterns and best practices
- Use OpenAI Codex CLI for external research when needed
- Return analysis with options, trade-offs, and recommendations

Provide context for the agent:
- Project: current working directory name and brief description
- Recent work: what the user is currently working on (from git status or conversation)
- Relevant areas: pointers to files/directories to explore

USER REQUEST: $*
