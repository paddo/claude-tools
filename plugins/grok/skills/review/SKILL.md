---
name: review
description: Run Grok CLI for an independent code review and verify its findings.
---

Run Grok CLI as the reviewer. Verify its findings against the code before reporting.

1. Use the requested branch, PR, or files as the scope.
   Otherwise, review changes against the default branch, including staged, unstaged, and relevant untracked files.
   Resolve the default branch from repository metadata. State any scope you cannot determine.
2. Collect the diff and surrounding code with file names and line numbers.
3. Ask Grok for correctness, security, concurrency, and edge-case defects.
   Require file:line references and concrete failure scenarios. Exclude style and formatting.
4. Read each cited location. Discard findings that contradict the code or intended behavior.
5. Report confirmed findings by severity. Name Grok CLI as the source.
   State when no findings remain. Include the number of discarded findings and any missing context.

Write the complete prompt with a quoted heredoc. Choose a delimiter absent from the prompt.

```bash
REVIEW_PROMPT=$(mktemp /tmp/grok-review-prompt.XXXXXX)
REVIEW_OUTPUT=$(mktemp /tmp/grok-review-output.XXXXXX)
cat << 'GROK_REVIEW_INPUT' > "$REVIEW_PROMPT"
<review request, diff, and surrounding code>
GROK_REVIEW_INPUT
GROK_CLAUDE_SKILLS_ENABLED=false GROK_CLAUDE_HOOKS_ENABLED=false GROK_CLAUDE_MCPS_ENABLED=false \
GROK_CLAUDE_RULES_ENABLED=false GROK_CLAUDE_AGENTS_ENABLED=false \
grok --prompt-file "$REVIEW_PROMPT" --permission-mode dontAsk --no-subagents \
  --tools read_file,grep,list_dir > "$REVIEW_OUTPUT"
```

Run from the target repository. Grok reads surrounding files with read-only tools. It has no shell, so put the diff in the prompt.
Keep every flag and variable above. Do not enable automatic tool approval.
- Headless Grok ends the turn when a tool call needs a permission prompt. It still exits 0 with a partial answer. `dontAsk` and the read-only tool list prevent the prompt.
- By default Grok loads Claude skills, hooks, MCP servers, and instructions. A Claude review skill can make Grok follow that skill instead of the prompt. The variables turn this off.
- `--prompt-file` avoids the 128 KB limit on one command-line argument.
- Treat an answer that stops before any findings or a clear "no findings" statement as a failed run. Report it as a CLI failure.
Start the CLI with the host's background-process or yielding shell support.
In Claude Code, set Bash `run_in_background: true` and wait with `TaskOutput`.
Keep the process handle when the host shell returns before completion. Wait, then read `REVIEW_OUTPUT`.
Do not start another review while that process runs.
If the CLI fails, report its error. Do not substitute your own review.
If the caller supplies a report path, write the verified report there before returning it.
