---
allowed-tools:
  - Bash(gemini:*)
  - Bash(~/.claude/bin/gemini-clean:*)
  - Bash(rm /tmp/gemini-*:*)
  - Bash(pngpaste:*)
  - Read(/Users/paddo/Projects/**)
  - Glob
  - Grep
  - Edit
description: Launch Gemini 3 Pro for visual analysis, UI/UX work, research, or second opinions
---

Invoke Gemini 3 Pro for tasks where its strengths apply: visual/multimodal analysis, UI/UX generation, creative problem-solving, or getting a different perspective.

## When to use Gemini vs Codex:
- **Gemini**: Visual/UI work, screenshots, multimodal, creative generation
- **Codex**: Architecture decisions, systems thinking, strategic planning

## Steps:

1. **Check for visual input:**
   - If user mentions screenshot, image, clipboard, or visual issue:
     ```bash
     TIMESTAMP=$(date +%s) && pngpaste /tmp/gemini-${TIMESTAMP}.png
     ```
   - Note the file path for inclusion in the prompt
   - If pngpaste fails, proceed without image

2. **Gather context:**
   - What is the user working on?
   - Relevant files or code for context
   - Keep context light - let Gemini explore if needed

3. **Build and execute prompt:**
   ```bash
   ~/.claude/bin/gemini-clean \
     --model gemini-3-pro-preview \
     -p "$(cat ~/.claude/gemini-prompt.md)

   PROJECT: [project name]
   CONTEXT: [relevant context]

   [If image provided:]
   IMAGE: @/tmp/gemini-xxx.png

   USER_REQUEST: [user's request]" \
     --output-format json
   ```

4. **Determine action based on intent:**
   - **Apply directly** if: "fix", "change", "update", "apply", "modify", "make", "improve", "create"
   - **Return analysis** if: "review", "analyze", "check", "suggest", "compare", "what do you think", "research"
   - When in doubt, bias toward action

5. **Apply or return:**
   - If applying: Use Edit tool to apply changes, confirm what was done
   - If analyzing: Return Gemini's analysis

6. **Cleanup** - Delete temp files

USER REQUEST: $*
