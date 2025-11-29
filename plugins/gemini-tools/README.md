# gemini-tools

Gemini 3 Pro for visual analysis, UI/UX work, and image generation.

## Commands

### /gemini
Visual analysis, UI/UX feedback, research, and second opinions using Gemini 3 Pro.

### /nano-banana
Generate UI/UX designs and mockups using Gemini 3 Pro Image.

## Setup

### 1. Install dependencies

```bash
# Gemini CLI (bun-based)
bun install -g gemini-cli

# pngpaste for clipboard capture
brew install pngpaste
```

### 2. Set API key

```bash
export GEMINI_API_KEY="your-key"
```

Add to `~/.zshrc` or `~/.bashrc` to persist.

### 3. Symlink bin

```bash
ln -sf /path/to/plugins/gemini-tools/bin/nano-banana ~/.claude/bin/
```

## Usage

```
/gemini review this UI screenshot for accessibility issues
/gemini what's wrong with this design?
/nano-banana hero section for blog post about AI
/nano-banana mobile login screen, dark theme, 9:16
```

## Dependencies

- `GEMINI_API_KEY` environment variable
- `pngpaste` (for clipboard capture)
- `jq` (for JSON parsing)
- `curl` (for API requests)
