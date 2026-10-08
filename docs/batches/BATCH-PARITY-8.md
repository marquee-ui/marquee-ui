# BATCH-PARITY-8 — Common-name API audit and documentation

Date: 2026-10-09. Base: `6cd97f2196a7cee15e01fea373c353043b6d72b0`.
Status: active. This is the final batch in the finite approved program.

## Scope

Audit all 35 current families against their source and contemporary official
primary documentation. Publish usable compatibility guidance that distinguishes
matching names, actual contracts, tested behavior and deferred implementation.
The existing 21 families and the 14 new families are separate bounded audit
streams. Installation guidance distinguishes published baseline packages,
moving candidate registry source and reused packed evidence.

No new family, product feature, backend migration, general test-guard project or
version bump is included. Remaining catalog/API gaps are explicitly deferred.
Completion of this queue does not establish full shadcn parity.

## Ownership and execution

- Common API stream: `s/parity8-common-api`,
  `/home/ankit/Code/marquee-parity8-common-api`; owns
  `docs/common-name-api.md` and `docs/slices/COMMON-API-AUDIT-1.md`.
- Recipe/install stream: `s/parity8-install-recipes`,
  `/home/ankit/Code/marquee-parity8-install-recipes`; owns
  `docs/recipe-contracts.md`, `docs/getting-started.md`,
  `docs/supported-stack.md` and `docs/slices/RECIPE-INSTALL-AUDIT-1.md`.
- Coordinator: `next`; owns shared site guide/navigation, README, matrix,
  status/batch records, reconciliation, merged gate, preview and draft PR.

Each stream obtains one fresh independent review of committed source in its own
detached tree. Prose validation is proportional; product baseline gate evidence
is the successful Batch 7 source `15c266e`. One fresh independent merged review
and full merged `pnpm verify` remain required. No source/registry/dependency
change is planned; packed proof may be reused only after verifying those inputs
unchanged, with original provenance retained and labeled as reused.

Scratch: `/home/ankit/.marquee-scratch/BATCH-PARITY-8/`.
Runtime: Node 22.18.0 / pnpm 10.24.0. Merged gate port 4182; staging 4188.
Draft [PR #2](https://github.com/marquee-ui/marquee-ui/pull/2) accumulates changes.
The public-release hold remains: no merge, Pages activation, public deployment,
npm publication or domain operation. No Pile operations apply.

## Completion evidence

Pending independent reviews, merged runner verdict, rendered guide inspection,
input equivalence, preview refresh and exact-head CI.
