# grok

Launch Grok for a second-opinion code review inside Claude Code.

## Commands

- `/grok:review [scope]` - review the working diff (default), a branch, a PR, or named files

## How it works

The `grok` agent collects the diff, runs Grok over it headlessly via the Grok CLI (`grok -p --permission-mode plan`), then verifies every finding against the actual code before reporting. Grok finds; the agent filters. Confirmed findings come back ranked by severity with file:line references.

The reviewer never gets write access: plan mode is enforced on every run, so the CLI cannot modify the tree.

## Requirements

- Grok CLI installed (`~/.grok/bin/grok`) and signed in with an X/SuperGrok subscription
- Review runs draw from the subscription's usage limits
