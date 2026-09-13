# claude-tools

Shared plugins for Claude Code and Codex.
Both hosts use the same skills, references, and helper scripts.
See [release notes and plugin versions](CHANGELOG.md).

## Install

Run these commands from this checkout. Replace `claude` with the required plugin name.

```bash
# Claude Code
claude plugin marketplace add .
claude plugin install claude@paddo-tools

# Codex
codex plugin marketplace add .
codex plugin add claude@paddo-tools
```

For GitHub installation, use `paddo/claude-tools` instead of `.` as the marketplace source.
Both marketplaces use the name `paddo-tools`.

## Plugins

| Plugin | Skills | Purpose |
|---|---|---|
| `claude` | `review` | Independent Claude CLI review |
| `codex` | `review` | Codex architecture analysis, research, and review |
| `kimi` | `review` | Independent Kimi CLI review |
| `grok` | `review` | Independent Grok CLI review |
| `gemini-tools` | `visual`, `mockup` | Gemini visual analysis and mockup generation |
| `dns` | `spaceship`, `godaddy` | DNS record management |
| `headless` | `test`, `parity`, `scout` | Browser tests, site comparison, and web research |
| `mobile` | `test`, `parity`, `dev`, `test-runner` | Appium testing and Maestro workflows |
| `miro` | `miro` | Read and interpret boards |
| `monday` | `monday` | Manage tasks, comments, and attachments |
| `whatsapp` | `whatsapp` | Search the native macOS message database |

Claude Code exposes skills as `/plugin:skill`, such as `/dns:spaceship` or `/claude:review`.
Claude agents remain available under their existing names.
In Codex, use `/skills` or `$` to select a skill from its plugin.
Natural-language requests also work, such as “Use Grok to review these changes.”

## Requirements

Use a local host with shell access and the tools required by the selected plugin.
A desktop app must inherit the required environment variables.
Claude settings do not configure Codex credentials.

| Plugin | Required tools or access |
|---|---|
| `claude` | Claude CLI on PATH, authenticated account, and `--safe-mode` support |
| `codex` | Codex CLI on PATH and configured authentication |
| `kimi` | Authenticated CLI at `~/.kimi-code/bin/kimi`, with noninteractive `-p` support |
| `grok` | Authenticated Grok CLI on PATH, with plan mode support |
| `gemini-tools` | Gemini CLI, Bun, `jq`; macOS and `pngpaste` for clipboard workflows |
| `dns`, `miro`, `monday` | `curl`, `jq`, and the relevant API credentials |
| `headless` | Bun, `agent-browser`, and its browser installation |
| `mobile` | Node.js, npm, Appium dependencies, and available devices; Maestro for its workflows |
| `whatsapp` | macOS, `sqlite3`, and locally synced WhatsApp data |

Export the required credentials before starting either host:

| Workflow | Environment variables |
|---|---|
| Gemini | `GEMINI_API_KEY` |
| Spaceship | `SPACESHIP_API_KEY`, `SPACESHIP_API_SECRET` |
| GoDaddy | `GODADDY_API_KEY`, `GODADDY_API_SECRET` |
| Miro | `MIRO_TOKEN` |
| Monday.com | `MONDAY_API_TOKEN` |
| Scout paid retrieval | `SCRAPE_DO_API_KEY` |

Scout uses direct retrieval without a paid key. `SCOUT_MAX_CREDITS` sets its shared budget limit.
External review CLIs use their configured accounts and models.

## Structure

Each plugin has `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `skills/<name>/SKILL.md`.
Claude agents load those skills through the plugin root path. Codex uses the skills directly.
Helper paths resolve from the installed skill or reference file, independent of either host's cache directory.
Browser workflows use available host subagents for independent flows. Mobile workflows keep one controller per device.
Host permissions govern tool access. Workflow instructions do not create a permission sandbox.

Claude ignores plugin-agent hooks, so these agents use supported tool lists and skill instructions.
See the [Claude subagent documentation](https://code.claude.com/docs/en/sub-agents).
The shared format follows [Claude skills](https://code.claude.com/docs/en/skills) and [Codex skills](https://learn.chatgpt.com/docs/build-skills).

## Test

Run the behavioral evaluations with Claude Code 2.1.269 or later:

```bash
claude plugin eval plugins/dns --no-publish
claude plugin eval plugins/mobile --allow-tools Bash --no-publish
```

These cases check skill discovery, reference loading, DNS replacement rules, and mobile command generation.
The mobile case also checks command generation with an unusable log directory and paths containing spaces.
The prompts prohibit live DNS changes, dependency installation, and device operations.
Each case runs with and without its plugin. Add `--runs 1` for a single-run comparison.
For noninteractive execution of this trusted checkout, add `--trust-plugin`.
Reports remain local under each plugin's `evals/results/` directory.
Add `--keep-temp` to retain execution traces when investigating failures.
These evaluations exercise Claude Code. They do not establish Codex behavior.
