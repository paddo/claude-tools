---
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Edit
description: Launch Gemini 3 Pro for visual analysis, UI/UX work, research, or second opinions
---

Invoke Gemini 3 Pro for visual/multimodal analysis, UI/UX work, or a second opinion.

## Usage

```bash
output=$("$HOME/.bun/bin/gemini" --model gemini-3-pro-preview -p "PROMPT" --output-format json 2>/dev/null)
echo "$output" | jq -r '.response' 2>/dev/null || echo "$output"
```

For images, use `@/path/to/image.png` in the prompt.

## Steps

1. If visual input mentioned: `pngpaste /tmp/gemini-input.png`
2. Gather relevant context (files, code)
3. Run gemini with context and image path in prompt
4. Apply changes (Edit) or return analysis based on intent

USER REQUEST: $*
