# SAFARI-CI-1 — native Safari on GitHub Actions

The user requested Safari/iPhone testing through GitHub Actions on 2026-10-13
while keeping npm UI 0.2.0 held. No physical Apple device is available. GitHub
provides standard macOS runners for this public repository; a device-cloud
account is not required for desktop Safari or iPhone Simulator Safari.

## Scope

`.github/workflows/safari.yml` runs two independent jobs on standard runners:
desktop Safari on `macos-15` and iPhone Simulator Safari on `macos-26` with
Xcode 26.6 / iOS 26.2.
The simulator selector fails if the pinned runtime has no available iPhone. The
tests verify the returned Safari/platform capabilities and record them; they
never silently substitute Linux WebKit or desktop emulation.

The dependency-free Node client talks W3C WebDriver to Apple's bundled
SafariDriver on desktop and Appium 3.8.0 / XCUITest driver 12.17.3 on iPhone.
The iPhone driver uses `nativeWebTap` and native XCTest actions, with browser
onboarding dismissed before a plain-HTML input preflight. Input uses driver clicks and actions; JavaScript reads state
and geometry or scrolls controls into view, but never synthesizes clicks or
changes component values. It tests the built local site from the checked-out
revision, including nested Storybook pages, and retains results and screenshots
for successful and failed runs.

Five journeys check Slider 0/100 values, marker alignment, commit callbacks,
form submission and reset; Calendar date/month selection and target geometry;
Combobox selection and form state; nested Dialog/Sheet dismissal (Escape on
desktop, close controls on iPhone) and focus
recovery; and bounded modal scrolling to an actionable final control.

## Verification

Desktop Safari 26.6.1 on macOS 15.7.9 passed all five journeys and the plain-HTML
input preflight in run
[38320782956](https://github.com/marquee-ui/marquee-ui/actions/runs/38320782956),
source `b86669e`. Its iPhone 17 Pro simulator session returned Safari/iOS 26.2
capabilities, but the driver reported a successful click on a plain HTML button
without activating its handler. The preflight failed before any Marquee check.
This is failed automation evidence, not a passed iPhone suite or an established
component defect. A timed-tap attempt in
[38321683993](https://github.com/marquee-ui/marquee-ui/actions/runs/38321683993)
also failed the preflight; its screenshot captured before session teardown
shows Safari's first-run tutorial over the page. The iPhone job now uses
XCTest so browser setup can be handled through native controls; validation
of this route is in progress. Its first run,
[38322492583](https://github.com/marquee-ui/marquee-ui/actions/runs/38322492583),
failed while building WebDriverAgent: Xcode 26.3 lacks the required
`lib_TestingInterop.dylib`. The iPhone job now selects Xcode 26.6 on standard
`macos-26` and checks this prerequisite before booting. It still pins iOS 26.2.

The preceding run was canceled after the simulator driver stopped responding;
its later errors are not independent component findings. Results, platform
versions, screenshots and detailed driver logs are retained under
`/home/ankit/.marquee-scratch/SAFARI-CI-1/`. Syntax/lint checks on Linux are not
Safari results. npm publication remains held.

## Limits and sources

This is focused Safari smoke coverage, not every component API or every iOS
version. The iPhone target is Apple's simulator, not physical hardware.
These checks do not establish comprehensive virtual-keyboard layout, multi-touch gestures,
VoiceOver, or physical-device performance. The broader Firefox/Linux WebKit
and Chromium suites remain separate evidence.

- [GitHub standard runners and public-repository policy](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [Installed macOS 15 runner software](https://github.com/actions/runner-images/blob/main/images/macos/macos-15-arm64-Readme.md)
- [Installed macOS 26 runner software](https://github.com/actions/runner-images/blob/main/images/macos/macos-26-arm64-Readme.md)
- [Apple Safari WebDriver and simulator capabilities](https://webkit.org/blog/9395/webdriver-is-coming-to-safari-in-ios-13/)
- [Enabling Safari WebDriver](https://developer.apple.com/documentation/webkit/testing-with-webdriver-in-safari)
- [Appium native web taps and simulator capabilities](https://appium.github.io/appium-xcuitest-driver/latest/reference/capabilities/)
