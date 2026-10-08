# DATE-PICKER-1 — composed date selection

Batch: BATCH-PARITY-6. Status: active. Stream port 4191; reviewer port 4195.

## Scope and contracts

Provide an explicitly composed DatePicker family over the existing Calendar and
Popover. Own trigger/panel composition and example recipes for a single date and a
range; preserve typed Calendar selection modes, accessible names/descriptions,
44px controls, selection/disabled states, keyboard navigation, controlled open state,
Escape/outside dismissal and focus return. Caller owns selected dates, date formatting,
close-on-selection policy, presets, hidden form values and reset. Do not invent a
configuration object that renders structure, parse text dates, or add time/timezone
machinery. Explicit namespaced convenience parts may expose existing primitives;
document that current shadcn itself offers a composition recipe, not a DatePicker root.
An input-based date editor, natural-language parsing and automatic form transport are deferred.

Consume Calendar's existing discriminated types and minimum width (328px for its
standard seven-day frame). Default DatePicker content must fit that complete frame
inside the real 390px viewport with usable padding; prove root/grid/panel containment,
Saturday hit points and selection, including in Dialog. Never shrink 44px controls or
hide overflow to conceal geometry. Consume the compatible Radix generation unchanged.

Primary sources checked 2026-10-08: [shadcn Date Picker](https://ui.shadcn.com/docs/components/radix/date-picker),
[DayPicker inputs](https://daypicker.dev/guides/input-fields), and
[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover).

## Ownership and execution

Own only `packages/ui/src/date-picker.tsx`, `packages/ui/stories/date-picker.stories.tsx`,
`packages/ui/test/date-picker*.test.tsx`, `apps/docs/src/examples/date-picker.tsx`,
`apps/docs/browser/date-picker.spec.ts` and this document. Other behavior is consumed.
The coordinator owns manifests, lockfile, exports, inventories, story maps/counters,
registry/generated files, catalog/guide/counts and STATUS. Request wiring when files
and exports stabilize; supply exact stories/plays and dependency edges.
You are not alone in the codebase; preserve others' edits and do not revert them.

Tests first; meaningful observable story plays, focused unit and 390/768/1280 browser
behavior. Prove actual per-host focus paint outside docs CSS, including style, width,
color/alpha and ancestor visibility against the exterior surface. Exercise light/dark,
forced colors where relevant, nesting and real pointer/focus readiness. Do not repair
scroll before asserting it. Capture/inspect complete examples, including offscreen controls.
Run consumer scans before and after changes and retain them here.

Commit before a fresh independent detached reviewer mutates. Reviewer must actually
run collapse/no-op controls over every touched test file, confirm mutations landed and
failed at predicted assertions, restore, and write its full table. Fresh detached
browser builds are authorized for this Marquee review (no Pile build/database rule).
Close findings before ONE full stream `DOCS_PORT=4191 pnpm verify`, with logs/source/exit
sentinels under `/home/ankit/.marquee-scratch/BATCH-PARITY-6/s1/`; request launch clearance
to avoid heavy-run contention. Node 22.18.0/pnpm 10.24.0. Build before tests; package-only
test is a no-op. No Pile DB/Steam/shots operations. No public operations.
