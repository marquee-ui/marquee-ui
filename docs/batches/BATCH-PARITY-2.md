# BATCH-PARITY-2 — Dialog and AlertDialog

Date: 2026-10-08. Base: `f8c92828791ccf74937e653d74e41d497a226e25`.
Only this batch is expanded from the approved [roadmap](../component-parity.md).
Public release stays held; accumulate work in draft PR #2 without merging.

## Ownership

- [DIALOG-1](../slices/DIALOG-1.md): centered composable Dialog; port 4191/reviewer 4195.
- [ALERT-DIALOG-1](../slices/ALERT-DIALOG-1.md): real AlertDialog semantics; port 4192/reviewer 4196.
- Orchestrator: shared manifests/lock, source/export/story maps, registry/counters,
  catalog and counts, integration, merged review/gate, packed candidate and 4174 preview.

## Evidence

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-2/`.
Baseline `DOCS_PORT=4180 pnpm verify` with Node 22.18.0 returned 0: 733 library tests,
39 docs tests, 5 consumer checks, 84 browser cases. Runner logs and exit in
`integration/baseline.*`. These describe the starting tree, not this batch's result.

Current npm metadata was read with `pnpm view @radix-ui/react-alert-dialog version
dependencies --json`: 1.1.24 depends on Dialog 1.2.0. The workspace and registry must
ship compatible primitive ranges; real nested behavior is the acceptance evidence.

## Completion

Pending streams, independent reviews, merged gate, fresh packed consumer, responsive
inspection, final-head hosted CI and stable localhost refresh. No public operations.
