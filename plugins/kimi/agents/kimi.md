---
name: kimi
description: Second-opinion code review using Moonshot Kimi K3
model: opus
tools: Read, Glob, Grep, Bash, SendMessage
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/review/SKILL.md` and follow its workflow.
Resolve all workflow references relative to that skill file.
If you run as a named teammate, send the report to your caller with SendMessage.
Return the report as your final response.
