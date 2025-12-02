# claude-tools

Claude Code plugin marketplace.

## Install

```bash
claude plugin marketplace add paddo/claude-tools
claude plugin install gemini-tools@paddo-tools
claude plugin install codex@paddo-tools
claude plugin install spaceship-dns@paddo-tools
claude plugin install parity@paddo-tools

# or via slash command
/install-plugin gemini-tools@paddo-tools
/install-plugin codex@paddo-tools
/install-plugin spaceship-dns@paddo-tools
/install-plugin parity@paddo-tools
```

## Plugins

| Plugin | Description |
|--------|-------------|
| **gemini-tools** | Gemini 3 Pro for visual analysis, UI/UX, and image generation (`/gemini`, `/nano-banana`) |
| **codex** | OpenAI Codex for architecture analysis and research (`/codex`) |
| **spaceship-dns** | Manage DNS records on spaceship.com (`/spaceship-dns`) |
| **parity** | Compare legacy and migrated sites during framework migrations (`/parity`) |

### Parity in action

```
⏺ Now spawning parallel parity-browser agents to test the public pages:

⏺ Running 4 parity:parity-browser agents… (ctrl+o to expand)
   ├─ Parity: Homepage · 34 tool uses · 33.4k tokens
   │  ⎿ Done
   ├─ Parity: Terms page · 19 tool uses · 21.0k tokens
   │  ⎿ Bash: Run test from parity lib directory
   ├─ Parity: Login page · 46 tool uses · 57.5k tokens
   │  ⎿ Done
   └─ Parity: Audiences page · 24 tool uses · 28.2k tokens
      ⎿ Read: /tmp/audiences-test/migrated-console.json
```

## Requirements

```bash
# gemini-tools
export GEMINI_API_KEY="..."
bun install -g gemini-cli
brew install pngpaste jq

# codex
export OPENAI_API_KEY="..."
bun install -g @openai/codex

# spaceship-dns
export SPACESHIP_API_KEY="..."
export SPACESHIP_API_SECRET="..."
```
