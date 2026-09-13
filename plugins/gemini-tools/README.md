# gemini-tools

Gemini models for visual analysis and image generation from Claude Code or Codex.

## Commands

- `/gemini-tools:visual` - Visual analysis, UI feedback, research, and second opinions
- `/gemini-tools:mockup` - Generate UI mockups

In Codex, select `visual` or `mockup` from the `gemini-tools` plugin.

## Setup

```bash
# Gemini CLI
npm install -g @google/gemini-cli

# pngpaste for clipboard capture
brew install pngpaste

# API key
export GEMINI_API_KEY="your-key"
```

## Usage

```
/gemini-tools:visual review this UI for accessibility
/gemini-tools:mockup dashboard with a dark theme
/gemini-tools:mockup mobile login screen 9:16
```

## Dependencies

- `GEMINI_API_KEY` env var
- `@google/gemini-cli` for visual analysis
- Bun for the image script
- `pngpaste` for clipboard input, and `jq` for CLI output
- macOS for clipboard capture and opening generated images

See the [marketplace setup](../../README.md#install).
