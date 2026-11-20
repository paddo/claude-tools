# Outlook web recipes

Host: `https://outlook.cloud.microsoft/mail/`. Folders: `/mail/inbox`, `/mail/sentitems`.

## Find a thread

The message list items have `role=option`. List the top ones:

```bash
playwright-cli -s=<name> --raw eval "[...document.querySelectorAll('[role=option]')].slice(0,30).map(e=>e.innerText.replace(/\\s+/g,' ').slice(0,200)).join('\\n')"
```

Open one by subject:

```bash
playwright-cli -s=<name> --raw eval "[...document.querySelectorAll('[role=option]')].find(e=>/<subject>/.test(e.innerText)).click()"
```

The thread shows only the newest message in full. To read an older one in full, click its date text (for example `getByText('<date and time as shown>', { exact: true })` in `run-code`), then read `[role=main]` again.

## Download an attachment

1. `find "<file name>"`. Under the `listbox "file attachments"`, take the ref of `button "More actions"`.
2. `click <ref>`, then `find "Download"` and click the `menuitem "Download"` ref.
3. The file lands in `~/Downloads` (see Downloads in [SKILL.md](../SKILL.md)).

## Reply all

1. `find "Reply all"`. Click the **last** ref in the list: that is the button under the newest message. The ribbon button can hang.
2. Check the recipients: read the `[contenteditable=true]` elements with `aria-label` To and Cc.
3. Type the body at the top, above the signature, in `run-code`:

```js
async page => {
  const body = page.locator('[contenteditable=true][aria-label="Message body"]').first();
  await body.focus();
  await page.evaluate(() => {
    const el = document.querySelector('[contenteditable=true][aria-label="Message body"]');
    const r = document.createRange(); r.setStart(el, 0); r.collapse(true);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  });
  await page.keyboard.type('Hi <name>,');
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  await page.keyboard.type('<body>');
  return (await body.innerText()).slice(0, 300);
}
```

4. Read back the returned text. Then `find "Send"` and click the `button "Send"` ref.
5. `goto https://outlook.cloud.microsoft/mail/sentitems` and confirm the top item.

Outlook adds the user's signature. Do not type one.
