# Spaceship DNS Manager

Manage DNS records for domains on spaceship.com via API.

## API Details

**Base URL:** `https://spaceship.dev/api/v1`

**Auth Headers:**
- `X-API-Key`: API key from Spaceship API Manager
- `X-API-Secret`: API secret

**Credentials:** Store in environment variables `SPACESHIP_API_KEY` and `SPACESHIP_API_SECRET`

## Endpoints

### GET /dns/records/{domain}
List records. Supports pagination: `?take=500&skip=0&orderBy=type`

Response:
```json
{"items": [...], "total": 123}
```

### PUT /dns/records/{domain}
Create/update records. Replaces matched records.

```json
{
  "force": true,
  "items": [...]
}
```

### DELETE /dns/records/{domain}
Delete records. Body is array of records to delete.

## DNS Record Schema

```json
{
  "type": "A|AAAA|CNAME|MX|TXT|NS|SRV|CAA|ALIAS|HTTPS|SVCB|PTR|TLSA",
  "name": "@|subdomain|*.wildcard",
  "ttl": 3600,

  // Type-specific fields:
  "address": "1.2.3.4",           // A, AAAA
  "cname": "target.com",          // CNAME
  "value": "txt content",         // TXT, CAA
  "exchange": "mail.example.com", // MX
  "preference": 10,               // MX priority
  "nameserver": "ns1.example.com", // NS
  "aliasName": "target.com",      // ALIAS

  // SRV:
  "service": "_sip",
  "protocol": "_tcp",
  "priority": 10,
  "weight": 5,
  "target": "sip.example.com",

  // CAA:
  "flag": 0,
  "tag": "issue|issuewild|iodef"
}
```

## Common Record Examples

**A Record:**
```json
{"type": "A", "name": "@", "ttl": 3600, "address": "1.2.3.4"}
```

**CNAME:**
```json
{"type": "CNAME", "name": "www", "ttl": 3600, "cname": "example.com"}
```

**MX:**
```json
{"type": "MX", "name": "@", "ttl": 3600, "exchange": "mail.example.com", "preference": 10}
```

**TXT (SPF):**
```json
{"type": "TXT", "name": "@", "ttl": 3600, "value": "v=spf1 include:_spf.google.com ~all"}
```

**TXT (DKIM):**
```json
{"type": "TXT", "name": "selector._domainkey", "ttl": 3600, "value": "v=DKIM1; k=rsa; p=..."}
```

**TXT (DMARC):**
```json
{"type": "TXT", "name": "_dmarc", "ttl": 3600, "value": "v=DMARC1; p=none;"}
```

## Instructions

When the user asks to manage DNS:

1. **Check credentials exist:**
   ```bash
   echo "API_KEY: ${SPACESHIP_API_KEY:+set}" && echo "API_SECRET: ${SPACESHIP_API_SECRET:+set}"
   ```

2. **List current records first** to understand existing state:
   ```bash
   curl -s -X GET "https://spaceship.dev/api/v1/dns/records/DOMAIN" \
     -H "X-API-Key: $SPACESHIP_API_KEY" \
     -H "X-API-Secret: $SPACESHIP_API_SECRET" | jq
   ```

3. **Parse user's requested records** - they may paste from Spaceship UI or describe in plain text

4. **Create the PUT request** with properly formatted JSON

5. **Execute and verify** - list records after to confirm

## Rate Limits

- 5 requests per domain per 300 seconds for write operations
- 5 requests per domain per 300 seconds for read operations

Always batch multiple record changes into single PUT request.
