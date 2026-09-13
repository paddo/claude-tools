---
name: nano-banana
description: UI mockup generation via Gemini image model
model: sonnet
tools: Read, Glob, Grep, Bash, SendMessage
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/mockup/SKILL.md` and follow its workflow.
Resolve all workflow references relative to that skill file.
If you run as a named teammate, send the report to your caller with SendMessage.
Return the report as your final response.
