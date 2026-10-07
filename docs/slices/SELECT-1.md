# SELECT-1 — composed Select

Batch: BATCH-PARITY-1. Status: active. Publication remains held in STATUS.md.

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
unstyled to preserve Radix positioning. Only semantic token roles paint the parts.
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
source-files.ts, explorer.test.tsx and site.spec.ts. Shared wiring changes are
orchestrator-authored. No route contract changed; new roles combobox/listbox/option
come from Radix and are consumed only by the new family tests and demo. Class
strings have no pre-existing family-specific consumer; registry content is rebuilt
from the new source. No sibling stream file or behavior was edited.

## Layer 1

Pending independent review and mutation evidence.

## Gate

Pending.
