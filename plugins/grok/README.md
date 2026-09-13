# grok

Run an independent Grok CLI review from Claude Code or Codex.
The calling host verifies each finding against the code before reporting it.

## Use

- Claude Code: `/grok:review [scope]`.
- Codex: select `review` from the `grok` plugin, or request a Grok review.

Scope can specify a branch, PR, or files.
The default includes changes against the default branch and local changes.
The CLI runs in plan mode and uses its configured model and account.

## Requirements

Install and authenticate Grok CLI on PATH.
The CLI must support plan mode. Review runs use the configured account's usage limits.
See the [marketplace setup](../../README.md#install).
