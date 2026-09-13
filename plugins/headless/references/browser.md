# Browser commands

Use `agent-browser` for browser actions. Use the host image viewer to inspect screenshots.
Install the CLI and browser before the first test:

```bash
command -v agent-browser || npm install -g agent-browser
agent-browser install
```

Choose a unique session for each worker. Keep its value across shell calls.

```bash
SESSION="test-$(uuidgen)"
agent-browser --session "$SESSION" open <url>
agent-browser --session "$SESSION" snapshot -i
agent-browser --session "$SESSION" click @e1
agent-browser --session "$SESSION" fill @e2 "text"
agent-browser --session "$SESSION" hover @e3
agent-browser --session "$SESSION" scroll down
agent-browser --session "$SESSION" press Enter
agent-browser --session "$SESSION" wait @e1
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot "/tmp/$SESSION.png"
agent-browser --session "$SESSION" close
```

Use element references from the current snapshot. Take another snapshot after navigation or page changes.
Match elements by their meaning when comparing sessions. Reference numbers can differ between sessions.
Read errors before deciding whether to retry, skip, or report a failure.
For an invalid element reference, take another snapshot before retrying.

For a comparison, create two distinct sessions:

```bash
LEGACY="legacy-$(uuidgen)"
MIGRATED="migrated-$(uuidgen)"
agent-browser --session "$LEGACY" open <legacy-url>
agent-browser --session "$MIGRATED" open <migrated-url>
agent-browser --session "$LEGACY" snapshot -i
agent-browser --session "$MIGRATED" snapshot -i
agent-browser --session "$LEGACY" screenshot "/tmp/$LEGACY.png"
agent-browser --session "$MIGRATED" screenshot "/tmp/$MIGRATED.png"
```

Use video for requested animation or flicker checks:

```bash
agent-browser --session "$LEGACY" record start "/tmp/$LEGACY.webm"
agent-browser --session "$MIGRATED" record start "/tmp/$MIGRATED.webm"
```

After the actions, stop recording and close both sessions:

```bash
agent-browser --session "$LEGACY" record stop
agent-browser --session "$MIGRATED" record stop
agent-browser --session "$LEGACY" close
agent-browser --session "$MIGRATED" close
```

Close sessions after failures as well. Preserve evidence paths in the report.
