import { chromium, Browser, Page, BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as readline from "readline";
import { spawn } from "child_process";

interface Session {
  mode: "parity" | "single";
  legacyContext: BrowserContext;
  migratedContext?: BrowserContext;
  legacyPage: Page;
  migratedPage?: Page;
  legacyBase: string;
  migratedBase?: string;
  videoDir?: string;
}

interface ActionPayload {
  type: "click" | "fill" | "navigate" | "scroll" | "wait" | "hover" | "select";
  selector?: string;
  value?: string;
  url?: string;
  direction?: "up" | "down";
  ms?: number;
}

interface CaptureResult {
  screenshot: string;
  dom: string;
  console: string[];
  legacyScreenshot?: string;
  migratedScreenshot?: string;
  legacyDom?: string;
  migratedDom?: string;
  legacyConsole?: string[];
  migratedConsole?: string[];
}

interface ActionResult {
  success: boolean;
  error?: string;
  legacySuccess?: boolean;
  migratedSuccess?: boolean;
  legacyError?: string;
  migratedError?: string;
}

const sessions = new Map<string, Session>();
const consoleMessages = new Map<string, { legacy: string[]; migrated: string[] }>();
let browser: Browser | null = null;

const SOCKET_PATH = "/tmp/headless-browser.sock";

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function startSingle(url: string, recordVideo = false): Promise<string> {
  const b = await getBrowser();
  const sessionId = generateSessionId();

  const viewport = { width: 1280, height: 720 };
  const videoDir = recordVideo ? `/tmp/headless-video-${sessionId}` : undefined;

  if (videoDir) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const contextOptions = videoDir
    ? { viewport, recordVideo: { dir: videoDir, size: viewport } }
    : { viewport };

  const context = await b.newContext(contextOptions);
  const page = await context.newPage();

  consoleMessages.set(sessionId, { legacy: [], migrated: [] });

  page.on("console", (msg) => {
    consoleMessages.get(sessionId)?.legacy.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.goto(url);

  sessions.set(sessionId, {
    mode: "single",
    legacyContext: context,
    legacyPage: page,
    legacyBase: new URL(url).origin,
    videoDir,
  });

  return sessionId;
}

async function start(legacyUrl: string, migratedUrl: string, recordVideo = false): Promise<string> {
  const b = await getBrowser();
  const sessionId = generateSessionId();

  const viewport = { width: 1280, height: 720 };
  const videoDir = recordVideo ? `/tmp/headless-video-${sessionId}` : undefined;

  if (videoDir) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const contextOptions = videoDir
    ? { viewport, recordVideo: { dir: videoDir, size: viewport } }
    : { viewport };

  const legacyContext = await b.newContext(contextOptions);
  const migratedContext = await b.newContext(contextOptions);

  const legacyPage = await legacyContext.newPage();
  const migratedPage = await migratedContext.newPage();

  consoleMessages.set(sessionId, { legacy: [], migrated: [] });

  legacyPage.on("console", (msg) => {
    consoleMessages.get(sessionId)?.legacy.push(`[${msg.type()}] ${msg.text()}`);
  });

  migratedPage.on("console", (msg) => {
    consoleMessages.get(sessionId)?.migrated.push(`[${msg.type()}] ${msg.text()}`);
  });

  await Promise.all([legacyPage.goto(legacyUrl), migratedPage.goto(migratedUrl)]);

  sessions.set(sessionId, {
    mode: "parity",
    legacyContext,
    migratedContext,
    legacyPage,
    migratedPage,
    legacyBase: new URL(legacyUrl).origin,
    migratedBase: new URL(migratedUrl).origin,
    videoDir,
  });

  return sessionId;
}

async function capture(sessionId: string): Promise<CaptureResult> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const tmpDir = `/tmp/headless-${sessionId}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const msgs = consoleMessages.get(sessionId) || { legacy: [], migrated: [] };

  if (session.mode === "single") {
    const screenshotPath = path.join(tmpDir, "screenshot.jpg");
    const domPath = path.join(tmpDir, "dom.html");

    await session.legacyPage.screenshot({ path: screenshotPath, fullPage: false, type: "jpeg", quality: 50, scale: "css" });
    const content = await session.legacyPage.content();
    fs.writeFileSync(domPath, content);

    const result: CaptureResult = {
      screenshot: screenshotPath,
      dom: domPath,
      console: [...msgs.legacy],
    };

    msgs.legacy = [];
    return result;
  }

  const legacyScreenshot = path.join(tmpDir, "legacy.jpg");
  const migratedScreenshot = path.join(tmpDir, "migrated.jpg");
  const legacyDomPath = path.join(tmpDir, "legacy-dom.html");
  const migratedDomPath = path.join(tmpDir, "migrated-dom.html");

  const [, , legacyContent, migratedContent] = await Promise.all([
    session.legacyPage.screenshot({ path: legacyScreenshot, fullPage: false, type: "jpeg", quality: 50, scale: "css" }),
    session.migratedPage!.screenshot({ path: migratedScreenshot, fullPage: false, type: "jpeg", quality: 50, scale: "css" }),
    session.legacyPage.content(),
    session.migratedPage!.content(),
  ]);

  fs.writeFileSync(legacyDomPath, legacyContent);
  fs.writeFileSync(migratedDomPath, migratedContent);

  const result: CaptureResult = {
    screenshot: legacyScreenshot,
    dom: legacyDomPath,
    console: [...msgs.legacy],
    legacyScreenshot,
    migratedScreenshot,
    legacyDom: legacyDomPath,
    migratedDom: migratedDomPath,
    legacyConsole: [...msgs.legacy],
    migratedConsole: [...msgs.migrated],
  };

  msgs.legacy = [];
  msgs.migrated = [];

  return result;
}

async function executeAction(sessionId: string, action: ActionPayload): Promise<ActionResult> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const performAction = async (page: Page, baseUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      switch (action.type) {
        case "click":
          if (!action.selector) throw new Error("selector required for click");
          await page.click(action.selector, { timeout: 5000 });
          break;

        case "fill":
          if (!action.selector || action.value === undefined)
            throw new Error("selector and value required for fill");
          await page.fill(action.selector, action.value);
          break;

        case "navigate":
          if (!action.url) throw new Error("url required for navigate");
          const fullUrl = action.url.startsWith("http") ? action.url : `${baseUrl}${action.url}`;
          await page.goto(fullUrl);
          break;

        case "scroll":
          const delta = action.direction === "up" ? -500 : 500;
          await page.mouse.wheel(0, delta);
          break;

        case "wait":
          await page.waitForTimeout(action.ms || 1000);
          break;

        case "hover":
          if (!action.selector) throw new Error("selector required for hover");
          await page.hover(action.selector);
          break;

        case "select":
          if (!action.selector || action.value === undefined)
            throw new Error("selector and value required for select");
          await page.selectOption(action.selector, action.value);
          break;
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  if (session.mode === "single") {
    const actionResult = await performAction(session.legacyPage, session.legacyBase);
    await session.legacyPage.waitForLoadState("networkidle").catch(() => {});

    return {
      success: actionResult.success,
      error: actionResult.error,
    };
  }

  const [legacyResult, migratedResult] = await Promise.all([
    performAction(session.legacyPage, session.legacyBase),
    performAction(session.migratedPage!, session.migratedBase!),
  ]);

  await Promise.all([
    session.legacyPage.waitForLoadState("networkidle").catch(() => {}),
    session.migratedPage!.waitForLoadState("networkidle").catch(() => {}),
  ]);

  return {
    success: legacyResult.success && migratedResult.success,
    legacySuccess: legacyResult.success,
    migratedSuccess: migratedResult.success,
    legacyError: legacyResult.error,
    migratedError: migratedResult.error,
  };
}

async function stop(sessionId: string): Promise<{ video?: string; legacyVideo?: string; migratedVideo?: string }> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const legacyVideoHandle = session.legacyPage.video();
  const migratedVideoHandle = session.migratedPage?.video();

  await session.legacyContext.close();
  if (session.migratedContext) {
    await session.migratedContext.close();
  }

  let legacyVideoPath: string | undefined;
  let migratedVideoPath: string | undefined;

  if (session.videoDir) {
    if (legacyVideoHandle) {
      const tmpPath = await legacyVideoHandle.path();
      legacyVideoPath = path.join(session.videoDir, session.mode === "single" ? "video.webm" : "legacy.webm");
      fs.renameSync(tmpPath, legacyVideoPath);
    }
    if (migratedVideoHandle) {
      const tmpPath = await migratedVideoHandle.path();
      migratedVideoPath = path.join(session.videoDir, "migrated.webm");
      fs.renameSync(tmpPath, migratedVideoPath);
    }
  }

  sessions.delete(sessionId);
  consoleMessages.delete(sessionId);

  if (sessions.size === 0 && browser) {
    await browser.close();
    browser = null;
  }

  return {
    ...(legacyVideoPath && { video: legacyVideoPath }),
    ...(migratedVideoPath && { legacyVideo: legacyVideoPath, migratedVideo: migratedVideoPath }),
  };
}

async function cleanup() {
  for (const [, session] of sessions) {
    await session.legacyContext.close().catch(() => {});
    if (session.migratedContext) {
      await session.migratedContext.close().catch(() => {});
    }
  }
  sessions.clear();
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

// Server mode - persistent process that handles all commands via Unix socket
async function startServer() {
  // Clean up stale socket
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }

  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { command, args } = JSON.parse(body);
        let result: unknown;

        switch (command) {
          case "start":
            result = { sessionId: await start(args.legacyUrl, args.migratedUrl, args.video), status: "started", mode: "parity" };
            break;
          case "start-single":
            result = { sessionId: await startSingle(args.url, args.video), status: "started", mode: "single" };
            break;
          case "capture":
            result = await capture(args.sessionId);
            break;
          case "action":
            result = await executeAction(args.sessionId, args.action);
            break;
          case "stop":
            const stopResult = await stop(args.sessionId);
            result = { sessionId: args.sessionId, status: "stopped", ...stopResult };
            break;
          case "status":
            result = { sessions: Array.from(sessions.keys()), browserActive: !!browser };
            break;
          case "shutdown":
            await cleanup();
            result = { status: "shutdown" };
            setTimeout(() => process.exit(0), 100);
            break;
          default:
            throw new Error(`Unknown command: ${command}`);
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
  });

  server.listen(SOCKET_PATH, () => {
    console.log(JSON.stringify({ status: "server-started", socket: SOCKET_PATH }));
  });

  process.on("SIGINT", async () => { await cleanup(); process.exit(0); });
  process.on("SIGTERM", async () => { await cleanup(); process.exit(0); });
}

// Client mode - send command to running server
async function sendCommand(command: string, args: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { socketPath: SOCKET_PATH, path: "/", method: "POST", headers: { "Content-Type": "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(data);
          resolve();
        });
      }
    );
    req.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ECONNREFUSED" || (err as NodeJS.ErrnoException).code === "ENOENT") {
        console.error(JSON.stringify({ error: "Server not running. Start with: browser.ts server" }));
      } else {
        console.error(JSON.stringify({ error: String(err) }));
      }
      reject(err);
    });
    req.write(JSON.stringify({ command, args }));
    req.end();
  });
}

// Auto-start server as detached background process
async function autoStartServer(): Promise<void> {
  // Get the directory where browser.ts lives
  const libDir = path.dirname(new URL(import.meta.url).pathname);
  const browserScript = path.join(libDir, "browser.ts");

  // Use npx tsx to run the server
  const child = spawn("npx", ["--prefix", libDir, "tsx", browserScript, "server"], {
    detached: true,
    stdio: "ignore",
    cwd: libDir,
  });
  child.unref();

  // Wait for socket to appear (up to 5 seconds)
  for (let i = 0; i < 50; i++) {
    if (fs.existsSync(SOCKET_PATH)) {
      return;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error("Server failed to start within 5 seconds");
}

// Legacy CLI mode - for backwards compatibility, runs single command then exits
// This starts an ephemeral session that doesn't require server
async function legacyMode(command: string, args: string[]) {
  try {
    switch (command) {
      case "start":
        if (args.length < 2) {
          console.error("Usage: browser.ts start <legacy-url> <migrated-url> [--video]");
          process.exit(1);
        }
        const recordVideo = args.includes("--video");
        const urls = args.filter(a => !a.startsWith("--"));
        const sessionId = await start(urls[0], urls[1], recordVideo);
        console.log(JSON.stringify({ sessionId, status: "started", mode: "parity", videoEnabled: recordVideo }));

        // Wait for commands via stdin
        await waitForStdinCommands();
        break;

      case "start-single":
        if (args.length < 1) {
          console.error("Usage: browser.ts start-single <url> [--video]");
          process.exit(1);
        }
        const recordSingleVideo = args.includes("--video");
        const singleUrls = args.filter(a => !a.startsWith("--"));
        const singleSessionId = await startSingle(singleUrls[0], recordSingleVideo);
        console.log(JSON.stringify({ sessionId: singleSessionId, status: "started", mode: "single", videoEnabled: recordSingleVideo }));

        // Wait for commands via stdin
        await waitForStdinCommands();
        break;

      default:
        console.error("Commands: server, start, start-single, capture, action, stop, status, shutdown");
        console.error("  server       - Start persistent server (recommended)");
        console.error("  start-single - Start interactive session (legacy mode)");
        process.exit(1);
    }
  } finally {
    await cleanup();
  }
}

// Wait for commands on stdin (legacy mode)
async function waitForStdinCommands() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

  for await (const line of rl) {
    try {
      const { command, ...args } = JSON.parse(line);
      let result: unknown;

      switch (command) {
        case "capture":
          result = await capture(args.sessionId);
          break;
        case "action":
          result = await executeAction(args.sessionId, args.action);
          break;
        case "stop":
          const stopResult = await stop(args.sessionId);
          result = { sessionId: args.sessionId, status: "stopped", ...stopResult };
          console.log(JSON.stringify(result));
          return; // Exit after stop
        default:
          result = { error: `Unknown command: ${command}` };
      }

      console.log(JSON.stringify(result));
    } catch (err) {
      console.log(JSON.stringify({ error: String(err) }));
    }
  }
}

async function main() {
  const [, , command, ...args] = process.argv;

  // Server mode
  if (command === "server") {
    await startServer();
    return;
  }

  // Client commands that talk to server
  const serverCommands = ["capture", "action", "stop", "status", "shutdown"];
  if (serverCommands.includes(command)) {
    switch (command) {
      case "capture":
        await sendCommand("capture", { sessionId: args[0] });
        break;
      case "action":
        await sendCommand("action", { sessionId: args[0], action: JSON.parse(args[1]) });
        break;
      case "stop":
        await sendCommand("stop", { sessionId: args[0] });
        break;
      case "status":
        await sendCommand("status", {});
        break;
      case "shutdown":
        await sendCommand("shutdown", {});
        break;
    }
    return;
  }

  // Check if server is running for start commands
  if (command === "start" || command === "start-single") {
    // Auto-start server if not running
    if (!fs.existsSync(SOCKET_PATH)) {
      await autoStartServer();
    }

    if (command === "start") {
      const recordVideo = args.includes("--video");
      const urls = args.filter(a => !a.startsWith("--"));
      await sendCommand("start", { legacyUrl: urls[0], migratedUrl: urls[1], video: recordVideo });
    } else {
      const recordVideo = args.includes("--video");
      const urls = args.filter(a => !a.startsWith("--"));
      await sendCommand("start-single", { url: urls[0], video: recordVideo });
    }
    return;
  }

  console.error("Commands: server, start, start-single, capture, action, stop, status, shutdown");
  process.exit(1);
}

main().catch((err) => {
  console.error(JSON.stringify({ error: String(err) }));
  process.exit(1);
});
