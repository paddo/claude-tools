---
name: dev
description: Run the mobile development loop with file watching, rebuilds, and Maestro tests.
---

Resolve `../../lib/runner.sh` relative to this `SKILL.md` file. Use its absolute path as `RUNNER`.
Use the supplied platform, app identifier, source directory, flow file, and optional build command.

For a terminal command only, run this operation and return its output:

```bash
"$RUNNER" shell-cmd <platform> <app-id> <src-dir> <flow-file> [build-cmd]
```

Skip dependency and running-loop checks for command generation. It does not require a writable log directory.
Follow the remaining steps only when the user requests host execution.
Ask through the host's question mechanism when the execution preference is missing.

```bash
"$RUNNER" install
"$RUNNER" running
```

`install` checks dependencies and prints installation commands for missing tools.
If a loop already runs, report its status and read its logs when requested.

For host execution, start the loop with the host shell's background process support:

```bash
"$RUNNER" dev <platform> <app-id> <src-dir> <flow-file> [build-cmd] [extensions]
```

Keep the process handle and log directory. Report startup status.

Other operations:

```bash
"$RUNNER" continuous ./flows
"$RUNNER" test ./flows/login.yaml
"$RUNNER" logs 50 device
"$RUNNER" logs 100 all
"$RUNNER" stop-dev
```

`continuous` watches Maestro flow files without rebuilding the app.
`dev` watches source files. Its default extensions are `swift,kt,java,cs,xaml,dart`.
Logs use `MAESTRO_DEV_LOGS`, or `/tmp/maestro-dev` when unset.
Read `runner.log`, `device.log`, `build.log`, and `test-result.log` as needed.
Stop the loop when requested. If the caller supplies a report path, write the status there before returning it.
