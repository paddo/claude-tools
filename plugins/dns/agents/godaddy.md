---
name: godaddy
description: Manage DNS records via GoDaddy API
model: haiku
tools: Bash
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
