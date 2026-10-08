# SLIDER-1 — composed Slider

Batch: BATCH-PARITY-4. Status: complete; unreleased. Stream port 4192; reviewer 4196.

## Scope

Expose Root, Track, Range and Thumb as explicit parts. Caller composes each
thumb and names it; no implicit thumbs from a configuration array. Prove controlled
and uncontrolled single/range values, keyboard Home/End/arrows/page/shift stepping,
min/max/step/minStepsBetweenThumbs, pointer dragging and commit callbacks, disabled,
orientation and direction semantics. Exercise native form serialization and reset
behavior; document any primitive limit truthfully rather than promising native reset
without observing it. Prove real 44px thumb targets without enlarging the visible
track into an unrelated control. Name both range thumbs independently and show
accessible value text where it adds meaning. Do not implement unrelated form APIs.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/slider)
and [shadcn](https://ui.shadcn.com/docs/components/radix/slider). Dependency: `@radix-ui/react-slider@^1.5.0`.
DropdownMenu's Menu 2.1.25 resolves dismissable-layer 1.1.20 and focus-scope 1.2.0,
the current overlay generation. Installed artifacts must prove compatibility too.

## Execution and ownership

Test first, implement, commit, obtain a fresh detached layer-1 review, then one full
stream `pnpm verify` after findings close. Use Node 22.18.0 and pnpm 10.24.0.
The orchestrator owns exports, dependencies/lockfile, registry, source/story/focus
inventories, counts, catalog, guide and STATUS. Request wiring as soon as the
source, stories and example stabilize; report exact exports and story/play counts.
You are not alone: preserve other agents' edits and do not revert their files.
No Pile database, Steam, screenshots pipeline or public operations. Publication held.

Retain strict types, role-only styles, supported primitive props/refs and asChild.
44px real interactive targets, dark/light/accent and forced-colors behavior must be
measured in Chromium at 390/768/1280. Focus checks observe actual style, width and
contrast outside docs CSS; arrow checks observe actual visible paint. Use live nodes
and actual focus/listener/animation/hit readiness, not fixed sleeps. Stories have
meaningful plays; examples are highlighted, exact-copy and use registry aliases.

Run meaningful negative controls only from committed detached copies; verify the
mutation landed and the named assertion is the predicted red, then restore from git.
The independent reviewer runs collapse/no-op controls across every touched test file,
reports surviving green assertions and writes its report to durable scratch. Paste
its mutation table and closure evidence here. Do not broaden into unrelated audits.
The orchestrator handles the merged review, packed consumer and stable preview.

Own only `packages/ui/src/slider.tsx`, `packages/ui/stories/slider.stories.tsx`,
`packages/ui/test/slider*.test.tsx`, `apps/docs/src/examples/slider.tsx`,
`apps/docs/browser/slider.spec.ts` and this slice record.

## Evidence

Test-first on 2026-10-08: `pnpm exec vitest run --project ui
packages/ui/test/slider.test.tsx` first failed resolving the not-yet-created
Slider source. After implementation, the runner reports 16 passed. The focused
Slider plus story suite reports 217 passed, and `pnpm typecheck` exits 0.

The installed `@radix-ui/react-slider@1.5.0` restores initial mount values on
form reset. Uncontrolled and external-form resets are observed in the component
tests; controlled reset calls the owner and cannot override an unchanged `value`.
Changing `defaultValue` after mount does not change the reset baseline. Keyboard
Home targets the first range thumb and End the last; direction/inversion and
`preserveThumbOrder` retain their primitive behavior.

The disabled state blocks interaction but its hidden named inputs remain
successful form controls. A native disabled fieldset excludes those values;
both facts are tested. The docs example composes that fieldset, and its copy
states the limitation rather than promising native-disabled parity.

The targeted browser runner (`DOCS_PORT=4192 pnpm --filter @marquee-ui/docs exec
playwright test browser/slider.spec.ts`, after `pnpm build`, 2026-10-08) reports
15 passed in 18.0s across 390/768/1280. It observes the native disabled-input
limitation by temporarily lifting only the native fieldset and reading FormData,
then restoring the fieldset. It also measures dark/light/Violet focus style,
width and contrast outside docs CSS; selected-range contrast and nonempty paint;
forced-colors movement; orientation, direction and inversion movement; real
pointer drag/commit; keyboard values; native reset; and highlighted exact copying.

The first browser run found a real target defect: a 44px thumb with a circular
host had corners whose `elementFromPoint` was Radix's wrapper, while its center
was the thumb. Removing the host's rounding fixes all three measured points;
the decorative 20px marker remains round. Browser iteration also corrected
instrument assumptions: embedded stories do not auto-run plays, and a disabled
control must be clicked with the real mouse rather than Locator's enabled wait.
The focused source/focus/registry/compiled-floor runner reports 96 passed.

## Consumers

Before implementation, `rg -n 'Slider|slider.tsx|slider.stories' packages apps
registry.json` produced no matches. No routes or pre-existing Slider roles
changed. Planned exports: `Slider`, `SliderTrack`, `SliderRange`, `SliderThumb`.

At the commit point, `rg -l '\b(Slider|SliderTrack|SliderRange|SliderThumb)\b'
packages apps --glob '*.ts' --glob '*.tsx' --glob '*.json'` names:

```text
apps/docs/src/examples/slider.tsx
apps/docs/browser/site.spec.ts
apps/docs/src/catalog.ts
apps/docs/browser/slider.spec.ts
packages/ui/r/registry.json
packages/ui/src/slider.tsx
packages/ui/r/slider.json
packages/ui/src/index.ts
packages/ui/test/tailwind-compile.test.tsx
packages/ui/test/slider.test.tsx
packages/ui/stories/slider.stories.tsx
```

The path/basename scan additionally names the source inventory, story suites,
registry tests and focus-outline inventory. The literal-class and ARIA scans
name the new family tests and compiled-floor test. Shared consumers are CROSS
to the orchestrator: catalog, site/explorer checks, package exports, source/story
inventories, story counts, registry and focus/floor guards. Wiring requests were
fulfilled in `77139aed` and the source-comment registry refresh in `da9029d1`.
No other stream's behavior is consumed or changed; no unowned contract moved.

## Decisions

1. Expose four explicit parts and never synthesize thumbs from `value`.
2. Use a 44px draggable host with a 20px decorative marker; keep the track narrow.
3. Delegate reset and disabled behavior to Radix and state its observed limits.
4. Demonstrate disabled-value exclusion through a native disabled fieldset.
5. Keep publication held; no PR, release, merge or deployment from this stream.

## Layer 1 (reviewer, detached worktree of 2ad682471899d911f102d5ef1152ef3b6b689e62, slot r6 / DOCS_PORT=4196)

<!-- prettier-ignore -->
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/test/slider.test.tsx | steps by min/max/step…; rejects a range move…; four honors-direction cases; serializes…; resets uncontrolled… | U01-freeze-values: Force uncontrolled Root value to initial default array, making value updates a no-op. | Eight red; eight GREEN. | Uncontrolled keyboard/value/form updates fail; retained controlled callbacks and static contracts survive appropriately. |
| packages/ui/test/stories.test.tsx | slider/Default, Range, Vertical, RightToLeft, Inverted, InAForm, AsChild | U02-stories-freeze: Same initial-value freeze, running every new Slider story play. | Seven red; four GREEN. | Every uncontrolled enabled story observes changed values; Controlled, ControlledRange, Disabled and has-stories survive for distinct valid reasons. |
| packages/ui/test/slider.test.tsx | serializes single, range and per-thumb names through the primitive's native inputs | U03-native-name: Remove Root name transport prop. | red | Exact FormData entries lose root-named volume/window values; per-thumb names do not substitute for those values. |
| packages/ui/test/tailwind-compile.test.tsx | measures every one of them at or above the floor | U04-thumb-floor: Replace actual Thumb size-11/min-h-hit/min-w-hit with size-5. | red; anchor GREEN | Actual slider-thumb heights resolve to 20px; candidate/transport collection remains intact. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements to measure, and resolved a real variable | U05-remove-slider-selector: Delete [role=slider] from interactive selector. | red; floor GREEN | Anchor detects that real slider thumbs vanished even when remaining controls clear the floor. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements…; measures every one… | U06-visible-transport: Make the actual volume transport display:block before guard evaluation. | both red | Visible native input is measured as input[data-slot=-] -> 0px; transport anchor becomes []. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements…; measures every one… | U07-orphan-transport: Move actual volume transport under a new span instead of direct Slider child. | both red | Non-direct/orphan input cannot borrow Slider transport exemption; floor and transport anchor both detect it. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements…; measures every one… | U08-mismatched-transport: Change actual volume transport value to 999 while thumb remains 40. | both red | Value-mismatched input cannot borrow the exemption; floor and transport anchor both detect it. |
| packages/ui/test/focus-outline.test.tsx | gives every focus ring an outline beside it, or names it as a known gap | U09-focus-width: Delete actual Thumb focus-visible:outline-2. | red; two anchors GREEN | Reports slider.tsx (focus-visible): outline-width null; unaffected ring-site inventory/predicate remain valid. |
| packages/ui/test/registry.test.ts | declares the twenty-eight part families plus the one shared lib; seven coverage/build/dependency arms | U10-registry-family: Remove slider item from source registry.json; keep built source intact. | Eight red; eleven GREEN | Exact item list, source coverage, dependency totals and built registry detect omitted family. Surviving other-item properties are unaffected. |
| packages/ui/test/stories.test.tsx | covers all twenty-seven part families, with every story counted; runs all 141 play functions… | U11-story-family: Remove slider from shared STORY_SUITES. | Two red;188 GREEN | Exact suites/file and play-count anchors detect lost family. Unchanged sibling stories still pass; their names are listed below, not audited. |
| apps/docs/test/explorer.test.tsx | keeps every family discoverable and resets preview state when switching | U12-explorer-family: Remove Slider entry from docs catalog. | red; other test GREEN | Independent family count observes27 versus 28. Existing Button/Card composition test is unaffected. |
| apps/docs/browser/slider.spec.ts | keys/commit/form; orientation; isolated forced-color movement; native form reset | B01-no-keyboard: Override actual Root key handler to preventDefault, rebuild and run entire new file on mobile. | Four red; pointer test GREEN | Keyboard assertions see unchanged aria-valuenow; pointer updates are a distinct preserved contract. |
| apps/docs/browser/slider.spec.ts | Slider keys step, constrain independently named range values, commit, submit and reset | B02-tiny-target: Reduce actual Thumb target to 20px, rebuild docs. | red | Named real slider thumb tap width assertion receives 20 versus 44. |
| apps/docs/browser/slider.spec.ts | Slider focus and markers paint without docs CSS in dark, light, accent and forced colors | B03-no-focus: Replace actual Thumb focus-visible:outline-solid with outline-none; rebuild isolated Storybook. | red | Dark/Automatic isolated focus style receives none versus solid; docs CSS cannot supply missing paint. |
| apps/docs/browser/slider.spec.ts | Slider focus and markers paint without docs CSS in dark, light, accent and forced colors | B04-no-selected-paint: Replace actual Range bg-primary-ink with bg-transparent; rebuild isolated Storybook. | red | Named selected range contrast receives 1.425971921993074 versus minimum 3; dimensions alone do not certify paint. |
| apps/docs/browser/slider.spec.ts | Slider keys step, constrain independently named range values, commit, submit and reset | B05-no-form-name: Remove actual Root name transport prop, rebuild docs. | red | Saved volume: null; range:70–80 differs from expected volume 5; live FormData submission is observed. |
| apps/docs/browser/site.spec.ts | renders every family and sends each workbench link to a real story | B06-site-family: Remove Slider catalog entry, rebuild docs. | red | Rendered real catalog has 27 Preview buttons versus 28. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements…; measures every one… | U13-unnamed-transport: Set actual volume thumb aria-label empty and remove aria-labelledby before guard. | both GREEN | PROVED LOW-1: attribute presence does not prove the named-thumb condition. |
| packages/ui/test/slider.test.tsx | resets uncontrolled values to their initial value, including an external form association | U14-no-form-reset-association: Override Root form prop with nonexistent form id. | red | Native external reset association is observed: value remains 100 versus expected 30. |
| apps/docs/browser/slider.spec.ts | Slider keys step, constrain independently named range values, commit, submit and reset | B07-clipped-target: Keep actual 44x44 Thumb bounds but clip pointer paint/hit area to circle 20px; rebuild docs. | red | Named thumb accepts pointer beyond visible marker receives false versus true; corner/center geometry alone is insufficient. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements…; measures every one… | U15-dangling-labelledby: Remove actual volume thumb aria-label; add aria-labelledby pointing at nonexistent id. | both GREEN | PROVED LOW-1: attribute presence accepts unresolved naming reference too. |

## LOW-1 closure (reviewer detached fixed sha 14e2224b6e650b1f50efd60e20505e466fe7bc86, slot r6)

Author HEAD independently verified as14e2224b6e650b1f50efd60e20505e466fe7bc86 before checkout. The only diff from reviewed 2ad6824 is the naming condition in packages/ui/test/tailwind-compile.test.tsx: it now trims explicit aria-label and resolves aria-labelledby ids to nonempty referenced text. No library source, story, demo or browser test changed.

<!-- prettier-ignore -->
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements to measure, and resolved a real variable; measures every one of them at or above the floor | C01-empty-label: actual volume thumb aria-label empty; aria-labelledby removed, mutation verified LANDED before runner | both red, exit 1; runner2 failed / 38 skipped | An unnamed counterpart no longer permits hidden-input exemption: transport [] differs from [volume], and input[data-slot=-] -> 0px is measured. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements to measure, and resolved a real variable; measures every one of them at or above the floor | C02-dangling-labelledby: actual volume thumb aria-label removed; aria-labelledby points at absent review-missing-label, verified LANDED before runner | both red, exit 1; runner2 failed / 38 skipped | An unresolved naming reference no longer permits exemption; transport and floor independently detect it. |
| packages/ui/test/tailwind-compile.test.tsx | entire file | C03-restored-baseline: restore source from fixed sha then run full file | GREEN, exit 0; runner40 passed | Real named Slider transport remains exempt; actual thumbs remain measured; existing narrow Select exemption still works. |

Closure verdict: **LOW-1 CLOSED / PROVED** at 14e2224. C01/C02 actual reds name the predicted transport anchor and floor assertions, not a broken build or collector. No tested assertion stayed GREEN during either malformed-name control; the38 runner-skipped tests were outside focused selection. Restored full-file runner reported `Test Files1passed(1)` / `Tests40 passed(40)` after both mutations were reverted. Full logs and landed snapshots are C01-empty-label._, C02-dangling-labelledby._, C03-restored-baseline.log, closure.json and closure-run.log alongside this report.

GREEN survivor disposition: U01/U02 retain controlled/static/disabled contracts
outside the frozen uncontrolled value; U04 retains the collection anchor while
floor measurement fails; U05 retains the remaining controls' floor while its
candidate anchor fails; U09 retains inventory/predicate controls; U10 retains
unaffected other-item dependency properties; U11 retains unchanged sibling story
plays; U12 retains the unrelated Button/Card composition; B01 retains the pointer
path while keyboard paths fail. No assertion change is needed for these survivors.
U13/U15 were the sole real weakness: the orchestrator changed the shared exemption
in `14e2224`, and independent C01/C02 now reject both malformed naming states.
C03 is a positive restored baseline, not a collapse survivor.

The review ran 22 original controls plus two malformed-name closure controls and
one restored full-file baseline. It found 0 HIGH / 0 MEDIUM / 1 LOW, with the LOW
independently closed. Every GREEN survivor is named in the durable reviewer
report at `/home/ankit/.marquee-scratch/BATCH-PARITY-4/r6/report.md`. The independent
consumer scan found no missed consumer. No product source changed after the
reviewed `2ad6824`; the naming-only guard fix was separately reviewed at `14e2224`.

## Full stream gate

On 2026-10-08, the one full stream gate ran with Node 22.18.0 / pnpm 10.24.0:

```sh
PATH=/home/ankit/.nvm/versions/node/v22.18.0/bin:$PATH DOCS_PORT=4192 \
DOCS_BROWSER_OUTPUT=/home/ankit/.marquee-scratch/BATCH-PARITY-4/slider/gate-browser pnpm verify
```

Artifact: clean committed `9ee4c0727ff511fc503e738e9b964a57b03dd71a`.
Sentinel exit **0**, wall **214s**. Runner summaries:

```text
Test Files 49 passed (49)
Tests 848 passed (848)
Test Files 4 passed (4)
Tests 39 passed (39)
# tests 5
# pass 5
# fail 0
189 passed (3.0m)
```

This covers lint, typecheck, token/UI/docs/registry/Storybook/site builds, the
library and docs suites, consumer checks, and all three Chromium browser widths.
The final post-gate edit changes only this record. The reviewer worktree was
verified clean at `14e2224` and removed; port 4196 is free. Gate logs, sentinel,
source SHA and timing remain in the assigned stream scratch directory. No
publication operation, PR, merge, release or deployment ran in this stream.
