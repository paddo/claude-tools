# gemini-tools

Gemini image generation for UI mockups from Claude Code or Codex.

## Commands

- `/gemini-tools:mockup` - Generate UI mockups

In Codex, select `mockup` from the `gemini-tools` plugin.

## Setup

```bash
# pngpaste for clipboard capture
brew install pngpaste

# API key, stored in the macOS keychain (prompts for the value)
security add-generic-password -U -s paddo-tools -a GEMINI_API_KEY -w
```

On other systems, export `GEMINI_API_KEY` instead.

## Usage

```
/gemini-tools:mockup dashboard with a dark theme
/gemini-tools:mockup mobile login screen 9:16
```

## Dependencies

- `GEMINI_API_KEY` in the macOS keychain or the environment
- Bun for the image script
- `pngpaste` for clipboard input
- macOS for clipboard capture and opening generated images

See the [marketplace setup](../../README.md#install).
