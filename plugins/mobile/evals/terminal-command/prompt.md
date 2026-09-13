---
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Bash]
---

Give me a terminal command for the mobile development loop using the bundled runner.
Platform: ios. App: com.example.demo. Source directory: ./source folder. Flow file: ./flows/login test.yaml.
Generate the command with the runner's shell-cmd operation. Do not install dependencies, start the loop, or connect to devices.
Set MAESTRO_DEV_LOGS=/dev/null/mobile-eval-logs when calling shell-cmd. This path cannot hold logs.
The command must succeed with that setting. Do not use another log directory.
