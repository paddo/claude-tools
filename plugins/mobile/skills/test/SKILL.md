---
name: test
description: Test native iOS or Android app flows with Appium and screenshot evidence.
---

Read [the driver reference](../../references/driver.md).
Use the supplied platform, app identifier, device, test flows, and expected results.
Run flows sequentially on each device. Never assign multiple controllers to the same device.

1. Check the environment with the driver's `status` command.
2. Start a session on the selected device.
3. Capture the initial screenshot and hierarchy.
4. Find selectors in the hierarchy. Execute each requested action.
5. Capture state after key actions. Inspect screenshots with the host image viewer.
6. Compare observed behavior with expectations. Report PASS or FAIL for each flow.
7. Stop the session, including after failures.

Return tested flows, pass/fail counts, actual results, and screenshot paths.
If the caller supplies a report path, write the report there before returning it.
