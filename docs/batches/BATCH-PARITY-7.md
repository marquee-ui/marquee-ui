# BATCH-PARITY-7 — DataTable and Chart

Date: 2026-10-08. Base: `eea61a33792c2991b8da4358323e48e6ef2b109f`.
Status: complete. Corrected product/gated/packed/preview source:
`15c266e3a47be44ad40c26db4d961ca31cd09a9f`.
Completion commits change records and evidence only. Public operations remain held.

## Scope and decisions

[DATA-TABLE-1](../slices/DATA-TABLE-1.md) supplies a bounded composed recipe over
the existing native Table and maintained TanStack React Table 9. The caller creates
the table instance and owns columns, data, sorting/filter/pagination state and
updates. Rendering and controls remain explicit parts or render slots, rather than
a configuration prop that silently creates a toolbar. The example proves client
sorting, text filtering, pagination, empty results and cell actions.

[CHART-1](../slices/CHART-1.md) supplies bounded presentation parts over maintained
Recharts 3. Callers compose chart primitives, series, axes, labels, tooltip and
legend content using token roles. Bar/line examples prove measured responsive
sizing, keyboard data access and a readable native-table alternative. No generated
theme stylesheet or arbitrary color configuration is introduced.

Primary sources checked 2026-10-08: shadcn [Data Table](https://ui.shadcn.com/docs/components/data-table)
and [Chart](https://ui.shadcn.com/docs/components/chart), TanStack
[table instances](https://tanstack.com/table/latest/docs/guide/tables) and
[React state](https://tanstack.com/table/latest/docs/framework/react/guide/table-state),
Recharts [accessibility](https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx).
`pnpm view <package> version dist-tags --json` under Node 22.18.0 / pnpm 10.24.0
returned `@tanstack/react-table` 9.2.6 and `recharts` 3.10.1. These generations are
selected before implementation; registry dependencies must match source imports.

Virtualized/server grids, row editing, selection managers, column resizing/reordering,
aggregation/export, chart brush/zoom, animation controls and additional chart types
remain deferred. Matching names do not promise a drop-in shadcn API.

Integrated inventory measured 2026-10-08 by the registry walk and checked story
corpus: **35 families / 36 registry items / 215 stories / 185 plays**, 37 generated
source files and 41 registry edges. Measurement command and JSON:
`integration/measure-inventory.mjs`, `integration/inventory.json`.

## Ownership and execution

Two isolated streams own their family source, stories, focused tests, live example,
browser tests and slice record. Each has one fresh independent reviewer in a detached
worktree. The coordinator owns dependency manifests/lockfile, shared exports/maps,
guards/counts, catalog/registry/generated output, batch/status records, reconciliation,
packed consumer and the stable preview. Preserve others' work and retained worktrees.

Tests first, commit before reviewer mutations, confirm each mutation landed and failed
at the predicted assertion, restore from git, then one full stream gate after closure.
An independent merged review precedes the merged `pnpm verify` and a fresh external
packed consumer proof. Inspect screenshots at 390/768/1280 and isolated dark/light/
forced-colors paint; exercise keyboard and meaningful cross-family composition.

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-7/`. Baseline and merged gate port
4182; stream ports 4191/4192; reviewers 4195/4196; merged review 4197.
Node 22.18.0 / pnpm 10.24.0. Source UI version remains 0.1.10 (unreleased additions).
Draft PR #2 accumulates reviewed commits. No main merge, Pages, public deploy, npm
publication, domain operation or Pile backlog/database/shots work is authorized.

## Verification

Baseline at base `eea61a3`: `DOCS_PORT=4182 pnpm verify`, exit 0, 360s,
945 library / 39 docs / 5 consumer / 285 Chromium browser cases. Runner summaries
and exit sentinel: `integration/baseline.*`.

- DataTable corrected full stream gate at `41af7dd`: exit 0, 369s,
  **956 library / 39 docs / 5 consumer / 297 browser**. The first gate stopped on
  a redundant client directive (955 passed, one failed); removed from static
  DataTable presentation and independently proved at its named assertion.
- Chart corrected full stream gate at `4d4d773`: exit 0, 374s,
  **973 library / 39 docs / 5 consumer / 300 browser**. The first gate stopped on
  42 Recharts structural markers classified as Tailwind utilities (964 passed,
  one failed). The finite marker set now applies only to chart descendants,
  preserves utility checks on nested caller roots and rejects stale exceptions,
  unknown marker-like names and real missing utilities.
- Each stream has an independent committed-source mutation review and restored
  green runs. DataTable's natural keyboard cell action exposes its full hit area
  and ring through caller reveal/scroll margin. Chart's Line caller margin leaves
  labels clear of the actual inset ring; actual plot geometry guards duplicated
  series keys, independently from tooltip/table text. Slice records link exact
  predictions, landed diffs, runner verdicts and original retained failures.
- The shared client-boundary guard recognizes runtime Recharts imports through
  an AST, while excluding type-only imports and prose. Independent controls
  close both required/wasteful verdicts. This finite guard does not certify Next
  integration; packed consumer support remains React 19/Tailwind 4/Vite.

The first merged review at `9dc572f` found two P2 keyboard interactions across
Chart, native DataTable scrolling and Dialog. Focused SVG arrows advanced data
and also scrolled the ancestor, clipping the plot. ChartContainer now preserves
caller events and cancels the browser default only for Left/Right on its own
focused accessible SVG. Native region and descendant-control defaults stay intact.

The second finding was native SVG Tab landing on the Dialog panel. Independent
traces proved that Recharts removed active dots or tooltip nodes during blur while
focus was briefly BODY; Radix's existing mutation observer then selected the panel.
Removing Tooltip alone did not fix it, and an explicit synchronous focus adapter
also failed. A bounded modal lifetime recipe passed all nine width/theme arms:
Line active dots and Tooltip cursor are disabled, and the custom tooltip retains
its host and one nonempty text node. Inactive content stays hidden; live values,
Tab/Shift+Tab, Close and Escape remain correct. No general Dialog change or focus
manager is introduced. Original HOLD report, controls and screenshots remain in
`merged-review/`; the corrected reviews and gates close both findings below.

The corrected Chart keyboard source/output at `b4d16db` has the same independent
reviewer closure. Six final-head controls fail their predicted property and restore
green: Tab/Escape default preservation, ancestor scrolling, active dots, tooltip
cursor and conditional inactive host removal. Conditional removal first fails the
mounted-host assertion; a separate real keyboard observation then proves its native
Tab failure. All browser restorations pass the whole 15-case suite. The supplement
records 16 new / 45 cumulative landed source-mutation executions, retaining the two
initial unit survivors and their exact closure. See `r6/scroll-final-review.md`.

Corrected keyboard full stream gate at clean `bb5589d`, 2026-10-08
23:00:08–23:06:37 IST: **exit 0, 389s; 984 library tests in 59 files / 39 docs /
5 consumer / 300 Chromium browser cases** (5.9m browser runner).
Separate `s2/verify-scroll.*` and `s2/gate-scroll-browser/` preserve this run.
The corrected merged union is independently reviewed and fully gated below.

- [Corrected independent merged review](BATCH-PARITY-7-review.md): both P2 findings
  closed at `15c266e`, no unresolved finding in scope. **334 focused tests**, strict
  external fixture TypeScript/Vite and **nine width/theme compositions** pass,
  with zero page errors. The original 372 UI / 12 token checks and inventory are
  preserved as original evidence, not relabeled as a corrected full gate.
- Merged `DOCS_PORT=4182 pnpm verify` at `15c266e`, 2026-10-08
  **23:15:49–23:22:38 IST**, exit **0**, 409s: **995 library tests in 60 files /
  39 docs in four files / 5 consumer / 312 Chromium browser cases** (6.2m).
  `integration/merged-verify.*` records source, start/end, full runner and exit.
- Fresh external packed candidate at the same source: **strict TypeScript/Vite
  build passed, 22 copied files byte-identical to installed registry/source,
  99 browser cases passed / zero skipped, flaky or unexpected**, exit **0**,
  23:33:34–23:35:58 IST. No workspace links; fresh npm cache and tarballs.
  [Packed provenance](BATCH-PARITY-7-evidence/consumer-provenance.json) includes
  both artifact hashes, source and the runner's own statistics. Previous overlay,
  Calendar/Slider/DatePicker/Table journeys remain in this proof.

Reproduce with Node 22 and a fresh external target:
`node ~/.marquee-scratch/BATCH-PARITY-7/candidate-proof.mjs /home/ankit/Code/marquee-ui
~/.marquee-scratch/BATCH-PARITY-7/consumer-reproduction
~/.marquee-scratch/BATCH-PARITY-7/candidate.spec.ts`.
UI 0.1.10/tokens 0.1.0 remain unreleased candidates for these additions;
this proof does not establish that public npm contains them.

## Packed proof corrections

Original fresh run: **92 passed / 7 failed**. Three non-exact `Entry page` queries
also selected the `Entry pages` group. Three old Recharts axis-descendant queries
received zero labels; the same-build diagnostic at docs and packed ports proves
the actual sibling label layer contains exact Jan/Feb/Mar/Apr. Selectors were
corrected without reducing the count, value or geometry bounds.

The seventh failure is real focused clipping, not timing noise: two native region
Right keys move 80px; the focused mobile SVG is x162.609–418.609 outside region
x42–348, consistently across ten atomic frames. Native Tab alone does not reveal
the whole box. The [slice contract](../slices/CHART-1.md#native-scroll-boundary)
requires caller/native-region reveal first. Four real region keys reveal this
fixture at scroll160 (SVG x82.609–338.609), with all 30 frames across widths inside
unchanged bounds. Four is a fixture observation, not a universal count. The same
merged reviewer [confirmed this contract](BATCH-PARITY-7-contract-review.md).

The second fresh run passes **96 / 99**: it samples the scroll baseline before
the preceding native animation completes (159→160, 41→160, 33→160). A separate
six-arm same-build cause probe records all seven focused SVG arrow events with
`defaultPrevented=true`; unpaused baselines 15/21/5 still reach native endpoint160,
while settled baselines remain **160→160** at each width. The final probe waits
350ms for native region settlement before measuring chart navigation. This is
distinct from the original stable clipping, and preserves exact scroll, SVG,
point-value and modal-transition assertions. No library or example source changed
for these probe corrections. All three external targets, original runners,
results and traces remain under `consumer-new`, `consumer-corrected`, `consumer-final`
and `integration/candidate-first.*`, `candidate-second.*`, `candidate.*`.

The initial staging byte request also raced server startup and returned
ECONNREFUSED. After readiness, all 121 files compare exactly. First helper source,
captures and the selector/atomic/event diagnostics remain in scratch and selected
[evidence](BATCH-PARITY-7-evidence/native-settlement-diagnostic.json).

## Responsive inspection and localhost

All **27 new-family packed captures** were opened: actions, responsive plots,
native-table alternatives, modal composition and dark/light/forced-color paint
at 390/768/1280. All **15 final docs captures** were checked: 12 are byte-identical
to inspected staging captures; the three changed captures were opened again.
Only screenshot capture makes the unrelated sticky theme studio static, as in
the committed browser tests; real interaction and geometry use unchanged CSS.
Wide native tables intentionally retain horizontal scrolling, so mobile empty
captures prove semantic state rather than complete centered-text visibility.
Actual SVG inset paint is separately measured without the docs focus rules.

| Width | DataTable action                                             | Chart with native values                                 | Packed modal                                                                |
| ----- | ------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| 390   | [Action](BATCH-PARITY-7-evidence/data-table-action-390.png)  | [Chart](BATCH-PARITY-7-evidence/chart-complete-390.png)  | [Modal](BATCH-PARITY-7-evidence/packed-data-table-chart-dialog-phone.png)   |
| 768   | [Action](BATCH-PARITY-7-evidence/data-table-action-768.png)  | [Chart](BATCH-PARITY-7-evidence/chart-complete-768.png)  | [Modal](BATCH-PARITY-7-evidence/packed-data-table-chart-dialog-tablet.png)  |
| 1280  | [Action](BATCH-PARITY-7-evidence/data-table-action-1280.png) | [Chart](BATCH-PARITY-7-evidence/chart-complete-1280.png) | [Modal](BATCH-PARITY-7-evidence/packed-data-table-chart-dialog-desktop.png) |

Stable **http://localhost:4174/marquee-ui/** serves the immutable reviewed snapshot
`/home/ankit/Code/marquee-integration-parity-7/apps/docs/dist`, PID **4155405**.
Both staging4188 and stable4174 prove all **121 files** equal the snapshot and gate
build bytes. Stable live DataTable/Chart keyboard/data/highlighting/geometry flows
pass at all three widths with zero page errors.
Index SHA256: `33edeb786d843e9de18c17e21138fef8560d446b302b5d4b63ed636726d974a5`.
[Byte manifest](BATCH-PARITY-7-evidence/serving-bytes.json),
[live measurements](BATCH-PARITY-7-evidence/preview.json),
[gate provenance](BATCH-PARITY-7-evidence/gate-provenance.json).

No main merge, Pages activation, public deploy, npm publication, version bump or
domain operation occurred. Draft PR #2 remains open and unmerged. Exact final-head
CI and owned cleanup are recorded in `integration/final-handoff.md`.
Next: **BATCH-PARITY-8 — Existing common-name API audit and documentation**.

## Retro

Check composed keyboard behavior across native scroll regions and modal lifetime,
not only each family in isolation. Preserve caller event ordering and native
defaults when correcting an owned SVG surface. Prove the precise reason for blur
recovery before adding focus adapters. Treat whole-SVG reveal as a documented
caller prerequisite, and distinguish stable focused clipping from unsettled native
animation. Keep initial reds, exact assertion bounds and finite runner ceilings.

## Finite deferred validation limits

The existing global story-play invocation can be replaced with a no-op while its
corpus remains green. This is recorded as one deferred runner item outside the
approved two-family scope. Newly touched play bodies have independent collapse
controls; real browser and fresh consumer journeys supplement the runner. The
host-only unit focus inventory also cannot prove every SVG descendant; isolated
actual SVG paint checks do. No broader guard project is started by this batch.
