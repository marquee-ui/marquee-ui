# BATCH-PARITY-7 — DataTable and Chart

Date: 2026-10-08. Base: `eea61a33792c2991b8da4358323e48e6ef2b109f`.
Status: active. Public operations remain held.

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
`merged-review/`; corrected stream/merged review and gates follow.

## Finite deferred validation limits

The existing global story-play invocation can be replaced with a no-op while its
corpus remains green. This is recorded as one deferred runner item outside the
approved two-family scope. Newly touched play bodies have independent collapse
controls; real browser and fresh consumer journeys supplement the runner. The
host-only unit focus inventory also cannot prove every SVG descendant; isolated
actual SVG paint checks do. No broader guard project is started by this batch.
