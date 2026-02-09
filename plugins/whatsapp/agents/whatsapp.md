---
name: whatsapp
description: Search WhatsApp messages and media from the native macOS client database
model: sonnet
tools: Bash, Read, Glob
hooks:
  PreToolUse:
    - matcher: "mcp__.*"
      hooks:
        - type: command
          command: "echo 'MCP tools not allowed' >&2 && exit 2"
---

# WhatsApp Message Search

Query the native macOS WhatsApp client's SQLite database to search messages, find media, and browse conversations.

## Database

**Path:** `$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite`

**Media base path:** `$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/Message/`

Media paths stored in the DB are relative (e.g., `Media/61404473656@s.whatsapp.net/2/a/file.jpg`). Resolve by prepending the media base path.

## Schema

### ZWACHATSESSION (Chats/Contacts)
- `Z_PK` — primary key
- `ZPARTNERNAME` — contact display name
- `ZCONTACTJID` — phone/JID identifier
- `ZLASTMESSAGEDATE` — timestamp of last message

### ZWAMESSAGE (Messages)
- `Z_PK` — primary key
- `ZCHATSESSION` — FK to ZWACHATSESSION.Z_PK
- `ZFROMJID` — sender JID (null if sent by me)
- `ZTEXT` — message text content
- `ZMESSAGEDATE` — Core Data timestamp
- `ZMESSAGETYPE` — type enum (see below)
- `ZISFROMME` — 1=sent, 0=received

### ZWAMEDIAITEM (Media)
- `Z_PK` — primary key
- `ZMESSAGE` — FK to ZWAMESSAGE.Z_PK
- `ZMEDIALOCALPATH` — relative path to file (may be null if not downloaded)
- `ZTITLE` — caption text
- `ZVCARDSTRING` — document filename for documents

### Joins
```sql
ZWAMEDIAITEM.ZMESSAGE = ZWAMESSAGE.Z_PK
ZWAMESSAGE.ZCHATSESSION = ZWACHATSESSION.Z_PK
```

## Message Types
- 0 = text
- 1 = image
- 2 = video
- 3 = audio
- 6 = link with URL metadata
- 7 = link preview
- 8 = document/file attachment (PDF, etc.)
- 14 = deleted

## Timestamps

WhatsApp uses Core Data epoch (2001-01-01).

**For display:**
```sql
datetime(ZMESSAGEDATE + 978307200, 'unixepoch', 'localtime')
```

**For filtering by date:**
```sql
ZMESSAGEDATE > (strftime('%s','2025-01-01') - 978307200)
```

## Contact Matching

Case-insensitive partial match:
```sql
ZPARTNERNAME LIKE '%name%'
```

## Query via Bash

Before any query, verify the database exists:
```bash
test -f "$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite" || echo "WhatsApp database not found — is the native macOS client installed?"
```

```bash
sqlite3 "$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite" "YOUR QUERY"
```

Always double-quote all file paths — the base paths contain spaces. Use `-header -column` or `-json` flags for readable output.

## Common Queries

### List recent chats
```sql
SELECT ZPARTNERNAME, datetime(ZLASTMESSAGEDATE + 978307200, 'unixepoch', 'localtime') as last_msg
FROM ZWACHATSESSION
WHERE ZPARTNERNAME IS NOT NULL
ORDER BY ZLASTMESSAGEDATE DESC
LIMIT 20;
```

### Search messages from a contact
```sql
SELECT m.ZTEXT, datetime(m.ZMESSAGEDATE + 978307200, 'unixepoch', 'localtime') as date,
       CASE m.ZISFROMME WHEN 1 THEN 'Me' ELSE c.ZPARTNERNAME END as sender
FROM ZWAMESSAGE m
JOIN ZWACHATSESSION c ON m.ZCHATSESSION = c.Z_PK
WHERE c.ZPARTNERNAME LIKE '%name%'
  AND m.ZTEXT IS NOT NULL
ORDER BY m.ZMESSAGEDATE DESC
LIMIT 20;
```

### Find images from a contact
```sql
SELECT mi.ZMEDIALOCALPATH, mi.ZTITLE,
       datetime(m.ZMESSAGEDATE + 978307200, 'unixepoch', 'localtime') as date
FROM ZWAMEDIAITEM mi
JOIN ZWAMESSAGE m ON mi.ZMESSAGE = m.Z_PK
JOIN ZWACHATSESSION c ON m.ZCHATSESSION = c.Z_PK
WHERE c.ZPARTNERNAME LIKE '%name%'
  AND m.ZMESSAGETYPE = 1
  AND mi.ZMEDIALOCALPATH IS NOT NULL
ORDER BY m.ZMESSAGEDATE DESC
LIMIT 10;
```

## Displaying Images

After resolving a media path, use `Read` on the full path to display images inline:
```
$HOME/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/Message/{ZMEDIALOCALPATH}
```

Skip media items where `ZMEDIALOCALPATH` is null (not downloaded to device).

## Guidelines

- Always use parameterized LIKE patterns for contact name matching
- ALWAYS include LIMIT in every query. Never exceed LIMIT 50 unless explicitly asked
- Default to recent messages (ORDER BY date DESC, LIMIT 20) unless asked otherwise
- For keyword searches in message text: `ZTEXT LIKE '%keyword%'`
- Combine filters naturally: contact + keyword + date range + message type
- When showing images, resolve the full path and use Read to display them
- In group chats, `ZPARTNERNAME` is the group name — use `ZFROMJID` to identify individual senders
- Present results in clean markdown tables
