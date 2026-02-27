#!/usr/bin/env npx tsx
import * as fs from "fs";
import { spawn } from "child_process";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY not set");
  process.exit(1);
}

// Parse args: prompt [--aspect 16:9] [--size 1K]
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: nano-banana.ts <prompt> [--aspect 16:9] [--size 1K]");
  process.exit(1);
}

let prompt = "";
let aspect = "16:9";
let size = "1K";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--aspect" && args[i + 1]) {
    aspect = args[++i];
  } else if (args[i] === "--size" && args[i + 1]) {
    size = args[++i];
  } else if (!args[i].startsWith("--")) {
    prompt = args[i];
  }
}

if (!prompt) {
  console.error("No prompt provided");
  process.exit(1);
}

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseModalities: ["IMAGE", "TEXT"],
    imageConfig: { aspectRatio: aspect, imageSize: size },
  },
};

const url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

async function run() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) {
    console.error("API error:", data.error.message || JSON.stringify(data.error));
    process.exit(1);
  }

  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts) {
    console.error("No parts in response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const imagePart = parts.find((p: any) => p.inlineData);
  if (!imagePart) {
    const textPart = parts.find((p: any) => p.text);
    console.error("No image generated.", textPart?.text || "");
    process.exit(1);
  }

  const b64 = imagePart.inlineData.data;
  const outPath = `/tmp/nb-${Date.now()}.png`;
  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));

  console.log(outPath);

  // Open the image
  spawn("open", [outPath], { detached: true, stdio: "ignore" }).unref();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
