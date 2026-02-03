---
allowed-tools:
  - Task
description: Read and interpret a Miro board
---

Delegate this to the **miro** agent to handle independently.

The miro agent will:
- Fetch all items from the specified Miro board
- Parse and organize content (sticky notes, shapes, text, frames, connectors)
- Present a structured interpretation of the board
- Identify relationships, groupings, and flows

Requires `$MIRO_TOKEN` environment variable (get from https://miro.com/app/settings/user-profile/apps).

USER REQUEST: $*
