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

## Implementation and limits

`CalendarProps` is DayPicker's unmodified discriminated union. `Calendar` exposes
all upstream replacement slots and class/style, locale, formatter, label, matcher,
selection and month props. `CalendarRoot`, `CalendarDayButton` and
`CalendarNavigationButton` are styled replaceable parts with native refs/events;
the day part retains roving keyboard focus. Navigation at a month bound is natively
disabled. No upstream CSS is imported.

The inclusive range paints complete cells, with framed endpoints and contiguous
muted action fill; the same role fill keeps an external focus outline visible next
to a selected neighbor. The two-month calendar wraps complete seven-column grids.
Footer announcements and reset belong to the caller. The copyable example renders
single, multiple and range selections and a reset that clears selections/months.

Measured DayPicker 10 semantics: a click beyond multiple `max` starts a new one-date
selection; a too-short or too-long range starts a new open range; `excludeDisabled`
resets a range crossing a disabled day. Weekday headers are visually labeled but
upstream hides their row from assistive technology because each day has a full
accessible date name. Preserve these behaviors rather than claiming a rejecting
maximum, a kept too-short range, or an exposed weekday header row.

The wrapper is inline Gregorian UI, with no hidden native date input or automatic
form transport. Popup DatePicker, alternate calendar systems, time selection and
exhaustive timezone/locale support remain deferred. Locale passthrough is exercised
with French, and custom day/caption/navigation labels/formatters are tested.
Animations remain caller-owned DayPicker styles; no animation CSS is supplied.

## Consumers

Before source work, at `be5a163`, this command had no matches (exit 1):

```text
rg -n 'Calendar|calendar|DayPicker|day-button|calendar-navigation' apps packages --glob '*.ts' --glob '*.tsx' --glob '*.json'
(no matches)
```

After source and coordinator wiring, `rg -l '\bNAME\b' apps packages --glob '*.ts'
--glob '*.tsx' --glob '*.json'` over the seven exported names produced:

```text
CalendarProps: packages/ui/src/calendar.tsx, packages/ui/src/index.ts, packages/ui/test/calendar.test.tsx, packages/ui/r/calendar.json
CalendarDayButtonProps: packages/ui/src/calendar.tsx, packages/ui/src/index.ts, packages/ui/r/calendar.json
CalendarRootProps: packages/ui/src/calendar.tsx, packages/ui/src/index.ts, packages/ui/r/calendar.json
CalendarRoot: packages/ui/src/index.ts, packages/ui/src/calendar.tsx, packages/ui/stories/calendar.stories.tsx, packages/ui/r/calendar.json, packages/ui/test/calendar.test.tsx
CalendarDayButton: packages/ui/src/calendar.tsx, packages/ui/src/index.ts, packages/ui/stories/calendar.stories.tsx, packages/ui/test/calendar.test.tsx, packages/ui/r/calendar.json
CalendarNavigationButton: packages/ui/src/calendar.tsx, packages/ui/stories/calendar.stories.tsx, packages/ui/src/index.ts, packages/ui/r/calendar.json, packages/ui/test/calendar.test.tsx
Calendar: apps/docs/browser/site.spec.ts, apps/docs/browser/calendar.spec.ts, apps/docs/src/examples/calendar.tsx, packages/ui/test/calendar.test.tsx, packages/ui/r/registry.json, apps/docs/src/catalog.ts, packages/ui/stories/calendar.stories.tsx, packages/ui/test/calendar-focus.test.tsx, packages/ui/r/calendar.json, packages/ui/src/index.ts, packages/ui/src/calendar.tsx
```

CROSS (coordinator-owned): index, catalog, registry/generated JSON, source/story
inventories, focus-outline inventory, registry/story count tests, docs explorer and
site count tests. Exact names, five stories/five plays, three data slots and story
ID `parts-calendar--default` were requested and wired by the coordinator. No route
or existing sibling family contract changed; no unowned behavior was introduced.
The new upstream grid/button/selected ARIA surface is covered by calendar unit,
story and browser assertions; shared story/tap/focus/registry sweeps were read and
run. No existing test pins the new literal class strings; generated Calendar JSON
consumes the source bytes and is refreshed by the coordinator.

## Focused evidence and original failures

Commands on 2026-10-08 use Node 22.18.0 and pnpm 10.24.0. Scratch artifacts:
`/home/ankit/.marquee-scratch/BATCH-PARITY-5/s2/`.

- Initial missing-module test-first run exited 1 before Calendar existed; this is
  creation-order evidence, not a behavioral negative control.
- Initial nine-unit run: six passed/three failed on incorrect upstream assumptions
  about multiple max, too-short range and hidden weekday headers. Source inspection
  and corrected behavior assertions resolved the test instrument assumptions.
- `pnpm build` then root Vitest focused calendar, focus, registry, stories and
  focus-outline files: 269 passed, five files; UI and full workspace typecheck green.
- First mobile browser pass: four passed/one failed. Range day 12 focus contrast was
  actually 1:1 because the bright selected fill overrode the middle fill. Changed
  selection paint to muted role fill with framed endpoints; screenshots inspect the
  full mobile two-month canvas and full range bounds.
- Next browser run: 12 passed/three failed, all at forced-color outline alpha
  expected 1, received 0.8. Chromium's system Highlight is translucent. This was an
  instrument defect, not a product fix: the helper now composites outline alpha
  onto each actual exterior surface and retains the same 3:1 contrast requirement.
  Width >=2, solid style, ancestor visibility and effective opacity are also checked.
- Corrected isolated paint run: three passed (390/768/1280), 13.4s; covers dark,
  light, violet accent and forced colors, selected text >=4.5:1, complete range paint,
  day and navigation focus outside docs CSS. Original logs/trace artifacts retained.
