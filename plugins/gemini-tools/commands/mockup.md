---
allowed-tools:
  - Task
  - Bash
description: Generate UI/UX designs using Gemini 3.1 Flash Image (Nano Banana 2)
---

Delegate this to the **nano-banana** agent to handle independently.

The nano-banana agent will:
- Generate UI mockups using Gemini 3.1 Flash Image API
- Support various aspect ratios (1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9)
- Support resolutions (512px, 1K, 2K, 4K)
- Open the generated image for review

If the user mentions a screenshot or reference image, note that the agent should capture it with `pngpaste`.

USER REQUEST: $*
