---
type: llm
---

PASS if the response contains a terminal command invoking runner.sh dev with these separate arguments:
- ios
- com.example.demo
- ./source folder
- ./flows/login test.yaml
Shell quoting or escaping must preserve both paths with spaces.
FAIL if the response starts the loop, installs dependencies, or cannot locate the bundled runner.
FAIL if shell-cmd fails with the requested MAESTRO_DEV_LOGS setting or the agent changes that setting during generation.
The printed dev command need not include MAESTRO_DEV_LOGS. Advice about its later execution does not violate this condition.
