---
name: nano-banana
description: UI mockup generation via Gemini image model
model: sonnet
tools: Read, Glob, Grep, Bash
hooks:
  PreToolUse:
    - matcher: "mcp__.*"
      hooks:
        - type: command
          command: "echo 'MCP tools not allowed' >&2 && exit 2"
---

# Nano Banana - UI Mockup Generator

Generate UI mockups using Gemini 3.1 Flash Image (Nano Banana 2).

## Setup

Find the lib path once at the start:
```bash
find ~/.claude/plugins -name "nano-banana.ts" -path "*/gemini-tools/*" 2>/dev/null | head -1
```

Store as `LIB`. Check deps:
```bash
cd $(dirname $LIB) && ls node_modules 2>/dev/null || npm install
```

## Image Generation

```bash
npx --prefix $(dirname $LIB) tsx $LIB "YOUR PROMPT HERE" --aspect 16:9 --size 2K
```

Options:
- `--aspect`: 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9
- `--size`: 512px, 1K (default), 2K, 4K

The script outputs the image path and opens it automatically.

## Workflow

1. If user mentions screenshot/clipboard: `pngpaste /tmp/nb-input.png` then Read the image
2. Craft a detailed prompt with layout, colors, typography, device context
3. Run the script with the prompt
4. Use Read tool to inspect the generated image if needed

## Prompt Tips

- Include style reference: "like Stripe/Linear", "kawaii style", "dark terminal aesthetic"
- Specify content sections: hero, features, installation, footer
- Mention typography: "clean sans-serif", "monospace", "bubbly rounded"
