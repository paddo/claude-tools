# claude-tools

Claude Code plugin marketplace.

## Install

```bash
claude plugin marketplace add paddo/claude-tools
claude plugin install gemini-tools@paddo-tools
claude plugin install codex@paddo-tools
claude plugin install spaceship-dns@paddo-tools
```

## Plugins

| Plugin | Description |
|--------|-------------|
| **gemini-tools** | Gemini 3 Pro for visual analysis, UI/UX, and image generation (`/gemini`, `/nano-banana`) |
| **codex** | OpenAI Codex for architecture analysis and research (`/codex`) |
| **spaceship-dns** | Manage DNS records on spaceship.com (`/spaceship-dns`) |

## Requirements

```bash
# gemini-tools
export GEMINI_API_KEY="..."
bun install -g gemini-cli
brew install pngpaste jq

# codex
export OPENAI_API_KEY="..."
npm install -g @openai/codex

# spaceship-dns
export SPACESHIP_API_KEY="..."
export SPACESHIP_API_SECRET="..."
```
