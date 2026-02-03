# Monday.com Plugin

Manage Monday.com tasks: list boards, query items, update status, assign yourself.

## Setup

1. Get your API token from Monday.com:
   - Avatar → Developers (opens Developer Center)
   - My Access Tokens → Show (or Generate)
   - Copy the token

2. Add to Claude settings (`~/.claude/settings.json`):
   ```json
   {
     "env": {
       "MONDAY_API_TOKEN": "your_token_here"
     }
   }
   ```

## Usage

```
/monday list boards              # Show all boards
/monday items BOARD_ID           # List items on a board
/monday status ITEM_ID "Done"    # Update item status
/monday assign ITEM_ID           # Assign yourself to item
```

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
