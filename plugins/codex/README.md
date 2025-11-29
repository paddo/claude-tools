# codex

Launch OpenAI Codex CLI for software architecture analysis, research, and senior-level technical insights.

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

### 2. Set API key

```bash
export OPENAI_API_KEY="your-key"
```

Add to `~/.zshrc` or `~/.bashrc` to persist.

## Usage

```
/codex should I use a monorepo or polyrepo for this project?
/codex review the authentication architecture
/codex what's the best way to handle real-time updates here?
```

## Dependencies

- [Codex CLI](https://github.com/openai/codex) (`npm install -g @openai/codex`)
- `OPENAI_API_KEY` environment variable
