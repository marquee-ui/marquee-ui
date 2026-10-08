# DATA-TABLE-1 — composed client data table

Batch: BATCH-PARITY-7. Status: planned. Stream port 4191; reviewer 4195.

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
