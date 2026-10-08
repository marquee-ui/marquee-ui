# CALENDAR-1 — composable Calendar

Batch: BATCH-PARITY-5. Status: complete; unreleased.
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

The final diff-wide export scan adds five story names to the seven library names:
`Default`, `Multiple`, `Range`, `Disabled`, `CustomSlots` (12 names total). These are
namespace consumers through `CalendarStories` in `story-suites.ts`, then the generic
story runner and compiled Tailwind floor; direct unscoped name matches also name
other story modules and do not create a shared family contract. Independent review
also enumerated client-boundary, entry-point and token brand/literal/source/project
coverage guards. Those discovered consumers were read and run by the reviewer.

## Layer 1 (reviewer, detached worktree of f1bb924f8479ae19aae9bb2e13cd6d87ee2ae888, slot r6 / port 4196)

The table below is preserved verbatim from the independent report.

```text
| file | test | mutation applied | red / GREEN | what it asserts now |
|---|---|---|---|---|
| packages/ui/test/calendar.test.tsx | retains the primitive discriminated selection contract | Calendar returns null | GREEN | Type-only subject survives render collapse; CLOSED by type-union-collapse tsc test line22 + unused directive line23. |
| packages/ui/test/calendar.test.tsx | reports controlled single selection without taking control from the caller | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 15(?:st\|nd\|rd\|th), 2026/` |
| packages/ui/test/calendar.test.tsx | toggles multiple dates and respects minimum and maximum selection bounds | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 15(?:st\|nd\|rd\|th), 2026/` |
| packages/ui/test/calendar.test.tsx | selects range bounds and resets a range containing an excluded disabled date | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 10(?:st\|nd\|rd\|th), 2026/` |
| packages/ui/test/calendar.test.tsx | preserves disabled and hidden matchers and accessible weekday/day names | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 14(?:st\|nd\|rd\|th), 2026/` |
| packages/ui/test/calendar.test.tsx | navigates uncontrolled months and leaves a controlled month unchanged until rerender | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Go to the Previous Month" |
| packages/ui/test/calendar.test.tsx | keeps real arrow-key focus and selection callbacks through replaceable day parts | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 12(?:st\|nd\|rd\|th), 2026/` |
| packages/ui/test/calendar.test.tsx | composes root/footer/caption/nav slots and preserves labels, locale and formatter props | Calendar returns null | red | Error: expect(received).toHaveAttribute() |
| packages/ui/test/calendar.test.tsx | preserves native day/nav refs, event props, disabled state and form-safe types | Calendar returns null | GREEN | Standalone nav subject survives Calendar collapse; CLOSED by nav-collapse at missing Move button. |
| packages/ui/test/calendar.test.tsx | retains required single selection and restarts an overlong range at its new endpoint | Calendar returns null | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 12(?:st\|nd\|rd\|th), 2026/` |
| packages/ui/test/calendar.test.tsx | forwards both root refs and caller classes/styles to their actual hosts | Calendar returns null | red | Error: expect(received).toHaveClass() |
| packages/ui/test/calendar.test.tsx | retains the primitive discriminated selection contract | Widen CalendarProps with invalid single Date[] branch; tsc on UI project | red | TS2344 at calendar.test.tsx:22 expectTypeOf equality; TS2578 unused @ts-expect-error at:23. Runtime Vitest is not the type verdict. |
| packages/ui/test/calendar.test.tsx | preserves native day/nav refs, event props, disabled state and form-safe types | CalendarNavigationButton returns null | red | Unable to find accessible button Move; direct native nav/ref/form subject is observed. |
| packages/ui/test/calendar.test.tsx | forwards both root refs and caller classes/styles to their actual hosts | Drop useImperativeHandle(rootRef) | red | expected null to be actual root div (Object.is); animation ref forwarding is independently observed. |
| packages/ui/test/calendar-focus.test.tsx | calendar-day-button owns compiled focus and 44px geometry | Remove Calendar focus outline solid/width/offset/color classes | red | AssertionError: calendar-day-button paints focus: expected [] to include 'solid' |
| packages/ui/test/calendar-focus.test.tsx | calendar-navigation-button owns compiled focus and 44px geometry | Remove Calendar focus outline solid/width/offset/color classes | red | AssertionError: calendar-navigation-button paints focus: expected [] to include 'solid' |
| packages/ui/stories/calendar.stories.tsx + packages/ui/test/stories.test.tsx | calendar/Default | Calendar returns null; composed play runs in root Vitest UI project | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 15th, 2026/` |
| packages/ui/stories/calendar.stories.tsx + packages/ui/test/stories.test.tsx | calendar/Multiple | Calendar returns null; composed play runs in root Vitest UI project | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 15th, 2026/` |
| packages/ui/stories/calendar.stories.tsx + packages/ui/test/stories.test.tsx | calendar/Range | Calendar returns null; composed play runs in root Vitest UI project | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 20th, 2026/` |
| packages/ui/stories/calendar.stories.tsx + packages/ui/test/stories.test.tsx | calendar/Disabled | Calendar returns null; composed play runs in root Vitest UI project | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 14th, 2026/` |
| packages/ui/stories/calendar.stories.tsx + packages/ui/test/stories.test.tsx | calendar/CustomSlots | Calendar returns null; composed play runs in root Vitest UI project | red | TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/October 12th, 2026/` |
| packages/ui/test/stories.test.tsx | covers all thirty part families, with every story counted | Remove calendar entry from shared STORY_SUITES map | red | AssertionError: expected [ 'accordion', 'alert', …(27) ] to deeply equal [ 'accordion', 'alert', …(28) ] |
| packages/ui/test/stories.test.tsx | runs all 156 play functions, and knows if one stopped running | Remove calendar entry from shared STORY_SUITES map | red | AssertionError: stories whose play was composed: expected [ 'dropdown-menu/Default', …(150) ] to have a length of 156 but got 151 |
| packages/ui/test/registry.test.ts | declares the thirty part families plus the one shared lib | Remove Calendar item from root registry.json | red | AssertionError: expected [ 'accordion', 'alert', …(28) ] to deeply equal [ 'accordion', 'alert', …(29) ] |
| packages/ui/test/registry.test.ts | registers every component source exactly once | Remove Calendar item from root registry.json | red | AssertionError: expected [ 'accordion.tsx', …(29) ] to deeply equal [ 'accordion.tsx', …(30) ] |
| packages/ui/test/registry.test.ts | resolves every registry dependency inside this registry | Remove Calendar item from root registry.json | red | AssertionError: expected 31 to be 32 // Object.is equality |
| packages/ui/test/registry.test.ts | declares exactly the registry dependencies its sources import | Remove Calendar item from root registry.json | red | AssertionError: expected 31 to be 32 // Object.is equality |
| packages/ui/test/registry.test.ts | has one file per item and nothing else | Remove Calendar item from root registry.json | red | AssertionError: expected [ 'accordion.json', …(31) ] to deeply equal [ 'accordion.json', …(30) ] |
| packages/ui/test/registry.test.ts | ships an INDEX that is the root registry, byte for byte | Remove Calendar item from root registry.json | red | AssertionError: expected '{\n  "$schema": "https://ui.shadcn.co…' to be '{\n  "$schema": "https://ui.shadcn.co…' // Object.is equality |
| packages/ui/test/registry.test.ts | advertises every item in that index, with its files | Remove Calendar item from root registry.json | red | AssertionError: expected [ 'accordion', 'alert', …(29) ] to deeply equal [ 'accordion', 'alert', …(28) ] |
| packages/ui/test/registry.test.ts | carries the CURRENT bytes of every source it ships | Remove Calendar item from root registry.json | red | AssertionError: expected 31 to be 32 // Object.is equality |
| packages/ui/test/focus-outline.test.tsx | finds every part that draws a focus ring, and knows which ones are short | Remove all focus-visible Calendar source tokens | red | AssertionError: expected [ …(13) ] to deeply equal [ …(14) ] |
| apps/docs/test/explorer.test.tsx | keeps every family discoverable and resets preview state when switching | Remove Calendar item from docs catalog | red | AssertionError: expected [ <button …(4)>…(3)</button>, …(28) ] to have a length of 30 but got 29 |
| apps/docs/browser/calendar.spec.ts | Calendar docs preserve controlled day, keyboard movement, multiple dates, range bounds and reset | Calendar returns null; rebuilt detached app; mobile project | red | missing October12 button visibility |
| apps/docs/browser/calendar.spec.ts | Calendar grids fit every viewport and every enabled day/navigation control is a real 44px target | Calendar returns null; rebuilt detached app; mobile project | red | expected three Calendar roots, received zero |
| apps/docs/browser/calendar.spec.ts | Calendar selected text and focus paint outside docs CSS in dark, light, accent and forced colors | Calendar returns null; rebuilt detached app; mobile project | red | Calendar root toBeVisible element not found |
| apps/docs/browser/calendar.spec.ts | Calendar disabled/hidden matchers and custom slot keyboard navigation work outside docs CSS | Calendar returns null; rebuilt detached app; mobile project | red | October14 toBeDisabled element not found |
| apps/docs/browser/calendar.spec.ts | Calendar example source is highlighted and copied byte for byte | Calendar returns null; rebuilt detached app; mobile project | GREEN | This case observes example source/copy, not rendered Calendar; CLOSED by clipboard no-op below. |
| apps/docs/browser/calendar.spec.ts | Calendar example source is highlighted and copied byte for byte | Drop clipboard.writeText in CopyCode; build docs and assemble site; mobile project | red | Expected complete example bytes; Received empty string at clipboard.readText equality (original copy mutation assertion retained). |
| apps/docs/browser/calendar.spec.ts | Calendar selected text and focus paint outside docs CSS in dark, light, accent and forced colors | data-selected:text-foreground to data-selected:text-foreground/5; full detached rebuild; original f1bb924 test | GREEN | PROVED MEDIUM instrument defect: ink RGB contrast ignored alpha. One passed4.9s although selected numbers almost invisible in normal-theme screenshots. Current product source uses opaque ink. |
| apps/docs/browser/calendar.spec.ts | Calendar selected text and focus paint outside docs CSS in dark, light, accent and forced colors | Same selected text alpha5% mutation; authored8c245aa test copied + committed reviewer70b521f before mutation; full detached rebuild | red | CLOSED: selected calendar text contrasts with its actual fill; Expected>=4.5, Received1.1496761180438297. One failed at the predicted assertion. |
| apps/docs/browser/site.spec.ts | renders every family and sends each workbench link to a real story | Calendar returns null; rebuilt detached app; mobile project | red | Calendar must render its actual parts; data-slot=calendar missing. One failed. |
```

Two findings, both closed before the full stream gate:

- MEDIUM, proved test instrument defect: selected text at 5 percent role alpha
  stayed GREEN under the initial RGB-only text contrast calculation. The current
  product ink was already opaque. Commit `8c245aa` composites ink alpha onto the
  actual painted ground. The reviewer committed the corrected test in its detached
  copy before rerunning the same mutation; it failed at the predicted selected-text
  assertion with 1.1496761180438297 against the unchanged 4.5 floor. Original GREEN
  evidence and closure RED are retained. Restored baseline is GREEN.
- LOW, export enumeration omission: the original seven library-name scan omitted
  the five new story exports. The Consumers record now names all twelve and their
  reflective module readers. No missing library consumer or product defect found.

The other GREEN collapse rows observe different subjects: type identity, standalone
navigation and copied source. Their targeted type-widening, navigation-collapse and
clipboard no-op controls are RED as recorded in the table. No test was skipped,
weakened or deleted to make a mutation pass.

Review target: `f1bb924f8479ae19aae9bb2e13cd6d87ee2ae888`; supplemental authored
instrument fix `8c245aaf5f5dc53b0494ea677298742b4a137cf5`, committed in the detached
copy at `70b521f9b493e4843926a1aa57ddb08e0492795c` before its mutation. Restored
checks: build exit 0; 340 focused unit/consumer guards, two docs explorer tests and
18 Calendar plus site-inventory browser cases across all three projects pass
(52.3s browser); UI typecheck exit 0; detached git status clean. Reviewer inspected
full normal/forced-color canvases and confirmed exact inclusive selection extent.
Review worktree removed; all original logs, landing proofs, screenshots, traces and
476 unrelated surviving unit rows remain in
`/home/ankit/.marquee-scratch/BATCH-PARITY-5/r6/report.md` and its adjacent artifacts.

## Full stream gate

One full stream `DOCS_PORT=4192 pnpm verify`, after independent review closure,
exited **0** on `b857e0e1e00ac90e853900993662223a59ceca3d`. Command environment:
`PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH`,
`DOCS_BROWSER_OUTPUT=/home/ankit/.marquee-scratch/BATCH-PARITY-5/s2/gate-browser`.
The detached runner held one of the two batch gate locks; its own exit sentinel
and summaries were read. Started 2026-10-08 04:35:42 UTC, finished 04:40:44 UTC:
302 seconds wall time. Runner: **897 library tests (53 files), 39 docs tests
(four files), five consumer checks, 234 browser cases (4.5m)**, all passed.

No full gate preceded review or was repeated. The final record commit changes only
this Markdown file after the green source/artifact gate. The working tree was clean
at completion and port 4192 was released. Stream branch is ready for coordinator
reconciliation; publication hold remains in force. No database, Steam, shots,
STATUS, PR, main merge, deployment, npm, Pages or domain operation was performed.

Final decisions: preserve the maintained DayPicker v10 selection contract and
replaceable slots; use muted action selection fill plus framed endpoints so the
external focus ring contrasts with adjacent selected days; under forced colors,
underline inclusive selected dates; keep announcements/reset/native date transport
caller-owned. Context limits and original failures above remain part of the record.
