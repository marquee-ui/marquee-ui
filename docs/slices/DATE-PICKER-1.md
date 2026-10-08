# DATE-PICKER-1 — composed date selection

Batch: BATCH-PARITY-6. Status: complete. Stream port 4191; reviewer port 4195.

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

Eleven value exports plus `DatePickerCalendarProps` retain Calendar/Popover's
contracts; Content alone changes intrinsic width, 8px padding and default
positioning. No npm dependency was added. Current shadcn supplies a composition
recipe rather than a DatePicker primitive. Four stories/four plays demonstrate
single/range selection, disabled controls and Dialog nesting. The caller owns
formatting, selection, closing, partial-range persistence, hidden local-day fields,
submission and reset. Closing keeps dates; reset clears them.

A parent modal can intercept Calendar's early focus effect, leaving Popover's
first navigation button focused. The nested recipe explicitly chooses the roving
day through cancelable `onOpenAutoFocus` after the scope registers. Selected-day
focus inside every overlay is not a library promise. The complete 328px frame
fits horizontally at390; shorter vertical space intentionally scrolls. Tests
observe dimensions, use a real wheel, then hit-test Saturday31 and Close.

Measured 2026-10-08, Node22.18.0/pnpm10.24.0: focused Vitest date-picker,
date-picker-focus and stories files passed244 tests; adding the two export
consumers after boundary repair passed261 tests. Build-first focused browser
`DOCS_PORT=4191 pnpm --filter @marquee-ui/docs test:browser
browser/date-picker.spec.ts` passed15 cases over390/768/1280. Logs, complete
captures (inspected), traces and geometry/paint attachments live in
`/home/ankit/.marquee-scratch/BATCH-PARITY-6/s1/`.

Original failures/probes remain in `browser-focused.log`, `focus-probe.jsonl` and
`body-propagation.png`: transparent HTML outside a short Storybook body receives
the body's propagated canvas background. The corrected probe preserves exterior
contrast3, style/width/alpha and ancestor visibility. A later unsupported full
vertical-containment premise was replaced with actual wheel/hit proof of the
inherited scroll contract. No primitive or tolerance was changed.

## Consumers

Before implementation, the base scan used
`git grep -n -E '\bDatePicker\b|date-picker' 07c3f18d3782ab9aea3d45ea986ca356e87632a0 -- packages apps registry.json README.md docs/slices/DATE-PICKER-1.md`.
It found the planned slice paths and Calendar example's forward reference; no
DatePicker implementation/export consumer existed. The initial working-tree scan
also listed roadmap/guide forward references; the coordinator owns their wording.

Code consumer output (the slice's planned paths are omitted here; raw full
output remains in `s1/consumers-before.txt`):

```text
07c3f18d3782ab9aea3d45ea986ca356e87632a0:apps/docs/src/examples/calendar.tsx:87:        DatePicker and form date transport are separate compositions.
```

At the commit point, the symbol scan extracted all twelve exported names with
`export (const|type|function)` and ran `rg -l '\bNAME\b' packages apps --glob '*.ts'
--glob '*.tsx' --glob '!**/dist/**'` for each. Import/path, role/ARIA and literal-class
arms were also checked. Output:

The repeated path sets below use a mechanically generated path dictionary; IDs
expand to the exact paths scanned. Raw and compact scan outputs are retained in
`s1/consumers-after.txt` and `s1/consumers-after-compact.txt`.

```text
1=apps/docs/browser/date-picker.spec.ts
2=apps/docs/browser/site.spec.ts
3=apps/docs/src/catalog.ts
4=apps/docs/src/examples/calendar.tsx
5=apps/docs/src/examples/date-picker.tsx
6=packages/ui/src/date-picker.tsx
7=packages/ui/src/index.ts
8=packages/ui/stories/date-picker.stories.tsx
9=packages/ui/test/date-picker-focus.test.tsx
10=packages/ui/test/date-picker.test.tsx
DatePicker: 1,2,3,4,5,6,7,8,9,10
DatePickerTrigger: 5,6,7,8,9,10
DatePickerPortal: 5,6,7,8,10
DatePickerAnchor: 6,7,10
DatePickerArrow: 6,7,10
DatePickerClose: 5,6,7,8,9,10
DatePickerHeader: 5,6,7,8,10
DatePickerTitle: 5,6,7,8,10
DatePickerDescription: 5,6,7,8,10
DatePickerCalendar: 5,6,7,8,10
DatePickerCalendarProps: 6,7,10
DatePickerContent: 5,6,7,8,9,10
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

## Layer 1 (reviewer, detached worktree of 4182f106128a3541fff75e5acb0cfa224d86a9ef, slot 5)

```text
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/test/date-picker.test.tsx | retains Calendar's exact discriminated selection modes instead of widening them | M1: DatePickerCalendar returns null | red | AssertionError: expected [Function DatePickerCalendar] to be [Function Calendar] // Object.is equality |
| packages/ui/test/date-picker.test.tsx | composes a named portal, selected-day focus, disabled dates and caller-owned selection/close policy | M1: DatePickerCalendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 12(?:st / nd / rd / th), 2026/` |
| packages/ui/test/date-picker.test.tsx | preserves controlled open callbacks and canceled Escape/outside dismissal | M1: DatePickerCalendar returns null | GREEN | Open-state callback and cancellation forwarding, independent of Calendar rendering. |
| packages/ui/test/date-picker.test.tsx | dismisses on real outside interaction and preserves its focus | M1: DatePickerCalendar returns null | GREEN | Popover outside dismissal/focus, independent of Calendar rendering. |
| packages/ui/test/date-picker.test.tsx | forwards custom hosts, refs, positioning and explicit slots without inventing structure | M1: DatePickerCalendar returns null | GREEN | Explicit asChild/ref/positioning composition intentionally contains no Calendar. |
| packages/ui/test/date-picker.test.tsx | allows the caller to complete a range, transport form values, reset and close only when complete | M1: DatePickerCalendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 22(?:st / nd / rd / th), 2026/` |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker trigger inherits a compiled solid focus outline and role ink | M2: Content w-auto becomes w-64 | GREEN | Compiled solid outline, role ink and control dimensions; does not assert panel width. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker panel inherits a compiled solid focus outline and role ink | M2: Content w-auto becomes w-64 | GREEN | Compiled solid outline, role ink and control dimensions; does not assert panel width. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker close inherits a compiled solid focus outline and role ink | M2: Content w-auto becomes w-64 | GREEN | Compiled solid outline, role ink and control dimensions; does not assert panel width. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker's compiled panel sizing grants a complete Calendar with usable padding | M2: Content w-auto becomes w-64 | red | AssertionError: panel intrinsic width: expected [ 'calc(var(--spacing) * 64)' ] to deeply equal [ 'auto' ] |
| packages/ui/stories/date-picker.stories.tsx | date-picker: has stories | M3: DatePickerCalendar returns null | GREEN | Suite has exported stories; does not assert that they render a Calendar. |
| packages/ui/stories/date-picker.stories.tsx | date-picker/Default | M3: DatePickerCalendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 12th, 2026/` |
| packages/ui/stories/date-picker.stories.tsx | date-picker/Range | M3: DatePickerCalendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 22nd, 2026/` |
| packages/ui/stories/date-picker.stories.tsx | date-picker/Disabled | M3: DatePickerCalendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 14th, 2026/` |
| packages/ui/stories/date-picker.stories.tsx | date-picker/NestedDialog | M3: DatePickerCalendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 17th, 2026/` |
| packages/ui/test/registry.test.ts | declares the thirty-two part families plus the one shared lib | M4: remove DatePicker registry item | red | AssertionError: expected [ 'accordion', 'alert', …(30) ] to deeply equal [ 'accordion', 'alert', …(31) ] |
| packages/ui/test/registry.test.ts | types every item by where its files live: a part is registry:ui, the shared lib registry:lib | M4: remove DatePicker registry item | GREEN | Per-item types every item by where its files live: a part is registry:ui, the shared lib registry:lib; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | points every file at a path that exists | M4: remove DatePicker registry item | GREEN | Per-item points every file at a path that exists; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | registers every component source exactly once | M4: remove DatePicker registry item | red | AssertionError: expected [ 'accordion.tsx', …(31) ] to deeply equal [ 'accordion.tsx', …(32) ] |
| packages/ui/test/registry.test.ts | targets the consumer's own component directory, not the library's layout | M4: remove DatePicker registry item | GREEN | Per-item targets the consumer's own component directory, not the library's layout; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | declares npm dependencies at the versions the package itself builds against | M4: remove DatePicker registry item | GREEN | Per-item declares npm dependencies at the versions the package itself builds against; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | resolves every registry dependency inside this registry | M4: remove DatePicker registry item | red | AssertionError: expected 33 to be 36 // Object.is equality |
| packages/ui/test/registry.test.ts | declares exactly the registry dependencies its sources import | M4: remove DatePicker registry item | red | AssertionError: expected 33 to be 36 // Object.is equality |
| packages/ui/test/registry.test.ts | reads a source's registry dependencies as the items that ship the files it imports | M4: remove DatePicker registry item | GREEN | Per-item reads a source's registry dependencies as the items that ship the files it imports; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | reads a source's imports at every specifier position and nowhere else | M4: remove DatePicker registry item | GREEN | Per-item reads a source's imports at every specifier position and nowhere else; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | declares exactly the npm dependencies its own sources import, per item | M4: remove DatePicker registry item | GREEN | Per-item declares exactly the npm dependencies its own sources import, per item; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | keeps no stylesheet's first token a comment | M4: remove DatePicker registry item | GREEN | Per-item keeps no stylesheet's first token a comment; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | has one file per item and nothing else | M4: remove DatePicker registry item | red | AssertionError: expected [ 'accordion.json', …(33) ] to deeply equal [ 'accordion.json', …(32) ] |
| packages/ui/test/registry.test.ts | ships an INDEX that is the root registry, byte for byte | M4: remove DatePicker registry item | red | AssertionError: expected '{\n  "$schema": "https://ui.shadcn.co…' to be '{\n  "$schema": "https://ui.shadcn.co…' // Object.is equality |
| packages/ui/test/registry.test.ts | advertises every item in that index, with its files | M4: remove DatePicker registry item | red | AssertionError: expected [ 'accordion', 'alert', …(31) ] to deeply equal [ 'accordion', 'alert', …(30) ] |
| packages/ui/test/registry.test.ts | carries the CURRENT bytes of every source it ships | M4: remove DatePicker registry item | red | AssertionError: expected 33 to be 34 // Object.is equality |
| packages/ui/test/registry.test.ts | carries the title, description and both dependency lists into the item file | M4: remove DatePicker registry item | GREEN | Per-item carries the title, description and both dependency lists into the item file; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | is inside the package's published files, so it installs with no network | M4: remove DatePicker registry item | GREEN | Per-item is inside the package's published files, so it installs with no network; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/registry.test.ts | declares as RUNTIME dependencies everything the shipped sources import | M4: remove DatePicker registry item | GREEN | Per-item declares as runtime dependencies everything the shipped sources import; deleting an entire item is caught by separate corpus anchors. |
| packages/ui/test/stories.test.tsx | covers all thirty-one part families, with every story counted | M5: remove DatePicker suite entry | red | AssertionError: expected [ 'accordion', 'alert', …(29) ] to deeply equal [ 'accordion', 'alert', …(30) ] |
| packages/ui/test/stories.test.tsx | runs all 170 play functions, and knows if one stopped running | M5: remove DatePicker suite entry | red | AssertionError: stories whose play was composed: expected [ 'combobox/Default', …(165) ] to have a length of 170 but got 166 |
| packages/ui/test/stories.test.tsx | combobox: has stories; combobox/Default; combobox/Keyboard; combobox/EmptyAndDisabled; combobox/ControlledOpen; combobox/Disabled; combobox/CustomParts; combobox/NativeForm; combobox/Scrollable; combobox/NestedDialog; combobox/NestedSheet | M5: remove DatePicker suite entry | GREEN | Retained combobox family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | calendar: has stories; calendar/Default; calendar/Multiple; calendar/Range; calendar/Disabled; calendar/CustomSlots | M5: remove DatePicker suite entry | GREEN | Retained calendar family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | dropdown-menu: has stories; dropdown-menu/Default; dropdown-menu/Controlled; dropdown-menu/Checkable; dropdown-menu/Submenu; dropdown-menu/RightToLeft; dropdown-menu/Nonmodal; dropdown-menu/PreventDismiss; dropdown-menu/NestedOverlays; dropdown-menu/CustomHosts; dropdown-menu/ContentFocus | M5: remove DatePicker suite entry | GREEN | Retained dropdown-menu family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | slider: has stories; slider/Default; slider/Controlled; slider/Range; slider/ControlledRange; slider/Disabled; slider/Vertical; slider/RightToLeft; slider/Inverted; slider/InAForm; slider/AsChild | M5: remove DatePicker suite entry | GREEN | Retained slider family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | tooltip: has stories; tooltip/Default; tooltip/Keyboard; tooltip/Controlled; tooltip/ProviderDelays; tooltip/HoverableContent; tooltip/ImmediateClose; tooltip/CustomHosts; tooltip/InDialog | M5: remove DatePicker suite entry | GREEN | Retained tooltip family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | popover: has stories; popover/Default; popover/Controlled; popover/Modal; popover/Anchored; popover/PreventDismiss; popover/NestedSelect; popover/NestedOverlays | M5: remove DatePicker suite entry | GREEN | Retained popover family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | alert-dialog: has stories; alert-dialog/Default; alert-dialog/Destructive; alert-dialog/Controlled; alert-dialog/PreventedClosing; alert-dialog/Composition; alert-dialog/TallContent | M5: remove DatePicker suite entry | GREEN | Retained alert-dialog family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | dialog: has stories; dialog/Default; dialog/Keyboard; dialog/Controlled; dialog/PreventedClose; dialog/NonModal; dialog/TallContent; dialog/NestedSelect; dialog/NestedSheet; dialog/CustomHosts | M5: remove DatePicker suite entry | GREEN | Retained dialog family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | accordion: has stories; accordion/Single; accordion/Multiple; accordion/WithMarker | M5: remove DatePicker suite entry | GREEN | Retained accordion family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | alert: has stories; alert/Default; alert/Destructive; alert/Success; alert/Warning; alert/Info; alert/Announced; alert/NotALiveRegion; alert/WithAction; alert/AsChildParagraph | M5: remove DatePicker suite entry | GREEN | Retained alert family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | avatar: has stories; avatar/Default; avatar/NoBadge; avatar/Named; avatar/Edges; avatar/Ground; avatar/MarkEdge; avatar/MarkSize; avatar/AsChildLink; avatar/Stack | M5: remove DatePicker suite entry | GREEN | Retained avatar family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | badge: has stories; badge/Default; badge/Primary; badge/Destructive; badge/Success; badge/AsChildLink | M5: remove DatePicker suite entry | GREEN | Retained badge family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | breadcrumb: has stories; breadcrumb/Trail; breadcrumb/LongCurrentPage; breadcrumb/OneStep | M5: remove DatePicker suite entry | GREEN | Retained breadcrumb family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | button: has stories; button/Primary; button/PrimaryRounded; button/Secondary; button/Ghost; button/Danger; button/DangerArmed; button/ExplicitType; button/Disabled; button/Clickable; button/AsChildLink; button/CallerClassWins; button/WidthFull; button/WidthAuto | M5: remove DatePicker suite entry | GREEN | Retained button family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | card: has stories; card/Default; card/ContentOnly; card/AsAnArticle; card/TitleAtAnotherLevel; card/RadiusMd; card/RadiusSharp; card/EdgePrimary; card/GutterSm | M5: remove DatePicker suite entry | GREEN | Retained card family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | checkbox: has stories; checkbox/Default; checkbox/Checked; checkbox/Disabled; checkbox/DisabledChecked; checkbox/InAForm; checkbox/CustomMark; checkbox/TwoRows | M5: remove DatePicker suite entry | GREEN | Retained checkbox family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | description-list: has stories; description-list/Default; description-list/Inline; description-list/Prose; description-list/LinkedFigure; description-list/Live; description-list/Composed | M5: remove DatePicker suite entry | GREEN | Retained description-list family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | form: has stories; form/Default; form/Described; form/Invalid; form/DescribedAndInvalid; form/ValidWithMessageComposed; form/Textarea; form/Disabled; form/BesideANotice | M5: remove DatePicker suite entry | GREEN | Retained form family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | input: has stories; input/Default; input/Disabled; input/WithValue | M5: remove DatePicker suite entry | GREEN | Retained input family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | label: has stories; label/Default; label/Micro; label/MicroAsHeading | M5: remove DatePicker suite entry | GREEN | Retained label family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | pagination: has stories; pagination/Window; pagination/LastPage; pagination/SinglePage | M5: remove DatePicker suite entry | GREEN | Retained pagination family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | radio-group: has stories; radio-group/Default; radio-group/Chosen; radio-group/Keyboard; radio-group/Disabled; radio-group/InAForm; radio-group/NoDrawing; radio-group/AsAList | M5: remove DatePicker suite entry | GREEN | Retained radio-group family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | ribbon: has stories; ribbon/Default; ribbon/OneClaim; ribbon/CustomSeparator; ribbon/Empty | M5: remove DatePicker suite entry | GREEN | Retained ribbon family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | separator: has stories; separator/Horizontal; separator/Decorative; separator/Vertical | M5: remove DatePicker suite entry | GREEN | Retained separator family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | sheet: has stories; sheet/Default; sheet/HiddenTitle; sheet/AlertDialog; sheet/ChildScrolls | M5: remove DatePicker suite entry | GREEN | Retained sheet family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | switch: has stories; switch/Off; switch/On; switch/Disabled; switch/DisabledOn; switch/WithLabel; switch/NativeCheckbox; switch/NativeCheckboxOn; switch/InAForm; switch/ButtonInAForm | M5: remove DatePicker suite entry | GREEN | Retained switch family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | textarea: has stories; textarea/Default | M5: remove DatePicker suite entry | GREEN | Retained textarea family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | toast: has stories; toast/WithAction; toast/MessageOnly; toast/Closed; toast/DismissesItself | M5: remove DatePicker suite entry | GREEN | Retained toast family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | select: has stories; select/Default; select/Keyboard; select/Escape; select/Disabled; select/Controlled; select/ControlledOpen; select/NativeForm; select/CustomParts; select/Scrollable; select/NestedSheet | M5: remove DatePicker suite entry | GREEN | Retained select family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | tabs: has stories; tabs/Default; tabs/Line; tabs/Manual; tabs/Vertical; tabs/Controlled; tabs/Composition | M5: remove DatePicker suite entry | GREEN | Retained tabs family existence/render/play; deleting DatePicker does not collapse this family. |
| packages/ui/test/stories.test.tsx | toggle: has stories; toggle/Default; toggle/Pressed; toggle/Disabled | M5: remove DatePicker suite entry | GREEN | Retained toggle family existence/render/play; deleting DatePicker does not collapse this family. |
| apps/docs/test/explorer.test.tsx | selects a family, renders its real preview and exposes its composition | M6: remove DatePicker catalog entry | GREEN | Switch preview/interaction/source and Button navigation, independent of DatePicker discovery. |
| apps/docs/test/explorer.test.tsx | keeps every family discoverable and resets preview state when switching | M6: remove DatePicker catalog entry | red | AssertionError: expected [ <button …(4)>…(3)</button>, …(30) ] to have a length of 32 but got 31 |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker docs preserve selection, disabled dates, keyboard, range completion, caller forms and reset | B1: Content w-auto becomes w-64; rebuild | red | Error: DatePicker receives hits across the complete unscrolled target  DatePicker receives hits across the complete unscrolled target  expect(received).toBe(expected) // Object.is equality  Expected:  |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker isolated panel contains the full frame and every Saturday without scroll repairs | B1: Content w-auto becomes w-64; rebuild | red | Error: panel has no hidden horizontal overflow  expect(received).toBeLessThanOrEqual(expected)  Expected: <= 252 Received:    344    64  /    expect(geometry.panel.right, "panel ends inside viewport") |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker fits inside Dialog and Escape dismisses one scope with correct focus return | B1: Content w-auto becomes w-64; rebuild | red | Error: panel has no hidden horizontal overflow  expect(received).toBeLessThanOrEqual(expected)  Expected: <= 252 Received:    344    64  /    expect(geometry.panel.right, "panel ends inside viewport") |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker real hosts paint focus outside docs CSS in light, dark and forced colors | B1: Content w-auto becomes w-64; rebuild | red | Geometry-related exterior sample is outside viewport; ancillary red, not evidence about outline styling. |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker example source is highlighted and copied byte for byte | B1: Content w-auto becomes w-64; rebuild | GREEN | Highlighted/copied source equals the caller example; does not assert runtime geometry or focus. |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker docs preserve selection, disabled dates, keyboard, range completion, caller forms and reset | B2: Popover outline-solid becomes outline-none; nested docs callback becomes no-op; rebuild | GREEN | Selection/form/containment/Saturday hits; does not assert nested initial focus or outline paint. |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker isolated panel contains the full frame and every Saturday without scroll repairs | B2: Popover outline-solid becomes outline-none; nested docs callback becomes no-op; rebuild | GREEN | Selection/form/containment/Saturday hits; does not assert nested initial focus or outline paint. |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker fits inside Dialog and Escape dismisses one scope with correct focus return | B2: Popover outline-solid becomes outline-none; nested docs callback becomes no-op; rebuild | red | Error: expect(locator).toBeFocused() failed  Locator:  getByRole('dialog', { name: 'Dialog date', exact: true }).getByRole('button', { name: /October 12(?:st / nd / rd / th), 2026/ }) Expected: focuse |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker real hosts paint focus outside docs CSS in light, dark and forced colors | B2: Popover outline-solid becomes outline-none; nested docs callback becomes no-op; rebuild | red | Error: arcade/false Trigger solid focus  expect(received).toBe(expected) // Object.is equality  Expected: "solid" Received: "none"    190  /    expect(values.visible, `${label} ancestors show the focu |
| apps/docs/browser/date-picker.spec.ts | mobile, tablet, desktop: DatePicker example source is highlighted and copied byte for byte | B2: Popover outline-solid becomes outline-none; nested docs callback becomes no-op; rebuild | GREEN | Highlighted/copied source equals the caller example; does not assert runtime geometry or focus. |

```

Layer-1 closure: one MEDIUM and one LOW, both closed in
`2caa726ddb52e676e78b96b7b345e5a849b1f243`. The unnecessary boundary was removed,
the coordinator regenerated registry bytes and corrected the family-count title,
and the reviewer independently reran the omitted consumers: **17 passed / exit 0**.
Every GREEN row above pins an explicitly unchanged independent contract. No test
was widened: Calendar absence does not delete open/cancel/asChild behavior; narrow
panel width does not delete focus styling; deleting one family leaves other
families intact; source-copy checks do not assert runtime geometry/focus. The
review's named GREEN coverage remains bounded accordingly. Full source/registry
restoration and landed diffs are retained in `r5/`; no node_modules mutation.

Eight mutation controls were run across all seven touched test/play files,
including independent fresh browser builds. The final focus/callback control
reddened the predicted Trigger solid-outline and nested initial-day assertions
on all three viewports. It stopped at the first Arcade trigger, so it does not
individually certify the later light/forced-color focus assertions; those remain
covered by the restored browser suite. The width control's paint-geometry error
is ancillary, not claimed as a proof of outline behavior. Complete independent
report: `/home/ankit/.marquee-scratch/BATCH-PARITY-6/r5/report.md`.

Final shared consumer: `apps/docs/browser/site.spec.ts` owns the independent
family count and expected-parts inventory. The coordinator corrected it to32 and
added DatePicker's real Popover trigger selector after Table's full gate exposed
the omitted inventory. The same reviewer runs a bounded detached collapse of
DatePicker's docs preview while retaining the catalog count, then restores and
checks the shared sweep at all three widths. This consumer is CROSS to the
coordinator; its correction does not change DatePicker's runtime behavior.

## Shared inventory review closure

```text
## Layer 1 (reviewer, detached worktree of b4156d36f4cf51ff5928914549f46967d450f8df, slot 5)
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| apps/docs/browser/site.spec.ts | mobile: renders every family and sends each workbench link to a real story | DatePicker example returns a nonempty paragraph; all32catalogentries preserved; own docs/Storybook rebuilt | red | DatePicker must render its actual parts: missing .family-canvas [data-slot=popover-trigger]; count32 passes. |
| apps/docs/browser/site.spec.ts | tablet: renders every family and sends each workbench link to a real story | DatePicker example returns a nonempty paragraph; all32catalogentries preserved; own docs/Storybook rebuilt | red | DatePicker must render its actual parts: missing .family-canvas [data-slot=popover-trigger]; count32 passes. |
| apps/docs/browser/site.spec.ts | desktop: renders every family and sends each workbench link to a real story | DatePicker example returns a nonempty paragraph; all32catalogentries preserved; own docs/Storybook rebuilt | red | DatePicker must render its actual parts: missing .family-canvas [data-slot=popover-trigger]; count32 passes. |
| apps/docs/browser/site.spec.ts | mobile: renders every family and sends each workbench link to a real story | Restore example from exact HEAD; rebuild docs and assemble current Storybook | GREEN (restored) |32discoverable families have expected visible parts and registered Storybook links; this is corpus discovery, not DatePicker deep behavior. |
| apps/docs/browser/site.spec.ts | tablet: renders every family and sends each workbench link to a real story | Restore example from exact HEAD; rebuild docs and assemble current Storybook | GREEN (restored) |32discoverable families have expected visible parts and registered Storybook links; this is corpus discovery, not DatePicker deep behavior. |
| apps/docs/browser/site.spec.ts | desktop: renders every family and sends each workbench link to a real story | Restore example from exact HEAD; rebuild docs and assemble current Storybook | GREEN (restored) |32discoverable families have expected visible parts and registered Storybook links; this is corpus discovery, not DatePicker deep behavior. |

PROVED inventory closure: `apps/docs/browser/site.spec.ts` was absent from the original touched/consumer inventory and now has its own control. No test survived the DatePicker collapse. Runner `site-collapse.log`: `3 failed` (17.8s), exit1; each failure explicitly says `DatePicker must render its actual parts`, not a31/32count/import/build failure. Runner `site-restored.log`: `3 passed` (8.8s), exit0. Only `browser/site.spec.ts --grep 'renders every family'` was run, on all three projects.

Proof/evidence: `site-collapse.landed.diff` shows the subject collapse; source grep observed the placeholder; catalog32/date-picker inclusion separately verified unchanged; `site-collapse.restored.diff` is empty after git restore. Frozen install, tokens build, one Storybook build, both docs builds and both assemblies exited0 (`site-*.exit`). No full gate, DB, external publication or node_modules mutation. Detached checkout cleaned after this appendix was written. The original eight-control table above is unchanged.
```

## Full gate

One full stream gate: `DOCS_PORT=4191 pnpm verify`, Node22.18.0/pnpm10.24.0,
2026-10-08, exact source `74086b417989e3f17ac2e713c64edde1b91cb25d`. Sentinel **exit0**;
runner **56 library files / 931 tests passed**, **4 docs files / 39 tests passed**,
**5 consumer tests passed**, **273 browser cases passed** across all three projects
(browser runner5.1m). Wall **336s**, `2026-10-08T12:23:50,064975343+05:30` to `2026-10-08T12:29:26,679087234+05:30`.
Logs/source/time/exit proofs: `s1/verify.log`, `verify.source`, `verify.started`,
`verify.finished`, `verify.exit` under the batch scratch directory. The prior
inherited tablet Dialog-inside-Sheet Escape intermittent did not recur.

The gate builds before its tests and used the final runtime source and corrected
shared site inventory. Subsequent changes only record this gate in this document;
no further product testing was needed. Layer1 closed one MEDIUM/one LOW, ran nine
controls (eight original plus the shared inventory), and recorded all surviving
GREEN tests' independent bounds. All source/registry mutations were restored.
No public operations; the stream branch stays pushed for coordinator reconciliation.

## Layer 2 panel focus repair (2026-10-08)

Layer 2 measured a supported all-disabled Calendar with hidden navigation and no
Close control. Keyboard opening naturally focuses DatePickerContent. In a Light
parent Dialog, its inherited exterior primary-ink outline contrasted only
1.23–1.59 against actual scrim pixels. DatePickerContent now uses the inherited
solid 2px role outline at a -4px inset, inside its 2px border against its own
overlay ground; callers can override offset and ink. Popover contracts and source
are unchanged.

Tests-first: `pnpm exec vitest run --project ui
packages/ui/test/date-picker-focus.test.tsx` produced the two predicted offset
failures (2 instead of -4), with natural keyboard panel focus already confirmed.
After the narrow fix, DatePicker composition, focus and the derived global focus
inventory passed 33 tests. Logs: `s1/panel-focus-test-first.log` and
`s1/panel-focus-fixed.log`. Independent controls and installed browser paint
measurements follow below before the corrected gate.

Installed no-docs paint proof at source `203ad356345d5ccba6a5a326d68a0aac66aa12c8`:
`npm pack --ignore-scripts` copied the local UI package to a scratch consumer,
whose real package entry imports a fully disabled Calendar inside Dialog. No
docs stylesheet or recipe participates. The probe waits for launcher readiness
and uses only Tab/Enter to open both scopes; it never focuses the trigger or
panel itself. At 390, 768 and 1280px, nine Arcade/Light/forced-color cases passed.
Four screenshot pixel pairs sample the actual straight outline sides and
neighboring panel ground. Minimum ratios are 13.72 / 7.63 / 11.31 respectively;
computed solid 2px outline, -4px inset, visible ancestors and focus-visible state
also pass. Escape returns through both scopes, and caller offset8 is measured
in the actual browser. Script, fresh tarball metadata, results and captures:
`s1/panel-focus-installed.mjs`, `s1/panel-focus-pack.json`,
`s1/panel-focus-installed/results.json` and its nine PNGs.

The first scratch probe already measured all nine natural panel paints, but its
separate caller-override reload sent Tab before React exposed the launcher. The
original `s1/panel-focus-installed-first.log` and `.json` remain; explicit visible
launcher readiness and focused-launcher assertions before Enter corrected the
instrument. No product behavior or focus repair was added.

Consumer supplement: DatePickerContent exports and role contracts are unchanged.
The existing source/index, DatePicker composition/focus tests, four stories and
docs example consume it; the registry consumes source bytes and was regenerated
by the coordinator (`3dcd241adc17942283c8e93126f5a5208246cc1f`). The global direct
focus scanner reads actual outline-style sites: the offset-only override adds no
site, and its existing exact inventory remains green. Literal/source scans are
recorded in `s1/panel-focus-consumers.txt` and
`s1/panel-focus-literal-consumers.txt`. No sibling behavior, route, role or unowned
contract moved. Root `pnpm lint` and `pnpm typecheck` passed before the corrected
gate (`s1/panel-focus-pregate.log`).

Independent closure (verbatim):

```text
## Layer 1 (reviewer, detached worktree of 203ad356345d5ccba6a5a326d68a0aac66aa12c8, slot 5)
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker trigger inherits a compiled solid focus outline and role ink | Remove focus-visible:-outline-offset-4 | GREEN | Trigger compiled outline/ink/44px target; independent of panel rendering and inset. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker panel inherits a compiled solid focus outline and role ink | Remove focus-visible:-outline-offset-4 | red | AssertionError: panel focus offset: expected 2 to be -4 // Object.is equality |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker close inherits a compiled solid focus outline and role ink | Remove focus-visible:-outline-offset-4 | GREEN | Close compiled outline/ink/44px target; offset change touches only Content. |
| packages/ui/test/date-picker-focus.test.tsx | naturally focuses an all-disabled Calendar panel on keyboard open inside Dialog, with inset focus paint | Remove focus-visible:-outline-offset-4 | red | AssertionError: panel ring sits inside its own overlay ground: expected 2 to be -4 // Object.is equality |
| packages/ui/test/date-picker-focus.test.tsx | allows callers to replace the panel's inset offset and role ink | Remove focus-visible:-outline-offset-4 | GREEN | Caller offset8/foreground class merge; browser separately measures computed caller offset8. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker's compiled panel sizing grants a complete Calendar with usable padding | Remove focus-visible:-outline-offset-4 | GREEN | Intrinsic panel width/padding/frame; does not assert the focus offset. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker trigger inherits a compiled solid focus outline and role ink | DatePickerContent returns null | GREEN | Trigger compiled outline/ink/44px target; independent of panel rendering and inset. |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker panel inherits a compiled solid focus outline and role ink | DatePickerContent returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "dialog" and name "Date focus" |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker close inherits a compiled solid focus outline and role ink | DatePickerContent returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Close date" |
| packages/ui/test/date-picker-focus.test.tsx | naturally focuses an all-disabled Calendar panel on keyboard open inside Dialog, with inset focus paint | DatePickerContent returns null | red | Error: Unable to find role="dialog" and name "Unavailable dates" |
| packages/ui/test/date-picker-focus.test.tsx | allows callers to replace the panel's inset offset and role ink | DatePickerContent returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "dialog" and name "Caller focus" |
| packages/ui/test/date-picker-focus.test.tsx | DatePicker's compiled panel sizing grants a complete Calendar with usable padding | DatePickerContent returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "dialog" and name "Date sizing" |
| r5/panel-inset-installed.mjs | 390-arcade, 768-arcade, 1280-arcade: natural fully-disabled Calendar panel opening | Remove inset, fresh npm tarball copy, rebuild own installed fixture | red | Contrast14.2270 passes; only expected offset2 vs-4 fails. Not a color-contrast red. |
| r5/panel-inset-installed.mjs | 390-light, 768-light, 1280-light: natural fully-disabled Calendar panel opening | Remove inset, fresh npm tarball copy, rebuild own installed fixture | red | Actual screenshot ring/neighbor contrast1.4656 <3, before offset assertion. |
| r5/panel-inset-installed.mjs | 390-forced, 768-forced, 1280-forced: natural fully-disabled Calendar panel opening | Remove inset, fresh npm tarball copy, rebuild own installed fixture | red | Contrast11.3098 passes; only expected offset2 vs-4 fails. Not a color-contrast red. |
| r5/panel-inset-installed.mjs | 390-arcade, 768-arcade, 1280-arcade: natural opening, painted focus, Escape scopes and caller override | Restore source, fresh npm tarball copy and rebuild | GREEN (restored) | Actual4side pixel contrast13.7217, natural focused/focus-visible Content, solid2px inset-4, visible opaque ancestors, own-panel ground, two Escape returns, caller realoffset8. |
| r5/panel-inset-installed.mjs | 390-light, 768-light, 1280-light: natural opening, painted focus, Escape scopes and caller override | Restore source, fresh npm tarball copy and rebuild | GREEN (restored) | Actual4side pixel contrast7.6263, natural focused/focus-visible Content, solid2px inset-4, visible opaque ancestors, own-panel ground, two Escape returns, caller realoffset8. |
| r5/panel-inset-installed.mjs | 390-forced, 768-forced, 1280-forced: natural opening, painted focus, Escape scopes and caller override | Restore source, fresh npm tarball copy and rebuild | GREEN (restored) | Actual4side pixel contrast11.3098, natural focused/focus-visible Content, solid2px inset-4, visible opaque ancestors, own-panel ground, two Escape returns, caller realoffset8. |

READY — no remaining blocking finding in this narrow correction. Independent unit baseline6passed; old source2failed/4passed (both expected2/-4 assertions); Content collapse5failed/1passed (Trigger-only independent coverage); restored6passed. Own Node probe baseline `PANEL FOCUS:9 passed /0failed` (exit0); old `0passed /9failed` (exit1): all3Light cases fail actual-ring screenshot contrast1.4656, the other6fail only offset2vs-4; restored `9passed /0failed` (exit0). All6focused unit test names and every survivingGREEN are enumerated above.

Evidence: `inset-{baseline,old-source,content-null,restored}.{json,log,exit}`, old/Content-null `.landed.diff` and empty `.restored.diff`; browser `inset-{baseline,old,restored}-browser.{log,exit}`, immutable pixel records/screenshots in `inset-{baseline,old,restored}-pixels/`, fresh-package byte equality proofs and build logs/exit0 per case. Probe assertions copied unchanged from supplied script after its launcher-readiness correction, rewriting only runtime path/port/output. Browser used natural Tab/Enter; no focus() repair; own freshly unpacked npm package entry and declared source CSS, no docs CSS. Mutation was made in tracked detached source before packing; installed files never edited in place. No fullverify/DB/Pile/public operation. Original reports above unchanged; review checkout clean and removed after this appendix.

```
