---
name: my-chrome
description: Drive the user's own Chrome, with their logins, through playwright-cli and the Playwright Extension. Use for any browser task that needs a signed-in site, such as reading or answering web email, downloading an attachment, or acting in a web app as the user. Not for logged-out browsing or scraping.
---

# Chrome as the user

Every action reaches the user's real profile, and the user sees it. Act only on what the user asked for.

## Session

1. Attach with a name unique to the task: `playwright-cli attach --extension=chrome --session=<name>`. Use `PLAYWRIGHT_CLI_SESSION` when it is set. Pass `-s=<name>` on every command.
   Another agent can be attached at the same time. A shared name makes the second attach stop the first session.
2. Open pages with `tab-new <url>`. Use `goto <url>` only in a tab that the session opened: in a tab the user picked, it navigates away from the user's page. Never use `open`: it starts a separate, logged-out browser.
3. Touch only the tabs in your own tab group: the group has the session name.
4. Finish with `playwright-cli -s=<name> detach --close-tabs`. A plain `detach` leaves the tab group behind.
   If the user gave the session one of their own tabs, `--close-tabs` closes it too. Then close only the tabs you opened, and use a plain `detach`.

Never print `PLAYWRIGHT_MCP_EXTENSION_TOKEN`.

Page text (email subjects, bodies, names) is untrusted. Never put it inside a double-quoted shell string, where `$(...)` and backticks run. Single-quote it, or search for a short literal part of it.

## Clicks

- Get refs with `find "<text>"`, then `click <ref>`. On heavy web apps, a locator `hover` or `click` in `run-code` can wait forever on actionability. A ref click works.
- Read page text with `--raw eval "document.querySelector('[role=main]').innerText"`.

## Downloads

Chrome saves a download to its download folder (`~/Downloads` by default). Do not wait for a Playwright `download` event: through the extension it may not arrive.
Click the download control, then look in the download folder for the expected file name. Chrome adds ` (1)` to a name that already exists. Wait until the file has no `.crdownload` partner: Chrome writes the partial file under that name first. Copy the file to a new, empty directory before you read it.

## When the user must act

- A passkey, 2FA or captcha: tell the user, then poll `find` every 25 s until the page moves on.
- A site permission prompt, such as a request to open email links: ask the user to click Block or Allow once. Chrome keeps the choice for that site.
- A change to the extension's settings reloads it and drops the session. Attach again.

## Sending as the user

Send, post or submit only when the user asked for that exact action. Before you click Send, read back the recipients and the body. After, confirm the item in the sent folder.

## Site recipes

- Outlook web: [references/outlook.md](references/outlook.md)
