---
allowed-tools:
  - Task
description: Guide Hermes Agent X/Twitter research and approval-gated action planning
---

Delegate this to the **hermes-tweet** agent to handle independently.

The hermes-tweet agent will:
- Orient to the Hermes Tweet source repository
- Distinguish read-only research from action-capable requests
- Use `tweet_explore`, `tweet_read`, and `tweet_action` only under their intended gates
- Keep credentials out of chat and keep write actions explicit

USER REQUEST: $*
