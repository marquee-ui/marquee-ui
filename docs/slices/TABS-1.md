# TABS-1 — composed Tabs

Batch: BATCH-PARITY-1. Status: active. Publication remains held in STATUS.md.

## Scope and ownership

Own `packages/ui/src/tabs.tsx`, `packages/ui/stories/tabs.stories.tsx`,
family-specific tests, `apps/docs/src/examples/tabs.tsx`,
`apps/docs/browser/tabs.spec.ts`, and this record. Use maintained Radix parts,
visual-only variants, semantic roles, 44px controls and composed children.
Orchestrator owns shared manifests/lock, exports, source/story maps, registry/counters,
catalog entries, global family counts and the packed-consumer seam; request wiring when ready.
Do not write another stream's files. No public publishing or version bump.

## Acceptance

Test first. Meaningful story plays cover keyboard, selection, disabled and controlled/
uncontrolled behavior; horizontal/vertical direction, automatic/manual activation, focus and panel association.
Expose underlying supported primitive props and composition; document deliberate limits.
Live demo and highlighted copyable source are included. Primitive references are linked
from [the parity program](../component-parity.md).

Commit before mutation, prove the mutation landed and failed at the predicted assertion,
use an independent reviewer in a detached worktree, then one full `pnpm verify` stream gate.
The merged batch proves packed registry install/build/browser behavior at 390/768/1280.

## As built

`Tabs`, `TabsList`, `TabsTrigger` and `TabsContent` wrap
`@radix-ui/react-tabs ^1.1.22`. Checked the maintained
[shadcn Tabs](https://ui.shadcn.com/docs/components/radix/tabs) and
[Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) references
on 2026-10-08; `pnpm view @radix-ui/react-tabs version` returned `1.1.22`.

Primitive props and refs pass through all four parts, including `asChild`,
controlled/uncontrolled state, `dir`, orientation, activation mode, list `loop`,
disabled triggers and content `forceMount`. `TabsList` adds only the visual
`default`/`line` axis. Triggers have 44px minimum height and width; vertical
triggers fill their list width. Enabled text, selected line markers and focus use
existing ink roles; disabled text uses the disabled tier. Focus includes a real
outline for forced colors; selected tabs also retain an outline when unfocused. No token contract or existing family changed.

Six stories with six plays cover automatic/uncontrolled selection, default and
line styles, manual Enter/Space activation, horizontal/vertical navigation,
disabled skipping, Home/End, looping/non-looping lists, tab-to-panel focus,
controlled parent updates and reset, RTL, ARIA association and all four composed
hosts. The family contract test additionally proves ref targets, caller props,
`forceMount` and controlled state retained until the caller updates it.
The family focus test reads each rendered standard/composed tab and panel host
against the compiled stylesheet, requiring its own focus selector, outline width,
offset and ink role. A panel cannot lend a trigger its focus declaration.

The live, highlighted and copyable example composes horizontal automatic tabs
and vertical controlled manual tabs. Deliberate limits: content is supplied by
the caller; no data-driven panels, icons or animation are injected. `forceMount`
preserves Radix behavior: inactive content remains mounted and the caller owns
any hiding/animation of forced content. Horizontal lists keep one row; callers
with many or long labels must compose a scroll container or choose vertical
orientation. This slice adds no responsive orientation switch.

Focused validation before review (2026-10-08):

- Test-first absent-source run: `pnpm exec vitest run --project ui
packages/ui/test/tabs-contract.test.tsx` exited 1 at the missing `@/tabs` import.
- Root `pnpm typecheck` exited 0. Story and contract run: 2 files / 146 passed.
- Compiled utility/44px suite: 40 passed. Registry after regeneration: 19 passed.
- Token/docs builds exited 0. `DOCS_PORT=4192 pnpm --filter @marquee-ui/docs
exec playwright test browser/tabs.spec.ts`: 6 passed in 8.7s, at 390/768/1280.
  It observes horizontal/vertical keyboard behavior, associations, both 44px
  axes, pointer hits, list geometry, contained layout, exact clipboard bytes,
  highlighted source, real text/focus contrast in dark/light with Automatic and
  Violet accent, and forced-colors outline. Screenshots are in the stream's
  scratch browser output, one composition per width.

An initial contract assertion expected a single callback in automatic mode while
the controlled caller retained its old value. Radix calls on mouse-down and
automatic focus in that case. The contract now explicitly uses manual mode for
the exact callback assertion; the automatic controlled story updates the parent
and proves the real selection. No behavior workaround was introduced.

## Consumers

Pre-scan at base `4dde0cd32a23fb72a1e824d7a4981c6b7207f8b4`, before source
creation (2026-10-08):

```text
git grep -n -E 'Tabs(List|Trigger|Content)?|role="(tab|tablist|tabpanel)"|getByRole\("(tab|tablist|tabpanel)"' -- packages apps
(no matches; exit 1)
git grep -l -F -e 'tabs.tsx' -e 'tabs.stories.tsx' -- '*.test.ts' '*.test.tsx' '*.spec.ts' '*.json'
(no matches; exit 1)
```

Post-scan at the implementation commit point (2026-10-08):

```text
rg -l '\b(Tabs|TabsList|TabsTrigger|TabsContent)\b' packages/ui/src packages/ui/stories packages/ui/test apps/docs/src apps/docs/browser packages/ui/r
apps/docs/src/examples/tabs.tsx
packages/ui/src/index.ts
packages/ui/stories/tabs.stories.tsx
packages/ui/src/tabs.tsx
packages/ui/r/tabs.json
apps/docs/src/catalog.ts
packages/ui/r/registry.json
apps/docs/browser/site.spec.ts
apps/docs/browser/tabs.spec.ts
packages/ui/test/tabs-contract.test.tsx

rg -l 'tabs\.tsx|tabs\.stories|group/tabs-list' packages apps registry.json
registry.json
apps/docs/browser/tabs.spec.ts
packages/tokens/test/helpers/source-files.ts
packages/ui/src/tabs.tsx
packages/ui/r/registry.json
packages/ui/r/tabs.json
packages/ui/test/helpers/story-suites.ts

rg -l 'getByRole\("(tab|tablist|tabpanel)"|\[role=.tab' packages apps
apps/docs/browser/tabs.spec.ts
packages/ui/stories/tabs.stories.tsx
packages/ui/test/tabs-contract.test.tsx
```

Four exported names scanned. CROSS: barrel, catalog, source/story maps, global
story/registry counts and site/explorer counts are owned and authored by the
orchestrator; wiring was requested and supplied into this worktree. Registry
bytes were mechanically refreshed with permission after the last source change.
No sibling behavioral consumer and no unowned contract found. These are all new
consumers of a new family; no existing role or class contract was displaced.

The independent reviewer additionally found these indirect consumers, which were
read and covered by focused checks/the library suite:
`packages/ui/test/entry-point.test.ts`, `client-boundary.test.ts`,
`tailwind-compile.test.tsx`, `focus-outline.test.tsx`,
`forced-colors-state.test.tsx`, `storybook-preview.test.ts`;
`packages/tokens/test/source-coverage.test.ts`, `brand-guard.test.ts`,
`literal-guard.test.ts`, and `project-coverage.test.ts`. The source focus inventory
was another orchestrator-owned registration; its exact Tabs site was supplied.
The new `tabs-focus.test.tsx` also consumes the Default/Composition stories and
compiled-sheet helper. No additional public binding or sibling consumer emerged.

## Layer 1 (reviewer, detached worktree of cb43f74737358f8f280c69c43cec6ab07af8c91c, slot 6)

Verbatim original mutation table (unaffected-name enumeration refers to the full
review report retained in the review scratch directory):

```text
| file | test | mutation applied | red / GREEN | what it asserts now |
| --- | --- | --- | --- | --- |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs: has stories` | M1: Root forced value="overview" + no-op onValueChange after prop spread | GREEN | The module contains stories; expected GREEN for state collapse. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs/Default` | M1: Root forced value="overview" + no-op onValueChange after prop spread | red | Cannot find accessible Activity tabpanel after required activation; the behavioral assertion reddens. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs/Line` | M1: Root forced value="overview" + no-op onValueChange after prop spread | red | Cannot find accessible Activity tabpanel after required activation; the behavioral assertion reddens. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs/Manual` | M1: Root forced value="overview" + no-op onValueChange after prop spread | red | Cannot find accessible Activity tabpanel after required activation; the behavioral assertion reddens. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs/Vertical` | M1: Root forced value="overview" + no-op onValueChange after prop spread | red | Cannot find accessible Activity tabpanel after required activation; the behavioral assertion reddens. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs/Controlled` | M1: Root forced value="overview" + no-op onValueChange after prop spread | red | Expected status Selected: activity; received Selected: overview. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `tabs/Composition` | M1: Root forced value="overview" + no-op onValueChange after prop spread | GREEN | The composed click handler runs and Overview remains selected. Activity is never asserted after its click; stuck selection survives. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `covers all twenty-two part families, with every story counted` | M1: Root forced value="overview" + no-op onValueChange after prop spread | GREEN | Registration/story totals, not selection; expected GREEN. |
| packages/ui/stories/tabs.stories.tsx / packages/ui/test/stories.test.tsx | `runs all 91 play functions, and knows if one stopped running` | M1: Root forced value="overview" + no-op onValueChange after prop spread | red | Five failed plays never reach ran.push; completed-play total detects failures. |
| packages/ui/test/tabs-contract.test.tsx | `forwards primitive props, composed hosts and refs without taking controlled state` | M2: Root onValueChange replaced by no-op after prop spread | red | Expected callback once with two; number of calls: 0. |
| packages/ui/test/stories.test.tsx / helpers/story-suites.ts | `covers all twenty-two part families, with every story counted` | M3: remove only tabs from STORY_SUITES | red | Family list mismatch; composed plays expected 91, got 85. Remaining 136 unrelated names are enumerated below. |
| packages/ui/test/stories.test.tsx / helpers/story-suites.ts | `runs all 91 play functions, and knows if one stopped running` | M3: remove only tabs from STORY_SUITES | red | Family list mismatch; composed plays expected 91, got 85. Remaining 136 unrelated names are enumerated below. |
| packages/ui/test/registry.test.ts | `declares the twenty-two part families plus the one shared lib` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `types every item by where its files live: a part is registry:ui, the shared lib registry:lib` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `points every file at a path that exists` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `registers every component source exactly once` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `targets the consumer's own component directory, not the library's layout` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `declares npm dependencies at the versions the package itself builds against` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `resolves every registry dependency inside this registry` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `declares exactly the registry dependencies its sources import` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `reads a source's registry dependencies as the items that ship the files it imports` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `reads a source's imports at every specifier position and nowhere else` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `declares exactly the npm dependencies its own sources import, per item` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `keeps no stylesheet's first token a comment` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `has one file per item and nothing else` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `ships an INDEX that is the root registry, byte for byte` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `advertises every item in that index, with its files` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `carries the CURRENT bytes of every source it ships` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | red | Detects missing Tabs membership, 24-to-23 file/dependency total, or root/built registry drift. |
| packages/ui/test/registry.test.ts | `carries the title, description and both dependency lists into the item file` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `is inside the package's published files, so it installs with no network` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| packages/ui/test/registry.test.ts | `declares as RUNTIME dependencies everything the shipped sources import` | M4: remove Tabs item from root registry.json only; leave committed r/ intact | GREEN | Checks metadata/content of the remaining items, own reader fixtures, or package publishing/runtime contract. Expected unaffected GREEN; global exact-membership anchors redden. |
| apps/docs/test/explorer.test.tsx | `selects a family, renders its real preview and exposes its composition` | M5: catalog Tabs Preview changed to () => null | GREEN | Expected scope: this checks Switch selection/preview or family count/Button reset. Tabs remains discoverable; browser expectedParts and Tabs interactions owe the real-preview verdict. |
| apps/docs/test/explorer.test.tsx | `keeps every family discoverable and resets preview state when switching` | M5: catalog Tabs Preview changed to () => null | GREEN | Expected scope: this checks Switch selection/preview or family count/Button reset. Tabs remains discoverable; browser expectedParts and Tabs interactions owe the real-preview verdict. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `walks exactly the published set, by path` | M6: remove Tabs source path from PUBLISHED_SOURCE_FILES | red | The walker reports Unexpected Tabs path: omission cannot silently narrow guard coverage. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `walks exactly the declared stories, by path` | M6: remove Tabs source path from PUBLISHED_SOURCE_FILES | GREEN | The other path walk/root/comment stripping stays unaffected; expected GREEN. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `reads real content for every one of them` | M6: remove Tabs source path from PUBLISHED_SOURCE_FILES | red | The walker reports Unexpected Tabs path: omission cannot silently narrow guard coverage. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `resolves a repo root that actually contains the packages` | M6: remove Tabs source path from PUBLISHED_SOURCE_FILES | red | The walker reports Unexpected Tabs path: omission cannot silently narrow guard coverage. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `stripComments removes comments and keeps code` | M6: remove Tabs source path from PUBLISHED_SOURCE_FILES | GREEN | The other path walk/root/comment stripping stays unaffected; expected GREEN. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `walks exactly the published set, by path` | M7: remove Tabs story path from STORY_FILES | GREEN | The other path walk/root/comment stripping stays unaffected; expected GREEN. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `walks exactly the declared stories, by path` | M7: remove Tabs story path from STORY_FILES | red | The walker reports Unexpected Tabs path: omission cannot silently narrow guard coverage. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `reads real content for every one of them` | M7: remove Tabs story path from STORY_FILES | red | The walker reports Unexpected Tabs path: omission cannot silently narrow guard coverage. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `resolves a repo root that actually contains the packages` | M7: remove Tabs story path from STORY_FILES | GREEN | The other path walk/root/comment stripping stays unaffected; expected GREEN. |
| packages/tokens/test/helpers/source-files.ts (runner: source-coverage.test.ts) | `stripComments removes comments and keeps code` | M7: remove Tabs story path from STORY_FILES | GREEN | The other path walk/root/comment stripping stays unaffected; expected GREEN. |
| apps/docs/browser/tabs.spec.ts | `live Tabs selects by keyboard, contains 44px controls and copies highlighted source` | OWED B1: force Root value overview + no-op onValueChange, rebuild author artifact | OWED: predicted red | After ArrowRight, Activity aria-selected must be true; receives false. On a preview-null mutation, Project sections tablist is absent instead. |
| apps/docs/browser/tabs.spec.ts | `live Tabs selects by keyboard, contains 44px controls and copies highlighted source` | OWED B2: replace Trigger min-h-hit with min-h-0 and py-2 with py-0; rebuild | OWED: predicted red | tab target height must be >=44; rendered text-sized control should be <44. Confirm actual height before accepting red. |
| apps/docs/browser/tabs.spec.ts | `Tabs paints readable state and focus from dark, light and accent roles` | OWED B3: delete only Trigger focus-visible:outline-2; rebuild | OWED: now predicted GREEN | Docs styles.css supplies a global unlayered focus outline. Corrected source guard M10 is also GREEN through TabsContent lending its outline; the consumer browser cannot prove each library host. |
| apps/docs/browser/site.spec.ts | `renders every family and sends each workbench link to a real story` | OWED B4: catalog Tabs Preview=()=>null; rebuild | OWED: predicted red | Tabs must render its actual parts: canvas [data-slot=tabs-list] visible should fail. Explorer unit M5 is intentionally GREEN. |
| apps/docs/browser/tabs.spec.ts | `Tabs paints readable state and focus from dark, light and accent roles` | OWED B5: delete only line-active border-primary-ink class; rebuild | OWED: predicted GREEN at this SHA | Current assertions cover ink/focus contrast, accent-driven text colour and outline. They do not observe the selected line marker; screenshot is captured without comparison. Strengthen actual right/bottom edge geometry/paint before repeating. |
| packages/ui/test/forced-colors-state.test.tsx | `gives every state drawn only in colour a forced-colors treatment, or a sibling that carries it` | No mutation: existing invariant run on committed SHA | red | Both default active and line active state clauses have no kept structural state treatment. Actual forced-colors selected/unfocused paint remains browser OWED. |
| packages/ui/test/focus-outline.test.tsx | `finds every part that draws a focus ring, and knows which ones are short` | No mutation: existing invariant run on committed SHA | red | Derived inventory includes tabs.tsx (focus-visible), exact expected list omits it; shared registration update required. |
```

### Closure at the corrected commits

All actionable findings are closed. Composition now asserts Activity immediately
and Overview inactive. Its frozen-root mutation was rerun after commit at
`1e461f1364e307e71f068af86106b615d6b86b4f`: `1 failed / 144 skipped`, failing
at the missing Activity panel. Selected forced-color state now declares kept
outlines for both exact state branches; the source guard and actual unfocused
browser paint pass. The orchestrator supplied the focus inventory registration.
The vertical attribute concern was disproved by the reviewer's actual DOM probe;
no source orientation change was made.

The generic focus inventory aggregates tokens by file. Deleting the trigger's
outline width let Content lend it a width and kept 21 tests GREEN; docs also have
a global focus override. This is now covered by the new per-host family test,
committed at `c99fe56093a8d846dba9b0926500270141b7f63e`. Both author and
independent reviewer ran the landed one-trigger deletion: Default and Composition
failed `owns its focus outline width: expected null to be 2` (2 failed), then
restored from Git and passed 2/2. The browser proves consumer focus paint, while
this test proves each reusable host's compiled declarations.

The reviewer independently read every author browser log. Every source mutation
was confirmed landed, rebuilt, run at 390px and restored from the committed head.
B4 additionally rebuilt the assembled site with its real Storybook index.

| mutation                                 | actual browser verdict | intended property observed                                                                               |
| ---------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| B1 Root fixed to overview + no-op change | red, 1 failed          | Activity expected selected true, received false                                                          |
| B2 trigger floor removed, padding zeroed | red, 1 failed          | Target height 22.296875px, expected at least 44px                                                        |
| B3 trigger focus width removed           | GREEN, 1 passed        | Docs global focus CSS still paints the consumer; per-host source test above supplies the missing verdict |
| B4 Tabs catalog preview returns null     | red, 1 failed          | Named `Tabs must render its actual parts` assertion finds no tab list                                    |
| B5 selected line border paint removed    | red, 1 failed          | Named marker assertion receives transparent instead of the active ink                                    |
| B6 both forced active outlines removed   | red, 1 failed          | Selected/unfocused outline expected solid, received none                                                 |

Other GREEN rows are scoped registration/metadata/other-family checks; their
subject was not the collapsed Tabs behavior. Explorer's unit contract covers
selection/reset, and B4 proves the shared site guard observes the actual family.
No duplicate explorer case was added. The Composition GREEN was fixed, and the
source-focus GREEN was closed by the new independently mutated host test.

Focused final browser restoration passed 6/6 at 390/768/1280 in 11.6s. Root library
suite passed 38 files / 716 tests before the two per-host tests were added; the
stream gate below is the final whole-tree result. An early browser check exposed
a consumed theme-dialog focus-restoration race; the test now waits for the closed
dialog and restored theme-trigger focus before directing focus into Tabs. Inactive
outline absence is measured by `outline-style: none`, and focused offset is
compared with the unfocused state because docs owns its focus override.

Review report: `/home/ankit/.marquee-scratch/BATCH-PARITY-1/r6/report.md`.
Author mutation logs: stream scratch `composition-collapse.log`,
`focus-host-collapse.log`, `B1-browser.log` through `B6-browser.log`, with each
`.landed` proof and build log. Detached reviewer worktree was restored and removed.

## Gate

Pending.
