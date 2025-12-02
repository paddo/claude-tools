---
allowed-tools:
  - Task
description: Manage DNS records for domains on Spaceship
---

Delegate this to the **spaceship** agent to handle independently.

The spaceship agent will:
- List current DNS records for the domain
- Parse records from various formats (Spaceship UI, Resend, Cloudflare, plain text)
- Create/update/delete records via the Spaceship API
- Verify changes after applying

Requires `$SPACESHIP_API_KEY` and `$SPACESHIP_API_SECRET` environment variables.

USER REQUEST: $*
