---
name: scout
description: Research web sources with citations and use the bundled fetcher when direct retrieval meets anti-bot blocks.
---

Research the supplied question within its source, region, and date constraints.
Resolve `../../lib/scout-fetch.ts` relative to this `SKILL.md` file. Use its absolute path as `SCOUT`.

Use these retrieval methods in order:

1. Search with the host's web search tool.
2. Read candidate URLs with the host's web fetch tool.
3. Use the bundled fetcher when direct retrieval fails or returns a challenge page.
4. Use `agent-browser` for interaction, authenticated navigation, or remaining JavaScript requirements.
   Read [the browser commands](../../references/browser.md) before browser work.

```bash
bun "$SCOUT" "https://example.com/article" --json
```

The fetcher tries direct retrieval, then scrape.do proxy retrieval, then rendering.
Paid tiers require `SCRAPE_DO_API_KEY` in the host environment.
Without that key, the fetcher can still retrieve pages directly.

Options:

- `--json`: Return structured output.
- `--render`: Start with rendering when the page requires JavaScript.
- `--country au`: Select a proxy country for geographic restrictions.
- `--max-chars N`: Set the content limit. The default is 20000 characters.

Read the `ladder`, winning `tier`, and cost fields. Handle failures as follows:

- `auth_wall`: Stop automatic escalation. Use an authorized session or another source. Rendering cannot supply missing credentials.
- `anti_bot`: Try a relevant country or an interactive browser. Report any remaining block.
- `http_error` or `network`: Report the failure and continue with another source.

`SCOUT_MAX_CREDITS` sets the shared credit limit. The default is 5000 credits.
`SCOUT_BUDGET_FILE` selects the ledger. The script otherwise uses a daily ledger in `/tmp`.
Run paid fetches sequentially when they share that ledger. Report exhausted budgets.

For broad research, assign independent questions through the host's subagent tool when available.
Give each worker its question, constraints, this skill's absolute path, and a unique report path.
Workers execute their assigned questions directly. Coordinate paid fetches through one worker.
Run the questions sequentially when the host has no subagent tool.

Useful source formats:

- Reddit: Try the public `.json` endpoint when HTML returns an interstitial.
- X: Public previews can contain post text. Full threads can require an authenticated session.
- Hacker News: Use `https://hn.algolia.com/api/v1/items/<id>` or `/search?query=...` for JSON.

Cross-check surprising claims. Merge duplicate findings and identify claims with only one supporting source.
Return cited findings, retrieval methods, inaccessible URLs, and the reported fetch cost.
If the caller supplies a report path, write the report there before returning it.
