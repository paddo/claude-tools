#!/usr/bin/env bun
import * as fs from "fs";
import * as path from "path";
import { execFileSync, spawn } from "child_process";

const usage =
  "Usage: nano-banana.ts <prompt> [--aspect 16:9] [--size 1K] [--model gemini-nano-banana-2.1|gemini-3-pro-image] [--thinking minimal|medium|high] [--ref image]... [--backend gemini|fal]";

const FAL_ENDPOINTS: Record<string, string> = {
  "gemini-nano-banana-2.1": "google/nano-banana-2.1",
  "gemini-3-pro-image": "fal-ai/nano-banana-pro",
};

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

// The environment overrides the keychain.
function credential(name: string): string {
  if (process.env[name]) return process.env[name]!;
  try {
    return execFileSync("security", ["find-generic-password", "-s", "paddo-tools", "-a", name, "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

let prompt = "";
let aspect = "16:9";
let size = "1K";
let model = "gemini-nano-banana-2.1";
let thinking = "";
let backend = "gemini";
const refs: string[] = [];

function fail(message: string): never {
  console.error(`${message}\n${usage}`);
  process.exit(1);
}

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const flag = args[i];
  if (!flag.startsWith("--")) {
    prompt = flag;
    continue;
  }
  const value = args[++i];
  if (value === undefined || value.startsWith("--")) fail(`Missing value for ${flag}`);
  if (flag === "--aspect") aspect = value;
  else if (flag === "--size") size = value;
  else if (flag === "--model") model = value;
  else if (flag === "--thinking") thinking = value;
  else if (flag === "--ref") refs.push(value);
  else if (flag === "--backend") backend = value;
  else fail(`Unknown option ${flag}`);
}

if (!prompt) fail("No prompt provided");
if (backend !== "gemini" && backend !== "fal") fail(`Unknown backend ${backend}`);

const keyName = backend === "fal" ? "FAL_KEY" : "GEMINI_API_KEY";
const key = credential(keyName);
if (!key) {
  console.error(`${keyName} not set in the environment or keychain`);
  process.exit(1);
}

const references = refs.map((file) => {
  const mimeType = MIME_TYPES[path.extname(file).toLowerCase()];
  if (!mimeType) {
    console.error(`Unsupported reference image type: ${file}`);
    process.exit(1);
  }
  return { mimeType, data: fs.readFileSync(file).toString("base64") };
});

async function generateGemini(): Promise<{ bytes: Buffer; extension: string }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, ...references.map((inlineData) => ({ inlineData }))] }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: { aspectRatio: aspect, imageSize: size },
        ...(thinking !== "" && { thinkingConfig: { thinkingLevel: thinking } }),
      },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p: any) => p.inlineData);
  if (!image) {
    const reason = data?.promptFeedback?.blockReason ?? data?.candidates?.[0]?.finishReason ?? "";
    throw new Error(`No image generated. ${reason} ${parts.find((p: any) => p.text)?.text ?? ""}`);
  }
  return {
    bytes: Buffer.from(image.inlineData.data, "base64"),
    extension: image.inlineData.mimeType === "image/jpeg" ? "jpg" : "png",
  };
}

async function generateFal(): Promise<{ bytes: Buffer; extension: string }> {
  const endpoint = FAL_ENDPOINTS[model];
  if (!endpoint) throw new Error(`No fal endpoint for model ${model}`);

  // fal serves reference-image requests from a separate edit endpoint.
  const res = await fetch(`https://fal.run/${endpoint}${references.length ? "/edit" : ""}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspect,
      resolution: size,
      output_format: "png",
      ...(references.length > 0 && { image_urls: references.map((r) => `data:${r.mimeType};base64,${r.data}`) }),
      ...(thinking !== "" && { thinking_level: thinking }),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail ?? data));

  const url = data?.images?.[0]?.url;
  if (!url) throw new Error(`No image generated. ${data.description ?? ""}`);
  const image = await fetch(url);
  if (!image.ok) throw new Error(`Image download failed: ${image.status} ${url}`);
  return { bytes: Buffer.from(await image.arrayBuffer()), extension: "png" };
}

async function run() {
  const { bytes, extension } = backend === "fal" ? await generateFal() : await generateGemini();
  const outPath = `/tmp/mockup-${Date.now()}.${extension}`;
  fs.writeFileSync(outPath, bytes);
  console.log(outPath);
  spawn("open", [outPath], { detached: true, stdio: "ignore" }).unref();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
