import { chromium, Browser, Page, BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface Session {
  mode: "parity" | "single";
  legacyContext: BrowserContext;
  migratedContext?: BrowserContext;
  legacyPage: Page;
  migratedPage?: Page;
  legacyBase: string;
  migratedBase?: string;
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
  // Parity mode only
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
  // Parity mode only
  legacySuccess?: boolean;
  migratedSuccess?: boolean;
  legacyError?: string;
  migratedError?: string;
}

const sessions = new Map<string, Session>();
const consoleMessages = new Map<string, { legacy: string[]; migrated: string[] }>();
let browser: Browser | null = null;

// Single-site mode
async function startSingle(url: string): Promise<string> {
  const b = await getBrowser();
  const sessionId = generateSessionId();

  const viewport = { width: 1280, height: 720 };
  const context = await b.newContext({ viewport });
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
  });

  console.log(JSON.stringify({ sessionId, status: "started", mode: "single" }));
  return sessionId;
}

// Cleanup on exit
async function cleanup() {
  for (const [id, session] of sessions) {
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

process.on("SIGINT", async () => { await cleanup(); process.exit(0); });
process.on("SIGTERM", async () => { await cleanup(); process.exit(0); });
process.on("exit", () => { cleanup(); });

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function start(legacyUrl: string, migratedUrl: string): Promise<string> {
  const b = await getBrowser();
  const sessionId = generateSessionId();

  const viewport = { width: 1280, height: 720 };
  const legacyContext = await b.newContext({ viewport });
  const migratedContext = await b.newContext({ viewport });

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
  });

  console.log(JSON.stringify({ sessionId, status: "started", mode: "parity" }));
  return sessionId;
}

async function capture(sessionId: string): Promise<CaptureResult> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const tmpDir = `/tmp/headless-${sessionId}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const msgs = consoleMessages.get(sessionId) || { legacy: [], migrated: [] };

  // Single-site mode
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
    console.log(JSON.stringify(result));
    return result;
  }

  // Parity mode
  const legacyScreenshot = path.join(tmpDir, "legacy.jpg");
  const migratedScreenshot = path.join(tmpDir, "migrated.jpg");
  const legacyDomPath = path.join(tmpDir, "legacy-dom.html");
  const migratedDomPath = path.join(tmpDir, "migrated-dom.html");

  await Promise.all([
    session.legacyPage.screenshot({ path: legacyScreenshot, fullPage: false, type: "jpeg", quality: 50, scale: "css" }),
    session.migratedPage!.screenshot({ path: migratedScreenshot, fullPage: false, type: "jpeg", quality: 50, scale: "css" }),
  ]);

  const [legacyContent, migratedContent] = await Promise.all([
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

  console.log(JSON.stringify(result));
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

  // Single-site mode
  if (session.mode === "single") {
    const actionResult = await performAction(session.legacyPage, session.legacyBase);
    await session.legacyPage.waitForLoadState("networkidle").catch(() => {});

    const result: ActionResult = {
      success: actionResult.success,
      error: actionResult.error,
    };
    console.log(JSON.stringify(result));
    return result;
  }

  // Parity mode
  const [legacyResult, migratedResult] = await Promise.all([
    performAction(session.legacyPage, session.legacyBase),
    performAction(session.migratedPage!, session.migratedBase!),
  ]);

  await Promise.all([
    session.legacyPage.waitForLoadState("networkidle").catch(() => {}),
    session.migratedPage!.waitForLoadState("networkidle").catch(() => {}),
  ]);

  const result: ActionResult = {
    success: legacyResult.success && migratedResult.success,
    legacySuccess: legacyResult.success,
    migratedSuccess: migratedResult.success,
    legacyError: legacyResult.error,
    migratedError: migratedResult.error,
  };

  console.log(JSON.stringify(result));
  return result;
}

async function stop(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  await session.legacyContext.close();
  if (session.migratedContext) {
    await session.migratedContext.close();
  }
  sessions.delete(sessionId);
  consoleMessages.delete(sessionId);

  if (sessions.size === 0 && browser) {
    await browser.close();
    browser = null;
  }

  console.log(JSON.stringify({ sessionId, status: "stopped" }));
}

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "start":
      if (args.length < 2) {
        console.error("Usage: browser.ts start <legacy-url> <migrated-url>");
        process.exit(1);
      }
      await start(args[0], args[1]);
      break;

    case "start-single":
      if (args.length < 1) {
        console.error("Usage: browser.ts start-single <url>");
        process.exit(1);
      }
      await startSingle(args[0]);
      break;

    case "capture":
      if (args.length < 1) {
        console.error("Usage: browser.ts capture <session-id>");
        process.exit(1);
      }
      await capture(args[0]);
      break;

    case "action":
      if (args.length < 2) {
        console.error("Usage: browser.ts action <session-id> <action-json>");
        process.exit(1);
      }
      await executeAction(args[0], JSON.parse(args[1]));
      break;

    case "stop":
      if (args.length < 1) {
        console.error("Usage: browser.ts stop <session-id>");
        process.exit(1);
      }
      await stop(args[0]);
      break;

    default:
      console.error("Commands: start, start-single, capture, action, stop");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ error: String(err) }));
  process.exit(1);
});
