# CROSS-BROWSER-1 — focused Firefox and WebKit QA

Authorized on 2026-10-13: exercise the release-critical controls in Firefox and
WebKit and fix reproducible bugs. The user subsequently authorized merging PR #5
after green CI and continuing verification. npm UI 0.2.0 remains held; no new
parity batch or package publication is authorized.

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
behavior still runs in all engines. The excluded cases and their coverage bounds
are listed below.

The lockfile resolves Playwright 1.63.0; the browser server reports Firefox 155.0
and WebKit 26.6. The Arch host uses the matching official
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
- **Slider touch commit:** the added native touch test failed in WebKit at
  all three widths: the thumb changed from 40 to 0 while the committed value
  stayed 40. The event trace shows pointer capture on the track, but pointerup
  delivered to the newly moved thumb. Radix checks the release target's capture
  and skips its end handler. Retain the gesture's capture owner and recover only
  this mismatch, using the accepted controlled value or the latest uncontrolled
  value. Normal captured releases and numeric/keyboard behavior remain Radix-owned.
  Caller prevention, cancellation, unrelated pointers, unchanged values and
  rejected controlled changes do not gain a commit. Two controlled/uncontrolled
  regression tests failed with zero callbacks before repair; all nine focused
  cases plus the existing Slider unit suite passed afterward (29 tests). All
  eighteen native touch browser cases then passed in both engines.
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

The first broad rerun passed 327/330 and exposed the three WebKit touch-commit
failures described above. Its full log and traces are retained as `repaired.*`.

Before repair, the Firefox run stopped at its configured failure limit (12
failed, 128 passed, one interrupted); a separate mobile WebKit baseline passed
49 and failed the separator contrast, pointer-contaminated focus and clipboard
permission cases. Traces and event probes retain the actual failure assertions.

## Verification and artifacts

On 2026-10-13, the final source at `01cbfcd` (with a test-only type annotation
correction) passed all **330 Firefox/WebKit cases**, zero skipped, with runner
exit 0 in 5.1 minutes. Command:
`DOCS_PORT=4183 PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:4199 pnpm test:docs:cross-browser --workers=2`.
`DOCS_PORT=4182 pnpm verify` passed with exit 0: 1,016 library tests, 39 docs
unit tests, five consumer-harness tests and all 348 Chromium browser cases.
The generated registry remained byte-identical after the build.

A fresh external consumer installed the held UI archive with published tokens
0.1.0, then copied and compiled all 35 families (36 registry items, 37 byte-exact
source files). `npm run proof` passed all 111 Chromium cases with no skips,
flakiness or failures. The separate installed-package Firefox/WebKit run passed
all 12 checks for Combobox paint and exact controlled/uncontrolled Slider touch
commit histories. Its command and results are in the
[consumer provenance](CROSS-BROWSER-1-evidence/consumer-provenance.json).

Candidate source: `01cbfcd9b2d665d239272a0c73e41bae21dca1ca`. Later changes are
limited to test type annotations, documentation and retained evidence. Archive:
`/home/ankit/.marquee-scratch/CROSS-BROWSER-1/artifacts/marquee-ui-ui-0.2.0.tgz`.
SHA-256: `f9830d014812df87496b182c409a81af1e21373e9def64db28d4fe834508e39b`.
This supersedes the earlier NESTED-ESCAPE-1 and release-readiness archives; it
has not been published to npm. A live `npm view @marquee-ui/ui version` check
still returned 0.1.10 on 2026-10-13.

Durable evidence: `/home/ankit/.marquee-scratch/CROSS-BROWSER-1/`, including
`engine-baseline.log`, `webkit-baseline.log`, their trace directories,
`endpoint-probe.jsonl`, `webkit-probe.log` and the before-fix screenshot.

The separator repair is visible in the retained
[before](CROSS-BROWSER-1-evidence/combobox-forced-before.png) and
[after](CROSS-BROWSER-1-evidence/combobox-forced-after.png) captures. The
[original pointer trace](CROSS-BROWSER-1-evidence/touch-events-before.jsonl)
records WebKit's mismatched capture/release target alongside Firefox's normal
release. [Browser versions](CROSS-BROWSER-1-evidence/browser-versions.json) were
read from the running engines.

The immutable local preview at `http://localhost:4174/marquee-ui/` was refreshed
from the final build. All 18 Firefox/WebKit touch checks passed against that
copy; file hashes are retained in scratch `preview-manifest.json`.

## Merge and public-site verification

PR [#5](https://github.com/marquee-ui/marquee-ui/pull/5) merged as
`ff774b9c45dddb1bbb43367bc0f19be23873e9e1` on 2026-10-13 IST after all four
checks passed at source `58cff720441a6a1fc467c219c73334cf2853ccee`.
The merged tree matches that checked source. Main and next were synchronized;
their verification runs [38319427993](https://github.com/marquee-ui/marquee-ui/actions/runs/38319427993)
and [38319465323](https://github.com/marquee-ui/marquee-ui/actions/runs/38319465323)
passed. Pages run [38319428028](https://github.com/marquee-ui/marquee-ui/actions/runs/38319428028)
built and deployed that merge successfully.

Twenty public HTML, JavaScript, CSS, font and Storybook files were compared
byte-for-byte with that run's Pages artifact. Public main/next Slider and
Combobox registry files also match the repaired source. A focused public-site
run passed **72 checks** in Chromium, Firefox and Linux WebKit at 390, 768 and
1280 pixels, with exit 0. These cover touch controls, forced-colors separation,
nested dismissal/focus and long-modal reachability. The exact test selection,
command, results and file manifests are retained in
`/home/ankit/.marquee-scratch/CROSS-BROWSER-1/merge/` (`public.config.mts`,
`live-check.log`, `live-results.json`, `deployed-artifact-proof.json` and
`public-registry-proof.json`). Native Safari is tracked separately in
[SAFARI-CI-1](SAFARI-CI-1.md).

## Limits

This is a selected docs/Storybook suite, not all 35 family APIs or every consumer
framework. WebKit is Playwright's Linux engine, not branded Safari or an iPhone
test. Viewport and touch emulation do not prove real-device gestures, virtual
keyboards, OS accessibility behavior or Safari integration. Clipboard write/read
permission coverage remains Chromium-only, as does the extra uncontrolled
form-reset assertion bundled into the clipboard-tagged Slider journey. The
separate keyboard, controlled reset and native touch checks run in both engines.
npm publication requires new user direction after this QA work.
