# codex

Run Codex CLI for architecture analysis, research, and code review from Claude Code or Codex.

## When to use

- Architecture decisions and trade-off analysis
- Research on design patterns and best practices
- Code/design reviews focusing on structure
- Getting a second opinion from a different AI perspective

## Setup

### 1. Install Codex CLI

```bash
npm install -g @openai/codex
```

### 2. Authenticate

```bash
codex login
```

Use the CLI's configured account and model.

## Usage

```
/codex:review compare monorepo and polyrepo options
/codex:review review the authentication architecture
/codex:review assess the real-time update design
```

## Dependencies

- [Codex CLI](https://github.com/openai/codex) (`npm install -g @openai/codex`)
- Configured Codex authentication

In Codex, select `review` from the `codex` plugin.
The skill starts an independent CLI process in read-only mode.
See the [marketplace setup](../../README.md#install).
