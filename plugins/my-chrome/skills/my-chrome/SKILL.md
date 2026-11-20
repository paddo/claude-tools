---
name: my-chrome
description: Drive the user's own Chrome, with their logins, through playwright-cli and the Playwright Extension. Use for any browser task that needs a signed-in site, such as reading or answering web email, downloading an attachment, or acting in a web app as the user. Not for logged-out browsing or scraping.
---

# Chrome as the user

Every action reaches the user's real profile, and the user sees it. Act only on what the user asked for.

## Session

1. Attach: `playwright-cli attach --extension=chrome`.
2. Run `playwright-cli list` to get the session name. Pass `-s=<name>` on every command.
   When `PLAYWRIGHT_CLI_SESSION` is set, the attach uses it. When it is not set, the attach names the session `chrome`.
3. Open pages with `tab-new <url>` or `goto <url>`. Never use `open`: it starts a separate, logged-out browser.
4. Touch only the tabs in your own tab group: the group has the session name.
5. Finish with `playwright-cli -s=<name> detach --close-tabs`. A plain `detach` leaves the tab group behind.

Never print `PLAYWRIGHT_MCP_EXTENSION_TOKEN`.

## Clicks

- Get refs with `find "<text>"`, then `click <ref>`. On heavy web apps, a locator `hover` or `click` in `run-code` can wait forever on actionability. A ref click works.
- Read page text with `--raw eval "document.querySelector('[role=main]').innerText"`.

## Downloads

Chrome saves a download to its download folder (`~/Downloads` by default). Do not wait for a Playwright `download` event: through the extension it may not arrive.
Click the download control, wait a few seconds, then list the download folder by time. Copy the file to a new, empty directory before you read it.
The extension needs "Allow access to file URLs" on (chrome://extensions, Playwright Extension, Details).

## When the user must act

- A passkey, 2FA or captcha: tell the user, then poll `find` every 25 s until the page moves on.
- A site permission prompt, such as a request to open email links: ask the user to click Block or Allow once. Chrome keeps the choice for that site.
- A change to the extension's settings reloads it and drops the session. Attach again.

## Sending as the user

Send, post or submit only when the user asked for that exact action. Before you click Send, read back the recipients and the body. After, confirm the item in the sent folder.

## Site recipes

- Outlook web: [references/outlook.md](references/outlook.md)
