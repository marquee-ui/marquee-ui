# DATA-TABLE-1 — composed client data table

Batch: BATCH-PARITY-7. Status: reviewed; gate pending. Stream port 4191; reviewer 4195.

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

## Independent review

Fresh detached review at `4e46611951d5a933dc25479349c34ed120756553`, 2026-10-08:
no substantive findings. Build, typecheck and an independent generic inference probe
passed. Healthy and restored focused runs passed 291 UI, 2 explorer and 24 browser
cases. Reviewer inspected native scrolling/action focus at 390/768/1280 and isolated
dark/light/forced-colors paint. All mutations landed, failed their predicted property
where applicable, and were restored from git; the detached tree ended clean.

| Touched test             | Landed control and actual verdict                                                                                                    | Surviving cases                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `data-table.test.tsx`    | Body collapsed: 4 failed / 2 passed                                                                                                  | Root composition and sort-control contracts                                                |
| `stories.test.tsx`       | Body collapsed: 4 failed / 241 passed; Composed handler no-op: 1 failed / 4 passed / 240 skipped                                     | Composed survives body collapse; the other three plays survive the targeted Composed no-op |
| `registry.test.ts`       | Stale content: 1 failed / 18 passed; absent TanStack dependency: 3 failed / 16 passed; absent Table dependency: 4 failed / 15 passed | Other metadata/source contracts                                                            |
| `focus-outline.test.tsx` | Sort focus classes removed: 1 failed / 20 passed                                                                                     | Other focus contracts                                                                      |
| `explorer.test.tsx`      | Preview collapsed: 2 passed; catalog entry removed: 1 failed / 1 passed                                                              | Preview behavior is covered in the browser; Switch interaction survives entry removal      |
| `site.spec.ts`           | Preview collapsed: 3 failed / 9 passed                                                                                               | Other site checks at all three widths                                                      |
| `data-table.spec.ts`     | Body collapsed: 9 failed / 3 passed; no action onFocus: 1 failed; no scroll margin: 1 failed                                         | Source-copy cases survive body collapse                                                    |

The separate mobile controls reproduced the pointer-hit failure and the exterior
outline failure (354.109375px beyond a 348px boundary). Both run
`DOCS_PORT=4195 pnpm --filter @marquee-ui/docs exec playwright test browser/data-table.spec.ts --project=mobile -g 'client sorting'`
after rebuilding docs/site. Focused runner commands, mutation diffs, assertion messages,
case names and screenshots are recorded in batch scratch `r5/review.json` and
`r5/mutation-survivors.json`. Healthy browser command:
`DOCS_PORT=4195 pnpm --filter @marquee-ui/docs exec playwright test browser/data-table.spec.ts browser/site.spec.ts`.
The complete stream gate remains pending.
