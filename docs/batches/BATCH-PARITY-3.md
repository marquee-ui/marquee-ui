# BATCH-PARITY-3 — Popover and Tooltip

Date: 2026-10-08. Base: `3bc6ba0efe0895896c88da025757f268ee14e1a0`.
Status: active. Public operations remain held; draft PR #2 accumulates this candidate.

## Scope and ownership

[POPOVER-1](../slices/POPOVER-1.md) owns composed rich nonmodal/modal content.
[TOOLTIP-1](../slices/TOOLTIP-1.md) owns supplemental hover/focus descriptions.
Both expose explicit portal/arrow composition, supported primitive props and role-only
styling. Orchestrator owns shared wiring, registry, counts, guide and combined proof.

## Verification

Baseline `DOCS_PORT=4182 pnpm verify` exited 0 on 2026-10-08, 06:08:20–06:10:42 IST:
776 library tests / 39 docs / 5 consumer / 123 browser cases. Node22.18.0,pnpm10.24.0.
This evidence belongs to the starting tree only. Streams, merged review/gate, fresh
packed consumer and replacement preview remain pending.

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-3/`.

## Publication

Keep draft PR #2 unmerged. No main merge, public deployment, Pages, npm publication,
version bump or domain operation. New parts remain unreleased candidates.
