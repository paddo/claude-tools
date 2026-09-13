---
name: monday
description: Manage Monday.com boards, tasks, comments, and attachments through its API.
---

Read [the API reference](references/api.md) and follow its workflow for the requested task.
Run the documented commands through the host shell tool. Do not use MCP tools for this workflow.
The host process must provide these environment variables: MONDAY_API_TOKEN.
Use Queries for reads, Mutations for task changes, and File Upload for attachments.

Return the results or the specific failure.
If the caller supplies a report path, write the report there before returning it.
