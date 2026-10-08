# RELEASE-READINESS-1 — prepare the 35-family release

Authorized on 2026-10-09 after the finite parity program completed. Close the
recorded story-play invocation and SVG focus validation gaps, prepare package
versions/release notes/install guidance, and prove a clean external installation
of the proposed artifacts. Public publication remains held.

## Scope

- Require each composed story play to execute assertions; prove that deleting
  the global invocation and replacing a play with a no-op fail for that reason.
- Cover the Chart SVG descendant's compiled focus selector and outline, retaining
  the isolated real-browser dark/light/forced-colors paint checks. Prove the
  descendant-only regression fails without relying on the container's outline.
- Compare current and published package contents, select unpublished versions,
  document release notes and exact install/publish commands, and pack artifacts.
- Verify the proposed packages in a new external consumer, including registry
  source fidelity, strict TypeScript/build and meaningful browser interactions.
- Align the Pages verification timeout with the measured 20-minute CI budget.
- Run the full gate, preserve a verified local preview, update draft PR #2 and
  await CI on the final pushed head. Record the actual outcomes and remaining
  validation limits without claiming exhaustive API or framework coverage.

## Boundaries

No new component families or API expansion. The original eight-batch parity
program remains complete. No main merge, npm publication, Pages activation,
public deployment or domain operation is authorized by this preparation batch.
Version changes and local tarballs are proposed release artifacts only.

## Baseline and evidence

Baseline: `eca69fcc7e5e9db5eb7c698fe57fc33f698fc7b9`, clean `next`.
Its local gate and both exact-head CI runs are recorded in Batch 8; no input has
changed since that verified baseline. The immutable Batch 8 preview remains on
4174 while this work proceeds. Scratch:
`/home/ankit/.marquee-scratch/RELEASE-READINESS-1/`.

Status: active. Consumer proof and final verification remain.

## Completed controls and version decision

On 2026-10-09, `pnpm exec vitest run --project ui packages/ui/test/stories.test.tsx`
with the global invocation omitted passed all 252 tests before repair. Vitest's
`hasAssertions()` also remained green under that mutation in this setup, so it
was replaced with an explicit before/after read of Storybook's own assertion
count. With the final guard, removing the call fails 185 individual plays with
`play executed no assertions` plus the completion inventory; replacing only
Button.Primary's play with a no-op fails that play and the completion inventory.
The unmutated suite passes 252 tests. This observes assertion calls during each
play, not the quality of every matcher or all possible asynchronous compositions.

`pnpm exec vitest run --project ui packages/ui/test/focus-outline.test.tsx`
passes 22 tests. Removing all four Chart SVG descendant classes while preserving
host focus declarations leaves the old suite at 21 passing tests; the new suite
fails `compiled Chart classes reach the focused SVG`. Removing only the SVG
outline width instead fails `SVG outline width: expected null to be 2`. Both
files were restored from the committed source after these controls. The existing
isolated dark/light/forced-colors browser journey remains the actual paint proof.

Proposed UI version: **0.2.0**, an unpublished pre-1.0 minor release for the 14
new families. npm metadata currently lists 0.1.10 as latest. Reuse published
tokens **0.1.0**: a tarball comparison found all 32 existing files byte-identical,
with only an additional internal docs-theme source in the local package. No new
token runtime is needed. [Release notes and commands](../releases/0.2.0.md) make
the proposed artifact and current public release distinct.
