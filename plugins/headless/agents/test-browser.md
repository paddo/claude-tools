---
name: test-browser
description: Control browser session for E2E testing via agent-browser
model: haiku
tools: Bash, Read, SendMessage
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/test/SKILL.md` and follow its workflow.
Resolve all workflow references relative to that skill file.
If you run as a named teammate, send the report to your caller with SendMessage.
Return the report as your final response.
