---
name: test-runner
description: Run Maestro tests and analyze results
model: haiku
tools: Bash, Read, SendMessage
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/test-runner/SKILL.md` and follow its workflow.
Resolve all workflow references relative to that skill file.
If you run as a named teammate, send the report to your caller with SendMessage.
Return the report as your final response.
