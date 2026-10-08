# BATCH-PARITY-5 — Combobox and Calendar

Date: 2026-10-08. Base: `b0ec909400aef7891adde096cc5ff415e2634ffb`.
Status: active. Publication hold: draft PR2 only; no merge, deploy or npm release.

| Stream                                | Ownership                                         | Branch       | Port / reviewer |
| ------------------------------------- | ------------------------------------------------- | ------------ | --------------- |
| [COMBOBOX-1](../slices/COMBOBOX-1.md) | Family source/stories/tests/example/browser/slice | s/combobox-1 | 4191 / 4195     |
| [CALENDAR-1](../slices/CALENDAR-1.md) | Family source/stories/tests/example/browser/slice | s/calendar-1 | 4192 / 4196     |

Orchestrator owns shared wiring, dependency ranges/lockfile, registry, counts,
combined proof, records and preview. Frozen branch base follows this composition commit.
Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-5/`.
Baseline `DOCS_PORT=4182 pnpm verify` exit0; runner reports 878 library,39 docs,
5 consumer,219 browser. Existing stable4174 is retained until a verified replacement.

Scope differences and primary-source dependency decisions are in the two slice records.
Combobox is the bounded single-select searchable popup, not current-shadcn Base UI API
parity. Calendar uses maintained typed selection and replaceable slots. DatePicker and
Table remain Batch6. Full per-stream gates follow detached review, then one merged
review/gate, fresh packed consumer and screenshots, verified4174 refresh, exact-head
CI on draftPR2, cleanup. No batch beyond this one is started by this orchestrator.
