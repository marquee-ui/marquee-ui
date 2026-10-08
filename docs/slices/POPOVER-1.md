# POPOVER-1 — composed Popover

Batch: BATCH-PARITY-3. Status: complete; unreleased. Stream port 4191; reviewer 4195.

## Scope

Expose Radix Popover Root, Trigger, Anchor, Portal, Content, Close and Arrow as
Marquee parts, plus optional Header/Title/Description presentation slots if they
fit existing conventions. Explicit composition: Content does not inject portal,
arrow, close or labels. Caller supplies accessible naming with aria attributes.
Nonmodal default and modal option, controlled/uncontrolled state, positioning,
collision bounds, focus restoration, outside/Escape closing and prevented callbacks.
Close must be form-safe. Prove Select inside Popover and Popover inside Dialog/Sheet
without leaked pointer/focus locks. Tooltip cross-family behavior is integration-owned.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/popover)
and [shadcn](https://ui.shadcn.com/docs/components/radix/popover). npm reports Popover
1.2.0 with dismissable-layer1.1.20/focus-scope1.2.0/popper1.3.8, matching existing overlays.
Positioning properties remain primitive-owned; content is bounded and scrollable.

## Execution and ownership

Test first, then implement; commit source before independent reviewer mutations in a
detached copy. Read the intended assertion from each actual bounded negative control.
One full stream `pnpm verify` follows review closure. Node 22.18.0, pnpm 10.24.0.
No Pile database, Steam, screenshot pipeline or public operations. Publication is held.

Own the family source, story module, family-named UI tests, docs example, docs browser
spec and this record. The orchestrator alone wires exports, manifests/lock, registry,
source/story/focus inventories, counts, catalog, guide and STATUS. Request wiring as
soon as source/stories/demo stabilize, including exports, counts and catalog copy.
You are not alone: preserve other agents' edits and do not revert their files.

Retain strict types, role-only styles, supported primitive props/refs and asChild.
44px targets, dark/light/accent and forced-colors readability must be measured in
real Chromium at 390/768/1280. Prove focus outline style AND width AND contrast
without docs CSS (Storybook/installed copies). Use actual animation/listener/hit-target
readiness, not fixed sleeps. Stories carry meaningful plays; demos include exact
highlighted copyable examples. Orchestrator handles fresh packed-consumer acceptance.
Document deliberate API differences and unreleased status. Stay within this slice.

Exact owned files: `packages/ui/src/popover.tsx`,
`packages/ui/stories/popover.stories.tsx`, `packages/ui/test/popover*.test.tsx`,
`apps/docs/src/examples/popover.tsx`, `apps/docs/browser/popover.spec.ts`, this doc.

## Evidence

- 2026-10-08: test-first unit run failed on the absent `../src/popover` module;
  implementation then passed 12 behavior tests and five compiled focus/target
  tests. `pnpm exec vitest run --project ui packages/ui/test/stories.test.tsx
-t popover` passed all seven plays plus the story inventory assertion (eight
  passed; 173 unrelated tests filtered). Root-wide lint and typecheck passed.
- Ten exported parts, seven stories/plays. Header/Title/Description are optional
  presentation slots with `asChild`; they do not generate or associate labels.
  Content uses caller-provided ARIA. Portal, Arrow and Close remain explicit.
  Unlike the common bundled shadcn Content recipe, Content injects no Portal.
  Positioning defaults remain Radix defaults; examples opt into offsets and padding.
- Built Chromium probe at 390px: explicit Arrow paints above the scrollable panel.
  Its triangle center is hit by `elementFromPoint` (the SVG polygon); inspected
  screenshot `~/.marquee-scratch/BATCH-PARITY-3/popover/arrow-before.png`.
  No overflow exception or additional scroll slot was needed.
- Initial browser pass: 21 passed / six failed. Two authored instruments needed
  correction: a parent Close is occluded until the nonmodal child dismisses on
  outside focus; Radix includes Arrow height in addition to `sideOffset` in the
  panel-to-anchor gap. Assertions now measure the accessible parent after
  dismissal and the actual 16px gap (8px offset plus 8px Arrow height).
- Focused browser run against `pnpm build` output: 27 passed (22.3s), nine tests
  on 390/768/1280px Chromium. It covers isolated dark/light/accent/forced-colors
  focus, nested Select and Dialog/Sheet, caller save/Cancel, exact highlighted
  copy, Arrow hit/scroll/resize readiness and independent Anchor collision bounds.
  Detached review closed with one MEDIUM instrument finding; the Arrow opacity
  guard now rejects the predicted negative control. Full stream gate passed below.

## Consumers

Pre-implementation scan at base `3bc6ba0`, 2026-10-08: `git grep -l -w <name>
3bc6ba0 -- packages apps` returned no consumer for any of these ten exports:
Popover, PopoverPortal, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose,
PopoverArrow, PopoverHeader, PopoverTitle, PopoverDescription. No existing family
source or route changed; role and common control-class contracts are preserved.

Commit-point scan, 2026-10-08, from the same ten source exports using `rg` word
matches across package/app TS/TSX (excluding built output and dependencies):

```text
apps/docs/browser/popover.spec.ts
apps/docs/browser/site.spec.ts
apps/docs/src/catalog.ts
apps/docs/src/examples/popover.tsx
packages/ui/src/index.ts
packages/ui/stories/popover.stories.tsx
packages/ui/test/popover-focus.test.tsx
packages/ui/test/popover.test.tsx
```

Shared source/story/focus inventories, registry counters and generated
`packages/ui/r/popover.json` consume the new file; the orchestrator registered
these. `site.spec.ts` consumes the shared family list and was read. The distinctive
available-width/height classes had no existing literal consumer. Existing
Dialog/Select/Sheet tests consume unchanged dialog/button/textbox roles.
Ten names scanned, zero sibling CROSS, zero UNOWNED. Eight new source consumers
are accounted for above; shared registration remains orchestrator-owned.

The independent second enumeration also found `packages/ui/test/entry-point.test.ts`
(the public barrel's dynamic export walk), which was read before the gate. The seven
story exports are Default, Controlled, Modal, Anchored, PreventDismiss, NestedSelect
and NestedOverlays; they are consumed through `test/helpers/story-suites.ts`,
`test/stories.test.tsx` and `test/tailwind-compile.test.tsx`, rather than direct
imports of the individual same-word story names. `PopoverExample` is the default
module export consumed by the catalog and explorer. `outputPath` is Playwright's
artifact helper; no route contract was introduced. Seventeen named exports
(ten public parts, seven stories), zero sibling CROSS, zero UNOWNED.

## Layer 1 (reviewer, detached worktree of fe6bdba2430ecae32f1069ba0ae0e30f4f9a6d05, slot port 4195)

| file                                         | test                                                                                                                                       | mutation applied                                                                   | red / GREEN | what it asserts now                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| packages/ui/test/popover.test.tsx            | opens nonmodal by default with caller-owned naming, then closes and restores focus                                                         | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | reports controlled changes without replacing the caller's open state                                                                       | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | preserves disabled triggers and canceled clicks                                                                                            | Content returns null                                                               | GREEN       | Trigger disabled/canceled clicks; mutation does not target Trigger                                  |
| packages/ui/test/popover.test.tsx            | forwards refs and custom hosts without injecting portal, arrow, Close or labels                                                            | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | Content alone keeps its caller label and injects no presentation or controls                                                               | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | respects a custom portal container and primitive positioning props                                                                         | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | Close is form-safe with asChild=false                                                                                                      | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | Close is form-safe with asChild=true                                                                                                       | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | preserves cancelable Escape, pointer interaction and autofocus callbacks                                                                   | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | allows prevented focus-outside to keep a nonmodal popover open                                                                             | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | outside focus dismisses nonmodal content without stealing the outside focus                                                                | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/popover.test.tsx            | modal content traps Tab, hides outside content and releases locks on Close                                                                 | Content returns null                                                               | red         | Missing Content must fail rendered dialog/ref/form/focus contracts                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover: has stories                                                                 | Content returns null                                                               | GREEN       | Module inventory only; mutation does not target story presence                                      |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/Default                                                                      | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/Controlled                                                                   | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/Modal                                                                        | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/Anchored                                                                     | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/PreventDismiss                                                               | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/NestedSelect                                                                 | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > popover/NestedOverlays                                                               | Content returns null                                                               | red         | Story play needs the composed Content and fails when it disappears                                  |
| packages/ui/test/popover-focus.test.tsx      | popover-trigger owns a compiled solid focus outline without docs CSS                                                                       | Remove all wrapper focus-visible outline utilities                                 | red         | Compiled outline style/width/offset/ink role is observed                                            |
| packages/ui/test/popover-focus.test.tsx      | popover-content owns a compiled solid focus outline without docs CSS                                                                       | Remove all wrapper focus-visible outline utilities                                 | red         | Compiled outline style/width/offset/ink role is observed                                            |
| packages/ui/test/popover-focus.test.tsx      | popover-close owns a compiled solid focus outline without docs CSS                                                                         | Remove all wrapper focus-visible outline utilities                                 | red         | Compiled outline style/width/offset/ink role is observed                                            |
| packages/ui/test/popover-focus.test.tsx      | popover-trigger owns 44px height and width                                                                                                 | Remove all wrapper focus-visible outline utilities                                 | GREEN       | 44px height/width only; mutation leaves target-size classes intact                                  |
| packages/ui/test/popover-focus.test.tsx      | popover-close owns 44px height and width                                                                                                   | Remove all wrapper focus-visible outline utilities                                 | GREEN       | 44px height/width only; mutation leaves target-size classes intact                                  |
| packages/ui/test/focus-outline.test.tsx      | the invariant, over every part rather than a hand-written table > finds every part that draws a focus ring, and knows which ones are short | Remove all wrapper focus-visible outline utilities                                 | red         | Independent focus-ring source inventory loses popover.tsx                                           |
| packages/ui/test/registry.test.ts            | registry.json > declares the twenty-six part families plus the one shared lib                                                              | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | registry.json > types every item by where its files live: a part is registry:ui, the shared lib registry:lib                               | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > points every file at a path that exists                                                                                    | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > registers every component source exactly once                                                                              | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | registry.json > targets the consumer's own component directory, not the library's layout                                                   | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > declares npm dependencies at the versions the package itself builds against                                                | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > resolves every registry dependency inside this registry                                                                    | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | registry.json > declares exactly the registry dependencies its sources import                                                              | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | registry.json > reads a source's registry dependencies as the items that ship the files it imports                                         | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > reads a source's imports at every specifier position and nowhere else                                                      | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > declares exactly the npm dependencies its own sources import, per item                                                     | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | registry.json > keeps no stylesheet's first token a comment                                                                                | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > has one file per item and nothing else                                                               | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > ships an INDEX that is the root registry, byte for byte                                              | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > advertises every item in that index, with its files                                                  | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > carries the CURRENT bytes of every source it ships                                                   | Remove Popover item from root registry.json                                        | red         | Live registry inventory/registration/count/built-index consistency fails                            |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > carries the title, description and both dependency lists into the item file                          | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > is inside the package's published files, so it installs with no network                              | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/ui/test/registry.test.ts            | the built registry in packages/ui/r > declares as RUNTIME dependencies everything the shipped sources import                               | Remove Popover item from root registry.json                                        | GREEN       | Other registered items remain valid; metadata/dependency/publish-property subject was not collapsed |
| packages/tokens/test/source-coverage.test.ts | published source coverage > walks exactly the published set, by path                                                                       | Remove Popover source and story paths from declared inventories                    | red         | Checked walk rejects Unexpected Popover source/story paths                                          |
| packages/tokens/test/source-coverage.test.ts | published source coverage > walks exactly the declared stories, by path                                                                    | Remove Popover source and story paths from declared inventories                    | red         | Checked walk rejects Unexpected Popover source/story paths                                          |
| packages/tokens/test/source-coverage.test.ts | published source coverage > reads real content for every one of them                                                                       | Remove Popover source and story paths from declared inventories                    | red         | Checked walk rejects Unexpected Popover source/story paths                                          |
| packages/tokens/test/source-coverage.test.ts | published source coverage > resolves a repo root that actually contains the packages                                                       | Remove Popover source and story paths from declared inventories                    | red         | Checked walk rejects Unexpected Popover source/story paths                                          |
| packages/tokens/test/source-coverage.test.ts | published source coverage > stripComments removes comments and keeps code                                                                  | Remove Popover source and story paths from declared inventories                    | GREEN       | Comment stripping is unchanged and outside mutation target                                          |
| test/explorer.test.tsx                       | selects a family, renders its real preview and exposes its composition                                                                     | Remove Popover catalog entry                                                       | GREEN       | Default Button preview/composition behavior is unchanged; mutation does not target it               |
| test/explorer.test.tsx                       | keeps every family discoverable and resets preview state when switching                                                                    | Remove Popover catalog entry                                                       | red         | Independent family count fails 25 versus 26                                                         |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > covers all twenty-six part families, with every story counted                        | Remove Popover from shared STORY_SUITES map                                        | red         | Filesystem story enumeration rejects omitted module                                                 |
| apps/docs/browser/popover.spec.ts            | Default nonmodal Popover closes on Escape, outside pointer and outside focus without stealing focus                                        | Add relative positioning to scrollable Content                                     | red         | Arrow clipping fails exact paint/hit assertion: Expected true / Received false                      |
| apps/docs/browser/popover.spec.ts            | Prevented Escape, outside pointer and outside focus preserve Popover while Close works                                                     | Drop Content Escape/pointer/focus-outside handlers                                 | red         | prevented Escape keeps the panel fails; Protected details disappears                                |
| apps/docs/browser/popover.spec.ts            | Popover hosts paint readable focus without docs CSS in dark, light, accent and forced colors                                               | Remove wrapper focus-visible outline utilities                                     | red         | Dark isolated trigger outline style fails: Expected solid / Received auto                           |
| apps/docs/browser/site.spec.ts               | renders every family and sends each workbench link to a real story                                                                         | Remove Popover catalog entry                                                       | red         | Preview family count fails: Expected 26 / Received 25                                               |
| apps/docs/browser/popover.spec.ts            | Default nonmodal Popover closes on Escape, outside pointer and outside focus without stealing focus                                        | Add opacity-0 to Arrow; observer logs computed opacity without changing assertions | GREEN       | TARGETED PAINT GAP: computed opacity 0, hit-testing true; fully transparent Arrow survives          |
| apps/docs/browser/popover.spec.ts            | Independent Anchor positions bounded scrollable content and leaves the final action hittable                                               | Add opacity-0 to Arrow; observer logs computed opacity without changing assertions | GREEN       | TARGETED PAINT GAP: opacity 0 survives before/after scrolling and resize                            |

Review closure, 2026-10-08: the 17 unaffected GREEN unit/inventory executions in
the table do not target the properties their mutations removed; no change was
needed. The two targeted GREEN Arrow paint rows exposed one MEDIUM instrument
gap. `paintedArrow` now multiplies SVG fill opacity by every ancestor's opacity,
then asserts positive effective paint before the existing visibility/hit check.
Test fix committed at `d8991eacf5f4c4457087f923bdac9a5be61c5f4e` before mutating.

Author closure control: added `opacity-0` solely to Arrow, confirmed the changed
line with `rg`, rebuilt Storybook/site, and reran only the two named mobile
browser discriminators. Both failed with `explicit Arrow paint opacity`,
`Expected > 0 / Received 0` (runner exit 1). Restored source from git and rebuilt;
the same two tests passed (2.0s, exit 0). Logs are under
`~/.marquee-scratch/BATCH-PARITY-3/popover/opacity-red.log` and `opacity-green.log`.
No product source change was needed. The independent report reviewed the original
`fe6bdba` checkpoint; this later instrument closure was author-run.

Reviewer totals: one MEDIUM finding, zero HIGH/LOW. Bounded unit controls ran
53 executions (36 red / 17 unaffected GREEN), browser controls six executions
(four red / two targeted GREEN, subsequently closed above). No dependency-store
mutation or shared runtime-state edit.

Screenshots were inspected at 390/768/1280: live demo in dark, isolated Storybook
in light, and the default Arrow at 390. Text, solid focus outlines, explicit Arrow
and form controls are legible and bounded. Scratch browser screenshots are
retained under `~/.marquee-scratch/BATCH-PARITY-3/popover/browser/`; batch evidence
publication is orchestrator-owned.

## Full stream gate

2026-10-08: one `DOCS_PORT=4191 pnpm verify` against committed `ba27fb8` exited 0.
Runner summaries: library `Test Files 46 passed (46)` / `Tests 801 passed (801)`;
docs `Test Files 4 passed (4)` / `Tests 39 passed (39)`; consumer `# tests 5` /
`# pass 5` / `# fail 0`; Chromium `150 passed (2.3m)`. Wall 06:30:40–06:33:23 IST,
2m43s. Sentinel, own runner log and timestamps are preserved under
`~/.marquee-scratch/BATCH-PARITY-3/popover/verify.*`. Final change records evidence
only; source bytes and registry output are unchanged from the gated artifact.
