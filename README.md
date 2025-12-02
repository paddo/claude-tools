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
/plugin marketplace add paddo/claude-tools
/plugin install gemini-tools@paddo-tools
/plugin install codex@paddo-tools
/plugin install spaceship-dns@paddo-tools
/plugin install parity@paddo-tools
```

## Plugins

| Plugin | Description |
|--------|-------------|
| **gemini-tools** | Gemini 3 Pro for visual analysis and UI mockup generation (`/gemini-tools:visual`, `/gemini-tools:mockup`) |
| **codex** | OpenAI Codex for architecture analysis and code review (`/codex:review`) |
| **spaceship-dns** | Manage DNS records on spaceship.com (`/spaceship-dns:dns`) |
| **parity** | Compare legacy and migrated sites during framework migrations (`/parity:test`) |

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
   └─ Parity: Dashboard page · 24 tool uses · 28.2k tokens
      ⎿ Done
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
