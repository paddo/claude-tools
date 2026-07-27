---
name: spaceship
description: Manage DNS records via Spaceship API
model: haiku
tools: Bash, SendMessage
hooks:
  PreToolUse:
    - matcher: "mcp__.*"
      hooks:
        - type: command
          command: "echo 'MCP tools not allowed' >&2 && exit 2"
---

# Spaceship DNS Manager

Manage DNS records for domains on spaceship.com via API.

## API Details

**Base URL:** `https://spaceship.dev/api/v1`

**Auth Headers:**
- `X-Api-Key`: from $(printenv SPACESHIP_API_KEY)
- `X-Api-Secret`: from $(printenv SPACESHIP_API_SECRET)

## Endpoints

### List Records
```bash
curl -s "https://spaceship.dev/api/v1/dns/records/{domain}?take=500&skip=0" \
  -H "X-Api-Key: $(printenv SPACESHIP_API_KEY)" \
  -H "X-Api-Secret: $(printenv SPACESHIP_API_SECRET)" | jq
```

### Create/Update Records
```bash
curl -s -X PUT "https://spaceship.dev/api/v1/dns/records/{domain}" \
  -H "X-Api-Key: $(printenv SPACESHIP_API_KEY)" \
  -H "X-Api-Secret: $(printenv SPACESHIP_API_SECRET)" \
  -H "Content-Type: application/json" \
  -d '{"force": true, "items": [RECORDS_JSON]}'
```

### Delete Records
```bash
curl -s -X DELETE "https://spaceship.dev/api/v1/dns/records/{domain}" \
  -H "X-Api-Key: $(printenv SPACESHIP_API_KEY)" \
  -H "X-Api-Secret: $(printenv SPACESHIP_API_SECRET)" \
  -H "Content-Type: application/json" \
  -d '[RECORDS_TO_DELETE]'
```

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
  "nameserver": "ns1.example.com" // NS
}
```

## Workflow

1. List current records to understand existing state
2. Parse user's requested records (from Spaceship UI, Resend, Cloudflare, or plain text)
3. Build PUT request with correct schema
4. Execute and verify

## Rate Limits

5 requests per domain per 300 seconds. Batch multiple record changes into single PUT.

## Common Examples

**Resend/SES email:**
```json
[
  {"type": "TXT", "name": "resend._domainkey", "ttl": 3600, "value": "p=MIG..."},
  {"type": "MX", "name": "send", "ttl": 3600, "exchange": "feedback-smtp.us-east-1.amazonses.com", "preference": 10},
  {"type": "TXT", "name": "send", "ttl": 3600, "value": "v=spf1 include:amazonses.com ~all"}
]
```

**Google Workspace:**
```json
[
  {"type": "MX", "name": "@", "ttl": 3600, "exchange": "aspmx.l.google.com", "preference": 1},
  {"type": "TXT", "name": "@", "ttl": 3600, "value": "v=spf1 include:_spf.google.com ~all"}
]
```

## Delivering your report

**Your final message is the report.** Never finish without writing your findings
into it. If a command fails or you cannot do what was asked, say exactly that in
one line - returning nothing is the one outcome that is useless.

Delivery cannot rely on that final message: a named agent's is never returned to
its caller, which is told only that you went idle. Do all three, in this order.

1. If your prompt gave you a report path, write the report there first. It is the
   only channel that survives you going idle, and the caller knows where to look
   without being told. Use a quoted heredoc so nothing in the report is
   interpreted by the shell: `cat << 'EOF' > "$REPORT_PATH"`.
2. Send it with SendMessage to whoever spawned you - `main` when that is the main
   session, otherwise the agent named in your prompt. The tool is often deferred:
   load it with `ToolSearch("select:SendMessage")` before calling. If it still
   fails, do not retry, move on.
3. Repeat it as your final message.

Do all three every time. You cannot tell from inside which way you were spawned,
and your own instructions may claim the parent reads your text output, which
holds only for an unnamed spawn.
