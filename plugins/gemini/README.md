# gemini

Run an independent Gemini review through the Antigravity CLI from Claude Code or Codex.
The calling host verifies each finding against the code before reporting it.
Generate UI mockups with Google's Nano Banana image models.

## Review

- Claude Code: `/gemini:review [scope]`.
- Codex: select `review` from the `gemini` plugin, or request a Gemini review.

Scope can specify a branch, PR, or files.
The default includes changes against the default branch and local changes.
The CLI runs in plan mode with `gemini-4-argon-high`.

### Requirements

Install the Antigravity CLI (`agy`) and sign in with a Google account on a Google AI Ultra plan.
Google Workspace accounts can be ineligible for Antigravity plan benefits. A personal Google account works.
Review runs use the account's Antigravity quota.
See the [marketplace setup](../../README.md#install).

## Mockup

- Claude Code: `/gemini:mockup <description>`.
- Codex: select `mockup` from the `gemini` plugin.

```
/gemini:mockup dashboard with a dark theme
/gemini:mockup mobile login screen 9:16, based on this screenshot
/gemini:mockup pricing page in 4K with Nano Banana Pro
```

The default model is Nano Banana 2.1 (`gemini-nano-banana-2.1`). Nano Banana Pro (`gemini-3-pro-image`) is available on request.
Mockups accept up to 14 reference images, such as screenshots or brand assets.
The script calls the Gemini API by default, or fal when you ask for it.

### Requirements

- Bun, and macOS to open the generated image
- `pngpaste` for clipboard input: `brew install pngpaste`
- `GEMINI_API_KEY`, or `FAL_KEY` for the fal backend, in the macOS keychain or the environment

Store a key in the keychain. The command prompts for the value:

```bash
security add-generic-password -U -s paddo-tools -a GEMINI_API_KEY -w
```
