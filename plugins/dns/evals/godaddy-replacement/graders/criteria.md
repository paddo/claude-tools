---
type: llm
---

PASS only if the response meets all conditions:
- PUT replaces every record matching the type and name.
- The replacement payload retains the other TXT value.
- The required variables are GODADDY_API_KEY and GODADDY_API_SECRET.
FAIL if the response claims PUT changes only one matching value or claims records were changed.
