# Monday.com Plugin

Manage Monday.com tasks: list boards, query items, update status, assign yourself.

## Setup

1. Get your API token from Monday.com:
   - Avatar → Developers (opens Developer Center)
   - My Access Tokens → Show (or Generate)
   - Copy the token

2. Store the token in the macOS keychain. The command prompts for the value:
   ```bash
   security add-generic-password -U -s paddo-tools -a MONDAY_API_TOKEN -w
   ```
   On other systems, export `MONDAY_API_TOKEN` before you start Claude Code or Codex.

## Usage

```
/monday:monday list boards
/monday:monday items BOARD_ID
/monday:monday status ITEM_ID "Done"
/monday:monday assign ITEM_ID
```

In Codex, select `monday` from the `monday` plugin.
See the [marketplace setup](../../README.md#install).

## Commands

| Command | Description |
|---------|-------------|
| `list boards` | Show all accessible boards |
| `items <board_id>` | List items on a board with status/assignee |
| `status <item_id> "<label>"` | Update item status (e.g., "Working on it") |
| `assign <item_id>` | Assign yourself to an item |
| `create <board_id> "<name>"` | Create a new item |

## API Reference

Endpoint: `https://api.monday.com/v2` (GraphQL)
