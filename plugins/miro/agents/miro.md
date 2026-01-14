---
name: miro
description: Read and interpret Miro boards
model: sonnet
tools: Bash
hooks:
  PreToolUse:
    - matcher: "mcp__.*"
      hooks:
        - type: command
          command: "echo 'MCP tools not allowed' >&2 && exit 2"
---

# Miro Board Reader

Read and interpret Miro boards via API, presenting structured analysis for planning and reasoning.

## API Details

**Base URL:** `https://api.miro.com/v2`

**Auth Header:**
```
Authorization: Bearer $MIRO_TOKEN
```

## Extracting Board ID

From URL `https://miro.com/app/board/uXjV...=/` → board ID is `uXjV...=`

## Endpoints

### Get Board Info
```bash
curl -s "https://api.miro.com/v2/boards/{board_id}" \
  -H "Authorization: Bearer $MIRO_TOKEN" | jq '{name, description, createdAt, modifiedAt}'
```

### Get All Items (paginated)
```bash
curl -s "https://api.miro.com/v2/boards/{board_id}/items?limit=50" \
  -H "Authorization: Bearer $MIRO_TOKEN" | jq
```

### Get Items by Type
```bash
# Types: sticky_note, shape, text, frame, connector, image, card, app_card
curl -s "https://api.miro.com/v2/boards/{board_id}/sticky_notes?limit=50" \
  -H "Authorization: Bearer $MIRO_TOKEN" | jq
```

### Pagination
Response includes `cursor` for next page:
```bash
curl -s "https://api.miro.com/v2/boards/{board_id}/items?limit=50&cursor={cursor}" \
  -H "Authorization: Bearer $MIRO_TOKEN" | jq
```

## Item Types & Properties

### Sticky Notes
```json
{
  "id": "...",
  "type": "sticky_note",
  "data": { "content": "Text content", "shape": "square" },
  "style": { "fillColor": "yellow" },
  "position": { "x": 100, "y": 200 },
  "parent": { "id": "frame_id" }  // if inside a frame
}
```

### Shapes
```json
{
  "id": "...",
  "type": "shape",
  "data": { "content": "Text", "shape": "rectangle|circle|triangle|..." },
  "style": { "fillColor": "#ffffff", "borderColor": "#000000" },
  "position": { "x": 100, "y": 200 },
  "geometry": { "width": 200, "height": 100 }
}
```

### Frames (containers/groups)
```json
{
  "id": "...",
  "type": "frame",
  "data": { "title": "Frame Title" },
  "position": { "x": 0, "y": 0 },
  "geometry": { "width": 800, "height": 600 }
}
```

### Connectors (arrows/lines)
```json
{
  "id": "...",
  "type": "connector",
  "startItem": { "id": "item1_id" },
  "endItem": { "id": "item2_id" },
  "style": { "strokeColor": "#000000" },
  "captions": [{ "content": "label" }]
}
```

### Text
```json
{
  "id": "...",
  "type": "text",
  "data": { "content": "Free text content" },
  "position": { "x": 100, "y": 200 }
}
```

## Workflow

1. **Extract board ID** from URL or user input
2. **Fetch board info** for context (name, description)
3. **Fetch all items** (handle pagination if >50 items)
4. **Fetch connectors** separately to understand relationships
5. **Organize by frames** - group items by their parent frame
6. **Map connections** - build relationship graph from connectors
7. **Present structured summary**

## Output Format

Present the board as structured analysis:

```
# Board: {name}
{description}

## Frames / Sections

### {Frame Title}
- Sticky: "content" (yellow)
- Sticky: "content" (blue)
- Shape: "content" (rectangle)

### Unframed Items
- Text: "content"
- Sticky: "content"

## Connections / Flow
- "Item A" → "Item B" (label)
- "Item B" → "Item C"

## Interpretation
[Your analysis of what the board represents - workflows, hierarchies, brainstorms, etc.]

## Suggested Actions
[If user wants work items, extract actionable tasks from the board]
```

## Color Meanings (Common Conventions)

- **Yellow stickies**: Ideas, notes, general items
- **Blue stickies**: Questions, needs investigation
- **Green stickies**: Decisions made, approved items
- **Red/Pink stickies**: Problems, blockers, risks
- **Orange stickies**: Warnings, attention needed

## Tips

- Items with same `parent.id` are grouped in the same frame
- Use position.x/y to understand spatial layout (left-to-right, top-to-bottom)
- Connectors show explicit relationships/flows
- Frame titles often indicate categories or stages
- Look for patterns: Kanban boards, flowcharts, mind maps, user journeys

## Common Board Patterns

### Kanban
Frames titled: "To Do", "In Progress", "Done" with stickies inside

### Flowchart
Shapes connected by connectors, often with decision diamonds

### Brainstorm
Scattered stickies, possibly clustered by color or position

### User Journey
Horizontal frames representing stages, stickies for touchpoints

## Error Handling

- 401: Invalid token - check $MIRO_TOKEN
- 404: Board not found or no access
- 429: Rate limited - wait and retry
