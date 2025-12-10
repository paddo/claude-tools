# claude-tools

Claude Code plugin marketplace.

## Install

```bash
claude plugin marketplace add paddo/claude-tools
claude plugin install gemini-tools@paddo-tools
claude plugin install codex@paddo-tools
claude plugin install dns@paddo-tools
claude plugin install headless@paddo-tools
claude plugin install mobile@paddo-tools

# or via slash command
/plugin marketplace add paddo/claude-tools
/plugin install gemini-tools@paddo-tools
/plugin install codex@paddo-tools
/plugin install dns@paddo-tools
/plugin install headless@paddo-tools
/plugin install mobile@paddo-tools
```

## Plugins

| Plugin | Description |
|--------|-------------|
| **gemini-tools** | Gemini 3 Pro for visual analysis and UI mockup generation (`/gemini-tools:visual`, `/gemini-tools:mockup`) |
| **codex** | OpenAI Codex for architecture analysis and code review (`/codex:review`) |
| **dns** | Manage DNS records (`/dns:spaceship`, `/dns:godaddy`) |
| **headless** | Headless browser automation for site comparison and E2E testing (`/headless:parity`, `/headless:test`) |
| **mobile** | Mobile app testing for iOS, Android, React Native, Xamarin, Flutter (`/mobile:test`, `/mobile:parity`) |

### Headless in action

```
⏺ Now spawning parallel parity-browser agents to test the public pages:

⏺ Running 4 headless:parity-browser agents… (ctrl+o to expand)
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

### Dependencies

```bash
# gemini-tools
bun install -g gemini-cli
brew install pngpaste jq

# codex
bun install -g @openai/codex
```

### Environment Variables

Plugins need API keys. Set them via:

**1. Claude settings** (`~/.claude/settings.json`) - recommended:
```json
{
  "env": {
    "GEMINI_API_KEY": "...",
    "OPENAI_API_KEY": "...",
    "SPACESHIP_API_KEY": "...",
    "SPACESHIP_API_SECRET": "...",
    "GODADDY_API_KEY": "...",
    "GODADDY_API_SECRET": "..."
  }
}
```

**2. Project settings** (`.claude/settings.local.json`) - per-project creds

**3. Shell profile** (`~/.zshrc`) - if already exported globally
