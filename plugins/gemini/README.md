# gemini

Run an independent Gemini review through the Antigravity CLI from Claude Code or Codex.
The calling host verifies each finding against the code before reporting it.

## Use

- Claude Code: `/gemini:review [scope]`.
- Codex: select `review` from the `gemini` plugin, or request a Gemini review.

Scope can specify a branch, PR, or files.
The default includes changes against the default branch and local changes.
The CLI runs in plan mode with `gemini-4-argon-high`.

## Requirements

Install the Antigravity CLI (`agy`) and sign in with a Google account on a Google AI Ultra plan.
Google Workspace accounts can be ineligible for Antigravity plan benefits. A personal Google account works.
Review runs use the account's Antigravity quota.
See the [marketplace setup](../../README.md#install).
