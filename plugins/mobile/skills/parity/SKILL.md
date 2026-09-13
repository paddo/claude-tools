---
name: parity
description: Compare iOS and Android apps, or old and new app versions, with Appium and screenshot evidence.
---

Read [the driver reference](../../references/driver.md).
Use the requested comparison mode, app identifiers, devices, and flows.
Cross-platform comparison requires an iOS device and an Android device.
Migration comparison requires two devices for the chosen platform.

Start one single-app session per device with explicit device identifiers.
For two iOS sessions, assign distinct unused `--wda-local-port` values as shown in the driver reference.
Keep both session IDs. Run equivalent actions through their respective sessions.
Use selectors from each device's hierarchy when accessibility IDs differ.
Run flows sequentially. Never assign multiple controllers to the same device.

1. Check connected devices with `status`.
2. Start both sessions and capture their initial states.
3. Perform each flow on both devices.
4. Capture screenshots and hierarchies at each comparison point.
5. Inspect both screenshots with the host image viewer.
6. Record differences with severity and evidence paths.
7. Stop both sessions, including after failures.

For cross-platform comparisons:

- Report missing features, inconsistent data, incomplete flows, crashes, and error dialogs as defects.
- Accept native font, control, navigation, status bar, and system dialog differences.
- Flag significant spacing, color, animation, or platform feature differences for review.

For migrations, treat the old version as the reference:

- Critical: Broken features, incorrect data, or crashes.
- Major: Interaction regressions or broken layouts.
- Minor: Small styling or interaction differences.
- Cosmetic: Barely visible differences.

With one device, explain the missing comparison prerequisite. Offer the [single-app test](../test/SKILL.md) as a separate audit.
Return compared flows, defects, accepted platform differences, review items, and the overall result.
If the caller supplies a report path, write the report there before returning it.
