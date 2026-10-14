---
name: review
description: Run Gemini through the Antigravity CLI for an independent code review and verify its findings.
---

Run Gemini through the Antigravity CLI (`agy`) as the reviewer. Verify its findings against the code before reporting.

1. Use the requested branch, PR, or files as the scope.
   Otherwise, review changes against the default branch, including staged, unstaged, and relevant untracked files.
   Resolve the default branch from repository metadata. State any scope you cannot determine.
2. Write the diff to a patch file with file names and line numbers.
3. Ask Gemini for correctness, security, concurrency, and edge-case defects.
   Require file:line references and concrete failure scenarios. Exclude style and formatting.
4. Read each cited location. Discard findings that contradict the code or intended behavior.
5. Report confirmed findings by severity. Name Gemini (Antigravity CLI) as the source.
   State when no findings remain. Include the number of discarded findings and any missing context.

Write the diff to a file and the prompt with a quoted heredoc. Choose a delimiter absent from the prompt.

```bash
REVIEW_DIR=$(mktemp -d /tmp/gemini-review.XXXXXX)
REVIEW_OUTPUT="$REVIEW_DIR/output.json"
git diff "$(git merge-base <base> HEAD)" > "$REVIEW_DIR/diff.patch"
printf 'Review only. Do not edit files, run commands, or use skills.\nRead the diff in %s/diff.patch, then read surrounding code in this repository with your file tools.\n' \
  "$REVIEW_DIR" > "$REVIEW_DIR/prompt.md"
cat << 'GEMINI_REVIEW_INPUT' >> "$REVIEW_DIR/prompt.md"
<review request>
GEMINI_REVIEW_INPUT
agy -p "$(cat "$REVIEW_DIR/prompt.md")" --mode plan --model gemini-4-argon-high \
  --add-dir "$REVIEW_DIR" --output-format json > "$REVIEW_OUTPUT"
```

The merge-base diff covers commits, staged, and unstaged changes. Append each relevant untracked file with `git diff --no-index /dev/null <file> >> "$REVIEW_DIR/diff.patch"`.
Run from the target repository.
Use `gemini-4-argon-high` unless the user names another Gemini model from `agy models`.
- Prompts over about 64 KB return `SUCCESS` with an empty response and zero tokens. Keep the diff in the patch file, not in the prompt.
- Headless `agy` cannot ask for permission. It auto-denies writes and shell commands that need a prompt, then ends the turn with an empty `response` and a `denied_actions` list.
- Plan mode and the review-only instruction do not enforce read-only access. Allow rules in the user's `agy` settings still let matching commands run.
- `--add-dir` lets Gemini read the patch file without a permission request.
- File reads and the built-in `grep_search` and `find_by_name` tools run without permission. Only shell commands, such as `rg`, are denied.
- Do not add `--disable-slash-commands`; it turns plan mode off.
- `agy` loads the repository's `AGENTS.md` and its `.agents/skills`, which Codex also reads. No flag turns them off. A repository review skill can steer Gemini, so the prompt tells it not to use skills.
- Read `.response` from `REVIEW_OUTPUT`. Treat a `status` other than `SUCCESS`, an empty response, or a non-empty `denied_actions` as a failed run. Report it as a CLI failure.
Start the CLI with the host's background-process or yielding shell support.
In Claude Code, set Bash `run_in_background: true` and wait with `TaskOutput`.
Keep the process handle when the host shell returns before completion. Wait, then read `REVIEW_OUTPUT`.
Do not start another review while that process runs.
If the CLI fails, report its error. Do not substitute your own review.
If the caller supplies a report path, write the verified report there before returning it.
