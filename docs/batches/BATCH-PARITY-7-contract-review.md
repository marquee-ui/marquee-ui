# BATCH-PARITY-7 packed native-region contract supplement

**CONFIRMED at unchanged clean source `15c266e3a47be44ad40c26db4d961ca31cd09a9f`, 2026-10-08:** complete SVG reveal is a caller/native-region prerequisite. Chart does not promise that native Tab alone reveals the entire SVG. The packed mobile clipping is real, stable geometry, not a timing failure. This clarification is consistent with the previously reviewed contract and does not reopen M1/M2.

## Durable contract decision

Adopt the proposed wording in the final batch, CHART slice and parity record, with the user-facing guide pointing to the same contract:

> In a wide native table, reveal the complete chart through the named scroll region's keyboard controls before Tab enters it. Native Tab establishes focus; it does not guarantee revealing the whole SVG. Chart point arrows preserve this revealed boundary.

The number of native arrow presses is fixture-specific. Four presses prove the current packed example; they are not a universal scrolling prescription. Preserve the exact whole-SVG bounds assertions before and after point navigation. A region that cannot expose the whole SVG requires a caller sizing/composition correction; this decision does not authorize silently weakening the geometry assertion or adding generic automatic scrolling.

## Source and existing promises checked

- `packages/ui/src/chart.tsx:13–56`: presentation and SVG ring styling, caller-first events, and narrow suppression of native scroll during focused SVG point arrows. It contains no focus/reveal handler, DOM scroll write or promise of automatic whole-chart reveal.
- `packages/ui/src/table.tsx:16–37`: explicitly named native scroll boundary with its own tab stop and arrow default; caller chooses this boundary.
- `docs/slices/CHART-1.md:54–59`: existing implemented modal journey already receives focus on the region, uses native arrows to reveal the chart cell, then Tabs to SVG.
- `apps/docs/browser/chart.spec.ts:378–393`: committed proof explicitly says SVG Tab does not promise automatic ancestor scrolling, presses native region arrows until the whole chart is visible, and checks that prerequisite before Tab. Its subsequent point sequence checks unchanged scroll and complete focused SVG/ring bounds.
- `docs/getting-started.md:112–137`: caller reveal policy is already described for horizontally scrolling cell controls; Chart documentation distinguishes region scrolling, point navigation and explicit modal recipe ownership. The proposed explicit whole-SVG sentence makes this precondition clearer for Chart consumers.
- `apps/docs/src/examples/chart.tsx`: live standalone examples ask users to focus a chart and read points. They are responsive standalone plots rather than wide table-cell compositions and contain no contradictory whole-SVG-on-Tab promise.

The source promise that the SVG receives a visible focus ring supplies its ring styling; it does not override caller overflow clipping. Existing slice/browser proof makes the complete visible-boundary precondition explicit. No checked source, slice or live guide promises automatic full reveal on Tab.

## Packed evidence read and independently assessed

Evidence below was produced by the coordinator's same-build packed diagnostic, then read and independently aggregated here. I did not launch these browser runs or a new packed/gate run. Both saved diagnostic runner exits are 0; the first is an observational script, not a passing whole-fit assertion. Scripts inspected: `integration/initial-selector/diagnose-cross.mjs` and `integration/diagnose-cross.mjs`. They enter the Dialog from its trigger, use actual region Right keys, wait 350ms, then native Tab to the SVG; each sample reads SVG, host and region geometry atomically and repeats ten times at 100ms intervals. There is no scripted chart focus or scroll repair.

| Width | Two native Right keys, scrollLeft 80                                                            | Four native Right keys, scrollLeft 160                              |
| ----- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 390   | SVG 162.609375–418.609375; region 42–348; **70.609375px right clipping**, 0/10 whole-fit frames | SVG 82.609375–338.609375; region 42–348; **10/10 whole-fit frames** |
| 768   | SVG 274.609375–530.609375; region 154–614; 10/10 whole-fit frames                               | SVG 194.609375–450.609375; region 154–614; 10/10 whole-fit frames   |
| 1280  | SVG 530.609375–786.609375; region 410–870; 10/10 whole-fit frames                               | SVG 450.609375–706.609375; region 410–870; 10/10 whole-fit frames   |

In both observations, all 30 samples have the SVG focused, SVG and host bounds match, and each width has exactly one geometry/scroll state over its ten samples. Tab focus succeeded in the original mobile observation while full reveal did not. The second observation's unchanged 30/30 full-fit samples prove that additional real region navigation establishes the prerequisite at every tested width. JSON, logs and exits remain `integration/cross-geometry-diagnostic.*` and `integration/cross-native-reveal-diagnostic.*`.

Actually inspected `integration/cross-first-390.png` and `integration/cross-native-reveal-390.png`: the original visibly clips the right ring and Gamma; the second shows the complete rectangle, Alpha/Beta/Gamma labels, actual three-point plot, native values and Close. Adjacent wide-table text remains outside the scroll view by design.

The original packed assertion text `native Tab reveals the whole chart surface` incorrectly attributed the already-required region reveal to Tab. Correcting that attribution and establishing complete visibility with native region keys is consistent with the existing contract. Preserve the original mobile red and its stable clipping evidence separately from the six reported selector-instrument failures. Those selector fixes and the fresh corrected packed target's final result are coordinator-owned evidence; this supplement does not claim their completion.

## Scope and state

No source edit, feature, gate, process launch, public operation or source promise expansion occurred. The same source remains clean at `15c266e`; original HOLD and corrected nine-arm closure evidence are preserved. This confirms the bounded contract and current native reveal counterexample/control, not arbitrary table geometries, non-Chromium focus scrolling or universal automatic SVG visibility. Port 4197 remains stopped; no coordinator preview process was touched.
