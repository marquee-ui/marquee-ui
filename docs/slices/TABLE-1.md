# TABLE-1 — semantic composable tables

Batch: BATCH-PARITY-6. Status: active. Stream port 4192; reviewer port 4196.

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
