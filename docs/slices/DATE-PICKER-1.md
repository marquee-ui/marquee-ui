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

## As built

The namespaced family reuses the installed Calendar and compatible Popover generation.
Eleven value exports and `DatePickerCalendarProps` keep the exact discriminated
Calendar contract; `DatePickerContent` changes only the default intrinsic width,
8px padding, alignment, offset and collision padding. No new npm dependency.
Current shadcn provides a composition recipe, not a DatePicker primitive root.

The four stories (`Default`, `Range`, `Disabled`, `NestedDialog`) each have a
meaningful play. Single-date closing, range completion, partial-range persistence,
formatting, hidden local-day form fields, submission and reset are caller code.
Closing keeps selection; reset clears it. The Dialog recipe explicitly chooses the
initial roving day in the cancelable `onOpenAutoFocus` callback after the nested
scope registers. Without that callback, a parent modal can intercept Calendar's
early focus effect and Popover's default focus goes to the first navigation button.
The library does not promise selected-day autofocus inside every parent overlay.

The standard frame fits horizontally at 390px without shrinking any 44px control.
The inherited Popover scroll region is deliberate when a centered Dialog leaves
less vertical space: tests observe its dimensions, use a real wheel, then hit-test
the final Saturday and Close. No target helper scrolls to conceal clipping.
Extra months, week numbers, replaced parts, text editing, parsing and time selection
remain outside the standard one-month recipe.

Focused evidence measured 2026-10-08 with Node 22.18.0/pnpm 10.24.0:
`pnpm exec vitest run --project ui packages/ui/test/date-picker.test.tsx
packages/ui/test/date-picker-focus.test.tsx packages/ui/test/stories.test.tsx`
passed 244 tests in three files (including six new composition tests, four new
compiled focus/sizing tests and four new story plays). After building current docs
and Storybook, `DOCS_PORT=4191 pnpm --filter @marquee-ui/docs test:browser
browser/date-picker.spec.ts` passed all 15 browser cases across 390/768/1280.
The checks cover real DOM selection/focus, disabled dates, Escape/outside dismissal,
form/reset policy, Saturday hits, full horizontal containment, nested wheel/Close,
light/dark/forced-colors focus paint, and exact highlighted/copied example bytes.
Complete examples and panel captures were inspected, including the nested lower
controls. Logs, traces, geometry/paint attachments and captures are retained under
`/home/ankit/.marquee-scratch/BATCH-PARITY-6/s1/`.

The first browser run exposed a measurement error: below a short Storybook body,
`elementFromPoint` resolves to transparent HTML while the browser paints the body's
background across the viewport. The paint probe now accounts for that propagation,
retaining the 3:1 exterior contrast bar. Original failure logs and the measured
focus event/paint probe remain in `browser-focused.log`, `focus-probe.jsonl` and
`body-propagation.png`. The second run's vertical containment premise incorrectly
forbade the inherited scroll region; the revised test proves actual wheel scrolling
and unobscured lower controls. No primitive contract or tolerance was changed.

## Consumers

Before implementation, the base scan used
`git grep -n -E '\bDatePicker\b|date-picker' 07c3f18d3782ab9aea3d45ea986ca356e87632a0 -- packages apps registry.json README.md docs/slices/DATE-PICKER-1.md`.
It found the planned slice paths and Calendar example's forward reference; no
DatePicker implementation/export consumer existed. The initial working-tree scan
also listed roadmap/guide forward references; the coordinator owns their wording.

```text
07c3f18d3782ab9aea3d45ea986ca356e87632a0:apps/docs/src/examples/calendar.tsx:87:        DatePicker and form date transport are separate compositions.
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:7:Provide an explicitly composed DatePicker family over the existing Calendar and
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:15:document that current shadcn itself offers a composition recipe, not a DatePicker root.
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:19:standard seven-day frame). Default DatePicker content must fit that complete frame
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:24:Primary sources checked 2026-10-08: [shadcn Date Picker](https://ui.shadcn.com/docs/components/radix/date-picker),
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:30:Own only `packages/ui/src/date-picker.tsx`, `packages/ui/stories/date-picker.stories.tsx`,
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:31:`packages/ui/test/date-picker*.test.tsx`, `apps/docs/src/examples/date-picker.tsx`,
07c3f18d3782ab9aea3d45ea986ca356e87632a0:docs/slices/DATE-PICKER-1.md:32:`apps/docs/browser/date-picker.spec.ts` and this document. Other behavior is consumed.
```

At the commit point, the symbol scan extracted all twelve exported names with
`export (const|type|function)` and ran `rg -l '\bNAME\b' packages apps --glob '*.ts'
--glob '*.tsx' --glob '!**/dist/**'` for each. Import/path, role/ARIA and literal-class
arms were also checked. Output:

```text
DatePicker: apps/docs/browser/date-picker.spec.ts, apps/docs/src/examples/date-picker.tsx, apps/docs/src/catalog.ts, packages/ui/src/index.ts, packages/ui/test/date-picker.test.tsx, packages/ui/stories/date-picker.stories.tsx, apps/docs/src/examples/calendar.tsx, packages/ui/src/date-picker.tsx, packages/ui/test/date-picker-focus.test.tsx
DatePickerTrigger: packages/ui/src/date-picker.tsx, packages/ui/src/index.ts, packages/ui/test/date-picker.test.tsx, packages/ui/test/date-picker-focus.test.tsx, packages/ui/stories/date-picker.stories.tsx, apps/docs/src/examples/date-picker.tsx
DatePickerPortal: apps/docs/src/examples/date-picker.tsx, packages/ui/test/date-picker.test.tsx, packages/ui/src/date-picker.tsx, packages/ui/src/index.ts, packages/ui/stories/date-picker.stories.tsx
DatePickerAnchor: packages/ui/src/index.ts, packages/ui/test/date-picker.test.tsx, packages/ui/src/date-picker.tsx
DatePickerArrow: packages/ui/src/date-picker.tsx, packages/ui/src/index.ts, packages/ui/test/date-picker.test.tsx
DatePickerClose: packages/ui/src/index.ts, apps/docs/src/examples/date-picker.tsx, packages/ui/src/date-picker.tsx, packages/ui/test/date-picker-focus.test.tsx, packages/ui/test/date-picker.test.tsx, packages/ui/stories/date-picker.stories.tsx
DatePickerHeader: apps/docs/src/examples/date-picker.tsx, packages/ui/stories/date-picker.stories.tsx, packages/ui/src/date-picker.tsx, packages/ui/test/date-picker.test.tsx, packages/ui/src/index.ts
DatePickerTitle: apps/docs/src/examples/date-picker.tsx, packages/ui/src/index.ts, packages/ui/src/date-picker.tsx, packages/ui/stories/date-picker.stories.tsx, packages/ui/test/date-picker.test.tsx
DatePickerDescription: apps/docs/src/examples/date-picker.tsx, packages/ui/test/date-picker.test.tsx, packages/ui/src/index.ts, packages/ui/stories/date-picker.stories.tsx, packages/ui/src/date-picker.tsx
DatePickerCalendar: apps/docs/src/examples/date-picker.tsx, packages/ui/src/index.ts, packages/ui/stories/date-picker.stories.tsx, packages/ui/test/date-picker.test.tsx, packages/ui/src/date-picker.tsx
DatePickerCalendarProps: packages/ui/src/date-picker.tsx, packages/ui/src/index.ts, packages/ui/test/date-picker.test.tsx
DatePickerContent: packages/ui/src/date-picker.tsx, apps/docs/src/examples/date-picker.tsx, packages/ui/test/date-picker.test.tsx, packages/ui/src/index.ts, packages/ui/stories/date-picker.stories.tsx, packages/ui/test/date-picker-focus.test.tsx
Path/import consumers: packages/tokens/test/helpers/source-files.ts, packages/ui/src/date-picker.tsx, packages/ui/src/index.ts, apps/docs/browser/date-picker.spec.ts, apps/docs/src/examples/date-picker.tsx, apps/docs/src/catalog.ts, packages/ui/test/date-picker-focus.test.tsx, packages/ui/test/registry.test.ts, packages/ui/test/date-picker.test.tsx, packages/ui/test/helpers/story-suites.ts, packages/ui/stories/date-picker.stories.tsx
Role consumers: existing Popover dialog/button and Calendar grid/gridcell roles unchanged; no aria contract replaced.
Class literal consumers: packages/ui/r/date-picker.json
```

Shared exports, registry bytes, source inventories, story suite/counters and docs
catalog/explorer count are CROSS to the coordinator and wired by it. Calendar's
existing docs forward reference remains consumed; no existing Calendar/Popover
role or behavior was changed. No sibling-owned consumer or unowned contract.
The twelve names are new; all implementation consumers are enumerated above.

Review consumer correction: the independent scan also found
`packages/ui/test/client-boundary.test.ts` and
`packages/ui/test/entry-point.test.ts`, both consuming the coordinator-touched
`src/index.ts`. Their first targeted run was **1 failed / 16 passed**: the boundary
guard correctly rejected the pure DatePicker aliases/JSX wrapper's unnecessary
`"use client"` directive. The wrapper imports only a React type and already-client
local parts; the directive was removed, leaving the existing guard unchanged.
These two consumers are now included in the final scan. The coordinator also
corrected the shared story-test title from thirty-one families to thirty-two.
