---
allowed-tools:
  - Task
description: Generate UI/UX designs using Gemini 3 Pro Image (Nano Banana Pro)
---

Delegate this to the **nano-banana** agent to handle independently.

The nano-banana agent will:
- Generate UI mockups using Gemini 3 Pro Image API
- Support various aspect ratios (1:1, 16:9, 9:16, 3:4, 21:9)
- Support resolutions (1K, 2K, 4K)
- Open the generated image for review

If the user mentions a screenshot or reference image, note that the agent should capture it with `pngpaste`.

USER REQUEST: $*
