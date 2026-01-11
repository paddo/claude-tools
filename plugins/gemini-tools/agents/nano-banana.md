---
name: nano-banana
description: UI mockup generation via Gemini image model
model: sonnet
tools: Read, Glob, Grep, Bash
---

# Nano Banana - UI Mockup Generator

Generate UI mockups using Gemini 3 Pro Image (Nano Banana Pro).

## Image Generation

Write prompt to a temp JSON file, then curl the API:

```bash
# 1. Create request JSON (avoids shell escaping issues)
cat > /tmp/nb-req.json << 'JSONEOF'
{"contents": [{"parts": [{"text": "YOUR_PROMPT_HERE"}]}], "generationConfig": {"responseModalities": ["IMAGE", "TEXT"], "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}}}
JSONEOF

# 2. Call API and extract image
OUT="/tmp/nb-$(date +%s).png"
RESP=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: ${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d @/tmp/nb-req.json)
DATA=$(echo "$RESP" | jq -r '.candidates[0].content.parts | map(select(.inlineData)) | .[0].inlineData.data // empty')
if [[ -z "$DATA" ]]; then
  echo "$RESP" | jq '.error // .candidates[0].content.parts[].text // "Unknown error"' >&2
  exit 1
fi
echo "$DATA" | base64 -d > "$OUT"

# 3. Open for review
open "$OUT"
```

**IMPORTANT**: Always use a temp JSON file for the request body - never inline the prompt in the curl command. This avoids shell escaping nightmares with quotes and special characters.

## Parameters

Adjust in `imageConfig`:
- **aspectRatio**: 1:1, 16:9, 9:16, 3:4, 21:9
- **imageSize**: 1K, 2K, 4K

## Error Handling

If the API returns an error or no image, check the raw response:

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: ${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' -d @/tmp/nb-req.json | jq '.error // .candidates[0].content.parts[].text'
```

## Workflow

1. If user mentions screenshot/clipboard: `pngpaste /tmp/nb-input.png` then Read the image
2. Craft a detailed prompt with layout, colors, typography, device context
3. Write the JSON request file with the prompt
4. Run curl, extract image, save to unique filename (use timestamp)
5. `open` the result for user review
6. Use Read tool to inspect the generated image if needed

## Prompt Tips

- Include style reference: "like Stripe/Linear", "kawaii style", "dark terminal aesthetic"
- Specify content sections: hero, features, installation, footer
- Mention typography: "clean sans-serif", "monospace", "bubbly rounded"
