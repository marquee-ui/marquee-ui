# CROSS-BROWSER-1 — focused Firefox and WebKit QA

Authorized on 2026-10-13: exercise the release-critical controls in Firefox and
WebKit and fix reproducible bugs. npm UI 0.2.0 remains held. No new parity batch,
package publication or PR merge is part of this work.

## Scope and runner

`pnpm test:docs:cross-browser` uses `apps/docs/playwright.cross-browser.config.ts`:
Slider, Calendar, DatePicker, Select, Combobox, Dialog, AlertDialog, theme studio
and native touch-tap journeys at 390×844, 768×1024 and 1280×900 in both engines.
The suite includes keyboard state, pointer endpoints, focus return, nested
dismissal, scroll reachability, actual target geometry, light/dark/accent and
forced-colors paint. Three new touch journeys cover Slider, Calendar/DatePicker
and Select/Combobox. These also join the regular Chromium gate.

Source-copy tests tagged `@clipboard` retain their real Chromium clipboard
permission/readback checks. Firefox/WebKit do not accept the same permission
set. Theme persistence was split from clipboard readback, so refresh/storage
behavior still runs in all engines. No interaction check is skipped as a way to
hide a failing component.

The lockfile resolves Playwright 1.63.0. The Arch host uses the matching official
`mcr.microsoft.com/playwright:v1.63.0-noble` image, digest
`sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`.
Its browser server runs on loopback port 4199, with a read-only repository mount.
Tests/builds run on the host using Node 22.18.0 and pnpm 10.24.0; no host system
packages were installed. The environment variable
`PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:4199` connects the host runner to it.
See [Playwright's Docker setup](https://playwright.dev/docs/docker) for matching
versions and remote-browser operation. On supported Linux, install the engines
and their system dependencies directly as shown in the README.

## Findings and repair

- **Combobox forced-colors separator:** WebKit matched the media query but kept
  the regular pale border (`rgb(213, 219, 192)`), producing 1.426:1 contrast in
  the existing rendered-paint test. Add `forced-colors:border-current` so the
  separator explicitly follows the foreground instead of relying on the engine
  to replace the border. Regenerate the copied-source registry.
- **Firefox geometry precision:** Calendar and DatePicker returned
  43.999969482421875px for CSS 44px controls. Apply the existing Slider tolerance
  of 0.001px; real hit-area checks and the 44px requirement remain.
- **Firefox endpoint input:** a test click at y=382.2 was delivered at y=382,
  outside a vertical track beginning at y=382.100006. The event hit the parent
  wrapper and left the value unchanged. One full pixel inside the track lands
  on it and selects 100. Keep the exact 0/100 and marker-alignment assertions.
- **Font serialization:** normalize optional quotes around loaded FontFace
  family names; continue asserting the same three loaded bundled fonts.
- **WebKit keyboard journey:** opening Select underneath the previous preview
  click generated pointermove over Low, after Normal had correctly received
  keyboard focus. Move the pointer away before testing keyboard ownership;
  pointer and touch selection remain separately exercised.

Before repair, the Firefox run stopped at its configured failure limit (12
failed, 128 passed, one interrupted); a separate mobile WebKit baseline passed
49 and failed the separator contrast, pointer-contaminated focus and clipboard
permission cases. Traces and event probes retain the actual failure assertions.

## Verification and artifacts

Verification is in progress. Full outcomes and the refreshed candidate will be
recorded before this work is presented as complete.

Durable evidence: `/home/ankit/.marquee-scratch/CROSS-BROWSER-1/`, including
`engine-baseline.log`, `webkit-baseline.log`, their trace directories,
`endpoint-probe.jsonl`, `webkit-probe.log` and the before-fix screenshot.

## Limits

This is a selected docs/Storybook suite, not all 35 family APIs or every consumer
framework. WebKit is Playwright's Linux engine, not branded Safari or an iPhone
test. Viewport and touch emulation do not prove real-device gestures, virtual
keyboards, OS accessibility behavior or Safari integration. Clipboard write/read
permission coverage remains Chromium-only. npm publication requires new user
direction after this QA work.
