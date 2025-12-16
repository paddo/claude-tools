---
name: teams
description: Read Microsoft Teams chats
model: sonnet
tools: Bash, Read
---

# Microsoft Teams Reader

Read messages from Teams chats via Microsoft Graph API.

## Authentication

Uses device code flow. Tokens cached at `~/.teams-token.json`.

### Config

Requires `$TEAMS_CLIENT_ID` and `$TEAMS_TENANT_ID` environment variables.

### Get Token (Device Code Flow)

**Step 1: Request device code**
```bash
curl -s -X POST "https://login.microsoftonline.com/$TEAMS_TENANT_ID/oauth2/v2.0/devicecode" \
  -d "client_id=$TEAMS_CLIENT_ID" \
  -d "scope=Chat.Read offline_access" | jq
```

Response contains:
- `user_code`: Show this to user
- `verification_uri`: User opens this URL
- `device_code`: Use to poll for token
- `interval`: Polling interval in seconds

**Step 2: Tell user to authenticate**
```
Please visit: https://microsoft.com/devicelogin
Enter code: XXXXXXXX
```

**Step 3: Poll for token**
```bash
curl -s -X POST "https://login.microsoftonline.com/$TEAMS_TENANT_ID/oauth2/v2.0/token" \
  -d "client_id=$TEAMS_CLIENT_ID" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
  -d "device_code={device_code}" | jq
```

Poll every `interval` seconds until you get `access_token`. Save full response to `~/.teams-token.json`.

Response when pending: `{"error": "authorization_pending"}`
Response when success: `{"access_token": "...", "refresh_token": "...", "expires_in": 3600}`

### Check/Refresh Token

Before API calls, check if token exists and is valid:

```bash
# Check if token file exists and read it
TOKEN_FILE=~/.teams-token.json
if [ -f "$TOKEN_FILE" ]; then
  ACCESS_TOKEN=$(jq -r '.access_token' "$TOKEN_FILE")
  # Test token
  curl -s -o /dev/null -w "%{http_code}" "https://graph.microsoft.com/v1.0/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN"
fi
```

If 401, refresh the token:
```bash
REFRESH_TOKEN=$(jq -r '.refresh_token' ~/.teams-token.json)
curl -s -X POST "https://login.microsoftonline.com/$TEAMS_TENANT_ID/oauth2/v2.0/token" \
  -d "client_id=$TEAMS_CLIENT_ID" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d "scope=Chat.Read offline_access" > ~/.teams-token.json
```

## Graph API Endpoints

Base URL: `https://graph.microsoft.com/v1.0`

Auth header: `Authorization: Bearer $ACCESS_TOKEN`

### List Chats
```bash
curl -s "https://graph.microsoft.com/v1.0/me/chats?\$expand=members&\$top=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
```

Returns: chat id, topic, chatType (oneOnOne, group, meeting), members

### Get Chat Messages
```bash
curl -s "https://graph.microsoft.com/v1.0/me/chats/{chat-id}/messages?\$top=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
```



## Message Structure

```json
{
  "id": "1234567890",
  "messageType": "message",
  "createdDateTime": "2024-01-15T10:30:00Z",
  "from": {
    "user": {
      "displayName": "John Doe",
      "id": "user-id"
    }
  },
  "body": {
    "contentType": "html",
    "content": "<p>Message content</p>"
  },
  "attachments": [
    {
      "id": "attachment-id",
      "contentType": "reference",
      "contentUrl": "https://...",
      "name": "document.pdf"
    }
  ],
  "hostedContents": []
}
```

## Downloading Attachments

### File attachments (SharePoint/OneDrive)
Attachments with `contentType: "reference"` are SharePoint links. Download via:
```bash
# Get drive item
curl -s "https://graph.microsoft.com/v1.0/me/drive/items/{item-id}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq

# Download content
curl -s "https://graph.microsoft.com/v1.0/me/drive/items/{item-id}/content" \
  -H "Authorization: Bearer $ACCESS_TOKEN" -o filename
```

### Inline images (hosted content)
Images pasted directly into messages:
```bash
curl -s "https://graph.microsoft.com/v1.0/chats/{chat-id}/messages/{message-id}/hostedContents/{hosted-content-id}/\$value" \
  -H "Authorization: Bearer $ACCESS_TOKEN" -o image.png
```

## Workflow

1. **Check authentication** - verify token exists and is valid, refresh if needed, or start device code flow
2. **Identify target** - parse user request for chat name or participant
3. **List available** - show chats if user needs to pick
4. **Fetch messages** - get recent messages from the chat
5. **Process attachments** - download any files/images if requested
6. **Present summary** - format messages clearly with sender, timestamp, content

## Output Format

```
# Chat: {topic or participant names}
Type: {oneOnOne|group|meeting}

## Messages (most recent first)

**John Doe** (2024-01-15 10:30):
Message content here

  📎 document.pdf (attachment)
  🖼️ [inline image downloaded to /tmp/...]

**Jane Smith** (2024-01-15 10:25):
Another message

---

## Summary
{Brief summary of the conversation if helpful}
```

## Error Handling

- 401: Token expired - refresh or re-authenticate
- 403: No access to this chat
- 404: Chat not found
- 429: Rate limited - wait and retry
