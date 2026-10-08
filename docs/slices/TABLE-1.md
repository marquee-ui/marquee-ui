# TABLE-1 — semantic composable tables

Batch: BATCH-PARITY-6. Status: implementation ready for independent review. Stream port 4192;
reviewer port 4196.

## Scope and contracts

Provide Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell and
TableCaption over native table semantics, with explicit composable scroll-container
part if needed. Preserve refs, native attributes, className, header scopes and spans,
caption naming and caller-owned content/state. Support safe asChild composition that
retains caller semantic obligations. Role tokens only. Do not introduce data arrays,
column config, sorting/filtering/pagination engines or automatic responsive cards;
DataTable belongs to Batch 7. A row's selected appearance does not imply selection logic.

At 390px a wide table must scroll within its named keyboard-operable container without
page overflow. Native table structure and header/cell associations remain intact.
Do not turn rows into buttons; callers compose real labeled 44px controls in cells.
Prove scroll behavior using the keyboard before any helper repairs scroll, then reach
and activate the last-column action. Test captions, footers, empty-state colSpan,
row headers, composition/refs/events and selected/focus paint in dark/light/forced colors.

Primary sources checked 2026-10-08: [shadcn Table](https://ui.shadcn.com/docs/components/radix/table).
Native HTML semantics determine behavior; explicitly document differences from its
implicit wrapper. No new dependency is expected beyond existing Slot and utilities.

## As built

Nine parts render native hosts: TableContainer (`div`), Table (`table`), TableHeader
(`thead`), TableBody (`tbody`), TableFooter (`tfoot`), TableRow (`tr`), TableHead (`th`),
TableCell (`td`) and TableCaption (`caption`). All support `asChild`, native props,
refs, classes and events. A slotted custom component must forward these onto the
corresponding native element; replacing a row/cell with an interactive element is
invalid. Actual controls belong inside cells. No tree inspection or client context
is needed for these static parts.

Table has no implicit wrapper. Compose TableContainer when scrolling is required;
it has a region role, a default tab stop and a required `aria-label` or
`aria-labelledby` in its TypeScript props. Keep the name meaningful and unique in
context. Native ArrowLeft/ArrowRight behavior scrolls the region; there is no
JavaScript keyboard handler or table interaction engine. Callers can override
native props, and therefore own the resulting accessibility obligations.

TableRow only paints `data-state="selected"`: no click handler, focusability,
`aria-selected`, selection model or data engine is introduced. The example's button
owns its `aria-pressed` state and row paint. Selected rows use the primary-muted role;
forced colors adds an inset outline so selection remains visible without relying on
background color. Every host owns a 2px inset focus outline in the primary-ink role,
which keeps the drawing within a clipped scroll boundary when callers opt a host
into focus.

Five stories/five plays: Default, Empty, HeaderGroups, Composed and FocusableParts.
The only source dependency is existing `@radix-ui/react-slot`, plus the registry's
utils edge. The docs composition consumes Button and Table. Coordinator wiring is
committed separately at `6fb2a35`.

Sources verified in this stream on 2026-10-08: [native table semantics](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table)
and [keyboard accessibility of scroll containers](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow#accessibility).

## Tests first and focused verification

The native structure, caption naming, header scopes/spans, row headers, footer,
empty-state colSpan, slotted hosts/refs/events and caller-owned selection tests were
written before source implementation. The initial root Vitest run failed because
`../src/table` did not exist (`s2/tests-first.log`); this was an admission red, not an
assertion-level mutation proof. Independent review supplies the latter.

After implementation, root targeted Vitest passed 6 table tests across 2 files.
The story-runner-inclusive check passed 241 tests across 3 files. Both runner outputs
are retained under `/home/ankit/.marquee-scratch/BATCH-PARITY-6/s2/`.

The first focused browser run reported 6 passed / 6 failed. Its original log and
traces remain in `table-browser.log` and `browser/`. The failures were two unmeasured
probe premises, not product findings: sampling 3px diagonal corners falls outside
the existing Button's 10px corner radius, and forced-colors focus ink can have 0.8
alpha. The pointer check now samples four edge midpoints plus the center; the alpha
check requires visible alpha while retaining actual composited exterior contrast
of at least 3:1, ancestor visibility, effective opacity, solid style and 2px width.

The corrected `DOCS_PORT=4192 pnpm --filter @marquee-ui/docs test:browser
browser/table.spec.ts` run passed all 12 tests across mobile/tablet/desktop (16.5s,
2026-10-08; `table-browser-corrected.log`). It proves native horizontal keyboard
scrolling before any control scroll helper, final-column keyboard activation and
real 44px pointer targets without page overflow. Isolated Storybook tests cover all
nine focus hosts, row state/paint in both presets and forced colors, grouped scopes,
asChild native semantics and exact source copying. Complete first/final-column mobile
captures were inspected; focus and selected-state captures are retained per preset.

## Consumers

Before implementation, `git grep` of all nine planned component names plus
TableContainerProps across packages/apps returned no hits at base `07c3f18`.
Path/basename scans for table source/stories returned none. This introduces a new
family, replaces no implicit/native role, and changes no route. Existing native
table behavior remains caller-owned.

After implementation, `rg` of each exported name across packages/apps (only TS/TSX)
found this exact set of consumer paths:

- TableContainerProps: `packages/ui/src/index.ts`, `packages/ui/src/table.tsx`.
- TableContainer, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell
  and TableCaption: source/index, table stories, both table unit files and the docs
  table example.
- Table additionally: `apps/docs/browser/table.spec.ts`, `apps/docs/src/catalog.ts`.
- `table.tsx`: `registry.json`, `packages/ui/r/registry.json`,
  `packages/ui/r/table.json`, `packages/tokens/test/helpers/source-files.ts`,
  `packages/ui/test/focus-outline.test.tsx` and the browser source-copy test.
- `table.stories.tsx`: `packages/tokens/test/helpers/source-files.ts`.
- Distinctive changed focus/state classes: source and `packages/ui/r/table.json` only.

The full command output is retained at `s2/consumer-after.txt`. Exported names
scanned: 10; sibling CROSS consumers: 0; unowned behaviors: 0. All shared consumers
were sent to and wired by the coordinator. Read the shared focus-site invariant,
registry inventory, source inventory and catalog registrations before the commit.
Generic story-map, compile, target-floor and registry byte checks consume the new
family through coordinator-owned registration; they run in the full gate.

## Ownership and execution

Own only `packages/ui/src/table.tsx`, `packages/ui/stories/table.stories.tsx`,
`packages/ui/test/table*.test.tsx`, `apps/docs/src/examples/table.tsx`,
`apps/docs/browser/table.spec.ts` and this document. Other behavior is consumed.
The coordinator owns manifests, lockfile, exports, inventories, story maps/counters,
registry/generated files, catalog/guide/counts and STATUS. Request wiring when files
and exports stabilize; supply exact stories/plays and dependency edges.
You are not alone in the codebase; preserve others' edits and do not revert them.

Tests first; meaningful observable story plays, focused unit and 390/768/1280 browser
behavior. Prove actual per-host focus paint outside docs CSS, including style, width,
color/alpha and ancestor visibility against the exterior surface. Exercise light/dark,
forced colors where relevant and real pointer/focus readiness. Capture/inspect complete
examples including offscreen controls. Run consumer scans before/after and retain here.

Commit before a fresh independent detached reviewer mutates. Reviewer must actually
run collapse/no-op controls over every touched test file, confirm mutations landed and
failed at predicted assertions, restore, and write its full table. Fresh detached
browser builds are authorized for this Marquee review (no Pile build/database rule).
Close findings before ONE full stream `DOCS_PORT=4192 pnpm verify`, with logs/source/exit
sentinels under `/home/ankit/.marquee-scratch/BATCH-PARITY-6/s2/`; request launch clearance
to avoid heavy-run contention. Node 22.18.0/pnpm 10.24.0. Build before tests; package-only
test is a no-op. No Pile DB/Steam/shots operations. No public operations.
