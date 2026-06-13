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
claude plugin install miro@paddo-tools
claude plugin install monday@paddo-tools
claude plugin install whatsapp@paddo-tools

# or via slash command
/plugin marketplace add paddo/claude-tools
/plugin install gemini-tools@paddo-tools
/plugin install codex@paddo-tools
/plugin install dns@paddo-tools
/plugin install headless@paddo-tools
/plugin install mobile@paddo-tools
/plugin install miro@paddo-tools
/plugin install monday@paddo-tools
/plugin install whatsapp@paddo-tools
```

## Plugins

| Plugin | Description |
|--------|-------------|
| **gemini-tools** | Gemini models for visual analysis and UI mockup generation (`/gemini-tools:visual`, `/gemini-tools:mockup`) |
| **codex** | OpenAI Codex for architecture analysis and code review (`/codex:review`) |
| **dns** | Manage DNS records (`/dns:spaceship`, `/dns:godaddy`) |
| **headless** | Headless browser automation for site comparison, E2E testing, and anti-bot-aware web research (`/headless:parity`, `/headless:test`, `/headless:scout`) |
| **mobile** | Mobile app testing for iOS, Android, React Native, Xamarin, Flutter (`/mobile:test`, `/mobile:parity`) |
| **miro** | Read and interpret Miro boards (`/miro:board`) |
| **monday** | Manage Monday.com tasks: list boards, update status, assign (`/monday:monday`) |
| **whatsapp** | Search WhatsApp messages and retrieve media from native macOS client (`/whatsapp`) |

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
    "GODADDY_API_SECRET": "...",
    "MIRO_TOKEN": "...",
    "MONDAY_API_TOKEN": "...",
    "SCRAPE_DO_API_KEY": "..."
  }
}
```

`SCRAPE_DO_API_KEY` powers the `headless:scout` unlocker tier. Without it, scout
still reads compliant sites via direct fetch/WebFetch but can't break anti-bot
walls. Optional `SCOUT_MAX_CREDITS` caps per-run spend (default ~5000 credits).

**2. Project settings** (`.claude/settings.local.json`) - per-project creds

**3. Shell profile** (`~/.zshrc`) - if already exported globally
