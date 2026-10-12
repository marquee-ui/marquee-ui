# SAFARI-CI-1 — native Safari on GitHub Actions

The user requested Safari/iPhone testing through GitHub Actions on 2026-10-13
while keeping npm UI 0.2.0 held. No physical Apple device is available. GitHub
provides standard macOS runners for this public repository; a device-cloud
account is not required for desktop Safari or iPhone Simulator Safari.

## Scope

`.github/workflows/safari.yml` runs two independent jobs on standard `macos-15`
runners: desktop Safari and iPhone Simulator Safari with Xcode 26.3 / iOS 26.2.
The simulator selector fails if the pinned runtime has no available iPhone. The
tests verify the returned Safari/platform capabilities and record them; they
never silently substitute Linux WebKit or desktop emulation.

The dependency-free Node runner talks to Apple's bundled Safari WebDriver using
the W3C protocol. Input uses driver clicks and actions; JavaScript reads state
and geometry or scrolls controls into view, but never synthesizes clicks or
changes component values. It tests the built local site from the checked-out
revision, including nested Storybook pages, and retains results and screenshots
for successful and failed runs.

Five journeys check Slider 0/100 values, marker alignment, commit callbacks,
form submission and reset; Calendar date/month selection and target geometry;
Combobox selection and form state; nested Dialog/Sheet dismissal and focus
recovery; and bounded modal scrolling to an actionable final control.

## Verification

Pending the first native Safari CI run. Syntax/lint checks on Linux are not
Safari results. npm publication remains held.

## Limits and sources

This is focused Safari smoke coverage, not every component API or every iOS
version. The iPhone target is Apple's simulator, not physical hardware.
WebDriver suppresses the iOS software keyboard and some system-level interactions;
these checks do not establish virtual-keyboard layout, multi-touch gestures,
VoiceOver, or physical-device performance. The broader Firefox/Linux WebKit
and Chromium suites remain separate evidence.

- [GitHub standard runners and public-repository policy](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [Installed macOS 15 runner software](https://github.com/actions/runner-images/blob/main/images/macos/macos-15-arm64-Readme.md)
- [Apple Safari WebDriver and simulator capabilities](https://webkit.org/blog/9395/webdriver-is-coming-to-safari-in-ios-13/)
- [Enabling Safari WebDriver](https://developer.apple.com/documentation/webkit/testing-with-webdriver-in-safari)
