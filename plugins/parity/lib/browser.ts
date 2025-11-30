import { chromium, Browser, Page, BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface Session {
  legacyContext: BrowserContext;
  migratedContext: BrowserContext;
  legacyPage: Page;
  migratedPage: Page;
  legacyBase: string;
  migratedBase: string;
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
  legacyScreenshot: string;
  migratedScreenshot: string;
  legacyDom: string;
  migratedDom: string;
  legacyConsole: string[];
  migratedConsole: string[];
}

interface ActionResult {
  legacySuccess: boolean;
  migratedSuccess: boolean;
  legacyError?: string;
  migratedError?: string;
}

const sessions = new Map<string, Session>();
const consoleMessages = new Map<string, { legacy: string[]; migrated: string[] }>();
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: false });
  }
  return browser;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function start(legacyUrl: string, migratedUrl: string): Promise<string> {
  const b = await getBrowser();
  const sessionId = generateSessionId();

  const legacyContext = await b.newContext();
  const migratedContext = await b.newContext();

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
    legacyContext,
    migratedContext,
    legacyPage,
    migratedPage,
    legacyBase: new URL(legacyUrl).origin,
    migratedBase: new URL(migratedUrl).origin,
  });

  console.log(JSON.stringify({ sessionId, status: "started" }));
  return sessionId;
}

async function capture(sessionId: string): Promise<CaptureResult> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  const tmpDir = `/tmp/parity-${sessionId}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const legacyScreenshot = path.join(tmpDir, "legacy.png");
  const migratedScreenshot = path.join(tmpDir, "migrated.png");
  const legacyDomPath = path.join(tmpDir, "legacy-dom.html");
  const migratedDomPath = path.join(tmpDir, "migrated-dom.html");

  const [legacyHtml, migratedHtml] = await Promise.all([
    session.legacyPage.screenshot({ path: legacyScreenshot, fullPage: false }),
    session.migratedPage.screenshot({ path: migratedScreenshot, fullPage: false }),
    session.legacyPage.content(),
    session.migratedPage.content(),
  ]).then(async ([, , legacyContent, migratedContent]) => {
    return [legacyContent, migratedContent];
  });

  const [legacyContent, migratedContent] = await Promise.all([
    session.legacyPage.content(),
    session.migratedPage.content(),
  ]);

  fs.writeFileSync(legacyDomPath, legacyContent);
  fs.writeFileSync(migratedDomPath, migratedContent);

  const msgs = consoleMessages.get(sessionId) || { legacy: [], migrated: [] };

  const result: CaptureResult = {
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

  const result: ActionResult = { legacySuccess: true, migratedSuccess: true };

  const performAction = async (page: Page, baseUrl: string, target: "legacy" | "migrated") => {
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
    } catch (err) {
      if (target === "legacy") {
        result.legacySuccess = false;
        result.legacyError = String(err);
      } else {
        result.migratedSuccess = false;
        result.migratedError = String(err);
      }
    }
  };

  await Promise.all([
    performAction(session.legacyPage, session.legacyBase, "legacy"),
    performAction(session.migratedPage, session.migratedBase, "migrated"),
  ]);

  await Promise.all([
    session.legacyPage.waitForLoadState("networkidle").catch(() => {}),
    session.migratedPage.waitForLoadState("networkidle").catch(() => {}),
  ]);

  console.log(JSON.stringify(result));
  return result;
}

async function stop(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  await session.legacyContext.close();
  await session.migratedContext.close();
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
      console.error("Commands: start, capture, action, stop");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ error: String(err) }));
  process.exit(1);
});
