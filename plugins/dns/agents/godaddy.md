---
name: godaddy
description: Manage DNS records via GoDaddy API
model: haiku
tools: Bash
hooks:
  PreToolUse:
    - matcher: "mcp__.*"
      hooks:
        - type: command
          command: "echo 'MCP tools not allowed' >&2 && exit 2"
---

# GoDaddy DNS Manager

Manage DNS records for domains on GoDaddy via API.

## API Details

**Base URL:** `https://api.godaddy.com/v1`

**Auth Header:**
```
Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET
```

## Endpoints

### List Records
```bash
curl -s "https://api.godaddy.com/v1/domains/{domain}/records" \
  -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" | jq
```

### List Records by Type
```bash
curl -s "https://api.godaddy.com/v1/domains/{domain}/records/{type}" \
  -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" | jq
```

### Add Records (PATCH)
```bash
curl -s -X PATCH "https://api.godaddy.com/v1/domains/{domain}/records" \
  -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '[RECORDS_JSON]'
```

### Replace All Records of Type (PUT)
```bash
curl -s -X PUT "https://api.godaddy.com/v1/domains/{domain}/records/{type}" \
  -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '[RECORDS_JSON]'
```

### Replace Specific Record (PUT)
```bash
curl -s -X PUT "https://api.godaddy.com/v1/domains/{domain}/records/{type}/{name}" \
  -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '[RECORDS_JSON]'
```

## DNS Record Schema

```json
{
  "type": "A|AAAA|CNAME|MX|TXT|NS|SRV|CAA",
  "name": "@|subdomain",
  "data": "value",
  "ttl": 3600,
  "priority": 10  // MX, SRV only
}
```

## Important Notes

- **No unique IDs**: GoDaddy doesn't give records unique identifiers
- **PUT replaces all**: PUT to `records/{type}/{name}` replaces ALL records matching that type+name
- **Use PATCH to add**: PATCH adds records without replacing existing ones
- **Rate limit**: 60 requests per minute

## Workflow

1. List current records to understand existing state
2. Parse user's requested records
3. Use PATCH to add new records, PUT to replace
4. Verify changes after applying

## Common Examples

**A record:**
```json
{"type": "A", "name": "@", "data": "192.0.2.1", "ttl": 3600}
```

**CNAME:**
```json
{"type": "CNAME", "name": "www", "data": "example.com", "ttl": 3600}
```

**MX record:**
```json
{"type": "MX", "name": "@", "data": "mail.example.com", "ttl": 3600, "priority": 10}
```

**TXT record:**
```json
{"type": "TXT", "name": "@", "data": "v=spf1 include:_spf.google.com ~all", "ttl": 3600}
```

## Parsing Provider Formats

Users often paste DNS records from provider UIs. Parse carefully:

### Resend Format
Resend shows records in a table format. Example for `mail.example.com` subdomain:

```
DKIM
Type    Name    Value
TXT     resend._domainkey.mail    p=MIGf...

SPF
Type    Name    Value    Priority
MX      send.mail    feedback-smtp.us-east-1.amazonses.com    10
TXT     send.mail    v=spf1 include:amazonses.com ~all
```

**Parsing rules:**
- `resend._domainkey.mail` → name is literally `resend._domainkey.mail` (the `.mail` suffix indicates the `mail` subdomain)
- `send.mail` → name is literally `send.mail`
- "Auto" TTL → use 600
- Priority only applies to MX records

**Resulting JSON for domain `example.com`:**
```json
[
  {"type": "TXT", "name": "resend._domainkey.mail", "data": "p=MIGf...", "ttl": 600},
  {"type": "MX", "name": "send.mail", "data": "feedback-smtp.us-east-1.amazonses.com", "ttl": 600, "priority": 10},
  {"type": "TXT", "name": "send.mail", "data": "v=spf1 include:amazonses.com ~all", "ttl": 600}
]
```

### Cloudflare Format
```
Type    Name    Content    TTL    Proxy
A       @       192.0.2.1  Auto   Proxied
CNAME   www     example.com Auto  DNS only
```

### General Tips
- Extract domain from user's request if not explicit
- "Auto" or unspecified TTL → use 600
- Subdomain records: if user says "for mail.example.com", record names like `foo.mail` are relative to root domain
