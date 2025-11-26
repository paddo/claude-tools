# Spaceship DNS Manager

Manage DNS records for domains on spaceship.com via API.

## API Details

**Base URL:** `https://spaceship.dev/api/v1`

**Auth Headers:**
- `X-Api-Key`: API key from Spaceship API Manager
- `X-Api-Secret`: API secret

**Credentials:** Store in `~/.zshrc`:
```bash
export SPACESHIP_API_KEY="your-key"
export SPACESHIP_API_SECRET="your-secret"
```

## Endpoints

### GET /dns/records/{domain}?take=500&skip=0
List records. Pagination params `take` and `skip` are **required**.

Response:
```json
{"items": [...], "total": 123}
```

### PUT /dns/records/{domain}
Create/update records. Matched by type+name, updates existing or adds new.

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

  "address": "1.2.3.4",           // A, AAAA
  "cname": "target.com",          // CNAME
  "value": "txt content",         // TXT, CAA
  "exchange": "mail.example.com", // MX
  "preference": 10,               // MX priority
  "nameserver": "ns1.example.com", // NS
  "aliasName": "target.com",      // ALIAS

  "service": "_sip",              // SRV
  "protocol": "_tcp",
  "priority": 10,
  "weight": 5,
  "target": "sip.example.com",

  "flag": 0,                      // CAA
  "tag": "issue|issuewild|iodef"
}
```

## Instructions

When the user asks to manage DNS:

1. **Source zshrc and list current records:**
   ```bash
   bash -c 'source ~/.zshrc 2>/dev/null; curl -s "https://spaceship.dev/api/v1/dns/records/DOMAIN?take=500&skip=0" -H "X-Api-Key: $SPACESHIP_API_KEY" -H "X-Api-Secret: $SPACESHIP_API_SECRET"' | jq
   ```

2. **Parse user's requested records** - they may paste from Spaceship UI, Resend, Cloudflare, or describe in plain text

3. **Create PUT request:**
   ```bash
   bash -c 'source ~/.zshrc 2>/dev/null; curl -s -X PUT "https://spaceship.dev/api/v1/dns/records/DOMAIN" \
     -H "X-Api-Key: $SPACESHIP_API_KEY" \
     -H "X-Api-Secret: $SPACESHIP_API_SECRET" \
     -H "Content-Type: application/json" \
     -d '\''{"force": true, "items": [RECORDS_JSON]}'\'''
   ```

4. **Verify** - list records after to confirm

## Common Examples

**Resend/SES email setup:**
```json
[
  {"type": "TXT", "name": "resend._domainkey", "ttl": 3600, "value": "p=MIG..."},
  {"type": "MX", "name": "send", "ttl": 3600, "exchange": "feedback-smtp.us-east-1.amazonses.com", "preference": 10},
  {"type": "TXT", "name": "send", "ttl": 3600, "value": "v=spf1 include:amazonses.com ~all"},
  {"type": "TXT", "name": "_dmarc", "ttl": 3600, "value": "v=DMARC1; p=none;"}
]
```

**Google Workspace:**
```json
[
  {"type": "MX", "name": "@", "ttl": 3600, "exchange": "aspmx.l.google.com", "preference": 1},
  {"type": "MX", "name": "@", "ttl": 3600, "exchange": "alt1.aspmx.l.google.com", "preference": 5},
  {"type": "TXT", "name": "@", "ttl": 3600, "value": "v=spf1 include:_spf.google.com ~all"}
]
```

## Rate Limits

5 requests per domain per 300 seconds. Batch multiple record changes into single PUT.
