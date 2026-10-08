# DATA-TABLE-1 — composed client data table

Batch: BATCH-PARITY-7. Status: implementation review. Stream port 4191; reviewer 4195.

## Supported contract

Use maintained TanStack React Table 9.2.6 with the existing native Table family.
Caller creates the instance and owns data/columns/feature registration and state.
Expose small composed presentation/render slots; sorting, text filter and page
controls are explicit caller composition. Preserve native table semantics, caption,
scopes, caller refs/events/content, accurate sort announcements and empty-state spans.
No hidden toolbar, schema inference, row-click navigation or responsive card transform.
Demonstrate finite client sorting/filtering/pagination and labeled cell actions.

Defer server data, virtualization, editing, selection management, column sizing/order,
aggregation and export. No drop-in shadcn API parity claim. Follow the batch's primary
references and token, 44px and explicit native keyboard-scroll rules.

## Ownership and execution

Own `packages/ui/src/data-table.tsx`, `packages/ui/stories/data-table.stories.tsx`,
`packages/ui/test/data-table*.test.tsx`, `apps/docs/src/examples/data-table.tsx`,
`apps/docs/browser/data-table.spec.ts` and this record. Coordinator owns dependencies,
exports/maps/counters/registry/generated output/catalog/guide/status. You are not alone
in the codebase; do not revert others' edits. Ask for wiring once exports stabilize.

Tests first; meaningful observable plays and 390/768/1280 browser interactions.
Before/after consumer scan of names and files. Verify isolated focus/sort/empty paint
in dark/light/forced colors, pointer floors and native horizontal keyboard scroll
before helpers. Include a cell action composed with an existing overlay.

Commit before one fresh independent detached reviewer runs landed collapse/no-op
mutations over every touched test file. Require the predicted assertion red and git
restoration, document any surviving tests honestly, and close findings before one
full `DOCS_PORT=4191 pnpm verify`. Request gate launch clearance to avoid contention.
Scratch `/home/ankit/.marquee-scratch/BATCH-PARITY-7/s1/`; Node22.18.0/pnpm10.24.0.
No public operations, version bump or Pile work. Browser builds in fresh review copies
are authorized. Build before tests; root Vitest is the runner.

## Implemented contract and evidence

Five parts: `DataTable` is the native compositional root; `DataTableHeader` maps
header groups through a required native-header slot; `DataTableBody` maps the current
row model through a required row slot and explicit empty content; `DataTableEmpty`
spans the caller's visible leaf columns with a minimum of one; `DataTableSortButton`
announces its controlled direction. The enclosing native header owns `aria-sort`.
Render helpers forward their native thead/tbody refs and events; root, empty cell and
sort action also support `asChild`. No state, toolbar or scroll wrapper is injected.

The caller recipe registers TanStack v9 features/functions/models, owns controlled
sorting/filter/pagination, and uses the default reactive `useTable` selector.
Column visibility is registered only to read visible cells/leaf counts; no visibility
manager is provided. Four stories/plays cover client behavior, empty data, grouped
headers and native-host composition. The example composes labeled DropdownMenu
cell actions and explicit filter/page controls.

Primary API references: TanStack [instances](https://tanstack.com/table/latest/docs/guide/tables)
and [React state](https://github.com/TanStack/table/blob/main/docs/framework/react/guide/table-state.md)
and shadcn's [v9 recipe](https://ui.shadcn.com/docs/components/data-table), checked
2026-10-08. The exported v9 types preserve feature/data inference without casts.

Measured in Chromium at 390px on 2026-10-08: native ArrowRight reached the last
column before any control focus/helper. Subsequent Tab traversal through the two
sort controls left the cell action at scrollLeft 236, right edge 401.1px while the
region ended at 348px. The caller action now explicitly reveals itself on focus;
scroll margin preserves its whole focus boundary as well as the 88-by-44 target.
This behavior belongs to the recipe, rather than the native Table family. The
original image remains at `s1/action-diagnostic.png` in batch scratch.

Before/after consumer-source scan (`git grep` at base eea61a3; `rg -l` after changes,
2026-10-08) found zero prior names and only the expected new source/story/example,
barrel and catalog uses. Evidence: `s1/consumer-source-scan.json` in batch scratch.
Independent review, mutation controls and the complete stream gate are pending.
