---
name: review
description: Run Claude CLI for an independent code review when the user requests Claude review from Codex or Claude Code.
---

Run Claude CLI as the reviewer. Verify its findings before reporting.
Use this workflow directly in either host. It does not require a host subagent.

1. Use the requested branch, PR, or files as the scope.
   Otherwise, review committed changes against the default branch, plus staged, unstaged, and relevant untracked files.
   Resolve the default branch from repository metadata. State any scope you cannot determine.
2. Collect the diff, relevant project instructions, and surrounding code with file names and line numbers.
   Include this material in the review prompt. The reviewer has no tools to retrieve missing context.
3. Run the CLI command below from the target repository.
   Ask for correctness, security, concurrency, and edge-case defects. Exclude style and formatting.
   Require file:line references and concrete failure scenarios. Ask Claude to identify missing context.
4. Read each cited location yourself. Discard findings that contradict the code or intended behavior.
5. Report confirmed findings by severity. Name Claude CLI as the source.
   Include each location, defect, and failure scenario. State when no findings remain.
   Report missing context and the number of discarded findings.

Use a quoted heredoc to write the complete prompt into a unique temporary file.
Choose a delimiter that does not occur in the prompt.

```bash
REVIEW_PROMPT=$(mktemp /tmp/claude-review-prompt.XXXXXX)
REVIEW_OUTPUT=$(mktemp /tmp/claude-review-output.XXXXXX)
cat << 'CLAUDE_REVIEW_INPUT' > "$REVIEW_PROMPT"
<review request, project instructions, diff, and surrounding code>
CLAUDE_REVIEW_INPUT
env -u CLAUDECODE claude -p --safe-mode --tools "" \
  --no-session-persistence --output-format text \
  < "$REVIEW_PROMPT" > "$REVIEW_OUTPUT"
```

`--safe-mode` disables custom skills and plugins, which prevents recursive review calls.
`--tools ""` removes the reviewer's built-in tools. Supply all review material through stdin.
The child process clears `CLAUDECODE` so Claude Code can also launch this independent session.
Use the configured Claude model unless the user specifies another model through `--model`.

Keep the process handle when your shell tool returns before completion. Wait for that process, then read its output.
Start the CLI with the host's background-process or yielding shell support.
In Claude Code, set Bash `run_in_background: true` and wait with `TaskOutput`.
Do not start another review because the shell tool returned early.
If the CLI fails, report its error. Do not present your own review as Claude's output.
If the caller supplies a report path, write the verified report there before returning it.
