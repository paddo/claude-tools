---
allowed-tools:
  - Task
description: Manage DNS records for domains on GoDaddy
---

Delegate this to the **godaddy** agent to handle independently.

The godaddy agent will:
- List current DNS records for the domain
- Parse records from various formats (GoDaddy UI, other providers, plain text)
- Create/update/delete records via the GoDaddy API
- Verify changes after applying

Requires `$GODADDY_API_KEY` and `$GODADDY_API_SECRET` environment variables.

USER REQUEST: $*
