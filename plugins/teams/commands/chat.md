---
allowed-tools:
  - Task
description: Read messages from a Teams chat
---

Delegate this to the **teams** agent to handle independently.

The teams agent will:
- Authenticate via device code flow if needed (prompts user to visit URL and enter code)
- List available chats if user doesn't specify one
- Fetch messages from the specified chat
- Download attachments/images if requested
- Present a formatted summary of the conversation

Token is cached at `~/.teams-token.json` for reuse.

USER REQUEST: $*
