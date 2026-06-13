#!/usr/bin/env bun
// scout-fetch — tiered web fetcher for the scout research agent.
//
// Ladder, cheapest first, escalating only on a confirmed block:
//   1. direct        plain fetch with a browser UA (free)
//   2. scrape.do      super=true residential proxy (paid, beats most anti-bot)
//   3. scrape.do      super=true&render=true (costlier, JS-heavy / stubborn CF)
//
// Escalation engine ported from paddo-tech/pricogni's tier4 fetcher. A shared
// ledger file accumulates credits across calls so a "scour everything" run
// can't quietly blow the budget: paid tiers refuse past SCOUT_MAX_CREDITS.
//
// What it CANNOT do: beat a hard authentication wall (logged-out X, private
// Reddit). Those need credentials or an official API, not an unlocker. The
// fetcher detects that case and says so instead of burning credits on it.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const SD_ENDPOINT = 'https://api.scrape.do/';
const CENTS_PER_CREDIT = Number(process.env.SCRAPE_DO_CENTS_PER_CREDIT ?? 0.008);
const DEFAULT_CREDITS = 10;

// ---- block detection -------------------------------------------------------

const CF_CHALLENGE_RE =
  /Just a moment\.\.\.|One moment, please|cf_chl_opt|cf-mitigated|window\._cf_chl_opt|Attention Required/i;
const IMPERVA_RE = /Pardon Our Interruption|Access Denied|Request unsuccessful\. Incapsula|_Incapsula_Resource/i;
const AUTH_RE =
  /(JavaScript is not available|enable JavaScript to (run|continue)|please (log|sign) ?in|log in to continue|sign in to continue|create an account to|register to continue|subscribe to (read|continue)|members only|you must be logged in)/i;

type Block = 'ok' | 'anti_bot' | 'auth_wall' | 'http_error' | 'empty';

function classify(status: number, body: string): Block {
  if (status === 401 || status === 403 || status === 429 || status === 503) {
    // could be anti-bot or auth; refine by body below
  } else if (status >= 400) {
    return 'http_error';
  }
  if (!body || body.trim().length === 0) return 'empty';
  // An auth wall is short AND screams login. Check before anti-bot so a CF
  // marker inside a login page doesn't misroute us into burning render credits.
  if (body.length < 8000 && AUTH_RE.test(body)) return 'auth_wall';
  if (body.length < 30_000 && (CF_CHALLENGE_RE.test(body) || IMPERVA_RE.test(body)))
    return 'anti_bot';
  if (status >= 400) return status === 403 || status === 401 ? 'anti_bot' : 'http_error';
  return 'ok';
}

// ---- html -> text ----------------------------------------------------------

function decode(s: string): string {
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    mdash: '-', ndash: '-', hellip: '...', rsquo: "'", lsquo: "'",
    rdquo: '"', ldquo: '"', '#39': "'",
  };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z#0-9]+);/gi, (m, e) => named[e.toLowerCase()] ?? m);
}

function extractTitle(html: string): string {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? decode(t[1]).replace(/\s+/g, ' ').trim() : '';
}

function htmlToText(html: string): string {
  // Drop the noise wholesale.
  let h = html
    .replace(/<(script|style|noscript|svg|head|template|iframe)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  // Prefer the main content region if the page marks one.
  const main =
    h.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    h.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    h.match(/<[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/[a-z]+>/i);
  if (main) h = main[1];
  return decode(
    h
      .replace(/<\/(p|div|section|article|header|footer|li|tr|h[1-6]|blockquote)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<h([1-6])[^>]*>/gi, (_, n) => '\n' + '#'.repeat(Number(n)) + ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---- cost ledger -----------------------------------------------------------

function isoDay(): string {
  // Date is fine here (plain CLI, not a resumable workflow).
  return new Date().toISOString().slice(0, 10);
}
const LEDGER = process.env.SCOUT_BUDGET_FILE ?? `/tmp/scout-budget-${isoDay()}.json`;
const MAX_CREDITS = Number(process.env.SCOUT_MAX_CREDITS ?? 5000);

function readLedger(): { credits: number; fetches: number } {
  try {
    if (existsSync(LEDGER)) return JSON.parse(readFileSync(LEDGER, 'utf8'));
  } catch {}
  return { credits: 0, fetches: 0 };
}
function addLedger(credits: number) {
  const l = readLedger();
  l.credits += credits;
  l.fetches += 1;
  try { writeFileSync(LEDGER, JSON.stringify(l)); } catch {}
  return l;
}

// ---- tiers -----------------------------------------------------------------

type Fetched = { ok: boolean; status?: number; body?: string; tier: string; credits?: number; reason?: string; finalUrl?: string };

async function withTimeout(ms: number): Promise<[AbortSignal, () => void]> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return [c.signal, () => clearTimeout(t)];
}

async function tierDirect(url: string, timeoutMs: number): Promise<Fetched> {
  const [signal, clear] = await withTimeout(timeoutMs);
  try {
    const res = await fetch(url, {
      signal,
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body, tier: 'direct', finalUrl: res.url };
  } catch (e: any) {
    return { ok: false, tier: 'direct', reason: `network: ${e?.message ?? e}` };
  } finally {
    clear();
  }
}

async function tierScrapeDo(url: string, opts: { sup?: boolean; render?: boolean; country?: string; timeoutMs: number }): Promise<Fetched> {
  const token = process.env.SCRAPE_DO_API_KEY;
  const tier = `scrape.do${opts.render ? '(render)' : '(super)'}`;
  if (!token) return { ok: false, tier, reason: 'SCRAPE_DO_API_KEY not set' };

  const ledger = readLedger();
  if (ledger.credits >= MAX_CREDITS)
    return { ok: false, tier, reason: `budget cap hit: ${ledger.credits}/${MAX_CREDITS} credits spent this run` };

  // super=true is residential-proxy (beats IP/geo blocks cheap, no JS).
  // render=true is the headless-browser path (beats JS walls). They are
  // separate strategies: combining them can trip scrape.do rotation on some
  // domains (Axios), so the two tiers use one lever each.
  const params = new URLSearchParams({ token, url });
  if (opts.sup) params.set('super', 'true');
  if (opts.render) params.set('render', 'true');
  if (opts.country) params.set('geoCode', opts.country);

  const [signal, clear] = await withTimeout(opts.timeoutMs);
  try {
    const res = await fetch(`${SD_ENDPOINT}?${params}`, { signal, headers: { 'accept-encoding': 'identity' } });
    const body = await res.text();
    const credits = Number(res.headers.get('scrape.do-request-cost')) || DEFAULT_CREDITS;
    if (res.ok) addLedger(credits);
    if (!res.ok) return { ok: false, status: res.status, body, tier, reason: `HTTP ${res.status}: ${body.slice(0, 200).trim()}` };
    return { ok: true, status: res.status, body, tier, credits, finalUrl: url };
  } catch (e: any) {
    return { ok: false, tier, reason: `${tier} error: ${e?.message ?? e}` };
  } finally {
    clear();
  }
}

// ---- main -------------------------------------------------------------------

function parseArgs(argv: string[]) {
  const a: any = { json: false, raw: false, render: false, maxChars: 20000, timeoutMs: 45000 };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--json') a.json = true;
    else if (x === '--raw') a.raw = true;
    else if (x === '--render') a.render = true;
    else if (x === '--country') a.country = argv[++i];
    else if (x === '--max-chars') a.maxChars = Number(argv[++i]);
    else if (x === '--timeout') a.timeoutMs = Number(argv[++i]);
    else rest.push(x);
  }
  a.url = rest[0];
  return a;
}

async function run(url: string, a: any) {
  const attempts: { tier: string; block: Block; reason?: string }[] = [];

  // Tier 1: direct (skipped if caller forces render)
  if (!a.render) {
    const d = await tierDirect(url, a.timeoutMs);
    const block = d.ok || d.status ? classify(d.status ?? 0, d.body ?? '') : 'http_error';
    attempts.push({ tier: 'direct', block, reason: d.reason });
    if (d.ok && block === 'ok') return finish(d, attempts, a);
    if (block === 'auth_wall') return finish(d, attempts, a, 'auth_wall');
  }

  // Tier 2: scrape.do residential proxy (or render directly if forced)
  const s = await tierScrapeDo(url, { sup: !a.render, render: a.render, country: a.country, timeoutMs: 90000 });
  const sBlock = s.ok ? classify(s.status ?? 0, s.body ?? '') : 'http_error';
  attempts.push({ tier: s.tier, block: sBlock, reason: s.reason });
  if (s.ok && sBlock === 'ok') return finish(s, attempts, a);
  if (s.ok && sBlock === 'auth_wall') return finish(s, attempts, a, 'auth_wall');
  // A budget-cap refusal isn't worth escalating into a costlier tier.
  if (!s.ok && /budget cap hit/.test(s.reason ?? '')) return finish(s, attempts, a, 'budget');

  // Anything else (anti-bot leak, scrape.do rotation/5xx, empty) escalates to
  // the render tier once: a different proxy path that clears stubborn walls.
  if (!a.render) {
    const r = await tierScrapeDo(url, { render: true, country: a.country, timeoutMs: 90000 });
    // (render tier deliberately omits super — separate strategy, see tierScrapeDo)
    const rBlock = r.ok ? classify(r.status ?? 0, r.body ?? '') : 'http_error';
    attempts.push({ tier: r.tier, block: rBlock, reason: r.reason });
    if (r.ok && rBlock === 'ok') return finish(r, attempts, a);
    if (rBlock === 'auth_wall') return finish(r, attempts, a, 'auth_wall');
    return finish(r.ok ? r : s, attempts, a, rBlock === 'anti_bot' ? 'anti_bot' : 'failed');
  }
  return finish(s, attempts, a, sBlock === 'anti_bot' ? 'anti_bot' : 'failed');
}

function finish(f: Fetched, attempts: any[], a: any, failure?: string) {
  const ledger = readLedger();
  const dollars = (ledger.credits * CENTS_PER_CREDIT) / 100;
  const body = f.body ?? '';
  const title = body ? extractTitle(body) : '';
  const content = a.raw ? body : htmlToText(body);
  const truncated = content.length > a.maxChars;
  const text = truncated ? content.slice(0, a.maxChars) : content;

  if (a.json) {
    console.log(JSON.stringify({
      url: a.url, finalUrl: f.finalUrl, ok: !failure, failure: failure ?? null,
      tier: f.tier, status: f.status ?? null, title,
      attempts, chars: content.length, truncated,
      runCredits: ledger.credits, runFetches: ledger.fetches, runCostUSD: Number(dollars.toFixed(4)),
      content: text,
    }));
    return failure ? 1 : 0;
  }

  const path = attempts.map((x) => `${x.tier}:${x.block}${x.reason ? `(${x.reason})` : ''}`).join(' -> ');
  const lines = [
    `# ${title || a.url}`,
    `source: ${f.finalUrl ?? a.url}`,
    `tier: ${f.tier}${f.status ? `  status: ${f.status}` : ''}`,
    `ladder: ${path}`,
    `run cost: $${dollars.toFixed(4)} (${ledger.credits} credits, ${ledger.fetches} paid fetches)`,
  ];
  if (failure) {
    lines.push(`\nFAILED: ${failure}`);
    if (failure === 'auth_wall')
      lines.push('This is a hard authentication wall. An unlocker will not help - needs login cookies or an official API.');
    if (failure === 'anti_bot')
      lines.push('Anti-bot challenge survived super proxy + render. Try --country, or fall back to agent-browser with a cloud provider.');
    if (failure === 'budget')
      lines.push('Per-run credit budget exhausted (SCOUT_MAX_CREDITS). Report what you have rather than raising the cap silently.');
  } else {
    lines.push(truncated ? `chars: ${a.maxChars} (truncated from ${content.length})` : `chars: ${content.length}`);
    lines.push('---', text);
  }
  console.log(lines.join('\n'));
  return failure ? 1 : 0;
}

const args = parseArgs(process.argv.slice(2));
if (!args.url) {
  console.error('usage: scout-fetch <url> [--json] [--raw] [--render] [--country cc] [--max-chars N] [--timeout ms]');
  process.exit(2);
}
process.exit(await run(args.url, args));
