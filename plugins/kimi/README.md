# kimi

Launch Moonshot's Kimi K3 for a second-opinion code review inside Claude Code.

## Commands

- `/kimi:review [scope]` - review the working diff (default), a branch, a PR, or named files

## How it works

The `kimi` agent collects the diff, runs Kimi K3 over it headlessly via the Kimi Code CLI (`kimi -p`), then verifies every finding against the actual code before reporting. K3 finds; the agent filters. Confirmed findings come back ranked by severity with file:line references.

The reviewer never gets write access: the CLI runs without `--yolo`, so it cannot modify the tree.

## Requirements

- [Kimi Code CLI](https://moonshotai.github.io/kimi-code/) installed at `~/.kimi-code/bin/kimi` and signed in (`kimi login`) with a Kimi subscription
- Review runs draw from the subscription's usage limits
