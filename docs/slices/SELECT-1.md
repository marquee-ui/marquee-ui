# SELECT-1 — composed Select

Batch: BATCH-PARITY-1. Status: complete. Publication remains held in STATUS.md.

## Scope and ownership

Own `packages/ui/src/select.tsx`, `packages/ui/stories/select.stories.tsx`,
family-specific tests, `apps/docs/src/examples/select.tsx`,
`apps/docs/browser/select.spec.ts`, and this record. Use maintained Radix parts,
visual-only variants, semantic roles, 44px controls and composed children.
Orchestrator owns shared manifests/lock, exports, source/story maps, registry/counters,
catalog entries, global family counts and the packed-consumer seam; request wiring when ready.
Do not write another stream's files. No public publishing or version bump.

## Acceptance

Test first. Meaningful story plays cover keyboard, selection, disabled and controlled/
uncontrolled behavior; Escape, focus return, typeahead and native form participation.
Expose underlying supported primitive props and composition; document deliberate limits.
Live demo and highlighted copyable source are included. Primitive references are linked
from [the parity program](../component-parity.md).

Commit before mutation, prove the mutation landed and failed at the predicted assertion,
use an independent reviewer in a detached worktree, then one full `pnpm verify` stream gate.
The merged batch proves packed registry install/build/browser behavior at 390/768/1280.

## As built

Implemented 16 explicit Radix slots over `@radix-ui/react-select` ^2.3.8:
Select, Portal, Trigger, Value, Icon, Content, Viewport, Group, Label, Item,
ItemText, ItemIndicator, Separator, ScrollUpButton, ScrollDownButton and Arrow
(all with the Select prefix). Root and Portal retain the primitive API; styled
hosts forward their native primitive props, refs and supported `asChild` slots.
There are no structural variant props and no extra icon dependency.

Verified the maintained primitive and current dependency on 2026-10-08:
[shadcn Radix Select](https://ui.shadcn.com/docs/components/radix/select),
[Radix Select](https://www.radix-ui.com/primitives/docs/components/select), and
`pnpm view @radix-ui/react-select version` returned 2.3.8.

Deliberate differences from shadcn: Portal, Viewport, ItemText, ItemIndicator,
Icon and scroll controls are explicit caller compositions. Content does not
insert a portal or viewport; Item does not insert text or a check icon. Radix's
item-aligned positioning default is preserved, with popper positioning shown in
the demo. No compact sub-44px trigger size is offered. Value and ItemText stay
unstyled to preserve Radix positioning. Only semantic token roles paint the parts; focus outlines use primary-ink.
SelectSeparator draws a border so forced colors retains the separator.
This is single-choice Select; editable search and multiple selection belong to
other families. Items require nonempty values, as the underlying primitive does.

Nine stories with nine interaction plays cover uncontrolled selection/open,
controlled selection/open, keyboard/typeahead/disabled navigation, Escape and
focus return, disabled root, native form submission, custom slots and a 24-item
scrolling composition. Four independent API tests cover refs/asChild, controlled
change callbacks without accepting state, escape prevention and required/disabled
native form props. The demo submits the real native form value. Four browser
contracts run at 390/768/1280, including pointer reachability, 44px geometry,
popup bounds, dark/light/Violet-accent contrast, native submission, exact source
copy and the optional scroll controls.

Test-first evidence: the stories were written before select.tsx; focused Vitest
first failed resolving `@/select`, then exposed the absent jsdom ResizeObserver
and pointer-capture APIs. Orchestrator added conditional test-only shims. The
compiled floor test then actually failed on Radix's hidden native select:
`select[data-slot=-] \"AppleBananaCherryCarrot\" -> 0px`. Orchestrator narrowed the
walker exclusion to its aria-hidden, tabindex -1, inline 1px-by-1px plumbing;
visible controls remain measured. The final focused run is 192 passed in three
files; the Select browser run is 12 passed (2026-10-08 commands below).

```sh
pnpm exec vitest run --project ui packages/ui/test/select.test.tsx packages/ui/test/stories.test.tsx packages/ui/test/tailwind-compile.test.tsx
DOCS_PORT=4191 pnpm --filter @marquee-ui/docs exec playwright test browser/select.spec.ts
```

## Consumers

Pre-write scan at base 4dde0cd32a23fb72a1e824d7a4981c6b7207f8b4:
`rg -n 'Select|select\.tsx|select\.stories|combobox|listbox' packages/ui apps/docs packages/tokens/test registry.json`
found no existing Select symbol, source, story, combobox or listbox family consumer.
Generic prose referring to options and source selection was unrelated.

Commit-point symbol/path scan:
`rg -l '\bSelect[A-Za-z]*\b|select\.tsx|select\.stories|\./select|components/ui/select' packages/ui/src packages/ui/stories packages/ui/test packages/tokens/test apps/docs/src apps/docs/test apps/docs/browser registry.json`
returned the actual family consumers below (incidental plain-English Select hits
in copy-code/app/theme and toggle tests do not import or consume this family):

- packages/ui/src/select.tsx and index.ts (16 public symbols)
- packages/ui/stories/select.stories.tsx
- packages/ui/test/select.test.tsx, helpers/story-suites.ts and tailwind-compile.test.tsx
- packages/tokens/test/helpers/source-files.ts
- apps/docs/src/examples/select.tsx and catalog.ts
- apps/docs/browser/select.spec.ts and site.spec.ts
- registry.json and generated packages/ui/r/select.json / r/registry.json

Shared readers inspected: registry.test.ts, stories.test.tsx, tailwind-compile.test.tsx,
source-files.ts, explorer.test.tsx, site.spec.ts, focus-outline.test.tsx and
forced-colors-state.test.tsx. Independent review found the two derived guard
consumers after the first scan; both were run and their findings reconciled.
Shared wiring changes are
orchestrator-authored. No route contract changed; new roles combobox/listbox/option
come from Radix and are consumed only by the new family tests and demo. Class
strings have no pre-existing family-specific consumer; registry content is rebuilt
from the new source. No sibling stream file or behavior was edited.

## Layer 1 (reviewer, detached worktree of cb24fc8346899409e2a72e943d0824186755b60e, slot r5 / DOCS_PORT 4195)

| file                                                                                               | test                                                                                                                            | mutation applied                                                                                                                                                | red / GREEN                                                                                                                                                | what it asserts now                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| packages/ui/test/select.test.tsx                                                                   | preserves disabled and required native form props and excludes disabled values                                                  | Select Root drops disabled, required and name                                                                                                                   | red: expected disabled trigger, received enabled button; 1 failed / 3 passed                                                                               | Native disabled propagation is observed; remaining API tests are unrelated to dropped native props.                                                                           |
| packages/ui/test/select.test.tsx                                                                   | reports a controlled change while leaving the caller's value in charge                                                          | Select Root drops onValueChange                                                                                                                                 | red: expected exactly one beta call, received zero; 1 failed / 3 passed                                                                                    | Primitive selection reaches caller's callback.                                                                                                                                |
| packages/ui/test/select.test.tsx                                                                   | forwards refs and asChild to the actual hosts without injecting wrappers                                                        | SelectTrigger drops ref                                                                                                                                         | red: expected actual button, received null; 1 failed / 3 passed                                                                                            | A caller's trigger ref reaches its host.                                                                                                                                      |
| packages/ui/test/select.test.tsx                                                                   | preserves the primitive escape callback and its preventDefault contract                                                         | SelectContent drops onEscapeKeyDown                                                                                                                             | red: expected callback once, received zero; 1 failed / 3 passed                                                                                            | Escape invokes caller callback; prevention and remaining-open assertions also exist.                                                                                          |
| packages/ui/stories/select.stories.tsx, through stories.test.tsx                                   | select/Disabled, select/Controlled, select/ControlledOpen, select/NativeForm                                                    | Source Root forces disabled=false and no-op change/open callbacks, drops native name                                                                            | red: disabled missing, apple instead of cherry, open instead of closed, null instead of cherry; suite 5 failed / 143 passed including execution anchor red | Each named play observes its behavior. Five other Select plays survive because uncontrolled state, keyboard and host slots were not collapsed.                                |
| packages/ui/stories/select.stories.tsx, through stories.test.tsx                                   | select/Default, select/Keyboard, select/Escape, select/ControlledOpen, select/NativeForm, select/CustomParts, select/Scrollable | Source Root freezes uncontrolled value at defaultValue; Content prevents Escape                                                                                 | red: unchanged Apple/Section 1, popup remains open, native apple; suite 8 failed / 140 passed including execution anchor red                               | Together with prior probe every one of the nine Select plays has an actual behavior red. Disabled and Controlled remain GREEN here, as those behaviors were preserved.        |
| packages/ui/test/stories.test.tsx                                                                  | all nine select/* plays and runs all 94 play functions, and knows if one stopped running                                        | Skip the call only when name === select; keep composed plays and post-call ran.push                                                                             | GREEN: 148 passed (148)                                                                                                                                    | Counts prove discovery and completed runner branches, not invocation; all nine Select interaction bodies were suppressed. This limitation is already documented in this file. |
| packages/ui/test/registry.test.ts                                                                  | declares the twenty-two part families plus the one shared lib; seven other coverage/build checks                                | Remove only Select's item from SOURCE registry.json; leave source and committed r files                                                                         | red: missing select and source coverage, totals 23 instead of 24, index/output drift; 8 failed / 11 passed                                                 | Registry omission is detected by coverage and exact-output anchors. Surviving per-item checks check the remaining items; names listed below.                                  |
| packages/ui/test/tailwind-compile.test.tsx                                                         | measures every one of them at or above the floor                                                                                | Remove min-h-hit ONLY from SelectTrigger; hidden native-select exclusion unchanged                                                                              | red: eight button[data-slot=select-trigger] offenders -> 0px; 1 failed / 39 passed                                                                         | Narrow exclusion does not exempt the real trigger. CustomParts retains its Button floor and correctly is not an offender.                                                     |
| apps/docs/test/explorer.test.tsx                                                                   | keeps every family discoverable and resets preview state when switching                                                         | Remove only Select catalog entry                                                                                                                                | red: expected 22, received 21; 1 failed / 1 passed                                                                                                         | Catalog presence is independently pinned. Other Switch/Button-preview test is unrelated and stays GREEN.                                                                      |
| apps/docs/browser/select.spec.ts                                                                   | Select demo selects with the keyboard, skips disabled, restores focus and submits natively                                      | Source Root drops name, own docs/Storybook rebuilt                                                                                                              | red: Saved priority: null. instead of Saved priority: urgent.                                                                                              | FormData reads the real hidden native control.                                                                                                                                |
| apps/docs/browser/select.spec.ts                                                                   | Select popup fits, exposes 44px choices and stays readable through dark, light and accent roles                                 | Source SelectItem loses min-h-hit, own build                                                                                                                    | red: control tap height 36.296875, expected >=44                                                                                                           | Browser measures actual choice height.                                                                                                                                        |
| apps/docs/browser/select.spec.ts                                                                   | Select source is highlighted, copies exact bytes and contains its scrolling at every width                                      | Source catalog Select code becomes BROKEN SELECT SOURCE, own build                                                                                              | red: displayed bytes differ from independently read example                                                                                                | Preview source is checked against the example file.                                                                                                                           |
| apps/docs/browser/select.spec.ts                                                                   | Select's optional scroll parts reveal distant items in a constrained popup                                                      | Combined collapse includes item floor loss and inert scroll-down div                                                                                            | red at final-item tap height 36.296875; combined runner 4 failed                                                                                           | This red proves item geometry only; it did NOT prove autoscroll. Isolated probe below separates it.                                                                           |
| apps/docs/browser/select.spec.ts                                                                   | Select's optional scroll parts reveal distant items in a constrained popup                                                      | ONLY source ScrollDownButton pointer-move and pointer-down handlers preventDefault after props; own docs/Storybook rebuilt                                      | GREEN: all 4 mobile tests passed (4.0s); before hover 896, after hover 896                                                                                 | scrollTop > 0 was already true. Actual pointer autoscroll can be removed while this test passes.                                                                              |
| apps/docs/browser/site.spec.ts                                                                     | renders every family and sends each workbench link to a real story                                                              | Source SelectExample returns null; own docs rebuilt                                                                                                             | red: Select must render its actual parts, select-trigger not found; 1 failed / 3 passed                                                                    | Real Select preview presence is observed. Other three site tests are unrelated and remain GREEN.                                                                              |
| packages/ui/test/focus-outline.test.tsx (additional shared consumer)                               | finds every part that draws a focus ring, and knows which ones are short                                                        | Temporarily add Select to expected inventory (baseline 21/21 GREEN), then remove ONLY SelectTrigger focus-visible:outline-2 and focus-visible:shadow-focus-ring | red: actual sites omit select.tsx (focus-visible), expected retains it; 1 failed / 20 passed                                                               | Updated inventory notices loss of the Select ring. All other focus tests are unaffected and listed below.                                                                     |
| apps/docs/browser/select.spec.ts (author verification at e5fbfe1b5287b3d2555ae7df4a35bc4f4cdabacc) | Select's optional scroll parts reveal distant items in a constrained popup                                                      | Same isolated source pointer-move/pointer-down no-op, author own rebuilt Storybook/site, embed=true and beforeHover comparison                                  | red, AUTHOR-PROVED: Expected >0, Received 0; 1 failed, exit 1                                                                                              | Author reports new assertion names the scroll movement; reviewer did not rerun this new sha.                                                                                  |

Resolution of original-sha findings:

- Separator background-only drawing: changed to a 1px border at 7651bce; the
  actual forced-colors guard is now green and browser tests observe a solid,
  visible separator in forced-colors mode.
- Focus inventory: orchestrator added Select to the shared exact ring inventory
  at 7651bce; both relevant guard files now pass, 29 tests. The reviewer also
  verified that removing Select's ring declaration re-reddens the inventory.
- GREEN scroll-handler row: changed the browser fixture to `embed=true` to turn
  off Storybook autoplay, then compare hover movement to pre-hover scrollTop,
  at e5fbfe1. After committing, author applied the exact isolated no-op to the
  scroll pointer handlers, confirmed it landed, rebuilt Storybook and assembled
  the site, and ran the mobile scroll test. It failed at the intended assertion:
  `the scroll control must move the viewport beyond its pre-hover position`,
  expected greater than 0, received 0; runner 1 failed, exit 1. Source restored
  from git. Evidence: scratch s1/scroll-mutation.log and scroll-mutation.exit.
- GREEN story-runner row: unchanged, because it measures an existing, documented
  intrinsic limit of self-counted invocation. Every new play was independently
  reddened through its real source behavior. Counters prove discovery and branch
  completion; they are not claimed as proof that a call did work.
- Other GREEN survivors in the table retain behavior the particular mutation
  preserved. No weakened assertion or skip was added.

Review addendum: the orchestrator requested actual focus-outline contrast in
Light/Automatic before the gate. The docs renderer initially passed, but its
unlayered global focus rule overrides component outlines. The isolated Light
Storybook iframe (embed mode, no global focus rule) instead measured trigger
1.076784646077168 and highlighted item 1.0631628064607772 after CSS transitions
finished; the intended 3:1 assertion failed. Changed both source outlines from
primary to primary-ink. Actual isolated ratios are now 7.298350997385067 and
7.206023374482298 at all three widths; the full Select browser file passed 12
checks in 15.1s. The same existing browser contract now observes emitted Light
component styling and Dark/Automatic, Light/Automatic and Light/Violet docs
states, with CSS transitions finished before taking measurements. Diagnostic
prints are removed; assertions remain. Orchestrator separately owns standalone
packed-consumer verification. Evidence: scratch s1/outline-isolated-before.log
(exit 1) and outline-after.log (exit 0), measured 2026-10-08.

Author guard proof after committing 8444614: changed only the two source
outline roles back to primary, confirmed both lines with rg, rebuilt Storybook
and assembled it. The mobile popup test failed at the predicted assertion
`isolated Light trigger outline contrast`, expected at least 3, received
1.076784646077168 (1 failed, exit 1). Restored the source from git. Evidence:
scratch s1/outline-mutation.log and outline-mutation.exit. This confirms the
isolated assertion sees the part's own styling rather than the docs override.

Retro: the original scroll assertion measured existing state instead of a
pointer effect; browser evidence must compare before/after and establish the
fixture state. A focused docs rebuild clears the assembled Storybook directory:
run build:site again before probing its iframe. One attempted focused run omitted
that assembly and failed 3 iframe locators; reassembly restored the fixture, and
all 12 Select browser tests passed, including the stronger scroll assertion.
The full verify command performs assembly in its normal build chain.

## Gate

One full stream gate on 2026-10-08 at
8de07a6abaf042269db647be8637e12e1ba52ace:

```sh
PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH DOCS_PORT=4191 pnpm verify
```

Sentinel exit 0, wall 91 seconds. Runner summaries: library 38 files / 722 passed;
docs 4 files / 39 passed; consumer 5 passed / 0 failed; browser 75 passed across
390/768/1280 (1.2m). Lint, formatting, all workspace typechecks, token build,
registry build, docs build, Storybook build and site assembly passed in the same
chain. No product/DB/Steam command, merge, release, publication, deploy or version
bump ran. Subsequent slice-record commit contains only this completed evidence.
Logs and sentinel: /home/ankit/.marquee-scratch/BATCH-PARITY-1/s1/verify.log,
verify.exit, verify.start and verify.end. Packed new-family consumer proof is
orchestrator-owned and runs on the reconciled batch candidate.

## Packed-consumer outline closure

On 2026-10-08, the fresh packed consumer exposed a highlighted item's outline
style as none although its color had sufficient contrast. From reconciled
85967ec285dd160b0a1025528ac9b58408b3ec22, the isolated iframe reproduced that
failure at `isolated Light item outline style` (expected solid, received none).
Added `data-[highlighted]:outline-solid` to override the base outline-none style,
rebuilt the registry, and added isolated trigger/item style and width assertions
beside the existing contrast assertions. Focused tests: 5 files / 228 passed;
Select browser: 12 passed across all three widths (15.1s).

After committing 67162107f40d1117a889bee3265b49203e297d7b, removed only that new
style class, confirmed the source mutation landed, rebuilt Storybook and assembled
the site. The mobile popup test failed at the predicted item-style assertion:
expected solid, received none (1 failed, exit 1). Source restored from git.
Evidence: scratch s1/consumer-fix/{baseline-browser,fixed-browser,mutation-browser}.log
and corresponding exit sentinels. Merged gate and fresh packed proof are
orchestrator-owned; this closure used focused checks only.

## Nested Sheet closure

On 2026-10-08, added a NestedSheet story/play and real-browser contract using
default modal Sheet and Select primitives. Before the dependency change, the
mobile browser case failed at `nested Select receives option focus`: Apple was
visible but inactive (1 failed, exit 1). Dialog 1.1.23 and Select 2.3.8 used
different focus-scope/dismissable-layer generations. The orchestrator raised the
Dialog floor to 1.2.0 in the package and Sheet registry and installed the lock.

After alignment, the contract proves option focus and keyboard selection,
first Escape closes only Select and restores its trigger, second Escape closes
Sheet and restores the outside trigger, and an outside button responds after
pointer cleanup. Focused Vitest command covered select, stories, tailwind-compile,
focus-outline, forced-colors-state and registry: 6 files / 248 passed. After
build:storybook and build:site, `DOCS_PORT=4191 pnpm --filter @marquee-ui/docs exec
playwright test browser/select.spec.ts` passed 15 cases across 390/768/1280
(16.4s, exit 0), including the isolated outline style/width/contrast assertions.
Evidence: scratch s1/consumer-fix/nested-{baseline-browser,fixed-unit,fixed-browser}.log
and corresponding exit sentinels. No second stream gate ran; the orchestrator
owns the merged gate, independent integration review and fresh packed proof.
