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

Pending.

## Consumers

Pending pre/post scans.

## Layer 1

Pending independent review and mutation evidence.

## Gate

Pending.
