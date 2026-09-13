# claude

Run an independent Claude CLI review from Claude Code or Codex.
The calling host verifies findings against the code before reporting them.

## Use

- Claude Code: `/claude:review [scope]` or delegate to the `claude:review` agent.
- Codex: select the `review` skill from the `claude` plugin, or request a Claude review.

The scope can specify a branch, PR, or files.
The default includes changes against the default branch and local changes.

## Install

From this repository:

```bash
claude plugin marketplace add .
claude plugin install claude@paddo-tools

codex plugin marketplace add .
codex plugin add claude@paddo-tools
```

## Requirements

Install Claude Code on PATH and authenticate with `claude auth login`.
The installed CLI must support `--safe-mode`.
The review uses the configured model and account billing.

The host supplies review material through stdin. The reviewer has no built-in tools.
Safe mode disables custom skills and plugins for the child session.
See the [Claude CLI reference](https://code.claude.com/docs/en/cli-reference).
