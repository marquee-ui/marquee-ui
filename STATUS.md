# Marquee implementation status

CURSOR: RELEASE-READINESS-1 — test gaps and proposed release artifacts

The user authorized a finite component-parity program on 2026-10-08. All eight
[ordered batches](docs/component-parity.md) are complete. No batch 9 is queued.
Completion means the selected recipes and the common-name API/documentation audit
are done; full shadcn catalog/API parity is not claimed. Remaining implementation
and validation limits are explicitly deferred in the matrix.

## Next work

Next: **RELEASE-READINESS-1**, authorized on 2026-10-09: close the documented
test gaps and prepare verified release artifacts. See its
[bounded scope](docs/batches/RELEASE-READINESS-1.md). Public release remains held;
this is a separate preparation batch, not a ninth parity batch.
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
`87f25c556a80536471476ff1911bd23155f1a684`, served from
`/home/ankit/Code/marquee-integration-parity-8/apps/docs/dist`.
New components are unreleased; published UI 0.1.10/main still have the original
21 families. UI 0.2.0 is being prepared locally; publication is still held.
The contract guides distinguish source
support from measured consumer/browser evidence.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
Latest completed handoff:
`/home/ankit/.marquee-scratch/BATCH-PARITY-8/integration/final-handoff.md`.
Inspect branch/CI/worktrees, this cursor, the matrix and final batch record before
new work. The finite queue is finished; this is library work and no Pile backlog
advances.

## Session log

| Date       | Batch              | Result                                                                                                                                                                                                      |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | RELEASE-1          | Local release candidate verified; publication held for user review.                                                                                                                                         |
| 2026-10-08 | RELEASE-1-UX       | Requested live themes and highlighted source verified; publication held.                                                                                                                                    |
| 2026-10-08 | RELEASE-1-CONTROLS | Visual picker and independent accents verified; publication held.                                                                                                                                           |
| 2026-10-08 | BATCH-PARITY-1     | Select/Tabs and nested overlay compatibility verified; localhost refreshed; publication held.                                                                                                               |
| 2026-10-08 | BATCH-PARITY-2     | Dialog/AlertDialog and four-family overlay lifecycle verified; localhost refreshed; publication held.                                                                                                       |
| 2026-10-08 | BATCH-PARITY-3     | Popover/Tooltip, six-family overlay lifecycle and fresh installed proof verified; localhost refreshed; publication held.                                                                                    |
| 2026-10-08 | BATCH-PARITY-4     | DropdownMenu/Slider, corrected vertical range geometry and fresh packed proof verified; localhost refreshed; publication held.                                                                              |
| 2026-10-08 | BATCH-PARITY-5     | Combobox/Calendar, intrinsic grid containment and packed overlay composition verified; localhost refreshed; publication held.                                                                               |
| 2026-10-08 | BATCH-PARITY-6     | DatePicker/Table, nested fallback focus contrast and packed native scrolling verified; localhost refreshed; publication held.                                                                               |
| 2026-10-08 | BATCH-PARITY-7     | DataTable/Chart bounded recipes, native scroll and modal focus corrections independently verified; fresh packed proof and localhost refreshed; publication held.                                            |
| 2026-10-09 | BATCH-PARITY-8     | All 35 family contracts audited; published/candidate guidance, independent reviews, corrected merged gate and immutable preview verified; finite queue complete, remaining work deferred, publication held. |
