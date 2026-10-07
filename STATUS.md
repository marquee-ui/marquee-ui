# Marquee release status

CURSOR: RELEASE-1 — ready for localhost review; public release held

The user authorized a bounded release-readiness batch and then asked to see localhost
before publication. The code and local verification are complete. Do not activate Pages,
merge the release PR, deploy publicly, or purchase a domain until the user directs onward.

- [x] [CONSUMER-1](docs/slices/CONSUMER-1.md): clean published-package consumer, canonical
      installation guide, supported stack, independent review and full gate.
- [x] [DOCS-1](docs/slices/DOCS-1.md): live documentation, all 21 component families, exact
      copyable examples, nested Storybook, independent review and full gate.
- [x] Merged verification: 643 library tests, 6 docs unit tests, 5 consumer-script tests,
      and 12 responsive browser journeys; fresh published consumer adds 2 browser cases.
- [ ] User direction after reviewing localhost, then approved public release operations.

Local production preview: **http://localhost:4174/marquee-ui/**. It was built from
`3d8d7b2b1423f93e6834af224b850010f7907001`; later integration commits record evidence only.
The server runs from this checkout's `apps/docs/dist`. Development preview 4176 remains
available in the DOCS-1 worktree. [Screenshots and batch record](docs/batches/RELEASE-1.md).

Next: the user reviews localhost and decides whether to publish to the free default Pages
URL. `marquee-ui.dev` is not owned; no custom domain is configured or required for that URL.

## Cold resume

Inspect Git status/worktrees, this file and the two slice records. The durable run evidence
is `/home/ankit/.marquee-scratch/RELEASE-1/`; `integration/final-verify.exit` is 0 and the
captured source SHA is `integration/final-source-sha`. The prepared Pages workflow runs only
on main, so keep this release unmerged until the hold is lifted. No product backlog advanced.

## Session log

| Date       | Batch     | Result                                                                     |
| ---------- | --------- | -------------------------------------------------------------------------- |
| 2026-10-08 | RELEASE-1 | Local release candidate verified; public publication held for user review. |
