# Marquee implementation status

CURSOR: IN PROGRESS — PR #5 merged; native Safari CI and deployed-site QA; npm 0.2.0 held

The user authorized a finite component-parity program on 2026-10-08. All eight
[ordered batches](docs/component-parity.md) are complete. No batch 9 is queued.
Completion means the selected recipes and the common-name API/documentation audit
are done; full shadcn catalog/API parity is not claimed. Remaining implementation
and validation limits are explicitly deferred in the matrix.

## Next work

PR #4 merged as `ba7149567fdf9c0d0cd76b38d6d359f1d7f55fcb` after green
PR CI. Main/next verification, Pages deployment and nine targeted public nested
modal checks passed. The Slider/Calendar and nested-modal fixes are live.

On 2026-10-13 the user authorized a focused Firefox/WebKit QA pass and fixes,
while explicitly retaining the npm hold. [CROSS-BROWSER-1](docs/batches/CROSS-BROWSER-1.md)
records the scope, browser setup, findings and validation. No new parity batch
or package publication is authorized. The separator and Slider touch repairs change the
package source, so the previous candidate is historical. The final QA passed
330 Firefox/WebKit cases and the full local gate (1,016 library, 39 docs, five
harness and 348 Chromium tests). A fresh candidate passed all 111 Chromium
consumer cases and 12 targeted Firefox/WebKit consumer checks. Exact artifact
hashes and evidence are in CROSS-BROWSER-1. PR #5 merged as
`ff774b9c45dddb1bbb43367bc0f19be23873e9e1` after all four exact-head checks passed.
Main and next are synchronized to that merge. Their verification and Pages
deployment passed; 20 public files match the deployment artifact and 72 targeted
public-site checks passed across Chromium, Firefox and Linux WebKit. The
continuation adds [native Safari CI](docs/batches/SAFARI-CI-1.md) on GitHub macOS runners.
No physical Apple device is available; iPhone Simulator coverage is separate
from real-device testing. npm publication remains held.

The preceding preview fix was verified as follows:

`DOCS_PORT=4182 pnpm verify` passed on 2026-10-09: 1,001 library tests, 39 docs
tests, 5 consumer-harness tests and 333 Chromium cases at 390/768/1280. The new
geometry checks failed on the reported defects before the implementation. The
35-family default-preview scan found no document overflow or page errors;
Table/DataTable keep their intentional native horizontal scrolling. This is a
bounded preview audit, not exhaustive visual/API or cross-browser coverage.

The initial PR #3 CI run exposed two browser sequencing races: Tooltip focus
preceded a pending scroll event, and the next DropdownMenu opened before the
previous menu restored focus. Both were reproduced and the tests now wait for
those transitions. The full command above passed again on 2026-10-09 with the
same counts; 30 focused browser repetitions also passed. Diagnosis and repetition
evidence: `/home/ankit/.marquee-scratch/UI-FIXES-1/ci-repair/diagnosis.md`.

The preceding candidate and its exact hashes are recorded in
[NESTED-ESCAPE-1](docs/batches/NESTED-ESCAPE-1.md). This QA changes its source. The older
[release-readiness artifact](docs/batches/RELEASE-READINESS-1.md) is obsolete for
publication. Renewed release direction is still required; rebuild and reverify
if the candidate source changes.

## Release hold and current preview

**npm UI 0.2.0 is unpublished and held at the user's request.** The pending npm
login was canceled; no publish command was run. The public UI package remains
0.1.10. Resume publication only after renewed user direction.

PR #2 merged as `23e8154ae2dcb155ca708d2a18df79335f82bd4a` on 2026-10-09.
GitHub Pages is live at **https://marquee-ui.github.io/marquee-ui/**, configured
for Actions with HTTPS. Its source registry contains all 35 families, independently
of npm availability. Main/next verification and documentation deployment passed;
served-page evidence is in the DOCS-PAGES-1 handoff below.

Current verified local preview: **http://localhost:4174/marquee-ui/**, served from
`/home/ankit/.marquee-scratch/CROSS-BROWSER-1/preview-verified`. The handoff records the
source commit, preview manifest, screenshots and before/after measurements.
Pages deployment and served-site verification for PR #5 are recorded in the
CROSS-BROWSER-1 merge handoff; do not infer deployment from a green PR check.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
Latest completed handoff:
`/home/ankit/.marquee-scratch/CROSS-BROWSER-1/final-handoff.md`.
The prior Pages deployment evidence remains in
`/home/ankit/.marquee-scratch/DOCS-PAGES-1/final-handoff.md`.
Inspect branch/CI/worktrees, this cursor, the matrix and final batch record before
new work. The finite queue is finished; this is library work and no Pile backlog
advances.

## Session log

| Date       | Batch               | Result                                                                                                                                                                                                        |
| ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | RELEASE-1           | Local release candidate verified; publication held for user review.                                                                                                                                           |
| 2026-10-08 | RELEASE-1-UX        | Requested live themes and highlighted source verified; publication held.                                                                                                                                      |
| 2026-10-08 | RELEASE-1-CONTROLS  | Visual picker and independent accents verified; publication held.                                                                                                                                             |
| 2026-10-08 | BATCH-PARITY-1      | Select/Tabs and nested overlay compatibility verified; localhost refreshed; publication held.                                                                                                                 |
| 2026-10-08 | BATCH-PARITY-2      | Dialog/AlertDialog and four-family overlay lifecycle verified; localhost refreshed; publication held.                                                                                                         |
| 2026-10-08 | BATCH-PARITY-3      | Popover/Tooltip, six-family overlay lifecycle and fresh installed proof verified; localhost refreshed; publication held.                                                                                      |
| 2026-10-08 | BATCH-PARITY-4      | DropdownMenu/Slider, corrected vertical range geometry and fresh packed proof verified; localhost refreshed; publication held.                                                                                |
| 2026-10-08 | BATCH-PARITY-5      | Combobox/Calendar, intrinsic grid containment and packed overlay composition verified; localhost refreshed; publication held.                                                                                 |
| 2026-10-08 | BATCH-PARITY-6      | DatePicker/Table, nested fallback focus contrast and packed native scrolling verified; localhost refreshed; publication held.                                                                                 |
| 2026-10-08 | BATCH-PARITY-7      | DataTable/Chart bounded recipes, native scroll and modal focus corrections independently verified; fresh packed proof and localhost refreshed; publication held.                                              |
| 2026-10-09 | BATCH-PARITY-8      | All 35 family contracts audited; published/candidate guidance, independent reviews, corrected merged gate and immutable preview verified; finite queue complete, remaining work deferred, publication held.   |
| 2026-10-09 | RELEASE-READINESS-1 | Story-play and Chart SVG guards proved; UI 0.2.0 packed with published tokens 0.1.0; all 35 families installed/compiled, 99 selected consumer cases and full gate green; preview refreshed, publication held. |
| 2026-10-09 | DOCS-PAGES-1        | Tide PNG exports; eight static docs pages with preserved themes/bookmarks; full local verification 996/39/5/324 green; immutable preview refreshed; publication held.                                         |
| 2026-10-09 | UI-FIXES-1          | Slider endpoints, compact Calendar and Toggle demo spacing fixed; full gate 1001/39/5/333 green; preview audit and immutable localhost refreshed; npm release held.                                           |
| 2026-10-09 | UI-FIXES-1-CI       | Reproduced Tooltip scroll and DropdownMenu focus-return races; repaired browser sequencing; 30 focused repetitions and full gate 1001/39/5/333 passed; npm release held.                                      |
| 2026-10-09 | NESTED-ESCAPE-1     | Nested modal registration and Sheet custom hosts repaired; full gate, fresh installed candidate and refreshed local preview verified; npm held.                                                               |
| 2026-10-13 | CROSS-BROWSER-1     | Fixed WebKit Slider touch commits and Combobox forced-colors contrast; 330 Firefox/WebKit cases, full gate and fresh 111 Chromium plus 12 cross-browser consumer checks passed; npm held.                     |
