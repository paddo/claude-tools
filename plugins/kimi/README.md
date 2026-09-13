# kimi

Run an independent Kimi CLI review from Claude Code or Codex.
The calling host verifies each finding against the code before reporting it.

## Use

- Claude Code: `/kimi:review [scope]`.
- Codex: select `review` from the `kimi` plugin, or request a Kimi review.

Scope can specify a branch, PR, or files.
The default includes changes against the default branch and local changes.
The CLI uses its configured model and account.
Prompt mode uses auto permissions and rejects `--plan`. The prompt requests review without file changes.
This mode does not enforce read-only tool access.

## Requirements

Install and authenticate [Kimi Code CLI](https://moonshotai.github.io/kimi-code/) at `~/.kimi-code/bin/kimi`.
Review runs use the configured account's usage limits.
See the [Kimi command reference](https://moonshotai.github.io/kimi-code/en/reference/kimi-command).
See the [marketplace setup](../../README.md#install).
