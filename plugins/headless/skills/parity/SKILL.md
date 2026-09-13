---
name: parity
description: Compare legacy and migrated websites with browser snapshots, screenshots, and optional video.
---

Read [the browser commands](../../references/browser.md).
Use the supplied legacy URL, migrated URL, and pages or flows. Treat the legacy site as the reference.
Record both sessions when the user requests `--video` or a temporal comparison.

For independent flows, use the host's subagent tool when available.
Give each worker one flow, both URLs, this skill's absolute path, and a unique report path.
Each worker runs its assigned flow directly. It must not delegate that flow again.
Give each worker two unique browser sessions. Run flows sequentially when they share state or no subagent tool exists.

For each flow:

1. Open both sites and take snapshots.
2. Match elements by purpose and content. Each session has its own element references.
3. Perform equivalent actions on both sites.
4. Take new snapshots after page changes. Compare structure, content, appearance, and behavior.
5. Inspect screenshots with the host image viewer. Record evidence for each difference.
6. Report each difference as critical, major, or minor. State whether the flow passed.
7. Stop recordings and close both sessions, including after failures.

Collect worker results through the host's completion tools and report files.
Return the number of pages tested, differences by severity, and the overall result.
If the caller supplies a report path, write the report there before returning it.
