# Marquee implementation status

CURSOR: BATCH-PARITY-3 — Popover and Tooltip

The user authorized a finite component-parity program on 2026-10-08. Implement the
[batch roadmap and parity matrix](docs/component-parity.md) in order; expand each next
batch just in time. The public-release hold is a separate lane and does not block
local implementation or subsequent green batches.

## Active batch

BATCH-PARITY-3 is active from clean base `3bc6ba0efe0895896c88da025757f268ee14e1a0`.

| Stream | Slice | Worktree | Browser / reviewer ports |
| --- | --- | --- | --- |
| Popover | [POPOVER-1](docs/slices/POPOVER-1.md) | `/home/ankit/Code/marquee-popover-1` | 4191 / 4195 |
| Tooltip | [TOOLTIP-1](docs/slices/TOOLTIP-1.md) | `/home/ankit/Code/marquee-tooltip-1` | 4192 / 4196 |

Orchestrator owns shared wiring, registry, counts, consumer proof and next. Baseline
`DOCS_PORT=4182 pnpm verify` passed: 776 library / 39 docs / 5 consumer / 123 browser
on 2026-10-08. Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-3/`.
Next after this batch: BATCH-PARITY-4 — DropdownMenu and Slider.

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
