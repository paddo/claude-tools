---
allowed-tools:
  - Bash(codex:*)
  - Bash(git:*)
  - Read
  - Glob
  - Grep
description: Launch Codex for software architecture analysis and research
---

Invoke Codex (OpenAI) to analyze software architecture, research design patterns, or provide senior-level technical insights.

**IMPORTANT:** Codex has read access to the project folder and can research on its own. Your job is to add light context about what the user is currently working on, not to pre-read everything for it.

## Steps:

1. **Add light context (don't over-research):**
   - What is the user currently working on? (check git status for recent changes)
   - Any specific constraints or use case details from the conversation?
   - Brief pointer to relevant areas (e.g., "check recent blog posts in src/content/blog/")
   - Let Codex do its own file reading and research

2. **Build the prompt:**
   - Read and include the system instruction from the plugin's `prompts/codex-prompt.md`
   - Add brief working context (current task, recent changes, constraints)
   - Point to relevant files/directories for Codex to explore
   - Include the user's question with minimal expansion

3. **Execute Codex:**
   ```bash
   codex exec \
     --sandbox read-only \
     "SYSTEM_INSTRUCTION:
   [contents of prompts/codex-prompt.md]

   PROJECT: [name and brief description]
   CURRENT_WORK: [what user is currently doing, from git status or conversation]
   RELEVANT_AREAS: [pointers to files/dirs for Codex to explore]

   USER_QUESTION: [user's question with light context added]"
   ```

4. **Return the output** - Shows Codex's analysis

USER REQUEST: $*
