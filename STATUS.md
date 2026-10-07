# Marquee implementation status

CURSOR: BATCH-PARITY-1 — Select and Tabs

The user authorized a finite component-parity program on 2026-10-08. Implement the
[batch roadmap and parity matrix](docs/component-parity.md) in order; expand each next
batch just in time. The public-release hold is a separate lane and does not block
local implementation or subsequent green batches.

## Active batch

- [ ] [SELECT-1](docs/slices/SELECT-1.md): composed Select, stories, docs and registry.
- [ ] [TABS-1](docs/slices/TABS-1.md): composed Tabs, stories, docs and registry.
- [ ] Independent stream reviews, merged review/gate, packed-consumer proof,
      responsive visual inspection and refreshed localhost.

Next: BATCH-PARITY-2 — Dialog and AlertDialog after this batch is green.

## Release hold and current preview

Do not merge the release PR, activate Pages, deploy publicly, purchase a domain or
publish npm until the user directs publication. Continue accumulating reviewed changes
in draft [PR #2](https://github.com/marquee-ui/marquee-ui/pull/2), unmerged.

Current verified preview: **http://localhost:4174/marquee-ui/**, source
`f020c59b31e7c7d5691ee7c772e2ac4a314ce53a`, served from
`/home/ankit/Code/marquee-integration-controls/apps/docs/dist`.
Preserve it until the new batch's build is verified. New components are unreleased;
no version bump is implied. Supported consumer evidence and parity limits live in the matrix.

## Previous evidence and cold resume

[Release](docs/batches/RELEASE-1.md), [theme/code revision](docs/batches/RELEASE-1-UX.md),
and [visual controls](docs/batches/RELEASE-1-CONTROLS.md) retain their evidence.
The last controls handoff is
`/home/ankit/.marquee-scratch/RELEASE-1-CONTROLS/integration/final-handoff.md`.
Current batch scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-1/`.
Inspect status/worktrees, this cursor, the matrix and current slice/batch records.
This is library work; no Pile product backlog advances.

## Session log

| Date       | Batch              | Result                                                                   |
| ---------- | ------------------ | ------------------------------------------------------------------------ |
| 2026-10-08 | RELEASE-1          | Local release candidate verified; publication held for user review.      |
| 2026-10-08 | RELEASE-1-UX       | Requested live themes and highlighted source verified; publication held. |
| 2026-10-08 | RELEASE-1-CONTROLS | Visual picker and independent accents verified; publication held.        |
