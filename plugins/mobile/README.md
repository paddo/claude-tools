# mobile

Native mobile app testing - E2E and cross-platform parity (iOS/Android).

## Commands

- `/mobile:test` - AI-driven E2E testing of native apps
- `/mobile:parity` - Cross-platform (iOS vs Android) or migration comparison

## Modes

| Mode | Use Case |
|------|----------|
| E2E Test | Single app validation |
| Cross-platform Parity | iOS vs Android same app |
| Migration Parity | Old vs new app version |

## Framework Support

| Framework | Driver | Selector |
|-----------|--------|----------|
| Native iOS | XCUITest | `~accessibilityIdentifier` |
| Native Android | UiAutomator2 | `~content-desc` |
| React Native | XCUITest/UiAutomator2 | `~testID` |
| Xamarin | XCUITest/UiAutomator2 | `~AutomationId` |
| Flutter | Flutter | `flutter:key:*` (use `--flutter` flag) |

## Prerequisites

- **iOS**: Xcode + Simulator
- **Android**: Android SDK + Emulator
- **Flutter**: App built with `--enable-dart-observability`

Dependencies auto-install on first run.

## Usage

```
# E2E test
/mobile:test Test login flow on iOS app com.example.app

# Cross-platform parity
/mobile:parity Compare iOS com.example.app vs Android com.example.app

# Migration parity
/mobile:parity --migration Compare com.example.app.v1 vs com.example.app.v2 on iOS
```

## How It Works

1. Appium server auto-starts locally (no global install needed)
2. Agent spawns sessions for iOS Simulator / Android Emulator
3. Executes actions, captures screenshots + view hierarchy
4. AI analyzes results, reports pass/fail or differences
5. Cross-platform comparator distinguishes bugs from platform differences
