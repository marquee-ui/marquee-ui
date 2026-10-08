# TABLE-1 — semantic composable tables

Batch: BATCH-PARITY-6. Status: independent review closed; stream gate pending. Stream port 4192;
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
scanned: 10 library names plus 5 story exports; sibling CROSS consumers: 0; unowned behaviors: 0. All shared consumers
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

The reviewer enumerated the five story exports too: Default, Empty, HeaderGroups,
Composed and FocusableParts. Their true consumers are the registered story namespace
and Storybook; lexical common-name hits in other stories are not imports of this
family. No sibling API contract changes were required.

Coordinator follow-up identified two additional consumers:
`packages/ui/test/client-boundary.test.ts` walks the native source modules and
`packages/ui/test/entry-point.test.ts` reads the public barrel. Both were read and explicitly run for Table
(`s2/index-consumers.log`). Table imports no client-only React hook, spends no client
directive and exports all nine runtime parts plus TableContainerProps through the
barrel. The shared story inventory title correction landed at coordinator commit
`865d0b7`; no behavior changed.

## Layer 1 (reviewer, detached worktree of 2d247b2308a44132be7cf7029f1400eb79e72ff3, slot r6)

| file                                    | test                                                                                                                         | mutation applied                                                                                                | red / GREEN                                              | what it asserts now                                                                                                                                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| packages/ui/test/table.test.tsx         | renders a native named table without an implicit wrapper, preserving scopes, spans and footer                                | M01: all nine part exports return null; M04: remove native attributes, refs and events while retaining children | red in both; each runner 5 failed (5)                    | Caption names the native TABLE; direct native children and forwarding: missing rowspan 2 under M04.                                                                                                                                                                              |
| packages/ui/test/table.test.tsx         | empty content is a real caller-owned cell spanning the columns                                                               | M01: all nine part exports return null; M04: remove native attributes, refs and events while retaining children | red in both; each runner 5 failed (5)                    | Caller-owned native TD/colSpan: missing colspan 2 under M04.                                                                                                                                                                                                                     |
| packages/ui/test/table.test.tsx         | the explicit scroll container keeps a caption-linked name, keyboard entry, native props and ref                              | M01: all nine part exports return null; M04: remove native attributes, refs and events while retaining children | red in both; each runner 5 failed (5)                    | Named region, keyboard entry, native forwarding and ref: null ref under M04.                                                                                                                                                                                                     |
| packages/ui/test/table.test.tsx         | every semantic part slots the caller's native host, merging refs, classes, attributes and events                             | M01: all nine part exports return null; M04: remove native attributes, refs and events while retaining children | red in both; each runner 5 failed (5)                    | Native hosts, refs and Slot composition: M03 gets DIV instead of SECTION; M04 null parent ref. Shared event spies had an additional M12 gap below.                                                                                                                               |
| packages/ui/test/table.test.tsx         | native refs and events reach the table host and row selection stays caller-owned                                             | M01: all nine part exports return null; M04: remove native attributes, refs and events while retaining children | red in both; each runner 5 failed (5)                    | Native TABLE/TR refs and caller state: null table ref under M04; no library selection control.                                                                                                                                                                                   |
| packages/ui/test/table.test.tsx         | every semantic part slots the caller's native host, merging refs, classes, attributes and events                             | M03: ignore every asChild switch                                                                                | red; 1 failed / 4 GREEN                                  | table-container: expected 'DIV' to be 'SECTION'; other native-only tests appropriately survive.                                                                                                                                                                                  |
| packages/ui/test/table-focus.test.tsx   | each optionally focusable native host owns compiled focus independently of docs CSS                                          | M02: collapse shared focus utility string to empty                                                              | red; 1 failed (1)                                        | table-container paints solid focus: expected [] to include 'solid'; baseline loop reads compiled solid/2px/primary-ink on all nine hosts.                                                                                                                                        |
| packages/ui/stories/table.stories.tsx   | table/Default                                                                                                                | M05: all nine part exports return null; run through stories.test.tsx                                            | red; 5 failed / 230 filtered skips                       | Named native table is absent; M06 also detects action remaining none; M07 detects aria-pressed remaining true.                                                                                                                                                                   |
| packages/ui/stories/table.stories.tsx   | table/Empty                                                                                                                  | M05: all nine part exports return null; run through stories.test.tsx                                            | red; 5 failed / 230 filtered skips                       | Pending invoices named table is absent; play also pins real empty cell colspan and TBODY.                                                                                                                                                                                        |
| packages/ui/stories/table.stories.tsx   | table/HeaderGroups                                                                                                           | M05: all nine part exports return null; run through stories.test.tsx                                            | red; 5 failed / 230 filtered skips                       | Quarter columnheader is absent; play also pins rowspan, colgroup colspan/scope, row scope, headers and footer.                                                                                                                                                                   |
| packages/ui/stories/table.stories.tsx   | table/Composed                                                                                                               | M05: all nine part exports return null; run through stories.test.tsx                                            | red; 5 failed / 230 filtered skips                       | Composed invoices named region is absent; M06 also detects action remaining closed.                                                                                                                                                                                              |
| packages/ui/stories/table.stories.tsx   | table/FocusableParts                                                                                                         | M05: all nine part exports return null; run through stories.test.tsx                                            | red; 5 failed / 230 filtered skips                       | table-container is a connected focus host assertion receives null; all nine opted-in native hosts are checked.                                                                                                                                                                   |
| packages/ui/stories/table.stories.tsx   | table/Default; table/Composed                                                                                                | M06: caller action setters become no-ops                                                                        | red; 2 failed / 3 GREEN / 230 filtered skips             | Default output remains none instead of INV-102; Composed output remains closed instead of opened. Empty, HeaderGroups and FocusableParts are unrelated survivors.                                                                                                                |
| packages/ui/stories/table.stories.tsx   | table/Default                                                                                                                | M07: caller selection setter becomes no-op                                                                      | red; 1 failed / 234 filtered skips                       | After click aria-pressed is true instead of false; caller selection state change is observed.                                                                                                                                                                                    |
| packages/ui/test/focus-outline.test.tsx | finds every part that draws a focus ring, and knows which ones are short                                                     | M08: remove shared table focus classes                                                                          | red; 1 failed / 20 GREEN                                 | Exact inventory loses table.tsx (focus-visible); unrelated/preexisting focus instrument tests survive by name in appendix.                                                                                                                                                       |
| packages/ui/test/registry.test.ts       | entire 19-test registry suite                                                                                                | M09: delete table item from root registry without regenerating the committed output                             | red; 8 failed / 11 GREEN                                 | Family/source inventory, 34-file/dependency counts, built item inventory and byte identity detect disappearance. Unrelated parser/dependency tests survive by name in appendix.                                                                                                  |
| packages/ui/test/stories.test.tsx       | covers all thirty-one part families, with every story counted; runs all 171 play functions, and knows if one stopped running | M10: delete table from shared STORY_SUITES map                                                                  | red; 2 failed / 227 GREEN                                | Inventory loses table; declared plays expected 171 receive 166. Five table plays are no longer collected; other 227 tests are survivors listed by name in appendix.                                                                                                              |
| apps/docs/test/explorer.test.tsx        | keeps every family discoverable and resets preview state when switching                                                      | M11: delete Table catalog item                                                                                  | red; 1 failed / 1 GREEN                                  | Preview inventory expected 32 receives 31. selects a family, renders its real preview and exposes its composition is the unrelated survivor.                                                                                                                                     |
| packages/ui/test/table.test.tsx         | every semantic part slots the caller's native host, merging refs, classes, attributes and events                             | M12 at original 2d247b2: delete only TableHead parent onClick                                                   | GREEN; 5 passed (5); FINDING                             | Ancestor bubbling into one shared parent spy satisfies table-head parent event despite the target host losing its handler. Closed at c47073d below.                                                                                                                              |
| apps/docs/browser/table.spec.ts         | Table preserves native semantics and keyboard scrolls to a real last-column action without page overflow                     | M13: preventDefault on ArrowRight in TableContainer; rebuild root/docs/Storybook/site                           | red mobile + desktop; tablet GREEN (2 failed / 1 passed) | Predicted native scroll assertion receives 0 vs >=333 mobile / >=219 desktop, before helper repair. Tablet has no overflow and correctly skips horizontal scrolling. Actual layout differs from the provisional project prediction in landed file; no forced premise correction. |
| apps/docs/browser/table.spec.ts         | Table grouped headers and every asChild host retain native structure and caller actions outside docs CSS                     | M14: TableHead drops rowSpan; rebuild root/docs/Storybook/site                                                  | red all 3 projects; 3 failed                             | Quarter expected rowspan 2 receives absent at line 172; mutation retains content, grouping and events.                                                                                                                                                                           |
| apps/docs/browser/table.spec.ts         | Table hosts paint isolated focus and selected rows in dark, light and forced colors                                          | M15: remove shared table focus string; rebuild root/docs/Storybook/site                                         | red all 3 projects; 3 failed                             | table-container focus style expected solid receives auto at line 249. Baseline independently checks all nine hosts in dark/light/forced colors.                                                                                                                                  |
| apps/docs/browser/table.spec.ts         | Table hosts paint isolated focus and selected rows in dark, light and forced colors                                          | M16: remove only selected background utility; rebuild root/docs/Storybook/site                                  | red all 3 projects; 3 failed                             | selected row has opaque token paint expected 1 receives 0 at line 288. State attributes and caller actions remain present.                                                                                                                                                       |
| apps/docs/browser/table.spec.ts         | Table example source is highlighted and copied byte for byte                                                                 | M17: omit clipboard write while retaining success message; rebuild root/docs/Storybook/site                     | red all 3 projects; 3 failed                             | Clipboard equality at line 315 receives empty string instead of exact example; displayed source/highlighting and misleading success remain intact.                                                                                                                               |
| packages/ui/test/table.test.tsx         | every semantic part slots the caller's native host, merging refs, classes, attributes and events                             | M18 at c47073d: delete only TableHead parent onClick again                                                      | red; 1 failed / 4 GREEN; CLOSED                          | table-head parent event reaches its own host: expected vi.fn() to be called 1 times, but got 0 times; restored 5 passed (5).                                                                                                                                                     |
| packages/ui/test/table.test.tsx         | every semantic part slots the caller's native host, merging refs, classes, attributes and events                             | M19 at c47073d: clone only TableHead slotted child with child onClick removed                                   | red; 1 failed / 4 GREEN                                  | table-head child event reaches its own host: expected vi.fn() to be called 1 times, but got 0 times; parent handler remains. Restored 5 passed (5).                                                                                                                              |

Nineteen controls were actually run in the fresh detached review tree. One fully
GREEN mutation (M12) exposed the shared-spy event gap; it was fixed at `c47073d`.
The same parent-handler drop now fails the exact host event assertion, and a separate
child-handler drop also fails its exact host assertion. Both independently restore
to 5/5 green. The author also ran the committed fix's predicted parent-handler red
and restore; retained evidence is `s2/event-fix-red.log` and
`s2/event-fix-restored.log`. Source implementation did not change during this fix.

Every partial GREEN survivor in the table is unrelated to its control: four native
non-slot tests under M03; Empty/HeaderGroups/FocusableParts under M06; unrelated focus
instrument checks under M08; unaffected registry checks under M09; other families
under M10; existing preview interaction under M11; the tablet layout with no overflow
under M13; and four unrelated native tests under M18/M19. Exact surviving test names
are retained in the full report's appendix. No owned mutated behavior remains GREEN
without a closure.

Independent final restored checks at `c47073d` passed root build, 281 UI tests across
5 files, 2 explorer tests and 12 browser cases across all projects (17.5s). The reviewer
removed its clean detached worktree. Original mutation logs, landed diffs, restored
proofs, traces, captures and complete report remain at
`/home/ankit/.marquee-scratch/BATCH-PARITY-6/r6/report.md`. Findings: 0 HIGH / 1 MEDIUM
(closed) / 0 LOW; no unresolved product finding, REQUEST or OWED probe.

## Stream gate: original retained failure

`DOCS_PORT=4192 pnpm verify` at committed `1baf14c2953279dd941567210591ea41b34cc60e`
exited 1 on 2026-10-08, 12:12:16–12:17:52 IST (5m36s). Runner summaries: 56 library
files / 928 tests passed, 4 docs files / 39 tests passed, 5 consumer tests passed;
browser 267 passed / 3 failed (5.1m). All three reds are the same coordinator-owned
`apps/docs/browser/site.spec.ts:133` inventory assertion, expected 31 preview buttons
while the new family correctly exposes 32. Table's 12 browser cases passed, and the
inherited nested Dialog/Sheet Escape failure did not recur.

Original evidence remains unchanged at
`/home/ankit/.marquee-scratch/BATCH-PARITY-6/s2/verify.log`, with `verify.exit`,
`verify.source`, `verify.started`, `verify.finished` and `full-browser/`. The source
and all test files stayed frozen until its runner exited.

The omitted shared browser consumer was reported immediately to its coordinator,
who corrected the count to 32 and added an independent native Table preview selector
at `e6118b7361308ed3532965302f1b9206078bc793`. This is an additional consumer of the
Table docs preview, catalog registration and Storybook default link. The coordinator
explicitly authorized one repeat full gate after the existing independent reviewer
proves the added preview assertion red under a Table-only preview collapse and green
after restoration. That control keeps the 32-family count correct, so it must fail
at the named Table-parts assertion rather than a count mismatch.
