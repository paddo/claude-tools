# Release Notes

## 2026-09-28

Gemini Tools `2.0.0` removes the `visual` skill and the `gemini` agent, because the Gemini CLI is no longer available.
The `mockup` skill and the `nano-banana` agent remain. They call the Gemini API directly.
Mockups now use the stable `gemini-3.1-flash-image` model. Google's shutdown date for the preview model was 2026-06-25.

Mobile `3.0.0` moves to Appium 3 and current drivers: XCUITest 12, UiAutomator2 8, and Flutter 4.
Appium 3 requires Node.js 20.19 or later and npm 10 or later.
Appium now starts in the plugin's `lib` directory. It found the npm-installed drivers only from there, so sessions started elsewhere had no drivers.
Reattached sessions declare their platform. Otherwise webdriverio calls window endpoints that Appium 3 removed.
The Android `launch` action passes the `intent` argument that UiAutomator2 requires.
Android emulator (Android 16) and iOS simulator (iOS 26.5, Xcode 27) runs verified each action.
The mobile evaluation now uses deterministic graders. Its judge saw only the final message and could not confirm the `shell-cmd` run, so it failed correct answers.

API credentials can now come from the macOS keychain, under the `paddo-tools` service.
An environment variable with the same name still overrides the keychain.
Secrets no longer need to sit in shell profiles, and desktop apps no longer need to inherit them.
Claude Code `userConfig` cannot pass sensitive values to skill shell commands, and Codex has no equivalent.
The keychain therefore gives one method for both hosts.
The Codex sandbox blocks keychain reads, so these commands run outside it. They already needed network access.

| Plugin | Previous | Released |
|---|---|---|
| `dns` | `1.1.3` | `1.1.4` |
| `gemini-tools` | `1.3.4` | `2.0.0` |
| `headless` | `0.5.3` | `0.5.4` |
| `miro` | `1.1.3` | `1.1.4` |
| `mobile` | `2.1.4` | `3.0.0` |
| `monday` | `1.4.3` | `1.4.4` |

## 2026-09-23

Grok `1.0.7` stops headless reviews from ending early.
Headless Grok ended its turn when a tool call needed a permission prompt, and it still exited 0 with a partial answer.
Reviews now use `dontAsk` mode with read-only tools and no subagents, so no call needs a prompt.
Grok no longer loads Claude skills, hooks, MCP servers, or instructions during a review. A Claude review skill had redirected it.
The prompt now goes through `--prompt-file`.

## 2026-09-14

Codex `1.0.10` keeps macOS Chrome rendering in the calling session.
Delegated prompts prohibit Chrome launches inside the sandbox and return rendering commands to the caller.
This avoids application-registration crashes during headless rendering. The sandbox remains enabled.

## 2026-09-13

All 11 plugins now provide Claude Code and Codex manifests.
Both hosts use 18 shared skills, with common references and helper scripts.
Claude agents load those shared skills. Existing Claude command names remain available as skills.

The new `claude:review` workflow runs an independent Claude CLI review from either host.
The reviewer receives supplied code through stdin and runs without built-in tools.

Helper paths now resolve independently of host cache locations.
Mobile comparisons use separate sessions and explicit device identifiers.
Two iOS sessions also use distinct WebDriverAgent ports.
Mobile terminal command generation preserves spaces and no longer requires a writable log directory.
Command-only requests skip dependency checks. Long CLI workflows use background execution to avoid foreground timeouts.
Kimi reviews use prompt mode without the incompatible `--plan` flag.

Claude behavioral evaluations cover DNS skill selection, reference loading, record replacement, and mobile command generation.
These evaluations do not establish behavior for every plugin or for Codex.

### Plugin Versions

Each version matches across its Claude Code and Codex manifests.
The existing plugins receive one patch increment for this release.
The mobile version includes the command-generation fix.

| Plugin | Previous | Released |
|---|---|---|
| `claude` | New | `1.0.0` |
| `codex` | `1.0.8` | `1.0.9` |
| `dns` | `1.1.2` | `1.1.3` |
| `gemini-tools` | `1.3.3` | `1.3.4` |
| `grok` | `1.0.5` | `1.0.6` |
| `headless` | `0.5.2` | `0.5.3` |
| `kimi` | `1.0.5` | `1.0.6` |
| `miro` | `1.1.2` | `1.1.3` |
| `mobile` | `2.1.3` | `2.1.4` |
| `monday` | `1.4.2` | `1.4.3` |
| `whatsapp` | `1.0.2` | `1.0.3` |
