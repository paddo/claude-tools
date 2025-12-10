import { remote, attach, Browser } from "webdriverio";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";

type Platform = "ios" | "android";
type AppType = "native" | "flutter";
type SessionMode = "single" | "parity-migration" | "parity-cross";

const appiumPort = 4723;
const SESSION_DIR = "/tmp/mobile-sessions";

interface Session {
  mode: SessionMode;
  primaryDriver: Browser;
  secondaryDriver?: Browser;
  primaryPlatform: Platform;
  secondaryPlatform?: Platform;
  primaryApp: string;
  secondaryApp?: string;
}

interface ActionPayload {
  type: "tap" | "fill" | "swipe" | "back" | "launch" | "wait" | "scroll" | "longPress";
  selector?: string;
  value?: string;
  direction?: "up" | "down" | "left" | "right";
  app?: string;
  ms?: number;
}

interface CaptureResult {
  screenshot: string;
  hierarchy: string;
  // Parity modes
  primaryScreenshot?: string;
  secondaryScreenshot?: string;
  primaryHierarchy?: string;
  secondaryHierarchy?: string;
  primaryPlatform?: Platform;
  secondaryPlatform?: Platform;
}

interface ActionResult {
  success: boolean;
  error?: string;
  primarySuccess?: boolean;
  secondarySuccess?: boolean;
  primaryError?: string;
  secondaryError?: string;
}

const sessions = new Map<string, Session>();

interface SessionFile {
  mode: SessionMode;
  primarySessionId: string;
  secondarySessionId?: string;
  primaryPlatform: Platform;
  secondaryPlatform?: Platform;
  primaryApp: string;
  secondaryApp?: string;
  port: number;
}

function saveSession(sessionId: string, data: SessionFile): void {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  fs.writeFileSync(path.join(SESSION_DIR, `${sessionId}.json`), JSON.stringify(data));
}

function loadSession(sessionId: string): SessionFile | null {
  const file = path.join(SESSION_DIR, `${sessionId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function deleteSessionFile(sessionId: string): void {
  const file = path.join(SESSION_DIR, `${sessionId}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

async function reattachDriver(wdSessionId: string, port: number): Promise<Browser> {
  return attach({
    sessionId: wdSessionId,
    hostname: "127.0.0.1",
    port,
    path: "/",
    logLevel: "silent",
  });
}

async function getSession(sessionId: string): Promise<Session> {
  // Check in-memory first
  let session = sessions.get(sessionId);
  if (session) return session;

  // Try to reattach from file
  const saved = loadSession(sessionId);
  if (!saved) throw new Error(`Session ${sessionId} not found`);

  // Ensure Appium is running
  await ensureAppium(saved.port);

  // Reattach to WebDriver sessions
  const primaryDriver = await reattachDriver(saved.primarySessionId, saved.port);
  let secondaryDriver: Browser | undefined;
  if (saved.secondarySessionId) {
    secondaryDriver = await reattachDriver(saved.secondarySessionId, saved.port);
  }

  session = {
    mode: saved.mode,
    primaryDriver,
    secondaryDriver,
    primaryPlatform: saved.primaryPlatform,
    secondaryPlatform: saved.secondaryPlatform,
    primaryApp: saved.primaryApp,
    secondaryApp: saved.secondaryApp,
  };

  sessions.set(sessionId, session);
  return session;
}

async function isAppiumRunning(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request({ hostname: "127.0.0.1", port, path: "/status", method: "GET", timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function ensureAppium(port: number): Promise<void> {
  if (await isAppiumRunning(port)) return;

  // Start local Appium from node_modules - detached so it survives process exit
  const libDir = path.dirname(new URL(import.meta.url).pathname);
  const appiumBin = path.join(libDir, "node_modules", ".bin", "appium");

  if (!fs.existsSync(appiumBin)) {
    throw new Error(`Appium not found. Run: npm install --prefix ${libDir}`);
  }

  const child = spawn(appiumBin, ["--port", String(port), "--relaxed-security"], {
    stdio: "ignore",
    detached: true,
  });
  child.unref(); // Allow parent to exit independently

  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (await isAppiumRunning(port)) return;
  }

  throw new Error("Appium server failed to start within 30s");
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      result[key] = value || "true";
    }
  }
  return result;
}

async function createDriver(platform: Platform, appId: string, opts: Record<string, string> = {}): Promise<Browser> {
  const port = parseInt(opts.port || String(appiumPort), 10);
  await ensureAppium(port);

  const appType: AppType = opts.flutter === "true" ? "flutter" : "native";

  let capabilities: Record<string, unknown>;

  if (appType === "flutter") {
    // Flutter driver - works on both platforms
    capabilities = platform === "ios"
      ? {
          platformName: "iOS",
          "appium:automationName": "Flutter",
          "appium:bundleId": appId,
          "appium:udid": opts.udid || undefined,
          "appium:noReset": true,
        }
      : {
          platformName: "Android",
          "appium:automationName": "Flutter",
          "appium:appPackage": appId.split("/")[0],
          "appium:appActivity": appId.split("/")[1] || ".MainActivity",
          "appium:udid": opts.serial || undefined,
          "appium:noReset": true,
        };
  } else {
    // Native drivers
    capabilities = platform === "ios"
      ? {
          platformName: "iOS",
          "appium:automationName": "XCUITest",
          "appium:bundleId": appId,
          "appium:udid": opts.udid || undefined,
          "appium:noReset": true,
        }
      : {
          platformName: "Android",
          "appium:automationName": "UiAutomator2",
          "appium:appPackage": appId.split("/")[0],
          "appium:appActivity": appId.split("/")[1] || ".MainActivity",
          "appium:udid": opts.serial || undefined,
          "appium:noReset": true,
        };
  }

  // Remove undefined values
  Object.keys(capabilities).forEach(key => {
    if (capabilities[key] === undefined) delete capabilities[key];
  });

  const driver = await remote({
    hostname: opts.host || "127.0.0.1",
    port,
    path: "/",
    capabilities,
    logLevel: "silent",
  });

  return driver;
}

// Single app testing
async function startSingle(platform: Platform, appId: string, opts: Record<string, string>): Promise<string> {
  const sessionId = generateSessionId();
  const port = parseInt(opts.port || String(appiumPort), 10);
  const driver = await createDriver(platform, appId, opts);

  sessions.set(sessionId, {
    mode: "single",
    primaryDriver: driver,
    primaryPlatform: platform,
    primaryApp: appId,
  });

  // Save session for reconnection
  saveSession(sessionId, {
    mode: "single",
    primarySessionId: driver.sessionId,
    primaryPlatform: platform,
    primaryApp: appId,
    port,
  });

  console.log(JSON.stringify({ sessionId, status: "started", mode: "single", platform }));
  return sessionId;
}

// Migration parity (same platform, different app versions)
async function startParityMigration(
  oldApp: string,
  newApp: string,
  platform: Platform,
  opts: Record<string, string>
): Promise<string> {
  const sessionId = generateSessionId();

  // Need different ports or devices for two instances on same platform
  const primaryOpts = { ...opts };
  const secondaryOpts = { ...opts, port: String(parseInt(opts.port || "4723", 10) + 1) };

  const [primaryDriver, secondaryDriver] = await Promise.all([
    createDriver(platform, oldApp, primaryOpts),
    createDriver(platform, newApp, secondaryOpts),
  ]);

  sessions.set(sessionId, {
    mode: "parity-migration",
    primaryDriver,
    secondaryDriver,
    primaryPlatform: platform,
    secondaryPlatform: platform,
    primaryApp: oldApp,
    secondaryApp: newApp,
  });

  // Save session for reconnection
  saveSession(sessionId, {
    mode: "parity-migration",
    primarySessionId: primaryDriver.sessionId,
    secondarySessionId: secondaryDriver.sessionId,
    primaryPlatform: platform,
    secondaryPlatform: platform,
    primaryApp: oldApp,
    secondaryApp: newApp,
    port: parseInt(opts.port || String(appiumPort), 10),
  });

  console.log(JSON.stringify({
    sessionId,
    status: "started",
    mode: "parity-migration",
    platform,
    primaryApp: oldApp,
    secondaryApp: newApp,
  }));
  return sessionId;
}

// Cross-platform parity (iOS vs Android)
async function startParityCross(iosBundleId: string, androidPackage: string, opts: Record<string, string>): Promise<string> {
  const sessionId = generateSessionId();

  const [iosDriver, androidDriver] = await Promise.all([
    createDriver("ios", iosBundleId, opts),
    createDriver("android", androidPackage, opts),
  ]);

  sessions.set(sessionId, {
    mode: "parity-cross",
    primaryDriver: iosDriver,
    secondaryDriver: androidDriver,
    primaryPlatform: "ios",
    secondaryPlatform: "android",
    primaryApp: iosBundleId,
    secondaryApp: androidPackage,
  });

  // Save session for reconnection
  saveSession(sessionId, {
    mode: "parity-cross",
    primarySessionId: iosDriver.sessionId,
    secondarySessionId: androidDriver.sessionId,
    primaryPlatform: "ios",
    secondaryPlatform: "android",
    primaryApp: iosBundleId,
    secondaryApp: androidPackage,
    port: parseInt(opts.port || String(appiumPort), 10),
  });

  console.log(JSON.stringify({
    sessionId,
    status: "started",
    mode: "parity-cross",
    primaryPlatform: "ios",
    secondaryPlatform: "android",
  }));
  return sessionId;
}

async function captureDriver(driver: Browser, platform: Platform, tmpDir: string, prefix: string): Promise<{ screenshot: string; hierarchy: string }> {
  const screenshotPath = path.join(tmpDir, `${prefix}-screenshot.png`);
  const hierarchyPath = path.join(tmpDir, `${prefix}-hierarchy.xml`);

  // Screenshot
  const screenshot = await driver.takeScreenshot();
  fs.writeFileSync(screenshotPath, screenshot, "base64");

  // View hierarchy (XML)
  const source = await driver.getPageSource();
  fs.writeFileSync(hierarchyPath, source);

  return { screenshot: screenshotPath, hierarchy: hierarchyPath };
}

async function capture(sessionId: string): Promise<CaptureResult> {
  const session = await getSession(sessionId);

  const tmpDir = `/tmp/mobile-${sessionId}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  if (session.mode === "single") {
    const result = await captureDriver(session.primaryDriver, session.primaryPlatform, tmpDir, session.primaryPlatform);
    const output: CaptureResult = {
      screenshot: result.screenshot,
      hierarchy: result.hierarchy,
    };
    console.log(JSON.stringify(output));
    return output;
  }

  // Parity modes
  const [primaryResult, secondaryResult] = await Promise.all([
    captureDriver(session.primaryDriver, session.primaryPlatform, tmpDir, `primary-${session.primaryPlatform}`),
    captureDriver(session.secondaryDriver!, session.secondaryPlatform!, tmpDir, `secondary-${session.secondaryPlatform}`),
  ]);

  const output: CaptureResult = {
    screenshot: primaryResult.screenshot,
    hierarchy: primaryResult.hierarchy,
    primaryScreenshot: primaryResult.screenshot,
    secondaryScreenshot: secondaryResult.screenshot,
    primaryHierarchy: primaryResult.hierarchy,
    secondaryHierarchy: secondaryResult.hierarchy,
    primaryPlatform: session.primaryPlatform,
    secondaryPlatform: session.secondaryPlatform,
  };

  console.log(JSON.stringify(output));
  return output;
}

async function performAction(driver: Browser, platform: Platform, action: ActionPayload): Promise<{ success: boolean; error?: string }> {
  try {
    switch (action.type) {
      case "tap":
        if (!action.selector) throw new Error("selector required for tap");
        const tapEl = await driver.$(action.selector);
        await tapEl.click();
        break;

      case "fill":
        if (!action.selector || action.value === undefined) throw new Error("selector and value required for fill");
        const fillEl = await driver.$(action.selector);
        await fillEl.clearValue();
        await fillEl.setValue(action.value);
        break;

      case "swipe": {
        const { width, height } = await driver.getWindowSize();
        const centerX = width / 2;
        const centerY = height / 2;
        const offset = 300;

        let startX = centerX, startY = centerY, endX = centerX, endY = centerY;
        switch (action.direction) {
          case "up": startY = centerY + offset; endY = centerY - offset; break;
          case "down": startY = centerY - offset; endY = centerY + offset; break;
          case "left": startX = centerX + offset; endX = centerX - offset; break;
          case "right": startX = centerX - offset; endX = centerX + offset; break;
        }

        await driver.action("pointer", { parameters: { pointerType: "touch" } })
          .move({ x: Math.round(startX), y: Math.round(startY) })
          .down()
          .move({ x: Math.round(endX), y: Math.round(endY), duration: 300 })
          .up()
          .perform();
        break;
      }

      case "scroll": {
        // Alias for swipe with common directions
        const dir = action.direction === "up" ? "up" : "down";
        return performAction(driver, platform, { type: "swipe", direction: dir });
      }

      case "back":
        if (platform === "android") {
          await driver.back();
        } else {
          // iOS: try back button first, fallback to edge swipe
          const backBtn = await driver.$("~Back").catch(() => null);
          if (backBtn && await backBtn.isExisting().catch(() => false)) {
            await backBtn.click();
          } else {
            const { height } = await driver.getWindowSize();
            await driver.action("pointer", { parameters: { pointerType: "touch" } })
              .move({ x: 5, y: Math.round(height / 2) })
              .down()
              .move({ x: 200, y: Math.round(height / 2), duration: 200 })
              .up()
              .perform();
          }
        }
        break;

      case "launch":
        if (!action.app) throw new Error("app required for launch");
        if (platform === "ios") {
          await driver.execute("mobile: launchApp", { bundleId: action.app });
        } else {
          const [pkg, activity] = action.app.split("/");
          await driver.execute("mobile: startActivity", {
            appPackage: pkg,
            appActivity: activity || ".MainActivity",
          });
        }
        break;

      case "longPress":
        if (!action.selector) throw new Error("selector required for longPress");
        const lpEl = await driver.$(action.selector);
        const location = await lpEl.getLocation();
        const size = await lpEl.getSize();
        const x = Math.round(location.x + size.width / 2);
        const y = Math.round(location.y + size.height / 2);

        await driver.action("pointer", { parameters: { pointerType: "touch" } })
          .move({ x, y })
          .down()
          .pause(action.ms || 1000)
          .up()
          .perform();
        break;

      case "wait":
        await driver.pause(action.ms || 1000);
        break;
    }

    // Brief pause for UI to settle
    await driver.pause(300);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function executeAction(sessionId: string, action: ActionPayload): Promise<ActionResult> {
  const session = await getSession(sessionId);

  if (session.mode === "single") {
    const result = await performAction(session.primaryDriver, session.primaryPlatform, action);
    const output: ActionResult = { success: result.success, error: result.error };
    console.log(JSON.stringify(output));
    return output;
  }

  // Parity modes - execute on both
  const [primaryResult, secondaryResult] = await Promise.all([
    performAction(session.primaryDriver, session.primaryPlatform, action),
    performAction(session.secondaryDriver!, session.secondaryPlatform!, action),
  ]);

  const output: ActionResult = {
    success: primaryResult.success && secondaryResult.success,
    primarySuccess: primaryResult.success,
    secondarySuccess: secondaryResult.success,
    primaryError: primaryResult.error,
    secondaryError: secondaryResult.error,
  };

  console.log(JSON.stringify(output));
  return output;
}

async function closeSession(session: Session): Promise<void> {
  await session.primaryDriver.deleteSession().catch(() => {});
  if (session.secondaryDriver) {
    await session.secondaryDriver.deleteSession().catch(() => {});
  }
}

async function stop(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);

  await closeSession(session);
  sessions.delete(sessionId);
  deleteSessionFile(sessionId);
  console.log(JSON.stringify({ sessionId, status: "stopped" }));
}

// Note: We don't kill Appium or sessions on exit - they persist for reconnection

async function main() {
  const [, , command, ...args] = process.argv;
  const opts = parseArgs(args);
  const positional = args.filter(a => !a.startsWith("--"));

  try {
    switch (command) {
      case "start-ios":
        if (positional.length < 1) {
          console.error("Usage: driver.ts start-ios <bundle-id> [--udid=<simulator>] [--flutter]");
          process.exit(1);
        }
        await startSingle("ios", positional[0], opts);
        break;

      case "start-android":
        if (positional.length < 1) {
          console.error("Usage: driver.ts start-android <package[/activity]> [--serial=<device>] [--flutter]");
          process.exit(1);
        }
        await startSingle("android", positional[0], opts);
        break;

      case "start-parity-migration":
        if (positional.length < 2 || !opts.platform) {
          console.error("Usage: driver.ts start-parity-migration <old-app> <new-app> --platform=ios|android");
          process.exit(1);
        }
        await startParityMigration(positional[0], positional[1], opts.platform as Platform, opts);
        break;

      case "start-parity-cross":
        if (positional.length < 2) {
          console.error("Usage: driver.ts start-parity-cross <ios-bundle> <android-package>");
          process.exit(1);
        }
        await startParityCross(positional[0], positional[1], opts);
        break;

      case "capture":
        if (positional.length < 1) {
          console.error("Usage: driver.ts capture <session-id>");
          process.exit(1);
        }
        await capture(positional[0]);
        break;

      case "action":
        if (positional.length < 2) {
          console.error("Usage: driver.ts action <session-id> <action-json>");
          process.exit(1);
        }
        await executeAction(positional[0], JSON.parse(positional[1]));
        break;

      case "stop":
        if (positional.length < 1) {
          console.error("Usage: driver.ts stop <session-id>");
          process.exit(1);
        }
        await stop(positional[0]);
        break;

      default:
        console.error("Commands: start-ios, start-android, start-parity-migration, start-parity-cross, capture, action, stop");
        process.exit(1);
    }
  } catch (err) {
    console.error(JSON.stringify({ error: String(err) }));
    process.exit(1);
  }
}

main();
