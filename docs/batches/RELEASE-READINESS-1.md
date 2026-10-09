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

Status: preparation complete locally; publication held. Final pushed-head CI is
recorded in the PR checks and durable handoff after push.

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

## Fresh release-artifact consumer

At committed source `a8c4b103229eaec9b939ce08e9181291fa3b128d`,
`pnpm --dir packages/ui pack --pack-destination <scratch>/artifacts` produced
`marquee-ui-ui-0.2.0.tgz`. The prepack registry rebuild left committed output
unchanged. A new external consumer used a fresh npm cache, that tarball and the
published tokens 0.1.0 package. Both installed package directories were real
files inside the consumer, with no workspace links; npm lock integrity matched
the exact UI archive and public token metadata.

The shadcn CLI installed all 35 families through a local server reading only
the installed package's registry. All 37 copied files, including `utils` and
Ribbon's stylesheet, matched the packed registry and reviewed source byte for
byte. Strict TypeScript and Vite passed across the copied source. The retained
Batch 7 browser journeys were rerun fresh: **99 passed**, zero skipped, flaky or
unexpected cases, at 390/768/1280. These exercise 21 selected families, not all 35. Browser duration was 115.2 seconds on 2026-10-09; no public UI install is claimed.

The exact commands, archive SHA-256/SHA-512, 37 file hashes, npm provenance and
runner summary are in [consumer provenance](RELEASE-READINESS-1-evidence/consumer-provenance.json).
Reproduction sources, npm lock, logs, screenshots and the runner script remain
in `<scratch>/consumer`, `<scratch>/candidate-proof.mjs` and
`<scratch>/candidate-proof.log`. The script copies no old dependencies, lockfile
or installed components; it reuses only the explicit app/test source fixtures.

## Final gate, preview and handoff

At `5e2f24b7c25832111aea237f37c86094e5e591e4`, `DOCS_PORT=4182 pnpm verify`
exited **0** on 2026-10-09, 04:49:33–04:57:19 IST (466.2 seconds): **996 library
tests in 60 files, 39 docs tests in four files, five consumer-harness tests, and
312 Chromium browser cases** at 390/768/1280. The registry remained unchanged.
[Gate record](RELEASE-READINESS-1-evidence/gate.json).

The immutable successful output now serves localhost:4174 from
`<scratch>/preview`. All **121 served files** equal the gated build byte for byte.
Fresh stable-preview guide/availability checks and DataTable/Chart keyboard,
data, focus and bounds checks passed at all three widths with zero page errors.
The release copy explicitly says 0.2.0 is unpublished; the evidence table
distinguishes all-family installation from the 21-family behavioral selection.
Twelve relevant consumer/guide captures were actually inspected; the exact list
is in [image inspection](RELEASE-READINESS-1-evidence/image-inspection.json).

The initial staging byte request raced startup and received ECONNREFUSED; after
HTTP readiness, staging and stable byte checks passed. The owned staging server
was stopped. The serving snapshot and every historical worktree were preserved.
No public operation occurred. Later completion records do not change the gated
site or packed UI inputs. The PR's final exact-head CI remains the publication
gate; its final result and logs are retained in `<scratch>/final-handoff.md`.

The mutation controls were run by this batch's implementing agent. This record
does not claim a new independent review or exhaustive API, browser, SVG or
assertion-quality coverage. Existing wider-stack and composition limits remain
in the supported-stack and component-contract guides.
