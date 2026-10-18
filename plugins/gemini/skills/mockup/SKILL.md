---
name: mockup
description: Generate UI mockups with Gemini Nano Banana image models from a text prompt and optional reference images.
---

Generate the requested mockup with the bundled image script.
Resolve `../../lib/nano-banana.ts` relative to this `SKILL.md` file. Use its absolute path as `MOCKUP_SCRIPT`.
The script calls the Gemini API by default. `--backend fal` calls the same models through fal.
The script reads `GEMINI_API_KEY`, or `FAL_KEY` for fal, from the environment first, then from the macOS keychain.
A host sandbox can block network and keychain access. Run the script outside the sandbox.
The script requires Bun and macOS to open the image.

Pass each reference image, such as a screenshot or brand asset, with `--ref`. Use up to 14 PNG, JPEG, or WebP files.
Capture the clipboard with `pngpaste` only when the user requests clipboard input, then pass that file with `--ref`.
In the prompt, state what to take from each reference.
Include layout, colors, typography, content sections, and device context.

Write the prompt with a quoted heredoc. Choose a delimiter absent from the prompt.

```bash
MOCKUP_PROMPT=$(mktemp /tmp/mockup-prompt.XXXXXX)
cat << 'MOCKUP_INPUT' > "$MOCKUP_PROMPT"
<detailed design prompt>
MOCKUP_INPUT
bun "$MOCKUP_SCRIPT" "$(cat "$MOCKUP_PROMPT")" --aspect 16:9 --size 2K --ref /path/to/reference.png
```

Choose the options the request needs:

- `--aspect`: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`. Nano Banana 2.1 also accepts `1:4`, `4:1`, `1:8`, and `8:1`.
- `--size`: `1K` (default), `2K`, or `4K`.
- `--model`: `gemini-nano-banana-2.1` (default) for most mockups. Use `gemini-3-pro-image` (Nano Banana Pro) when the user asks for Pro or for photorealistic detail. Pro costs three to four times as much.
- `--thinking`: `minimal`, `medium` (model default), or `high`. Use `high` for text-heavy or complex layouts.
- `--backend`: `gemini` (default) or `fal`. Use `fal` when the user asks for it.

Call the script once per request. Generate revisions only when the user asks.
The script prints the image path and opens it. Inspect the result with the host image viewer.
Return the image path, or report the generation error.
If the caller supplies a report path, write the result there before returning it.
