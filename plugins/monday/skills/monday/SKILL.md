---
name: monday
description: Manage Monday.com boards, tasks, comments, and attachments through its API.
---

Read [the API reference](references/api.md) and follow its workflow for the requested task.
Run the documented commands through the host shell tool. Do not use MCP tools for this workflow.
Resolve `../../lib/credential.sh` relative to this `SKILL.md` file. Use its absolute path as `CREDENTIAL`.
The helper reads MONDAY_API_TOKEN from the environment first, then from the macOS keychain.
A host sandbox can block network and keychain access. Run these commands outside the sandbox.
Use Queries for reads, Mutations for task changes, and File Upload for attachments.

Return the results or the specific failure.
If the caller supplies a report path, write the report there before returning it.
