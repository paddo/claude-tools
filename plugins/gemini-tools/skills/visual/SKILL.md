---
name: visual
description: Run Gemini CLI for visual analysis, UI feedback, research, or a second opinion.
---

Run Gemini CLI with the relevant project context and images.
Use the user's image files. Capture the clipboard only when the user requests clipboard input.

```bash
VISUAL_DIR=$(mktemp -d /tmp/gemini-input.XXXXXX)
VISUAL_IMAGE="$VISUAL_DIR/input.png"
pngpaste "$VISUAL_IMAGE"
```

Inspect the image with the host image viewer before describing it.
Write the prompt with a quoted heredoc. Choose a delimiter absent from the prompt.
Include image references as `@/absolute/path/to/image.png` within the prompt.

```bash
VISUAL_PROMPT=$(mktemp /tmp/gemini-prompt.XXXXXX)
VISUAL_OUTPUT=$(mktemp /tmp/gemini-output.XXXXXX)
cat << 'GEMINI_VISUAL_INPUT' > "$VISUAL_PROMPT"
<request, project context, and image references>
GEMINI_VISUAL_INPUT
gemini --model gemini-3-pro-preview -p "$(cat "$VISUAL_PROMPT")" \
  --output-format json > "$VISUAL_OUTPUT"
jq -r '.response' "$VISUAL_OUTPUT"
```

Use the host process handle to wait when the CLI outlasts the shell call.
Start the CLI with the host's background-process or yielding shell support.
In Claude Code, set Bash `run_in_background: true` and wait with `TaskOutput`.
Read the output only after completion. Report any CLI error instead of substituting your own analysis.
Return concrete findings about layout, typography, color, or the requested question.
Apply changes only when the user's request includes implementation.
If the caller supplies a report path, write the report there before returning it.
