---
allowed-tools:
  - Bash(nano-banana:*)
  - Bash(pngpaste:*)
  - Bash(rm /tmp/nano-banana-*:*)
  - Bash(open:*)
  - Read(/Users/paddo/Projects/**)
  - Glob
  - Grep
description: Generate UI/UX designs using Gemini 3 Pro Image (Nano Banana Pro)
---

Generate UI/UX mockups and designs using Gemini 3 Pro Image (Nano Banana Pro). Gathers context including style guides, existing designs, and screenshots, then generates an image that can be opened and inspected.

## Steps:

1. **Capture visual input (if mentioned):**
   - If user mentions screenshot, clipboard, or current page:
     ```bash
     TIMESTAMP=$(date +%s) && pngpaste /tmp/nano-banana-input-${TIMESTAMP}.png
     ```
   - Note the file path for use as reference image
   - If pngpaste fails, proceed without

2. **Gather project context:**
   - Identify current project from working directory
   - Search for style guides, design tokens, or brand assets:
     ```bash
     # Find style-related files
     find . -name "*style*" -o -name "*design*" -o -name "*brand*" -o -name "*theme*" 2>/dev/null | head -20
     ```
   - Look for:
     - `styles/`, `design-tokens/`, `theme/` directories
     - Color palettes in CSS/config files
     - Existing UI screenshots or mockups
     - Component libraries or design systems

3. **Build comprehensive design prompt:**

   Include in prompt:
   - **Design goal**: What the user wants to create/redesign
   - **Style context**: Colors, fonts, theme (e.g., cyberpunk, minimalist)
   - **Component requirements**: Specific UI elements needed
   - **Technical constraints**: Resolution, aspect ratio, platform (web/mobile)
   - **Reference notes**: What reference images show and how to use them

4. **Execute generation:**
   ```bash
   nano-banana \
     -p "UI/UX design prompt here

     DESIGN GOAL: [user's request]
     STYLE: [extracted from project - colors, fonts, theme]
     COMPONENTS: [required UI elements]
     CONSTRAINTS: [platform, resolution needs]

     REFERENCE IMAGES:
     @/path/to/style-guide.png - style guide
     @/path/to/reference.png - current design

     Generate a polished, production-ready UI mockup." \
     -a 16:9 \
     -r 2K \
     --open
   ```

   Note: Use @/path/to/file syntax to reference images inline in the prompt. The CLI will automatically parse these and attach them as reference images.

5. **Return results:**
   - Output the generated image path
   - Confirm the image has been opened for inspection
   - Summarize what was generated and key design decisions

## Examples:

**Simple request:**
```
/nano-banana hero section for blog post about AI coding
```

**With existing design:**
```
/nano-banana redesign the settings page to be more modern
```
(Will capture clipboard, find style guides, generate new design)

**Specific requirements:**
```
/nano-banana mobile app login screen, dark theme, 9:16 aspect ratio
```

## Tips:

- Always use `--open` to automatically view the result
- For web designs, use 16:9 or 21:9 aspect ratio
- For mobile, use 9:16 or 3:4
- Maximum 14 reference images supported
- 4K resolution available for high-fidelity work

## Cleanup:

After user has reviewed, clean up temp files:
```bash
rm /tmp/nano-banana-*
```

USER REQUEST: $*
