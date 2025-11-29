---
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
description: Generate UI/UX designs using Gemini 3 Pro Image (Nano Banana Pro)
---

Generate UI mockups using Gemini 3 Pro Image.

## Usage

```bash
P="prompt" A="16:9" R="2K" O="/tmp/nb-$(date +%s)"
RESP=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
  -d "$(jq -n --arg p "$P" --arg a "$A" --arg r "$R" '{contents:[{parts:[{text:$p}]}],generationConfig:{responseModalities:["TEXT","IMAGE"],imageConfig:{aspectRatio:$a,imageSize:$r}}}')")
IMG=$(echo "$RESP"|jq -r '.candidates[0].content.parts[]|select(.inlineData)|.inlineData')
[[ $(echo "$IMG"|jq -r '.data') == "null" ]] && { echo "$RESP"|jq -r '.error.message//.candidates[0].content.parts[].text' >&2; exit 1; }
EXT=$(echo "$IMG"|jq -r 'if .mimeType=="image/png" then "png" elif .mimeType=="image/webp" then "webp" else "jpg" end')
echo "$IMG"|jq -r '.data'|base64 -d > "$O.$EXT" && echo "$O.$EXT"
```

- A (aspect): 1:1, 16:9, 9:16, 3:4, 21:9
- R (resolution): 1K, 2K, 4K

## Steps

1. If user mentions screenshot/clipboard: `pngpaste /tmp/nb-input.png`
2. Optionally gather style context from project
3. Set P, A, R, O vars and run the curl command above
4. `open` the result, then Read to inspect

USER REQUEST: $*
