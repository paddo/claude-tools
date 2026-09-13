---
name: mockup
description: Generate UI mockups with Gemini image generation using a text prompt and visual references.
---

Generate the requested mockup with the bundled image script.
Resolve `../../lib/nano-banana.ts` relative to this `SKILL.md` file. Use its absolute path as `MOCKUP_SCRIPT`.
The host process must provide `GEMINI_API_KEY`. The script requires Bun and macOS to open the image.

Inspect any supplied reference with the host image viewer.
Capture the clipboard with `pngpaste` only when the user requests clipboard input.
Describe the reference in the prompt. The script accepts text, not image files.
Include layout, colors, typography, content sections, and device context.

Write the prompt with a quoted heredoc. Choose a delimiter absent from the prompt.

```bash
MOCKUP_PROMPT=$(mktemp /tmp/mockup-prompt.XXXXXX)
cat << 'MOCKUP_INPUT' > "$MOCKUP_PROMPT"
<detailed design prompt>
MOCKUP_INPUT
bun "$MOCKUP_SCRIPT" "$(cat "$MOCKUP_PROMPT")" --aspect 16:9 --size 2K
```

Choose the requested aspect ratio and size:

- Aspect: `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`.
- Size: `512px`, `1K` (script default), `2K`, or `4K`.

Call the script once per request. Generate revisions only when the user asks.
The script prints the image path and opens it. Inspect the result with the host image viewer.
Return the image path, or report the generation error.
If the caller supplies a report path, write the result there before returning it.
