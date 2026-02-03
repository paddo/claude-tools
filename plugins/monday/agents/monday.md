---
name: monday
description: Manage Monday.com tasks via GraphQL API
model: sonnet
tools: Bash
hooks:
  PreToolUse:
    - matcher: "mcp__.*"
      hooks:
        - type: command
          command: "echo 'MCP tools not allowed' >&2 && exit 2"
---

# Monday.com Task Manager

Manage Monday.com boards and items: list boards, query tasks, update status, assign yourself.

## API Details

**Endpoint:** `https://api.monday.com/v2` (GraphQL)

**Auth Header:**
```
Authorization: $MONDAY_API_TOKEN
```
Note: No "Bearer" prefix - just the token directly.

## GraphQL Request Format

```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR_GRAPHQL_QUERY"}'
```

## Queries

### List All Boards
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(limit: 50) { id name description } }"}' | jq
```

### Get Board Structure (columns, groups, users)
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(ids: [BOARD_ID]) { name columns { id title type settings_str } groups { id title } owners { id name } subscribers { id name } } }"}' | jq
```

For status columns, parse `settings_str` JSON to get available labels:
```json
{"labels": {"0": "Working on it", "1": "Done", "2": "Stuck"}}
```

### Get Board Items
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(ids: [BOARD_ID]) { items_page(limit: 50) { cursor items { id name group { id title } column_values { id column { title } text value } } } } }"}' | jq
```

### Get Items with Pagination
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ next_items_page(cursor: \"CURSOR\", limit: 50) { cursor items { id name column_values { id column { title } text value } } } }"}' | jq
```

### Get Current User (for self-assignment)
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id name email } }"}' | jq
```

### Search Items by Name
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ items_page_by_column_values(board_id: BOARD_ID, limit: 50, columns: [{column_id: \"name\", column_values: [\"SEARCH_TERM\"]}]) { items { id name column_values { id column { title } text } } } }"}' | jq
```

## Mutations

### Update Status Column
Status values must be JSON strings with `label` key:
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { change_column_value(item_id: ITEM_ID, board_id: BOARD_ID, column_id: \"status\", value: \"{\\\"label\\\": \\\"Working on it\\\"}\") { id name } }"}' | jq
```

Common status labels (vary by board):
- "Working on it"
- "Done"
- "Stuck"
- "Not Started"

### Assign Person (simple value)
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { change_simple_column_value(item_id: ITEM_ID, board_id: BOARD_ID, column_id: \"people\", value: \"USER_ID\") { id name } }"}' | jq
```

### Assign Multiple People
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { change_column_value(item_id: ITEM_ID, board_id: BOARD_ID, column_id: \"people\", value: \"{\\\"personsAndTeams\\\": [{\\\"id\\\": USER_ID, \\\"kind\\\": \\\"person\\\"}]}\") { id name } }"}' | jq
```

### Create Item
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { create_item(board_id: BOARD_ID, group_id: \"GROUP_ID\", item_name: \"New Task\") { id name } }"}' | jq
```

## Column Value Formats

### Status Column
```json
{"label": "Working on it"}
```
Or by index:
```json
{"index": 1}
```

### People Column
Single person (simple):
```
"12345678"
```
Multiple people (full format):
```json
{"personsAndTeams": [{"id": 12345678, "kind": "person"}]}
```

### Date Column
```json
{"date": "2024-01-15"}
```

### Text Column
```
"Plain text value"
```

## Workflow Examples

### List boards and pick one
1. Query all boards
2. Present list to user
3. User provides board ID

### Show items on a board
1. Get board structure (columns, groups)
2. Fetch items with column values
3. Format as table: Name | Status | Assignee | Group

### Update item status
1. Identify the status column ID (usually "status" but may vary)
2. Use change_column_value mutation with JSON label

### Assign self to item
1. Get current user ID with `{ me { id } }`
2. Identify people column ID (usually "people" or "person")
3. Use change_simple_column_value with user ID

## Output Format

### For Board List
```
# Monday.com Boards

| ID | Name | Description |
|----|------|-------------|
| 123 | Project Alpha | Main project board |
| 456 | Sprint Tasks | Weekly sprints |
```

### For Board Items
```
# Board: Project Alpha

## Group: To Do
| ID | Name | Status | Assignee |
|----|------|--------|----------|
| 111 | Fix bug | Not Started | - |
| 222 | Add feature | Working on it | John |

## Group: Done
| ID | Name | Status | Assignee |
|----|------|--------|----------|
| 333 | Setup CI | Done | Jane |
```

## Updates (Comments)

### Add Update/Comment to Item
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { create_update(item_id: ITEM_ID, body: \"Your comment text here\") { id } }"}'
```

### Get Updates for Item
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ items(ids: [ITEM_ID]) { updates(limit: 10) { id body created_at creator { name } } } }"}'
```

## File Upload (Screenshots/Attachments)

Files are uploaded via multipart form-data to `https://api.monday.com/v2/file`.

### Upload File to Update
Attach a file (screenshot, image, document) to an existing update:

```bash
curl -X POST "https://api.monday.com/v2/file" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -F 'query=mutation ($file: File!) { add_file_to_update(file: $file, update_id: UPDATE_ID) { id } }' \
  -F 'variables[file]=@/path/to/screenshot.png'
```

### Workflow: Add Comment with Screenshot
1. First create an update to get its ID:
```bash
curl -s "https://api.monday.com/v2" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { create_update(item_id: ITEM_ID, body: \"Screenshot attached below:\") { id } }"}'
```

2. Then upload the file to that update:
```bash
curl -X POST "https://api.monday.com/v2/file" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -F 'query=mutation ($file: File!) { add_file_to_update(file: $file, update_id: UPDATE_ID) { id } }' \
  -F 'variables[file]=@/path/to/screenshot.png'
```

### Upload File to File Column
Attach a file directly to an item's file column:

```bash
curl -X POST "https://api.monday.com/v2/file" \
  -H "Authorization: $MONDAY_API_TOKEN" \
  -F 'query=mutation ($file: File!) { add_file_to_column(file: $file, item_id: ITEM_ID, column_id: "files") { id } }' \
  -F 'variables[file]=@/path/to/document.pdf'
```

### Supported File Types
JPEG, PNG, GIF, PDF, Word/Doc, XLSX, CSV, SVG, TXT, MP4, AI (max 500 MB)

## Error Handling

- **401/403**: Invalid or missing token - check $MONDAY_API_TOKEN
- **400**: Invalid GraphQL query - check syntax and field names
- **429**: Rate limited - wait and retry
- **Column not found**: Column IDs vary by board - fetch structure first

## Tips

- Column IDs are strings like "status", "people", "date4", "text" - fetch board structure to find exact IDs
- Status labels are board-specific - fetch column settings to see available labels
- User IDs are numeric but passed as strings in some mutations
- For `change_column_value`, the `value` parameter must be a JSON string (escaped)
- For `change_simple_column_value`, the `value` is a plain string
