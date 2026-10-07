# BATCH-PARITY-1 — Select and Tabs

Date: 2026-10-08. Base: `4dde0cd32a23fb72a1e824d7a4981c6b7207f8b4`.
The [finite parity roadmap](../component-parity.md) is newly authorized. This batch adds
only Select and Tabs. Public operations remain held; draft PR #2 accumulates the local work.

## Streams and reconciliation ownership

- [SELECT-1](../slices/SELECT-1.md): composable Radix Select, native form value, keyboard,
  state, focus, scrolling and a live copyable demo; port 4191, reviewer 4195.
- [TABS-1](../slices/TABS-1.md): composable Radix Tabs, automatic/manual selection,
  horizontal/vertical layouts, default/line presentation and a live copyable demo;
  port 4192, reviewer 4196.
- Orchestrator: shared dependency/lock, source/export/story maps, registry and counters,
  family counts/catalog, merged gate, packed-consumer proof, records and 4174 preview.
  Mechanical registry regeneration follows each reviewed source edit.

## Evidence

Scratch root: `/home/ankit/.marquee-scratch/BATCH-PARITY-1/`.
Baseline `DOCS_PORT=4180 pnpm verify`, Node 22.18.0, exit 0 in 79s: 708 library tests,
39 docs unit tests, 5 consumer checks, 63 browser cases. This measurement belongs to the
starting tree, not the completed batch.

Integrated evidence, review decisions and final localhost provenance pending.

## Publication

No package version bump, npm publication, main merge, Pages activation, public deployment
or domain operation. New families are explicitly unreleased in the live guide/catalog;
the published starter remains pinned to its existing release. The packed candidate proof
uses copied source from a fresh installed tarball, not workspace imports.

## Retro

A Select primitive inserts a hidden 1px native select for form submission. The prior tap
floor check treated it as a visible control. The exclusion requires a native select,
aria-hidden, tabindex -1 and both inline dimensions at 1px; actual triggers remain measured.
Layer 1 removed the trigger minimum and observed the intended floor assertion redden.
Absent jsdom browser APIs are shims only; browser evidence uses real Chromium behavior.

The live docs stylesheet masked Select's own light focus outline (isolated ratios about
1.07:1) and a removed Tabs Trigger outline width. Select now uses action ink; Tabs has a
per-host compiled-style check. Isolated component and packed-consumer focus/selection proof
is an explicit acceptance rule for later batches in the roadmap.
