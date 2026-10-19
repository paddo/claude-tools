# Release Notes

## 2026-10-19

The `claude` plugin is now `cc` `2.0.0`.
Claude Code 2.1.302 and later reserve the plugin name `claude`, and `claude plugin validate` rejected the marketplace.
In Claude Code, the review skill is now `/cc:review` and the agent is `cc:review`. Codex lists the skill under the `cc` plugin.
To migrate, install `cc@paddo-tools` and uninstall `claude@paddo-tools` on each host.

| Plugin | Previous | Released |
|---|---|---|
| `cc` (was `claude`) | `1.0.0` | `2.0.0` |

## 2026-10-18

Gemini `1.1.0` adds `/gemini:mockup` and the `nano-banana` agent. They move from `gemini-tools`, which this release removes.
Mockups default to Nano Banana 2.1 (`gemini-nano-banana-2.1`). Google names it the replacement for `gemini-3.1-flash-image`.
It renders text and layouts better than Nano Banana 2, at about half the price per image.
`--model gemini-3-pro-image` selects Nano Banana Pro. `--thinking` sets the model's thinking level.
`--ref` sends up to 14 reference images to the model. The skill previously described references in words.
`--backend fal` runs the same models through fal with `FAL_KEY`. fal serves reference-image requests from its edit endpoints.

| Plugin | Previous | Released |
|---|---|---|
| `gemini` | `1.0.0` | `1.1.0` |
| `gemini-tools` | `2.0.0` | Removed |

## 2026-10-14

New `gemini` plugin `1.0.0` adds `/gemini:review`. It runs Gemini 4 Argon through the Antigravity CLI (`agy`) for an independent review, and the host verifies each finding.
The Gemini CLI does not serve Argon, so the skill uses `agy` in headless plan mode.
Headless `agy` returns `SUCCESS` with an empty response for prompts over about 64 KB, so the diff goes in a patch file that Gemini reads through `--add-dir`.
It auto-denies writes and shell commands that need a permission prompt and then ends the turn with an empty response, so the skill treats an empty response or any `denied_actions` as a failed run.
Plan mode does not enforce read-only access: allow rules in the user's `agy` settings still apply.

| Plugin | Previous | Released |
|---|---|---|
| `gemini` | - | `1.0.0` |

## 2026-10-11

Headless `0.6.0` no longer runs `agent-browser install` before every first test.
agent-browser detects an installed Chrome. The download gave a second browser without the user's logins.
The browser reference now explains a `profile` in the user's agent-browser config.
A Chrome profile name gives each session a copy of the user's logins, so the agent acts as the user.
That setup also needs `executablePath`, because agent-browser prefers an installed Chrome for Testing.
Chrome for Testing cannot decrypt Chrome's cookies.
The reference says how to get a logged-out session instead.
It also says how to wait for a user step, such as a passkey: run headed, then repeat `wait` until the page moves on.
A changed launch flag mid-session relaunches the browser and loses the page, so the reference says to keep flags fixed.
Scout now suggests agent-browser with a logged-in profile for authentication walls.

| Plugin | Previous | Released |
|---|---|---|
| `headless` | `0.5.4` | `0.6.0` |

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
