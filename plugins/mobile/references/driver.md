# Appium driver

Resolve `../lib` relative to this reference file. Set `MOBILE_LIB` to that absolute directory.
Install its dependencies before the first invocation:

```bash
npm install --prefix "$MOBILE_LIB"
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" status
```

The status includes Appium availability, its port, and connected iOS and Android devices.
Select an available device. Boot the requested simulator when necessary.
Only one controller can use a device at a time.

Start a single-app session with an explicit device:

```bash
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" start-ios <bundle-id> --udid=<simulator>
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" start-android <package/activity> --serial=<device>
```

Add `--flutter` for Flutter applications. The app must expose the Dart VM service for that driver.
Keep the returned session ID for later calls.

For two simultaneous iOS sessions, assign different WebDriverAgent ports with `--wda-local-port`:

```bash
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" start-ios <old-bundle> --udid=<first-device> --wda-local-port=8101
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" start-ios <new-bundle> --udid=<second-device> --wda-local-port=8102
```

Choose unused ports. Different device identifiers alone do not prevent this port conflict.
See the [Appium parallel testing requirements](https://github.com/appium/appium-xcuitest-driver/blob/master/docs/guides/parallel-tests.md).

```bash
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" capture <session-id>
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" action <session-id> '<action-json>'
"$MOBILE_LIB/node_modules/.bin/tsx" "$MOBILE_LIB/driver.ts" stop <session-id>
```

Capture returns screenshot and hierarchy paths. Use the host image viewer and file reader to inspect them.
Stop each session after the flow, including after failures.

Action fields:

| Field | Values |
|---|---|
| `type` | `tap`, `fill`, `swipe`, `scroll`, `back`, `launch`, `longPress`, `wait` |
| `selector` | Accessibility ID, XPath, or Flutter selector |
| `value` | Text for `fill` |
| `direction` | `up`, `down`, `left`, `right` |
| `app` | Bundle ID or package/activity for `launch` |
| `ms` | Duration for `wait` or `longPress` |

```json
{"type": "fill", "selector": "~emailField", "value": "test@example.com"}
```

Prefer accessibility IDs, such as `~loginButton`.
For native apps, use hierarchy-derived XPath when no accessibility ID exists.
Flutter selectors include `flutter:key:`, `flutter:text:`, `flutter:type:`, and `flutter:semantics:`.

The driver stores session files in `/tmp/mobile-sessions/` for subsequent CLI calls.
