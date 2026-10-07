# Marquee implementation status

CURSOR: BATCH-PARITY-2 — Dialog and AlertDialog

The user authorized a finite component-parity program on 2026-10-08. Implement the
[batch roadmap and parity matrix](docs/component-parity.md) in order; expand each next
batch just in time. The public-release hold is a separate lane and does not block
local implementation or subsequent green batches.

## Active batch

Next: BATCH-PARITY-2 — Dialog and AlertDialog. Active: [batch record](docs/batches/BATCH-PARITY-2.md),
[DIALOG-1](docs/slices/DIALOG-1.md) and [ALERT-DIALOG-1](docs/slices/ALERT-DIALOG-1.md).
Independent streams are implementing compatible composable overlays and their proofs.

[BATCH-PARITY-1](docs/batches/BATCH-PARITY-1.md) is complete: Select and Tabs, independent
reviews, merged gate, fresh packed-consumer proof and inspected responsive visuals.

## Release hold and current preview

Do not merge the release PR, activate Pages, deploy publicly, purchase a domain or
publish npm until the user directs publication. Continue accumulating reviewed changes
in draft [PR #2](https://github.com/marquee-ui/marquee-ui/pull/2), unmerged.

Current verified preview: **http://localhost:4174/marquee-ui/**, source
`0ae5662c8d06372a24ffad6ce5d740fa346690e4`, served from
`/home/ankit/Code/marquee-integration-parity-1/apps/docs/dist`.
Preserve it until the next batch's build is verified. New components are unreleased;
no version bump is implied. Supported consumer evidence and parity limits live in the matrix.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
Latest completed handoff:
`/home/ankit/.marquee-scratch/BATCH-PARITY-1/integration/final-handoff.md`.
Inspect status/worktrees, this cursor, the matrix and current slice/batch records.
This is library work; no Pile product backlog advances.

## Session log

| Date       | Batch              | Result                                                                                        |
| ---------- | ------------------ | --------------------------------------------------------------------------------------------- |
| 2026-10-08 | RELEASE-1          | Local release candidate verified; publication held for user review.                           |
| 2026-10-08 | RELEASE-1-UX       | Requested live themes and highlighted source verified; publication held.                      |
| 2026-10-08 | RELEASE-1-CONTROLS | Visual picker and independent accents verified; publication held.                             |
| 2026-10-08 | BATCH-PARITY-1     | Select/Tabs and nested overlay compatibility verified; localhost refreshed; publication held. |
