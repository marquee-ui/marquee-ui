# Marquee implementation status

CURSOR: IN PROGRESS — nested modal Escape repair and fresh candidate proof; npm 0.2.0 held

The user authorized a finite component-parity program on 2026-10-08. All eight
[ordered batches](docs/component-parity.md) are complete. No batch 9 is queued.
Completion means the selected recipes and the common-name API/documentation audit
are done; full shadcn catalog/API parity is not claimed. Remaining implementation
and validation limits are explicitly deferred in the matrix.

## Next work

PR #3 merged as `7e929d55e6a903dafb1671c3dca71a74d4b349b4` after green
PR CI. Pages deployed the Slider/Calendar fixes and all nine targeted public
checks passed. The separate main/next runs exposed an intermittent nested modal
Escape failure: the background Sheet could close while its child registered.

The user authorized continuing that repair and rebuilding the held candidate.
[NESTED-ESCAPE-1](docs/batches/NESTED-ESCAPE-1.md) records the deterministic
reproduction, background-modal guard and Sheet slot correction. Full verification
and a fresh external package proof are in progress. No new roadmap batch is queued.

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

The retained [release-readiness artifact](docs/batches/RELEASE-READINESS-1.md)
predates these source/dependency changes. Rebuild and verify a fresh packed
consumer before any future npm publication; do not publish the old tarball.

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
`/home/ankit/.marquee-scratch/UI-FIXES-1/preview-verified`. The handoff records the
source commit, preview manifest, screenshots and before/after measurements.
The public site serves PR #3. The nested modal repair is not deployed yet.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
Latest completed handoff:
`/home/ankit/.marquee-scratch/UI-FIXES-1/final-handoff.md`.
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
