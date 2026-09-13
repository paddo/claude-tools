---
name: review
description: Run Codex CLI for independent architecture analysis, research, or code review.
---

Run Codex CLI even when Codex hosts this skill. Use its output as the source of the analysis.

1. Identify the question, project, relevant files, and requested review scope.
2. Supply the project context and concrete question to the CLI.
   For code review, include the diff and request correctness findings with file:line references.
   For architecture questions, request options, constraints, and a recommendation.
3. Read the CLI output. Check code findings against the referenced files before reporting them.
4. Name Codex CLI as the source. Report confirmed findings or the requested analysis.

Write the prompt with a quoted heredoc. Choose a delimiter absent from the prompt.

```bash
REVIEW_PROMPT=$(mktemp /tmp/codex-review-prompt.XXXXXX)
REVIEW_OUTPUT=$(mktemp /tmp/codex-review-output.XXXXXX)
cat << 'CODEX_REVIEW_INPUT' > "$REVIEW_PROMPT"
Perform this analysis yourself. Do not invoke the codex review plugin or another review CLI.
<question, project context, scope, and review material>
CODEX_REVIEW_INPUT
codex exec --sandbox read-only --output-last-message "$REVIEW_OUTPUT" - < "$REVIEW_PROMPT"
```

Run from the target repository. Add `--skip-git-repo-check` when the target is not a Git repository.
Keep the configured model unless the user specifies another model.
Start the CLI with the host's background-process or yielding shell support.
In Claude Code, set Bash `run_in_background: true` and wait with `TaskOutput`.
Use the host process handle to wait for completion. A shell timeout does not imply that the review finished.
Read `REVIEW_OUTPUT` after completion. Do not launch another review while that process runs.
If the CLI fails, report its error. Do not label your own analysis as Codex output.
If the caller supplies a report path, write the final report there before returning it.
