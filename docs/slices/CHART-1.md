# CHART-1 — composed responsive charts

Batch: BATCH-PARITY-7. Status: independently reviewed; full stream gate pending.
Stream port 4192; reviewer 4196.

## Supported contract

Use maintained Recharts 3.10.1. Callers compose chart primitives and own data/series,
axes/labels/formatting and chart state. Supply bounded presentation container, tooltip
and legend parts with explicit children/render slots, refs/events/host composition
where meaningful, token roles only, measured responsive sizing and visible focus.
Do not generate a theme stylesheet from arbitrary config colors. Bar/line examples
prove keyboard point access via Recharts accessibility layer, concise live tooltip
data, and a readable native-table alternative independent of color or hover.

Use existing categorical roles for two distinct series with explicit labels; tokens
can repeat after their documented range. Check actual paint in light/dark/forced
colors and avoid reliance on color-only distinctions. Defer additional chart types,
brush/zoom, animation controls, export and automatic data/schema inference. No drop-in
shadcn API parity claim. Follow the batch's official primary references.

## Ownership and execution

Own `packages/ui/src/chart.tsx`, `packages/ui/stories/chart.stories.tsx`,
`packages/ui/test/chart*.test.tsx`, `apps/docs/src/examples/chart.tsx`,
`apps/docs/browser/chart.spec.ts` and this record. Coordinator owns dependency
manifests/lockfile, exports/maps/counters/registry/generated output/catalog/guide/status.
You are not alone in the codebase; do not revert others' edits. Ask for wiring once
exports stabilize; send exact stories/plays/dependency edges.

Tests first, meaningful plays and responsive Chromium390/768/1280 browser interactions.
Consumer scans before/after. Inspect screenshots including complete examples, isolate
focus/tooltip/legend paint from docs CSS, and exercise keyboard/mouse plus nested
existing overlay composition where relevant. Check actual geometry and data readings.

Commit before one fresh independent detached reviewer runs landed collapse/no-op
mutations over every touched test file, predicted assertion reds and git restoration.
Close findings before one full `DOCS_PORT=4192 pnpm verify`; request launch clearance.
Scratch `/home/ankit/.marquee-scratch/BATCH-PARITY-7/s2/`; Node22.18.0/pnpm10.24.0.
No public operations, version bump or Pile work. Fresh review browser builds authorized.
Build before tests; root Vitest is the runner.

## Implemented contract

`ChartContainer` is a presentation host with a default `h-64` measured height;
callers explicitly compose `ResponsiveContainer` and keep a positive height/aspect
when overriding it. The focused Recharts SVG owns its inset 2px token outline.
`ChartTooltip`/`ChartLegend` are the real Recharts primitives.
`ChartTooltipContent` supplies an explicit concise live-status host;
`ChartLegendContent`/`ChartLegendItem` retain native ul/li children, refs, attributes,
events and asChild composition. No part generates content from a config or payload.

Two-series bar and line examples have named solid/dashed marks, explicit tooltip
render slots, role-token paint and a native table containing every value. Recharts
owns point state. In Dialog, its responsive SVG appears after measurement;
autofocus on that later SVG is not promised. The real keyboard path is Close,
Shift+Tab to the SVG, point arrows, then Escape with trigger restoration.

Primary sources read 2026-10-08: current shadcn
[Chart](https://ui.shadcn.com/docs/components/chart), Recharts
[accessibility](https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx),
[ResponsiveContainer source](https://github.com/recharts/recharts/blob/main/src/component/ResponsiveContainer.tsx)
and [Tooltip source](https://github.com/recharts/recharts/blob/main/src/component/Tooltip.tsx).
The library's fixed-size real-renderer unit/Keyboard-story proof avoids jsdom layout
pretence; browser cases measure ResponsiveContainer's actual available width.

## Evidence so far

On 2026-10-08 under the pinned Node/pnpm:

- Test first: `pnpm exec vitest run --project ui packages/ui/test/chart.test.tsx`
  initially exits 1 because `@/chart` does not exist; implementation then passes
  all four real-renderer/native-host tests.
- `pnpm build` exits 0, then the four affected UI suites (chart, stories, registry,
  focus-outline) pass **291 tests**. The narrower initial Chart selection passes
  nine with 242 intentional name-filter skips; it is not a gate result.
- `DOCS_PORT=4192 pnpm --filter @marquee-ui/docs test:browser chart.spec.ts`
  passes **15 Chromium cases** at 390/768/1280 in `s2/browser-fourth.log`.
  Screenshots were inspected: role-token bars and lines, all native table values,
  concise tooltip, visible SVG ring, and labeled legends in isolated dark, light
  and forced colors. A follow-up capture removes only the unrelated sticky docs
  studio during screenshots; assertions retain real CSS.
- Before source/consumer scan: no Chart/Recharts usages existed in library or docs
  source. After: imports stay in this source/story/example and coordinator-owned
  registration surfaces; native Table/Dialog compositions reuse existing parts.

Initial probe traces remain in `/home/ankit/.marquee-scratch/BATCH-PARITY-7/s2/`.
`browser-first.log` is **9 passed / 6 failed**: three predicted bar-ratio assertions
sampled separate boxes across the initial moving legend measurement; atomic geometry
with a readiness poll resolves the instrument. Three SVG-autofocus assertions failed
because Radix initially focuses Close; the final proof uses actual Shift+Tab.
`browser-second.log` and `browser-third.log` each retain **14 passed / 1 failed**:
mobile focus preserved active pointer hover at Feb, even during keyboard reads.
The final modality setup moves the pointer outside the graph and uses real Left
arrows to reach Jan. No product source changed for these probe corrections.

## Independent review and corrections

The fresh detached reviewer at `a9e050c` built its own source, passed 291 affected
UI tests / 15 browser cases, and ran 14 landed mutations covering all ten touched
test-bearing surfaces. Every mutation was confirmed in a diff before running,
with predictions, runner exits, named assertions and git-restored green reruns in
`r6/review-initial.md` and its adjacent logs. Native host/event and live content
collapses, table fallback and registration omissions, docs series-data collapse,
and actual SVG focus removal fail their relevant assertions.

Two findings required closure:

- The initial screenshot hypothesis of a clipped line month was narrowed by
  measurement: raw viewport bounds pass at all widths (`s2/labels-before.log`,
  three passed), with Apr ending 0.5px inside the SVG. The isolated Line's actual
  2px inset focus ring overlaps its final 1.5px. The new focused-label assertion
  fails all three widths at exactly that value (`s2/ring-before.log`); the
  reviewer's independent `r6/focus-edge-probe.log` agrees. Caller Line right margin
  moves from 12 to 16 on the existing 4px grid, in story and docs example. The
  component's focus ring remains intact. This is an isolated focused-ring
  overlap; docs' outward global ring did not show it.
- Changing the story's South data key to North left the old native/keyboard and
  paint-only probes green, while still announcing original South data. The
  isolated Default and Line browser proof now reads actual bar-height ratios and
  line-point positions against every declared value, in all three paint modes at
  all widths. The same helper covers the docs graph; concise live text alone is
  not evidence that rendered marks use those values.

Two honest ceilings remain: the pre-existing global play-call no-op still passes
247 story tests because the runner records reaching the call, and removing only
the SVG descendant focus classes leaves the shared host-focus suite green. The
isolated browser SVG test does reject that actual focus removal. Neither survivor
is presented as a resolved instrument property.

Fresh correction review at `11b401e` closes both findings, with **18 landed
mutations** across the ten test-bearing surfaces and every restoration green.
The four closure controls are separate, so one failure cannot mask the next:

| Committed-source counterexample               | Predicted assertion and observed red                       |
| --------------------------------------------- | ---------------------------------------------------------- |
| Story Line margin 16 → 12                     | Focused month-label overlap: 1.5px, expected ≤0.1.         |
| Story Bar South key → North                   | Month 1 bar ratio: 1, expected 1.5.                        |
| Story Line South key → North                  | Month 1 line position delta: 0, expected 6.                |
| Story month ticks removed, axis data retained | Exact Jan/Feb/Mar/Apr label anchor receives an empty list. |

At that exact committed head, the independent root runner passes **291 affected
UI tests** and the browser runner passes **15 cases** at all three widths in
18.8s. Commands, predicted/actual assertion messages, confirmed landed diffs,
fresh build exits, git restorations and screenshots are recorded in
`/home/ankit/.marquee-scratch/BATCH-PARITY-7/r6/review-final.md` and adjacent
`c01`–`c04` logs. This is review evidence; the single full stream gate follows.

The shared client-boundary guard initially rejected Chart's required directive
because it could not see Recharts' client features. Coordinator commit `91f6a1`
adds bounded AST classification of actual Recharts runtime imports, excluding
whole-type and all-type named imports and comment/prose lookalikes. Both the
required-boundary and wasteful-boundary verdicts use that classification. Nine
test-first fixtures produce six predicted failures before the correction and
22 passes afterward.

The same independent reviewer proves five separate controls at that committed
head: remove Chart's directive; collapse the runtime-library set; drop the
whole-type exclusion; drop the inline-type exclusion; and remove the nonempty
binding check so `import {}` is misclassified by vacuous `every`. Each lands,
fails its predicted assertion, and git-restores to **22 passed**, with no
survivors in this supplement. Evidence is `r6/client-boundary-supplement.md` and
`b01`–`b05` logs. Total review evidence is **23 landed mutations**, now including
the eleventh touched test-bearing surface, `client-boundary.test.ts`. This finite
source guard is not a Next integration certification.

## Full gate recovery

The first `DOCS_PORT=4192 pnpm verify` at `690c2fa` runs 2026-10-08
21:41:37–21:42:08 IST and exits **1**. Lint, typecheck and build pass;
the library runner reports **964 passed / 1 failed in 59 files**. The sole
failure is `tailwind-compile.test.tsx` classifying 42 Recharts-generated DOM
markers as missing Tailwind utilities. The chain stops before docs, consumer
and browser runs. Original runner evidence remains unchanged in
`s2/verify.log`, `.sha`, `.start`, `.end` and `.exit`.

Coordinator commit `c79a841` corrects the shared instrument with an exact marker
inventory scoped to descendants of the Chart host. Unknown names, names outside
that host and caller host classes remain checked; equality with the collected
marker set makes unused exceptions fail. Eight test-first fixtures produce four
predicted failures / 44 passes before the correction, then 48 passes and green
ESLint. This instrument correction changes no Chart family source.

At `c79a841`, the independent reviewer lands five separate controls: collapse
classification; broaden the exact inventory to every Recharts prefix; remove
chart ancestry/root bounds; add a never-rendered exception; and put a missing
Tailwind utility on the real Bar through the committed Keyboard story. Every
control fails the predicted fixture or actual compilation assertion and restores
to **48 passed**. The prefix control also rejects exempting `recharts-surface`,
whose focus selectors are owned compiled utilities rather than structural markers.

The reviewer finds one additional boundary gap: a caller ChartContainer nested
inside another ChartContainer inherits the outer ancestry and can escape utility
checking. Its regression-input probe strengthens the existing caller-root fixture
with an outer host, retaining expected `true`; the named root assertion receives
`false` (**1 failed / 47 passed**) before git restoration to 48 passes.
Coordinator commit `1eb82b8` explicitly requires utilities on every ChartContainer
element itself regardless of outer ancestry and retains that nested-root input.
The same reviewer removes the new protection at the committed correction and
obtains the same predicted named assertion red, then restores **48 passed**.

The complete marker supplement closes that finding with six committed-subject
mutations and one additional regression-input counterexample; it has no mutation
survivors. Together with the earlier family and client-boundary reviews, evidence
now covers **29 committed-subject mutations and one regression-input probe**
across twelve touched test-bearing surfaces. The two earlier shared-runner ceilings
remain documented above. Reports and exact landed diffs, predictions, runner
exits and restorations are retained in `r6/tailwind-marker-initial.md` and
`r6/tailwind-marker-supplement.md`, with `t01`–`t07` logs. The corrected full gate uses
separate `s2/verify-corrected.*` evidence so the original failure remains intact.
