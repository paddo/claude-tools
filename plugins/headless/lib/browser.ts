import { chromium, Browser, BrowserContext, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface VideoSession {
  legacyContext: BrowserContext;
  migratedContext?: BrowserContext;
  legacyPage: Page;
  migratedPage?: Page;
  videoDir: string;
  legacyCdp: number;
  migratedCdp?: number;
}

let browser: Browser | null = null;
let session: VideoSession | null = null;

async function startVideo(legacyUrl: string, migratedUrl?: string): Promise<void> {
  const videoDir = `/tmp/headless-video-${Date.now()}`;
  fs.mkdirSync(videoDir, { recursive: true });

  const viewport = { width: 1280, height: 720 };
  const legacyCdp = 9222;
  const migratedCdp = 9223;

  browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${legacyCdp}`],
  });

  const legacyContext = await browser.newContext({
    viewport,
    recordVideo: { dir: videoDir, size: viewport },
  });
  const legacyPage = await legacyContext.newPage();
  await legacyPage.goto(legacyUrl);

  if (migratedUrl) {
    const migratedBrowser = await chromium.launch({
      headless: true,
      args: [`--remote-debugging-port=${migratedCdp}`],
    });
    const migratedContext = await migratedBrowser.newContext({
      viewport,
      recordVideo: { dir: videoDir, size: viewport },
    });
    const migratedPage = await migratedContext.newPage();
    await migratedPage.goto(migratedUrl);

    session = {
      legacyContext,
      migratedContext,
      legacyPage,
      migratedPage,
      videoDir,
      legacyCdp,
      migratedCdp,
    };
  } else {
    session = {
      legacyContext,
      legacyPage,
      videoDir,
      legacyCdp,
    };
  }

  console.log(JSON.stringify({
    status: "recording",
    videoDir,
    legacyCdp,
    migratedCdp: migratedUrl ? migratedCdp : undefined,
  }));
}

async function stopVideo(): Promise<void> {
  if (!session) {
    console.log(JSON.stringify({ error: "No active video session" }));
    return;
  }

  const legacyVideoHandle = session.legacyPage.video();
  const migratedVideoHandle = session.migratedPage?.video();

  await session.legacyContext.close();
  if (session.migratedContext) {
    await session.migratedContext.close();
  }

  let legacyVideo: string | undefined;
  let migratedVideo: string | undefined;

  if (legacyVideoHandle) {
    const tmpPath = await legacyVideoHandle.path();
    legacyVideo = path.join(session.videoDir, session.migratedContext ? "legacy.webm" : "video.webm");
    fs.renameSync(tmpPath, legacyVideo);
  }
  if (migratedVideoHandle) {
    const tmpPath = await migratedVideoHandle.path();
    migratedVideo = path.join(session.videoDir, "migrated.webm");
    fs.renameSync(tmpPath, migratedVideo);
  }

  if (browser) {
    await browser.close();
    browser = null;
  }
  session = null;

  console.log(JSON.stringify({
    status: "stopped",
    legacyVideo,
    migratedVideo,
  }));
}

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "start-video":
      await startVideo(args[0], args[1]);
      break;
    case "stop-video":
      await stopVideo();
      break;
    default:
      console.log("Commands: start-video <url> [migrated-url], stop-video");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ error: String(err) }));
  process.exit(1);
});
