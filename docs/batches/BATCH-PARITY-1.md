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

Completed source: `0ae5662c8d06372a24ffad6ce5d740fa346690e4`. Later commits record
completion/evidence only. The final inventory is 23 families, 24 registry items,
131 stories and 101 interaction plays.

Both streams completed independent adversarial reviews and one full gate each:
[Select](../slices/SELECT-1.md), [Tabs](../slices/TABS-1.md). The merged
[integration review](BATCH-PARITY-1-review.md) closed one reproduced HIGH by aligning
Sheet's public Dialog dependency minimum with Select's focus/dismissal generation.
The unchanged independent nested probe now passes 18 checks at all three widths.

Final `DOCS_PORT=4182 pnpm verify`, Node 22.18.0, exit **0**, 97s
(2026-10-08 04:53:22–04:54:59 IST): **733 library tests in 40 files, 39 docs unit
tests, 5 consumer checks and 84 Chromium browser cases** at 390/768/1280.
Generated registry remains byte-current. Logs: scratch `integration/verify.*`.

Fresh external consumer: local UI/tokens tarballs, a new npm cache, no symlinks or
workspace imports, the installed registry over HTTP, nine selected families and
10 copied files compared to packed JSON. Strict TypeScript/Vite build passed;
**12/12 browser cases** passed, including dark/light painted outline style, width
and contrast, 44px targets, fonts, selection/form behavior, and nested Sheet focus,
two Escape levels and restored pointer input. This is an **unreleased packed
candidate**, not evidence that npm UI 0.1.10 already contains the new components.
[Tarball hashes and provenance](BATCH-PARITY-1-evidence/consumer-provenance.json).

Proof command: `node /home/ankit/.marquee-scratch/BATCH-PARITY-1/candidate-proof.mjs
/home/ankit/Code/marquee-ui /home/ankit/.marquee-scratch/BATCH-PARITY-1/consumer-final
/home/ankit/.marquee-scratch/BATCH-PARITY-1/candidate.spec.ts` with Node 22 PATH.
The initial final-artifact browser run passed 11/12: a tablet paint probe moved
focus before Radix's asynchronous return/roving transitions completed. Awaiting
those actual focus states fixed the instrument; `npm run proof` against the same
fresh installation passed 12/12 in 6.7s. Logs: `integration/consumer.log` and
`integration/consumer-browser-final.log`, each with its own honest exit sentinel.

Six final docs screenshots were visually inspected: contained popup/controls,
readable selected/focused states, consistent role styling and responsive layouts.

| Width | Select in Light mode                              | Tabs composition                              |
| ----- | ------------------------------------------------- | --------------------------------------------- |
| 390   | [Select](BATCH-PARITY-1-evidence/select-390.png)  | [Tabs](BATCH-PARITY-1-evidence/tabs-390.png)  |
| 768   | [Select](BATCH-PARITY-1-evidence/select-768.png)  | [Tabs](BATCH-PARITY-1-evidence/tabs-768.png)  |
| 1280  | [Select](BATCH-PARITY-1-evidence/select-1280.png) | [Tabs](BATCH-PARITY-1-evidence/tabs-1280.png) |

The gated build now serves **http://localhost:4174/marquee-ui/** from
`/home/ankit/Code/marquee-integration-parity-1/apps/docs/dist`, detached PID 1156504.
Served index SHA256 `581bd5b310d9a97391e66d5bf43d39e5120173eb029240668245bad398bbff92`
matches the built file. Browser verification confirms 23 families, both new keyboard
flows, highlighted source and no page errors. The serving snapshot survives later
work on next. Final-head hosted CI and cleanup details live in scratch
`integration/final-handoff.md` and draft PR #2. Next cursor: BATCH-PARITY-2.

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
1.07:1) and a removed Tabs Trigger outline width. The fresh packed consumer also exposed
SelectItem outline-none retaining a non-painted style; explicit highlighted outline-solid
now has a predicted-red mutation and isolated style/width/contrast browser checks. Select now uses action ink; Tabs has a
per-host compiled-style check. Isolated component and packed-consumer focus/selection proof
is an explicit acceptance rule for later batches in the roadmap.

Overlay dependencies need a nested composition check at the installed-registry boundary;
workspace-only resolution cannot protect copied components. That lesson and isolated
focus/selection paint are now acceptance notes for subsequent roadmap batches.
