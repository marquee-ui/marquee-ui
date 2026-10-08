# CALENDAR-1 — composable Calendar

Batch: BATCH-PARITY-5. Status: active; unreleased.
Stream port 4192; reviewer 4196.

## Scope

Use maintained DayPicker 10 through its preferred `@daypicker/react` package.
Preserve typed single/multiple/range modes, controlled selection and month state,
uncontrolled navigation, disabled/hidden date matchers, range bounds, keyboard grid
movement and selection, accessible day names/selected/disabled states, month navigation,
caller labels/locale/formatters and replaceable component slots. Expose styled day and
navigation parts where useful; preserve DayPicker focus and event/ref props through
composition. Do not render data/config arrays to invent component structure.

Prove 44px day and navigation targets and a seven-day grid that fits 390px. Multi-month
layouts must stay within the viewport (stack on small screens); measure full range
paint and selected text/outline. Caller-owned footer announcements and reset/state are
explicit. Native date input, popup DatePicker, alternate calendar systems, time selection
and exhaustive timezone/locale coverage belong to later/deferred work. DatePicker is Batch6.

Primary sources checked 2026-10-08: [shadcn Calendar](https://ui.shadcn.com/docs/components/radix/calendar),
[DayPicker v10](https://daypicker.dev/upgrading),
[custom slots](https://daypicker.dev/guides/custom-components) and
[keyboard/accessibility](https://daypicker.dev/guides/accessibility).
`npm view @daypicker/react version dependencies --json`: 10.0.2, wrapping react-day-picker
10.0.2. Use current v10 keys, not removed v9 compatibility aliases. No upstream CSS
with literal colors; style through role classes and slots.

## Execution and ownership

Test first, implement, commit, obtain a fresh independent detached layer-1 review,
close findings, then run one full stream `pnpm verify`. Node 22.18.0 / pnpm 10.24.0.
No Pile database, Steam or shots commands. Public operations remain held.
The orchestrator owns dependencies/lockfile, exports, source/story/focus inventories,
registry/generated files, counts, catalog, guide and STATUS. Request wiring once
source, stories and example stabilize; include exact exports and story/play counts.
You are not alone in this repository; preserve others' edits and do not revert them.

Keep strict types, role-only styles and meaningful story plays. Measure actual
44px controls, keyboard/pointer outcomes and visible selected/focus paint outside
docs CSS, at 390/768/1280 in dark/light/accent/forced colors. Measure outline style,
width, contrast against the actual exterior surface and effective ancestor visibility.
Use live connected DOM and real focus/listener/animation/hit readiness. Inspect
complete canvases, including controls below the fold. Copyable examples use registry aliases.

The independent reviewer mutates a committed detached copy and runs collapse/no-op
controls across every touched test file; verify each mutation landed and failed at
the predicted assertion, then restore. Copy its table and closures into this record.
Any proposed negative control in this brief is UNVERIFIED until run.

Own only `packages/ui/src/calendar.tsx`, `packages/ui/stories/calendar.stories.tsx`,
`packages/ui/test/calendar*.test.tsx`, `apps/docs/src/examples/calendar.tsx`,
`apps/docs/browser/calendar.spec.ts` and this slice record.
