# BATCH-PARITY-8 — Common-name API audit and documentation

Date: 2026-10-09. Base: `6cd97f2196a7cee15e01fea373c353043b6d72b0`.
Status: complete. Final audited/site/gated/preview source:
`87f25c556a80536471476ff1911bd23155f1a684`.
Later completion records/evidence do not change the built site or product.
This is the final batch in the finite approved program; no batch 9 is queued.
Public release remains held.

## Result and scope

[Original-family contracts](../common-name-api.md) audit 21 families and
[Candidate recipe contracts](../recipe-contracts.md) audit the fourteen additions
against actual exports/source and contemporary official primary documentation,
checked 2026-10-09. Semantic hosts, caller state/forms, composition, deliberate
upstream differences and supported/deferred behavior are explicit. Matching
names do not establish drop-in shadcn API parity.

Quickstart and supported-stack guidance distinguish published UI 0.1.10
(21 families/22 registry items), the unreleased candidate (35/36), and selected
consumer evidence. All 14 additions visibly say they are absent from published
npm/main beside their composition copy choices. No version bump is implied.

The site renders both contract guides, maps their canonical cross-guide links,
labels tables for native keyboard scrolling, and wraps long audit prose within
the viewport. Three existing browser cases were scoped/tightened for the actual
family focus and both supported-stack tables; the 312-case corpus is unchanged.
README/agent guidance now states the retained story-runner limitations accurately.
No library/token/registry/dependency/consumer source changed.

## Ownership and independent review

Two isolated audit streams used `s/parity8-common-api` and
`s/parity8-install-recipes`, owning only their assigned contract/install prose and
slice records. The coordinator owned shared guides/navigation, catalog labels,
README, matrix/status, reconciliation, merged validation, preview and draft PR.
Each stream obtained one fresh independent detached-worktree review. One fresh
merged reviewer audited the union and narrow site/spec corrections.

All findings are closed. [Review closure and DECISIONS](BATCH-PARITY-8-review.md)
records three P3 prose qualifications, independent mobile-overflow causal proof,
three landed expected-red focus/table controls and restored 9/9 focused cases.
Those focused/prose checks are not described as full product or consumer gates.

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-8/`.
Runtime: Node 22.18.0 / pnpm 10.24.0. Merged gate port 4182; staging 4188.
No Pile backlog, database or screenshot operations apply.

## Measured validation and provenance

- Final source `87f25c5`: `DOCS_PORT=4182 pnpm verify`,
  2026-10-09 03:35:47–03:43:36 IST (469s), **exit 0**. The runner reports **995 library tests
  in 60 files / 39 docs tests in four files / five consumer harness tests /
  312 Chromium browser cases at 390/768/1280**. Lint, strict typecheck,
  registry/Storybook/site builds and the committed-registry diff also pass.
  Full runner, source/start/end and exit sentinel:
  `integration/final-verify.*`; selected
  [gate provenance](BATCH-PARITY-8-evidence/gate.json).
- The first full runner at `f19714c` exited 1: 995/39/5 passed, **286 browser
  passed / 26 failed**. Long slash-separated prose overflowed 390px; duplicate
  audit headings and a second table exposed three old selector assumptions.
  Original `integration/merged-verify.*` and failed browser artifacts remain
  preserved. The one-line wrap and focused/table checks were independently
  reviewed before the full corrected gate. A second full runner at `d25539d`
  exited 1 with 309 browser passes / three failures: a second Tabs heading
  focus at the forced-colors transition still used the whole page. The final
  one-line scope correction preserves all paint assertions; the complete Tabs
  suite and heading-selector census received independent closure before the
  final full gate. Both failed runner/artifact sets remain retained.
- `integration/audit-guides.mjs`, run 2026-10-09: **35 represented families
  (21 + 14), 14 visible availability labels, 14 mapped local guide links and
  62 locally existing source-link targets**. Actual MarkdownGuide rendering,
  canonical navigation and native named-region scrolling are checked separately
  from the source audit. [Guide checks](BATCH-PARITY-8-evidence/guide-audit.json).
- `integration/measure-inputs.mjs`, run 2026-10-09: **264 tracked product,
  registry, dependency and consumer inputs byte-identical to Batch 7 `15c266e`**.
  Inventory remains **35 families / 36 registry items / 37 generated source
  files / 41 dependency edges / 215 stories / 185 plays**.
  [Input equivalence](BATCH-PARITY-8-evidence/input-equivalence.json).
- Batch 7 packed evidence is **reused, not rerun**: strict TypeScript/Vite,
  **22 byte-exact copied files, 99 Chromium cases, zero skipped/flaky/unexpected**,
  measured 2026-10-08 at `15c266e`. It covers 21 selected families, not all 35.
  Original artifact hashes and runner statistics remain in
  [Batch 7 provenance](BATCH-PARITY-7-evidence/consumer-provenance.json).
  The five current consumer harness unit tests above are not a fresh installed
  package proof. Published baseline proof remains seven selected families/eight
  copied files/two Chromium cases at 390/1280.

## Rendered inspection and stable preview

All **25 updated guide/availability/provenance captures were opened and
inspected** at 390/768/1280. Prose wraps within the viewport; links and inline
code stay readable; named wide tables retain native horizontal scrolling and
visible focus. The long packed-source SHA wraps, and published/candidate/reused
scope remains legible after scrolling. Captures are viewport excerpts under the
existing sticky theme studio, not whole-guide visibility claims.
[Inspection manifest](BATCH-PARITY-8-evidence/image-inspection.json).

Captures used the staging build with byte-identical guide/HTML/JS/CSS/font inputs.
A full-file comparison found only Storybook project.json's generatedAt timestamp
differed from the final build; its other fields matched. The snapshot was then
refreshed from the successful final gate. Final staging and stable serving checks
both compare **121/121 files exactly to the gated build**. Actual guide navigation,
all 35 contract coverage, all 14 availability labels, canonical cross-links,
native guide scrolling and DataTable/Chart keyboard/data/paint journeys pass on
the stable preview at all three widths, with **zero page errors**.
[Live guide proof](BATCH-PARITY-8-evidence/guide-live.json),
[DataTable/Chart proof](BATCH-PARITY-8-evidence/preview.json) and
[served bytes](BATCH-PARITY-8-evidence/serving-bytes.json).

Current verified preview: **http://localhost:4174/marquee-ui/** from the owned
immutable `/home/ankit/Code/marquee-integration-parity-8/apps/docs/dist` snapshot
at `87f25c5`. The original Batch 7 serving tree remains preserved. Only owned
Batch 8 nonserving worktrees/merged branches are removed after clean-state checks.
CI, exact final branch head, process identity and cleanup are recorded in
`integration/final-handoff.md` after push.

## Finite completion and remaining limits

The approved batches 1–8 are complete. [The parity matrix](../component-parity.md)
records absent catalog names and existing-family/API extensions as explicitly
deferred. Advanced Combobox, date/time, data-grid/chart behaviors and other
framework/browser/assistive-tech coverage need a new scope decision. DataTable
retains caller-created/reactive TanStack 9 state and Chart caller-composed
Recharts 3 primitives; reveal the whole SVG through its named native scroll
region before Tab. Natural Tab itself does not promise full-box reveal. Modal
Line/Tooltip node lifetime remains a caller recipe.

The existing global story-play invocation no-op survivor and host-only focus
inventory stay finite deferred limits; this audit does not implement a broad
runner/guard project. Green selected checks do not prove every API or composition.

Draft [PR #2](https://github.com/marquee-ui/marquee-ui/pull/2) stays unmerged.
No main merge, Pages activation, public deployment, npm publication, version bump
or domain operation is authorized. Queue completion and publication are separate.
