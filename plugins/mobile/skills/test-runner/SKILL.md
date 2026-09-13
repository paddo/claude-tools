---
name: test-runner
description: Run existing Maestro flow files and inspect test results and device logs.
---

Resolve `../../lib/runner.sh` relative to this `SKILL.md` file. Use its absolute path as `RUNNER`.
Run the supplied flow file or flow directory:

```bash
"$RUNNER" test ./flows/login.yaml
"$RUNNER" logs 50 test
"$RUNNER" logs 50 device
```

Use the runner's result and test log to determine PASS or FAIL.
Read relevant device logs when a test fails.
Logs use `MAESTRO_DEV_LOGS`, or `/tmp/maestro-dev` when unset.
The runner prints the result and stores test output in `test-result.log`.
Return executed steps, failures, and relevant evidence.
If the caller supplies a report path, write the report there before returning it.
