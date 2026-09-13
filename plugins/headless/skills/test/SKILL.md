---
name: test
description: Test website flows with agent-browser and report results with screenshot evidence.
---

Read [the browser commands](../../references/browser.md).
Use the supplied URL, test flows, and expected behavior.

For independent flows, use the host's subagent tool when available.
Give each worker one flow, this skill's absolute path, and a unique report path.
Each worker runs its assigned flow directly. It must not delegate that flow again.
Use a separate browser session for each worker. Run flows sequentially when they share state or no subagent tool exists.

For each flow:

1. Open the target page in a unique session.
2. Take a snapshot and act on its current element references.
3. Take another snapshot after each page change.
4. Capture screenshots at validation points. Inspect them with the host image viewer.
5. Compare the observed result with the expected behavior.
6. Report PASS or FAIL with the steps, actual result, and evidence paths.
7. Close the browser session, including after failures.

Collect worker results through the host's completion tools and report files.
Return flow counts, pass/fail counts, and failures with evidence.
If the caller supplies a report path, write the report there before returning it.
