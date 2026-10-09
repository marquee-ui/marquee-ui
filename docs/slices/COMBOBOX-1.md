# COMBOBOX-1 — composed searchable popup

Batch: BATCH-PARITY-5. Status: complete; unreleased.
Stream port 4191; reviewer 4195.

## Scope

Build a bounded single-select searchable popup with explicit parts, using cmdk
1.1.1 and the existing compatible Radix Popover. Expose caller-composed trigger,
portal/content, search input, list, items, groups and empty state; separate active
navigation from committed selection. Prove controlled and uncontrolled open state,
caller-controlled committed values, search/filtering, keyboard arrows/Home/End/Enter,
disabled choices, empty results, meaningful accessible labels, selected value display,
Escape/outside dismissal/focus return and composition inside Dialog/Sheet. Keep native
form state explicit in the caller example rather than implying an untested form API.

This is NOT drop-in current-shadcn API parity. The current shadcn Combobox page
(including its /radix URL) links Base UI and supports editable/chips/multiple APIs.
This batch deliberately retains the Radix stack and popup single-select recipe;
editable inline input, multiselect/chips, object collections and virtualization are
not included. No new Command family is promised. Use cmdk's plain root, not its Dialog.

Primary sources checked 2026-10-08:
[shadcn Combobox](https://ui.shadcn.com/docs/components/radix/combobox),
[cmdk](https://github.com/dip/cmdk#use-inside-popover) and
[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover).
`npm view cmdk version dependencies --json`: 1.1.1. Keep compatible overlay ranges.

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

Own only `packages/ui/src/combobox.tsx`, `packages/ui/stories/combobox.stories.tsx`,
`packages/ui/test/combobox*.test.tsx`, `apps/docs/src/examples/combobox.tsx`,
`apps/docs/browser/combobox.spec.ts` and this slice record.

## As built

Parts: Combobox (Radix open state), Trigger, Portal, Content, Command (plain cmdk
root), Input, List, Item, Group, Empty and Separator. The caller supplies every
part and all displayed selection/checkmark content. Commit via Item.onSelect;
Command.value/onValueChange track the active descendant only. The docs example
uses an explicit caller-owned hidden input, not a library form API. Ten stories
and ten plays cover search, keyboard selection, empty/disabled choices, controlled
open/external committed state, custom hosts, form submission, scrolling and
nested Dialog/Sheet. The story Outside action is below the popup's occupied
rectangle so its pointer proof exercises an exposed control.

cmdk 1.1.1 owns Input's aria-labelledby and List's aria-label: label the search
through Command.label and the results through List.label. Input has role combobox;
Trigger is a button opening the labelled Radix dialog. Native asChild on cmdk's
root/list/group is deliberately omitted from the public wrapper types. A real
root asChild section failed with `Cannot use 'in' operator to search for 'render'
in section`; that upstream behavior is retained in the scope decision instead
of introducing an internal compatibility layer. Popover Trigger asChild, Input
asChild and Item asChild are measured with their real hosts/ref/event behavior.
The omitted container properties are checked by TypeScript in the focused test.

## Consumers

Base snapshot scan at `be5a16344c9a178a40183c9ed57250a1b8cc914e`, using
`git grep -l -E 'combobox|Combobox' <base> -- apps packages registry.json`:

```text
apps/docs/browser/dialog.spec.ts
apps/docs/browser/popover.spec.ts
apps/docs/browser/select.spec.ts
packages/ui/stories/dialog.stories.tsx
packages/ui/stories/popover.stories.tsx
packages/ui/stories/select.stories.tsx
packages/ui/test/select.test.tsx
```

These refer to Radix Select's input role; no prior Combobox export, route or family
exists. Those contracts remain Select-owned. The added family uses the existing
Dialog/Sheet/Popover overlay stack, with nested selection/dismissal proof.

Commit-point symbol/path/role/class scan (2026-10-08):

```text
packages/ui/src/index.ts
packages/ui/test/helpers/story-suites.ts
packages/ui/test/focus-outline.test.tsx
packages/ui/test/registry.test.ts
packages/ui/test/stories.test.tsx
packages/ui/test/tailwind-compile.test.tsx
packages/tokens/test/helpers/source-files.ts
apps/docs/src/catalog.ts
apps/docs/test/explorer.test.tsx
apps/docs/browser/site.spec.ts
registry.json
packages/ui/r/combobox.json
```

These shared consumers belong to the orchestrator, which committed their wiring.
The new data slots are combobox-trigger/content/command/input/list/item/group/empty/
separator. The docs example is data-combobox-demo, story entry parts-combobox--default.
There are no new route or href helpers. Fourteen existing test/browser files
resolve combobox/option/listbox/dialog roles; the added family changes none of
their existing controls. The distinctive active-item outline literal appears
only in the generated combobox registry item. Source/stories inventory, global
story/play counters, focus inventory, registry counts and docs catalog/test
inventory are explicitly enumerated consumers and are included in review.

## Validation and retained failures

Test-first import failure is retained in scratch `s1/test-first.log`. Focused
eight-test unit suite passed after implementation (`s1/unit8.log`). The first
focused compiled-style run returned 310 passed / 1 failed: a real native hidden
form input was measured as an interactive 0px target. That exposed the shared
instrument's missing native-hidden-input distinction; the orchestrator owns its
correction and review. No fake geometry was assigned to the transport.

The initial seven-test mobile browser run returned 4 passed / 3 failed
(`s1/browser.log` and retained traces): the empty-state locator matched both
rendered results and highlighted source, the outside control was occluded by
the open popup, and forced-colors changed computed color-scheme to light dark.
The empty-state locator now scopes to the real listbox; the outside control is
placed below the popup; preset readiness is asserted before enabling forced
colors. The isolated paint proof reads actual outline style/width, exterior
background, composited paint contrast and cumulative ancestor visibility/opacity.
It runs across dark, light, accent and forced colors in all three viewports,
without docs CSS. Scroll/hit readiness checks include the final row, and full-page
screenshots capture canvases beyond the fold. Original failures are preserved.

After the three browser instrument/composition corrections, focused browser proof
passed 21/21 across mobile, tablet and desktop (`s1/browser2.log`). Focused root
checks passed 311 tests in five files (`s1/focused2.log`); docs passed 39 tests
(`s1/docs-focused.log`). Build and typecheck passed. Full isolated mobile dark,
accent and forced-color canvases, desktop light and final-row scroll captures
were visually inspected; the complete exterior focus outlines and final-row
geometry remain visible. Measurements and logs are dated 2026-10-08.

## Layer 1 (reviewer, detached worktree of ee7cb3dcd4e5f6d74dd0b0f0694996647e37fe1d, slot 5)

Initial review SHA dff1a0aeb50a90910c6f7ea4a63f1475993aa681 (product commit 3541fa280053f60223953779cbb9097043901819), base be5a16344c9a178a40183c9ed57250a1b8cc914e. The author supplied ee7cb3dcd4e5f6d74dd0b0f0694996647e37fe1d as a bounded browser-assertion closure; reviewer independently switched the detached checkout and repeated the same no-op. Product source is byte-identical between these two review SHAs.

<!-- prettier-ignore -->
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/test/combobox.test.tsx | filters, shows empty results and never commits a disabled item; keeps active navigation separate from caller-controlled committed choice | Override ComboboxItem.onSelect with undefined in source; confirmed at source line 102 | red: 2 failed / 6 GREEN | Both positive commit assertions reject the deleted callback: vi.fn expected once with cherry, actual zero. |
| packages/ui/test/combobox.test.tsx | supports uncontrolled dismissal and leaves outside focus at the clicked control | Same item selection collapse | GREEN | Separate dismissal, host/ref, disabled, controlled-open, keyboard-cancel, or empty-root contract; does not assert successful item commit. |
| packages/ui/test/combobox.test.tsx | passes actual hosts, refs and cancelable Escape through without an imposed portal | Same item selection collapse | GREEN | Separate dismissal, host/ref, disabled, controlled-open, keyboard-cancel, or empty-root contract; does not assert successful item commit. |
| packages/ui/test/combobox.test.tsx | a disabled trigger cannot open | Same item selection collapse | GREEN | Separate dismissal, host/ref, disabled, controlled-open, keyboard-cancel, or empty-root contract; does not assert successful item commit. |
| packages/ui/test/combobox.test.tsx | leaves controlled open state in charge and reports requests to its caller | Same item selection collapse | GREEN | Separate dismissal, host/ref, disabled, controlled-open, keyboard-cancel, or empty-root contract; does not assert successful item commit. |
| packages/ui/test/combobox.test.tsx | preserves the command keyboard preventDefault contract | Same item selection collapse | GREEN | Separate dismissal, host/ref, disabled, controlled-open, keyboard-cancel, or empty-root contract; does not assert successful item commit. |
| packages/ui/test/combobox.test.tsx | omits unsupported native cmdk container slots and generates no popup recipe | Same item selection collapse | GREEN | Separate dismissal, host/ref, disabled, controlled-open, keyboard-cancel, or empty-root contract; does not assert successful item commit. |
| packages/ui/test/stories.test.tsx | combobox/Default; combobox/Keyboard; combobox/NativeForm; combobox/Scrollable; combobox/NestedDialog; combobox/NestedSheet; runs all 161 play functions, and knows if one stopped running | Run the whole stories file with the same selection collapse | red: 7 failed / 216 GREEN | Six positive choice stories reject unchanged Apple/Section 1/not submitted; execution anchor sees the six aborted plays. |
| packages/ui/test/stories.test.tsx | combobox/EmptyAndDisabled | Same item selection collapse | GREEN | Separate negative selection/filtering, external open state, disabled trigger, or custom host contract. These plays do not make a successful item commit. |
| packages/ui/test/stories.test.tsx | combobox/ControlledOpen | Same item selection collapse | GREEN | Separate negative selection/filtering, external open state, disabled trigger, or custom host contract. These plays do not make a successful item commit. |
| packages/ui/test/stories.test.tsx | combobox/Disabled | Same item selection collapse | GREEN | Separate negative selection/filtering, external open state, disabled trigger, or custom host contract. These plays do not make a successful item commit. |
| packages/ui/test/stories.test.tsx | combobox/CustomParts | Same item selection collapse | GREEN | Separate negative selection/filtering, external open state, disabled trigger, or custom host contract. These plays do not make a successful item commit. |
| packages/ui/test/stories.test.tsx | combobox: has stories; covers all thirty part families, with every story counted | Same selection collapse | GREEN | Module presence and exact story inventory, separate from behavioral plays; unchanged story entries remain counted. |
| packages/ui/test/registry.test.ts | Every named test result listed in Appendix A: 8 red / 11 GREEN | Remove root registry item combobox, keeping committed generated registry untouched | red: 8 failed / 11 GREEN | Inventory, source coverage, 32 dependency/file anchors, generated index and source bytes catch removal. Other registry invariants remain separately valid. |
| packages/ui/test/focus-outline.test.tsx | gives every focus ring an outline beside it, or names it as a known gap | Replace all three Combobox focus-visible:outline-2 tokens with focus-visible:outline-0 | red: 1 failed / 20 GREEN | The compiled sweep rejects combobox.tsx outline-width 0; site-presence and unrelated families remain valid. |
| packages/ui/test/focus-outline.test.tsx | finds every part that draws a focus ring, and knows which ones are short; gives every focus ring an outline beside it, or names it as a known gap | Delete only trigger width token; separately delete every trigger focus-visible outline token | GREEN: 21/21 for each deletion | The sweep pools Input/Content/Trigger tokens by file and borrows the other hosts. LOW bounded instrument gap; live per-host browser paint rejects both changes. |
| packages/ui/test/tailwind-compile.test.tsx | found interactive elements to measure, and resolved a real variable; measures every one of them at or above the floor | FormPicker hidden native fruit input -> text, no classes; confirmed source line 239 | red: 2 failed / 38 GREEN | Hidden transport anchor becomes []; floor reports input[data-slot=-] -> 0px. It does not exempt ordinary visible inputs. |
| packages/ui/test/tailwind-compile.test.tsx | measures every one of them at or above the floor | Keep fruit hidden and add input type=mystery aria-hidden=true with no height classes; confirmed line 240 | red: 1 failed / 39 GREEN | Unknown native input type resolves to an ordinary text control and remains measured despite aria-hidden: input -> 0px; hidden transport anchor stays GREEN. |
| apps/docs/test/explorer.test.tsx | keeps every family discoverable and resets preview state when switching | Delete Combobox entry from catalog; confirmed catalog starts with Button at line 66 | red: 1 failed / 1 GREEN | Expected 30 preview controls receives 29. Switch-focused behavior test remains GREEN and is unrelated to Combobox inventory. |
| apps/docs/browser/site.spec.ts | renders every family and sends each workbench link to a real story | Build docs with Combobox catalog entry deleted; own generated site consumer | red: 3 failed / 9 GREEN | Each viewport rejects 29 families against 30; font, keyboard examples, and subpath tests remain GREEN and unrelated. |
| apps/docs/browser/combobox.spec.ts | demo searches without submitting, commits only on selection and uses caller native form state; keyboard active descendant skips disabled choices and Escape/outside preserve committed state; nested Dialog and Sheet retain focus and dismiss only the current layer; bounded list scrolls to its last selectable row with real hit readiness | Own Storybook/docs builds with ComboboxItem.onSelect undefined | red: 12 failed / 9 GREEN | All three viewports reject unchanged English/Apple/Section 1 at the positive commit assertions. |
| apps/docs/browser/combobox.spec.ts | controlled external state, disabled trigger and custom hosts stay compositional; isolated trigger, input, content and active choice paint in dark/light/accent/forced colors; copyable composition uses local registry aliases and preserves exact source | Same selection-collapse built consumer | GREEN: 9 across three viewports | External state/host checks, paint, and exact copy source do not make a successful item commit. |
| apps/docs/browser/combobox.spec.ts | isolated trigger, input, content and active choice paint in dark/light/accent/forced colors | Before paint, set actual trigger style outline:none!important; mutation confirmed | red: 3/3 | Exact dark trigger outline style failure: expected solid, received none. |
| apps/docs/browser/combobox.spec.ts | isolated trigger, input, content and active choice paint in dark/light/accent/forced colors | Before paint, set trigger parent opacity:0!important; mutation confirmed | red: 3/3 | Exact dark trigger cumulative ancestor opacity failure: expected >0, received 0. |
| apps/docs/browser/combobox.spec.ts | isolated trigger, input, content and active choice paint in dark/light/accent/forced colors | Rebuild own Storybook from source with every trigger focus-visible outline token removed | red: 3/3 | Per-host dark trigger outline style rejects actual auto versus solid, complementing the shared unit sweep that stayed GREEN. |
| apps/docs/browser/combobox.spec.ts | isolated trigger, input, content and active choice paint in dark/light/accent/forced colors | Real keyboard Tab path: remove trigger focus-visible:outline-2 class immediately before paint | red: 3/3 | landed:true, beforeWidth:2px, after:1px, style:solid, focusVisible:true, primary ink rgb(232,252,111); exact dark trigger width >=2 assertion receives 1. |
| apps/docs/browser/combobox.spec.ts | keyboard active descendant skips disabled choices and Escape/outside preserve committed state; nested Dialog and Sheet retain focus and dismiss only the current layer | Source Content.onCloseAutoFocus always preventDefault, own rebuilt Storybook | red: 6/6 | Exact trigger toBeFocused assertion receives inactive; the focus restoration check observes its effect independently of selection. |
| apps/docs/browser/combobox.spec.ts | nested Dialog and Sheet retain focus and dismiss only the current layer | Source Content.onEscapeKeyDown always preventDefault, own rebuilt Storybook | red: 3/3 | After inner Escape, listbox count expected 0 receives 1. Inner dismissal cannot disappear under this no-op. |
| apps/docs/browser/combobox.spec.ts | bounded list scrolls to its last selectable row with real hit readiness | Original dff1a0a: Element.scrollIntoView no-op via init script, actual End call counted | GREEN: 3/3 | PROVED false green: before target(last), scrollTop=0/calls=1; after helper, scrollTop=808. The helper repaired the keyboard effect being asserted. |
| apps/docs/browser/combobox.spec.ts | bounded list scrolls to its last selectable row with real hit readiness | Closure ee7cb3d: same independent Element.scrollIntoView no-op and before/after measurement | red: 3/3 | Exact End scrolls the list assertion now sees expected >0, actual 0 before target(last); helper is never reached. |

## Review closure

The table above is copied verbatim from the independent report in
`/home/ankit/.marquee-scratch/BATCH-PARITY-5/r5/report.md`; its Appendix A/B retain
all named unaffected survivors, complete runner summaries, mutation diffs and
original/restored logs. GREEN rows under Item.onSelect collapse exercise
separate negative/filtering, external-state, dismissal, host/ref, inventory or
keyboard-cancel contracts; they do not certify successful selection. No changes
were needed to those independent contracts. Their positive selection siblings
failed at their committed-value assertions.

The MEDIUM scrolling false-green is closed by `ee7cb3d`: the End-scrolling poll
now runs before the readiness helper can scroll a row into view. At the original
head the independent no-op registered one End scroll call, scrollTop was 0 before
the helper and 808 after it, and the test stayed 3/3 GREEN. At the closure head the
identical no-op produced 3/3 red at "End scrolls the list", expected >0 / actual 0;
the helper was never reached. This is a test-instrument correction; product source
is unchanged.

The LOW shared focus sweep pools declarations by file, so removing only Trigger's
width or complete focus rail stayed 21/21 GREEN while other hosts supplied the
file's tokens. This limitation remains explicit. The family has complementary
per-host browser proof: actual source rail removal failed at solid versus auto;
outline:none failed at solid versus none; a zero-opacity ancestor failed at
cumulative ancestor opacity >0; real keyboard focus with only the width class
removed measured 2px -> 1px (:focus-visible true, primary-ink paint) and failed the
width assertion in every viewport. No broader shared-sweep redesign is included.

The independent scan found five indirect consumers omitted from the original
list: `packages/ui/test/entry-point.test.ts`,
`packages/tokens/test/brand-guard.test.ts`,
`packages/tokens/test/literal-guard.test.ts`,
`packages/tokens/test/project-coverage.test.ts`, and
`packages/tokens/test/source-coverage.test.ts`. The reviewer ran them restored:
20 tests / 5 files green. They are included in the full gate.

Review restoration at ee7cb3d was clean. Independent runners reported 311 passed
in five UI files, 2 explorer tests, 20 additional consumer checks and 33 touched
browser cases across three viewports; each sentinel was exit 0. The reviewer also
ran complete nested Dialog/Sheet canvases in one pointer session per viewport,
including external value/open controls, the final Date row, the below-fold
Outside action, parent dismissal and restored outside focus: 6/6 green. All hit
targets measured at least 44px on both axes and matched their actual center hit.
The original and closure failures are retained separately. No product finding
remains open; the bounded shared focus-inventory limitation is recorded above.

## Gate-discovered separator correction

The first full gate at aa1d8f782dc3a6e74d238067b6c41fd4ac69d185 returned exit 1,
2026-10-08 10:07:30–10:08:02 IST, with 896 passed / 1 failed in 52 collected UI
files. The existing forced-colors at-rest guard detected the fill-only separator
class. Lint, typecheck and build passed; the chain stopped at root tests before
docs/consumer/browser. The complete original source/exit/timestamps/log remain in
`s1/gate-1/`. No assertion or threshold was weakened.

Test-first live border proof was committed at 4c60a31 and failed against the old
built consumer at "forced separator border width", expected >=1 / received 0.
The source correction at cc61733 replaces only the fill with a same-color border,
retaining the 1px geometry; generated registry refresh is 2b19857. Add the dynamic
consumer `packages/ui/test/forced-colors-state.test.tsx` to the scan list above:
this tree walk observes newly added part drawings even without a literal source
filename in its assertions. The independent bounded followup and its exact table
follow. The repeat full gate is justified by this actual source fix and runs at
2b19857, with any subsequent slice-record-only commit kept distinct.

## Layer 1 separator followup (detached 2b19857d3351bd97e85bb7d11aaed5c77c968c2c, slot 5)

<!-- prettier-ignore -->
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/test/forced-colors-state.test.tsx | gives every host drawn at rest in a background alone a paint the mode keeps | Restore only ComboboxSeparator source class from my-1 h-px border-t border-border to old my-1 h-px bg-border; landed at line 139 in committed reviewer checkout | red: 1 failed / 7 GREEN | Exact failure names combobox.tsx at rest drawn in background-color: var(--border) alone. Other seven mechanisms/state tests survive for separate subjects, named below. |
| apps/docs/browser/combobox.spec.ts | isolated trigger, input, content and active choice paint in dark/light/accent/forced colors | Independently rebuild own Storybook/site from that old-fill source | red: 3/3 | On every viewport, forced separator border width expected >=1 receives 0. The failure names the intended border property, not a navigation or timing failure. |
| apps/docs/browser/combobox.spec.ts | same paint test | Current source restored/new build; set actual trigger outline:none!important immediately before default paint | red: 3/3 | Exact dark trigger outline style expected solid receives none; changing helper kind support did not weaken the default outline contract. |
| apps/docs/browser/combobox.spec.ts | same paint test | Restore spec; set actual trigger parent's opacity:0!important before default paint | red: 3/3 | Exact dark trigger cumulative ancestor opacity expected >0 receives 0. The helper still walks ancestor opacity for its default branch. |
| packages/ui/test/forced-colors-state.test.tsx | every collected test | Restore separator source from git | GREEN: 8/8 | Existing forced-colors at-rest guard accepts the border correction; source and all prior invariants restored. |
| apps/docs/browser/combobox.spec.ts | all seven named cases, mobile/tablet/desktop | Restore browser spec from git and consume the reviewer's restored own product build | GREEN: 21/21 | Full Combobox browser file passes with new border branch, default outline paint, interactions, current-layer dismissal, copy, and keyboard scroll proof. |

PROVED closure: packages/ui/src/combobox.tsx:139 now draws the separator with a real 1px border, retaining h-px geometry and the same --border role. Independent normal-mode measurement at all three viewports, in arcade and light, reported height=1, borderTopWidth=1px, borderTopStyle=solid, boxSizing=border-box, marginTop/marginBottom=4px, and actual border RGBA equal to --border. Six preset/viewport measurements passed in three probe cases. No product finding remains open from this bounded followup.

The revised browser helper selects borderTopWidth / borderTopStyle / borderTopColor for kind=border, retains outlineWidth / outlineStyle / outlineColor and minimum width 2 for default kind=outline, and composites the selected ink against the actual exterior background with cumulative ancestor opacity. The separator call explicitly uses border with minimum width 1; its forced-colors baseline passes contrast >=3. The old-fill independent build fails the border-width assertion before reaching contrast, as predicted. Normal geometry/role measurement is in separator-geometry.log; no normal-mode contrast floor was invented for the decorative separator.

The original author's red gate is preserved unmodified as separator-author-original-gate-verify.{log,exit,sha,started,finished}; its runner says "1 failed | 896 passed (897)", exit 1, and names the same at-rest fill-only class. This review independently reproduces the failure instead of treating that author's result as certification.

Build/test evidence (all under r5):

- separator-build-current.log: own initial pnpm build exit 0 before compiled-sheet tests/browser consumers.
- separator-guard-current.log: 8 passed, exit 0; separator-browser-current.log: 3 passed, exit 0.
- separator-old-fill.diff: exact source mutation; old-fill guard 1 failed / 7 passed, exit 1; old-fill own build exit 0; old-fill paint 3 failed, exit 1, exact width >=1 / 0.
- separator-build-restored.log: restored own Storybook/site build exit 0.
- separator-default-outline-none.{diff,log,exit} and separator-default-opacity-zero.{diff,log,exit}: each 3 failed, exit 1, exact predicted default properties.
- separator-guard-restored.log: 8 passed / 1 file, exit 0.
- separator-geometry.log: 3 passed, exit 0, exact normal-mode geometry and role readings.
- separator-browser-restored.log: 21 passed (21.7s), exit 0; all three configured viewports.
- separator-restored-status.txt is empty; separator-restored-sha.txt records the reviewed commit.

Every surviving old-fill guard test is separate from the at-rest separator invariant:

- found a sheet and the revealed elements to measure
- tells the mechanisms apart rather than passing everything
- gives every revealed element a foreground or a forced-colors treatment
- found the states drawn only in colour, from the literals, placed by the sheet
- tells the carriers apart rather than passing everything
- gives every state drawn only in colour a forced-colors treatment, or a sibling that carries it
- found the hosts drawn at rest, and tells a fill alone from a drawing the mode keeps

All old r5 broad-review evidence remains untouched. Only this bounded followup was run; no full verify, author/sibling write, node_modules mutation, publication, or push occurred. All mutations were in the new detached reviewer checkout and restored from git. Own port 4195 was used. The clean detached worktree is ready for preauthorized removal after this report is durable.

## Stream result

The justified second full gate is green: `DOCS_PORT=4191 pnpm verify`, source
`2b19857d3351bd97e85bb7d11aaed5c77c968c2c`, 2026-10-08 10:20:43–10:25:07 IST
(4m24s), sentinel exit 0. Runner summaries: 52 library files / 897 tests; four docs
files / 39 tests; five consumer checks; 240 browser cases across mobile, tablet
and desktop (3.9m browser phase). Lint, typecheck and build also passed. Artifacts
are `s1/verify.{sha,started,finished,exit,log,initial-status}` under the batch scratch.
The first failed gate remains unmodified under `s1/gate-1/`.

All commits after the gated source change only this slice record. The product,
registry, stories, examples and test files are byte-identical to the green gate's
source. Both independent reviewer checkouts were restored clean and removed;
all r5 reports, control diffs, logs, traces and screenshots remain durable. The
bounded shared file-level focus-inventory limitation is recorded, with independent
per-host browser proof. No remaining product finding blocks this stream. Shared
integration, combined review/gate, draft PR2 and public operations remain with the
orchestrator; no STATUS, main merge, deployment or package release was performed.
