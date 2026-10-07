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
outline for forced colors. No token contract or existing family changed.

Six stories with six plays cover automatic/uncontrolled selection, default and
line styles, manual Enter/Space activation, horizontal/vertical navigation,
disabled skipping, Home/End, looping/non-looping lists, tab-to-panel focus,
controlled parent updates and reset, RTL, ARIA association and all four composed
hosts. The family contract test additionally proves ref targets, caller props,
`forceMount` and controlled state retained until the caller updates it.

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

## Layer 1

Pending independent review and mutation evidence.

## Gate

Pending.
