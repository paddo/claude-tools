---
name: miro
description: Read and interpret Miro boards
model: sonnet
tools: Read, Bash, SendMessage
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/miro/SKILL.md` and follow its workflow.
Resolve all workflow references relative to that skill file.
If you run as a named teammate, send the report to your caller with SendMessage.
Return the report as your final response.
