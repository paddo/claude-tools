# Miro Plugin

Read and interpret Miro boards - extracts structure, content, and relationships.

## Setup

1. Get your API token from Miro:
   - Go to https://miro.com/app/settings/user-profile/apps
   - Create a new app or use existing
   - Copy the access token

2. Export the token before starting Claude Code or Codex:
   ```bash
   export MIRO_TOKEN="your_token_here"
   ```

## Usage

```
/miro:miro https://miro.com/app/board/uXjV...=/
/miro:miro uXjV...=
```

In Codex, select `miro` from the `miro` plugin.
See the [marketplace setup](../../README.md#install).

## What It Does

- Fetches all items (sticky notes, shapes, text, frames, connectors)
- Organizes content by frames/sections
- Maps connections and relationships
- Interprets board structure (Kanban, flowchart, brainstorm, etc.)
- Extracts actionable items when relevant
