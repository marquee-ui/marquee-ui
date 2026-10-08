# Marquee implementation status

CURSOR: BATCH-PARITY-3 — Popover and Tooltip

The user authorized a finite component-parity program on 2026-10-08. Implement the
[batch roadmap and parity matrix](docs/component-parity.md) in order; expand each next
batch just in time. The public-release hold is a separate lane and does not block
local implementation or subsequent green batches.

## Active batch

Next: BATCH-PARITY-3 — Popover and Tooltip. Expand its two bounded slices from
[the roadmap](docs/component-parity.md), preserving compatible overlay dependencies
and the reviewed candidate/install/localhost workflow.

[BATCH-PARITY-2](docs/batches/BATCH-PARITY-2.md) is complete: Dialog and AlertDialog,
independent reviews, merged gate, fresh packed-consumer proof and responsive inspection.

## Release hold and current preview

Do not merge the release PR, activate Pages, deploy publicly, purchase a domain or
publish npm until the user directs publication. Continue accumulating reviewed changes
in draft [PR #2](https://github.com/marquee-ui/marquee-ui/pull/2), unmerged.

Current verified preview: **http://localhost:4174/marquee-ui/**, source
`11c0dcf5ebdef812a054962d85d320a68e630c57`, served from
`/home/ankit/Code/marquee-integration-parity-2/apps/docs/dist`.
Preserve it until the next batch's build is verified. New components are unreleased;
no version bump is implied. Supported consumer evidence and parity limits live in the matrix.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
Latest completed handoff:
`/home/ankit/.marquee-scratch/BATCH-PARITY-2/integration/final-handoff.md`.
Inspect status/worktrees, this cursor, the matrix and current slice/batch records.
This is library work; no Pile product backlog advances.

## Session log

| Date       | Batch              | Result                                                                                                |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| 2026-10-08 | RELEASE-1          | Local release candidate verified; publication held for user review.                                   |
| 2026-10-08 | RELEASE-1-UX       | Requested live themes and highlighted source verified; publication held.                              |
| 2026-10-08 | RELEASE-1-CONTROLS | Visual picker and independent accents verified; publication held.                                     |
| 2026-10-08 | BATCH-PARITY-1     | Select/Tabs and nested overlay compatibility verified; localhost refreshed; publication held.         |
| 2026-10-08 | BATCH-PARITY-2     | Dialog/AlertDialog and four-family overlay lifecycle verified; localhost refreshed; publication held. |
