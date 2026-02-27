# gemini-tools

Gemini models for visual analysis, UI/UX work, and image generation.

## Commands

- `/gemini` - Visual analysis, UI/UX feedback, research, second opinions
- `/nano-banana` - Generate UI/UX mockups

## Setup

```bash
# Gemini CLI (for /gemini command)
bun install -g gemini-cli

# pngpaste for clipboard capture
brew install pngpaste

# API key
export GEMINI_API_KEY="your-key"
```

## Usage

```
/gemini review this UI for accessibility
/nano-banana dashboard with dark glassmorphism theme
/nano-banana mobile login screen 9:16
```

## Dependencies

- `GEMINI_API_KEY` env var
- `gemini-cli` (for /gemini)
- `pngpaste`, `jq`, `curl`
