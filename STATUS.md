# Marquee implementation status

CURSOR: READY — separate docs pages and Tide PNGs verified; public release held

The user authorized a finite component-parity program on 2026-10-08. All eight
[ordered batches](docs/component-parity.md) are complete. No batch 9 is queued.
Completion means the selected recipes and the common-name API/documentation audit
are done; full shadcn catalog/API parity is not claimed. Remaining implementation
and validation limits are explicitly deferred in the matrix.

## Next work

The user-requested [separate docs pages and Tide PNGs](docs/batches/DOCS-PAGES-1.md)
are complete: eight static page URLs, preserved old bookmarks and themes, square
avatars and a repository social preview. Full local verification passed, and the
stable preview below serves the verified build. Final PR-head CI verdicts are
recorded in the latest handoff; check them before public release.

Next: **await explicit public release direction**. The separately authorized
[release-readiness batch](docs/batches/RELEASE-READINESS-1.md) is complete locally:
the two test gaps have proved regression controls, UI 0.2.0 is packed, and a fresh
external consumer verified all 35 family installs plus 99 selected browser cases.
The [release proposal](docs/releases/0.2.0.md) lists the concrete artifacts and
held production steps. Check the final PR head's CI before any publication.
No further implementation batch is queued.
[Batch 8](docs/batches/BATCH-PARITY-8.md) completes the
35-family source/current-primary-document audit, visible published/candidate
installation guidance, independent stream/merged reviews, corrected full merged
gate and verified immutable localhost refresh. Installed evidence is reused from
Batch 7 after proving unchanged product/registry/dependency/consumer inputs.
[Batch 7](docs/batches/BATCH-PARITY-7.md) retains the bounded DataTable/Chart
implementation and original fresh packed proof, including the native-scroll
prerequisite and finite validation limits.

## Release hold and current preview

Do not merge the release PR, activate Pages, deploy publicly, purchase a domain or
publish npm until the user directs publication. Reviewed changes accumulate in
draft [PR #2](https://github.com/marquee-ui/marquee-ui/pull/2), unmerged.

Current verified preview: **http://localhost:4174/marquee-ui/**, source
`facb18a50e14556907866651e3ec1a55d7163710`, served from
`/home/ankit/.marquee-scratch/DOCS-PAGES-1/preview`.
New components are unreleased; published UI 0.1.10/main still have the original
21 families. UI 0.2.0 is prepared locally; publication is still held.
The contract guides distinguish source
support from measured consumer/browser evidence.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
Latest completed handoff:
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

| 2026-10-09 | DOCS-PAGES-1 | Tide PNG exports; eight static docs pages with preserved themes/bookmarks; full local verification 996/39/5/324 green; immutable preview refreshed; publication held. |
