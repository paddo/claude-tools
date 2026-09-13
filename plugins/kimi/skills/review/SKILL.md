---
name: review
description: Run Kimi CLI for an independent code review and verify its findings.
---

Run Kimi CLI as the reviewer. Verify its findings against the code before reporting.

1. Use the requested branch, PR, or files as the scope.
   Otherwise, review changes against the default branch, including staged, unstaged, and relevant untracked files.
   Resolve the default branch from repository metadata. State any scope you cannot determine.
2. Collect the diff and surrounding code with file names and line numbers.
3. Ask Kimi for correctness, security, concurrency, and edge-case defects.
   Require file:line references and concrete failure scenarios. Exclude style and formatting.
4. Read each cited location. Discard findings that contradict the code or intended behavior.
5. Report confirmed findings by severity. Name Kimi CLI as the source.
   State when no findings remain. Include the number of discarded findings and any missing context.

Write the complete prompt with a quoted heredoc. Choose a delimiter absent from the prompt.

```bash
REVIEW_PROMPT=$(mktemp /tmp/kimi-review-prompt.XXXXXX)
REVIEW_OUTPUT=$(mktemp /tmp/kimi-review-output.XXXXXX)
cat << 'KIMI_REVIEW_INPUT' > "$REVIEW_PROMPT"
Review only. Do not edit files, run write commands, or delegate to another reviewer.
<review request, diff, and surrounding code>
KIMI_REVIEW_INPUT
"$HOME/.kimi-code/bin/kimi" -p "$(cat "$REVIEW_PROMPT")" > "$REVIEW_OUTPUT"
```

Use the configured Kimi model unless the user specifies another model.
Do not combine `-p` with `--plan`, `--auto`, or `--yolo`; Kimi rejects those combinations.
Prompt mode uses Kimi's auto permission mode. The review-only instruction does not enforce read-only tool access.
Start the CLI with the host's background-process or yielding shell support.
In Claude Code, set Bash `run_in_background: true` and wait with `TaskOutput`.
Keep the process handle when the host shell returns before completion. Wait, then read `REVIEW_OUTPUT`.
Do not start another review while that process runs.
If the CLI fails, report its error. Do not substitute your own review.
If the caller supplies a report path, write the verified report there before returning it.
